// sourcing/pages/SupplierProfile.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Skeleton,
  Alert,
} from "@mui/material";
import { Edit, VerifiedUser } from "@mui/icons-material";
import { toast } from "react-hot-toast";
import { SourcingService } from "./Sourcing.service";
import {
  formatCurrency,
  formatKg,
  formatDate,
  formatStatus,
  getStatusColor,
} from "../../utils/formatters";

const SupplierProfile: React.FC = () => {
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loadingTab, setLoadingTab] = useState(false);

  useEffect(() => {
    fetchSupplier();
  }, []);

  useEffect(() => {
    if (supplier?.id) loadTabData();
  }, [supplier?.id, activeTab]);

  const fetchSupplier = async () => {
    try {
      // Uses the authenticated user's own supplier profile — no id needed
      const data = await SourcingService.getMySupplierProfile();
      setSupplier(data);
    } catch (err: any) {
      toast.error("Failed to load supplier profile");
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async () => {
    if (!supplier?.id) return;
    setLoadingTab(true);
    try {
      if (activeTab === 1) {
        const data = await SourcingService.getSourceOrders({ supplier: supplier.id });
        setOrders(Array.isArray(data) ? data : data.results || []);
      } else if (activeTab === 2) {
        const data = await SourcingService.getSupplierInvoices({ supplier: supplier.id });
        setInvoices(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err: any) {
      console.error("Tab data error:", err);
    } finally {
      setLoadingTab(false);
    }
  };

  if (loading) {
    return (
      <Box p={3}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {[...Array(4)].map((_, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={100} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (!supplier) {
    return (
      <Box p={3}>
        <Alert severity="warning">
          No supplier profile found for your account. Please contact an administrator.
        </Alert>
      </Box>
    );
  }

  const statCards = [
    { label: "TOTAL ORDERS",   value: supplier.total_orders ?? "—" },
    { label: "TOTAL SUPPLIED", value: formatKg(supplier.total_supplied_kg ?? supplier.total_supplied) },
    { label: "GRAIN TYPES",    value: supplier.typical_grain_types?.length ?? supplier.grain_types_count ?? 0 },
    { label: "MEMBER SINCE",   value: formatDate(supplier.created_at) },
  ];

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={1}>
        <Typography variant="h4" fontWeight={700} mr={2}>
          {supplier.business_name}
        </Typography>
        {supplier.is_verified && (
          <Chip icon={<VerifiedUser />} label="Verified" color="success" size="small" />
        )}
      </Box>

      {/* Stat cards */}
      <Grid container spacing={2} mb={3}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                  {card.label}
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
        <Tab label="Supplier Information" />
        <Tab label="Orders" />
        <Tab label="Invoices" />
        <Tab label="Payment Preferences" />
      </Tabs>

      {/* Tab 0: Supplier Information */}
      {activeTab === 0 && (
        <Card elevation={0} sx={{ border: "1px solid #e0e0e0", p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Business Name</Typography>
              <Typography variant="body1" fontWeight={600}>{supplier.business_name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Farm Location</Typography>
              <Typography variant="body1">{supplier.farm_location || "—"}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Hub</Typography>
              <Typography variant="body1">
                {typeof supplier.hub === "object"
                  ? supplier.hub?.name
                  : supplier.hub_detail?.name || "—"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Contact</Typography>
              <Typography variant="body1">
                {supplier.user_detail
                  ? `${supplier.user_detail.first_name} ${supplier.user_detail.last_name}`
                  : supplier.user
                  ? `${(supplier.user as any).first_name} ${(supplier.user as any).last_name}`
                  : "—"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Verification Status</Typography>
              <Chip
                label={supplier.is_verified ? "Verified" : "Not Verified"}
                color={supplier.is_verified ? "success" : "warning"}
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Grid>
            {supplier.typical_grain_types?.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" mb={0.5}>Grain Types</Typography>
                <Box display="flex" gap={0.5} flexWrap="wrap">
                  {supplier.typical_grain_types.map((g: any) => (
                    <Chip key={g.id} label={g.name} size="small" />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </Card>
      )}

      {/* Tab 1: Orders */}
      {activeTab === 1 && (
        <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Order Number</TableCell>
                  <TableCell>Grain Type</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Price/kg</TableCell>
                  <TableCell>Total Cost</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingTab ? (
                  <TableRow><TableCell colSpan={7} align="center">Loading...</TableCell></TableRow>
                ) : orders.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center">No orders found</TableCell></TableRow>
                ) : (
                  orders.map((order: any) => (
                    <TableRow key={order.id} hover>
                      <TableCell>{order.order_number}</TableCell>
                      <TableCell>{order.grain_type_name || order.grain_type_detail?.name || "—"}</TableCell>
                      <TableCell>{formatKg(order.quantity_kg)}</TableCell>
                      <TableCell>{formatCurrency(order.offered_price_per_kg)}</TableCell>
                      <TableCell>{formatCurrency(order.total_cost)}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.status_display || formatStatus(order.status)}
                          size="small"
                          sx={{ bgcolor: getStatusColor(order.status), color: "#fff" }}
                        />
                      </TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Tab 2: Invoices */}
      {activeTab === 2 && (
        <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Invoice Number</TableCell>
                  <TableCell>Order Number</TableCell>
                  <TableCell>Amount Due</TableCell>
                  <TableCell>Balance</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingTab ? (
                  <TableRow><TableCell colSpan={6} align="center">Loading...</TableCell></TableRow>
                ) : invoices.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center">No invoices found</TableCell></TableRow>
                ) : (
                  invoices.map((inv: any) => (
                    <TableRow key={inv.id} hover>
                      <TableCell>{inv.invoice_number}</TableCell>
                      <TableCell>{inv.source_order?.order_number || inv.order_number || "—"}</TableCell>
                      <TableCell>{formatCurrency(inv.amount_due)}</TableCell>
                      <TableCell>{formatCurrency(inv.balance_due)}</TableCell>
                      <TableCell>
                        <Chip
                          label={inv.status_display || formatStatus(inv.status)}
                          size="small"
                          sx={{ bgcolor: getStatusColor(inv.status), color: "#fff" }}
                        />
                      </TableCell>
                      <TableCell>{formatDate(inv.issued_at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Tab 3: Payment Preferences */}
      {activeTab === 3 && (
        <Card elevation={0} sx={{ border: "1px solid #e0e0e0", p: 2 }}>
          {supplier.payment_preferences?.length > 0 ? (
            supplier.payment_preferences.map((pref: any) => (
              <Box key={pref.id} p={2} mb={1} border="1px solid #e0e0e0" borderRadius={1}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {pref.method === "mobile_money"
                    ? "Mobile Money"
                    : pref.method === "bank_transfer"
                    ? "Bank Transfer"
                    : "Cash"}
                  {pref.is_default && (
                    <Chip label="Default" size="small" color="primary" sx={{ ml: 1 }} />
                  )}
                </Typography>
                {pref.phone && (
                  <Typography variant="body2">Phone: {pref.phone}</Typography>
                )}
                {pref.account_number && (
                  <Typography variant="body2">Account: {pref.account_number}</Typography>
                )}
                {pref.account_name && (
                  <Typography variant="body2">Name: {pref.account_name}</Typography>
                )}
                {pref.bank_name && (
                  <Typography variant="body2">Bank: {pref.bank_name}</Typography>
                )}
              </Box>
            ))
          ) : (
            <Alert severity="info">No payment preferences configured</Alert>
          )}
        </Card>
      )}
    </Box>
  );
};

export default SupplierProfile;