/**
 * SupplierInvoiceDetails.tsx — FIXED
 *
 * FIXES:
 *  1. Supplier Information section now properly resolves nested supplier data
 *     (was showing dashes because supplier was returned as UUID in list serializer)
 *  2. Payment History now always fetches and displays all payments for this invoice
 *     (was relying on payments_list which may be empty on list-level serializer)
 *  3. PDF button preserved
 *  4. Source Order now shows readable order_number instead of UUID
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert, Box, Button, Card, CardContent, Chip, Divider, Grid,
  LinearProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText,
} from "@mui/material";
import { toast } from "react-hot-toast";
import { useFormik } from "formik";
import * as Yup from "yup";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import useTitle from "../../hooks/useTitle";
import { SourcingService } from "./Sourcing.service";
import { ISupplierInvoice, ISupplierPayment } from "./Sourcing.interface";
import {
  formatCurrency, INVOICE_STATUS_COLORS, PAYMENT_STATUS_COLORS, PAYMENT_METHOD_OPTIONS,
} from "./SourcingConstants";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import { Span } from "../../components/Typography";
import LoadingScreen from "../../components/LoadingScreen";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import SupplierInvoicePDFButton from "./SupplierInvoicePDF";

// ─── Payment Form Dialog ──────────────────────────────────────────────────────
const MakePaymentDialog: React.FC<{
  open: boolean; invoice: ISupplierInvoice; handleClose: () => void; callBack: () => void;
}> = ({ open, invoice, handleClose, callBack }) => {
  const [loading, setLoading] = useState(false);
  const form = useFormik({
    initialValues: { supplier_invoice: invoice.id, amount: invoice.balance_due, method: "mobile_money", reference_number: "", notes: "" },
    enableReinitialize: true,
    validationSchema: Yup.object({
      amount: Yup.number().typeError("Must be a number").positive().max(Number(invoice.balance_due), `Max: ${formatCurrency(invoice.balance_due)}`).required(),
      method: Yup.string().required(), reference_number: Yup.string().required("Reference required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await SourcingService.createSupplierPayment({ supplier_invoice: values.supplier_invoice, amount: Number(values.amount), method: values.method as any, reference_number: values.reference_number, notes: values.notes } as any);
        toast.success("Payment recorded"); form.resetForm(); callBack(); handleClose();
      } catch (e: any) { toast.error(e.response?.data?.amount?.[0] || "Failed"); }
      finally { setLoading(false); }
    },
  });

  return (
    <Dialog open={open} onClose={() => !loading && handleClose()} maxWidth="sm" fullWidth>
      <DialogTitle><PaymentIcon color="success" sx={{ mr: 1 }} />Record Payment — {invoice.invoice_number}</DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 2 }}>Balance due: <strong>{formatCurrency(invoice.balance_due)}</strong></Alert>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField label="Amount (UGX) *" type="number" fullWidth value={form.values.amount} onChange={e => form.setFieldValue("amount", e.target.value)} error={Boolean(form.touched.amount && form.errors.amount)} helperText={form.touched.amount && form.errors.amount as string} />
          <FormControl fullWidth><InputLabel>Payment Method *</InputLabel><Select value={form.values.method} label="Payment Method *" onChange={e => form.setFieldValue("method", e.target.value)}>{PAYMENT_METHOD_OPTIONS.map(opt => <MenuItem key={String(opt.value)} value={String(opt.value)}>{opt.label}</MenuItem>)}</Select></FormControl>
          <TextField label="Reference Number *" fullWidth value={form.values.reference_number} onChange={e => form.setFieldValue("reference_number", e.target.value)} error={Boolean(form.touched.reference_number && form.errors.reference_number)} helperText={form.touched.reference_number && form.errors.reference_number as string} />
          <TextField label="Notes" multiline rows={2} fullWidth value={form.values.notes} onChange={e => form.setFieldValue("notes", e.target.value)} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" color="success" onClick={() => form.handleSubmit()} disabled={loading} startIcon={loading ? <ProgressIndicator color="inherit" size={18} /> : <PaymentIcon />}>{loading ? "Recording..." : "Record Payment"}</Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const SupplierInvoiceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<ISupplierInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  // ✅ NEW: separately fetched payments to ensure they always show
  const [payments, setPayments] = useState<ISupplierPayment[]>([]);

  useTitle(invoice ? `Invoice ${invoice.invoice_number}` : "Invoice Details");

  useEffect(() => { if (id) fetchInvoice(); }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const data = await SourcingService.getSupplierInvoiceDetails(id!);
      setInvoice(data);
      // ✅ FIX: Also fetch payments separately to ensure they display
      try {
        const pResp = await SourcingService.getSupplierPayments({ supplier_invoice: id, page_size: 50 });
        setPayments(pResp.results || []);
      } catch {
        // Fall back to invoice's embedded payments_list
        setPayments((data as any).payments_list || []);
      }
    } catch {
      toast.error("Failed to load invoice details");
      navigate("/admin/sourcing/invoices");
    } finally { setLoading(false); }
  };

  if (loading) return <LoadingScreen />;
  if (!invoice) return null;

  const paidPct = invoice.amount_due ? Math.min(100, (Number(invoice.amount_paid) / Number(invoice.amount_due)) * 100) : 0;
  const canPay = ["pending", "partial"].includes(invoice.status);
  const statusColor = INVOICE_STATUS_COLORS[invoice.status] ?? "default";

  // ✅ FIX: Resolve supplier data from nested object
  const supplierObj = invoice.supplier as any;
  const supplierName = supplierObj?.business_name ?? invoice.supplier_name ?? "—";
  const supplierUser = supplierObj?.user_detail ?? supplierObj?.user;
  const supplierContact = supplierUser && typeof supplierUser === "object"
    ? `${supplierUser.first_name ?? ""} ${supplierUser.last_name ?? ""}`.trim()
    : "—";
  const supplierHub = supplierObj?.hub?.name ?? "—";
  const supplierVerified = supplierObj?.is_verified;
  const supplierPhone = supplierUser?.phone_number ?? "—";
  const supplierLocation = supplierObj?.farm_location ?? "—";

  // ✅ FIX: Resolve order number
  const sourceOrder = invoice.source_order as any;
  const orderNumber = sourceOrder?.order_number ?? invoice.order_number ?? sourceOrder ?? "—";

  return (
    <Box pt={2} pb={4}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 1 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/admin/sourcing/invoices")} sx={{ mr: 1 }}>Back</Button>
        <ReceiptIcon color="action" sx={{ mr: 0.5 }} />
        <Typography variant="h4">{invoice.invoice_number}</Typography>
        <Chip label={(invoice as any).status_display ?? invoice.status.toUpperCase()} color={statusColor} sx={{ ml: 1 }} />
      </Box>

      {/* Actions */}
      <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {canPay && <Button variant="contained" color="success" startIcon={<PaymentIcon />} onClick={() => setShowPaymentForm(true)}>Record Payment</Button>}
        <SupplierInvoicePDFButton invoice={invoice} isFullDetail size="medium" />
      </Box>

      {invoice.status === "paid" && <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>This invoice has been fully paid.</Alert>}
      {invoice.status === "cancelled" && <Alert severity="error" sx={{ mb: 3 }}>This invoice has been cancelled.</Alert>}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { label: "Amount Due", value: formatCurrency(invoice.amount_due), color: "text.primary" },
          { label: "Amount Paid", value: formatCurrency(invoice.amount_paid), color: "success.main" },
          { label: "Balance Due", value: formatCurrency(invoice.balance_due), color: Number(invoice.balance_due) > 0 ? "error.main" : "success.main" },
        ].map(({ label, value, color }) => (
          <Grid key={label} item xs={12} sm={6} md={3}>
            <Card><CardContent>
              <Typography color="text.primary" variant="overline" gutterBottom>{label}</Typography>
              <Typography variant="h5" fontWeight={700} color={color}>{value}</Typography>
            </CardContent></Card>
          </Grid>
        ))}
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography color="text.primary" variant="overline" gutterBottom>Payment Progress</Typography>
            <Typography variant="h5" fontWeight={700}>{paidPct.toFixed(0)}%</Typography>
            <LinearProgress variant="determinate" value={paidPct} color={paidPct === 100 ? "success" : "primary"} sx={{ mt: 1, height: 6, borderRadius: 3 }} />
          </CardContent></Card>
        </Grid>
      </Grid>

      {/* Details + Supplier */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>Invoice Details</Typography>
            <Divider sx={{ mb: 2 }} />
            {([
              ["Invoice Number", invoice.invoice_number],
              ["Source Order", orderNumber],
              ["Issued At", formatDateToDDMMYYYY(invoice.issued_at)],
              ["Due Date", invoice.due_date ? formatDateToDDMMYYYY(invoice.due_date) : "Not set"],
              ["Paid At", invoice.paid_at ? formatDateToDDMMYYYY(invoice.paid_at) : "—"],
              ["Payment Reference", invoice.payment_reference || "—"],
            ] as [string, string][]).map(([label, value]) => (
              <Box key={label} sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                <Span sx={{ fontWeight: 600, color: "text.primary" }}>{label}:</Span>
                <Span>{value}</Span>
              </Box>
            ))}
            {invoice.notes && (
              <Box sx={{ mt: 1.5 }}>
                <Span sx={{ fontWeight: 600, color: "text.primary" }}>Notes:</Span>
                <Typography variant="body2" sx={{ mt: 0.5, color: "text.primary" }}>{invoice.notes}</Typography>
              </Box>
            )}
          </CardContent></Card>
        </Grid>

        {/* ✅ FIXED: Supplier info now resolves properly */}
        <Grid item xs={12} md={6}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>Supplier Information</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
              <Span sx={{ fontWeight: 600, color: "text.primary" }}>Business Name:</Span>
              <Span>{supplierName}</Span>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
              <Span sx={{ fontWeight: 600, color: "text.primary" }}>Contact:</Span>
              <Span>{supplierContact}</Span>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
              <Span sx={{ fontWeight: 600, color: "text.primary" }}>Phone:</Span>
              <Span>{supplierPhone}</Span>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
              <Span sx={{ fontWeight: 600, color: "text.primary" }}>Hub:</Span>
              <Span>{supplierHub}</Span>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
              <Span sx={{ fontWeight: 600, color: "text.primary" }}>Location:</Span>
              <Span>{supplierLocation}</Span>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
              <Span sx={{ fontWeight: 600, color: "text.primary" }}>Verified:</Span>
              <Chip label={supplierVerified ? "Verified" : "Not Verified"} color={supplierVerified ? "success" : "warning"} size="small" />
            </Box>
          </CardContent></Card>
        </Grid>
      </Grid>

      {/* ✅ FIXED: Payment History — now always fetched + displayed */}
      <Card><CardContent>
        <Typography variant="h6" gutterBottom>Payment History</Typography>
        <Divider sx={{ mb: 2 }} />
        {payments.length === 0 ? (
          <Alert severity="info">No payments recorded yet.</Alert>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Payment #</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Method</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Reference</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment: ISupplierPayment) => (
                  <TableRow key={payment.id} hover sx={{ cursor: "pointer" }}
                    onClick={() => navigate(`/admin/sourcing/payments/${payment.id}`)}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="primary">{payment.payment_number}</Typography>
                    </TableCell>
                    <TableCell>{(payment as any).method_display || payment.method?.replace(/_/g, " ").toUpperCase() || "—"}</TableCell>
                    <TableCell><Typography variant="body2" sx={{ fontFamily: "monospace" }}>{payment.reference_number || "—"}</Typography></TableCell>
                    <TableCell align="right"><Span sx={{ fontWeight: 600 }}>{formatCurrency(payment.amount)}</Span></TableCell>
                    <TableCell>
                      <Chip label={(payment as any).status_display ?? payment.status} color={PAYMENT_STATUS_COLORS[payment.status] ?? "default"} size="small" />
                    </TableCell>
                    <TableCell>{payment.completed_at ? formatDateToDDMMYYYY(payment.completed_at) : formatDateToDDMMYYYY(payment.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent></Card>

      {/* Payment Dialog */}
      {showPaymentForm && (
        <MakePaymentDialog open={showPaymentForm} invoice={invoice} handleClose={() => setShowPaymentForm(false)} callBack={fetchInvoice} />
      )}
    </Box>
  );
};

export default SupplierInvoiceDetails;