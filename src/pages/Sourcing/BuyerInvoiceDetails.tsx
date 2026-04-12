/**
 * BuyerInvoiceDetails.tsx
 *
 * Full detail view for a buyer invoice. Mirrors SupplierInvoiceDetails in
 * structure and adds cost breakdown panels that were previously missing:
 *   - Grain sale lines (lot, qty, price, COGS)
 *   - Selling expenses (itemised)
 *   - P&L summary (revenue, COGS, expenses, gross profit, margin %)
 *   - Buyer information panel
 *   - Payment history + record-payment dialog
 *   - PDF download
 */

import { FC, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert, Box, Button, Card, CardContent, Chip, Divider, Grid,
  LinearProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
} from "@mui/material";
import { toast } from "react-hot-toast";
import { useFormik } from "formik";
import * as Yup from "yup";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import EditIcon from "@mui/icons-material/Edit";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import useTitle from "../../hooks/useTitle";
import LoadingScreen from "../../components/LoadingScreen";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import { SourcingService } from "./Sourcing.service";
import { IBuyerInvoice, IBuyerPayment } from "./Sourcing.interface";
import {
  formatCurrency, INVOICE_STATUS_COLORS, PAYMENT_STATUS_COLORS, PAYMENT_METHOD_OPTIONS,
} from "./SourcingConstants";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import BuyerInvoicePDFButton from "./BuyerInvoicePDF";

// ─── Record Payment Dialog ────────────────────────────────────────────────────

const RecordPaymentDialog: FC<{
  open: boolean;
  invoice: IBuyerInvoice;
  handleClose: () => void;
  callBack: () => void;
}> = ({ open, invoice, handleClose, callBack }) => {
  const [loading, setLoading] = useState(false);

  const form = useFormik({
    initialValues: {
      buyer_invoice: invoice.id,
      amount: invoice.balance_due,
      method: "bank_transfer",
      reference_number: "",
      notes: "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      amount: Yup.number()
        .typeError("Must be a number")
        .positive("Must be positive")
        .max(Number(invoice.balance_due), `Max: ${formatCurrency(invoice.balance_due)}`)
        .required("Amount is required"),
      method: Yup.string().required("Payment method is required"),
      reference_number: Yup.string().required("Reference number is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await SourcingService.createBuyerPayment({
          buyer_invoice: values.buyer_invoice,
          amount: Number(values.amount),
          method: values.method as IBuyerPayment["method"],
          reference_number: values.reference_number,
          notes: values.notes,
        });
        toast.success("Payment recorded successfully");
        form.resetForm();
        callBack();
        handleClose();
      } catch (e: any) {
        toast.error(
          e.response?.data?.amount?.[0] ||
          e.response?.data?.detail ||
          "Failed to record payment"
        );
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Dialog open={open} onClose={() => !loading && handleClose()} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <PaymentIcon color="success" />
        Record Payment — {invoice.invoice_number}
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 2 }}>
          Balance due: <strong>{formatCurrency(invoice.balance_due)}</strong>
        </Alert>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Amount (UGX) *"
            type="number"
            fullWidth
            value={form.values.amount}
            onChange={e => form.setFieldValue("amount", e.target.value)}
            error={Boolean(form.touched.amount && form.errors.amount)}
            helperText={form.touched.amount && (form.errors.amount as string)}
          />
          <FormControl fullWidth>
            <InputLabel>Payment Method *</InputLabel>
            <Select
              value={form.values.method}
              label="Payment Method *"
              onChange={e => form.setFieldValue("method", e.target.value)}
            >
              {PAYMENT_METHOD_OPTIONS.map(opt => (
                <MenuItem key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Reference Number *"
            fullWidth
            value={form.values.reference_number}
            onChange={e => form.setFieldValue("reference_number", e.target.value)}
            error={Boolean(form.touched.reference_number && form.errors.reference_number)}
            helperText={form.touched.reference_number && (form.errors.reference_number as string)}
          />
          <TextField
            label="Notes"
            multiline
            rows={2}
            fullWidth
            value={form.values.notes}
            onChange={e => form.setFieldValue("notes", e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button
          variant="contained"
          color="success"
          onClick={() => form.handleSubmit()}
          disabled={loading}
          startIcon={loading ? <ProgressIndicator color="inherit" size={18} /> : <PaymentIcon />}
        >
          {loading ? "Recording..." : "Record Payment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const BuyerInvoiceDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<IBuyerInvoice | null>(null);
  const [payments, setPayments] = useState<IBuyerPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showPenaltyDialog, setShowPenaltyDialog] = useState(false);
  const [showForgivePenaltyDialog, setShowForgivePenaltyDialog] = useState(false);
  const [showCreditNoteDialog, setShowCreditNoteDialog] = useState(false);
  const [showDebitNoteDialog, setShowDebitNoteDialog] = useState(false);
  const [penaltyRate, setPenaltyRate] = useState("");
  const [forgivenessReason, setForgivenessReason] = useState("");
  const [noteAmount, setNoteAmount] = useState("");
  const [noteReason, setNoteReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useTitle(invoice ? `Invoice ${invoice.invoice_number}` : "Buyer Invoice");

  useEffect(() => { if (id) fetchData(); }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const inv = await SourcingService.getBuyerInvoiceDetails(id!);
      setInvoice(inv);
      const pResp = await SourcingService.getBuyerPayments({ buyer_invoice: id, page_size: 50 });
      setPayments(pResp.results || []);
    } catch {
      toast.error("Failed to load invoice");
      navigate("/admin/sourcing/buyer-invoices");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!invoice) return null;

  const paidPct = Number(invoice.amount_due) > 0
    ? Math.min(100, (Number(invoice.amount_paid) / Number(invoice.amount_due)) * 100)
    : 0;
  const canPay = ["issued", "partial", "overdue"].includes(invoice.status);
  const statusColor = INVOICE_STATUS_COLORS[invoice.status] ?? "default";

  // Resolve buyer detail fields safely
  const buyer = invoice.buyer_detail;
  const buyerName    = buyer?.business_name     || invoice.buyer_profile_name || invoice.buyer_name || "—";
  const buyerContact = buyer?.contact_name      || "—";
  const buyerPhone   = buyer?.phone             || "—";
  const buyerEmail   = buyer?.email             || "—";
  const buyerAddress = buyer?.address           || "—";
  const buyerDistrict   = buyer?.district       || "—";
  const buyerRegNumber  = buyer?.registration_number || "—";
  const buyerType       = buyer?.buyer_type     || "—";

  // P&L values (all returned as number by the serializer)
  const subtotal       = Number(invoice.subtotal              || 0);
  const totalCogs      = Number(invoice.total_cogs            || 0);
  const totalExpenses  = Number(invoice.total_selling_expenses|| 0);
  const grossProfit    = Number(invoice.gross_profit          || 0);
  const grossMarginPct = Number(invoice.gross_margin_pct      || 0);

  return (
    <Box pt={2} pb={4}>

      {/* ── Header ── */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 1 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/admin/sourcing/buyer-invoices")}>
          Back
        </Button>
        <ReceiptIcon color="action" sx={{ mr: 0.5 }} />
        <Typography variant="h4">{invoice.invoice_number}</Typography>
        <Chip
          label={invoice.status_display || invoice.status.toUpperCase()}
          color={statusColor}
          size="small"
          sx={{ fontWeight: 700 }}
        />
        {invoice.is_overdue && invoice.status !== "paid" && (
          <Chip label="OVERDUE" color="error" size="small" sx={{ fontWeight: 700 }} />
        )}
      </Box>

      {/* ── Action buttons ── */}
      <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {canPay && (
          <Button
            variant="contained"
            color="success"
            startIcon={<PaymentIcon />}
            onClick={() => setShowPaymentDialog(true)}
          >
            Record Payment
          </Button>
        )}
        <BuyerInvoicePDFButton invoice={invoice} size="medium" />
        {invoice.buyer_order && (
          <Button
            variant="outlined"
            onClick={() => navigate(`/admin/sourcing/buyer-orders/${invoice.buyer_order}`)}
          >
            View Order
          </Button>
        )}
        {/* ── Penalty button ── */}
        {invoice.is_overdue && invoice.status !== "paid" && invoice.status !== "cancelled" && !invoice.penalty_forgiven && (
          <Button variant="contained" color="warning" startIcon={<WarningAmberIcon />}
            onClick={() => setShowPenaltyDialog(true)}>
            Apply Penalty
          </Button>
        )}
        {/* ── Forgive Penalty button (only when a penalty exists and hasn't been forgiven) ── */}
        {Number(invoice.penalty_amount || 0) > 0 && !invoice.penalty_forgiven && invoice.status !== "cancelled" && (
          <Button variant="outlined" color="warning" startIcon={<EditIcon />}
            onClick={() => { setForgivenessReason(""); setShowForgivePenaltyDialog(true); }}>
            Forgive Penalty
          </Button>
        )}
        {/* ── NEW: Credit/Debit Note buttons ── */}
        {invoice.status !== "paid" && invoice.status !== "cancelled" && (
          <>
            <Button variant="outlined" color="success" startIcon={<NoteAddIcon />}
              onClick={() => { setNoteAmount(""); setNoteReason(""); setShowCreditNoteDialog(true); }}>
              Credit Note
            </Button>
            <Button variant="outlined" color="error" startIcon={<NoteAddIcon />}
              onClick={() => { setNoteAmount(""); setNoteReason(""); setShowDebitNoteDialog(true); }}>
              Debit Note
            </Button>
          </>
        )}
      </Box>

      {/* ── Status alerts ── */}
      {invoice.status === "paid" && (
        <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
          This invoice has been fully paid.
        </Alert>
      )}
      {invoice.status === "cancelled" && (
        <Alert severity="error" sx={{ mb: 3 }}>This invoice has been cancelled.</Alert>
      )}
      {invoice.is_overdue && invoice.status !== "paid" && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          This invoice is overdue. Due date was {formatDateToDDMMYYYY(invoice.due_date || "")}.
        </Alert>
      )}
      {invoice.penalty_forgiven && (
        <Alert severity="info" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
          Penalty forgiven{invoice.forgiven_at ? ` on ${formatDateToDDMMYYYY(invoice.forgiven_at)}` : ""}.
          {invoice.forgiveness_reason && <> Reason: <strong>{invoice.forgiveness_reason}</strong></>}
        </Alert>
      )}

      {/* ── Summary cards ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Invoice Amount", value: formatCurrency(invoice.amount_due), color: "text.primary" },
          { label: "Amount Paid",    value: formatCurrency(invoice.amount_paid), color: "success.main" },
          { label: "Balance Due",    value: formatCurrency(invoice.balance_due), color: Number(invoice.balance_due) > 0 ? "error.main" : "success.main" },
          { label: "Gross Profit",   value: formatCurrency(grossProfit), color: grossProfit >= 0 ? "success.main" : "error.main" },
          ...(Number(invoice.penalty_amount || 0) > 0 ? [{ label: "Penalty", value: formatCurrency(invoice.penalty_amount), color: "error.main" }] : []),
          ...(Number(invoice.days_overdue || 0) > 0 ? [{ label: "Days Overdue", value: `${invoice.days_overdue} days`, color: "error.main" }] : []),
        ].map(({ label, value, color }) => (
          <Grid key={label} item xs={6} sm={3}>
            <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
              <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography variant="overline" color="text.primary" display="block">
                  {label}
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ color }}>
                  {value}
                </Typography>
                {label === "Balance Due" && (
                  <LinearProgress
                    variant="determinate"
                    value={paidPct}
                    color={paidPct === 100 ? "success" : "primary"}
                    sx={{ mt: 1, height: 5, borderRadius: 3 }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Invoice Details + Buyer Info ── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>

        {/* Invoice meta */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: "1px solid #e0e0e0", height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Invoice Details</Typography>
              <Divider sx={{ mb: 2 }} />
              {([
                ["Invoice #",  invoice.invoice_number],
                ["Order #",    invoice.order_number || "—"],
                ["Hub",        invoice.hub_name || "—"],
                ["Terms",      invoice.payment_terms_days === 0 ? "On Delivery / Cash" : `Net ${invoice.payment_terms_days} days`],
                ["Issued At",  formatDateToDDMMYYYY(invoice.issued_at)],
                ["Due Date",   invoice.due_date ? formatDateToDDMMYYYY(invoice.due_date) : "—"],
                ["Paid At",    invoice.paid_at ? formatDateToDDMMYYYY(invoice.paid_at) : "—"],
              ] as [string, string][]).map(([l, v]) => (
                <Box key={l} sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <Span sx={{ fontWeight: 600, color: "text.primary" }}>{l}:</Span>
                  <Span sx={{ textAlign: "right" }}>{v}</Span>
                </Box>
              ))}
              {invoice.notes && (
                <Box sx={{ mt: 1.5 }}>
                  <Span sx={{ fontWeight: 600, color: "text.primary" }}>Notes:</Span>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{invoice.notes}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Buyer info */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: "1px solid #e0e0e0", height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Buyer Information</Typography>
              <Divider sx={{ mb: 2 }} />
              {([
                ["Business Name",  buyerName],
                ["Buyer Type",     buyerType],
                ["Contact Person", buyerContact],
                ["Phone",          buyerPhone],
                ["Email",          buyerEmail],
                ["Address",        buyerAddress],
                ["District",       buyerDistrict],
                ["Reg. Number",    buyerRegNumber],
              ] as [string, string][]).map(([l, v]) => (
                <Box key={l} sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <Span sx={{ fontWeight: 600, color: "text.primary" }}>{l}:</Span>
                  <Span sx={{ textAlign: "right", maxWidth: "60%" }}>{v}</Span>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Grain Sale Lines ── */}
      {invoice.order_lines && invoice.order_lines.length > 0 && (
        <Card elevation={0} sx={{ border: "1px solid #e0e0e0", mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Grain Sale Lines</Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    {[
                      "Lot #", "Grain Type", "Source Order",
                      "Qty (kg)", "Sale Price/kg", "Revenue (line)",
                      "COGS/kg", "COGS Total", "Line Profit",
                    ].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoice.order_lines.map(line => (
                    <TableRow key={line.id} hover>
                      <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>
                        {line.lot_number}
                      </TableCell>
                      <TableCell>{line.grain_type}</TableCell>
                      <TableCell sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                        {line.source_order_number || "—"}
                      </TableCell>
                      <TableCell>{Number(line.quantity_kg).toLocaleString()}</TableCell>
                      <TableCell>{formatCurrency(line.sale_price_per_kg)}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {formatCurrency(line.line_total)}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {formatCurrency(line.cogs_per_kg)}
                      </TableCell>
                      <TableCell sx={{ color: "warning.main" }}>
                        {formatCurrency(line.cogs_total)}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          color: Number(line.line_gross_profit) >= 0 ? "success.main" : "error.main",
                        }}
                      >
                        {formatCurrency(line.line_gross_profit)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* ── Selling Expenses + P&L Summary ── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>

        {/* Selling expenses */}
        <Grid item xs={12} md={7}>
          <Card elevation={0} sx={{ border: "1px solid #e0e0e0", height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Selling Expenses</Typography>
              <Divider sx={{ mb: 2 }} />
              {invoice.sale_expenses && invoice.sale_expenses.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "action.hover" }}>
                        {["Category", "Description", "Reference", "Amount"].map(h => (
                          <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invoice.sale_expenses.map(exp => (
                        <TableRow key={exp.id} hover>
                          <TableCell>
                            <Chip label={exp.category_display} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>{exp.description}</TableCell>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                            {exp.receipt_reference || "—"}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: "warning.main" }}>
                            {formatCurrency(exp.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">No selling expenses recorded for this order.</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* P&L Summary */}
        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ border: "1px solid #e0e0e0", height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>P&amp;L Summary</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                {[
                  { label: "Revenue (Subtotal)",   value: subtotal,      color: "text.primary",  negative: false },
                  { label: "Cost of Goods Sold",   value: totalCogs,     color: "warning.main",  negative: true  },
                  { label: "Selling Expenses",      value: totalExpenses, color: "warning.main",  negative: true  },
                ].map(({ label, value, color, negative }) => (
                  <Box
                    key={label}
                    sx={{
                      display: "flex", justifyContent: "space-between",
                      py: 1.25, borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <Span sx={{ color: "text.primary" }}>{label}</Span>
                    <Span sx={{ fontWeight: 600, color }}>
                      {negative ? `(${formatCurrency(value)})` : formatCurrency(value)}
                    </Span>
                  </Box>
                ))}

                {/* Gross Profit highlight */}
                <Box
                  sx={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    mt: 1, py: 1.5, px: 1.5, borderRadius: 1,
                    bgcolor: grossProfit >= 0 ? "#e8f5e9" : "#ffebee",
                  }}
                >
                  <Span sx={{ fontWeight: 700, color: grossProfit >= 0 ? "success.dark" : "error.dark" }}>
                    Gross Profit
                  </Span>
                  <Span sx={{ fontWeight: 800, fontSize: "1rem", color: grossProfit >= 0 ? "success.main" : "error.main" }}>
                    {formatCurrency(grossProfit)}
                  </Span>
                </Box>

                {/* Margin % */}
                <Box
                  sx={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    mt: 1, pt: 1, borderTop: "1px solid #e0e0e0",
                  }}
                >
                  <Span sx={{ color: "text.primary" }}>Gross Margin %</Span>
                  <Chip
                    label={`${grossMarginPct.toFixed(2)}%`}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      bgcolor: grossMarginPct >= 0 ? "#e8f5e9" : "#ffebee",
                      color: grossMarginPct >= 0 ? "#2e7d32" : "#c62828",
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Payment History ── */}
      <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Payment History</Typography>
          <Divider sx={{ mb: 2 }} />
          {payments.length === 0 ? (
            <Alert severity="info">No payments recorded yet.</Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    {["Payment #", "Amount", "Method", "Reference", "Status", "Date"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map(p => (
                    <TableRow
                      key={p.id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => navigate(`/admin/sourcing/buyer-payments/${p.id}`)}
                    >
                      <TableCell>
                        <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                          {p.payment_number}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(p.amount)}</TableCell>
                      <TableCell>{p.method.replace(/_/g, " ").toUpperCase()}</TableCell>
                      <TableCell sx={{ fontFamily: "monospace" }}>
                        {p.reference_number || "—"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={p.status.toUpperCase()}
                          color={PAYMENT_STATUS_COLORS[p.status] ?? "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDateToDDMMYYYY(p.payment_date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Payment dialog ── */}
      {showPaymentDialog && (
        <RecordPaymentDialog
          open={showPaymentDialog}
          invoice={invoice}
          handleClose={() => setShowPaymentDialog(false)}
          callBack={fetchData}
        />
      )}

      {/* ── Apply Penalty Dialog ── */}
      <Dialog open={showPenaltyDialog} onClose={() => setShowPenaltyDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Apply Penalty</DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            Invoice <strong>{invoice.invoice_number}</strong> is <strong>{invoice.days_overdue || 0} days</strong> overdue.
          </Typography>
          <TextField
            label="Penalty Rate (%)" type="number" fullWidth sx={{ mt: 2 }}
            value={penaltyRate} onChange={e => setPenaltyRate(e.target.value)}
            helperText={`Current rate: ${invoice.penalty_rate || 0}%. Penalty = balance × rate% × (days/${30}).`}
            inputProps={{ min: 0, step: 0.5 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPenaltyDialog(false)} disabled={actionLoading}>Cancel</Button>
          <Button variant="contained" color="warning" disabled={actionLoading} onClick={async () => {
            setActionLoading(true);
            try {
              await SourcingService.applyInvoicePenalty(invoice.id, penaltyRate ? Number(penaltyRate) : undefined);
              toast.success("Penalty applied");
              setShowPenaltyDialog(false);
              fetchData();
            } catch (e: any) { toast.error(e.response?.data?.error || "Failed"); }
            finally { setActionLoading(false); }
          }}>
            {actionLoading ? "Applying..." : "Apply Penalty"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Credit Note Dialog ── */}
      <Dialog open={showCreditNoteDialog} onClose={() => setShowCreditNoteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Issue Credit Note</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.primary" gutterBottom>
            A credit note reduces the amount owed on this invoice.
          </Typography>
          <TextField label="Amount (UGX)" type="number" fullWidth sx={{ mt: 2, mb: 2 }}
            value={noteAmount} onChange={e => setNoteAmount(e.target.value)} />
          <TextField label="Reason" multiline rows={3} fullWidth
            value={noteReason} onChange={e => setNoteReason(e.target.value)}
            placeholder="e.g. Quality deduction agreed with buyer" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreditNoteDialog(false)} disabled={actionLoading}>Cancel</Button>
          <Button variant="contained" color="success" disabled={actionLoading || !noteAmount || !noteReason} onClick={async () => {
            setActionLoading(true);
            try {
              await SourcingService.createCreditNote(invoice.id, { amount: Number(noteAmount), reason: noteReason });
              toast.success("Credit note issued — invoice amount adjusted");
              setShowCreditNoteDialog(false);
              fetchData();
            } catch (e: any) { toast.error(e.response?.data?.error || "Failed"); }
            finally { setActionLoading(false); }
          }}>
            {actionLoading ? "Issuing..." : "Issue Credit Note"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Forgive Penalty Dialog ── */}
      <Dialog open={showForgivePenaltyDialog} onClose={() => !actionLoading && setShowForgivePenaltyDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Forgive Penalty</DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            Current penalty on <strong>{invoice.invoice_number}</strong>:{" "}
            <strong style={{ color: "#d32f2f" }}>{formatCurrency(invoice.penalty_amount)}</strong>.
            This will waive the penalty and must be logged with a reason.
          </Typography>
          <TextField
            label="Reason for forgiveness *"
            multiline rows={3} fullWidth sx={{ mt: 2 }}
            value={forgivenessReason}
            onChange={e => setForgivenessReason(e.target.value)}
            placeholder="e.g. Agreed with buyer, payment delay due to bank error"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowForgivePenaltyDialog(false)} disabled={actionLoading}>Cancel</Button>
          <Button
            variant="contained" color="warning"
            disabled={actionLoading || !forgivenessReason.trim()}
            onClick={async () => {
              setActionLoading(true);
              try {
                await SourcingService.forgivePenalty(invoice.id, forgivenessReason.trim());
                toast.success("Penalty forgiven");
                setShowForgivePenaltyDialog(false);
                fetchData();
              } catch (e: any) {
                toast.error(e.response?.data?.error || e.response?.data?.reason?.[0] || "Failed to forgive penalty");
              } finally { setActionLoading(false); }
            }}
          >
            {actionLoading ? "Forgiving..." : "Forgive Penalty"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Debit Note Dialog ── */}
      <Dialog open={showDebitNoteDialog} onClose={() => setShowDebitNoteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Issue Debit Note</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.primary" gutterBottom>
            A debit note increases the amount owed on this invoice (e.g. late fees, additional charges).
          </Typography>
          <TextField label="Amount (UGX)" type="number" fullWidth sx={{ mt: 2, mb: 2 }}
            value={noteAmount} onChange={e => setNoteAmount(e.target.value)} />
          <TextField label="Reason" multiline rows={3} fullWidth
            value={noteReason} onChange={e => setNoteReason(e.target.value)}
            placeholder="e.g. Late payment penalty, additional handling charges" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDebitNoteDialog(false)} disabled={actionLoading}>Cancel</Button>
          <Button variant="contained" color="error" disabled={actionLoading || !noteAmount || !noteReason} onClick={async () => {
            setActionLoading(true);
            try {
              await SourcingService.createDebitNote(invoice.id, { amount: Number(noteAmount), reason: noteReason });
              toast.success("Debit note issued — invoice amount adjusted");
              setShowDebitNoteDialog(false);
              fetchData();
            } catch (e: any) { toast.error(e.response?.data?.error || "Failed"); }
            finally { setActionLoading(false); }
          }}>
            {actionLoading ? "Issuing..." : "Issue Debit Note"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BuyerInvoiceDetails;