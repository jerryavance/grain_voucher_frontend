/**
 * BuyerPayments.tsx
 * - Record Payment via toolbar button (global) + row action (per payment's invoice)
 * - Payment # clickable → navigates to BuyerPaymentDetails
 * - Receipt generation via PaymentReceiptPDFButton
 * - ExportButtons + DateRangeFilter
 */

import { FC, useEffect, useRef, useState } from "react";
import {
  Autocomplete, Box, Button, Chip, CircularProgress, FormControl,
  Grid, InputLabel, MenuItem, Select, TextField, Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReplayIcon from "@mui/icons-material/Replay";
import PaymentIcon from "@mui/icons-material/Payment";
import { useFormik } from "formik";
import * as Yup from "yup";
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
import { IBuyerInvoice, IBuyerPayment, IBuyerPaymentsResults } from "./Sourcing.interface";
import PaymentReceiptPDFButton from "./PaymentReceiptPDFButton";
import { ExportButtons, BUYER_PAYMENT_EXPORT_COLUMNS } from "./ExportUtils";
import DateRangeFilter from "./DateRangeFilter";

const STATUS_COLORS: Record<string, any> = {
  pending: "warning", confirmed: "success", failed: "error", reversed: "default",
};

const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "mobile_money", label: "Mobile Money" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
];

// ── Record Payment Form ──────────────────────────────────────────────────────
interface IRecordPaymentFormProps {
  handleClose: () => void;
  /** Pre-select an invoice when launched from a row action */
  preselectedInvoice?: IBuyerInvoice | null;
  callBack?: () => void;
}

const RecordPaymentForm: FC<IRecordPaymentFormProps> = ({ handleClose, preselectedInvoice, callBack }) => {
  const modalId = useRef(uniqueId()).current;
  const [loading, setLoading] = useState(false);

  // Invoice search state
  const [invoices, setInvoices] = useState<IBuyerInvoice[]>([]);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<IBuyerInvoice | null>(preselectedInvoice ?? null);

  // Fetch invoices for autocomplete (only unpaid/partial)
  useEffect(() => {
    let cancelled = false;
    setInvoicesLoading(true);
    SourcingService.getBuyerInvoices({ search: invoiceSearch, page_size: 30 })
      .then(r => {
        if (!cancelled) {
          // Filter to invoices that still have a balance
          setInvoices(r.results.filter(inv => inv.balance_due > 0 && !["paid", "cancelled"].includes(inv.status)));
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setInvoicesLoading(false); });
    return () => { cancelled = true; };
  }, [invoiceSearch]);

  const form = useFormik({
    initialValues: {
      buyer_invoice: preselectedInvoice?.id ?? "",
      amount: preselectedInvoice?.balance_due ?? 0,
      method: "bank_transfer" as IBuyerPayment["method"],
      reference_number: "",
      payment_date: new Date().toISOString().split("T")[0],
      notes: "",
    },
    validationSchema: Yup.object({
      buyer_invoice: Yup.string().required("Select an invoice"),
      amount: Yup.number().required("Amount is required").positive("Must be positive"),
      method: Yup.string().required("Select a payment method"),
      payment_date: Yup.string().required("Payment date is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const payment = await SourcingService.createBuyerPayment({
          buyer_invoice: values.buyer_invoice,
          amount: values.amount,
          method: values.method,
          reference_number: values.reference_number || undefined,
          payment_date: values.payment_date,
          notes: values.notes || undefined,
        } as Partial<IBuyerPayment>);
        toast.success(`Payment ${payment.payment_number} recorded`);
        callBack?.();
        handleClose();
      } catch (e: any) {
        const msg =
          e?.response?.data?.non_field_errors?.[0] ||
          e?.response?.data?.amount?.[0] ||
          e?.response?.data?.buyer_invoice?.[0] ||
          "Failed to record payment";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
  });

  // When invoice selection changes, auto-fill amount with balance due
  const handleInvoiceChange = (invoice: IBuyerInvoice | null) => {
    setSelectedInvoice(invoice);
    if (invoice) {
      form.setFieldValue("buyer_invoice", invoice.id);
      form.setFieldValue("amount", invoice.balance_due);
    } else {
      form.setFieldValue("buyer_invoice", "");
      form.setFieldValue("amount", 0);
    }
  };

  return (
    <ModalDialog
      title="Record Buyer Payment"
      onClose={handleClose}
      id={modalId}
      open={true}
      maxWidth="sm"
      ActionButtons={() => (
        <>
          <Button onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={() => form.handleSubmit()} disabled={loading}>
            {loading ? <ProgressIndicator color="inherit" size={20} /> : "Record Payment"}
          </Button>
        </>
      )}
    >
      <Grid container spacing={2} sx={{ pt: 1 }}>

        {/* Invoice selector */}
        <Grid item xs={12}>
          <Autocomplete
            options={invoices}
            loading={invoicesLoading}
            value={selectedInvoice}
            onChange={(_, val) => handleInvoiceChange(val)}
            onInputChange={(_, val) => setInvoiceSearch(val)}
            getOptionLabel={inv => `${inv.invoice_number} — ${inv.buyer_name} (Balance: ${formatCurrency(inv.balance_due)})`}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            // If launched from a row, allow editing (not locked) per spec
            renderInput={params => (
              <TextField
                {...params}
                label="Invoice *"
                error={Boolean(form.errors.buyer_invoice && form.touched.buyer_invoice)}
                helperText={form.touched.buyer_invoice ? form.errors.buyer_invoice as string : ""}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {invoicesLoading && <CircularProgress color="inherit" size={18} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
          {selectedInvoice && (
            <Box sx={{ mt: 1, p: 1.5, bgcolor: "action.hover", borderRadius: 1 }}>
              <Typography variant="caption" color="text.primary">
                Invoice: <strong>{selectedInvoice.invoice_number}</strong>
                &nbsp;·&nbsp;Total: <strong>{formatCurrency(selectedInvoice.amount_due)}</strong>
                &nbsp;·&nbsp;Paid: <strong>{formatCurrency(selectedInvoice.amount_paid)}</strong>
                &nbsp;·&nbsp;Balance: <strong style={{ color: "inherit" }}>{formatCurrency(selectedInvoice.balance_due)}</strong>
              </Typography>
            </Box>
          )}
        </Grid>

        {/* Amount */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Amount *"
            type="number"
            value={form.values.amount}
            onChange={e => form.setFieldValue("amount", parseFloat(e.target.value) || 0)}
            error={Boolean(form.errors.amount && form.touched.amount)}
            helperText={form.touched.amount ? form.errors.amount as string : ""}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>

        {/* Payment Method */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={Boolean(form.errors.method && form.touched.method)}>
            <InputLabel>Method *</InputLabel>
            <Select
              value={form.values.method}
              label="Method *"
              onChange={e => form.setFieldValue("method", e.target.value)}
            >
              {PAYMENT_METHODS.map(m => (
                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Reference Number */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Reference / Transaction #"
            value={form.values.reference_number}
            onChange={e => form.setFieldValue("reference_number", e.target.value)}
            placeholder="e.g. TXN123456"
          />
        </Grid>

        {/* Payment Date */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Payment Date *"
            type="date"
            value={form.values.payment_date}
            onChange={e => form.setFieldValue("payment_date", e.target.value)}
            InputLabelProps={{ shrink: true }}
            error={Boolean(form.errors.payment_date && form.touched.payment_date)}
            helperText={form.touched.payment_date ? form.errors.payment_date as string : ""}
          />
        </Grid>

        {/* Notes */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={2}
            value={form.values.notes}
            onChange={e => form.setFieldValue("notes", e.target.value)}
          />
        </Grid>

      </Grid>
    </ModalDialog>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
const BuyerPayments: FC = () => {
  useTitle("Buyer Payments");
  const navigate = useNavigate();
  const [payments, setPayments] = useState<IBuyerPaymentsResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState(false);

  // Modal state
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [preselectedInvoice, setPreselectedInvoice] = useState<IBuyerInvoice | null>(null);

  useEffect(() => { fetchData(filters); }, [filters]);

  const fetchData = async (params?: any) => {
    setLoading(true);
    try { setPayments(await SourcingService.getBuyerPayments(params)); }
    catch { toast.error("Failed to load payments"); }
    finally { setLoading(false); }
  };

  /** Open the form pre-selecting the invoice linked to this payment row */
  const openRecordFromRow = async (payment: IBuyerPayment) => {
    try {
      // Fetch the invoice so we have full balance/amount details
      const invoice = await SourcingService.getBuyerInvoiceDetails(payment.buyer_invoice);
      setPreselectedInvoice(invoice);
    } catch {
      // Fall back to no preselection if fetch fails
      setPreselectedInvoice(null);
    }
    setShowRecordForm(true);
  };

  const tableActions: IDropdownAction[] = [
    {
      label: "Record Payment",
      icon: <PaymentIcon color="primary" />,
      onClick: (p: IBuyerPayment) => openRecordFromRow(p),
      // Only allow recording against invoices that aren't fully settled
      condition: (p: IBuyerPayment) => p.status !== "reversed",
    },
    {
      label: "Confirm",
      icon: <CheckCircleIcon color="success" />,
      onClick: async (p: IBuyerPayment) => {
        try { await SourcingService.confirmBuyerPayment(p.id); toast.success("Confirmed"); fetchData(filters); }
        catch { toast.error("Failed to confirm"); }
      },
      condition: (p: IBuyerPayment) => p.status === "pending",
    },
    {
      label: "Reverse",
      icon: <ReplayIcon color="error" />,
      onClick: async (p: IBuyerPayment) => {
        if (!window.confirm("Are you sure you want to reverse this payment?")) return;
        try { await SourcingService.reverseBuyerPayment(p.id); toast.success("Reversed"); fetchData(filters); }
        catch { toast.error("Failed to reverse"); }
      },
      condition: (p: IBuyerPayment) => p.status === "confirmed",
    },
  ];

  const columns = [
    {
      Header: "Payment #",
      accessor: "payment_number",
      minWidth: 180,
      Cell: ({ row }: any) => (
        <Typography
          color="primary"
          variant="h6"
          sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
          onClick={() => navigate(`/admin/sourcing/buyer-payments/${row.original.id}`)}
        >
          {row.original.payment_number}
        </Typography>
      ),
    },
    { Header: "Invoice #", accessor: "invoice_number", minWidth: 160 },
    { Header: "Buyer", accessor: "buyer_name", minWidth: 150 },
    {
      Header: "Amount",
      accessor: "amount",
      minWidth: 130,
      Cell: ({ row }: any) => (
        <Span sx={{ fontWeight: 600, color: "success.main" }}>{formatCurrency(row.original.amount)}</Span>
      ),
    },
    {
      Header: "Method",
      accessor: "method",
      minWidth: 140,
      Cell: ({ row }: any) => (
        <Chip label={row.original.method.replace(/_/g, " ").toUpperCase()} size="small" variant="outlined" />
      ),
    },
    {
      Header: "Reference",
      accessor: "reference_number",
      minWidth: 160,
      Cell: ({ row }: any) => (
        <Span sx={{ fontFamily: "monospace", fontSize: 12 }}>{row.original.reference_number || "—"}</Span>
      ),
    },
    {
      Header: "Status",
      accessor: "status",
      minWidth: 110,
      Cell: ({ row }: any) => (
        <Chip label={row.original.status.toUpperCase()} color={STATUS_COLORS[row.original.status]} size="small" />
      ),
    },
    {
      Header: "Date",
      accessor: "payment_date",
      minWidth: 130,
      Cell: ({ row }: any) => (
        <Span sx={{ fontSize: 13 }}>{formatDateToDDMMYYYY(row.original.payment_date)}</Span>
      ),
    },
    {
      Header: "Receipt",
      accessor: "receipt",
      minWidth: 80,
      Cell: ({ row }: any) => (
        <PaymentReceiptPDFButton payment={row.original} type="buyer" compact size="small" />
      ),
    },
    {
      Header: "Action",
      accessor: "action",
      minWidth: 80,
      Cell: ({ row }: any) => <DropdownActionBtn actions={tableActions} metaData={row.original} />,
    },
  ];

  return (
    <Box pt={2} pb={4}>
      {/* Toolbar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h5">Buyer Payments</Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
          <DateRangeFilter
            dateFrom={filters.date_from}
            dateTo={filters.date_to}
            onApply={(f, t) => setFilters({ ...filters, date_from: f, date_to: t, page: 1 })}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status || ""}
              label="Status"
              onChange={e => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}
            >
              <MenuItem value="">All</MenuItem>
              {["pending", "confirmed", "failed", "reversed"].map(s => (
                <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <ExportButtons data={payments?.results || []} columns={BUYER_PAYMENT_EXPORT_COLUMNS} filename="buyer_payments" />
          {/* ✅ NEW: Global record payment button */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => { setPreselectedInvoice(null); setShowRecordForm(true); }}
          >
            Record Payment
          </Button>
        </Box>
      </Box>

      <CustomTable
        columnShape={columns}
        data={payments?.results || []}
        dataCount={payments?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(p: number) => setFilters({ ...filters, page: p + 1 })}
        pageIndex={filters.page - 1}
        setPageSize={(s: number) => setFilters({ ...filters, page_size: s, page: 1 })}
        loading={loading}
      />

      {/* ✅ NEW: Record Payment Modal */}
      {showRecordForm && (
        <RecordPaymentForm
          handleClose={() => { setShowRecordForm(false); setPreselectedInvoice(null); }}
          preselectedInvoice={preselectedInvoice}
          callBack={() => fetchData(filters)}
        />
      )}
    </Box>
  );
};

export default BuyerPayments;