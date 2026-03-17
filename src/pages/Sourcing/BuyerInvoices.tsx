// sourcing/pages/BuyerInvoices.tsx
/**
 * Buyer Invoices list page (SOURCING → Sales → Buyer Invoices).
 *
 * FIXES (Images 10, 11):
 *  - "Amount Paid" column now shows correct values. The doubled amounts were
 *    caused by a backend bug (BuyerPayment.confirm() + signal both incrementing
 *    amount_paid). Backend is now fixed — amount_paid is recalculated from
 *    aggregate of confirmed payments.
 *  - Added date range filter (From/To) as shown in the UI
 *  - Added status filter dropdown
 */
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
} from "@mui/material";
import { Download as DownloadIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import SourcingService from "./Sourcing.service";
import {
  formatCurrency,
  formatDate,
  formatStatus,
  getStatusColor,
} from "../../utils/formatters";

const INVOICE_STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "issued", label: "Issued" },
  { value: "partial", label: "Partially Paid" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
];

const BuyerInvoices: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page: page + 1,
        page_size: rowsPerPage,
      };
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (statusFilter) params.status = statusFilter;

      const res = await SourcingService.getBuyerInvoices(params);
      setInvoices(res.results || res || []);
      setTotalCount(res.count || 0);
    } catch (err: any) {
      toast.error("Failed to load buyer invoices");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, dateFrom, dateTo, statusFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleFilter = () => {
    setPage(0);
    fetchInvoices();
  };

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Buyer Invoices (Accounts Receivable)
      </Typography>

      {/* ── Filters ────────────────────────────────────────────────────── */}
      <Box display="flex" gap={2} alignItems="center" mb={3}>
        <TextField
          label="From"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <TextField
          label="To"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
        <Button variant="contained" onClick={handleFilter}>
          Filter
        </Button>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
          >
            {INVOICE_STATUSES.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box flex={1} />
        <Button variant="outlined" startIcon={<DownloadIcon />}>
          Export
        </Button>
      </Box>

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Invoice #</TableCell>
                <TableCell>Buyer</TableCell>
                <TableCell>Amount Due</TableCell>
                {/* ✅ FIX: Amount Paid is now correct from backend (was doubled) */}
                <TableCell>Paid</TableCell>
                <TableCell>Balance Due</TableCell>
                <TableCell>Terms</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((inv, idx) => (
                  <TableRow
                    key={inv.id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() =>
                      navigate(`/admin/sourcing/buyer-invoices/${inv.id}`)
                    }
                  >
                    <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#1565c0" }}>
                      {inv.invoice_number}
                    </TableCell>
                    <TableCell>
                      {inv.buyer_profile_name ||
                        inv.buyer_name ||
                        "—"}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(inv.amount_due)}
                    </TableCell>
                    <TableCell
                      sx={{
                        color:
                          Number(inv.amount_paid) > 0
                            ? "#4caf50"
                            : "inherit",
                      }}
                    >
                      {formatCurrency(inv.amount_paid)}
                    </TableCell>
                    <TableCell
                      sx={{
                        color:
                          Number(inv.balance_due) > 0
                            ? "#f44336"
                            : "#4caf50",
                        fontWeight: 600,
                      }}
                    >
                      {formatCurrency(inv.balance_due)}
                    </TableCell>
                    <TableCell>
                      {inv.payment_terms_days > 0
                        ? `Net ${inv.payment_terms_days}`
                        : "—"}
                    </TableCell>
                    <TableCell>{formatDate(inv.due_date)}</TableCell>
                    <TableCell>
                      <Chip
                        label={formatStatus(inv.status).toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(inv.status),
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.7rem",
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={() => {}}
        />
      </Card>
    </Box>
  );
};

export default BuyerInvoices;