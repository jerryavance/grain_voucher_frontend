import React, { useCallback, useEffect, useState } from "react";
import {
  Alert, Box, Button, Card, CardContent, Chip, FormControl,
  Grid, InputLabel, LinearProgress, MenuItem, Paper, Select,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Tooltip, Typography,
} from "@mui/material";
import { Download, Refresh, TableChart } from "@mui/icons-material";
import { toast } from "react-hot-toast";
import useTitle from "../../hooks/useTitle";
import SourcingService from "./Sourcing.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtNum = (v: any, dp = 0) => {
  if (v === null || v === undefined || v === "") return "—";
  const n = parseFloat(String(v));
  if (isNaN(n)) return "—";
  return n.toLocaleString("en-UG", { minimumFractionDigits: dp, maximumFractionDigits: dp });
};

const fmtUGX = (v: any) => {
  if (v === null || v === undefined || v === "") return "—";
  const n = parseFloat(String(v));
  if (isNaN(n)) return "—";
  return `UGX ${n.toLocaleString("en-UG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const fmtDate = (v: string | null) => {
  if (!v) return "—";
  try { return new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return v; }
};

const fmtBool = (v: any) => {
  if (v === null || v === undefined || v === "") return "—";
  return v === true || v === "true" || v === "True" ? "Yes" : "No";
};

// ─── Summary Card ──────────────────────────────────────────────────────────────

const SummaryCard: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color = "text.primary" }) => (
  <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
    <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
      <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" sx={{ letterSpacing: 0.5, display: "block" }}>{label}</Typography>
      <Typography variant="h6" fontWeight={700} sx={{ color }}>{value}</Typography>
    </CardContent>
  </Card>
);

// ─── Column definitions (ordered as in the CSV export) ────────────────────────

const COLS: { key: string; label: string; fmt?: (v: any) => string; minW?: number; sticky?: boolean }[] = [
  { key: "date",                      label: "Date",                        fmt: fmtDate,      minW: 100, sticky: true },
  { key: "order_number",              label: "Order #",                     minW: 150,         sticky: true },
  { key: "supplier_1",                label: "Supplier 1",                  minW: 160 },
  { key: "inventory_source",          label: "Inventory Source",            minW: 130 },
  { key: "intermediation",            label: "Intermediation",              minW: 130 },
  { key: "pledged_stock",             label: "Pledged/Free",                minW: 110 },
  { key: "payment_terms",             label: "Payment Terms",               minW: 120 },
  { key: "buyer_1_investor",          label: "Buyer 1 (Investor)",          minW: 160 },
  { key: "vehicle_no",                label: "Vehicle No",                  minW: 120 },
  { key: "bag_count_1",               label: "Bag Count 1",                 fmt: v => fmtNum(v), minW: 100 },
  { key: "wb_tonnage",                label: "WB Tonnage",                  fmt: v => fmtNum(v, 3), minW: 110 },
  { key: "tonnage_bf_deduction",      label: "Tonnage bf Deduction",        fmt: v => fmtNum(v, 3), minW: 150 },
  { key: "net_tonnage",               label: "Net Tonnage",                 fmt: v => fmtNum(v, 3), minW: 110 },
  { key: "pct_deduction",             label: "% Deduction",                 fmt: v => fmtNum(v, 2), minW: 100 },
  { key: "rejected_grain_kg",         label: "Rejected Grain (kg)",         fmt: v => fmtNum(v, 2), minW: 130 },
  { key: "pct_rejected",              label: "% Rejected",                  fmt: v => fmtNum(v, 2), minW: 100 },
  { key: "supplier_1_price",          label: "Supplier 1 Price",            fmt: fmtUGX,       minW: 140 },
  { key: "amount_paid_to_supplier_1", label: "Paid to Supplier 1",          fmt: fmtUGX,       minW: 150 },
  { key: "logistics",                 label: "Logistics",                   fmt: fmtUGX,       minW: 110 },
  { key: "amsaf_fees_supply",         label: "AMSAF Fees (Supply)",         fmt: fmtUGX,       minW: 140 },
  { key: "supplier_2",                label: "Supplier 2 (Investor)",       minW: 160 },
  { key: "buyer_2",                   label: "Buyer 2 (Final)",             minW: 160 },
  { key: "unit_price",                label: "Unit Price",                  fmt: fmtUGX,       minW: 120 },
  { key: "amount_payable_by_buyer_2", label: "Payable by Buyer 2",          fmt: fmtUGX,       minW: 150 },
  { key: "amount_received_by_amsaf",  label: "Received by AMSAF",           fmt: fmtUGX,       minW: 150 },
  { key: "balance_buyer_2",           label: "Balance (Buyer 2)",           fmt: fmtUGX,       minW: 140 },
  { key: "supplier_3",                label: "Supplier 3",                  minW: 130 },
  { key: "buyer_3",                   label: "Buyer 3",                     minW: 130 },
  { key: "unit_price_buyer_3",        label: "Unit Price (Buyer 3)",        fmt: fmtUGX,       minW: 140 },
  { key: "amount_payable_by_buyer_3", label: "Payable by Buyer 3",          fmt: fmtUGX,       minW: 150 },
  { key: "amount_received_buyer_3",   label: "Received by AMSAF (B3)",      fmt: fmtUGX,       minW: 160 },
  { key: "balance_buyer_3",           label: "Balance (Buyer 3)",           fmt: fmtUGX,       minW: 140 },
  { key: "amsaf_fees_buyer_3_leg",    label: "AMSAF Fees (B3 Leg)",         fmt: fmtUGX,       minW: 140 },
  { key: "rejected_ugx",             label: "Rejected (UGX)",              fmt: fmtUGX,       minW: 130 },
  { key: "other_expenses",            label: "Other Expenses",              fmt: fmtUGX,       minW: 130 },
  { key: "tonnage_loss_kg",           label: "Tonnage Loss (kg)",           fmt: v => fmtNum(v, 2), minW: 130 },
  { key: "pct_tonnage_loss",          label: "% Tonnage Loss",              fmt: v => fmtNum(v, 2), minW: 120 },
  { key: "deduction_loss_kg",         label: "Deduction Loss (kg)",         fmt: v => fmtNum(v, 2), minW: 140 },
  { key: "loss_ugx",                  label: "Loss (UGX)",                  fmt: fmtUGX,       minW: 120 },
  { key: "offloading_charges",        label: "Offloading Charges",          fmt: fmtUGX,       minW: 140 },
  { key: "parking_fees",              label: "Parking Fees",                fmt: fmtUGX,       minW: 120 },
  { key: "lender_fees",               label: "Lender Fees",                 fmt: fmtUGX,       minW: 120 },
  { key: "net_profit_loss",           label: "Net Profit / Loss",           fmt: fmtUGX,       minW: 140 },
  { key: "total_recoveries",          label: "Total Recoveries",            fmt: fmtUGX,       minW: 140 },
  { key: "rejected_outstanding_ugx",  label: "Rejected Outstanding (UGX)",  fmt: fmtUGX,       minW: 180 },
  { key: "bag_count_2",               label: "Bag Count 2",                 fmt: v => fmtNum(v), minW: 100 },
  { key: "waiver_assumption",         label: "Waiver Assumption",           fmt: fmtUGX,       minW: 150 },
  { key: "agreed_days",               label: "Agreed Days",                 fmt: v => fmtNum(v), minW: 100 },
  { key: "current_days",              label: "Current # Days",              fmt: v => fmtNum(v), minW: 110 },
  { key: "days_in_default",           label: "# Days in Default",           fmt: v => fmtNum(v), minW: 130 },
  { key: "amsaf_fee_from_buyer_1",    label: "AMSAF Fee from Buyer 1",      fmt: fmtUGX,       minW: 160 },
  { key: "amsaf_fee_from_seller_2",   label: "AMSAF Fee from Seller 2",     fmt: fmtUGX,       minW: 160 },
  { key: "weight_standard",           label: "Weight Standard",             fmt: fmtBool,      minW: 120 },
  { key: "date_of_full_payment",      label: "Date of Full Payment",        fmt: fmtDate,      minW: 140 },
  { key: "days_in_default_2",         label: "# Days in Default (2)",       fmt: v => fmtNum(v), minW: 140 },
  { key: "defaulted",                 label: "Defaulted?",                  fmt: fmtBool,      minW: 100 },
  { key: "purchase_kg",               label: "Purchase (kg)",               fmt: v => fmtNum(v, 2), minW: 120 },
  { key: "purchase_price",            label: "Purchase Price",              fmt: fmtUGX,       minW: 130 },
  { key: "total_price",               label: "Total Price",                 fmt: fmtUGX,       minW: 120 },
  { key: "transport",                 label: "Transport",                   fmt: fmtUGX,       minW: 110 },
  { key: "offloading_charges_2",      label: "Off-loading Charges",         fmt: fmtUGX,       minW: 150 },
  { key: "rejections_costs",          label: "Rejections Costs",            fmt: fmtUGX,       minW: 140 },
];

// ─── Main Component ───────────────────────────────────────────────────────────

const TALsReport: React.FC = () => {
  useTitle("TALs Finance Report");

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [csvLoading, setCsvLoading] = useState(false);

  // Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [hubs, setHubs] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [hubId, setHubId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [buyerId, setBuyerId] = useState("");

  // Load lookup lists once
  useEffect(() => {
    SourcingService.getHubs().then(d => setHubs(d.results ?? d)).catch(() => {});
    SourcingService.getSuppliers({}).then(d => setSuppliers(d.results ?? [])).catch(() => {});
    SourcingService.getBuyers({}).then(d => setBuyers(d.results ?? [])).catch(() => {});
  }, []);

  const buildParams = () => {
    const p: any = {};
    if (dateFrom) p.date_from = dateFrom;
    if (dateTo) p.date_to = dateTo;
    if (hubId) p.hub = hubId;
    if (supplierId) p.supplier = supplierId;
    if (buyerId) p.buyer = buyerId;
    return p;
  };

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setData(null);
    try {
      const result = await SourcingService.getTALsReport(buildParams());
      setData(result);
    } catch (e: any) {
      toast.error(e.response?.data?.detail || "Failed to load TALs report");
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, hubId, supplierId, buyerId]);

  const handleExportCsv = async () => {
    setCsvLoading(true);
    try {
      const blob = await SourcingService.downloadTALsReport(buildParams());
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tals_report_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to export CSV");
    } finally {
      setCsvLoading(false);
    }
  };

  const rows: any[] = data?.rows ?? [];
  const totals = data?.totals ?? {};

  return (
    <Box pt={2} pb={4}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <TableChart sx={{ fontSize: 36, color: "primary.main" }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>TALs Finance Report</Typography>
            <Typography variant="body2" color="text.secondary">Trade Activity Ledger Summary — full trade lifecycle per order</Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchReport} disabled={loading}>
            Run Report
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExportCsv}
            disabled={csvLoading || loading}
          >
            {csvLoading ? "Exporting…" : "Export CSV"}
          </Button>
        </Box>
      </Box>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <TextField fullWidth size="small" type="date" label="Date From" value={dateFrom} onChange={e => setDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField fullWidth size="small" type="date" label="Date To" value={dateTo} onChange={e => setDateTo(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Hub</InputLabel>
              <Select value={hubId} label="Hub" onChange={e => setHubId(e.target.value)}>
                <MenuItem value="">All Hubs</MenuItem>
                {hubs.map((h: any) => <MenuItem key={h.id} value={h.id}>{h.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Supplier</InputLabel>
              <Select value={supplierId} label="Supplier" onChange={e => setSupplierId(e.target.value)}>
                <MenuItem value="">All Suppliers</MenuItem>
                {suppliers.map((s: any) => <MenuItem key={s.id} value={s.id}>{s.business_name || s.full_name || s.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Buyer</InputLabel>
              <Select value={buyerId} label="Buyer" onChange={e => setBuyerId(e.target.value)}>
                <MenuItem value="">All Buyers</MenuItem>
                {buyers.map((b: any) => <MenuItem key={b.id} value={b.id}>{b.business_name || b.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 1 }} />}

      {/* ── Summary Cards ───────────────────────────────────────────────────── */}
      {data && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {[
            { label: "Trades",           value: String(totals.trade_count ?? 0),           color: "text.primary" },
            { label: "WB Tonnage",       value: `${fmtNum(totals.total_wb_tonnage, 2)} kg`, color: "text.primary" },
            { label: "Net Tonnage",      value: `${fmtNum(totals.total_net_tonnage, 2)} kg`, color: "primary.main" },
            { label: "Paid to Suppliers", value: fmtUGX(totals.total_paid_to_suppliers),   color: "error.main" },
            { label: "Payable by Buyer 2", value: fmtUGX(totals.total_amount_payable),     color: "text.primary" },
            { label: "Received by AMSAF",  value: fmtUGX(totals.total_amount_received),    color: "success.main" },
            { label: "Balance Outstanding", value: fmtUGX(totals.total_balance),           color: "warning.main" },
            { label: "Net P&L",           value: fmtUGX(totals.total_net_pnl),
              color: parseFloat(totals.total_net_pnl ?? "0") >= 0 ? "success.main" : "error.main" },
          ].map(c => (
            <Grid item xs={6} sm={4} md={3} lg={1.5} key={c.label}>
              <SummaryCard label={c.label} value={c.value} color={c.color} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      {!data && !loading && (
        <Alert severity="info">Select filters and click <strong>Run Report</strong> to generate the TALs report.</Alert>
      )}

      {data && rows.length === 0 && (
        <Alert severity="warning">No trades found for the selected filters.</Alert>
      )}

      {rows.length > 0 && (
        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: "70vh", overflow: "auto" }}>
          <Table size="small" stickyHeader sx={{ minWidth: 2400 }}>
            <TableHead>
              <TableRow>
                {COLS.map((col, i) => (
                  <TableCell
                    key={col.key}
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      minWidth: col.minW ?? 100,
                      whiteSpace: "nowrap",
                      bgcolor: "background.paper",
                      ...(i < 2 ? {
                        position: "sticky",
                        left: i === 0 ? 0 : 100,
                        zIndex: 3,
                        borderRight: i === 1 ? "2px solid" : undefined,
                        borderColor: i === 1 ? "divider" : undefined,
                      } : {}),
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row: any, idx: number) => {
                const pnl = parseFloat(row.net_profit_loss ?? "0");
                const isLoss = pnl < 0;
                return (
                  <TableRow
                    key={row.order_number ?? idx}
                    hover
                    sx={{ bgcolor: isLoss ? "#fff3f3" : "inherit" }}
                  >
                    {COLS.map((col, i) => {
                      const raw = row[col.key];
                      const display = col.fmt ? col.fmt(raw) : (raw ?? "—");
                      return (
                        <TableCell
                          key={col.key}
                          sx={{
                            fontSize: "0.75rem",
                            whiteSpace: "nowrap",
                            color: col.key === "net_profit_loss"
                              ? (pnl >= 0 ? "success.main" : "error.main")
                              : col.key === "balance_buyer_2" && parseFloat(raw ?? "0") > 0
                              ? "warning.main"
                              : "inherit",
                            fontWeight: col.key === "order_number" || col.key === "net_profit_loss" ? 700 : 400,
                            ...(i < 2 ? {
                              position: "sticky",
                              left: i === 0 ? 0 : 100,
                              bgcolor: "background.paper",
                              zIndex: 1,
                              borderRight: i === 1 ? "2px solid" : undefined,
                              borderColor: i === 1 ? "divider" : undefined,
                            } : {}),
                          }}
                        >
                          {col.key === "order_number" ? (
                            <Tooltip title={row.order_number ?? ""}>
                              <span style={{ color: "#1976d2", cursor: "default" }}>{display}</span>
                            </Tooltip>
                          ) : (
                            String(display)
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {data && rows.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          Showing {rows.length} trade{rows.length !== 1 ? "s" : ""}. Generated {fmtDate(data.generated_at)}.
          Use <strong>Export CSV</strong> to download the full 62-column report.
        </Typography>
      )}
    </Box>
  );
};

export default TALsReport;
