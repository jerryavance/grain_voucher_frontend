import { FC, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert, Box, Button, Card, CardContent, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, FormControl, FormHelperText,
  Grid, IconButton, InputLabel, MenuItem, Paper, Select, Tab, Tabs,
  Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import LaunchIcon from "@mui/icons-material/Launch";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LoadingScreen from "../../components/LoadingScreen";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import useTitle from "../../hooks/useTitle";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import { SourcingService } from "./Sourcing.service";
import { formatCurrency, formatWeight } from "./SourcingConstants";
import { IBuyerOrder, IBuyerOrderLine, ISaleLot, ISaleExpense, IProformaInvoice } from "./Sourcing.interface";

const BUYER_ORDER_STATUS_COLORS: Record<string, any> = {
  quotation: "info", draft: "default", confirmed: "primary", dispatched: "warning",
  delivered: "info", invoiced: "secondary", completed: "success", cancelled: "error",
};
const PAYMENT_TYPE_COLORS: Record<string, any> = { cash: "success", financed: "secondary" };
const PFI_STATUS_COLORS: Record<string, any> = {
  draft: "default", sent: "primary", accepted: "success", rejected: "error", expired: "warning",
};
const BUYER_INVOICE_STATUS_COLORS: Record<string, any> = {
  draft: "default", issued: "primary", partial: "warning",
  paid: "success", overdue: "error", cancelled: "error",
};
const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  logistics: "Logistics", storage: "Storage", grading: "Grading",
  handling: "Handling", insurance: "Insurance", finance: "Finance", other: "Other",
};

const InfoRow: FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
    <Span sx={{ fontWeight: 600, color: "text.primary", minWidth: 180 }}>{label}</Span>
    <Box>{value}</Box>
  </Box>
);

// ─── Currency helper (trade-currency-aware) ──────────────────────────────────
const fmtTrade = (val: number | string | null | undefined, currency = "UGX"): string => {
  const n = Number(val || 0);
  if (currency === "UGX") return formatCurrency(n);
  return `${currency} ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const fmtUGX = (val: number | string | null | undefined): string => formatCurrency(val);

// ─── Add Line Form ──────────────────────────────────────────────────────────
const AddLineForm: FC<{
  open: boolean;
  orderId: string;
  order: IBuyerOrder | null;
  availableLots: ISaleLot[];
  handleClose: () => void;
  callBack?: () => void;
}> = ({ open, orderId, order, availableLots, handleClose, callBack }) => {
  const [loading, setLoading] = useState(false);

  // ── Trade context from the buyer order ──────────────────────────────────
  const currency     = order?.currency           || "UGX";
  const exchangeRate = order?.exchange_rate_to_ugx || null;
  const isMT         = (order?.trade_unit        || "kg") === "tonne";
  const unitLabel    = isMT ? "MT" : "kg";
  const isNonUGX     = currency !== "UGX";

  const form = useFormik({
    initialValues: { sale_lot: "", quantity_kg: "", sale_price_per_kg: "", notes: "" },
    validationSchema: Yup.object({
      sale_lot: Yup.string().required("Select a lot"),
      quantity_kg: Yup.number().positive().required("Quantity required"),
      sale_price_per_kg: Yup.number().positive().required("Price required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      // If trade_unit is MT, user entered qty in MT and price per MT — convert to kg-based for API.
      // Round to 6dp to eliminate JavaScript floating point errors (e.g. 1370/1000*1000=1369.9998...)
      const enteredQty   = Number(values.quantity_kg);
      const enteredPrice = Number(values.sale_price_per_kg);
      const payload = {
        ...values,
        quantity_kg:       isMT ? Math.round(enteredQty * 1000 * 1e6) / 1e6 : enteredQty,
        sale_price_per_kg: isMT ? Math.round(enteredPrice / 1000 * 1e6) / 1e6 : enteredPrice,
      };
      try {
        await SourcingService.addBuyerOrderLine(orderId, payload as any);
        toast.success("Line added");
        form.resetForm();
        callBack?.();
        handleClose();
      } catch (e: any) {
        toast.error(
          e?.response?.data?.quantity_kg?.[0] ||
          e?.response?.data?.sale_lot?.[0] ||
          "Failed to add line"
        );
      } finally { setLoading(false); }
    },
  });

  const selectedLot = availableLots.find(l => l.id === form.values.sale_lot);

  // Live estimation — always compute in base units (kg) then convert for display
  const enteredQty   = Number(form.values.quantity_kg   || 0);
  const enteredPrice = Number(form.values.sale_price_per_kg || 0);
  // Convert entered values to kg-based for calculation
  const qtyKg      = isMT ? enteredQty * 1000   : enteredQty;
  const pricePerKg = isMT ? enteredPrice / 1000 : enteredPrice;

  // Revenue in trade currency (qty_kg × price_per_kg)
  const estRevenueTrade = qtyKg * pricePerKg;
  // Revenue converted to UGX for profit comparison
  const estRevenueUGX   = isNonUGX && exchangeRate
    ? estRevenueTrade * exchangeRate
    : estRevenueTrade;
  // COGS always in UGX
  const estCOGS   = selectedLot ? qtyKg * Number(selectedLot.cost_per_kg) : 0;
  // Gross profit always in UGX
  const estProfit = estRevenueUGX - estCOGS;

  const onClose = () => {
    form.resetForm();
    handleClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Sale Line</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <FormControl fullWidth error={Boolean(form.touched.sale_lot && form.errors.sale_lot)}>
            <InputLabel>Sale Lot *</InputLabel>
            <Select
              value={form.values.sale_lot}
              label="Sale Lot *"
              onChange={e => form.setFieldValue("sale_lot", e.target.value)}
            >
              {availableLots.filter(l => l.status !== "sold").map(l => (
                <MenuItem key={l.id} value={l.id}>
                  {l.lot_number} — {l.grain_type_name} — {formatWeight(l.available_quantity_kg)} avail — cost {formatCurrency(l.cost_per_kg)}/kg
                </MenuItem>
              ))}
            </Select>
            {form.touched.sale_lot && form.errors.sale_lot && (
              <FormHelperText>{form.errors.sale_lot as string}</FormHelperText>
            )}
            {availableLots.filter(l => l.status !== "sold").length === 0 && (
              <FormHelperText error>No available lots found. Create a sale lot first.</FormHelperText>
            )}
          </FormControl>

          {selectedLot && (
            <Alert severity="info">
              Available: <strong>{isMT
                ? `${(Number(selectedLot.available_quantity_kg) / 1000).toFixed(4)} MT`
                : formatWeight(selectedLot.available_quantity_kg)
              }</strong>
              {" | "}COGS basis: <strong>{fmtUGX(selectedLot.cost_per_kg)}/kg (UGX)</strong>
            </Alert>
          )}

          {isNonUGX && !exchangeRate && (
            <Alert severity="warning">
              No exchange rate set on this order — profit estimate will be inaccurate. Edit the buyer order to add the exchange rate.
            </Alert>
          )}

          <TextField
            fullWidth label={`Quantity (${unitLabel}) *`} type="number"
            value={form.values.quantity_kg}
            onChange={e => form.setFieldValue("quantity_kg", e.target.value)}
            error={Boolean(form.touched.quantity_kg && form.errors.quantity_kg)}
            helperText={(form.touched.quantity_kg && form.errors.quantity_kg as string) ||
              (isMT ? "Enter quantity in Metric Tonnes" : "Enter quantity in kg")}
          />

          <TextField
            fullWidth label={`Selling Price per ${unitLabel} (${currency}) *`} type="number"
            value={form.values.sale_price_per_kg}
            onChange={e => form.setFieldValue("sale_price_per_kg", e.target.value)}
            error={Boolean(form.touched.sale_price_per_kg && form.errors.sale_price_per_kg)}
            helperText={(form.touched.sale_price_per_kg && form.errors.sale_price_per_kg as string) ||
              `Price per ${unitLabel} in ${currency}`}
            inputProps={{ step: "0.0001" }}
          />

          {estRevenueTrade > 0 && (
            <Card variant="outlined">
              <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography variant="caption" color="text.primary" display="block" gutterBottom>
                  Live Estimate
                </Typography>
                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  <Box>
                    <Typography variant="caption">
                      Revenue ({currency})
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>
                      {fmtTrade(estRevenueTrade, currency)}
                    </Typography>
                    {isNonUGX && exchangeRate && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        ≈ {fmtUGX(estRevenueUGX)} UGX
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    <Typography variant="caption">COGS (UGX)</Typography>
                    <Typography variant="body2" sx={{ color: "text.primary" }}>
                      {fmtUGX(estCOGS)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption">Gross Profit (UGX)</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: estProfit >= 0 ? "success.main" : "error.main" }}>
                      {fmtUGX(estProfit)}
                    </Typography>
                  </Box>
                </Box>
                {isNonUGX && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, opacity: 0.7 }}>
                    Revenue converted to UGX using rate {exchangeRate ? `1 ${currency} = UGX ${Number(exchangeRate).toLocaleString()}` : "(no rate set)"} for profit calculation.
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}

          <TextField
            fullWidth label="Notes" multiline rows={2}
            value={form.values.notes}
            onChange={e => form.setFieldValue("notes", e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" onClick={() => form.handleSubmit()} disabled={loading}>
          {loading ? <ProgressIndicator color="inherit" size={20} /> : "Add Line"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Add Expense Form ───────────────────────────────────────────────────────
const AddExpenseForm: FC<{
  open: boolean;
  orderId: string;
  handleClose: () => void;
  callBack?: () => void;
}> = ({ open, orderId, handleClose, callBack }) => {
  const [loading, setLoading] = useState(false);

  const form = useFormik({
    initialValues: { category: "logistics", description: "", amount: "", receipt_reference: "", notes: "" },
    validationSchema: Yup.object({
      description: Yup.string().required("Description required"),
      amount: Yup.number().positive().required("Amount required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await SourcingService.addSaleExpense(orderId, values as any);
        toast.success("Expense added");
        form.resetForm();
        callBack?.();
        handleClose();
      } catch { toast.error("Failed to add expense"); }
      finally { setLoading(false); }
    },
  });

  const onClose = () => {
    form.resetForm();
    handleClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Selling Expense</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Category *</InputLabel>
            <Select
              value={form.values.category}
              label="Category *"
              onChange={e => form.setFieldValue("category", e.target.value)}
            >
              {Object.entries(EXPENSE_CATEGORY_LABELS).map(([v, l]) => (
                <MenuItem key={v} value={v}>{l}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth label="Description *"
            value={form.values.description}
            onChange={e => form.setFieldValue("description", e.target.value)}
            error={Boolean(form.touched.description && form.errors.description)}
            helperText={form.touched.description && form.errors.description as string}
          />

          <TextField
            fullWidth label="Amount (UGX) *" type="number"
            value={form.values.amount}
            onChange={e => form.setFieldValue("amount", e.target.value)}
            error={Boolean(form.touched.amount && form.errors.amount)}
            helperText={form.touched.amount && form.errors.amount as string}
          />

          <TextField
            fullWidth label="Receipt Reference"
            value={form.values.receipt_reference}
            onChange={e => form.setFieldValue("receipt_reference", e.target.value)}
          />

          <TextField
            fullWidth label="Notes" multiline rows={2}
            value={form.values.notes}
            onChange={e => form.setFieldValue("notes", e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" onClick={() => form.handleSubmit()} disabled={loading}>
          {loading ? <ProgressIndicator color="inherit" size={20} /> : "Add Expense"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Issue Invoice Form ─────────────────────────────────────────────────────
const IssueInvoiceForm: FC<{
  open: boolean;
  order: IBuyerOrder;
  handleClose: () => void;
  callBack?: () => void;
}> = ({ open, order, handleClose, callBack }) => {
  const [loading, setLoading] = useState(false);
  const [terms, setTerms] = useState(order.credit_terms_days);
  const [notes, setNotes] = useState("");

  const onClose = () => {
    setTerms(order.credit_terms_days);
    setNotes("");
    handleClose();
  };

  const handleIssue = async () => {
    setLoading(true);
    try {
      const inv = await SourcingService.issueBuyerInvoice(order.id, { payment_terms_days: terms, notes });
      toast.success(`Invoice ${inv.invoice_number} issued`);
      callBack?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to issue invoice");
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Issue Buyer Invoice</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Alert severity="info">
            <strong>Invoice Amount: {formatCurrency(order.subtotal)}</strong><br />
            This creates a receivable for the buyer.
          </Alert>
          <TextField
            fullWidth label="Payment Terms (Days)" type="number"
            value={terms}
            onChange={e => setTerms(parseInt(e.target.value) || 0)}
            helperText="0 = immediate, 30 / 60 / 90 = net terms"
          />
          <TextField
            fullWidth label="Notes" multiline rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          variant="contained" color="secondary"
          startIcon={loading ? undefined : <ReceiptIcon />}
          disabled={loading}
          onClick={handleIssue}
        >
          {loading ? <ProgressIndicator color="inherit" size={20} /> : "Issue Invoice"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────────
const BuyerOrderDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<IBuyerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [showAddLine, setShowAddLine] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showIssueInvoice, setShowIssueInvoice] = useState(false);
  const [showCreatePFI, setShowCreatePFI] = useState(false);
  const [availableLots, setAvailableLots] = useState<ISaleLot[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [linkedSourceOrders, setLinkedSourceOrders] = useState<string[]>([]);
  const [pfis, setPfis] = useState<IProformaInvoice[]>([]);
  const [pfiActionLoading, setPfiActionLoading] = useState(false);

  useTitle(order ? `Order ${order.order_number}` : "Buyer Order");

  useEffect(() => {
    fetchOrder();
    SourcingService.getAvailableSaleLots().then(setAvailableLots).catch(() => {});
    if (id) {
      SourcingService.getLinkedSourceOrders(id).then((data: any[]) => {
        setLinkedSourceOrders(data.map((so: any) => so.order_number));
      }).catch(() => {});
      SourcingService.getProformaInvoices({ buyer_order: id, page_size: 50 })
        .then(r => setPfis(r.results || []))
        .catch(() => {});
    }
  }, [id]);

  const fetchPFIs = () => {
    if (id) SourcingService.getProformaInvoices({ buyer_order: id, page_size: 50 })
      .then(r => setPfis(r.results || [])).catch(() => {});
  };

  const handlePFIAction = async (pfiId: string, action: "send" | "accept" | "reject" | "expire") => {
    setPfiActionLoading(true);
    try {
      if (action === "send") await SourcingService.sendProformaInvoice(pfiId);
      else if (action === "accept") await SourcingService.acceptProformaInvoice(pfiId);
      else if (action === "reject") await SourcingService.rejectProformaInvoice(pfiId);
      else if (action === "expire") await SourcingService.expireProformaInvoice(pfiId);
      toast.success(`PFI ${action}ed`);
      fetchPFIs();
      fetchOrder();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || `Failed to ${action} PFI`);
    } finally { setPfiActionLoading(false); }
  };

  const fetchOrder = async () => {
    setLoading(true);
    try { setOrder(await SourcingService.getBuyerOrderDetails(id!)); }
    catch { toast.error("Failed to load order"); navigate("/admin/sourcing/buyer-orders"); }
    finally { setLoading(false); }
  };

  const handleAction = async (action: string) => {
    setActionLoading(true);
    try {
      if (action === "confirm") await SourcingService.confirmBuyerOrder(id!);
      else if (action === "dispatch") await SourcingService.dispatchBuyerOrder(id!);
      else if (action === "deliver") await SourcingService.deliverBuyerOrder(id!);
      else if (action === "cancel") await SourcingService.cancelBuyerOrder(id!);
      toast.success("Order updated");
      fetchOrder();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Action failed");
    } finally { setActionLoading(false); }
  };

  const handleRemoveLine = async (lineId: string) => {
    if (!window.confirm("Remove this line?")) return;
    try {
      await SourcingService.removeBuyerOrderLine(id!, lineId);
      toast.success("Line removed");
      fetchOrder();
    } catch { toast.error("Failed to remove line"); }
  };

  if (loading) return <LoadingScreen />;
  if (!order) return null;

  const grossMarginPct = order.subtotal > 0
    ? (order.gross_profit / order.subtotal * 100).toFixed(1)
    : "0.0";

  const buyerDisplayName = order.buyer_detail?.business_name || order.buyer_name;

  return (
    <Box pt={2} pb={4}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 1 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/admin/sourcing/buyer-orders")} sx={{ mr: 1 }}>
          Back
        </Button>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{order.order_number}</Typography>
            <Chip label={order.status.toUpperCase()} color={BUYER_ORDER_STATUS_COLORS[order.status]} />
            <Chip
              label={(order.payment_type_display || order.payment_type || "").toUpperCase()}
              color={PAYMENT_TYPE_COLORS[order.payment_type] ?? "default"}
              size="small" variant="outlined"
            />
            {order.invoice_status && (
              <Chip
                label={`Invoice: ${order.invoice_status.toUpperCase()}`}
                color={BUYER_INVOICE_STATUS_COLORS[order.invoice_status]}
                variant="outlined"
              />
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
            <Typography variant="body2" color="text.primary">Buyer:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{buyerDisplayName}</Typography>
            {order.buyer && (
              <Button
                size="small" startIcon={<LaunchIcon sx={{ fontSize: 14 }} />}
                sx={{ fontSize: 12, py: 0, minHeight: 0 }}
                onClick={() => navigate(`/admin/sourcing/buyers/${order.buyer}`)}
              >
                View Profile
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        {/* Quotation state — create PFI to send to buyer */}
        {order.status === "quotation" && (
          <>
            <Button
              variant="contained" color="primary" startIcon={<ReceiptIcon />}
              onClick={() => navigate(`/admin/sourcing/proforma-invoices?buyer_order=${order.id}`)}
            >
              Create PFI
            </Button>
            <Button
              variant="outlined" color="error"
              onClick={() => { if (window.confirm("Cancel this order?")) handleAction("cancel"); }}
              disabled={actionLoading}
            >
              Cancel Order
            </Button>
          </>
        )}
        {order.status === "draft" && (
          <>
            <Button
              variant="contained" color="success" startIcon={<CheckCircleIcon />}
              onClick={() => handleAction("confirm")}
              disabled={actionLoading || order.lines.length === 0}
            >
              Confirm Order
            </Button>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setShowAddLine(true)}>
              Add Line
            </Button>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setShowAddExpense(true)}>
              Add Expense
            </Button>
            <Button
              variant="outlined" color="error"
              onClick={() => { if (window.confirm("Cancel this order?")) handleAction("cancel"); }}
              disabled={actionLoading}
            >
              Cancel Order
            </Button>
          </>
        )}
        {["confirmed", "dispatched", "delivered"].includes(order.status) && (
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setShowAddExpense(true)}>
            Add Expense
          </Button>
        )}
        {order.status === "confirmed" && (
          <Button
            variant="contained" color="warning" startIcon={<LocalShippingIcon />}
            onClick={() => handleAction("dispatch")} disabled={actionLoading}
          >
            Mark Dispatched
          </Button>
        )}
        {order.status === "dispatched" && (
          <Button
            variant="contained" color="info"
            onClick={() => handleAction("deliver")} disabled={actionLoading}
          >
            Mark Delivered
          </Button>
        )}
        {["confirmed", "dispatched", "delivered"].includes(order.status) && !order.invoice_status && (
          <Button
            variant="contained" color="secondary" startIcon={<ReceiptIcon />}
            onClick={() => setShowIssueInvoice(true)}
          >
            Issue Invoice
          </Button>
        )}
      </Box>

      {/* Linked Source Orders */}
      {linkedSourceOrders.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>Linked Source Orders:</strong>{" "}
          {linkedSourceOrders.map((so, i) => (
            <Chip key={so} label={so} size="small" color="primary" variant="outlined"
              onClick={() => navigate(`/admin/sourcing/orders/${so}`)}
              sx={{ ml: 0.5, cursor: "pointer" }} />
          ))}
          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
            These are the source orders that supplied the grain in this buyer order.
          </Typography>
        </Alert>
      )}

      {/* P&L Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: `Revenue (${order.currency || "UGX"})`, value: fmtTrade(order.subtotal, order.currency || "UGX"), color: "primary.main" },
          { label: "COGS (UGX)", value: fmtUGX(order.total_cogs), color: "text.primary" },
          { label: "Selling Expenses (UGX)", value: fmtUGX(order.total_selling_expenses), color: "warning.main" },
          {
            label: "Gross Profit (UGX)",
            value: fmtUGX(order.gross_profit),
            color: order.gross_profit >= 0 ? "success.main" : "error.main",
          },
          {
            label: "Gross Margin",
            value: `${grossMarginPct}%`,
            color: parseFloat(grossMarginPct) >= 5 ? "success.main" : "warning.main",
          },
        ].map(card => (
          <Grid item xs={6} sm={4} md={2.4} key={card.label}>
            <Card variant="outlined">
              <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography variant="caption" color="text.primary">{card.label}</Typography>
                <Typography variant="h6" sx={{ color: card.color, fontWeight: 700 }}>{card.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}>
        <Tab label={`Lines (${order.lines.length})`} />
        <Tab label={`Expenses (${order.sale_expenses.length})`} />
        <Tab label="Order Info" />
        <Tab label={`PFIs (${pfis.length})`} />
      </Tabs>

      {/* Lines Tab */}
      {tab === 0 && (() => {
        // Trade context for the lines table
        const orderCurrency = order.currency || "UGX";
        const orderIsMT     = (order.trade_unit || "kg") === "tonne";
        const orderUnitLbl  = orderIsMT ? "MT" : "kg";
        // Display quantity in the order's trade unit
        const fmtQtyDisplay = (kgVal: number | string) => {
          const kg = Number(kgVal || 0);
          return orderIsMT
            ? `${(kg / 1000).toLocaleString("en-UG", { minimumFractionDigits: 4, maximumFractionDigits: 4 })} MT`
            : formatWeight(kg);
        };
        // Display per-unit price in trade currency (convert per-kg → per-MT if needed)
        const fmtPricePerUnit = (pricePerKg: number | string) => {
          const p = Number(pricePerKg || 0);
          const display = orderIsMT ? p * 1000 : p;
          return fmtTrade(display, orderCurrency);
        };
        return (
        <Paper variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                {[
                  "Lot #", "Grain",
                  `Qty (${orderUnitLbl})`,
                  `Price/${orderUnitLbl} (${orderCurrency})`,
                  `Revenue (${orderCurrency})`,
                  "COGS/kg (UGX)", "COGS (UGX)", "Profit (UGX)", ""
                ].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {order.lines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: "center", py: 3, color: "text.primary" }}>
                    No lines added yet. Add lot lines to include grain in this order.
                  </TableCell>
                </TableRow>
              ) : order.lines.map((line: IBuyerOrderLine) => (
                <TableRow key={line.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: "monospace" }}>{line.lot_number}</Typography>
                  </TableCell>
                  <TableCell>{line.grain_type}</TableCell>
                  <TableCell>{fmtQtyDisplay(line.quantity_kg)}</TableCell>
                  <TableCell>{fmtPricePerUnit(line.sale_price_per_kg)}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{fmtTrade(line.line_total, orderCurrency)}</TableCell>
                  <TableCell sx={{ color: "text.primary" }}>{fmtUGX(line.cogs_per_kg)}</TableCell>
                  <TableCell sx={{ color: "text.primary" }}>{fmtUGX(line.cogs_total)}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: line.line_gross_profit >= 0 ? "success.main" : "error.main" }}>
                    {fmtUGX(line.line_gross_profit)}
                  </TableCell>
                  <TableCell>
                    {order.status === "draft" && (
                      <IconButton size="small" color="error" onClick={() => handleRemoveLine(line.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
        );
      })()}

      {/* Expenses Tab */}
      {tab === 1 && (
        <Paper variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                {["Category", "Description", "Amount", "Date", "Receipt Ref"].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {order.sale_expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: "center", py: 3, color: "text.primary" }}>
                    No expenses recorded.
                  </TableCell>
                </TableRow>
              ) : order.sale_expenses.map((exp: ISaleExpense) => (
                <TableRow key={exp.id} hover>
                  <TableCell>
                    <Chip label={EXPENSE_CATEGORY_LABELS[exp.category] || exp.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{exp.description}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "warning.main" }}>{formatCurrency(exp.amount)}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{formatDateToDDMMYYYY(exp.incurred_at)}</TableCell>
                  <TableCell sx={{ fontSize: 12, fontFamily: "monospace" }}>{exp.receipt_reference || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Order Info Tab */}
      {tab === 2 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Buyer Details</Typography>
                <Divider sx={{ mb: 2 }} />
                <InfoRow label="Buyer Name" value={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <span>{buyerDisplayName}</span>
                    {order.buyer && (
                      <Button
                        size="small" variant="outlined" startIcon={<LaunchIcon sx={{ fontSize: 12 }} />}
                        sx={{ fontSize: 11, py: 0.2, px: 1, minHeight: 0 }}
                        onClick={() => navigate(`/admin/sourcing/buyers/${order.buyer}`)}
                      >
                        Profile
                      </Button>
                    )}
                  </Box>
                } />
                {order.buyer_detail && (
                  <>
                    <InfoRow label="Buyer Type" value={order.buyer_detail.buyer_type_display} />
                    <InfoRow label="Phone" value={order.buyer_detail.phone} />
                    {order.buyer_detail.email && <InfoRow label="Email" value={order.buyer_detail.email} />}
                    <InfoRow label="Outstanding AR" value={
                      <Span sx={{ fontWeight: 700, color: order.buyer_detail.outstanding_balance > 0 ? "error.main" : "success.main" }}>
                        {formatCurrency(order.buyer_detail.outstanding_balance)}
                      </Span>
                    } />
                  </>
                )}
                {!order.buyer_detail && (
                  <>
                    {order.buyer_contact_name && <InfoRow label="Contact Person" value={order.buyer_contact_name} />}
                    {order.buyer_phone && <InfoRow label="Phone" value={order.buyer_phone} />}
                    {order.buyer_email && <InfoRow label="Email" value={order.buyer_email} />}
                    {order.buyer_address && <InfoRow label="Address" value={order.buyer_address} />}
                  </>
                )}
                <InfoRow
                  label="Credit Terms"
                  value={order.credit_terms_days === 0 ? "Cash on Delivery" : `Net ${order.credit_terms_days} days`}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Timeline</Typography>
                <Divider sx={{ mb: 2 }} />
                <InfoRow label="Created" value={formatDateToDDMMYYYY(order.created_at)} />
                {order.confirmed_at && <InfoRow label="Confirmed" value={formatDateToDDMMYYYY(order.confirmed_at)} />}
                {order.dispatched_at && <InfoRow label="Dispatched" value={formatDateToDDMMYYYY(order.dispatched_at)} />}
                {order.delivered_at && <InfoRow label="Delivered" value={formatDateToDDMMYYYY(order.delivered_at)} />}
                {order.completed_at && <InfoRow label="Completed" value={formatDateToDDMMYYYY(order.completed_at)} />}
                <Divider sx={{ my: 1 }} />
                <InfoRow label="Hub" value={order.hub_name} />
              </CardContent>
            </Card>
          </Grid>
          {order.notes && (
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Notes</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography>{order.notes}</Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* PFI Tab */}
      {tab === 3 && (
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">Proforma Invoices</Typography>
            {["quotation", "draft"].includes(order.status) && (
              <Button
                variant="contained" size="small" startIcon={<AddIcon />}
                onClick={() => navigate(`/admin/sourcing/proforma-invoices?buyer_order=${order.id}`)}
              >
                New PFI
              </Button>
            )}
          </Box>
          {pfis.length === 0 ? (
            <Alert severity="info">No proforma invoices for this order yet.</Alert>
          ) : (
            <Paper variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    {["PFI #", "Grain", "Qty (kg)", "Unit Price", "Sub-total", "Status", "Sent At", "Actions"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pfis.map(pfi => (
                    <TableRow key={pfi.id} hover>
                      <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>{pfi.pfi_number}</TableCell>
                      <TableCell>{pfi.grain_type_name}</TableCell>
                      <TableCell>{Number(pfi.quantity_kg).toLocaleString()}</TableCell>
                      <TableCell>{formatCurrency(pfi.unit_price)}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(pfi.sub_total)}</TableCell>
                      <TableCell>
                        <Chip label={pfi.status_display} color={PFI_STATUS_COLORS[pfi.status]} size="small" />
                      </TableCell>
                      <TableCell>{pfi.sent_at ? formatDateToDDMMYYYY(pfi.sent_at) : "—"}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          {pfi.status === "draft" && (
                            <Button size="small" variant="outlined"
                              disabled={pfiActionLoading}
                              onClick={() => handlePFIAction(pfi.id, "send")}>
                              Send
                            </Button>
                          )}
                          {pfi.status === "sent" && (
                            <>
                              <Button size="small" variant="contained" color="success"
                                disabled={pfiActionLoading}
                                onClick={() => handlePFIAction(pfi.id, "accept")}>
                                Accept
                              </Button>
                              <Button size="small" variant="outlined" color="error"
                                disabled={pfiActionLoading}
                                onClick={() => handlePFIAction(pfi.id, "reject")}>
                                Reject
                              </Button>
                            </>
                          )}
                          {["draft", "sent"].includes(pfi.status) && (
                            <Button size="small" variant="outlined" color="warning"
                              disabled={pfiActionLoading}
                              onClick={() => handlePFIAction(pfi.id, "expire")}>
                              Expire
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}
        </Box>
      )}

      {/* ── Dialogs — always mounted, controlled by open prop ── */}
      <AddLineForm
        open={showAddLine}
        orderId={id!}
        order={order}
        availableLots={availableLots}
        handleClose={() => setShowAddLine(false)}
        callBack={fetchOrder}
      />
      <AddExpenseForm
        open={showAddExpense}
        orderId={id!}
        handleClose={() => setShowAddExpense(false)}
        callBack={fetchOrder}
      />
      {order && (
        <IssueInvoiceForm
          open={showIssueInvoice}
          order={order}
          handleClose={() => setShowIssueInvoice(false)}
          callBack={() => { setShowIssueInvoice(false); fetchOrder(); }}
        />
      )}
    </Box>
  );
};

export default BuyerOrderDetails;