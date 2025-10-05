import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Paper, Divider } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useTitle from "../../../hooks/useTitle";
import { InvoiceService } from "./Invoices.service";
import { IInvoice } from "./Invoices.interface";
import { formatDateToDDMMYYYY } from "../../../utils/date_formatter";
import ProgressIndicator from "../../../components/UI/ProgressIndicator";

const InvoiceDetails = () => {
  useTitle("Invoice Details");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<IInvoice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      fetchInvoiceDetails(id);
    }
  }, [id]);

  const fetchInvoiceDetails = async (invoiceId: string) => {
    try {
      setLoading(true);
      const data = await InvoiceService.getInvoiceDetails(invoiceId);
      setInvoice(data);
    } catch (error: any) {
      toast.error("Failed to fetch invoice details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/accounting/invoices");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <ProgressIndicator size={40} />
      </Box>
    );
  }

  if (!invoice) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" color="error">
          Invoice not found
        </Typography>
        <Button variant="contained" onClick={handleBack} sx={{ mt: 2 }}>
          Back to Invoices
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Button variant="outlined" onClick={handleBack} sx={{ mb: 2 }}>
        Back to Invoices
      </Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Invoice #{invoice.invoice_number}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Account</Typography>
            <Typography>{invoice.account?.name || "N/A"}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Trade</Typography>
            <Typography>{invoice.trade?.trade_number || "N/A"}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Issue Date</Typography>
            <Typography>{formatDateToDDMMYYYY(invoice.issue_date)}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Due Date</Typography>
            <Typography>{formatDateToDDMMYYYY(invoice.due_date)}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Subtotal</Typography>
            <Typography>${invoice.subtotal.toFixed(2)}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Tax Rate</Typography>
            <Typography>{invoice.tax_rate}%</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Tax Amount</Typography>
            <Typography>${invoice.tax_amount.toFixed(2)}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Discount Amount</Typography>
            <Typography>${invoice.discount_amount.toFixed(2)}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Total Amount</Typography>
            <Typography>${invoice.total_amount.toFixed(2)}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Amount Paid</Typography>
            <Typography>${invoice.amount_paid.toFixed(2)}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Amount Due</Typography>
            <Typography>${invoice.amount_due.toFixed(2)}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Status</Typography>
            <Typography>{invoice.status_display}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Payment Status</Typography>
            <Typography>{invoice.payment_status_display}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Sent Date</Typography>
            <Typography>{invoice.sent_date ? formatDateToDDMMYYYY(invoice.sent_date) : "N/A"}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Last Reminder Sent</Typography>
            <Typography>{invoice.last_reminder_sent ? formatDateToDDMMYYYY(invoice.last_reminder_sent) : "N/A"}</Typography>
          </Box>
        </Box>
        {invoice.line_items && invoice.line_items.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Line Items
            </Typography>
            <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #ddd" }}>Description</th>
                  <th style={{ textAlign: "right", padding: "8px", borderBottom: "1px solid #ddd" }}>Quantity</th>
                  <th style={{ textAlign: "right", padding: "8px", borderBottom: "1px solid #ddd" }}>Unit Price</th>
                  <th style={{ textAlign: "right", padding: "8px", borderBottom: "1px solid #ddd" }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {invoice.line_items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{item.description}</td>
                    <td style={{ textAlign: "right", padding: "8px", borderBottom: "1px solid #ddd" }}>{item.quantity}</td>
                    <td style={{ textAlign: "right", padding: "8px", borderBottom: "1px solid #ddd" }}>${item.unit_price.toFixed(2)}</td>
                    <td style={{ textAlign: "right", padding: "8px", borderBottom: "1px solid #ddd" }}>${item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Box>
          </>
        )}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold">Notes</Typography>
          <Typography>{invoice.notes || "N/A"}</Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">Internal Notes</Typography>
          <Typography>{invoice.internal_notes || "N/A"}</Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">Created By</Typography>
          <Typography>{invoice.created_by?.username || "N/A"}</Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">Created At</Typography>
          <Typography>{formatDateToDDMMYYYY(invoice.created_at)}</Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default InvoiceDetails;