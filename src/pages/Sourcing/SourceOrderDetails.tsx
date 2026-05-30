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
import TradeReassignmentModal from "./TradeReassignmentModal";
import AllocationTransferModal from "./AllocationTransferModal";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import HistoryIcon from "@mui/icons-material/History";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LinkIcon from "@mui/icons-material/Link";
import PurchaseOrderPDFButton from "./PurchaseOrderPDFButton";
import { IPurchaseOrder } from "./Sourcing.interface";

interface TabPanelProps { children?: React.ReactNode; index: number; value: number; }
function TabPanel({ children, value, index }: TabPanelProps) {
  return <div role="tabpanel" hidden={value !== index}>{value === index && <Box sx={{ p: 3 }}>{children}</Box>}</div>;
}

const LOGISTICS_LABELS: Record<string, string> = {
  supplier: "Supplier Arranged", supplier_driver: "Supplier Driver",
  bennu_truck: "Bennu Truck", third_party: "Third Party", company: "Company Arranged",
};

type EmdDeductionTiming = "on_assignment" | "on_weighbridge" | "on_supplier_payment";

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
      emd_deduction_timing: "on_assignment" as EmdDeductionTiming,
      expected_return_date: "",
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
          emd_deduction_timing: values.emd_deduction_timing,
          expected_return_date: values.expected_return_date || null,
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
                onChange={e => form.setFieldValue("emd_deduction_timing", e.target.value as EmdDeductionTiming)}>
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
            {selected?.profit_agreement?.payout_type === "interest" && (
              <TextField
                label="Expected Return Date *"
                type="date"
                fullWidth
                value={form.values.expected_return_date}
                onChange={e => form.setFieldValue("expected_return_date", e.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText={`Capital + interest owed back by this date. Rate: ${selected.profit_agreement.fixed_interest_rate}% per ${selected.profit_agreement.interest_period_days} days.`}
              />
            )}
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

// ─── Link Buyer Order Dialog ─────────────────────────────────────────────────
const LinkBuyerOrderDialog: FC<{
  open: boolean;
  sourceOrderId: string;
  currentLinkedOrderId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ open, sourceOrderId, currentLinkedOrderId, onClose, onSuccess }) => {
  const [buyerOrders, setBuyerOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    setSelectedId(currentLinkedOrderId ?? "");
    setSearch("");
  }, [open, currentLinkedOrderId]);

  useEffect(() => {
    if (!open) return;
    const handle = setTimeout(() => {
      setLoading(true);
      SourcingService.getBuyerOrders({ page_size: 200, ...(search ? { search } : {}) })
        .then(r => setBuyerOrders(r.results ?? []))
        .catch(() => toast.error("Failed to load buyer orders"))
        .finally(() => setLoading(false));
    }, search ? 300 : 0);
    return () => clearTimeout(handle);
  }, [open, search]);

  const filtered = buyerOrders;

  const handleLink = async () => {
    setSubmitting(true);
    try {
      await SourcingService.linkSourceOrderToBuyerOrder(sourceOrderId, selectedId || null);
      toast.success(selectedId ? "Buyer order linked successfully" : "Buyer order link cleared");
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Failed to link buyer order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !submitting && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <LinkIcon color="secondary" />
        Link to Buyer Order
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 2 }}>
          Linking a buyer order allows you to plan which customer order this source order fulfils.
          {currentLinkedOrderId && " Currently linked to a buyer order."}
        </Alert>
        <TextField
          fullWidth size="small" label="Search buyer orders…"
          value={search} onChange={e => setSearch(e.target.value)}
          sx={{ mb: 2 }}
        />
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}><ProgressIndicator /></Box>
        ) : (
          <FormControl fullWidth>
            <InputLabel>Buyer Order</InputLabel>
            <Select
              value={selectedId}
              label="Buyer Order"
              onChange={e => setSelectedId(e.target.value)}
            >
              <MenuItem value=""><em>— None (clear link) —</em></MenuItem>
              {filtered.map(o => (
                <MenuItem key={o.id} value={o.id}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{o.order_number}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {o.buyer_name} · {o.grain_type_name} · {o.status?.toUpperCase()}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Select a buyer order to link, or choose "None" to remove the link.</FormHelperText>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        {currentLinkedOrderId && (
          <Button
            color="error"
            disabled={submitting}
            onClick={async () => {
              setSubmitting(true);
              try {
                await SourcingService.linkSourceOrderToBuyerOrder(sourceOrderId, null);
                toast.success("Buyer order link cleared");
                onSuccess();
                onClose();
              } catch (e: any) {
                toast.error(e.response?.data?.error || "Failed to clear link");
              } finally { setSubmitting(false); }
            }}
          >
            Clear Link
          </Button>
        )}
        <Button
          variant="contained"
          color="secondary"
          startIcon={<LinkIcon />}
          disabled={submitting || loading}
          onClick={handleLink}
        >
          {submitting ? "Saving…" : selectedId ? "Link Order" : "Clear Link"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Generate LPO Dialog ─────────────────────────────────────────────────────
const GenerateLPODialog: FC<{
  open: boolean;
  order: ISourceOrder;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ open, order, onClose, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [unitPrice, setUnitPrice]   = useState("");
  const [notes,     setNotes]       = useState("");
  const [payTerms,  setPayTerms]    = useState("");
  const [delivLoc,  setDelivLoc]    = useState("");
  const [delivDate, setDelivDate]   = useState("");
  const [qualSpec,  setQualSpec]    = useState("");

  useEffect(() => {
    if (!open) return;
    setUnitPrice(order.offered_price_per_kg?.toString() ?? "");
    setNotes(""); setPayTerms(""); setDelivLoc(""); setDelivDate(""); setQualSpec("");
  }, [open, order]);

  const handleSubmit = async () => {
    if (!unitPrice) { toast.error("Unit price is required."); return; }
    setSubmitting(true);
    try {
      await SourcingService.generateLPO(order.id, {
        quantity_kg:       order.quantity_kg,
        unit_price:        unitPrice,
        delivery_location: delivLoc,
        delivery_date:     delivDate,
        payment_terms:     payTerms,
        quality_spec:      qualSpec,
        notes,
        status:            "draft",
      });
      toast.success("LPO generated successfully!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to generate LPO.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <AssignmentIcon color="primary" />
        Generate LPO — {order.order_number}
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Alert severity="info" sx={{ mb: 1 }}>
            This will create an outbound Local Purchase Order (LPO) from Bennu to the supplier
            confirming the grain purchase. The LPO can be printed and handed to the supplier.
          </Alert>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth size="small" label="Quantity (kg)"
                value={order.quantity_kg ?? ""} disabled
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth size="small" label="Unit Price (UGX/kg) *"
                value={unitPrice} onChange={e => setUnitPrice(e.target.value)}
                type="number" placeholder={order.offered_price_per_kg?.toString()}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth size="small" label="Delivery Location"
                value={delivLoc} onChange={e => setDelivLoc(e.target.value)}
                placeholder="e.g. Kampala Warehouse, Plot 16 Mackinnon Road"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth size="small" label="Delivery Date"
                value={delivDate} onChange={e => setDelivDate(e.target.value)}
                placeholder="e.g. Within 14 days, 2026-06-01"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth size="small" label="Payment Terms"
                value={payTerms} onChange={e => setPayTerms(e.target.value)}
                placeholder="e.g. 50% upfront, balance on delivery"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth size="small" label="Quality Specification"
                value={qualSpec} onChange={e => setQualSpec(e.target.value)}
                placeholder="e.g. Moisture ≤ 14%, clean, free from adulteration"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth size="small" multiline rows={2} label="Notes"
                value={notes} onChange={e => setNotes(e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button
          variant="contained" color="primary"
          onClick={handleSubmit}
          disabled={submitting || !unitPrice}
          startIcon={submitting ? undefined : <AssignmentIcon />}
        >
          {submitting ? "Generating…" : "Generate LPO"}
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
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignments, setReassignments] = useState<any[]>([]);
  const [reassignmentsLoading, setReassignmentsLoading] = useState(false);
  // Cost-basis allocation transfers (Benjamin's "asset management" model)
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [transfersLoading, setTransfersLoading] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<IPurchaseOrder[]>([]);
  const [purchaseOrdersLoading, setPurchaseOrdersLoading] = useState(false);
  const [showGenerateLPO, setShowGenerateLPO] = useState(false);
  const [showLinkBuyerOrder, setShowLinkBuyerOrder] = useState(false);

  // ✅ NEW: full trade tree data for invoice/payments/deliveries tabs
  const [tradeTree, setTradeTree] = useState<any>(null);
  const [treeLoading, setTreeLoading] = useState(false);

  useTitle(order ? `Order ${order.order_number}` : "Order Details");

  useEffect(() => { if (id) fetchOrderDetails(); }, [id]);
  useEffect(() => { if (order?.trade_type === "aggregator") fetchAggregatorCost(); }, [order?.id, order?.trade_type]);
  useEffect(() => { if (id) fetchTradeTree(); }, [id]);
  useEffect(() => { if (id) fetchReassignments(); }, [id]);
  useEffect(() => { if (id) fetchPurchaseOrders(); }, [id]);
  // Refetch transfers when the trade tree resolves (we need the allocation id first)
  useEffect(() => {
    const allocId = tradeTree?.investor_allocation?.id;
    if (allocId) fetchTransfers(allocId);
    else setTransfers([]);
  }, [tradeTree?.investor_allocation?.id]);

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

  const fetchReassignments = async () => {
    if (!id) return;
    setReassignmentsLoading(true);
    try { setReassignments(await SourcingService.getTradeReassignments(id)); }
    catch { setReassignments([]); }
    finally { setReassignmentsLoading(false); }
  };

  const fetchTransfers = async (allocationId: string) => {
    setTransfersLoading(true);
    try { setTransfers(await SourcingService.getAllocationTransfers(allocationId)); }
    catch { setTransfers([]); }
    finally { setTransfersLoading(false); }
  };

  const fetchPurchaseOrders = async () => {
    if (!id) return;
    setPurchaseOrdersLoading(true);
    try { setPurchaseOrders(await SourcingService.getSourceOrderPurchaseOrders(id)); }
    catch { setPurchaseOrders([]); }
    finally { setPurchaseOrdersLoading(false); }
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

  const treeAllocation = tradeTree?.investor_allocation;
  // Allocation can be reassigned for any source order status except cancelled —
  // EXCEPT once a buyer invoice has been paid, at which point EMD has already
  // moved and reassignment would corrupt the audit trail. Backend enforces the
  // same rule; this is just to hide the button.
  const canReassign =
    order.has_investor_allocation
    && order.status !== "cancelled"
    && !order.has_paid_buyer_invoice;
  // Same gating logic as reassign — transfer is also rejected once the buyer
  // invoice has been paid, since settlement has already moved EMD.
  const canTransfer =
    !!treeAllocation
    && treeAllocation?.status === "active"
    && order.status !== "cancelled"
    && !order.has_paid_buyer_invoice;
  // Investor can be assigned to any non-draft, non-sent, non-cancelled trade
  // that hasn't yet had its invoice paid. Covers old/in-production trades
  // (in_transit, delivered) that were never assigned.
  const canAssignInvestor =
    !order.has_investor_allocation
    && !["draft", "sent", "cancelled"].includes(order.status)
    && !order.has_paid_buyer_invoice;

  const tabLabels = [
    "Order Details",
    "Supplier Info",
    `Invoice & Payments`,
    `Deliveries (${treeDeliveries.length})`,
    "Weighbridge",
    `Re-assignments (${reassignments.length})`,
    `Transfers (${transfers.length})`,
    `LPOs (${purchaseOrders.length})`,
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
        {canAssignInvestor && (
          <Button variant="contained" color="primary" startIcon={<AccountBalanceIcon />} onClick={() => setShowAllocationForm(true)}>Assign Investor</Button>
        )}
        {order.status === "accepted" && (
          <Button variant="outlined" startIcon={<LocalShippingIcon />} onClick={() => handleAction(() => SourcingService.markInTransit(id!), "Marked in transit")}>Mark In Transit</Button>
        )}
        {canReassign && (
          <Button variant="outlined" color="warning" startIcon={<SwapHorizIcon />} onClick={() => setShowReassignModal(true)}>
            Re-assign Investor
          </Button>
        )}
        {canTransfer && (
          <Button variant="outlined" color="success" startIcon={<TrendingUpIcon />} onClick={() => setShowTransferModal(true)}>
            Transfer Allocation
          </Button>
        )}
        <Button
          variant="outlined"
          color="primary"
          startIcon={<AssignmentIcon />}
          onClick={() => setShowGenerateLPO(true)}
        >
          Generate LPO
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<LinkIcon />}
          onClick={() => setShowLinkBuyerOrder(true)}
        >
          {order.planned_buyer_order ? "Change Buyer Order Link" : "Link to Buyer Order"}
        </Button>
        {["accepted", "in_transit", "sent"].includes(order.status) && <Button variant="contained" startIcon={<LocalShippingIcon />} onClick={() => setShowDeliveryForm(true)}>Record Delivery</Button>}
        {["delivered", "accepted", "in_transit"].includes(order.status) && (
          <>
            {!order.has_weighbridge && <Button variant="contained" color="primary" startIcon={<ScaleIcon />} onClick={() => setShowWeighbridgeForm(true)}>Record Weighbridge</Button>}
            {isAggregator && <Button variant={aggregatorCost ? "outlined" : "contained"} color="info" startIcon={aggregatorCost ? <EditIcon /> : <StorefrontIcon />} onClick={() => setShowAggregatorCostForm(true)}>{aggregatorCost ? "Edit Aggregator Costs" : "Record Aggregator Costs"}</Button>}
          </>
        )}
      </Box>

      {/* ── Allocation Summary Banner ─────────────────────────────────────────
          Always-visible at-a-glance snapshot of who currently owns this
          allocation and at what cost basis. Surfaces the transfer model
          per Benjamin's intent ("margin is separable from the receivable")
          and makes the spread between face value and cost basis obvious
          for downstream desk users (Maurice/Nelson). */}
      {treeAllocation && (() => {
        const face = parseFloat(treeAllocation.amount_allocated ?? "0");
        const rawCostBasis = treeAllocation.cost_basis;
        const cost = rawCostBasis != null ? parseFloat(rawCostBasis) : face;
        const spread = cost - face;
        const transferred = rawCostBasis != null && Math.abs(spread) > 0.005;
        return (
          <Box
            sx={{
              mb: 3, p: 2, borderRadius: 1,
              border: 1, borderColor: transferred ? "warning.light" : "divider",
              bgcolor: transferred ? "warning.lighter" : "action.hover",
              display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccountBalanceIcon fontSize="small" color={transferred ? "warning" : "action"} />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1 }}>
                  Current Owner
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {treeAllocation.investor_name ?? "—"}
                </Typography>
              </Box>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1 }}>
                Face Value
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatCurrency(face)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1 }}>
                Cost Basis
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: transferred ? "warning.dark" : "text.primary" }}>
                {formatCurrency(cost)}
              </Typography>
            </Box>
            {transferred && (
              <Chip
                size="small"
                color={spread < 0 ? "error" : "success"}
                label={`Spread ${spread >= 0 ? "+" : ""}${formatCurrency(spread)}`}
                sx={{ fontWeight: 700 }}
              />
            )}
            {transferred && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: "auto", maxWidth: 380 }}>
                This allocation has been transferred. At settlement the holder's margin will
                be computed as <strong>realized value − cost basis</strong>.
              </Typography>
            )}
          </Box>
        );
      })()}

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

      {/* ── Tab 8: Aggregator Costs (conditional) ──────────────────────── */}
      {isAggregator && (
        <TabPanel value={tabValue} index={8}>
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

      {/* ── Re-assignments History Tab ─────────────────────────────────── */}
      <TabPanel value={tabValue} index={5}>
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <HistoryIcon color="action" />
          <Typography variant="h6">Investor Re-assignment History</Typography>
          {canReassign && (
            <Button size="small" variant="outlined" color="warning" startIcon={<SwapHorizIcon />}
              onClick={() => setShowReassignModal(true)} sx={{ ml: "auto" }}>
              Re-assign Investor
            </Button>
          )}
        </Box>
        {reassignmentsLoading ? (
          <LinearProgress />
        ) : reassignments.length === 0 ? (
          <Alert severity="info">No investor re-assignments have been made on this trade.</Alert>
        ) : (
          <Paper variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "action.hover" }}>
                  {["#", "Ref", "From Investor", "To Investor", "Amount", "Reason", "By", "Date"].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.75rem" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {reassignments.map((r: any, i: number) => (
                  <TableRow key={r.id} hover>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "primary.main", fontFamily: "monospace" }}>
                      {r.reassignment_number}
                    </TableCell>
                    <TableCell>{r.from_investor_name ?? "—"}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{r.to_investor_name}</TableCell>
                    <TableCell>{formatCurrency(r.amount_transferred)}</TableCell>
                    <TableCell>
                      <Chip label={r.reason_display ?? r.reason} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{r.reassigned_by_name}</TableCell>
                    <TableCell>{formatDateToDDMMYYYY(r.reassigned_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
        {reassignments.length > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            {reassignments.length} re-assignment{reassignments.length !== 1 ? "s" : ""} recorded.
            Each transfer restored EMD to the outgoing investor and locked it from the incoming investor.
          </Typography>
        )}
      </TabPanel>

      {/* ── Tab 6: Allocation Transfers (cost-basis history) ───────────── */}
      <TabPanel value={tabValue} index={6}>
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <TrendingUpIcon color="success" />
          <Typography variant="h6">Allocation Transfer History</Typography>
          {canTransfer && (
            <Button size="small" variant="outlined" color="success" startIcon={<TrendingUpIcon />}
              onClick={() => setShowTransferModal(true)} sx={{ ml: "auto" }}>
              Transfer Allocation
            </Button>
          )}
        </Box>
        {!treeAllocation ? (
          <Alert severity="info">No allocation exists on this trade — nothing to transfer.</Alert>
        ) : transfersLoading ? (
          <LinearProgress />
        ) : transfers.length === 0 ? (
          <Alert severity="info">
            No cost-basis transfers yet. The current owner ({treeAllocation?.investor_name ?? "—"})
            is still the original allocator.
            {treeAllocation?.cost_basis != null && (
              <> Cost basis: <strong>{formatCurrency(parseFloat(treeAllocation.cost_basis))}</strong>.</>
            )}
          </Alert>
        ) : (
          <Paper variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "action.hover" }}>
                  {["#", "Ref", "From", "To", "Price", "Fee", "Seller Margin", "Reason", "By", "Date"].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.75rem" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {transfers.map((t: any, i: number) => {
                  const margin = parseFloat(t.from_realized_margin ?? "0");
                  return (
                    <TableRow key={t.id} hover>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "success.main", fontFamily: "monospace" }}>
                        {t.transfer_number}
                      </TableCell>
                      <TableCell>{t.from_investor_name ?? "—"}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t.to_investor_name}</TableCell>
                      <TableCell>{formatCurrency(parseFloat(t.transfer_price))}</TableCell>
                      <TableCell>{formatCurrency(parseFloat(t.transfer_fee ?? "0"))}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: margin >= 0 ? "success.main" : "error.main" }}>
                        {margin >= 0 ? "+" : ""}{formatCurrency(margin)}
                      </TableCell>
                      <TableCell>
                        <Chip label={t.reason} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{t.transferred_by_name}</TableCell>
                      <TableCell>{formatDateToDDMMYYYY(t.transferred_at)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
        )}
        {transfers.length > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            {transfers.length} cost-basis transfer{transfers.length !== 1 ? "s" : ""} recorded.
            Each row locks in the seller's realized margin at <em>transfer price − their cost basis</em>.
          </Typography>
        )}
      </TabPanel>

      {/* ── Tab 7: Purchase Orders / LPOs ──────────────────────────────── */}
      <TabPanel value={tabValue} index={7}>
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <AssignmentIcon color="primary" />
          <Typography variant="h6">Purchase Orders / LPOs</Typography>
          <Button size="small" variant="contained" color="primary" startIcon={<AssignmentIcon />}
            onClick={() => setShowGenerateLPO(true)} sx={{ ml: "auto" }}>
            Generate LPO
          </Button>
        </Box>
        {purchaseOrdersLoading ? (
          <LinearProgress />
        ) : purchaseOrders.length === 0 ? (
          <Alert severity="info">
            No LPOs generated for this order yet.{" "}
            <Button size="small" onClick={() => setShowGenerateLPO(true)}>Generate one now</Button>
          </Alert>
        ) : (
          <Paper variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "action.hover" }}>
                  {["LPO Number", "Status", "Grain Type", "Qty (kg)", "Unit Price", "Total", "Issued", ""].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.75rem" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {purchaseOrders.map((po: IPurchaseOrder) => (
                  <TableRow key={po.id} hover>
                    <TableCell sx={{ fontWeight: 600, color: "primary.main", fontFamily: "monospace" }}>
                      {po.po_number}
                    </TableCell>
                    <TableCell>
                      <Chip label={po.status_display} size="small"
                        color={po.status === "fulfilled" ? "success" : po.status === "cancelled" ? "error" : "default"}
                      />
                    </TableCell>
                    <TableCell>{po.grain_type_name}</TableCell>
                    <TableCell>{Number(po.quantity_kg).toLocaleString("en-UG")}</TableCell>
                    <TableCell>{formatCurrency(po.unit_price)}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{formatCurrency(po.total_amount)}</TableCell>
                    <TableCell>{formatDateToDDMMYYYY(po.issued_at)}</TableCell>
                    <TableCell>
                      <PurchaseOrderPDFButton po={po} compact />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </TabPanel>

      {/* ── Generate LPO Dialog ─────────────────────────────────────────── */}
      <GenerateLPODialog
        open={showGenerateLPO}
        order={order}
        onClose={() => setShowGenerateLPO(false)}
        onSuccess={() => { setShowGenerateLPO(false); fetchPurchaseOrders(); }}
      />

      {/* ── Link Buyer Order Dialog ──────────────────────────────────────── */}
      <LinkBuyerOrderDialog
        open={showLinkBuyerOrder}
        sourceOrderId={order.id}
        currentLinkedOrderId={order.planned_buyer_order ?? null}
        onClose={() => setShowLinkBuyerOrder(false)}
        onSuccess={() => { fetchOrderDetails(); fetchTradeTree(); }}
      />

      {/* Modals */}
      <InvestorAllocationForm open={showAllocationForm} order={order} handleClose={() => setShowAllocationForm(false)} callBack={() => { fetchOrderDetails(); fetchTradeTree(); }} />
      {showDeliveryForm && <StandaloneDeliveryRecordForm sourceOrderId={order.id} callBack={() => { setShowDeliveryForm(false); fetchOrderDetails(); fetchTradeTree(); }} handleClose={() => setShowDeliveryForm(false)} />}
      {showWeighbridgeForm && <StandaloneWeighbridgeRecordForm sourceOrderId={order.id} callBack={() => { setShowWeighbridgeForm(false); fetchOrderDetails(); fetchTradeTree(); }} handleClose={() => setShowWeighbridgeForm(false)} />}
      <AggregatorTradeCostForm open={showAggregatorCostForm} sourceOrderId={order.id} sourceOrderNumber={order.order_number} existingRecord={aggregatorCost} handleClose={() => setShowAggregatorCostForm(false)} callBack={() => { setShowAggregatorCostForm(false); fetchAggregatorCost(); fetchOrderDetails(); }} />
      <TradeReassignmentModal
        open={showReassignModal}
        sourceOrderId={order.id}
        orderNumber={order.order_number}
        currentInvestorName={treeAllocation?.investor_name ?? undefined}
        allocationId={treeAllocation?.id ?? ""}
        allocationAmount={parseFloat(treeAllocation?.amount_allocated ?? "0")}
        onClose={() => setShowReassignModal(false)}
        onSuccess={() => { fetchOrderDetails(); fetchTradeTree(); fetchReassignments(); }}
      />
      <AllocationTransferModal
        open={showTransferModal}
        orderNumber={order.order_number}
        allocationId={treeAllocation?.id ?? ""}
        allocationAmount={parseFloat(treeAllocation?.amount_allocated ?? "0")}
        currentCostBasis={
          treeAllocation?.cost_basis != null
            ? parseFloat(treeAllocation.cost_basis)
            : null
        }
        currentInvestorName={treeAllocation?.investor_name ?? undefined}
        onClose={() => setShowTransferModal(false)}
        onSuccess={() => {
          fetchOrderDetails();
          fetchTradeTree();
          if (treeAllocation?.id) fetchTransfers(treeAllocation.id);
        }}
      />
    </Box>
  );
};

export default SourceOrderDetails;