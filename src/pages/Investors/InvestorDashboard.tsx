import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Tabs,
  Tab,
  Button,
  LinearProgress,
  Chip,
  Alert,
  Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LockIcon from "@mui/icons-material/Lock";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import useTitle from "../../hooks/useTitle";
import { InvestorService } from "./Investor.service";
import { IInvestorDashboard } from "./Investor.interface";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import WithdrawalForm from "./WithdrawalForm";
import { useModalContext } from "../../contexts/ModalDialogContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  PieLabelRenderProps,
  BarChart,
  Bar,
} from "recharts";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const COLORS = ["#43a047", "#1976d2", "#ffa726", "#ef5350", "#7b1fa2"];

const InvestorDashboard = () => {
  useTitle("Investor Dashboard");
  const { showModal, setShowModal } = useModalContext();

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<IInvestorDashboard | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashboard, accounts] = await Promise.all([
        InvestorService.getInvestorDashboard(),
        InvestorService.getInvestorAccounts({ page: 1, page_size: 1 }),
      ]);
      setDashboardData(dashboard);
      if (accounts.results?.length > 0) {
        setAccountId(accounts.results[0].id);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fmt = (v: string | number) =>
    `UGX ${parseFloat((v ?? 0).toString()).toLocaleString()}`;
  const fmtPct = (v: string | number) =>
    `${parseFloat((v ?? 0).toString()).toFixed(2)}%`;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <ProgressIndicator size={60} />
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="h6">No dashboard data available</Typography>
      </Box>
    );
  }

  // Derived values
  const emdBalance = dashboardData.emd_balance ?? dashboardData.available_balance ?? 0;
  const emdUtilized = dashboardData.emd_utilized ?? dashboardData.total_utilized ?? 0;
  const emdTotal = emdBalance + emdUtilized;
  const emdPct = emdTotal > 0 ? (emdUtilized / emdTotal) * 100 : 0;

  const monthlyReturnsData = Object.entries(dashboardData.monthly_returns || {}).map(
    ([month, value]) => ({ month, return: value })
  );
  const receivablesAgingData = [
    { name: "0–3 days", value: dashboardData.receivables_aging["0-3_days"] },
    { name: "4–7 days", value: dashboardData.receivables_aging["4-7_days"] },
    { name: "8–14 days", value: dashboardData.receivables_aging["8-14_days"] },
    { name: "15–30 days", value: dashboardData.receivables_aging["15-30_days"] },
    { name: ">30 days", value: dashboardData.receivables_aging["above_30_days"] },
  ].filter((d) => d.value > 0);

  return (
    <Box pt={2} pb={4} px={3}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <AccountBalanceIcon sx={{ fontSize: 38, color: "primary.main" }} />
          <Typography variant="h4">Investor Dashboard</Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowModal(true)}
          disabled={!accountId}
          startIcon={<AccountBalanceWalletIcon />}
        >
          Request Withdrawal
        </Button>
      </Box>

      {/* ── Top KPI Cards ───────────────────────────────────────────────────── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* EMD Wallet Card (NEW – most important) */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
              border: "1px solid #a5d6a7",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <AccountBalanceWalletIcon sx={{ mr: 1, color: "success.dark" }} />
                <Typography variant="overline" color="success.dark" fontWeight="bold">
                  EMD Wallet
                </Typography>
              </Box>
              <Typography variant="h5" color="success.dark" fontWeight="bold">
                {fmt(emdBalance)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                Available for trade allocation
              </Typography>
              <Box sx={{ mt: 1.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    <LockIcon sx={{ fontSize: 12, mr: 0.3 }} />
                    In trades: {fmt(emdUtilized)}
                  </Typography>
                  <Typography variant="caption" color={emdPct > 80 ? "error.main" : "text.secondary"}>
                    {emdPct.toFixed(0)}% utilized
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={emdPct}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: "#fff",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: emdPct > 80 ? "#ef5350" : emdPct > 50 ? "#ffa726" : "#43a047",
                    },
                  }}
                />
              </Box>
              {emdBalance === 0 && (
                <Alert severity="warning" sx={{ mt: 1, py: 0.5 }}>
                  No available EMD — new trades cannot be allocated
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Total Deposited */}
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary" fontSize={10}>
                Total Deposited
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {fmt(dashboardData.total_deposited)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Margin Earned */}
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ height: "100%", bgcolor: "#f3e5f5" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                <TrendingUpIcon sx={{ fontSize: 18, mr: 0.5, color: "secondary.main" }} />
                <Typography variant="overline" color="text.secondary" fontSize={10}>
                  Margin Earned
                </Typography>
              </Box>
              <Typography variant="h6" color="secondary.main" fontWeight="bold">
                {fmt(dashboardData.total_margin_earned)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Margin Paid */}
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary" fontSize={10}>
                Margin Paid Out
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {fmt(dashboardData.total_margin_paid)}
              </Typography>
              {(() => {
                const unpaid =
                  dashboardData.total_margin_earned - dashboardData.total_margin_paid;
                return unpaid > 0 ? (
                  <Chip
                    label={`${fmt(unpaid)} unpaid`}
                    color="warning"
                    size="small"
                    sx={{ mt: 0.5, fontSize: 10 }}
                  />
                ) : null;
              })()}
            </CardContent>
          </Card>
        </Grid>

        {/* Overall ROI */}
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ height: "100%", bgcolor: "#e3f2fd" }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary" fontSize={10}>
                Overall ROI
              </Typography>
              <Typography variant="h6" color="primary.main" fontWeight="bold">
                {fmtPct(dashboardData.profit_and_loss?.overall_roi ?? 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Net: {fmt(dashboardData.profit_and_loss?.net_profit ?? 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Overview" />
          <Tab label="Balance Sheet" />
          <Tab label="Receivables" />
          <Tab label="P & L" />
          <Tab label="Trade Summary" />
        </Tabs>
      </Box>

      {/* ── Overview Tab ──────────────────────────────────────────────────── */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Monthly returns chart */}
          {monthlyReturnsData.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Monthly Returns (%)
                  </Typography>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={monthlyReturnsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} unit="%" />
                      <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="return"
                        stroke="#43a047"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        name="ROI %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Financing summary mini-cards */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Financing Portfolio
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { label: "Total", value: dashboardData.financing_summary.total_financings, color: "text.primary" },
                    { label: "Active", value: dashboardData.financing_summary.active_financings, color: "info.main" },
                    { label: "Completed", value: dashboardData.financing_summary.completed_financings, color: "success.main" },
                  ].map(({ label, value, color }) => (
                    <Grid item xs={4} key={label}>
                      <Box sx={{ textAlign: "center", p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}>
                        <Typography variant="h4" color={color}>{value}</Typography>
                        <Typography variant="caption" color="text.secondary">{label}</Typography>
                      </Box>
                    </Grid>
                  ))}
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">Total Allocated</Typography>
                      <Typography variant="h6">{fmt(dashboardData.financing_summary.total_allocated)}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 1, bgcolor: "#e8f5e9" }}>
                      <Typography variant="caption" color="text.secondary">Total Earnings from Financing</Typography>
                      <Typography variant="h6" color="success.main">
                        {fmt(dashboardData.financing_summary.total_earnings)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ── Balance Sheet Tab ────────────────────────────────────────────── */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">Balance Sheet</Typography>
            <Grid container spacing={2}>
              {[
                { label: "Cash Available", value: dashboardData.balance_sheet.cash_available, color: "primary.main" },
                { label: "Funds in Trades", value: dashboardData.balance_sheet.funds_in_trades, color: "warning.main" },
                { label: "Loans Outstanding", value: dashboardData.balance_sheet.loans_outstanding, color: "warning.main" },
                { label: "Total Assets", value: dashboardData.balance_sheet.total_assets, color: "success.main" },
                { label: "Total Earnings", value: dashboardData.balance_sheet.total_earnings, color: "text.primary" },
                { label: "Earnings Withdrawn", value: dashboardData.balance_sheet.earnings_withdrawn, color: "error.main" },
                { label: "Net Earnings", value: dashboardData.balance_sheet.net_earnings, color: "success.main" },
              ].map(({ label, value, color }) => (
                <Grid item xs={12} sm={6} md={3} key={label}>
                  <Box sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 1, textAlign: "center" }}>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                    <Typography variant="h6" color={color} fontWeight="bold">{fmt(value)}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* ── Receivables Aging Tab ────────────────────────────────────────── */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Receivables Aging
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                {receivablesAgingData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={receivablesAgingData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(p: PieLabelRenderProps) =>
                          `${p.name}: ${(Number(p.percent) * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        dataKey="value"
                      >
                        {receivablesAgingData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => fmt(v)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography color="text.secondary">No receivables</Typography>
                  </Box>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {receivablesAgingData.map(({ name, value }, i) => (
                  <Box key={name} sx={{ mb: 1.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.3 }}>
                      <Typography variant="body2">{name}</Typography>
                      <Typography variant="body2" fontWeight="bold">{fmt(value)}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={
                        dashboardData.receivables_aging.total > 0
                          ? (value / dashboardData.receivables_aging.total) * 100
                          : 0
                      }
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: "#f5f5f5",
                        "& .MuiLinearProgress-bar": { bgcolor: COLORS[i % COLORS.length] },
                      }}
                    />
                  </Box>
                ))}
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="subtitle1" fontWeight="bold">Total Receivables</Typography>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary">
                    {fmt(dashboardData.receivables_aging.total)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* ── P&L Tab ──────────────────────────────────────────────────────── */}
      <TabPanel value={tabValue} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">Profit & Loss</Typography>
            <Grid container spacing={2}>
              {[
                { label: "Total Invested", value: dashboardData.profit_and_loss.total_invested, color: "text.primary" },
                { label: "Trade Profits", value: dashboardData.profit_and_loss.trade_profits, color: "success.main" },
                { label: "Loan Interest", value: dashboardData.profit_and_loss.loan_interest, color: "success.main" },
                { label: "Total Revenue", value: dashboardData.profit_and_loss.total_revenue, color: "success.main" },
                { label: "Profit Withdrawn", value: dashboardData.profit_and_loss.profit_withdrawn, color: "error.main" },
                { label: "Net Profit", value: dashboardData.profit_and_loss.net_profit, color: "success.main" },
              ].map(({ label, value, color }) => (
                <Grid item xs={12} sm={6} md={4} key={label}>
                  <Box sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                    <Typography variant="h6" color={color} fontWeight="bold">{fmt(value)}</Typography>
                  </Box>
                </Grid>
              ))}
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: "#e3f2fd", borderRadius: 1, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">Overall ROI</Typography>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    {fmtPct(dashboardData.profit_and_loss.overall_roi)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* ── Trade Summary Tab ────────────────────────────────────────────── */}
      <TabPanel value={tabValue} index={4}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">Trade Summary</Typography>
                <Grid container spacing={2}>
                  {[
                    { label: "Total Trades", value: dashboardData.trade_summary.number_of_trades, color: "primary.main", isNum: true },
                    { label: "Active", value: dashboardData.trade_summary.active_trades, color: "info.main", isNum: true },
                    { label: "Total Invested", value: dashboardData.trade_summary.total_value_invested, color: "text.primary", isNum: false },
                    { label: "Avg Investment", value: dashboardData.trade_summary.average_investment, color: "text.primary", isNum: false },
                  ].map(({ label, value, color, isNum }) => (
                    <Grid item xs={12} sm={6} md={3} key={label}>
                      <Box sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 1, textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary">{label}</Typography>
                        <Typography variant="h5" color={color} fontWeight="bold">
                          {isNum ? value : fmt(value)}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">Loan Portfolio</Typography>
                <Grid container spacing={2}>
                  {[
                    { label: "Total Loans", value: dashboardData.loan_summary.total_loans, color: "text.primary", isNum: true },
                    { label: "Active", value: dashboardData.loan_summary.active_loans, color: "info.main", isNum: true },
                    { label: "Overdue", value: dashboardData.loan_summary.overdue_loans, color: "error.main", isNum: true },
                    { label: "Interest Earned", value: dashboardData.loan_summary.total_interest_earned, color: "success.main", isNum: false },
                    { label: "Total Loaned", value: dashboardData.loan_summary.total_loaned, color: "text.primary", isNum: false },
                    { label: "Outstanding", value: dashboardData.loan_summary.total_outstanding, color: "warning.main", isNum: false },
                  ].map(({ label, value, color, isNum }) => (
                    <Grid item xs={12} sm={6} md={4} key={label}>
                      <Box sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 1, textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary">{label}</Typography>
                        <Typography variant="h6" color={color} fontWeight="bold">
                          {isNum ? value : fmt(value)}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ── Withdrawal Modal ─────────────────────────────────────────────── */}
      {showModal && accountId && (
        <WithdrawalForm
          accountId={accountId}
          callBack={loadData}
          handleClose={() => setShowModal(false)}
        />
      )}
    </Box>
  );
};

export default InvestorDashboard;