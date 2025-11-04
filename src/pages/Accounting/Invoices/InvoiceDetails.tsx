import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

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
    navigate("/admin/accounting/invoices");
  };

  const formatAmount = (value: any): string => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const loadHtml2Pdf = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).html2pdf) {
        resolve((window as any).html2pdf);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.onload = () => resolve((window as any).html2pdf);
      script.onerror = () => reject(new Error("Failed to load PDF library"));
      document.head.appendChild(script);
    });
  };

  const handleDownloadPDF = async () => {
    try {
      toast.loading("Generating PDF...");

      const html2pdf = await loadHtml2Pdf();

      const element = invoiceRef.current;
      const opt = {
        margin: 10,
        filename: `Invoice-${invoice?.invoice_number || "document"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();
      toast.dismiss();
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.dismiss();
      toast.error("Failed to generate PDF");
    }
  };

  const handleFinalizeInvoice = async () => {
    if (!id || invoice?.status !== "draft") return;

    try {
      setActionLoading(true);
      await InvoiceService.finalizeInvoice(id);
      toast.success("Invoice finalized successfully");
      fetchInvoiceDetails(id);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to finalize invoice");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!id) return;

    try {
      setActionLoading(true);
      await InvoiceService.sendInvoice(id);
      toast.success("Invoice sent successfully");
      fetchInvoiceDetails(id);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to send invoice");
    } finally {
      setActionLoading(false);
    }
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
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      {/* Action Buttons */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack} size="small">
          Back
        </Button>

        {invoice.status === "draft" && (
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={handleFinalizeInvoice}
            disabled={actionLoading}
            size="small"
          >
            Finalize Invoice
          </Button>
        )}

        {["draft", "issued"].includes(invoice.status) && (
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleSendInvoice}
            disabled={actionLoading}
            size="small"
          >
            Send Invoice
          </Button>
        )}

        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadPDF}
          size="small"
          sx={{ ml: { sm: "auto" } }}
        >
          Download PDF
        </Button>
      </Stack>

      {/* Status Indicators */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Chip label={invoice.status_display} color={invoice.status === "paid" ? "success" : "default"} />
        <Chip
          label={invoice.payment_status_display}
          color={
            invoice.payment_status === "paid"
              ? "success"
              : invoice.payment_status === "overdue"
              ? "error"
              : "warning"
          }
        />
        {invoice.invoicing_frequency_display && (
          <Chip label={invoice.invoicing_frequency_display} variant="outlined" />
        )}
      </Stack>

      {/* Invoice Content */}
      <Paper ref={invoiceRef} sx={{ p: { xs: 2, sm: 3 }, bgcolor: "white" }}>
        {/* Header with Logo */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2, flexWrap: "wrap", gap: 2 }}>
          <Box
            sx={{
              bgcolor: "#76c045",
              px: { xs: 2, sm: 2.5 },
              py: { xs: 0.8, sm: 1 },
              borderRadius: 1,
              display: "inline-block",
            }}
          >
            <Typography variant="h5" sx={{ color: "white", fontWeight: "bold", fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
              AMSAF
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
              Invoice
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {invoice.invoice_number}
            </Typography>
          </Box>
        </Box>

        {/* Invoice Info Grid */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ border: "1px solid #ddd", p: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: "bold", display: "block", mb: 0.5, color: "text.secondary" }}>
                Account:
              </Typography>
              <Typography variant="body2">{invoice.account?.name || "N/A"}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ border: "1px solid #ddd", p: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: "bold", display: "block", mb: 0.5, color: "text.secondary" }}>
                Issue Date:
              </Typography>
              <Typography variant="body2">{formatDateToDDMMYYYY(invoice.issue_date)}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ border: "1px solid #ddd", p: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: "bold", display: "block", mb: 0.5, color: "text.secondary" }}>
                Due Date:
              </Typography>
              <Typography variant="body2">{formatDateToDDMMYYYY(invoice.due_date)}</Typography>
            </Box>
          </Grid>
          {invoice.period_start && invoice.period_end && (
            <Grid item xs={12} sm={6}>
              <Box sx={{ border: "1px solid #ddd", p: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: "bold", display: "block", mb: 0.5, color: "text.secondary" }}>
                  Period:
                </Typography>
                <Typography variant="body2">
                  {formatDateToDDMMYYYY(invoice.period_start)} - {formatDateToDDMMYYYY(invoice.period_end)}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Line Items Table */}
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Deliveries ({invoice.grn_count || 0} GRNs)
        </Typography>
        <Box sx={{ overflowX: "auto", mb: 2 }}>
          <TableContainer sx={{ border: "1px solid #ddd", minWidth: { xs: 650, sm: "auto" } }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: "bold", border: "1px solid #ddd", py: 1, px: 1, fontSize: "0.75rem" }}>
                    GRN
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", border: "1px solid #ddd", py: 1, px: 1, fontSize: "0.75rem" }}>
                    Trade
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", border: "1px solid #ddd", py: 1, px: 1, fontSize: "0.75rem" }}>
                    Grain Type
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", border: "1px solid #ddd", py: 1, px: 1, fontSize: "0.75rem" }}>
                    Supplier
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", border: "1px solid #ddd", py: 1, px: 1, fontSize: "0.75rem" }}>
                    Delivery Date
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", border: "1px solid #ddd", py: 1, px: 1, fontSize: "0.75rem" }}
                    align="right"
                  >
                    Weight (kg)
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", border: "1px solid #ddd", py: 1, px: 1, fontSize: "0.75rem" }}
                    align="right"
                  >
                    Unit Price
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", border: "1px solid #ddd", py: 1, px: 1, fontSize: "0.75rem" }}
                    align="right"
                  >
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.line_items && invoice.line_items.length > 0 ? (
                  invoice.line_items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell sx={{ border: "1px solid #ddd", py: 1, px: 1, fontSize: "0.75rem" }}>
                        {item.grn_number || "-"}
                      </TableCell>
                      <TableCell sx={{ border: "1px solid #ddd", py: 1, px: 1, fontSize: "0.75rem" }}>
                        {item.trade_number || "-"}
                      </TableCell>
                      <TableCell sx={{ border: "1px solid #ddd", py: 1, px: 1, fontSize: "0.75rem" }}>
                        {item.grain_type} - {item.quality_grade}
                      </TableCell>
                      <TableCell sx={{ border: "1px solid #ddd", py: 1, px: 1, fontSize: "0.75rem" }}>
                        {item.supplier_name}
                      </TableCell>
                      <TableCell sx={{ border: "1px solid #ddd", py: 1, px: 1, fontSize: "0.75rem" }}>
                        {formatDateToDDMMYYYY(item.delivery_date)}
                      </TableCell>
                      <TableCell sx={{ border: "1px solid #ddd", py: 1, px: 1, fontSize: "0.75rem" }} align="right">
                        {formatAmount(item.quantity_kg)}
                      </TableCell>
                      <TableCell sx={{ border: "1px solid #ddd", py: 1, px: 1, fontSize: "0.75rem" }} align="right">
                        {formatAmount(item.unit_price)}
                      </TableCell>
                      <TableCell sx={{ border: "1px solid #ddd", py: 1, px: 1, fontSize: "0.75rem" }} align="right">
                        {formatAmount(item.total_amount)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ border: "1px solid #ddd", py: 1, fontSize: "0.75rem" }}>
                      No line items
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Charges and Totals */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={8}>
            <Box sx={{ border: "1px solid #ddd", p: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: "bold", display: "block" }}>
                Subtotal:
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ border: "1px solid #ddd", p: 1.5, textAlign: "right" }}>
              <Typography variant="body2">UGX {formatAmount(invoice.subtotal)}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={8}>
            <Box sx={{ border: "1px solid #ddd", p: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: "bold", display: "block" }}>
                AMSAF Fees:
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ border: "1px solid #ddd", p: 1.5, textAlign: "right" }}>
              <Typography variant="body2">UGX {formatAmount(invoice.amsaf_fees)}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={8}>
            <Box sx={{ border: "1px solid #ddd", p: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: "bold", display: "block" }}>
                Logistics:
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ border: "1px solid #ddd", p: 1.5, textAlign: "right" }}>
              <Typography variant="body2">UGX {formatAmount(invoice.logistics_cost)}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={8}>
            <Box sx={{ border: "1px solid #ddd", p: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: "bold", display: "block" }}>
                Weighbridge:
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ border: "1px solid #ddd", p: 1.5, textAlign: "right" }}>
              <Typography variant="body2">UGX {formatAmount(invoice.weighbridge_cost)}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={8}>
            <Box sx={{ border: "1px solid #ddd", p: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: "bold", display: "block" }}>
                Other Charges:
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ border: "1px solid #ddd", p: 1.5, textAlign: "right" }}>
              <Typography variant="body2">UGX {formatAmount(invoice.other_charges)}</Typography>
            </Box>
          </Grid>

          {invoice.tax_amount > 0 && (
            <>
              <Grid item xs={12} sm={8}>
                <Box sx={{ border: "1px solid #ddd", p: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: "bold", display: "block" }}>
                    Tax ({invoice.tax_rate}%):
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ border: "1px solid #ddd", p: 1.5, textAlign: "right" }}>
                  <Typography variant="body2">UGX {formatAmount(invoice.tax_amount)}</Typography>
                </Box>
              </Grid>
            </>
          )}

          {invoice.discount_amount > 0 && (
            <>
              <Grid item xs={12} sm={8}>
                <Box sx={{ border: "1px solid #ddd", p: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: "bold", display: "block" }}>
                    Discount:
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ border: "1px solid #ddd", p: 1.5, textAlign: "right" }}>
                  <Typography variant="body2">-UGX {formatAmount(invoice.discount_amount)}</Typography>
                </Box>
              </Grid>
            </>
          )}
        </Grid>

        {/* Bank Instructions and Total */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={8}>
            <Box sx={{ border: "1px solid #ddd", p: 1.5, height: "100%" }}>
              <Typography variant="caption" sx={{ fontWeight: "bold", display: "block", mb: 1 }}>
                Bank Instructions:
              </Typography>
              {invoice.beneficiary_bank && (
                <>
                  <Typography variant="caption" sx={{ display: "block", mb: 0.3 }}>
                    Bank: {invoice.beneficiary_bank}
                  </Typography>
                  <Typography variant="caption" sx={{ display: "block", mb: 0.3 }}>
                    Beneficiary: {invoice.beneficiary_name || "-"}
                  </Typography>
                  <Typography variant="caption" sx={{ display: "block", mb: 0.3 }}>
                    Account: {invoice.beneficiary_account || "-"}
                  </Typography>
                  <Typography variant="caption" sx={{ display: "block", mb: 0.3 }}>
                    Branch: {invoice.beneficiary_branch || "-"}
                  </Typography>
                </>
              )}
              {invoice.payment_terms && (
                <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                  {invoice.payment_terms}
                </Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ border: "1px solid #ddd", p: 1.5, bgcolor: "#f5f5f5" }}>
              <Typography variant="caption" sx={{ fontWeight: "bold", display: "block", mb: 0.5 }}>
                Total Amount:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                UGX {formatAmount(invoice.total_amount)}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" sx={{ display: "block", mb: 0.3 }}>
                Paid: UGX {formatAmount(invoice.amount_paid)}
              </Typography>
              <Typography variant="caption" sx={{ display: "block", fontWeight: "bold", color: "error.main" }}>
                Due: UGX {formatAmount(invoice.amount_due)}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Notes */}
        {invoice.notes && (
          <Box sx={{ border: "1px solid #ddd", p: 1.5, mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: "bold", display: "block", mb: 0.5 }}>
              Notes:
            </Typography>
            <Typography variant="caption">{invoice.notes}</Typography>
          </Box>
        )}

        {/* Footer Info */}
        <Box sx={{ mt: 3, pt: 2, borderTop: "2px solid #ddd" }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                <strong>Created:</strong> {formatDateToDDMMYYYY(invoice.created_at)}
              </Typography>
            </Grid>
            {invoice.sent_date && (
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">
                  <strong>Sent:</strong> {formatDateToDDMMYYYY(invoice.sent_date)}
                </Typography>
              </Grid>
            )}
            {invoice.days_overdue && invoice.days_overdue > 0 && (
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="error">
                  <strong>Overdue:</strong> {invoice.days_overdue} days
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default InvoiceDetails;