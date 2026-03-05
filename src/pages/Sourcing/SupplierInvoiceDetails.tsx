/**
 * SupplierInvoiceDetails.tsx  (updated — added PDF download)
 *
 * Changes from original:
 *   - Import SupplierInvoicePDFButton
 *   - Pass isFullDetail={true} since we already have the complete invoice object
 *   - Button placed in the action bar next to "Record Payment"
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, Grid, Chip, Button, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, LinearProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControl, InputLabel, Select, MenuItem,
  FormHelperText,
} from "@mui/material";
import { toast } from "react-hot-toast";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useFormik } from "formik";
import * as Yup from "yup";
import useTitle from "../../hooks/useTitle";
import { SourcingService } from "./Sourcing.service";
import { ISupplierInvoice, ISupplierPayment } from "./Sourcing.interface";
import {
  formatCurrency,
  INVOICE_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_METHOD_OPTIONS,
} from "./SourcingConstants";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import { Span } from "../../components/Typography";
import LoadingScreen from "../../components/LoadingScreen";
import ProgressIndicator from "../../components/UI/ProgressIndicator";

// ✅ NEW: PDF download button
import SupplierInvoicePDFButton from "./SupplierInvoicePDF";

// ─── Payment Form Dialog ──────────────────────────────────────────────────────
const MakePaymentDialog: React.FC<{
  open: boolean;
  invoice: ISupplierInvoice;
  handleClose: () => void;
  callBack: () => void;
}> = ({ open, invoice, handleClose, callBack }) => {
  const [loading, setLoading] = useState(false);

  const form = useFormik({
    initialValues: {
      supplier_invoice: invoice.id,
      amount: invoice.balance_due,
      method: "mobile_money",
      reference_number: "",
      notes: "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      amount: Yup.number()
        .typeError("Must be a number")
        .positive("Must be positive")
        .max(Number(invoice.balance_due), `Cannot exceed balance due: ${formatCurrency(invoice.balance_due)}`)
        .required("Amount is required"),
      method: Yup.string().required("Payment method is required"),
      reference_number: Yup.string().required("Reference number is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await SourcingService.createSupplierPayment({
          supplier_invoice: values.supplier_invoice,
          amount: Number(values.amount),
          method: values.method as any,
          reference_number: values.reference_number,
          notes: values.notes,
        } as any);
        toast.success("Payment recorded successfully");
        form.resetForm();
        callBack();
        handleClose();
      } catch (e: any) {
        const msg =
          e.response?.data?.amount?.[0] ||
          e.response?.data?.non_field_errors?.[0] ||
          e.response?.data?.detail ||
          "Failed to record payment";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleDialogClose = () => {
    if (loading) return;
    form.resetForm();
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <PaymentIcon color="success" />
        Record Payment — {invoice.invoice_number}
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 2 }}>
          Balance due: <strong>{formatCurrency(invoice.balance_due)}</strong>
        </Alert>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          <TextField
            label="Amount (UGX) *"
            type="number"
            fullWidth
            value={form.values.amount}
            onChange={(e) => form.setFieldValue("amount", e.target.value)}
            onBlur={() => form.setFieldTouched("amount", true)}
            error={Boolean(form.touched.amount && form.errors.amount)}
            helperText={form.touched.amount && (form.errors.amount as string)}
            inputProps={{ min: 1, max: Number(invoice.balance_due) }}
          />

          <FormControl fullWidth error={Boolean(form.touched.method && form.errors.method)}>
            <InputLabel>Payment Method *</InputLabel>
            <Select
              value={form.values.method}
              label="Payment Method *"
              onChange={(e) => form.setFieldValue("method", e.target.value)}
              onBlur={() => form.setFieldTouched("method", true)}
            >
              {PAYMENT_METHOD_OPTIONS.map((opt) => (
                <MenuItem key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
            {form.touched.method && form.errors.method && (
              <FormHelperText>{form.errors.method as string}</FormHelperText>
            )}
          </FormControl>

          <TextField
            label="Reference Number *"
            fullWidth
            value={form.values.reference_number}
            onChange={(e) => form.setFieldValue("reference_number", e.target.value)}
            onBlur={() => form.setFieldTouched("reference_number", true)}
            error={Boolean(form.touched.reference_number && form.errors.reference_number)}
            helperText={form.touched.reference_number && (form.errors.reference_number as string)}
            placeholder="Transaction ID / Cheque number..."
          />

          <TextField
            label="Notes (optional)"
            multiline
            rows={2}
            fullWidth
            value={form.values.notes}
            onChange={(e) => form.setFieldValue("notes", e.target.value)}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={handleDialogClose} disabled={loading}>Cancel</Button>
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
const SupplierInvoiceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<ISupplierInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useTitle(invoice ? `Invoice ${invoice.invoice_number}` : "Invoice Details");

  useEffect(() => {
    if (id) fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const data = await SourcingService.getSupplierInvoiceDetails(id!);
      setInvoice(data);
    } catch {
      toast.error("Failed to load invoice details");
      navigate("/admin/sourcing/invoices");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!invoice) return null;

  const paidPct = invoice.amount_due
    ? Math.min(100, (Number(invoice.amount_paid) / Number(invoice.amount_due)) * 100)
    : 0;

  const canPay = ["pending", "partial"].includes(invoice.status);
  const statusColor = INVOICE_STATUS_COLORS[invoice.status] ?? "default";

  return (
    <Box pt={2} pb={4}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 1 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin/sourcing/invoices")}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        <ReceiptIcon color="action" sx={{ mr: 0.5 }} />
        <Typography variant="h4">{invoice.invoice_number}</Typography>
        <Chip
          label={(invoice as any).status_display ?? invoice.status.replace(/_/g, " ").toUpperCase()}
          color={statusColor}
          sx={{ ml: 1 }}
        />
      </Box>

      {/* ── Action Buttons ──────────────────────────────────────────────── */}
      <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {canPay && (
          <Button
            variant="contained"
            color="success"
            startIcon={<PaymentIcon />}
            onClick={() => setShowPaymentForm(true)}
          >
            Record Payment
          </Button>
        )}

        {/* ✅ PDF Download — always available, uses full detail already loaded */}
        <SupplierInvoicePDFButton
          invoice={invoice}
          isFullDetail
          size="medium"
        />
      </Box>

      {invoice.status === "paid" && (
        <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
          This invoice has been fully paid.
        </Alert>
      )}
      {invoice.status === "cancelled" && (
        <Alert severity="error" sx={{ mb: 3 }}>
          This invoice has been cancelled.
        </Alert>
      )}

      {/* ── Summary Cards ───────────────────────────────────────────────── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { label: "Amount Due", value: formatCurrency(invoice.amount_due), color: "text.primary" },
          { label: "Amount Paid", value: formatCurrency(invoice.amount_paid), color: "success.main" },
          {
            label: "Balance Due",
            value: formatCurrency(invoice.balance_due),
            color: Number(invoice.balance_due) > 0 ? "error.main" : "success.main",
          },
        ].map(({ label, value, color }) => (
          <Grid key={label} item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="overline" gutterBottom>{label}</Typography>
                <Typography variant="h5" fontWeight={700} color={color}>{value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="overline" gutterBottom>Payment Progress</Typography>
              <Typography variant="h5" fontWeight={700}>{paidPct.toFixed(0)}%</Typography>
              <LinearProgress
                variant="determinate"
                value={paidPct}
                color={paidPct === 100 ? "success" : "primary"}
                sx={{ mt: 1, height: 6, borderRadius: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Invoice Details + Supplier Info ────────────────────────────── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Invoice Details</Typography>
              <Divider sx={{ mb: 2 }} />
              {([
                ["Invoice Number", invoice.invoice_number],
                ["Source Order", (invoice.source_order as any)?.order_number ?? invoice.source_order ?? "—"],
                ["Issued At", formatDateToDDMMYYYY(invoice.issued_at)],
                ["Due Date", invoice.due_date ? formatDateToDDMMYYYY(invoice.due_date) : "Not set"],
                ["Paid At", invoice.paid_at ? formatDateToDDMMYYYY(invoice.paid_at) : "—"],
                ["Payment Reference", invoice.payment_reference || "—"],
              ] as [string, string][]).map(([label, value]) => (
                <Box key={label} sx={styles.infoRow}>
                  <Span sx={styles.label}>{label}:</Span>
                  <Span sx={styles.value}>{value}</Span>
                </Box>
              ))}
              {invoice.notes && (
                <Box sx={{ mt: 1.5 }}>
                  <Span sx={styles.label}>Notes:</Span>
                  <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>{invoice.notes}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Supplier Information</Typography>
              <Divider sx={{ mb: 2 }} />
              {(() => {
                const s = invoice.supplier as any;
                if (!s) return <Typography color="text.secondary">No supplier info</Typography>;
                const user = s.user_detail ?? s.user;
                return (
                  <>
                    <Box sx={styles.infoRow}>
                      <Span sx={styles.label}>Business Name:</Span>
                      <Span sx={styles.value}>{s.business_name ?? "—"}</Span>
                    </Box>
                    <Box sx={styles.infoRow}>
                      <Span sx={styles.label}>Contact:</Span>
                      <Span sx={styles.value}>
                        {user && typeof user === "object"
                          ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
                          : "—"}
                      </Span>
                    </Box>
                    <Box sx={styles.infoRow}>
                      <Span sx={styles.label}>Hub:</Span>
                      <Span sx={styles.value}>{s.hub?.name ?? "—"}</Span>
                    </Box>
                    <Box sx={styles.infoRow}>
                      <Span sx={styles.label}>Verified:</Span>
                      <Chip
                        label={s.is_verified ? "Verified" : "Not Verified"}
                        color={s.is_verified ? "success" : "warning"}
                        size="small"
                      />
                    </Box>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Payment History ─────────────────────────────────────────────── */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Payment History</Typography>
          <Divider sx={{ mb: 2 }} />
          {!invoice.payments_list || invoice.payments_list.length === 0 ? (
            <Alert severity="info">No payments recorded yet.</Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Payment #</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoice.payments_list.map((payment: ISupplierPayment) => (
                    <TableRow key={payment.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="primary">
                          {payment.payment_number}
                        </Typography>
                      </TableCell>
                      <TableCell>{payment.method_display}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                          {payment.reference_number || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Span sx={{ fontWeight: 600 }}>{formatCurrency(payment.amount)}</Span>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={(payment as any).status_display ?? payment.status}
                          color={PAYMENT_STATUS_COLORS[payment.status] ?? "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {payment.completed_at
                          ? formatDateToDDMMYYYY(payment.completed_at)
                          : formatDateToDDMMYYYY(payment.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Payment Dialog ──────────────────────────────────────────────── */}
      {showPaymentForm && (
        <MakePaymentDialog
          open={showPaymentForm}
          invoice={invoice}
          handleClose={() => setShowPaymentForm(false)}
          callBack={fetchInvoice}
        />
      )}
    </Box>
  );
};

const styles = {
  infoRow: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 },
  label: { fontWeight: 600, color: "text.secondary" },
  value: { color: "text.primary" },
};

export default SupplierInvoiceDetails;