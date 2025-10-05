import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Paper, Divider } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useTitle from "../../../hooks/useTitle";
import { PaymentService } from "./Payments.service";
import { IPayment } from "./Payments.interface";
import { formatDateToDDMMYYYY } from "../../../utils/date_formatter";
import ProgressIndicator from "../../../components/UI/ProgressIndicator";

const PaymentDetails = () => {
  useTitle("Payment Details");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<IPayment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      fetchPaymentDetails(id);
    }
  }, [id]);

  const fetchPaymentDetails = async (paymentId: string) => {
    try {
      setLoading(true);
      const data = await PaymentService.getPaymentDetails(paymentId);
      setPayment(data);
    } catch (error: any) {
      toast.error("Failed to fetch payment details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/accounting/payments");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <ProgressIndicator size={40} />
      </Box>
    );
  }

  if (!payment) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" color="error">
          Payment not found
        </Typography>
        <Button variant="contained" onClick={handleBack} sx={{ mt: 2 }}>
          Back to Payments
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Button variant="outlined" onClick={handleBack} sx={{ mb: 2 }}>
        Back to Payments
      </Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Payment #{payment.payment_number}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Invoice</Typography>
            <Typography>{payment.invoice?.invoice_number || "N/A"}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Account</Typography>
            <Typography>{payment.account?.name || "N/A"}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Amount</Typography>
            <Typography>${payment.amount.toFixed(2)}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Payment Date</Typography>
            <Typography>{formatDateToDDMMYYYY(payment.payment_date)}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Payment Method</Typography>
            <Typography>{payment.payment_method_display}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Reference Number</Typography>
            <Typography>{payment.reference_number || "N/A"}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Status</Typography>
            <Typography>{payment.status_display}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Reconciled</Typography>
            <Typography>{payment.reconciled ? "Yes" : "No"}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Reconciled Date</Typography>
            <Typography>{payment.reconciled_date ? formatDateToDDMMYYYY(payment.reconciled_date) : "N/A"}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Reconciled By</Typography>
            <Typography>{payment.reconciled_by?.username || "N/A"}</Typography>
          </Box>
        </Box>
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold">Notes</Typography>
          <Typography>{payment.notes || "N/A"}</Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">Internal Notes</Typography>
          <Typography>{payment.internal_notes || "N/A"}</Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">Created By</Typography>
          <Typography>{payment.created_by?.username || "N/A"}</Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">Created At</Typography>
          <Typography>{formatDateToDDMMYYYY(payment.created_at)}</Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default PaymentDetails;