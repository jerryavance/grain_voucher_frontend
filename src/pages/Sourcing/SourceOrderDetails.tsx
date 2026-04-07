/**
 * SourceOrderDetails.tsx — FIXED
 *
 * FIXES:
 *  1. Hub, Grain Type, Created By now read from _detail nested objects
 *  2. Invoice & Payments tab shows actual invoice data + payment history (was static alert)
 *  3. Added Deliveries tab with delivery records table
 *  4. Added Weighbridge tab with weighbridge record details
 *  5. Added "View Trade Story" button linking to TransactionTree
 *  6. Aggregator tab preserved
 */

import { FC, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert, Box, Button, Card, CardContent, Chip, Divider, Grid,
  Tab, Tabs, Table, TableBody, TableCell, TableHead, TableRow,
  Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, FormHelperText, TextField,
  Paper, LinearProgress,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ScaleIcon from "@mui/icons-material/Scale";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import StorefrontIcon from "@mui/icons-material/Storefront";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import EditIcon from "@mui/icons-material/Edit";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import useTitle from "../../hooks/useTitle";
import { SourcingService } from "./Sourcing.service";
import { ISourceOrder, IInvestorAccount, IAggregatorTradeCost } from "./Sourcing.interface";
import { formatCurrency, formatWeight, formatPercentage, ORDER_STATUS_COLORS, INVOICE_STATUS_COLORS, PAYMENT_STATUS_COLORS } from "./SourcingConstants";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import { Span } from "../../components/Typography";
import LoadingScreen from "../../components/LoadingScreen";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { SupplierInvoicePDFButton } from "./SupplierInvoicePDF";
import { StandaloneDeliveryRecordForm, StandaloneWeighbridgeRecordForm, AggregatorTradeCostForm } from "./SourcingForms";

interface TabPanelProps { children?: React.ReactNode; index: number; value: number; }
function TabPanel({ children, value, index }: TabPanelProps) {
  return <div role="tabpanel" hidden={value !== index}>{value === index && <Box sx={{ p: 3 }}>{children}</Box>}</div>;
}

const LOGISTICS_LABELS: Record<string, string> = {
  supplier: "Supplier Arranged", supplier_driver: "Supplier Driver",
  bennu_truck: "Bennu Truck", third_party: "Third Party", company: "Company Arranged",
};

// ─── Investor Allocation Form ──────────────────────────────────────────────
const InvestorAllocationForm: FC<{
  open: boolean; order: ISourceOrder; handleClose: () => void; callBack?: () => void;
}> = ({ open, order, handleClose, callBack }) => {
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [investorAccounts, setInvestorAccounts] = useState<IInvestorAccount[]>([]);

  useEffect(() => {
    if (!open) return;
    setOptionsLoading(true);
    SourcingService.getInvestorAccounts()
      .then(r => setInvestorAccounts(r.results ?? (r as any)))
      .catch(() => toast.error("Failed to load investor accounts"))
      .finally(() => setOptionsLoading(false));
  }, [open]);

  const form = useFormik({
    initialValues: {
      investor_account: "", source_order: order.id,
      amount_allocated: order.total_cost,
      financing_percentage: 100,
      emd_deduction_timing: "on_assignment",
      notes: "",
    },
    validationSchema: Yup.object({
      investor_account: Yup.string().required("Investor account is required"),
      amount_allocated: Yup.number().typeError("Must be a number").positive().required(),
      financing_percentage: Yup.number().min(1, "Min 1%").max(100, "Max 100%").required(),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await SourcingService.createInvestorAllocation({
          investor_account: values.investor_account, source_order: values.source_order,
          amount_allocated: Number(values.amount_allocated),
          financing_percentage: Number(values.financing_percentage),
          emd_deduction_timing: values.emd_deduction_timing as "on_assignment" | "on_weighbridge" | "on_supplier_payment",
          notes: values.notes,
        });
        toast.success("Investor allocated successfully");
        form.resetForm(); callBack?.(); handleClose();
      } catch (e: any) {
        toast.error(e.response?.data?.amount_allocated?.[0] || e.response?.data?.source_order?.[0] || "Failed");
      } finally { setLoading(false); }
    },
  });

  // Auto-compute amount based on financing percentage
  useEffect(() => {
    const pct = Number(form.values.financing_percentage) || 100;
    const computed = (Number(order.total_cost) * pct / 100).toFixed(2);
    form.setFieldValue("amount_allocated", computed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values.financing_percentage, order.total_cost]);

  const selected = investorAccounts.find(a => a.id === form.values.investor_account);
  const balance = selected ? (selected.emd_balance ?? selected.available_balance) : 0;
  const sufficient = selected ? balance >= Number(form.values.amount_allocated) : true;

  return (
    <Dialog open={open} onClose={() => !loading && handleClose()} maxWidth="sm" fullWidth>
      <DialogTitle><AccountBalanceIcon color="primary" sx={{ mr: 1 }} />Assign Investor</DialogTitle>
      <DialogContent dividers>
        {optionsLoading ? <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><ProgressIndicator /></Box> : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <FormControl fullWidth error={Boolean(form.touched.investor_account && form.errors.investor_account)}>
              <InputLabel>Investor Account *</InputLabel>
              <Select value={form.values.investor_account} label="Investor Account *" onChange={e => form.setFieldValue("investor_account", e.target.value)}>
                {investorAccounts.map(a => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.investor.first_name} {a.investor.last_name} — EMD: {formatCurrency(a.emd_balance ?? a.available_balance)}
                  </MenuItem>
                ))}
              </Select>
              {form.touched.investor_account && form.errors.investor_account && <FormHelperText>{form.errors.investor_account as string}</FormHelperText>}
            </FormControl>
            {selected && <Alert severity={sufficient ? "success" : "error"}>EMD Balance: {formatCurrency(balance)}{!sufficient && " — Insufficient"}</Alert>}
            {/* Financing Percentage */}
            <TextField label="Financing Percentage (%)" type="number" fullWidth
              value={form.values.financing_percentage}
              onChange={e => form.setFieldValue("financing_percentage", Math.min(100, Math.max(1, Number(e.target.value) || 100)))}
              helperText="Set below 100% for partial investor financing (e.g. buyer pays part upfront)"
              inputProps={{ min: 1, max: 100 }} />
            <TextField label="Amount (UGX) *" type="number" fullWidth value={form.values.amount_allocated}
              onChange={e => form.setFieldValue("amount_allocated", e.target.value)}
              helperText={`Order total: ${formatCurrency(order.total_cost)} × ${form.values.financing_percentage}%`} />
            {/* EMD Deduction Timing */}
            <FormControl fullWidth>
              <InputLabel>When to deduct EMD</InputLabel>
              <Select value={form.values.emd_deduction_timing} label="When to deduct EMD"
                onChange={e => form.setFieldValue("emd_deduction_timing", e.target.value)}>
                <MenuItem value="on_assignment">Immediately (on assignment)</MenuItem>
                <MenuItem value="on_weighbridge">After weighbridge (goods accepted)</MenuItem>
                <MenuItem value="on_supplier_payment">After supplier payment</MenuItem>
              </Select>
              <FormHelperText>
                {form.values.emd_deduction_timing === "on_assignment"
                  ? "EMD locked from investor's balance immediately."
                  : form.values.emd_deduction_timing === "on_weighbridge"
                  ? "EMD locked only after goods are weighed and accepted."
                  : "EMD locked only after the supplier has been paid."}
              </FormHelperText>
            </FormControl>
            <TextField label="Notes" multiline rows={2} fullWidth value={form.values.notes} onChange={e => form.setFieldValue("notes", e.target.value)} />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" onClick={() => form.handleSubmit()} disabled={loading || !sufficient}>
          {loading ? "Allocating..." : "Allocate"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────
const SourceOrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<ISourceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [showWeighbridgeForm, setShowWeighbridgeForm] = useState(false);
  const [showAllocationForm, setShowAllocationForm] = useState(false);
  const [showAggregatorCostForm, setShowAggregatorCostForm] = useState(false);
  const [aggregatorCost, setAggregatorCost] = useState<IAggregatorTradeCost | null>(null);
  const [aggregatorCostLoading, setAggregatorCostLoading] = useState(false);

  // ✅ NEW: full trade tree data for invoice/payments/deliveries tabs
  const [tradeTree, setTradeTree] = useState<any>(null);
  const [treeLoading, setTreeLoading] = useState(false);

  useTitle(order ? `Order ${order.order_number}` : "Order Details");

  useEffect(() => { if (id) fetchOrderDetails(); }, [id]);
  useEffect(() => { if (order?.trade_type === "aggregator") fetchAggregatorCost(); }, [order?.id, order?.trade_type]);
  // ✅ NEW: fetch trade tree for invoice/payments/deliveries data
  useEffect(() => { if (id) fetchTradeTree(); }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setOrder(await SourcingService.getSourceOrderDetails(id!));
    } catch {
      toast.error("Failed to load order details");
      navigate("/admin/sourcing/orders");
    } finally { setLoading(false); }
  };

  const fetchTradeTree = async () => {
    if (!id) return;
    setTreeLoading(true);
    try { setTradeTree(await SourcingService.getTransactionTree(id)); }
    catch { /* trade tree is supplementary */ }
    finally { setTreeLoading(false); }
  };

  const fetchAggregatorCost = async () => {
    if (!id) return;
    setAggregatorCostLoading(true);
    try { setAggregatorCost(await SourcingService.getAggregatorTradeCostByOrder(id)); }
    catch { setAggregatorCost(null); }
    finally { setAggregatorCostLoading(false); }
  };

  const handleAction = async (action: () => Promise<any>, successMsg: string) => {
    try { await action(); toast.success(successMsg); fetchOrderDetails(); fetchTradeTree(); }
    catch (e: any) { toast.error(e?.response?.data?.error || "Action failed"); }
  };

  if (loading) return <LoadingScreen />;
  if (!order) return null;

  // ✅ FIX: read from _detail nested objects
  const createdBy = (order as any).created_by_detail || order.created_by;
  const hub = (order as any).hub_detail || order.hub;
  const grainType = (order as any).grain_type_detail || order.grain_type;
  const supplier = (order as any).supplier_detail || order.supplier;
  const isAggregator = order.trade_type === "aggregator";

  // Trade tree data
  const treeDeliveries = tradeTree?.deliveries || [];
  const treeWeighbridge = tradeTree?.weighbridge;
  const treeInvoice = tradeTree?.supplier_invoice;
  const treePayments = tradeTree?.supplier_payments || [];

  const tabLabels = [
    "Order Details",
    "Supplier Info",
    `Invoice & Payments`,
    `Deliveries (${treeDeliveries.length})`,
    "Weighbridge",
  ];
  if (isAggregator) tabLabels.push("Aggregator Costs");

  return (
    <Box pt={2} pb={4}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 1 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/admin/sourcing/orders")} sx={{ mr: 1 }}>Back</Button>
        <Typography variant="h4">{order.order_number}</Typography>
        <Chip label={(order as any).status_display ?? order.status} color={ORDER_STATUS_COLORS[order.status]} sx={{ ml: 1 }} />
        <Chip label={isAggregator ? "Aggregator Trade" : "Direct Purchase"} color={isAggregator ? "info" : "default"} size="small" variant="outlined" />
        {order.has_investor_allocation && <Chip label="Investor Assigned" color="success" size="small" icon={<AccountBalanceIcon />} variant="outlined" />}
        {order.has_sale_lot && <Chip label="Stock Created" color="info" size="small" variant="outlined" />}
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {/* ✅ NEW: Trade Story button */}
        <Button variant="outlined" startIcon={<AccountTreeIcon />} onClick={() => navigate(`/admin/sourcing/orders/${id}/tree`)}>
          View Trade Story
        </Button>
        {order.status === "draft" && (
          <Button variant="contained" startIcon={<SendIcon />} onClick={() => handleAction(() => SourcingService.sendToSupplier(id!), "Sent to supplier")}>Send to Supplier</Button>
        )}
        {order.status === "sent" && (
          <>
            <Button variant="contained" color="success" startIcon={<CheckIcon />} onClick={() => handleAction(() => SourcingService.acceptOrder(id!), "Accepted")}>Accept</Button>
            <Button variant="outlined" color="error" startIcon={<CloseIcon />} onClick={() => handleAction(() => SourcingService.cancelOrder(id!), "Cancelled")}>Cancel</Button>
          </>
        )}
        {order.status === "accepted" && (
          <>
            {!order.has_investor_allocation && <Button variant="contained" color="primary" startIcon={<AccountBalanceIcon />} onClick={() => setShowAllocationForm(true)}>Assign Investor</Button>}
            <Button variant="outlined" startIcon={<LocalShippingIcon />} onClick={() => handleAction(() => SourcingService.markInTransit(id!), "Marked in transit")}>Mark In Transit</Button>
          </>
        )}
        {["accepted", "in_transit", "sent"].includes(order.status) && <Button variant="contained" startIcon={<LocalShippingIcon />} onClick={() => setShowDeliveryForm(true)}>Record Delivery</Button>}
        {["delivered", "accepted", "in_transit"].includes(order.status) && (
          <>
            {!order.has_weighbridge && <Button variant="contained" color="primary" startIcon={<ScaleIcon />} onClick={() => setShowWeighbridgeForm(true)}>Record Weighbridge</Button>}
            {isAggregator && <Button variant={aggregatorCost ? "outlined" : "contained"} color="info" startIcon={aggregatorCost ? <EditIcon /> : <StorefrontIcon />} onClick={() => setShowAggregatorCostForm(true)}>{aggregatorCost ? "Edit Aggregator Costs" : "Record Aggregator Costs"}</Button>}
          </>
        )}
      </Box>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: "divider" }}>
        {tabLabels.map((label, i) => <Tab key={i} label={label} />)}
      </Tabs>

      {/* ── Tab 0: Order Details ─────────────────────────────────────────── */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card><CardContent>
              <Typography variant="h6" gutterBottom>Order Information</Typography>
              <Divider sx={{ mb: 2 }} />
              {([
                ["Order Number", order.order_number],
                ["Trade Type", isAggregator ? "Aggregator Trade" : "Direct Purchase"],
                ["Hub", hub?.name ?? "—"],
                ["Grain Type", grainType?.name ?? "—"],
                ["Quantity", formatWeight(order.quantity_kg)],
                ["Price per kg", formatCurrency(order.offered_price_per_kg)],
                ["Created By", createdBy && typeof createdBy === "object" ? `${createdBy.first_name || ""} ${createdBy.last_name || ""}`.trim() : "—"],
                ["Created At", formatDateToDDMMYYYY(order.created_at)],
                ...(order.expected_delivery_date ? [["Expected Delivery", formatDateToDDMMYYYY(order.expected_delivery_date)]] : []),
              ] as [string, string][]).map(([label, value]) => (
                <Box key={label} sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <Span sx={{ fontWeight: 600, color: "text.primary" }}>{label}:</Span>
                  <Span>{value}</Span>
                </Box>
              ))}
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card><CardContent>
              <Typography variant="h6" gutterBottom>Cost Breakdown</Typography>
              <Divider sx={{ mb: 2 }} />
              {([
                ["Grain Cost", formatCurrency(order.grain_cost)],
                ["Weighbridge Cost", formatCurrency(order.weighbridge_cost)],
                ["Logistics Cost", formatCurrency(order.logistics_cost)],
                ["Loading Cost", formatCurrency(order.loading_cost)],
                ["Offloading Cost", formatCurrency(order.offloading_cost)],
                ["Handling Cost", formatCurrency(order.handling_cost)],
                ["Other Costs", formatCurrency(order.other_costs)],
              ] as [string, string][]).map(([label, value]) => (
                <Box key={label} sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <Span sx={{ fontWeight: 600, color: "text.primary" }}>{label}:</Span>
                  <Span>{value}</Span>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6">Total Cost:</Typography>
                <Typography variant="h6" color="primary">{formatCurrency(order.total_cost)}</Typography>
              </Box>
            </CardContent></Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ── Tab 1: Supplier Info ─────────────────────────────────────────── */}
      <TabPanel value={tabValue} index={1}>
        <Card><CardContent>
          <Typography variant="h6" gutterBottom>Supplier Information</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 1.5 }}><Span sx={{ fontWeight: 600, color: "text.primary" }}>Business Name:</Span> <Span>{supplier?.business_name ?? "—"}</Span></Box>
              <Box sx={{ mb: 1.5 }}><Span sx={{ fontWeight: 600, color: "text.primary" }}>Contact:</Span> <Span>{supplier?.user ? `${supplier.user.first_name} ${supplier.user.last_name}` : "—"}</Span></Box>
              {supplier?.user?.phone_number && <Box sx={{ mb: 1.5 }}><Span sx={{ fontWeight: 600, color: "text.primary" }}>Phone:</Span> <Span>{supplier.user.phone_number}</Span></Box>}
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 1.5 }}><Span sx={{ fontWeight: 600, color: "text.primary" }}>Hub:</Span> <Span>{supplier?.hub?.name ?? "—"}</Span></Box>
              <Box sx={{ mb: 1.5 }}><Span sx={{ fontWeight: 600, color: "text.primary" }}>Farm Location:</Span> <Span>{supplier?.farm_location ?? "—"}</Span></Box>
              <Box sx={{ mb: 1.5 }}><Span sx={{ fontWeight: 600, color: "text.primary" }}>Verified:</Span> <Chip label={supplier?.is_verified ? "Verified" : "Not Verified"} color={supplier?.is_verified ? "success" : "warning"} size="small" /></Box>
            </Grid>
          </Grid>
        </CardContent></Card>
      </TabPanel>

      {/* ── Tab 2: Invoice & Payments — ✅ FIXED (was static alert) ─────── */}
      <TabPanel value={tabValue} index={2}>
        {treeLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><ProgressIndicator /></Box>
        ) : treeInvoice ? (
          <Grid container spacing={3}>
            {/* Invoice summary cards */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                {[
                  { label: "Amount Due", value: formatCurrency(treeInvoice.amount_due), color: "text.primary" },
                  { label: "Amount Paid", value: formatCurrency(treeInvoice.amount_paid), color: "success.main" },
                  { label: "Balance Due", value: formatCurrency(treeInvoice.balance_due), color: Number(treeInvoice.balance_due) > 0 ? "error.main" : "success.main" },
                  { label: "Status", value: treeInvoice.status?.toUpperCase(), color: "primary.main" },
                ].map(c => (
                  <Grid item xs={6} sm={3} key={c.label}>
                    <Card variant="outlined"><CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                      <Typography variant="caption" color="text.primary">{c.label}</Typography>
                      <Typography variant="h6" sx={{ color: c.color, fontWeight: 700 }}>{c.value}</Typography>
                    </CardContent></Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Invoice details */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined"><CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6">Invoice Details</Typography>
                  <SupplierInvoicePDFButton invoice={treeInvoice as any} isFullDetail={false} size="small" />
                </Box>
                <Divider sx={{ mb: 2 }} />
                {([
                  ["Invoice #", treeInvoice.invoice_number],
                  ["Issued At", formatDateToDDMMYYYY(treeInvoice.issued_at)],
                  ["Due Date", treeInvoice.due_date ? formatDateToDDMMYYYY(treeInvoice.due_date) : "—"],
                  ["Paid At", treeInvoice.paid_at ? formatDateToDDMMYYYY(treeInvoice.paid_at) : "—"],
                  ["Payment Reference", treeInvoice.payment_reference || "—"],
                ] as [string, string][]).map(([label, value]) => (
                  <Box key={label} sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                    <Span sx={{ fontWeight: 600, color: "text.primary" }}>{label}:</Span>
                    <Span>{value}</Span>
                  </Box>
                ))}
              </CardContent></Card>
            </Grid>

            {/* Payment progress */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined"><CardContent>
                <Typography variant="h6" gutterBottom>Payment Progress</Typography>
                <Divider sx={{ mb: 2 }} />
                {(() => {
                  const paidPct = treeInvoice.amount_due > 0 ? Math.min(100, (Number(treeInvoice.amount_paid) / Number(treeInvoice.amount_due)) * 100) : 0;
                  return (
                    <>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>{paidPct.toFixed(0)}%</Typography>
                      <LinearProgress variant="determinate" value={paidPct} color={paidPct === 100 ? "success" : "primary"} sx={{ height: 8, borderRadius: 4 }} />
                    </>
                  );
                })()}
              </CardContent></Card>
            </Grid>

            {/* Payment history table */}
            <Grid item xs={12}>
              <Card variant="outlined"><CardContent>
                <Typography variant="h6" gutterBottom>Payment History</Typography>
                <Divider sx={{ mb: 2 }} />
                {treePayments.length === 0 ? (
                  <Alert severity="info">No payments recorded yet.</Alert>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "action.hover" }}>
                        {["Payment #", "Method", "Reference", "Amount", "Status", "Date"].map(h => (
                          <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {treePayments.map((p: any) => (
                        <TableRow key={p.id} hover>
                          <TableCell><Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>{p.payment_number}</Typography></TableCell>
                          <TableCell>{p.method_display || p.method}</TableCell>
                          <TableCell sx={{ fontFamily: "monospace" }}>{p.reference_number || "—"}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(p.amount)}</TableCell>
                          <TableCell><Chip label={p.status_display || p.status} color={PAYMENT_STATUS_COLORS[p.status] || "default"} size="small" /></TableCell>
                          <TableCell>{formatDateToDDMMYYYY(p.completed_at || p.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent></Card>
            </Grid>
          </Grid>
        ) : (
          <Alert severity="warning">No invoice generated yet. Invoice is auto-created when the order is accepted.</Alert>
        )}
      </TabPanel>

      {/* ── Tab 3: Deliveries ✅ NEW ────────────────────────────────────── */}
      <TabPanel value={tabValue} index={3}>
        {treeLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><ProgressIndicator /></Box>
        ) : treeDeliveries.length > 0 ? (
          <Paper variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "action.hover" }}>
                  {["Hub", "Driver", "Vehicle", "Condition", "Received At", "Notes"].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {treeDeliveries.map((d: any) => (
                  <TableRow key={d.id} hover>
                    <TableCell>{d.hub_name || "—"}</TableCell>
                    <TableCell>{d.driver_name}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace" }}>{d.vehicle_number}</TableCell>
                    <TableCell><Chip label={d.apparent_condition?.toUpperCase()} size="small" /></TableCell>
                    <TableCell>{formatDateToDDMMYYYY(d.received_at)}</TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>{d.notes || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        ) : (
          <Alert severity="info">No delivery records yet. {["accepted", "in_transit", "sent"].includes(order.status) && <Button size="small" onClick={() => setShowDeliveryForm(true)}>Record Delivery</Button>}</Alert>
        )}
      </TabPanel>

      {/* ── Tab 4: Weighbridge ✅ NEW ───────────────────────────────────── */}
      <TabPanel value={tabValue} index={4}>
        {treeLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><ProgressIndicator /></Box>
        ) : treeWeighbridge ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined"><CardContent>
                <Typography variant="h6" gutterBottom>Weight Details</Typography>
                <Divider sx={{ mb: 2 }} />
                {([
                  ["Vehicle #", treeWeighbridge.vehicle_number],
                  ["Gross Weight", formatWeight(treeWeighbridge.gross_weight_kg)],
                  ["Tare Weight", formatWeight(treeWeighbridge.tare_weight_kg)],
                  ["Net Weight", formatWeight(treeWeighbridge.net_weight_kg)],
                  ["Contracted Qty", formatWeight(order.quantity_kg)],
                ] as [string, string][]).map(([label, value]) => (
                  <Box key={label} sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                    <Span sx={{ fontWeight: 600, color: "text.primary" }}>{label}:</Span>
                    <Span sx={{ fontWeight: 600 }}>{value}</Span>
                  </Box>
                ))}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Span sx={{ fontWeight: 700 }}>Variance:</Span>
                  <Span sx={{ fontWeight: 700, color: Number(treeWeighbridge.quantity_variance_kg) >= 0 ? "success.main" : "error.main" }}>
                    {Number(treeWeighbridge.quantity_variance_kg) >= 0 ? "+" : ""}{formatWeight(treeWeighbridge.quantity_variance_kg)}
                  </Span>
                </Box>
              </CardContent></Card>
            </Grid>
          </Grid>
        ) : (
          <Alert severity="info">No weighbridge record yet. {["delivered", "accepted", "in_transit"].includes(order.status) && !order.has_weighbridge && <Button size="small" onClick={() => setShowWeighbridgeForm(true)}>Record Weighbridge</Button>}</Alert>
        )}
      </TabPanel>

      {/* ── Tab 5: Aggregator Costs (conditional) ──────────────────────── */}
      {isAggregator && (
        <TabPanel value={tabValue} index={5}>
          {aggregatorCostLoading ? <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><ProgressIndicator /></Box>
          : aggregatorCost ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card><CardContent>
                  <Typography variant="h6" gutterBottom>Tonnage</Typography><Divider sx={{ mb: 2 }} />
                  {([
                    ["Source Qty", formatWeight(aggregatorCost.source_quantity_kg)],
                    ["Arrived Qty", formatWeight(aggregatorCost.arrived_quantity_kg)],
                    ["Transit Loss", formatWeight(aggregatorCost.tonnage_lost_in_transit_kg)],
                    ["Transit Loss %", formatPercentage(aggregatorCost.transit_loss_pct)],
                    ["Buyer Deduction", formatWeight(aggregatorCost.buyer_deduction_kg)],
                    ["Net Accepted", formatWeight(aggregatorCost.net_accepted_quantity_kg)],
                  ] as [string, string][]).map(([l, v]) => (
                    <Box key={l} sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}><Span sx={{ color: "text.primary" }}>{l}:</Span><Span>{v}</Span></Box>
                  ))}
                </CardContent></Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card><CardContent>
                  <Typography variant="h6" gutterBottom>Destination Costs</Typography><Divider sx={{ mb: 2 }} />
                  {([
                    ["Weighbridge", formatCurrency(aggregatorCost.destination_weighbridge_cost)],
                    ["Insurance", formatCurrency(aggregatorCost.transit_insurance_cost)],
                    ["Other", formatCurrency(aggregatorCost.other_destination_costs)],
                    ["Total Add. Costs", formatCurrency(aggregatorCost.total_additional_cost)],
                  ] as [string, string][]).map(([l, v]) => (
                    <Box key={l} sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}><Span sx={{ color: "text.primary" }}>{l}:</Span><Span>{v}</Span></Box>
                  ))}
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="h6">Effective Cost/kg:</Typography>
                    <Typography variant="h6" color="primary">{formatCurrency(aggregatorCost.effective_cost_per_kg)}/kg</Typography>
                  </Box>
                </CardContent></Card>
              </Grid>
              <Grid item xs={12}><Button variant="outlined" startIcon={<EditIcon />} onClick={() => setShowAggregatorCostForm(true)}>Edit</Button></Grid>
            </Grid>
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="text.primary" gutterBottom>No aggregator costs recorded.</Typography>
              <Button variant="contained" color="info" startIcon={<StorefrontIcon />} onClick={() => setShowAggregatorCostForm(true)}>Record</Button>
            </Box>
          )}
        </TabPanel>
      )}

      {/* Modals */}
      <InvestorAllocationForm open={showAllocationForm} order={order} handleClose={() => setShowAllocationForm(false)} callBack={() => { fetchOrderDetails(); fetchTradeTree(); }} />
      {showDeliveryForm && <StandaloneDeliveryRecordForm sourceOrderId={order.id} callBack={() => { setShowDeliveryForm(false); fetchOrderDetails(); fetchTradeTree(); }} handleClose={() => setShowDeliveryForm(false)} />}
      {showWeighbridgeForm && <StandaloneWeighbridgeRecordForm sourceOrderId={order.id} callBack={() => { setShowWeighbridgeForm(false); fetchOrderDetails(); fetchTradeTree(); }} handleClose={() => setShowWeighbridgeForm(false)} />}
      <AggregatorTradeCostForm open={showAggregatorCostForm} sourceOrderId={order.id} sourceOrderNumber={order.order_number} existingRecord={aggregatorCost} handleClose={() => setShowAggregatorCostForm(false)} callBack={() => { setShowAggregatorCostForm(false); fetchAggregatorCost(); fetchOrderDetails(); }} />
    </Box>
  );
};

export default SourceOrderDetails;