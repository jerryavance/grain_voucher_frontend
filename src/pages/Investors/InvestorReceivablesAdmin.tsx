/**
 * InvestorReceivablesAdmin.tsx
 *
 * Staff-facing view of all open receivables across every investor.
 *
 * Calls GET /api/sourcing/investor-allocations/receivables/
 * Staff role gets every investor's data in one response.
 *
 * Features:
 *   - Filter by investor name (client-side) and invoice status (client-side)
 *   - Summary cards: total invoiced, collected, outstanding, capital deployed,
 *     total estimated margin across all investors
 *   - Per-investor aggregated sub-totals row when grouped view is active
 *   - Full table with investor name column added vs the investor-facing view
 *   - Refresh button
 */

import {
  Box, Button, Card, CardContent, Chip, CircularProgress,
  FormControl, InputLabel, MenuItem, Select, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField,
  Tooltip, Typography, Alert,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import useTitle from "../../hooks/useTitle";
import { SourcingService } from "../Sourcing/Sourcing.service";
import { IInvestorReceivable } from "../Sourcing/Sourcing.interface";
import { formatCurrency } from "../Sourcing/SourcingConstants";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import { ExportButtons } from "../Sourcing/ExportUtils";

// ─── Status chip helper ───────────────────────────────────────────────────────

// ✅ NEW: Export column definitions for Excel/CSV export
const RECEIVABLES_EXPORT_COLUMNS = [
  { header: "Investor", key: "investor_name" },
  { header: "Invoice #", key: "invoice_number" },
  { header: "Buyer", key: "buyer_name" },
  { header: "Grain Type", key: "grain_type" },
  { header: "Destination Warehouse", key: "hub_name" },
  { header: "Invoice Amount", key: "invoice_amount_due" },
  { header: "Paid", key: "invoice_amount_paid" },
  { header: "Balance Due", key: "invoice_balance_due" },
  { header: "Status", key: "invoice_status" },
  { header: "Due Date", key: "invoice_due_date" },
  { header: "Capital Deployed", key: "amount_allocated" },
  { header: "Est. Margin", key: "projected_investor_margin" },
  { header: "Est. Return", key: "projected_return" },
  { header: "Est. ROI %", key: "projected_margin_pct" },
  { header: "Allocation #", key: "allocation_number" },
];

const StatusChip = ({ value }: { value: string }) => (
  <Chip
    label={value.toUpperCase()}
    size="small"
    color={
      value === "paid"    ? "success" :
      value === "partial" ? "warning" :
      value === "overdue" ? "error"   :
      value === "issued"  ? "info"    : "default"
    }
    sx={{ fontWeight: 700, fontSize: "0.68rem" }}
  />
);

// ─── Main Component ───────────────────────────────────────────────────────────

const InvestorReceivablesAdmin = () => {
  useTitle("Investor Receivables");

  const [data, setData]       = useState<IInvestorReceivable[]>([]);
  const [loading, setLoading] = useState(false);

  // ── Filters (client-side — response is small enough) ─────────────────────
  const [investorFilter, setInvestorFilter] = useState("");
  const [statusFilter,   setStatusFilter]   = useState("all");

  // ── Fetch all receivables (staff sees all investors) ──────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await SourcingService.getInvestorReceivables();
      setData(Array.isArray(res) ? res : []);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to load receivables");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ✅ FIX: Unique investor names for filter dropdown — now works because
  //         investor_name is a real field from the API.
  const investorNames = useMemo(() => {
    const names = new Set<string>();
    data.forEach(r => {
      if (r.investor_name) names.add(r.investor_name);
    });
    return Array.from(names).sort();
  }, [data]);

  // ✅ FIX: Use investor_name directly — no more cast to `any`
  const filtered = useMemo(() => {
    return data.filter(r => {
      const matchesInvestor = !investorFilter ||
        (r.investor_name && r.investor_name.toLowerCase().includes(investorFilter.toLowerCase()));
      const matchesStatus = statusFilter === "all" ||
        r.invoice_status === statusFilter;
      return matchesInvestor && matchesStatus;
    });
  }, [data, investorFilter, statusFilter]);

  // ── Totals ────────────────────────────────────────────────────────────────
  const totals = useMemo(() => filtered.reduce(
    (acc, r) => ({
      invoiceDue:      acc.invoiceDue      + Number(r.invoice_amount_due),
      invoicePaid:     acc.invoicePaid     + Number(r.invoice_amount_paid),
      invoiceBalance:  acc.invoiceBalance  + Number(r.invoice_balance_due),
      capitalDeployed: acc.capitalDeployed + Number(r.amount_allocated),
      estMargin:       acc.estMargin       + Number(r.projected_investor_margin),
      estReturn:       acc.estReturn       + Number(r.projected_return),
    }),
    { invoiceDue: 0, invoicePaid: 0, invoiceBalance: 0, capitalDeployed: 0, estMargin: 0, estReturn: 0 }
  ), [filtered]);

  return (
    <Box sx={{ p: 3 }}>

      {/* ── Page header ── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <TrendingUpIcon sx={{ fontSize: 36, color: "primary.main" }} />
          <Typography variant="h4">Investor Receivables</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {/* ✅ NEW: Excel/CSV export buttons */}
          <ExportButtons
            data={filtered}
            columns={RECEIVABLES_EXPORT_COLUMNS}
            filename="investor_receivables"
          />
          <Button
            variant="outlined"
            startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={fetchData}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* ── Info banner ── */}
      <Alert severity="info" icon={<InfoOutlinedIcon fontSize="inherit" />} sx={{ mb: 3 }}>
        Shows all buyer invoices backed by investor capital that have been issued but not yet fully
        settled. <strong>Est. Margin</strong> is the investor's projected return based on current
        order P&amp;L — it becomes confirmed once the buyer pays in full.
      </Alert>

      {/* ── Summary cards ── */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
        gap: 2,
        mb: 3,
      }}>
        {[
          { icon: <AccountBalanceIcon />, label: "Total Invoiced",      value: formatCurrency(totals.invoiceDue),      color: "text.primary"  },
          { icon: <AccountBalanceIcon />, label: "Collected",           value: formatCurrency(totals.invoicePaid),     color: "success.main"  },
          { icon: <AccountBalanceIcon />, label: "Outstanding",         value: formatCurrency(totals.invoiceBalance),  color: "error.main"    },
          { icon: <AccountBalanceIcon />, label: "Capital Deployed",    value: formatCurrency(totals.capitalDeployed), color: "text.primary"  },
          { icon: <TrendingUpIcon />,     label: "Est. Total Margin",   value: formatCurrency(totals.estMargin),       color: "primary.main"  },
          { icon: <TrendingUpIcon />,     label: "Est. Total Return",   value: formatCurrency(totals.estReturn),       color: "primary.main"  },
        ].map(({ icon, label, value, color }) => (
          <Card key={label} elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
            <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                <Box sx={{ color: "text.primary", display: "flex", fontSize: 16 }}>{icon}</Box>
                <Typography variant="caption" color="text.primary">{label}</Typography>
              </Box>
              <Typography variant="h6" fontWeight={700} sx={{ color }}>
                {value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* ── Filters ── */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        {/* ✅ FIX: investor filter now populated from real data */}
        {investorNames.length > 0 ? (
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Investor</InputLabel>
            <Select
              value={investorFilter}
              label="Investor"
              onChange={(e) => setInvestorFilter(e.target.value)}
            >
              <MenuItem value="">All Investors</MenuItem>
              {investorNames.map((name) => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <TextField
            label="Search investor"
            size="small"
            value={investorFilter}
            onChange={e => setInvestorFilter(e.target.value)}
            placeholder="Type investor name…"
            sx={{ minWidth: 220 }}
          />
        )}
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Invoice Status</InputLabel>
          <Select
            value={statusFilter}
            label="Invoice Status"
            onChange={e => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="issued">Issued</MenuItem>
            <MenuItem value="partial">Partially Paid</MenuItem>
            <MenuItem value="overdue">Overdue</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.primary" sx={{ alignSelf: "center" }}>
          {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          {filtered.length !== data.length ? ` (filtered from ${data.length})` : ""}
        </Typography>
      </Box>

      {/* ── Table ── */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Alert severity="info">
          No receivables found{statusFilter !== "all" ? ` with status "${statusFilter}"` : ""}.
          Receivables appear here when buyer invoices are issued for trades funded by investors.
        </Alert>
      ) : (
        <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
          <TableContainer>
            <Table size="small" sx={{ minWidth: 1100 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "#1565c0" }}>
                  <TableCell sx={thStyle}>Investor</TableCell>
                  <TableCell sx={thStyle}>Invoice #</TableCell>
                  <TableCell sx={thStyle}>Buyer · Grain · Warehouse</TableCell>
                  <TableCell sx={thStyle}>Invoice Amount</TableCell>
                  <TableCell sx={thStyle}>Paid</TableCell>
                  <TableCell sx={thStyle}>Balance Due</TableCell>
                  <TableCell sx={thStyle}>Status</TableCell>
                  <TableCell sx={thStyle}>Due Date</TableCell>
                  <TableCell sx={thStyle}>Capital Deployed</TableCell>
                  <TableCell sx={{ ...thStyle, color: "#e3f2fd" }}>
                    <Tooltip title="Investor's estimated cut of the current order gross profit, applying their profit-sharing agreement. Updates live until settlement.">
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        Est. Margin <InfoOutlinedIcon sx={{ fontSize: 13 }} />
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ ...thStyle, color: "#e3f2fd" }}>
                    <Tooltip title="Capital deployed + estimated margin">
                      <span>Est. Return</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ ...thStyle, color: "#e3f2fd" }}>
                    <Tooltip title="Est. margin ÷ capital deployed × 100">
                      <span>Est. ROI %</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={thStyle}>Alloc. #</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filtered.map((item, idx) => {
                  const estMargin  = Number(item.projected_investor_margin);
                  const estReturn  = Number(item.projected_return);
                  const estRoi     = Number(item.projected_margin_pct);
                  const balanceDue = Number(item.invoice_balance_due);
                  const amtPaid    = Number(item.invoice_amount_paid);

                  return (
                    <TableRow key={item.buyer_invoice_id || idx} hover>
                      {/* ✅ FIX: Investor name from real field */}
                      <TableCell sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                        {item.investor_name || "—"}
                      </TableCell>

                      {/* Invoice # */}
                      <TableCell sx={{ fontWeight: 700, color: "primary.main", whiteSpace: "nowrap" }}>
                        {item.invoice_number}
                      </TableCell>

                      {/* Buyer · Grain · Warehouse */}
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{item.buyer_name}</Typography>
                        <Typography variant="caption" color="text.primary">
                          {item.grain_type}{item.hub_name ? ` · ${item.hub_name}` : ""}
                        </Typography>
                      </TableCell>

                      {/* Invoice amount */}
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatCurrency(item.invoice_amount_due)}
                      </TableCell>

                      {/* Paid */}
                      <TableCell sx={{ color: amtPaid > 0 ? "success.main" : "text.primary", whiteSpace: "nowrap" }}>
                        {formatCurrency(item.invoice_amount_paid)}
                      </TableCell>

                      {/* Balance due */}
                      <TableCell sx={{ fontWeight: 600, color: balanceDue > 0 ? "error.main" : "success.main", whiteSpace: "nowrap" }}>
                        {formatCurrency(item.invoice_balance_due)}
                      </TableCell>

                      {/* Status */}
                      <TableCell><StatusChip value={item.invoice_status} /></TableCell>

                      {/* Due date */}
                      <TableCell sx={{ whiteSpace: "nowrap", color: item.invoice_status === "overdue" ? "error.main" : "inherit" }}>
                        {item.invoice_due_date ? formatDateToDDMMYYYY(item.invoice_due_date) : "—"}
                      </TableCell>

                      {/* Capital deployed */}
                      <TableCell sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                        {formatCurrency(item.amount_allocated)}
                      </TableCell>

                      {/* Est. margin */}
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Typography variant="body2" fontWeight={700} sx={{ color: estMargin >= 0 ? "primary.main" : "error.main" }}>
                          {formatCurrency(estMargin)}
                        </Typography>
                        <Typography variant="caption" color="text.primary">
                          {item.profit_threshold_pct}% thr · {item.investor_share_pct}% share
                        </Typography>
                      </TableCell>

                      {/* Est. return */}
                      <TableCell sx={{ fontWeight: 700, color: "primary.main", whiteSpace: "nowrap" }}>
                        {formatCurrency(estReturn)}
                      </TableCell>

                      {/* Est. ROI % */}
                      <TableCell>
                        <Chip
                          label={`${estRoi.toFixed(2)}%`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            bgcolor: estRoi >= 0 ? "#e3f2fd" : "#ffebee",
                            color:   estRoi >= 0 ? "#1565c0" : "#c62828",
                          }}
                        />
                      </TableCell>

                      {/* Allocation # */}
                      <TableCell sx={{ fontFamily: "monospace", fontSize: "0.72rem", color: "text.primary", whiteSpace: "nowrap" }}>
                        {item.allocation_number}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>

              {/* Totals footer */}
              <TableBody>
                <TableRow sx={{ bgcolor: "#f6f9fd", borderTop: "2px solid #1565c0" }}>
                  <TableCell sx={{ fontWeight: 700, color: "text.primary", fontSize: "0.72rem", letterSpacing: 0.5 }}>
                    TOTALS
                  </TableCell>
                  <TableCell />{/* invoice # */}
                  <TableCell />{/* buyer */}
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>{formatCurrency(totals.invoiceDue)}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "success.main", whiteSpace: "nowrap" }}>{formatCurrency(totals.invoicePaid)}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "error.main", whiteSpace: "nowrap" }}>{formatCurrency(totals.invoiceBalance)}</TableCell>
                  <TableCell />{/* status */}
                  <TableCell />{/* due date */}
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>{formatCurrency(totals.capitalDeployed)}</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "primary.main", whiteSpace: "nowrap" }}>{formatCurrency(totals.estMargin)}</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "primary.main", whiteSpace: "nowrap" }}>{formatCurrency(totals.estReturn)}</TableCell>
                  <TableCell />{/* ROI */}
                  <TableCell />{/* alloc # */}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
};

// ─── Shared table header cell style ──────────────────────────────────────────
const thStyle = {
  color: "#fff",
  fontWeight: 700,
  fontSize: "0.7rem",
  textTransform: "uppercase" as const,
  letterSpacing: 0.8,
  whiteSpace: "nowrap" as const,
};

export default InvestorReceivablesAdmin;