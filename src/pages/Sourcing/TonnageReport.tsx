import React, { useCallback, useEffect, useState } from "react";
import {
  Alert, Box, Button, Card, CardContent, Chip, FormControl,
  Grid, InputLabel, LinearProgress, MenuItem, Paper, Select,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Tooltip, Typography,
} from "@mui/material";
import { Download, Refresh, Inventory2 } from "@mui/icons-material";
import { toast } from "react-hot-toast";
import useTitle from "../../hooks/useTitle";
import SourcingService from "./Sourcing.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtKg = (v: any, dp = 2) => {
  if (v === null || v === undefined || v === "") return "—";
  const n = parseFloat(String(v));
  if (isNaN(n)) return "—";
  return n.toLocaleString("en-UG", { minimumFractionDigits: dp, maximumFractionDigits: dp });
};

const fmtPct = (v: any) => {
  if (v === null || v === undefined || v === "") return "—";
  const n = parseFloat(String(v));
  if (isNaN(n)) return "—";
  return `${n.toFixed(2)}%`;
};

// ─── Summary Card ──────────────────────────────────────────────────────────────

const SummaryCard: React.FC<{ label: string; value: string; sub?: string; color?: string }> = ({
  label, value, sub, color = "text.primary",
}) => (
  <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
    <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
      <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase"
        sx={{ letterSpacing: 0.5, display: "block" }}>{label}</Typography>
      <Typography variant="h6" fontWeight={700} sx={{ color }}>{value}</Typography>
      {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
    </CardContent>
  </Card>
);

// ─── Progress bar column ───────────────────────────────────────────────────────

const PctBar: React.FC<{ pct: number; color?: string }> = ({ pct, color = "#4caf50" }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Box sx={{ flex: 1, bgcolor: "#e0e0e0", borderRadius: 1, height: 6, overflow: "hidden" }}>
      <Box sx={{ width: `${Math.min(pct, 100)}%`, bgcolor: color, height: "100%", transition: "width 0.3s" }} />
    </Box>
    <Typography variant="caption" sx={{ minWidth: 40, textAlign: "right" }}>{pct.toFixed(1)}%</Typography>
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const TonnageReport: React.FC = () => {
  useTitle("Tonnage Report");

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [csvLoading, setCsvLoading] = useState(false);

  // Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [hubs, setHubs] = useState<any[]>([]);
  const [grainTypes, setGrainTypes] = useState<any[]>([]);
  const [hubId, setHubId] = useState("");
  const [grainTypeId, setGrainTypeId] = useState("");

  useEffect(() => {
    SourcingService.getHubs().then(d => setHubs(d.results ?? d)).catch(() => {});
    SourcingService.getGrainTypes().then(d => setGrainTypes(d.results ?? d)).catch(() => {});
  }, []);

  const buildParams = () => {
    const p: any = {};
    if (dateFrom) p.date_from = dateFrom;
    if (dateTo) p.date_to = dateTo;
    if (hubId) p.hub = hubId;
    if (grainTypeId) p.grain_type = grainTypeId;
    return p;
  };

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setData(null);
    try {
      const result = await SourcingService.getTonnageReport(buildParams());
      setData(result);
    } catch (e: any) {
      toast.error(e.response?.data?.detail || "Failed to load Tonnage report");
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, hubId, grainTypeId]);

  const handleExportCsv = async () => {
    setCsvLoading(true);
    try {
      const blob = await SourcingService.downloadTonnageReport(buildParams());
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tonnage_report_${new Date().toISOString().slice(0, 10)}.csv`;
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

  const grandOrdered  = parseFloat(totals.ordered_kg  ?? "0");
  const grandReceived = parseFloat(totals.wb_received_kg ?? "0");
  const grandSold     = parseFloat(totals.sold_kg ?? "0");
  const grandNet      = parseFloat(totals.net_accepted_kg ?? "0");
  const grandAvail    = parseFloat(totals.available_kg ?? "0");
  const grandRejected = parseFloat(totals.lot_rejected_kg ?? "0");
  const grandLoss     = parseFloat(totals.transit_loss_kg ?? "0");

  return (
    <Box pt={2} pb={4}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Inventory2 sx={{ fontSize: 36, color: "primary.main" }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>Tonnage Report</Typography>
            <Typography variant="body2" color="text.secondary">
              Stock movement by Hub × Grain Type — ordered, received, sold, available
            </Typography>
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
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth size="small" type="date" label="Date From"
              value={dateFrom} onChange={e => setDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth size="small" type="date" label="Date To"
              value={dateTo} onChange={e => setDateTo(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
              <InputLabel>Grain Type</InputLabel>
              <Select value={grainTypeId} label="Grain Type" onChange={e => setGrainTypeId(e.target.value)}>
                <MenuItem value="">All Grain Types</MenuItem>
                {grainTypes.map((g: any) => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
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
            { label: "Groups",          value: String(rows.length),                              color: "text.primary" },
            { label: "Orders",          value: String(totals.order_count ?? 0),                  color: "text.primary" },
            { label: "Ordered",         value: `${fmtKg(grandOrdered)} kg`,                      color: "text.primary" },
            { label: "WB Received",     value: `${fmtKg(grandReceived)} kg`,                     color: "primary.main" },
            { label: "Transit Loss",    value: `${fmtKg(grandLoss)} kg`,                         color: grandLoss > 0 ? "warning.main" : "text.secondary" },
            { label: "Net Accepted",    value: `${fmtKg(grandNet)} kg`,                          color: "success.main" },
            { label: "Sold",            value: `${fmtKg(grandSold)} kg`,                         color: "success.main",
              sub: grandNet > 0 ? `${((grandSold / grandNet) * 100).toFixed(1)}% of net accepted` : undefined },
            { label: "Available Stock", value: `${fmtKg(grandAvail)} kg`,                        color: "info.main" },
            { label: "Rejected",        value: `${fmtKg(grandRejected)} kg`,                     color: grandRejected > 0 ? "error.main" : "text.secondary" },
          ].map(c => (
            <Grid item xs={6} sm={4} md={3} lg={1.33} key={c.label}>
              <SummaryCard label={c.label} value={c.value} sub={c.sub} color={c.color} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* ── No data state ───────────────────────────────────────────────────── */}
      {!data && !loading && (
        <Alert severity="info">Select filters and click <strong>Run Report</strong> to generate the Tonnage report.</Alert>
      )}
      {data && rows.length === 0 && (
        <Alert severity="warning">No stock movement data found for the selected filters.</Alert>
      )}

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      {rows.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                {[
                  "Hub", "Grain Type", "Orders",
                  "Ordered (kg)", "WB Received (kg)", "Qty Variance (kg)",
                  "Transit Loss (kg)", "Deductions (kg)", "Net Accepted (kg)",
                  "Available (kg)", "Sold (kg)", "% Sold",
                  "Rejected (kg)", "Unsold (kg)",
                ].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row: any, idx: number) => {
                const pctSold = parseFloat(row.pct_sold ?? "0");
                const hasLoss = parseFloat(row.transit_loss_kg ?? "0") > 0;
                const hasRejected = parseFloat(row.lot_rejected_kg ?? "0") > 0;
                return (
                  <TableRow key={idx} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{row.hub}</TableCell>
                    <TableCell>
                      <Chip label={row.grain_type} size="small" variant="outlined" color="primary" />
                    </TableCell>
                    <TableCell align="center">{row.order_count}</TableCell>
                    <TableCell>{fmtKg(row.ordered_kg)}</TableCell>
                    <TableCell sx={{ color: "primary.main", fontWeight: 600 }}>{fmtKg(row.wb_received_kg)}</TableCell>
                    <TableCell sx={{ color: parseFloat(row.qty_variance_kg ?? "0") !== 0 ? "warning.main" : "text.secondary" }}>
                      {fmtKg(row.qty_variance_kg)}
                      {parseFloat(row.pct_variance ?? "0") !== 0 && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {fmtPct(row.pct_variance)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ color: hasLoss ? "warning.main" : "text.secondary" }}>
                      {hasLoss ? (
                        <>
                          {fmtKg(row.transit_loss_kg)}
                          <Typography variant="caption" display="block" color="text.secondary">
                            {fmtPct(row.pct_transit_loss)}
                          </Typography>
                        </>
                      ) : "—"}
                    </TableCell>
                    <TableCell sx={{ color: parseFloat(row.deductions_kg ?? "0") > 0 ? "warning.main" : "text.secondary" }}>
                      {parseFloat(row.deductions_kg ?? "0") > 0 ? fmtKg(row.deductions_kg) : "—"}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "success.main" }}>{fmtKg(row.net_accepted_kg)}</TableCell>
                    <TableCell sx={{ color: "info.main" }}>{fmtKg(row.available_kg)}</TableCell>
                    <TableCell sx={{ color: "success.main", fontWeight: 600 }}>{fmtKg(row.sold_kg)}</TableCell>
                    <TableCell sx={{ minWidth: 130 }}>
                      <Tooltip title={`${fmtKg(row.sold_kg)} of ${fmtKg(row.net_accepted_kg)} kg`}>
                        <Box>
                          <PctBar
                            pct={pctSold}
                            color={pctSold >= 80 ? "#4caf50" : pctSold >= 40 ? "#ff9800" : "#f44336"}
                          />
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ color: hasRejected ? "error.main" : "text.secondary" }}>
                      {hasRejected ? fmtKg(row.lot_rejected_kg) : "—"}
                    </TableCell>
                    <TableCell sx={{ color: parseFloat(row.unsold_kg ?? "0") > 0 ? "warning.main" : "text.secondary", fontWeight: 600 }}>
                      {fmtKg(row.unsold_kg)}
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* Totals row */}
              <TableRow sx={{ bgcolor: "action.hover", fontWeight: 700 }}>
                <TableCell colSpan={2} sx={{ fontWeight: 700 }}>TOTAL</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>{totals.order_count}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{fmtKg(totals.ordered_kg)}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>{fmtKg(totals.wb_received_kg)}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{fmtKg(totals.qty_variance_kg)}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{fmtKg(totals.transit_loss_kg)}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{fmtKg(totals.deductions_kg)}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "success.main" }}>{fmtKg(totals.net_accepted_kg)}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "info.main" }}>{fmtKg(totals.available_kg)}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "success.main" }}>{fmtKg(totals.sold_kg)}</TableCell>
                <TableCell sx={{ minWidth: 130 }}>
                  {grandNet > 0 && (
                    <PctBar
                      pct={(grandSold / grandNet) * 100}
                      color="#4caf50"
                    />
                  )}
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: grandRejected > 0 ? "error.main" : "text.secondary" }}>
                  {fmtKg(totals.lot_rejected_kg)}
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "warning.main" }}>{fmtKg(totals.unsold_kg)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {data && rows.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          {rows.length} group{rows.length !== 1 ? "s" : ""} · {totals.order_count} order{totals.order_count !== 1 ? "s" : ""}.
          Generated {new Date(data.generated_at).toLocaleString("en-GB")}.
        </Typography>
      )}
    </Box>
  );
};

export default TonnageReport;
