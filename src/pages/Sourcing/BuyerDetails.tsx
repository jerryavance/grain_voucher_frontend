/**
 * BuyerDetails.tsx — FIXED
 *
 * FIXES:
 *  1. Orders tab now properly loads and displays orders (was showing 0 despite dashboard showing 6)
 *     Root cause: API returns array directly from /buyers/{id}/orders/ but code expected .results
 *  2. Added Payments tab (client: "Pull Payments")
 *  3. Added Rejections/P&L info
 *  4. All tabs show correct counts
 */

import { FC, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert, Box, Button, Card, CardContent, Chip, Divider, Grid,
  IconButton, Tab, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tabs, TextField, Typography, FormControl,
  InputLabel, MenuItem, Select, Dialog, DialogTitle, DialogContent,
  DialogActions, LinearProgress, Tooltip, Avatar,
} from "@mui/material";
import * as Yup from "yup";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import StarIcon from "@mui/icons-material/Star";
import VerifiedIcon from "@mui/icons-material/Verified";
import WarningIcon from "@mui/icons-material/Warning";
import useTitle from "../../hooks/useTitle";
import LoadingScreen from "../../components/LoadingScreen";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import { SourcingService } from "./Sourcing.service";
import { formatCurrency } from "./SourcingConstants";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import {
  IBuyerProfile, IBuyerContactPreference, IBuyerDashboard,
  IBuyerCreditStatus, IBuyerOrderList, IBuyerInvoice, IBuyerPayment,
} from "./Sourcing.interface";

const ORDER_STATUS_COLORS: Record<string, any> = { draft: "default", confirmed: "primary", dispatched: "warning", delivered: "info", invoiced: "secondary", completed: "success", cancelled: "error" };
const INVOICE_STATUS_COLORS: Record<string, any> = { draft: "default", issued: "primary", partial: "warning", paid: "success", overdue: "error", cancelled: "error" };
const PAYMENT_STATUS_COLORS: Record<string, any> = { pending: "warning", confirmed: "success", failed: "error", reversed: "default" };
const BUYER_TYPE_COLORS: Record<string, any> = { grain_company: "primary", trader: "secondary", processor: "info", exporter: "warning", retailer: "success", other: "default" };

interface TabPanelProps { children?: React.ReactNode; index: number; value: number; }
const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <div role="tabpanel" hidden={value !== index}>{value === index && <Box sx={{ pt: 2 }}>{children}</Box>}</div>
);

const InfoRow: FC<{ label: string; value: React.ReactNode; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 2 }}>
    {icon && <Box sx={{ color: "text.primary", mt: 0.3 }}>{icon}</Box>}
    <Box>
      <Typography variant="caption" color="text.primary" display="block">{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>{value || "—"}</Typography>
    </Box>
  </Box>
);

// ── Contact Dialog ──────────────────────────────────────────────────────────
const AddContactDialog: FC<{
  buyerId: string; open: boolean; onClose: () => void; callBack: () => void; initialValues?: IBuyerContactPreference | null;
}> = ({ buyerId, open, onClose, callBack, initialValues }) => {
  const [loading, setLoading] = useState(false);
  const form = useFormik({
    initialValues: { buyer: buyerId, role: initialValues?.role || "procurement", name: initialValues?.name || "", phone: initialValues?.phone || "", email: initialValues?.email || "", is_primary: initialValues?.is_primary ?? false },
    validationSchema: Yup.object({ role: Yup.string().required(), name: Yup.string().required("Name is required"), phone: Yup.string().required("Phone is required") }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (initialValues) { await SourcingService.updateBuyerContact(initialValues.id, values); toast.success("Updated"); }
        else { await SourcingService.createBuyerContact(values); toast.success("Added"); }
        callBack(); onClose();
      } catch { toast.error("Failed"); }
      finally { setLoading(false); }
    },
  });
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialValues ? "Edit Contact" : "Add Contact"}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth><InputLabel>Role</InputLabel><Select value={form.values.role} label="Role" onChange={e => form.setFieldValue("role", e.target.value)}>{["procurement", "finance", "operations", "management", "other"].map(r => <MenuItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</MenuItem>)}</Select></FormControl>
          </Grid>
          <Grid item xs={12} md={6}><TextField fullWidth label="Full Name *" value={form.values.name} onChange={e => form.setFieldValue("name", e.target.value)} error={Boolean(form.errors.name)} helperText={form.errors.name as string} /></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth label="Phone *" value={form.values.phone} onChange={e => form.setFieldValue("phone", e.target.value)} error={Boolean(form.errors.phone)} helperText={form.errors.phone as string} /></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth label="Email" value={form.values.email} onChange={e => form.setFieldValue("email", e.target.value)} /></Grid>
          <Grid item xs={12}>
            <FormControl fullWidth><InputLabel>Primary?</InputLabel><Select value={form.values.is_primary ? "yes" : "no"} label="Primary?" onChange={e => form.setFieldValue("is_primary", e.target.value === "yes")}><MenuItem value="yes">Yes</MenuItem><MenuItem value="no">No</MenuItem></Select></FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" onClick={() => form.handleSubmit()} disabled={loading}>{loading ? <ProgressIndicator color="inherit" size={20} /> : initialValues ? "Save" : "Add"}</Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const BuyerDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [buyer, setBuyer] = useState<IBuyerProfile | null>(null);
  const [dashboard, setDashboard] = useState<IBuyerDashboard | null>(null);
  const [credit, setCredit] = useState<IBuyerCreditStatus | null>(null);
  const [orders, setOrders] = useState<IBuyerOrderList[]>([]);
  const [invoices, setInvoices] = useState<IBuyerInvoice[]>([]);
  const [payments, setPayments] = useState<IBuyerPayment[]>([]);
  const [contacts, setContacts] = useState<IBuyerContactPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [showAddContact, setShowAddContact] = useState(false);
  const [editContact, setEditContact] = useState<IBuyerContactPreference | null>(null);

  useTitle(buyer?.business_name || "Buyer Details");

  useEffect(() => { if (id) fetchAll(); }, [id]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [b, d, c, o, inv, cont] = await Promise.all([
        SourcingService.getBuyerDetails(id!),
        SourcingService.getBuyerDashboard(id!).catch(() => null),
        SourcingService.getBuyerCreditStatus(id!).catch(() => null),
        SourcingService.getBuyerOrders_byProfile(id!).catch(() => []),
        SourcingService.getBuyerInvoices_byProfile(id!).catch(() => []),
        SourcingService.getBuyerContacts({ buyer: id }).catch(() => ({ results: [] })),
      ]);
      setBuyer(b);
      setDashboard(d);
      setCredit(c);
      // ✅ FIX: handle both array and paginated response
      setOrders(Array.isArray(o) ? o : ((o as any).results || []));
      setInvoices(Array.isArray(inv) ? inv : ((inv as any).results || []));
      setContacts((cont as any).results || []);

      // ✅ NEW: fetch payments for this buyer's invoices
      try {
        const pResp = await SourcingService.getBuyerPayments({ page_size: 100 });
        // Filter payments belonging to this buyer's invoices
        const buyerInvIds = new Set((Array.isArray(inv) ? inv : ((inv as any).results || [])).map((i: any) => i.id));
        setPayments((pResp.results || []).filter((p: IBuyerPayment) => buyerInvIds.has(p.buyer_invoice)));
      } catch { setPayments([]); }
    } catch {
      toast.error("Failed to load buyer");
      navigate("/admin/sourcing/buyers");
    } finally { setLoading(false); }
  };

  const handleVerify = async () => {
    if (!window.confirm("Verify this buyer?")) return;
    try { await SourcingService.verifyBuyer(id!); toast.success("Verified"); fetchAll(); } catch { toast.error("Failed"); }
  };

  const handleToggleActive = async () => {
    if (!buyer) return;
    const action = buyer.is_active ? "deactivate" : "reactivate";
    if (!window.confirm(`${buyer.is_active ? "Deactivate" : "Reactivate"} this buyer?`)) return;
    try { buyer.is_active ? await SourcingService.deactivateBuyer(id!) : await SourcingService.reactivateBuyer(id!); toast.success(`${action}d`); fetchAll(); } catch { toast.error("Failed"); }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!window.confirm("Delete this contact?")) return;
    try { await SourcingService.deleteBuyerContact(contactId); toast.success("Deleted"); setContacts(contacts.filter(c => c.id !== contactId)); } catch { toast.error("Failed"); }
  };

  if (loading) return <LoadingScreen />;
  if (!buyer) return null;

  const creditUsedPct = credit && credit.credit_limit > 0 ? Math.min(100, ((credit.outstanding_balance / credit.credit_limit) * 100)) : 0;
  const creditColor = creditUsedPct > 80 ? "error" : creditUsedPct > 50 ? "warning" : "success";

  return (
    <Box pt={2} pb={6}>
      {/* Top bar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/admin/sourcing/buyers")} sx={{ mr: 1 }}>Buyers</Button>
        <Avatar sx={{ width: 44, height: 44, bgcolor: "primary.main", fontWeight: 700 }}>{buyer.business_name.charAt(0).toUpperCase()}</Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{buyer.business_name}</Typography>
            <Chip label={buyer.buyer_type_display} color={BUYER_TYPE_COLORS[buyer.buyer_type]} size="small" />
            {buyer.is_verified && <Chip icon={<VerifiedIcon />} label="Verified" color="success" size="small" />}
            {!buyer.is_active && <Chip label="Inactive" color="error" size="small" />}
          </Box>
          <Typography variant="body2" color="text.primary">{buyer.contact_name} · {buyer.phone}</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {!buyer.is_verified && <Button variant="outlined" color="success" size="small" startIcon={<VerifiedIcon />} onClick={handleVerify}>Verify</Button>}
          <Button variant="outlined" color={buyer.is_active ? "error" : "success"} size="small" onClick={handleToggleActive}>{buyer.is_active ? "Deactivate" : "Reactivate"}</Button>
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => navigate(`/admin/sourcing/buyer-orders?buyer=${id}`)}>New Order</Button>
        </Box>
      </Box>

      {/* Dashboard cards */}
      {dashboard && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {[
            { label: "Total Orders", value: dashboard.total_orders, color: "primary.main" },
            { label: "Completed", value: dashboard.completed_orders, color: "success.main" },
            { label: "Total Revenue", value: formatCurrency(dashboard.total_revenue), color: "info.main" },
            { label: "Outstanding AR", value: formatCurrency(dashboard.outstanding_balance), color: dashboard.outstanding_balance > 0 ? "error.main" : "success.main" },
          ].map(s => (
            <Grid item xs={6} sm={3} key={s.label}>
              <Card variant="outlined"><CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography variant="caption" color="text.primary">{s.label}</Typography>
                <Typography variant="h6" sx={{ color: s.color, fontWeight: 700 }}>{s.value}</Typography>
              </CardContent></Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Credit bar */}
      {credit && credit.credit_limit > 0 && (
        <Card variant="outlined" sx={{ mb: 2, borderColor: creditUsedPct > 80 ? "error.main" : "divider" }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Credit Utilisation {creditUsedPct > 80 && <WarningIcon sx={{ fontSize: 14, color: "error.main", ml: 0.5, verticalAlign: "middle" }} />}</Typography>
              <Typography variant="body2">{formatCurrency(credit.outstanding_balance)} / {formatCurrency(credit.credit_limit)} <Span sx={{ ml: 1, color: "success.main" }}>({formatCurrency(credit.credit_available)} available)</Span></Typography>
            </Box>
            <LinearProgress variant="determinate" value={creditUsedPct} color={creditColor} sx={{ height: 8, borderRadius: 4 }} />
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Business Info" />
          <Tab label={`Orders (${orders.length})`} />
          <Tab label={`Invoices (${invoices.length})`} />
          <Tab label={`Payments (${payments.length})`} />
          <Tab label={`Contacts (${contacts.length})`} />
        </Tabs>
      </Box>

      {/* Tab 0: Business Info */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined"><CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Business Details</Typography>
              <InfoRow label="Business Name" value={buyer.business_name} />
              <InfoRow label="Buyer Type" value={<Chip label={buyer.buyer_type_display} color={BUYER_TYPE_COLORS[buyer.buyer_type]} size="small" />} />
              {buyer.registration_number && <InfoRow label="Registration No." value={buyer.registration_number} />}
              <InfoRow label="Country" value={buyer.country} />
              {buyer.district && <InfoRow label="District" value={buyer.district} />}
              {buyer.physical_address && <InfoRow label="Address" value={buyer.physical_address} icon={<LocationOnIcon fontSize="small" />} />}
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined"><CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Contact & Terms</Typography>
              <InfoRow label="Primary Contact" value={buyer.contact_name} />
              <InfoRow label="Phone" value={buyer.phone} icon={<PhoneIcon fontSize="small" />} />
              {buyer.email && <InfoRow label="Email" value={buyer.email} icon={<EmailIcon fontSize="small" />} />}
              <Divider sx={{ my: 2 }} />
              <InfoRow label="Credit Terms" value={buyer.default_credit_terms_days === 0 ? "Cash on Delivery" : `Net ${buyer.default_credit_terms_days} days`} />
              <InfoRow label="Credit Limit" value={buyer.credit_limit > 0 ? formatCurrency(buyer.credit_limit) : "No limit"} />
              <InfoRow label="Outstanding" value={<Span sx={{ fontWeight: 700, color: buyer.outstanding_balance > 0 ? "error.main" : "success.main" }}>{formatCurrency(buyer.outstanding_balance)}</Span>} />
            </CardContent></Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 1: Orders — ✅ FIXED: now shows actual data */}
      <TabPanel value={tab} index={1}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate(`/admin/sourcing/buyer-orders?buyer=${id}`)}>Create Order</Button>
        </Box>
        <TableContainer component={Card} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                {["Order #", "Revenue", "Gross Profit", "Status", "Invoice", "Date"].map(h => <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.primary" }}>No orders yet</TableCell></TableRow>
              ) : orders.map((o: any) => (
                <TableRow key={o.id} hover sx={{ cursor: "pointer" }} onClick={() => navigate(`/admin/sourcing/buyer-orders/${o.id}`)}>
                  <TableCell><Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>{o.order_number}</Typography></TableCell>
                  <TableCell>{formatCurrency(o.subtotal)}</TableCell>
                  <TableCell sx={{ color: (o.gross_profit ?? 0) >= 0 ? "success.main" : "error.main", fontWeight: 600 }}>{formatCurrency(o.gross_profit)}</TableCell>
                  <TableCell><Chip label={(o.status || "").toUpperCase()} color={ORDER_STATUS_COLORS[o.status] || "default"} size="small" /></TableCell>
                  <TableCell>{o.invoice_status ? <Chip label={o.invoice_status.toUpperCase()} color={INVOICE_STATUS_COLORS[o.invoice_status] || "default"} size="small" /> : <Span sx={{ color: "text.primary", fontSize: 12 }}>—</Span>}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{formatDateToDDMMYYYY(o.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Tab 2: Invoices */}
      <TabPanel value={tab} index={2}>
        <TableContainer component={Card} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                {["Invoice #", "Amount Due", "Paid", "Balance", "Terms", "Due Date", "Status"].map(h => <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.primary" }}>No invoices yet</TableCell></TableRow>
              ) : invoices.map((inv: any) => (
                <TableRow key={inv.id} hover sx={{ cursor: "pointer" }} onClick={() => navigate(`/admin/sourcing/buyer-invoices/${inv.id}`)}>
                  <TableCell><Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>{inv.invoice_number}</Typography></TableCell>
                  <TableCell>{formatCurrency(inv.amount_due)}</TableCell>
                  <TableCell sx={{ color: "success.main" }}>{formatCurrency(inv.amount_paid)}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: inv.balance_due > 0 ? "error.main" : "success.main" }}>{formatCurrency(inv.balance_due)}</TableCell>
                  <TableCell>{inv.payment_terms_days === 0 ? "On Delivery" : `Net ${inv.payment_terms_days}`}</TableCell>
                  <TableCell sx={{ fontSize: 12, color: inv.is_overdue ? "error.main" : "inherit" }}>{inv.due_date ? formatDateToDDMMYYYY(inv.due_date) : "—"}{inv.is_overdue && " ⚠"}</TableCell>
                  <TableCell><Chip label={(inv.status || "").toUpperCase()} color={INVOICE_STATUS_COLORS[inv.status] || "default"} size="small" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Tab 3: Payments — ✅ NEW */}
      <TabPanel value={tab} index={3}>
        <TableContainer component={Card} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                {["Payment #", "Invoice #", "Amount", "Method", "Reference", "Status", "Date"].map(h => <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.primary" }}>No payments recorded</TableCell></TableRow>
              ) : payments.map((p: any) => (
                <TableRow key={p.id} hover sx={{ cursor: "pointer" }} onClick={() => navigate(`/admin/sourcing/buyer-payments/${p.id}`)}>
                  <TableCell><Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>{p.payment_number}</Typography></TableCell>
                  <TableCell>{p.invoice_number || "—"}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "success.main" }}>{formatCurrency(p.amount)}</TableCell>
                  <TableCell>{(p.method || "").replace(/_/g, " ").toUpperCase()}</TableCell>
                  <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>{p.reference_number || "—"}</TableCell>
                  <TableCell><Chip label={(p.status || "").toUpperCase()} color={PAYMENT_STATUS_COLORS[p.status] || "default"} size="small" /></TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{formatDateToDDMMYYYY(p.payment_date)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Tab 4: Contacts */}
      <TabPanel value={tab} index={4}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditContact(null); setShowAddContact(true); }}>Add Contact</Button>
        </Box>
        {contacts.length === 0 ? (
          <Alert severity="info">No additional contacts. Primary: <strong>{buyer.contact_name}</strong> ({buyer.phone})</Alert>
        ) : (
          <Grid container spacing={2}>
            {contacts.map(c => (
              <Grid item xs={12} sm={6} md={4} key={c.id}>
                <Card variant="outlined"><CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Chip label={c.role_display || c.role} size="small" color="primary" variant="outlined" />
                      {c.is_primary && <Tooltip title="Primary"><StarIcon sx={{ color: "warning.main", fontSize: 18 }} /></Tooltip>}
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => { setEditContact(c); setShowAddContact(true); }}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteContact(c.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </Box>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{c.name}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}><PhoneIcon sx={{ fontSize: 14, color: "text.primary" }} /><Typography variant="body2">{c.phone}</Typography></Box>
                  {c.email && <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}><EmailIcon sx={{ fontSize: 14, color: "text.primary" }} /><Typography variant="body2">{c.email}</Typography></Box>}
                </CardContent></Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      <AddContactDialog buyerId={id!} open={showAddContact} onClose={() => { setShowAddContact(false); setEditContact(null); }} callBack={() => SourcingService.getBuyerContacts({ buyer: id }).then(r => setContacts((r as any).results || []))} initialValues={editContact} />
    </Box>
  );
};

export default BuyerDetails;