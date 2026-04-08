/**
 * Reports.tsx — UPDATED with export support
 * ==========================================
 * Added <ReportExportBar> to the header toolbar.
 * All other logic is unchanged.
 *
 * New import (add alongside existing imports):
 *   import { ReportExportBar } from "./ReportExports";
 *
 * The only change to the JSX is in the header <Box>:
 *   replace the closing </Box> with the snippet below.
 */

// ─── DIFF — only the changed section is shown ────────────────────────────────
//
// BEFORE (inside the header Box, after the date fields & Refresh button):
//
//   <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefresh} disabled={loading}>Refresh</Button>
//   </Box>   {/* closes the right-side flex Box */}
//
// AFTER:
//
//   <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefresh} disabled={loading}>Refresh</Button>
//   <ReportExportBar tab={tab} data={data} loading={loading} />
//   </Box>   {/* closes the right-side flex Box */}
//
// That's literally the only change needed in Reports.tsx.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Full updated Reports.tsx ─────────────────────────────────────────────────

import React, { useEffect, useState, useCallback } from "react";
import {
  Alert, Box, Button, Card, CardContent, Chip, Collapse,
  Divider, FormControl, Grid, IconButton, InputLabel, LinearProgress,
  MenuItem, Paper, Select, Skeleton, Tab, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Tabs, TextField,
  Tooltip, Typography,
} from "@mui/material";
import {
  Assessment, AccountBalance, People, TrendingUp, LocalShipping,
  ExpandMore, ExpandLess, Download, Refresh, WarningAmber, MonetizationOn,
} from "@mui/icons-material";
import { toast } from "react-hot-toast";
import useTitle from "../../hooks/useTitle";
import SourcingService from "../Sourcing/Sourcing.service";
import { ReportExportBar } from "./ReportExports"; // ← NEW IMPORT

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (v: string | number) => {
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (isNaN(n)) return "—";
  return `${n < 0 ? "-" : ""}${Math.abs(n).toLocaleString("en-UG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};
const fmtUGX = (v: string | number) => `UGX ${fmt(v)}`;
const fmtPct = (v: string | number) => `${parseFloat(String(v) || "0").toFixed(1)}%`;
const fmtDate = (v: string | null) => {
  if (!v) return "—";
  try { return new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return v; }
};

const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, any> = {
    issued: "primary", partial: "warning", overdue: "error",
    paid: "success", cancelled: "default", active: "info",
    settled: "success", pending: "warning", completed: "success",
  };
  return <Chip label={status.toUpperCase()} color={colors[status] || "default"} size="small" sx={{ fontWeight: 700, fontSize: "0.65rem" }} />;
};

interface TabPanelProps { children?: React.ReactNode; index: number; value: number; }
function TabPanel({ children, value, index }: TabPanelProps) {
  return <div role="tabpanel" hidden={value !== index}>{value === index && <Box sx={{ pt: 2 }}>{children}</Box>}</div>;
}

const SummaryCard: React.FC<{ label: string; value: string; color?: string; icon?: React.ReactNode }> = ({ label, value, color = "text.primary", icon }) => (
  <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
    <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 }, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" sx={{ letterSpacing: 0.5 }}>{label}</Typography>
        <Typography variant="h6" fontWeight={700} sx={{ color }}>{value}</Typography>
      </Box>
      {icon && <Box sx={{ color, opacity: 0.5 }}>{icon}</Box>}
    </CardContent>
  </Card>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const Reports: React.FC = () => {
  useTitle("Financial Reports");
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchReport = useCallback(async (tabIndex: number) => {
    setLoading(true);
    setData(null);
    const params: any = {};
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    try {
      switch (tabIndex) {
        case 0: setData(await SourcingService.getReceivablesAgingReport(params)); break;
        case 1: setData(await SourcingService.getBuyerLedgerReport(params)); break;
        case 2: setData(await SourcingService.getAssetsLiabilitiesReport(params)); break;
        case 3: setData(await SourcingService.getInvestorExposureReport(params)); break;
        case 4: setData(await SourcingService.getTradePnlReport(params)); break;
        case 5: setData(await SourcingService.getSupplierPayablesReport(params)); break;
      }
    } catch (e: any) {
      toast.error(e.response?.data?.detail || "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => { fetchReport(tab); }, [tab]);

  const handleRefresh = () => fetchReport(tab);

  const tabConfig = [
    { label: "Receivables Aging", icon: <WarningAmber /> },
    { label: "Buyer Ledger", icon: <People /> },
    { label: "Assets & Liabilities", icon: <AccountBalance /> },
    { label: "Investor Exposure", icon: <MonetizationOn /> },
    { label: "Trade P&L", icon: <TrendingUp /> },
    { label: "Supplier Payables", icon: <LocalShipping /> },
  ];

  return (
    <Box pt={2} pb={4}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Assessment sx={{ fontSize: 36, color: "primary.main" }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>Financial Reports</Typography>
            <Typography variant="body2" color="text.secondary">Accounts visibility and analysis</Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
          <TextField size="small" type="date" label="From" value={dateFrom} onChange={e => setDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 150 }} />
          <TextField size="small" type="date" label="To" value={dateTo} onChange={e => setDateTo(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 150 }} />
          <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefresh} disabled={loading}>Refresh</Button>
          {/* ↓ NEW — export bar, switches columns & PDF per active tab */}
          <ReportExportBar tab={tab} data={data} loading={loading} />
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: "divider", mb: 0 }}>
        {tabConfig.map((t, i) => <Tab key={i} icon={t.icon} iconPosition="start" label={t.label} sx={{ textTransform: "none", fontWeight: 600, minHeight: 48 }} />)}
      </Tabs>

      {loading && <LinearProgress sx={{ mt: 0 }} />}

      {/* Tab Panels */}
      <TabPanel value={tab} index={0}>{data && <ReceivablesAgingReport data={data} />}</TabPanel>
      <TabPanel value={tab} index={1}>{data && <BuyerLedgerReport data={data} />}</TabPanel>
      <TabPanel value={tab} index={2}>{data && <AssetsLiabilitiesReport data={data} />}</TabPanel>
      <TabPanel value={tab} index={3}>{data && <InvestorExposureReport data={data} />}</TabPanel>
      <TabPanel value={tab} index={4}>{data && <TradePnlReport data={data} />}</TabPanel>
      <TabPanel value={tab} index={5}>{data && <SupplierPayablesReport data={data} />}</TabPanel>
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// All sub-report components below are IDENTICAL to the original — no changes.
// ═══════════════════════════════════════════════════════════════════════════════

const ReceivablesAgingReport: React.FC<{ data: any }> = ({ data }) => {
  const [expandedBucket, setExpandedBucket] = useState<string | null>(null);
  const bucketColors: Record<string, string> = {
    current: "#4caf50", week2: "#8bc34a", month1: "#ff9800", month2: "#f44336", over60: "#b71c1c",
  };

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <SummaryCard label="Total Outstanding" value={fmtUGX(data.grand_total)} color="error.main" icon={<WarningAmber />} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard label="Total Invoices" value={data.total_invoices} color="text.primary" />
        </Grid>
        {data.summary?.map((s: any) => (
          <Grid item xs={6} sm={3} key={s.bucket}>
            <SummaryCard label={s.bucket} value={`${s.count} inv — ${fmtUGX(s.total)}`} />
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>Aging Distribution</Typography>
          <Box sx={{ display: "flex", height: 32, borderRadius: 1, overflow: "hidden" }}>
            {Object.entries(data.buckets || {}).map(([key, b]: [string, any]) => {
              const pct = parseFloat(data.grand_total) > 0 ? (parseFloat(b.total) / parseFloat(data.grand_total) * 100) : 0;
              if (pct === 0) return null;
              return (
                <Tooltip key={key} title={`${b.label}: ${fmtUGX(b.total)} (${pct.toFixed(1)}%)`}>
                  <Box sx={{ width: `${pct}%`, bgcolor: bucketColors[key] || "#999", minWidth: pct > 0 ? 4 : 0, cursor: "pointer" }}
                    onClick={() => setExpandedBucket(expandedBucket === key ? null : key)} />
                </Tooltip>
              );
            })}
          </Box>
          <Box sx={{ display: "flex", gap: 2, mt: 1, flexWrap: "wrap" }}>
            {Object.entries(bucketColors).map(([k, c]) => (
              <Box key={k} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: c }} />
                <Typography variant="caption">{data.buckets?.[k]?.label || k}</Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {Object.entries(data.buckets || {}).map(([key, b]: [string, any]) => (
        <Card key={key} sx={{ mb: 1 }}>
          <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 }, cursor: "pointer" }}
            onClick={() => setExpandedBucket(expandedBucket === key ? null : key)}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: bucketColors[key] || "#999" }} />
                <Typography fontWeight={700}>{b.label}</Typography>
                <Chip label={`${b.count} invoices`} size="small" variant="outlined" />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography fontWeight={700} color="error.main">{fmtUGX(b.total)}</Typography>
                {expandedBucket === key ? <ExpandLess /> : <ExpandMore />}
              </Box>
            </Box>
          </CardContent>
          <Collapse in={expandedBucket === key}>
            {b.invoices?.length > 0 && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "action.hover" }}>
                      {["Invoice #", "Buyer", "Hub", "Due", "Paid", "Balance", "Penalty", "Due Date", "Days", "Status"].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.75rem" }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {b.invoices.map((inv: any) => (
                      <TableRow key={inv.id} hover>
                        <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>{inv.invoice_number}</TableCell>
                        <TableCell>{inv.buyer_name}</TableCell>
                        <TableCell>{inv.hub}</TableCell>
                        <TableCell>{fmtUGX(inv.amount_due)}</TableCell>
                        <TableCell>{fmtUGX(inv.amount_paid)}</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "error.main" }}>{fmtUGX(inv.balance_due)}</TableCell>
                        <TableCell>{parseFloat(inv.penalty_amount) > 0 ? fmtUGX(inv.penalty_amount) : "—"}</TableCell>
                        <TableCell>{fmtDate(inv.due_date)}</TableCell>
                        <TableCell><Chip label={`${inv.days_outstanding}d`} size="small" color={inv.days_outstanding > 30 ? "error" : inv.days_outstanding > 14 ? "warning" : "default"} variant="outlined" /></TableCell>
                        <TableCell><StatusChip status={inv.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Collapse>
        </Card>
      ))}
    </Box>
  );
};

const BuyerLedgerReport: React.FC<{ data: any }> = ({ data }) => (
  <Box>
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[
        { label: "Total Invoiced", value: fmtUGX(data.totals?.total_invoiced), color: "text.primary" },
        { label: "Total Collected", value: fmtUGX(data.totals?.total_paid), color: "success.main" },
        { label: "Total Outstanding", value: fmtUGX(data.totals?.total_outstanding), color: "warning.main" },
        { label: "Total Overdue", value: fmtUGX(data.totals?.total_overdue), color: "error.main" },
        { label: "Total Penalties", value: fmtUGX(data.totals?.total_penalty), color: "error.main" },
        { label: "Buyers", value: data.totals?.buyer_count, color: "primary.main" },
      ].map(c => (
        <Grid item xs={6} sm={4} md={2} key={c.label}><SummaryCard {...c} /></Grid>
      ))}
    </Grid>
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: "action.hover" }}>
            {["Buyer", "Hub", "Invoices", "Total Invoiced", "Paid", "Outstanding", "Overdue", "Penalty", "Credit Notes", "Debit Notes", "Collection %", "Oldest Overdue"].map(h => (
              <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.75rem" }}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {(data.buyers || []).map((b: any, i: number) => (
            <TableRow key={i} hover sx={{ bgcolor: parseFloat(b.total_overdue) > 0 ? "#fff3e0" : "inherit" }}>
              <TableCell sx={{ fontWeight: 600 }}>{b.buyer_name}</TableCell>
              <TableCell>{b.hub}</TableCell>
              <TableCell>{b.invoice_count}</TableCell>
              <TableCell>{fmtUGX(b.total_invoiced)}</TableCell>
              <TableCell sx={{ color: "success.main" }}>{fmtUGX(b.total_paid)}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{fmtUGX(b.total_outstanding)}</TableCell>
              <TableCell sx={{ color: "error.main", fontWeight: 600 }}>{parseFloat(b.total_overdue) > 0 ? fmtUGX(b.total_overdue) : "—"}</TableCell>
              <TableCell>{parseFloat(b.total_penalty) > 0 ? fmtUGX(b.total_penalty) : "—"}</TableCell>
              <TableCell>{parseFloat(b.credit_notes) > 0 ? fmtUGX(b.credit_notes) : "—"}</TableCell>
              <TableCell>{parseFloat(b.debit_notes) > 0 ? fmtUGX(b.debit_notes) : "—"}</TableCell>
              <TableCell><Chip label={fmtPct(b.collection_rate)} size="small" color={parseFloat(b.collection_rate) >= 80 ? "success" : parseFloat(b.collection_rate) >= 50 ? "warning" : "error"} variant="outlined" /></TableCell>
              <TableCell>{b.oldest_overdue_days > 0 ? `${b.oldest_overdue_days}d` : "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

const AssetsLiabilitiesReport: React.FC<{ data: any }> = ({ data }) => {
  const [expandedInv, setExpandedInv] = useState<string | null>(null);
  const s = data.summary || {};
  const netPosition = parseFloat(s.net_position || "0");

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <SummaryCard label="Total Receivables (Assets)" value={fmtUGX(s.total_receivables)} color="success.main" icon={<TrendingUp />} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard label="Total Investor Obligations (Liabilities)" value={fmtUGX(s.total_investor_obligations)} color="error.main" icon={<AccountBalance />} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard label="Net Position" value={fmtUGX(s.net_position)} color={netPosition >= 0 ? "success.main" : "error.main"} />
        </Grid>
        <Grid item xs={6} sm={3}><SummaryCard label="Total Invoices" value={s.invoice_count || 0} /></Grid>
        <Grid item xs={6} sm={3}><SummaryCard label="Investor-Funded" value={s.funded_invoice_count || 0} color="info.main" /></Grid>
        <Grid item xs={6} sm={3}><SummaryCard label="Self-Funded" value={s.unfunded_invoice_count || 0} /></Grid>
      </Grid>

      {data.investor_summary?.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Investor Obligation Summary</Typography>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "action.hover" }}>
                  {["Investor", "Capital Deployed", "Margin Owed", "Total Liability", "Allocations"].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.investor_summary.map((inv: any, i: number) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{inv.investor_name}</TableCell>
                    <TableCell>{fmtUGX(inv.capital_deployed)}</TableCell>
                    <TableCell sx={{ color: "warning.main" }}>{fmtUGX(inv.margin_owed)}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "error.main" }}>{fmtUGX(inv.total_liability)}</TableCell>
                    <TableCell>{inv.allocation_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Typography variant="subtitle1" fontWeight={700} gutterBottom>Per-Invoice Breakdown</Typography>
      {(data.invoices || []).map((inv: any) => (
        <Card key={inv.invoice_id} sx={{ mb: 1, borderLeft: "4px solid", borderColor: parseFloat(inv.net_position) >= 0 ? "success.main" : "error.main" }}>
          <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 }, cursor: "pointer" }}
            onClick={() => setExpandedInv(expandedInv === inv.invoice_id ? null : inv.invoice_id)}>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={12} sm={2}>
                <Typography fontWeight={700} color="primary.main">{inv.invoice_number}</Typography>
                <Typography variant="caption" color="text.secondary">{inv.buyer_name}</Typography>
              </Grid>
              <Grid item xs={6} sm={2}>
                <Typography variant="caption" color="text.secondary">Receivable</Typography>
                <Typography fontWeight={700} color="success.main">{fmtUGX(inv.receivable)}</Typography>
              </Grid>
              <Grid item xs={6} sm={2}>
                <Typography variant="caption" color="text.secondary">Investor Liability</Typography>
                <Typography fontWeight={700} color="error.main">{fmtUGX(inv.total_liability)}</Typography>
              </Grid>
              <Grid item xs={6} sm={2}>
                <Typography variant="caption" color="text.secondary">Net Position</Typography>
                <Typography fontWeight={700} color={parseFloat(inv.net_position) >= 0 ? "success.main" : "error.main"}>
                  {fmtUGX(inv.net_position)}
                </Typography>
              </Grid>
              <Grid item xs={4} sm={1}><StatusChip status={inv.invoice_status} /></Grid>
              <Grid item xs={2} sm={1}><Typography variant="caption">{inv.investor_count} inv.</Typography></Grid>
              <Grid item xs={12} sm={2} sx={{ textAlign: "right" }}>
                {expandedInv === inv.invoice_id ? <ExpandLess /> : <ExpandMore />}
              </Grid>
            </Grid>
          </CardContent>
          <Collapse in={expandedInv === inv.invoice_id}>
            <Divider />
            <Box sx={{ px: 2, py: 1.5, bgcolor: "#fafafa" }}>
              {inv.investors?.length > 0 ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {["Investor", "Allocation #", "Source Order", "Capital", "Fin. %", "Margin Owed", "Total Owed", "Status"].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.7rem" }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inv.investors.map((li: any, j: number) => (
                      <TableRow key={j}>
                        <TableCell sx={{ fontWeight: 600 }}>{li.investor_name}</TableCell>
                        <TableCell>{li.allocation_number}</TableCell>
                        <TableCell>{li.source_order_number}</TableCell>
                        <TableCell>{fmtUGX(li.capital_deployed)}</TableCell>
                        <TableCell>{li.financing_pct}%</TableCell>
                        <TableCell sx={{ color: "warning.main" }}>{fmtUGX(li.margin_owed)}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "error.main" }}>{fmtUGX(li.total_owed)}</TableCell>
                        <TableCell><StatusChip status={li.allocation_status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Alert severity="info" sx={{ py: 0.5 }}>Self-funded — no investor allocation for this invoice.</Alert>
              )}
            </Box>
          </Collapse>
        </Card>
      ))}
    </Box>
  );
};

const InvestorExposureReport: React.FC<{ data: any }> = ({ data }) => {
  const t = data.totals || {};
  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Total EMD Available", value: fmtUGX(t.total_emd_available), color: "success.main" },
          { label: "Total EMD Utilized", value: fmtUGX(t.total_emd_utilized), color: "warning.main" },
          { label: "Active Capital", value: fmtUGX(t.total_active_capital), color: "primary.main" },
          { label: "Total Margin Earned", value: fmtUGX(t.total_margin_earned), color: "success.main" },
          { label: "Unpaid Margin", value: fmtUGX(t.total_unpaid_margin), color: "warning.main" },
          { label: "Receivable Exposure", value: fmtUGX(t.total_exposure), color: "error.main" },
        ].map(c => (
          <Grid item xs={6} sm={4} md={2} key={c.label}><SummaryCard {...c} /></Grid>
        ))}
      </Grid>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "action.hover" }}>
              {["Investor", "Type", "EMD Available", "EMD Utilized", "Active Allocs", "Active Capital", "Settled", "Margin Earned", "Unpaid Margin", "Receivable Exposure"].map(h => (
                <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.75rem" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {(data.investors || []).map((inv: any, i: number) => (
              <TableRow key={i} hover>
                <TableCell sx={{ fontWeight: 600 }}>{inv.investor_name}</TableCell>
                <TableCell>
                  <Chip label={inv.payout_type === "interest" ? `Interest ${inv.interest_rate || ""}%` : "Margin"}
                    size="small" color={inv.payout_type === "interest" ? "info" : "default"} variant="outlined" />
                </TableCell>
                <TableCell sx={{ color: "success.main" }}>{fmtUGX(inv.emd_balance)}</TableCell>
                <TableCell>{fmtUGX(inv.emd_utilized)}</TableCell>
                <TableCell>{inv.active_allocations}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{fmtUGX(inv.active_capital)}</TableCell>
                <TableCell>{inv.settled_allocations}</TableCell>
                <TableCell sx={{ color: "success.main" }}>{fmtUGX(inv.total_margin_earned)}</TableCell>
                <TableCell sx={{ color: "warning.main", fontWeight: 600 }}>{fmtUGX(inv.unpaid_margin)}</TableCell>
                <TableCell sx={{ color: "error.main", fontWeight: 600 }}>{fmtUGX(inv.outstanding_receivable_exposure)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

const TradePnlReport: React.FC<{ data: any }> = ({ data }) => {
  const t = data.totals || {};
  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Total Revenue", value: fmtUGX(t.revenue), color: "primary.main" },
          { label: "Total COGS", value: fmtUGX(t.cogs), color: "text.primary" },
          { label: "Gross Profit", value: fmtUGX(t.gross_profit), color: parseFloat(t.gross_profit) >= 0 ? "success.main" : "error.main" },
          { label: "Investor Margin", value: fmtUGX(t.investor_margin), color: "warning.main" },
          { label: "Platform Fee", value: fmtUGX(t.platform_fee), color: "info.main" },
          { label: "Trades Settled", value: t.count || 0 },
        ].map(c => (
          <Grid item xs={6} sm={4} md={2} key={c.label}><SummaryCard {...c} /></Grid>
        ))}
      </Grid>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "action.hover" }}>
              {["Settlement #", "Order #", "Buyer", "Hub", "Revenue", "COGS", "Gross Profit", "Margin %", "Investor Margin", "Platform Fee", "Settled"].map(h => (
                <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.75rem" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {(data.trades || []).map((tr: any, i: number) => (
              <TableRow key={i} hover sx={{ bgcolor: parseFloat(tr.gross_profit) < 0 ? "#ffebee" : "inherit" }}>
                <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>{tr.settlement_number}</TableCell>
                <TableCell>{tr.order_number}</TableCell>
                <TableCell>{tr.buyer_name}</TableCell>
                <TableCell>{tr.hub}</TableCell>
                <TableCell>{fmtUGX(tr.revenue)}</TableCell>
                <TableCell>{fmtUGX(tr.cogs)}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: parseFloat(tr.gross_profit) >= 0 ? "success.main" : "error.main" }}>{fmtUGX(tr.gross_profit)}</TableCell>
                <TableCell>{fmtPct(tr.gross_margin_pct)}</TableCell>
                <TableCell>{fmtUGX(tr.investor_margin)}</TableCell>
                <TableCell sx={{ color: "info.main" }}>{fmtUGX(tr.platform_fee)}</TableCell>
                <TableCell>{fmtDate(tr.settled_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

const SupplierPayablesReport: React.FC<{ data: any }> = ({ data }) => {
  const t = data.totals || {};
  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Total Payable", value: fmtUGX(t.total_payable), color: "error.main" },
          { label: "Total Paid", value: fmtUGX(t.total_paid), color: "success.main" },
          { label: "Outstanding", value: fmtUGX(t.total_outstanding), color: "warning.main" },
          { label: "Invoices", value: t.invoice_count || 0 },
        ].map(c => (
          <Grid item xs={6} sm={3} key={c.label}><SummaryCard {...c} /></Grid>
        ))}
      </Grid>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "action.hover" }}>
              {["Invoice #", "Supplier", "Order #", "Grain", "Hub", "Amount Due", "Paid", "Balance", "Issued", "Due Date", "Status"].map(h => (
                <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.75rem" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {(data.invoices || []).map((inv: any, i: number) => (
              <TableRow key={i} hover>
                <TableCell sx={{ fontWeight: 600 }}>{inv.invoice_number}</TableCell>
                <TableCell>{inv.supplier}</TableCell>
                <TableCell>{inv.order_number}</TableCell>
                <TableCell>{inv.grain}</TableCell>
                <TableCell>{inv.hub}</TableCell>
                <TableCell>{fmtUGX(inv.amount_due)}</TableCell>
                <TableCell sx={{ color: "success.main" }}>{fmtUGX(inv.amount_paid)}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "error.main" }}>{fmtUGX(inv.balance_due)}</TableCell>
                <TableCell>{fmtDate(inv.issued_at)}</TableCell>
                <TableCell>{fmtDate(inv.due_date)}</TableCell>
                <TableCell><StatusChip status={inv.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Reports;