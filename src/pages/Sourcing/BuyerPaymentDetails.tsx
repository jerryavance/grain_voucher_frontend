/**
 * BuyerPaymentDetails.tsx — NEW
 * Detail/web view for a buyer payment with receipt generation
 */

import { FC, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Button, Card, CardContent, Chip, Divider, Grid, Typography,
} from "@mui/material";
import { toast } from "react-hot-toast";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReplayIcon from "@mui/icons-material/Replay";
import ReceiptIcon from "@mui/icons-material/Receipt";
import useTitle from "../../hooks/useTitle";
import LoadingScreen from "../../components/LoadingScreen";
import { Span } from "../../components/Typography";
import { SourcingService } from "./Sourcing.service";
import { IBuyerPayment } from "./Sourcing.interface";
import { formatCurrency } from "./SourcingConstants";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import PaymentReceiptPDFButton from "./PaymentReceiptPDFButton";

const STATUS_COLORS: Record<string, any> = {
  pending: "warning", confirmed: "success", failed: "error", reversed: "default",
};

const BuyerPaymentDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<IBuyerPayment | null>(null);
  const [loading, setLoading] = useState(true);

  useTitle(payment ? `Payment ${payment.payment_number}` : "Buyer Payment");

  useEffect(() => { if (id) fetchPayment(); }, [id]);

  const fetchPayment = async () => {
    setLoading(true);
    try { setPayment(await SourcingService.getBuyerPaymentDetails(id!)); }
    catch { toast.error("Failed to load payment"); navigate("/admin/sourcing/buyer-payments"); }
    finally { setLoading(false); }
  };

  const handleConfirm = async () => {
    try { await SourcingService.confirmBuyerPayment(id!); toast.success("Payment confirmed"); fetchPayment(); }
    catch { toast.error("Failed to confirm"); }
  };

  const handleReverse = async () => {
    if (!window.confirm("Reverse this payment?")) return;
    try { await SourcingService.reverseBuyerPayment(id!); toast.success("Payment reversed"); fetchPayment(); }
    catch { toast.error("Failed to reverse"); }
  };

  if (loading) return <LoadingScreen />;
  if (!payment) return null;

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/admin/sourcing/buyer-payments")}>Back</Button>
        <ReceiptIcon color="action" />
        <Typography variant="h4">{payment.payment_number}</Typography>
        <Chip label={payment.status.toUpperCase()} color={STATUS_COLORS[payment.status]} />
      </Box>

      <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
        {payment.status === "pending" && (
          <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={handleConfirm}>Confirm Payment</Button>
        )}
        {payment.status === "confirmed" && (
          <Button variant="outlined" color="error" startIcon={<ReplayIcon />} onClick={handleReverse}>Reverse</Button>
        )}
        <PaymentReceiptPDFButton payment={payment} type="buyer" />
        <Button variant="outlined" onClick={() => navigate(`/admin/sourcing/buyer-invoices/${payment.buyer_invoice}`)}>View Invoice</Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined"><CardContent>
            <Typography variant="h6" gutterBottom>Payment Details</Typography>
            <Divider sx={{ mb: 2 }} />
            {([
              ["Payment #", payment.payment_number],
              ["Invoice #", payment.invoice_number || "—"],
              ["Buyer", payment.buyer_name || "—"],
              ["Amount", formatCurrency(payment.amount)],
              ["Method", payment.method.replace(/_/g, " ").toUpperCase()],
              ["Reference", payment.reference_number || "—"],
              ["Status", payment.status.toUpperCase()],
              ["Payment Date", formatDateToDDMMYYYY(payment.payment_date)],
              ["Confirmed At", payment.confirmed_at ? formatDateToDDMMYYYY(payment.confirmed_at) : "—"],
              ["Notes", payment.notes || "—"],
            ] as [string, string][]).map(([l, v]) => (
              <Box key={l} sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                <Span sx={{ fontWeight: 600, color: "text.primary" }}>{l}:</Span>
                <Span sx={{ textAlign: "right", maxWidth: "60%" }}>{v}</Span>
              </Box>
            ))}
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ bgcolor: "success.50" }}><CardContent>
            <Typography variant="h6" gutterBottom>Amount</Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, color: "success.main", mt: 2 }}>
              {formatCurrency(payment.amount)}
            </Typography>
            <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
              {payment.method.replace(/_/g, " ").toUpperCase()} — Ref: {payment.reference_number || "N/A"}
            </Typography>
          </CardContent></Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BuyerPaymentDetails;