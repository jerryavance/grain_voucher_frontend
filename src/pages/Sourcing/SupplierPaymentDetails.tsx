/**
 * SupplierPaymentDetails.tsx — NEW
 * Web view for a supplier payment: details card, confirm/complete action, receipt PDF
 */

import { FC, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Button, Card, CardContent, Chip, Divider, Grid, Typography,
} from "@mui/material";
import { toast } from "react-hot-toast";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReceiptIcon from "@mui/icons-material/Receipt";
import useTitle from "../../hooks/useTitle";
import LoadingScreen from "../../components/LoadingScreen";
import { Span } from "../../components/Typography";
import { SourcingService } from "./Sourcing.service";
import { ISupplierPayment } from "./Sourcing.interface";
import { formatCurrency, PAYMENT_STATUS_COLORS } from "./SourcingConstants";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import PaymentReceiptPDFButton from "./PaymentReceiptPDFButton";

const SupplierPaymentDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<ISupplierPayment | null>(null);
  const [loading, setLoading] = useState(true);

  useTitle(payment ? `Payment ${payment.payment_number}` : "Supplier Payment");

  useEffect(() => { if (id) fetchPayment(); }, [id]);

  const fetchPayment = async () => {
    setLoading(true);
    try { setPayment(await SourcingService.getSupplierPaymentDetails(id!)); }
    catch { toast.error("Failed to load payment"); navigate("/admin/sourcing/payments"); }
    finally { setLoading(false); }
  };

  const handleConfirm = async () => {
    if (!window.confirm("Mark this payment as completed?")) return;
    try {
      await SourcingService.confirmSupplierPayment(id!);
      toast.success("Payment completed");
      fetchPayment();
    } catch { toast.error("Failed"); }
  };

  if (loading) return <LoadingScreen />;
  if (!payment) return null;

  const methodLabel = (payment as any).method_display || payment.method?.replace(/_/g, " ").toUpperCase() || "—";
  const statusLabel = (payment as any).status_display || payment.status?.replace(/_/g, " ").toUpperCase() || "—";
  const processedBy = (payment as any).processed_by_detail;
  const processedByName = processedBy && typeof processedBy === "object"
    ? `${processedBy.first_name || ""} ${processedBy.last_name || ""}`.trim()
    : "—";

  return (
    <Box pt={2} pb={4}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/admin/sourcing/payments")}>
          Back
        </Button>
        <ReceiptIcon color="action" />
        <Typography variant="h4">{payment.payment_number}</Typography>
        <Chip
          label={statusLabel}
          color={PAYMENT_STATUS_COLORS[payment.status] || "default"}
        />
      </Box>

      {/* Actions */}
      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        {(payment.status === "pending" || payment.status === "processing") && (
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={handleConfirm}
          >
            Mark Completed
          </Button>
        )}
        <PaymentReceiptPDFButton
          payment={{
            ...payment,
            supplier_name: (payment as any).supplier_name || "Supplier",
            invoice_number: (payment as any).invoice_number || "—",
            payment_date: (payment as any).payment_date || payment.created_at,
          }}
          type="supplier"
          size="medium"
        />
        <Button
          variant="outlined"
          onClick={() => navigate(`/admin/sourcing/invoices/${payment.supplier_invoice}`)}
        >
          View Invoice
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Payment details */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>Payment Details</Typography>
              <Divider sx={{ mb: 2 }} />
              {([
                ["Payment #", payment.payment_number],
                ["Invoice #", (payment as any).invoice_number || payment.supplier_invoice || "—"],
                ["Source Order", payment.source_order || "—"],
                ["Amount", formatCurrency(payment.amount)],
                ["Method", methodLabel],
                ["Reference", payment.reference_number || "—"],
                ["Status", statusLabel],
                ["Processed By", processedByName],
                ["Created At", formatDateToDDMMYYYY(payment.created_at)],
                ["Completed At", payment.completed_at ? formatDateToDDMMYYYY(payment.completed_at) : "—"],
              ] as [string, string][]).map(([label, value]) => (
                <Box key={label} sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <Span sx={{ fontWeight: 600, color: "text.primary" }}>{label}:</Span>
                  <Span sx={{ textAlign: "right", maxWidth: "60%" }}>{value}</Span>
                </Box>
              ))}
              {payment.notes && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="caption" color="text.primary">Notes</Typography>
                  <Typography variant="body2">{payment.notes}</Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Amount card */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ bgcolor: "success.50" }}>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="overline" color="text.primary">Payment Amount</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: "success.main", mt: 1 }}>
                {formatCurrency(payment.amount)}
              </Typography>
              <Typography variant="body2" color="text.primary" sx={{ mt: 2 }}>
                {methodLabel}
              </Typography>
              {payment.reference_number && (
                <Typography variant="body2" sx={{ mt: 0.5, fontFamily: "monospace" }}>
                  Ref: {payment.reference_number}
                </Typography>
              )}
              <Box sx={{ mt: 3 }}>
                <Chip
                  label={statusLabel}
                  color={PAYMENT_STATUS_COLORS[payment.status] || "default"}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SupplierPaymentDetails;