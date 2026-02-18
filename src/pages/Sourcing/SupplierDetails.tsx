import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, Grid, Chip, Button, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tab, Tabs, Alert,
} from "@mui/material";
import { toast } from "react-hot-toast";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import VerifiedIcon from "@mui/icons-material/Verified";
import useTitle from "../../hooks/useTitle";
import { SourcingService } from "./Sourcing.service";
import { ISupplierProfile } from "./Sourcing.interface";
import { formatCurrency, formatWeight, ORDER_STATUS_COLORS } from "./SourcingConstants";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import { Span } from "../../components/Typography";
import LoadingScreen from "../../components/LoadingScreen";
import { useModalContext } from "../../contexts/ModalDialogContext";

interface TabPanelProps { children?: React.ReactNode; index: number; value: number; }
function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SupplierDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setShowModal } = useModalContext();

  const [supplier, setSupplier] = useState<ISupplierProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  useTitle(supplier ? supplier.business_name : "Supplier Details");

  useEffect(() => {
    if (id) {
      fetchSupplierDetails();
      fetchSupplierOrders();
      fetchSupplierInvoices();
    }
  }, [id]);

  const fetchSupplierDetails = async () => {
    try {
      setLoading(true);
      const data = await SourcingService.getSupplierDetails(id!);
      setSupplier(data);
    } catch {
      toast.error("Failed to load supplier details");
      navigate("/admin/sourcing/suppliers");
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplierOrders = async () => {
    try {
      const response = await SourcingService.getSourceOrders({ supplier: id, page_size: 10 });
      setOrders(response.results);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchSupplierInvoices = async () => {
    try {
      const response = await SourcingService.getSupplierInvoices({ supplier: id, page_size: 10 });
      setInvoices(response.results);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  const handleVerify = async () => {
    if (!window.confirm("Verify this supplier?")) return;
    try {
      await SourcingService.verifySupplier(id!);
      toast.success("Supplier verified successfully");
      fetchSupplierDetails();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to verify supplier");
    }
  };

  const handleEdit = () => setShowModal(true);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setTabValue(newValue);

  if (loading) return <LoadingScreen />;
  if (!supplier) return null;

  // ── Resolve nested objects safely ────────────────────────────────────────
  // SupplierProfileSerializer returns user as write-only; nested data is in user_detail
  const user = (supplier as any).user_detail ?? supplier.user;
  // hub is returned as a UUID string from the serializer; hub object may be on hub_detail
  const hub = typeof supplier.hub === "object" ? supplier.hub : null;
  // verified_by is returned as UUID; may be on verified_by_detail if serializer adds it
  const verifiedBy = typeof supplier.verified_by === "object" ? supplier.verified_by : null;

  return (
    <Box pt={2} pb={4}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/admin/sourcing/suppliers")} sx={{ mr: 2 }}>
          Back
        </Button>
        <Typography variant="h4">{supplier.business_name}</Typography>
        {supplier.is_verified && (
          <Chip icon={<VerifiedIcon />} label="Verified" color="success" sx={{ ml: 2 }} />
        )}
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: "flex", gap: 1 }}>
        <Button variant="contained" startIcon={<EditIcon />} onClick={handleEdit}>
          Edit Supplier
        </Button>
        {!supplier.is_verified && (
          <Button variant="outlined" color="success" startIcon={<VerifiedIcon />} onClick={handleVerify}>
            Verify Supplier
          </Button>
        )}
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography color="text.secondary" gutterBottom variant="overline">Total Orders</Typography>
            <Typography variant="h4">{supplier.total_orders}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography color="text.secondary" gutterBottom variant="overline">Total Supplied</Typography>
            <Typography variant="h4">{formatWeight(supplier.total_supplied_kg)}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography color="text.secondary" gutterBottom variant="overline">Grain Types</Typography>
            <Typography variant="h4">{supplier.typical_grain_types.length}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography color="text.secondary" gutterBottom variant="overline">Member Since</Typography>
            <Typography variant="h6">{formatDateToDDMMYYYY(supplier.created_at)}</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Supplier Information" />
          <Tab label="Orders" />
          <Tab label="Invoices" />
          <Tab label="Payment Preferences" />
        </Tabs>
      </Box>

      {/* ── Tab 0: Supplier Information ──────────────────────────────────── */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card><CardContent>
              <Typography variant="h6" gutterBottom>Business Information</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={styles.infoRow}>
                <Span sx={styles.label}>Business Name:</Span>
                <Span sx={styles.value}>{supplier.business_name}</Span>
              </Box>
              <Box sx={styles.infoRow}>
                <Span sx={styles.label}>Farm Location:</Span>
                <Span sx={styles.value}>{supplier.farm_location || "Not provided"}</Span>
              </Box>
              <Box sx={styles.infoRow}>
                <Span sx={styles.label}>Primary Hub:</Span>
                <Span sx={styles.value}>{hub?.name ?? "Not set"}</Span>
              </Box>
              <Box sx={styles.infoRow}>
                <Span sx={styles.label}>Grain Types:</Span>
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  {supplier.typical_grain_types.map((grain) => (
                    <Chip key={grain.id} label={grain.name} size="small" />
                  ))}
                </Box>
              </Box>
            </CardContent></Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card><CardContent>
              <Typography variant="h6" gutterBottom>Contact Information</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={styles.infoRow}>
                <Span sx={styles.label}>Contact Person:</Span>
                <Span sx={styles.value}>
                  {user ? `${user.first_name} ${user.last_name}` : "—"}
                </Span>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={styles.infoRow}>
                <Span sx={styles.label}>Verified:</Span>
                <Chip
                  label={supplier.is_verified ? "Yes" : "No"}
                  color={supplier.is_verified ? "success" : "warning"}
                  size="small"
                />
              </Box>
              {supplier.is_verified && verifiedBy && (
                <>
                  <Box sx={styles.infoRow}>
                    <Span sx={styles.label}>Verified By:</Span>
                    <Span sx={styles.value}>{verifiedBy.first_name} {verifiedBy.last_name}</Span>
                  </Box>
                  <Box sx={styles.infoRow}>
                    <Span sx={styles.label}>Verified At:</Span>
                    <Span sx={styles.value}>{formatDateToDDMMYYYY(supplier.verified_at!)}</Span>
                  </Box>
                </>
              )}
            </CardContent></Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ── Tab 1: Orders ────────────────────────────────────────────────── */}
      <TabPanel value={tabValue} index={1}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order Number</TableCell>
                <TableCell>Grain Type</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Total Cost</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">No orders found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} hover sx={{ cursor: "pointer" }}
                    onClick={() => navigate(`/admin/sourcing/orders/${order.id}`)}>
                    <TableCell>{order.order_number}</TableCell>
                    <TableCell>{order.grain_type_name}</TableCell>
                    <TableCell align="right">{formatWeight(order.quantity_kg)}</TableCell>
                    <TableCell align="right">{formatCurrency(order.total_cost)}</TableCell>
                    <TableCell>
                      <Chip label={order.status_display} size="small" color={ORDER_STATUS_COLORS[order.status]} />
                    </TableCell>
                    <TableCell>{formatDateToDDMMYYYY(order.created_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* ── Tab 2: Invoices ──────────────────────────────────────────────── */}
      <TabPanel value={tabValue} index={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice Number</TableCell>
                <TableCell>Order Number</TableCell>
                <TableCell align="right">Amount Due</TableCell>
                <TableCell align="right">Balance</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">No invoices found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice: any) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.source_order?.order_number ?? "—"}</TableCell>
                    <TableCell align="right">{formatCurrency(invoice.amount_due)}</TableCell>
                    <TableCell align="right">{formatCurrency(invoice.balance_due)}</TableCell>
                    <TableCell>
                      <Chip label={invoice.status_display} size="small" />
                    </TableCell>
                    <TableCell>{formatDateToDDMMYYYY(invoice.issued_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* ── Tab 3: Payment Preferences ───────────────────────────────────── */}
      <TabPanel value={tabValue} index={3}>
        {supplier.payment_preferences.length === 0 ? (
          <Alert severity="info">No payment preferences configured</Alert>
        ) : (
          <Grid container spacing={2}>
            {supplier.payment_preferences.map((pref) => (
              <Grid item xs={12} md={6} key={pref.id}>
                <Card variant="outlined"><CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Typography variant="h6">{pref.method_display}</Typography>
                    {pref.is_default && <Chip label="Default" color="primary" size="small" />}
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  {pref.method === "mobile_money" && (
                    <Typography>Phone: {pref.details?.phone ?? "—"}</Typography>
                  )}
                  {pref.method === "bank_transfer" && (
                    <>
                      <Typography>Bank: {pref.details?.bank_name ?? "—"}</Typography>
                      <Typography>Account: {pref.details?.account_number ?? "—"}</Typography>
                      <Typography>Name: {pref.details?.account_name ?? "—"}</Typography>
                    </>
                  )}
                </CardContent></Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>
    </Box>
  );
};

const styles = {
  infoRow: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 },
  label: { fontWeight: 600, color: "text.secondary" },
  value: { color: "text.primary" },
};

export default SupplierDetails;