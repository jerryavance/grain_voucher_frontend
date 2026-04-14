// sourcing/pages/SourcingDashboard.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  GlobalStyles,
  Grid,
  LinearProgress,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Divider,
  Avatar,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  AccountBalanceWallet,
  TrendingUp,
  ShoppingCart,
  LocalShipping,
  Receipt,
  People,
  Inventory2,
  Refresh,
  ArrowForward,
  MonetizationOn,
  PictureAsPdf,
  FilterAlt,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { SourcingService } from "./Sourcing.service";
import {
  IEmdOverview,
  IEmdInvestorBalance,
  IHubPLSummary,
} from "./Sourcing.interface";
import { formatCurrency } from "./SourcingConstants";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ISourcingStats {
  total_suppliers: number;
  active_orders: number;
  pending_invoices: number;
  available_lots: number;
  pending_buyer_orders: number;
  pending_settlements: number;
  // ✅ NEW: Payment visibility
  supplier_payments_completed: number;
  supplier_payments_total_amount: number;
  buyer_payments_confirmed: number;
  buyer_payments_total_amount: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  onClick?: () => void;
}> = ({ label, value, icon, color = "#1976d2", onClick }) => (
  <Card
    elevation={0}
    onClick={onClick}
    sx={{
      border: "1px solid",
      borderColor: "divider",
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.2s",
      "&:hover": onClick
        ? { borderColor: color, boxShadow: `0 0 0 1px ${color}20` }
        : {},
    }}
  >
    <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 2 }}>
      <Box>
        <Typography variant="caption" color="text.primary" fontWeight={600} textTransform="uppercase" sx={{ letterSpacing: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
          {value}
        </Typography>
      </Box>
      <Avatar sx={{ bgcolor: `${color}14`, width: 48, height: 48 }}>
        {React.cloneElement(icon as React.ReactElement, { sx: { fontSize: 26, color } })}
      </Avatar>
    </CardContent>
  </Card>
);

// ─── EMD Overview Panel ──────────────────────────────────────────────────────

const EmdOverviewPanel: React.FC<{
  emdData: IEmdOverview | null;
  loading: boolean;
  onRefresh: () => void;
}> = ({ emdData, loading, onRefresh }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Skeleton variant="text" width={200} height={32} />
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={12} sm={4} key={i}>
                <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rectangular" height={200} sx={{ mt: 2, borderRadius: 1 }} />
        </CardContent>
      </Card>
    );
  }

  if (!emdData) return null;

  const utilizationPct =
    emdData.total_emd_balance + emdData.total_emd_utilized > 0
      ? (emdData.total_emd_utilized / (emdData.total_emd_balance + emdData.total_emd_utilized)) * 100
      : 0;

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <AccountBalanceWallet sx={{ color: "#1976d2", fontSize: 28 }} />
            <Typography variant="h6" fontWeight={700}>
              EMD Capital Overview
            </Typography>
            <Chip
              label={`${emdData.investor_count} investor${emdData.investor_count !== 1 ? "s" : ""}`}
              size="small"
              variant="outlined"
              sx={{ ml: 1 }}
            />
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Refresh balances">
              <IconButton size="small" onClick={onRefresh}>
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Manage investors">
              <IconButton size="small" onClick={() => navigate("/admin/investors")}>
                <ArrowForward fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Summary cards */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={4}>
            <Box
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: "#e8f5e9",
                border: "1px solid #c8e6c9",
              }}
            >
              <Typography variant="caption" color="text.primary" fontWeight={600}>
                AVAILABLE EMD BALANCE
              </Typography>
              <Typography variant="h5" fontWeight={700} color="success.dark" sx={{ mt: 0.5 }}>
                {formatCurrency(emdData.total_emd_balance)}
              </Typography>
              <Typography variant="caption" color="text.primary">
                Capital ready for new trades
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: "#fff3e0",
                border: "1px solid #ffe0b2",
              }}
            >
              <Typography variant="caption" color="text.primary" fontWeight={600}>
                EMD UTILIZED
              </Typography>
              <Typography variant="h5" fontWeight={700} color="warning.dark" sx={{ mt: 0.5 }}>
                {formatCurrency(emdData.total_emd_utilized)}
              </Typography>
              <Typography variant="caption" color="text.primary">
                Locked in active trades
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: "#e3f2fd",
                border: "1px solid #bbdefb",
              }}
            >
              <Typography variant="caption" color="text.primary" fontWeight={600}>
                TOTAL CAPITAL COMMITTED
              </Typography>
              <Typography variant="h5" fontWeight={700} color="primary.dark" sx={{ mt: 0.5 }}>
                {formatCurrency(emdData.total_emd_balance + emdData.total_emd_utilized)}
              </Typography>
              <Typography variant="caption" color="text.primary">
                Available + Utilized
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Utilization bar */}
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="body2" color="text.primary">
              Capital Utilization
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {utilizationPct.toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={utilizationPct}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: "#e0e0e0",
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                bgcolor: utilizationPct > 80 ? "#f44336" : utilizationPct > 50 ? "#ff9800" : "#4caf50",
              },
            }}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Per-investor table */}
        <Typography variant="subtitle2" fontWeight={600} mb={1.5} color="text.primary">
          INVESTOR BALANCES
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#fafafa" }}>
                <TableCell sx={{ fontWeight: 600 }}>Investor</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Available EMD</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Utilized</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Margin Earned</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Utilization</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {emdData.investors.length > 0 ? (
                emdData.investors.map((inv: IEmdInvestorBalance) => {
                  const invTotal = inv.emd_balance + inv.emd_utilized;
                  const invUtil = invTotal > 0 ? (inv.emd_utilized / invTotal) * 100 : 0;
                  return (
                    <TableRow key={inv.account_id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar
                            sx={{
                              width: 30,
                              height: 30,
                              fontSize: 13,
                              bgcolor: "#1976d2",
                            }}
                          >
                            {inv.investor_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" fontWeight={500}>
                            {inv.investor_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color={inv.emd_balance > 0 ? "success.main" : "text.disabled"}
                        >
                          {formatCurrency(inv.emd_balance)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="text.primary">
                          {formatCurrency(inv.emd_utilized)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="text.primary">
                          {formatCurrency(inv.total_margin_earned)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" alignItems="center" gap={1} justifyContent="center">
                          <LinearProgress
                            variant="determinate"
                            value={invUtil}
                            sx={{
                              width: 60,
                              height: 6,
                              borderRadius: 3,
                              bgcolor: "#e0e0e0",
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 3,
                                bgcolor: invUtil > 80 ? "#f44336" : invUtil > 50 ? "#ff9800" : "#4caf50",
                              },
                            }}
                          />
                          <Typography variant="caption" color="text.primary" sx={{ minWidth: 32 }}>
                            {invUtil.toFixed(0)}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.disabled">
                      No investor accounts found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

// ─── Main SourcingDashboard Component ────────────────────────────────────────

const SourcingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [emdData, setEmdData] = useState<IEmdOverview | null>(null);
  const [plSummary, setPlSummary] = useState<IHubPLSummary | null>(null);
  const [stats, setStats] = useState<ISourcingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [emdLoading, setEmdLoading] = useState(true);

  // ── Date range filter ──────────────────────────────────────────────────────
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.allSettled([fetchEmdOverview(), fetchStats(), fetchPLSummary()]);
    setLoading(false);
  };

  /** Re-fetch with current date filters applied */
  const applyFilter = () => {
    setLoading(true);
    Promise.allSettled([fetchEmdOverview(), fetchStats(), fetchPLSummary()]).then(
      () => setLoading(false)
    );
  };

  const clearFilter = () => {
    setStartDate("");
    setEndDate("");
    // Trigger refetch with empty dates after state update on next tick
    setTimeout(() => applyFilter(), 0);
  };

  const fetchEmdOverview = async () => {
    setEmdLoading(true);
    try {
      const data = await SourcingService.getEmdOverview();
      setEmdData(data);
    } catch (err: any) {
      console.error("Failed to load EMD overview:", err);
    } finally {
      setEmdLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const dateParams = startDate && endDate
        ? { start_date: startDate, end_date: endDate }
        : {};
      // ✅ FIX: Also fetch payment stats for dashboard visibility (Issue 8)
      const [suppliers, orders, invoices, lots, supplierPayments, buyerPayments] = await Promise.allSettled([
        SourcingService.getSuppliers({ page_size: 1 }),
        SourcingService.getSourceOrders({ page_size: 1, status: "accepted", ...dateParams }),
        SourcingService.getSupplierInvoices({ page_size: 1, status: "pending", ...dateParams }),
        SourcingService.getSaleLots({ page_size: 1, status: "available" }),
        SourcingService.getSupplierPayments({ page_size: 5, status: "completed", ...dateParams }),
        SourcingService.getBuyerPayments({ page_size: 5, status: "confirmed", ...dateParams }),
      ]);

      // Compute total supplier payments
      let spTotal = 0;
      let spCount = 0;
      if (supplierPayments.status === "fulfilled") {
        spCount = supplierPayments.value.count;
        spTotal = (supplierPayments.value.results || []).reduce(
          (sum: number, p: any) => sum + Number(p.amount || 0), 0
        );
      }

      // Compute total buyer payments
      let bpTotal = 0;
      let bpCount = 0;
      if (buyerPayments.status === "fulfilled") {
        bpCount = buyerPayments.value.count;
        bpTotal = (buyerPayments.value.results || []).reduce(
          (sum: number, p: any) => sum + Number(p.amount || 0), 0
        );
      }

      setStats({
        total_suppliers: suppliers.status === "fulfilled" ? suppliers.value.count : 0,
        active_orders: orders.status === "fulfilled" ? orders.value.count : 0,
        pending_invoices: invoices.status === "fulfilled" ? invoices.value.count : 0,
        available_lots: lots.status === "fulfilled" ? lots.value.count : 0,
        pending_buyer_orders: 0,
        pending_settlements: 0,
        supplier_payments_completed: spCount,
        supplier_payments_total_amount: spTotal,
        buyer_payments_confirmed: bpCount,
        buyer_payments_total_amount: bpTotal,
      });
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  const fetchPLSummary = async () => {
    try {
      const dateParams = startDate && endDate
        ? { start_date: startDate, end_date: endDate }
        : {};
      const data = await SourcingService.getHubPLSummary(dateParams);
      setPlSummary(data);
    } catch (err) {
      console.error("Failed to load P&L summary:", err);
    }
  };

  if (loading && !emdData && !stats) {
    return (
      <Box p={3}>
        <Skeleton variant="text" width={300} height={50} />
        <Grid container spacing={2} mt={1}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={400} sx={{ mt: 3, borderRadius: 1 }} />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <GlobalStyles styles={{
        "@media print": {
          "body": { WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" },
          "@page": { margin: "10mm", size: "A4 portrait" },
          /* Hide nav, header chrome, buttons when printing */
          ".no-print, button, [role='button']": { display: "none !important" },
        },
      }} />
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Sourcing Dashboard
          </Typography>
          <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
            Overview of procurement, capital, and trade activity
          </Typography>
        </Box>

        {/* Date range filter + actions */}
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
          <TextField
            label="From"
            type="date"
            size="small"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150 }}
          />
          <TextField
            label="To"
            type="date"
            size="small"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150 }}
          />
          <Tooltip title="Apply date filter">
            <Button
              variant="contained"
              size="small"
              startIcon={<FilterAlt />}
              onClick={applyFilter}
              disabled={!startDate || !endDate}
            >
              Filter
            </Button>
          </Tooltip>
          {(startDate || endDate) && (
            <Button size="small" onClick={clearFilter} color="inherit">
              Clear
            </Button>
          )}
          <Tooltip title="Export dashboard to PDF">
            <Button
              variant="outlined"
              size="small"
              startIcon={<PictureAsPdf />}
              onClick={() => window.print()}
            >
              Export PDF
            </Button>
          </Tooltip>
          <Tooltip title="Refresh all data">
            <IconButton size="small" onClick={fetchAll}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Quick stat cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Suppliers"
            value={stats?.total_suppliers ?? "—"}
            icon={<People />}
            color="#7c4dff"
            onClick={() => navigate("/admin/sourcing/suppliers")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Active Orders"
            value={stats?.active_orders ?? "—"}
            icon={<ShoppingCart />}
            color="#ff9800"
            onClick={() => navigate("/admin/sourcing/orders")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Pending Invoices"
            value={stats?.pending_invoices ?? "—"}
            icon={<Receipt />}
            color="#f44336"
            onClick={() => navigate("/admin/sourcing/invoices")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Available Stock"
            value={stats?.available_lots ?? "—"}
            icon={<Inventory2 />}
            color="#4caf50"
            onClick={() => navigate("/admin/sourcing/sale-lots")}
          />
        </Grid>
      </Grid>

      {/* ✅ NEW: Payments Made cards — Issue 8 */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Supplier Payments Made"
            value={stats?.supplier_payments_completed ?? "—"}
            icon={<MonetizationOn />}
            color="#e65100"
            onClick={() => navigate("/admin/sourcing/supplier-payments")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Supplier Payments Total"
            value={stats?.supplier_payments_total_amount
              ? formatCurrency(stats.supplier_payments_total_amount)
              : "—"}
            icon={<AccountBalanceWallet />}
            color="#e65100"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Buyer Payments Received"
            value={stats?.buyer_payments_confirmed ?? "—"}
            icon={<MonetizationOn />}
            color="#2e7d32"
            onClick={() => navigate("/admin/sourcing/buyer-payments")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Buyer Payments Total"
            value={stats?.buyer_payments_total_amount
              ? formatCurrency(stats.buyer_payments_total_amount)
              : "—"}
            icon={<AccountBalanceWallet />}
            color="#2e7d32"
          />
        </Grid>
      </Grid>

      {/* P&L summary cards */}
      {plSummary && (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              label="Total Revenue"
              value={formatCurrency(plSummary.total_buyer_revenue)}
              icon={<MonetizationOn />}
              color="#2e7d32"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              label="Gross Profit"
              value={formatCurrency(plSummary.gross_profit)}
              icon={<TrendingUp />}
              color="#1565c0"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              label="Settled Trades"
              value={plSummary.settled_trades}
              icon={<LocalShipping />}
              color="#6a1b9a"
              onClick={() => navigate("/admin/sourcing/settlements")}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              label="Gross Margin"
              value={`${plSummary.gross_margin_pct}%`}
              icon={<TrendingUp />}
              color="#00838f"
            />
          </Grid>
        </Grid>
      )}

      {/* EMD Overview – the main new feature */}
      <EmdOverviewPanel emdData={emdData} loading={emdLoading} onRefresh={fetchEmdOverview} />
    </Box>
  );
};

export default SourcingDashboard;