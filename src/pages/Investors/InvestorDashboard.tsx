import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Tabs,
  Tab,
  Button,
  Chip,
  Alert,
  Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import useTitle from "../../hooks/useTitle";
import { InvestorService } from "./Investor.service";
import { IInvestorDashboard } from "./Investor.interface";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import WithdrawalForm from "./WithdrawalForm";
import { useModalContext } from "../../contexts/ModalDialogContext";

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

const EmptyState = ({ message }: { message: string }) => (
  <Box sx={{ textAlign: "center", py: 6 }}>
    <Typography color="text.primary" variant="body1">{message}</Typography>
  </Box>
);

const InvestorDashboard = () => {
  useTitle("Investor Dashboard");
  const { showModal, setShowModal } = useModalContext();

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<IInvestorDashboard | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashboard, accounts] = await Promise.all([
        InvestorService.getInvestorDashboard(),
        InvestorService.getInvestorAccounts({ page: 1, page_size: 1 }),
      ]);
      setDashboardData(dashboard);
      if (accounts.results?.length > 0) setAccountId(accounts.results[0].id);
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

  const unpaidMargin =
    parseFloat(dashboardData.total_margin_earned.toString()) -
    parseFloat(dashboardData.total_margin_paid.toString());

  const hasReceivables = dashboardData.receivables_aging.total > 0;
  const hasTrades = dashboardData.trade_summary.number_of_trades > 0;
  const hasLoans = dashboardData.loan_summary.total_loans > 0;
  const hasFinancing = dashboardData.financing_summary.total_financings > 0;
  const hasPnL = dashboardData.profit_and_loss.total_invested > 0;

  return (
    <Box pt={2} pb={4} px={3}>
      {/* Header */}
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

      {/* Top KPI Cards — only show fields with real values */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Available Balance */}
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
                  Available Balance
                </Typography>
              </Box>
              <Typography variant="h5" color="success.dark" fontWeight="bold">
                {fmt(dashboardData.available_balance)}
              </Typography>
              <Typography variant="caption" color="text.primary" sx={{ display: "block", mt: 0.5 }}>
                Total Deposited: {fmt(dashboardData.total_deposited)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Margin Earned */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: "100%", bgcolor: "#f3e5f5" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                <TrendingUpIcon sx={{ fontSize: 18, mr: 0.5, color: "primary.main" }} />
                <Typography variant="overline" color="text.primary">
                  Margin Earned
                </Typography>
              </Box>
              <Typography variant="h5" color="primary.main" fontWeight="bold">
                {fmt(dashboardData.total_margin_earned)}
              </Typography>
              <Typography variant="caption" color="text.primary" display="block" mt={0.5}>
                Paid Out: {fmt(dashboardData.total_margin_paid)}
              </Typography>
              {unpaidMargin > 0 && (
                <Chip
                  label={`${fmt(unpaidMargin)} unpaid`}
                  color="warning"
                  size="small"
                  sx={{ mt: 0.5, fontSize: 10 }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Net Earnings */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: "100%", bgcolor: "#e3f2fd" }}>
            <CardContent>
              <Typography variant="overline" color="text.primary">
                Net Earnings
              </Typography>
              <Typography variant="h5" color="primary.main" fontWeight="bold">
                {fmt(dashboardData.balance_sheet.net_earnings)}
              </Typography>
              <Typography variant="caption" color="text.primary" display="block" mt={0.5}>
                Total Earnings: {fmt(dashboardData.balance_sheet.total_earnings)}
              </Typography>
              <Typography variant="caption" color="text.primary" display="block">
                Withdrawn: {fmt(dashboardData.balance_sheet.earnings_withdrawn)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Overview" />
          <Tab label="Balance Sheet" />
          <Tab label="Receivables" />
          <Tab label="P & L" />
          <Tab label="Trade Summary" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Payout summary alert if unpaid margin exists */}
          {unpaidMargin > 0 && (
            <Grid item xs={12}>
              <Alert severity="info">
                You have <strong>{fmt(unpaidMargin)}</strong> in unpaid margin earnings. Use "Request Withdrawal" to initiate a payout.
              </Alert>
            </Grid>
          )}

          {/* EMD Summary */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">EMD Summary</Typography>
                <Grid container spacing={1.5}>
                  {[
                    { label: "EMD Balance", value: dashboardData.emd_summary.emd_balance },
                    { label: "EMD Utilized", value: dashboardData.emd_summary.emd_utilized },
                    { label: "Total Committed", value: dashboardData.emd_summary.total_emd_committed },
                    { label: "Total Deposited", value: dashboardData.emd_summary.total_deposited },
                  ].map(({ label, value }) => (
                    <Grid item xs={6} key={label}>
                      <Box sx={{ p: 1.5, border: "1px solid #e0e0e0", borderRadius: 1 }}>
                        <Typography variant="caption" color="text.primary">{label}</Typography>
                        <Typography variant="body1" fontWeight="bold">{fmt(value)}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                {dashboardData.emd_summary.unpaid_margin > 0 && (
                  <Alert severity="warning" sx={{ mt: 1.5 }}>
                    Unpaid Margin: <strong>{fmt(dashboardData.emd_summary.unpaid_margin)}</strong>
                  </Alert>
                )}
                {dashboardData.emd_summary.pending_payout_requests > 0 && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    Pending Payout Requests: {dashboardData.emd_summary.pending_payout_requests}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Financing Portfolio */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">Financing Portfolio</Typography>
                {hasFinancing ? (
                  <Grid container spacing={1.5}>
                    {[
                      { label: "Total", value: dashboardData.financing_summary.total_financings, isNum: true },
                      { label: "Active", value: dashboardData.financing_summary.active_financings, isNum: true },
                      { label: "Completed", value: dashboardData.financing_summary.completed_financings, isNum: true },
                      { label: "Total Allocated", value: dashboardData.financing_summary.total_allocated, isNum: false },
                      { label: "Total Earnings", value: dashboardData.financing_summary.total_earnings, isNum: false },
                    ].map(({ label, value, isNum }) => (
                      <Grid item xs={6} key={label}>
                        <Box sx={{ p: 1.5, border: "1px solid #e0e0e0", borderRadius: 1 }}>
                          <Typography variant="caption" color="text.primary">{label}</Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {isNum ? value : fmt(value)}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <EmptyState message="No financing activity yet. Allocated funds will appear here once trades are initiated." />
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Balance Sheet Tab */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">Balance Sheet</Typography>
            <Grid container spacing={2}>
              {[
                { label: "EMD Available", value: dashboardData.balance_sheet.emd_available, color: "primary.main" },
                { label: "EMD in Trades", value: dashboardData.balance_sheet.emd_in_trades, color: "warning.main" },
                { label: "Loans Outstanding", value: dashboardData.balance_sheet.loans_outstanding, color: "warning.main" },
                { label: "Total Assets", value: dashboardData.balance_sheet.total_assets, color: "success.main" },
                { label: "Total Earnings", value: dashboardData.balance_sheet.total_earnings, color: "text.primary" },
                { label: "Earnings Withdrawn", value: dashboardData.balance_sheet.earnings_withdrawn, color: "error.main" },
                { label: "Net Earnings", value: dashboardData.balance_sheet.net_earnings, color: "success.main" },
              ].map(({ label, value, color }) => (
                <Grid item xs={12} sm={6} md={3} key={label}>
                  <Box sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 1, textAlign: "center" }}>
                    <Typography variant="caption" color="text.primary">{label}</Typography>
                    <Typography variant="h6" color={color} fontWeight="bold">{fmt(value)}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Receivables Aging Tab */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">Receivables Aging</Typography>
            {hasReceivables ? (
              <Typography>Receivables data will appear here once trades generate outstanding amounts.</Typography>
            ) : (
              <EmptyState message="No outstanding receivables. All financed amounts have been settled." />
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* P&L Tab */}
      <TabPanel value={tabValue} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">Profit & Loss</Typography>
            {hasPnL ? (
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
                      <Typography variant="caption" color="text.primary">{label}</Typography>
                      <Typography variant="h6" color={color} fontWeight="bold">{fmt(value)}</Typography>
                    </Box>
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Box sx={{ p: 2, bgcolor: "#e3f2fd", borderRadius: 1, textAlign: "center" }}>
                    <Typography variant="body2" color="text.primary">Overall ROI</Typography>
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                      {fmtPct(dashboardData.profit_and_loss.overall_roi)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <EmptyState message="P&L data will populate once trades are active and settled." />
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Trade Summary Tab */}
      <TabPanel value={tabValue} index={4}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">Trade Summary</Typography>
                {hasTrades ? (
                  <Grid container spacing={2}>
                    {[
                      { label: "Total Trades", value: dashboardData.trade_summary.number_of_trades, isNum: true },
                      { label: "Active", value: dashboardData.trade_summary.active_trades, isNum: true },
                      { label: "Total Invested", value: dashboardData.trade_summary.total_value_invested, isNum: false },
                      { label: "Avg Investment", value: dashboardData.trade_summary.average_investment, isNum: false },
                    ].map(({ label, value, isNum }) => (
                      <Grid item xs={12} sm={6} md={3} key={label}>
                        <Box sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 1, textAlign: "center" }}>
                          <Typography variant="caption" color="text.primary">{label}</Typography>
                          <Typography variant="h5" fontWeight="bold">
                            {isNum ? value : fmt(value)}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <EmptyState message="No trades yet. Your trade activity will appear here once you start investing." />
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">Loan Portfolio</Typography>
                {hasLoans ? (
                  <Grid container spacing={2}>
                    {[
                      { label: "Total Loans", value: dashboardData.loan_summary.total_loans, isNum: true },
                      { label: "Active", value: dashboardData.loan_summary.active_loans, isNum: true },
                      { label: "Overdue", value: dashboardData.loan_summary.overdue_loans, isNum: true },
                      { label: "Interest Earned", value: dashboardData.loan_summary.total_interest_earned, isNum: false },
                      { label: "Total Loaned", value: dashboardData.loan_summary.total_loaned, isNum: false },
                      { label: "Outstanding", value: dashboardData.loan_summary.total_outstanding, isNum: false },
                    ].map(({ label, value, isNum }) => (
                      <Grid item xs={12} sm={6} md={4} key={label}>
                        <Box sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 1, textAlign: "center" }}>
                          <Typography variant="caption" color="text.primary">{label}</Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {isNum ? value : fmt(value)}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <EmptyState message="No loan activity yet. Loan data will appear here once loans are issued." />
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Withdrawal Modal */}
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