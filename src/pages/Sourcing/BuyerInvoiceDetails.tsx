/**
 * BuyerInvoiceDetails.tsx — NEW
 * Detail/web view for a buyer invoice: summary cards, invoice details, payment history, PDF download
 */

import { FC, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert, Box, Button, Card, CardContent, Chip, Divider, Grid,
  LinearProgress, Table, TableBody, TableCell, TableHead, TableRow,
  Typography,
} from "@mui/material";
import { toast } from "react-hot-toast";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import useTitle from "../../hooks/useTitle";
import LoadingScreen from "../../components/LoadingScreen";
import { Span } from "../../components/Typography";
import { SourcingService } from "./Sourcing.service";
import { IBuyerInvoice, IBuyerPayment } from "./Sourcing.interface";
import { formatCurrency } from "./SourcingConstants";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import BuyerInvoicePDFButton from "./BuyerInvoicePDF";

const STATUS_COLORS: Record<string, any> = {
  draft: "default", issued: "primary", partial: "warning",
  paid: "success", overdue: "error", cancelled: "error",
};

const BuyerInvoiceDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<IBuyerInvoice | null>(null);
  const [payments, setPayments] = useState<IBuyerPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useTitle(invoice ? `Invoice ${invoice.invoice_number}` : "Buyer Invoice");

  useEffect(() => { if (id) fetchData(); }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const inv = await SourcingService.getBuyerInvoiceDetails(id!);
      setInvoice(inv);
      // Fetch payments for this invoice
      const pResp = await SourcingService.getBuyerPayments({ buyer_invoice: id, page_size: 50 });
      setPayments(pResp.results || []);
    } catch {
      toast.error("Failed to load invoice");
      navigate("/admin/sourcing/buyer-invoices");
    } finally { setLoading(false); }
  };

  if (loading) return <LoadingScreen />;
  if (!invoice) return null;

  const paidPct = invoice.amount_due > 0 ? Math.min(100, (Number(invoice.amount_paid) / Number(invoice.amount_due)) * 100) : 0;

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/admin/sourcing/buyer-invoices")}>Back</Button>
        <Typography variant="h4">{invoice.invoice_number}</Typography>
        <Chip label={invoice.status.toUpperCase()} color={STATUS_COLORS[invoice.status]} />
      </Box>

      <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
        <BuyerInvoicePDFButton invoice={invoice} size="medium" />
        {invoice.buyer_order && (
          <Button variant="outlined" onClick={() => navigate(`/admin/sourcing/buyer-orders/${invoice.buyer_order}`)}>View Order</Button>
        )}
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Amount Due", value: formatCurrency(invoice.amount_due), color: "text.primary" },
          { label: "Amount Paid", value: formatCurrency(invoice.amount_paid), color: "success.main" },
          { label: "Balance Due", value: formatCurrency(invoice.balance_due), color: invoice.balance_due > 0 ? "error.main" : "success.main" },
          { label: "Payment Progress", value: `${paidPct.toFixed(0)}%`, color: "primary.main" },
        ].map(c => (
          <Grid item xs={6} sm={3} key={c.label}>
            <Card><CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Typography variant="caption" color="text.primary">{c.label}</Typography>
              <Typography variant="h5" sx={{ color: c.color, fontWeight: 700 }}>{c.value}</Typography>
              {c.label === "Payment Progress" && <LinearProgress variant="determinate" value={paidPct} color={paidPct === 100 ? "success" : "primary"} sx={{ mt: 1, height: 6, borderRadius: 3 }} />}
            </CardContent></Card>
          </Grid>
        ))}
      </Grid>

      {/* Details */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined"><CardContent>
            <Typography variant="h6" gutterBottom>Invoice Details</Typography>
            <Divider sx={{ mb: 2 }} />
            {([
              ["Invoice #", invoice.invoice_number],
              ["Order #", invoice.order_number || "—"],
              ["Buyer", invoice.buyer_name || "—"],
              ["Terms", invoice.payment_terms_days === 0 ? "On Delivery" : `Net ${invoice.payment_terms_days} days`],
              ["Issued At", formatDateToDDMMYYYY(invoice.issued_at)],
              ["Due Date", invoice.due_date ? formatDateToDDMMYYYY(invoice.due_date) : "—"],
              ["Paid At", invoice.paid_at ? formatDateToDDMMYYYY(invoice.paid_at) : "—"],
            ] as [string, string][]).map(([l, v]) => (
              <Box key={l} sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                <Span sx={{ fontWeight: 600, color: "text.primary" }}>{l}:</Span><Span>{v}</Span>
              </Box>
            ))}
          </CardContent></Card>
        </Grid>
      </Grid>

      {/* Payment History */}
      <Card variant="outlined"><CardContent>
        <Typography variant="h6" gutterBottom>Payment History</Typography>
        <Divider sx={{ mb: 2 }} />
        {payments.length === 0 ? <Alert severity="info">No payments recorded yet.</Alert> : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                {["Payment #", "Amount", "Method", "Reference", "Status", "Date"].map(h => <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map(p => (
                <TableRow key={p.id} hover sx={{ cursor: "pointer" }} onClick={() => navigate(`/admin/sourcing/buyer-payments/${p.id}`)}>
                  <TableCell><Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>{p.payment_number}</Typography></TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(p.amount)}</TableCell>
                  <TableCell>{p.method.replace(/_/g, " ").toUpperCase()}</TableCell>
                  <TableCell sx={{ fontFamily: "monospace" }}>{p.reference_number || "—"}</TableCell>
                  <TableCell><Chip label={p.status.toUpperCase()} color={p.status === "confirmed" ? "success" : p.status === "pending" ? "warning" : "error"} size="small" /></TableCell>
                  <TableCell>{formatDateToDDMMYYYY(p.payment_date)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent></Card>
    </Box>
  );
};

export default BuyerInvoiceDetails;