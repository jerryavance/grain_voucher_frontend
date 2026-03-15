/**
 * BuyerInvoices.tsx — FIXED
 * - Invoice # now clickable → navigates to BuyerInvoiceDetails
 * - Added ExportButtons + DateRangeFilter
 * - PDF column retained
 */

import { FC, useEffect, useState } from "react";
import {
  Alert, Box, Button, Chip, FormControl, InputLabel,
  MenuItem, Select, TextField, Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Span } from "../../components/Typography";
import CustomTable from "../../components/UI/CustomTable";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import useTitle from "../../hooks/useTitle";
import uniqueId from "../../utils/generateId";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import { SourcingService } from "./Sourcing.service";
import { formatCurrency } from "./SourcingConstants";
import { IBuyerInvoice, IBuyerInvoicesResults } from "./Sourcing.interface";
import BuyerInvoicePDFButton from "./BuyerInvoicePDF";
import { ExportButtons, BUYER_INVOICE_EXPORT_COLUMNS } from "./ExportUtils";
import DateRangeFilter from "./DateRangeFilter";

const STATUS_COLORS: Record<string, any> = {
  draft: "default", issued: "primary", partial: "warning",
  paid: "success", overdue: "error", cancelled: "error",
};

// ─── Record Payment Form (unchanged) ──────────────────────────────────────
const RecordPaymentForm: FC<{ invoice: IBuyerInvoice; handleClose: () => void; callBack?: () => void; }> = ({ invoice, handleClose, callBack }) => {
  const [loading, setLoading] = useState(false);
  const form = useFormik({
    initialValues: { buyer_invoice: invoice.id, amount: invoice.balance_due, method: "bank_transfer", reference_number: "", notes: "" },
    validationSchema: Yup.object({ amount: Yup.number().positive().max(invoice.balance_due, `Max: ${formatCurrency(invoice.balance_due)}`).required(), method: Yup.string().required(), reference_number: Yup.string().required("Reference number required") }),
    onSubmit: async (values, { setSubmitting }) => {
      setLoading(true);
      try {
        const payment = await SourcingService.createBuyerPayment(values as any);
        if ((values as any).__confirmMode) { await SourcingService.confirmBuyerPayment(payment.id); toast.success("Payment confirmed"); } else { toast.success("Payment saved as pending"); }
        callBack?.(); handleClose();
      } catch (e: any) { toast.error(e?.response?.data?.amount?.[0] || "Failed to record payment"); }
      finally { setLoading(false); setSubmitting(false); }
    },
  });
  const submitAs = async (confirmMode: boolean) => { await form.setFieldValue("__confirmMode" as any, confirmMode); form.handleSubmit(); };
  const ActionBtns: FC = () => (<><Button onClick={handleClose} disabled={loading}>Cancel</Button><Button variant="outlined" onClick={() => submitAs(false)} disabled={loading}>Save as Pending</Button><Button variant="contained" color="success" onClick={() => submitAs(true)} disabled={loading}>{loading ? <ProgressIndicator color="inherit" size={20} /> : "Confirm & Settle"}</Button></>);
  return (
    <ModalDialog title={`Record Payment — ${invoice.invoice_number}`} onClose={handleClose} id={uniqueId()} open={true} ActionButtons={ActionBtns}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        <Alert severity="info">Balance Due: <strong>{formatCurrency(invoice.balance_due)}</strong>{invoice.due_date && ` | Due: ${formatDateToDDMMYYYY(invoice.due_date)}`}</Alert>
        <TextField fullWidth label="Amount (UGX) *" type="number" value={form.values.amount} onChange={e => form.setFieldValue("amount", parseFloat(e.target.value))} error={Boolean(form.errors.amount)} helperText={form.errors.amount as string} />
        <FormControl fullWidth><InputLabel>Payment Method *</InputLabel><Select value={form.values.method} label="Payment Method *" onChange={e => form.setFieldValue("method", e.target.value)}>{["bank_transfer", "mobile_money", "cash", "cheque"].map(m => <MenuItem key={m} value={m}>{m.replace(/_/g, " ").toUpperCase()}</MenuItem>)}</Select></FormControl>
        <TextField fullWidth label="Reference Number *" value={form.values.reference_number} onChange={e => form.setFieldValue("reference_number", e.target.value)} error={Boolean(form.errors.reference_number)} helperText={form.errors.reference_number as string} />
        <TextField fullWidth label="Notes" multiline rows={2} value={form.values.notes} onChange={e => form.setFieldValue("notes", e.target.value)} />
        <Alert severity="warning" sx={{ fontSize: 12 }}><strong>Confirm & Settle</strong> applies the payment immediately. If fully paid, settlement runs automatically.</Alert>
      </Box>
    </ModalDialog>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────
const BuyerInvoices: FC = () => {
  useTitle("Buyer Invoices");
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<IBuyerInvoicesResults>();
  const [selectedInvoice, setSelectedInvoice] = useState<IBuyerInvoice | null>(null);
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchData(filters); }, [filters]);

  const fetchData = async (params?: any) => {
    setLoading(true);
    try { setInvoices(await SourcingService.getBuyerInvoices(params)); }
    catch { toast.error("Failed to load invoices"); }
    finally { setLoading(false); }
  };

  const tableActions: IDropdownAction[] = [
    { label: "Record Payment", icon: <AccountBalanceIcon color="success" />, onClick: (inv: IBuyerInvoice) => setSelectedInvoice(inv), condition: (inv: IBuyerInvoice) => !["paid", "cancelled"].includes(inv.status) },
    { label: "Mark Overdue", icon: <WarningAmberIcon color="warning" />, onClick: async (inv: IBuyerInvoice) => { try { await SourcingService.markBuyerInvoiceOverdue(inv.id); toast.success("Marked overdue"); fetchData(filters); } catch { toast.error("Failed"); } }, condition: (inv: IBuyerInvoice) => ["issued", "partial"].includes(inv.status) },
  ];

  const columns = [
    {
      // ✅ FIXED: clickable → navigates to detail page
      Header: "Invoice #", accessor: "invoice_number", minWidth: 180,
      Cell: ({ row }: any) => (
        <Typography color="primary" variant="h6" sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
          onClick={() => navigate(`/admin/sourcing/buyer-invoices/${row.original.id}`)}>
          {row.original.invoice_number}
        </Typography>
      ),
    },
    { Header: "Buyer", accessor: "buyer_name", minWidth: 160 },
    { Header: "Amount Due", accessor: "amount_due", minWidth: 130, Cell: ({ row }: any) => <Span sx={{ fontWeight: 600 }}>{formatCurrency(row.original.amount_due)}</Span> },
    { Header: "Paid", accessor: "amount_paid", minWidth: 120, Cell: ({ row }: any) => <Span sx={{ color: "success.main" }}>{formatCurrency(row.original.amount_paid)}</Span> },
    { Header: "Balance Due", accessor: "balance_due", minWidth: 130, Cell: ({ row }: any) => <Span sx={{ fontWeight: 600, color: row.original.balance_due > 0 ? "error.main" : "success.main" }}>{formatCurrency(row.original.balance_due)}</Span> },
    { Header: "Terms", accessor: "payment_terms_days", minWidth: 110, Cell: ({ row }: any) => <Span>{row.original.payment_terms_days === 0 ? "On Delivery" : `Net ${row.original.payment_terms_days}`}</Span> },
    { Header: "Due Date", accessor: "due_date", minWidth: 130, Cell: ({ row }: any) => <Span sx={{ fontSize: 13, color: row.original.is_overdue ? "error.main" : "inherit" }}>{row.original.due_date ? formatDateToDDMMYYYY(row.original.due_date) : "—"}{row.original.is_overdue && " ⚠"}</Span> },
    { Header: "Status", accessor: "status", minWidth: 110, Cell: ({ row }: any) => <Chip label={row.original.status.toUpperCase()} color={STATUS_COLORS[row.original.status]} size="small" /> },
    { Header: "PDF", accessor: "pdf", minWidth: 60, maxWidth: 80, Cell: ({ row }: any) => <BuyerInvoicePDFButton invoice={row.original} compact size="small" /> },
    { Header: "Action", accessor: "action", minWidth: 80, Cell: ({ row }: any) => <DropdownActionBtn actions={tableActions} metaData={row.original} /> },
  ];

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h5">Buyer Invoices (Accounts Receivable)</Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
          <DateRangeFilter dateFrom={filters.date_from} dateTo={filters.date_to} onApply={(f, t) => setFilters({ ...filters, date_from: f, date_to: t, page: 1 })} />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select value={filters.status || ""} label="Status" onChange={e => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}>
              <MenuItem value="">All</MenuItem>
              {["issued", "partial", "paid", "overdue", "cancelled"].map(s => <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
            </Select>
          </FormControl>
          <ExportButtons data={invoices?.results || []} columns={BUYER_INVOICE_EXPORT_COLUMNS} filename="buyer_invoices" />
        </Box>
      </Box>
      <CustomTable columnShape={columns} data={invoices?.results || []} dataCount={invoices?.count || 0} pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }} setPageIndex={(p: number) => setFilters({ ...filters, page: p + 1 })} pageIndex={filters.page - 1} setPageSize={(s: number) => setFilters({ ...filters, page_size: s, page: 1 })} loading={loading} />
      {selectedInvoice && <RecordPaymentForm invoice={selectedInvoice} handleClose={() => setSelectedInvoice(null)} callBack={() => fetchData(filters)} />}
    </Box>
  );
};

export default BuyerInvoices;