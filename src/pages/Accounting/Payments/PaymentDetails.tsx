import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Divider,
  Grid,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useTitle from "../../../hooks/useTitle";
import { PaymentService } from "./Payments.service";
import { formatDateToDDMMYYYY } from "../../../utils/date_formatter";
import ProgressIndicator from "../../../components/UI/ProgressIndicator";

const PaymentDetails = () => {
  useTitle("Payment Details");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) fetchPaymentDetails(id);
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

  const handleBack = () => navigate("/admin/accounting/payments");

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

  const invoice = payment.invoice_details;
  const account = payment.account;

  return (
    <Box sx={{ p: 4, maxWidth: 1000, mx: "auto" }}>
      <Button variant="outlined" onClick={handleBack} sx={{ mb: 3 }}>
        Back to Payments
      </Button>

      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Payment #{payment.payment_number}
      </Typography>

      <Grid container spacing={3}>
        {/* --- Payment Summary --- */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography><strong>Amount:</strong> UGX {payment.amount.toLocaleString()}</Typography>
              <Typography><strong>Date:</strong> {formatDateToDDMMYYYY(payment.payment_date)}</Typography>
              <Typography><strong>Method:</strong> {payment.payment_method_display}</Typography>
              <Typography><strong>Reference:</strong> {payment.reference_number || "N/A"}</Typography>
              <Typography><strong>Transaction ID:</strong> {payment.transaction_id || "N/A"}</Typography>
              <Typography sx={{ mt: 1 }}>
                <strong>Status:</strong>{" "}
                <Chip
                  label={payment.status_display}
                  color={payment.status === "completed" ? "success" : "warning"}
                  size="small"
                />
              </Typography>
              <Typography><strong>Reconciled:</strong> {payment.reconciled ? "Yes" : "No"}</Typography>
              {payment.reconciled && (
                <Typography>
                  <strong>Reconciled Date:</strong>{" "}
                  {formatDateToDDMMYYYY(payment.reconciled_date)}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* --- Linked Invoice --- */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Linked Invoice
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography><strong>Invoice #:</strong> {invoice?.invoice_number}</Typography>
              <Typography><strong>Status:</strong> {invoice?.status_display}</Typography>
              <Typography><strong>Amount Due:</strong> UGX {invoice?.amount_due.toLocaleString()}</Typography>
              <Typography><strong>Total Amount:</strong> UGX {invoice?.total_amount.toLocaleString()}</Typography>
              <Typography><strong>Issue Date:</strong> {formatDateToDDMMYYYY(invoice?.issue_date)}</Typography>
              <Typography><strong>Due Date:</strong> {formatDateToDDMMYYYY(invoice?.due_date)}</Typography>
              <Typography sx={{ mt: 1 }}>
                <strong>Beneficiary:</strong> {invoice?.beneficiary_name} ({invoice?.beneficiary_bank})
              </Typography>
              <Typography>
                <strong>Account:</strong> {invoice?.beneficiary_account}, {invoice?.beneficiary_branch}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* --- Account Info --- */}
        <Grid item xs={12} md={12}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography><strong>Account Name:</strong> {account?.name}</Typography>
                  <Typography><strong>Type:</strong> {account?.type}</Typography>
                  <Typography><strong>Credit Terms:</strong> {account?.credit_terms_days} days</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography><strong>Hub:</strong> {account?.hub?.name}</Typography>
                  <Typography><strong>Location:</strong> {account?.hub?.location}</Typography>
                  <Typography><strong>Hub Admin:</strong> {account?.hub?.hub_admin?.first_name} {account?.hub?.hub_admin?.last_name}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* --- Notes --- */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notes
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography><strong>Public Notes:</strong> {payment.notes || "N/A"}</Typography>
              <Typography><strong>Internal Notes:</strong> {payment.internal_notes || "N/A"}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* --- Audit Trail --- */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ borderRadius: 2, backgroundColor: "#fafafa" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Audit Trail
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography><strong>Created By:</strong> {payment.created_by?.first_name} {payment.created_by?.last_name}</Typography>
              <Typography><strong>Created At:</strong> {formatDateToDDMMYYYY(payment.created_at)}</Typography>
              {payment.reconciled && (
                <Typography>
                  <strong>Reconciled By:</strong> {payment.reconciled_by?.first_name} {payment.reconciled_by?.last_name}
                </Typography>
              )}
              <Typography><strong>Last Updated:</strong> {formatDateToDDMMYYYY(payment.updated_at)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PaymentDetails;
