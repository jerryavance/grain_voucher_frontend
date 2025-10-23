import { Box, Card, CardContent, Grid, Typography, Tabs, Tab, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import useTitle from "../../hooks/useTitle";
import { InvestorService } from "./Investor.service";
import { IInvestorDashboard } from "./Investor.interface";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import WithdrawalForm from "./WithdrawalForm";
import { useModalContext } from "../../contexts/ModalDialogContext";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, PieLabelRenderProps 
} from 'recharts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const InvestorDashboard = () => {
  useTitle("Investor Dashboard");
  const { showModal, setShowModal } = useModalContext();

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [dashboardData, setDashboardData] = useState<IInvestorDashboard | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    fetchAccountId();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const data: IInvestorDashboard = await InvestorService.getInvestorDashboard();
      setDashboardData(data);
      setAccountId(data.accountId || null);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      toast.error(error.response?.data?.detail || "Failed to load dashboard data");
    }
  };

  const fetchAccountId = async () => {
    try {
      const accounts = await InvestorService.getInvestorAccounts({});
      if (accounts.results && accounts.results.length > 0) {
        setAccountId(accounts.results[0].id);
      }
    } catch (error: any) {
      toast.error("Failed to load account details");
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatCurrency = (value: string | number) => {
    return `UGX ${parseFloat(value.toString()).toLocaleString()}`;
  };

  const formatPercentage = (value: string | number) => {
    return `${parseFloat(value.toString()).toFixed(2)}%`;
  };

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

  // Prepare monthly returns data for chart
  const monthlyReturnsData = Object.entries(dashboardData.monthly_returns || {}).map(([month, value]) => ({
    month,
    return: value,
  }));

  // Prepare receivables aging data for pie chart
  const receivablesAgingData = [
    { name: '0-3 days', value: dashboardData.receivables_aging['0-3_days'] },
    { name: '4-7 days', value: dashboardData.receivables_aging['4-7_days'] },
    { name: '8-14 days', value: dashboardData.receivables_aging['8-14_days'] },
    { name: '15-30 days', value: dashboardData.receivables_aging['15-30_days'] },
    { name: 'Above 30 days', value: dashboardData.receivables_aging['above_30_days'] },
  ].filter(item => item.value > 0);

  return (
    <Box pt={2} pb={4} px={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Investor Dashboard</Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => setShowModal(true)}
          disabled={!accountId}
        >
          Request Withdrawal
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total Deposited
              </Typography>
              <Typography variant="h5" component="div">
                {formatCurrency(dashboardData.total_deposited)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Available Balance
              </Typography>
              <Typography variant="h5" component="div" color="success.main">
                {formatCurrency(dashboardData.available_balance)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total Utilized
              </Typography>
              <Typography variant="h5" component="div" color="warning.main">
                {formatCurrency(dashboardData.total_utilized)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total Margin Earned
              </Typography>
              <Typography variant="h5" component="div" color="success.main">
                {formatCurrency(dashboardData.total_margin_earned)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
          <Tab label="Overview" />
          <Tab label="Balance Sheet" />
          <Tab label="Receivables Aging" />
          <Tab label="Profit & Loss" />
          <Tab label="Trade Summary" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Financial Overview
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {formatCurrency(dashboardData.total_deposited)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Deposited
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {formatCurrency(dashboardData.available_balance)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Available Balance
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">
                        {formatCurrency(dashboardData.total_utilized)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Utilized
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {formatCurrency(dashboardData.total_margin_earned)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Margin Earned
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Balance Sheet Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Balance Sheet
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {formatCurrency(dashboardData.balance_sheet.cash_available)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Cash Available
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">
                        {formatCurrency(dashboardData.balance_sheet.funds_in_trades)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Funds in Trades
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">
                        {formatCurrency(dashboardData.balance_sheet.loans_outstanding)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Loans Outstanding
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {formatCurrency(dashboardData.balance_sheet.total_assets)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Assets
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Total Earnings
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(dashboardData.balance_sheet.total_earnings)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Net Earnings
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        {formatCurrency(dashboardData.balance_sheet.net_earnings)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Receivables Aging Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Receivables Aging
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={receivablesAgingData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      // label={(props: PieLabelRenderProps) => `${props.name}: ${(props.percent * 100).toFixed(0)}%`}
                      label={(props: PieLabelRenderProps) => `${props.name}: ${( 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {receivablesAgingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Total Receivables
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(dashboardData.receivables_aging.total)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Profit & Loss Tab */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Profit & Loss
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {formatCurrency(dashboardData.profit_and_loss.total_invested)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Invested
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {formatCurrency(dashboardData.profit_and_loss.trade_profits)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Trade Profits
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {formatCurrency(dashboardData.profit_and_loss.loan_interest)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Loan Interest
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {formatCurrency(dashboardData.profit_and_loss.total_revenue)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Revenue
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Net Profit
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        {formatCurrency(dashboardData.profit_and_loss.net_profit)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Overall ROI
                      </Typography>
                      <Typography variant="h6">
                        {formatPercentage(dashboardData.profit_and_loss.overall_roi)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Trade Summary Tab */}
      <TabPanel value={tabValue} index={4}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Trade Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {dashboardData.trade_summary.number_of_trades}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Number of Trades
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main">
                        {dashboardData.trade_summary.active_trades}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Active Trades
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="h4">
                        {formatCurrency(dashboardData.trade_summary.total_value_invested)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Value Invested
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="h4">
                        {formatCurrency(dashboardData.trade_summary.average_investment)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Average Investment
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Financing Summary */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Financing Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {dashboardData.financing_summary.total_financings}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Financings
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main">
                        {dashboardData.financing_summary.active_financings}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Active
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {dashboardData.financing_summary.completed_financings}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Completed
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Total Allocated
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(dashboardData.financing_summary.total_allocated)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Total Earnings from Financing
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        {formatCurrency(dashboardData.financing_summary.total_earnings)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Loan Summary */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Loan Portfolio Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {dashboardData.loan_summary.total_loans}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Loans
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main">
                        {dashboardData.loan_summary.active_loans}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Active Loans
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">
                        {dashboardData.loan_summary.overdue_loans}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Overdue Loans
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
                        Interest Earned
                      </Typography>
                      <Typography variant="h5" color="success.main" sx={{ textAlign: 'center' }}>
                        {formatCurrency(dashboardData.loan_summary.total_interest_earned)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Total Loaned Amount
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(dashboardData.loan_summary.total_loaned)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Total Outstanding
                      </Typography>
                      <Typography variant="h6" color="warning.main">
                        {formatCurrency(dashboardData.loan_summary.total_outstanding)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Withdrawal Form Modal */}
      {showModal && accountId && (
        <WithdrawalForm
          accountId={accountId}
          callBack={fetchDashboardData}
          handleClose={() => setShowModal(false)}
        />
      )}
    </Box>
  );
};

export default InvestorDashboard;



// import { Box, Card, CardContent, Grid, Typography, Tabs, Tab, Button } from "@mui/material";
// import { useEffect, useState } from "react";
// import { toast } from "react-hot-toast";
// import useTitle from "../../hooks/useTitle";
// import { InvestorService } from "./Investor.service";
// import { IInvestorDashboard } from "./Investor.interface";
// import ProgressIndicator from "../../components/UI/ProgressIndicator";
// import WithdrawalForm from "./WithdrawalForm";
// import { useModalContext } from "../../contexts/ModalDialogContext";
// import { 
//   LineChart, Line, XAxis, YAxis, CartesianGrid, 
//   Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
// } from 'recharts';

// interface TabPanelProps {
//   children?: React.ReactNode;
//   index: number;
//   value: number;
// }

// function TabPanel(props: TabPanelProps) {
//   const { children, value, index, ...other } = props;

//   return (
//     <div
//       role="tabpanel"
//       hidden={value !== index}
//       id={`dashboard-tabpanel-${index}`}
//       aria-labelledby={`dashboard-tab-${index}`}
//       {...other}
//     >
//       {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
//     </div>
//   );
// }

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// const InvestorDashboard = () => {
//   useTitle("Investor Dashboard");
//   const { showModal, setShowModal } = useModalContext();

//   const [tabValue, setTabValue] = useState(0);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [dashboardData, setDashboardData] = useState<IInvestorDashboard | null>(null);
//   const [accountId, setAccountId] = useState<string | null>(null); // Store accountId

//   useEffect(() => {
//     fetchDashboardData();
//     fetchAccountId(); // Fetch accountId separately
//   }, []);

//   const fetchDashboardData = async () => {
//     setLoading(true);
//     try {
//       const data: IInvestorDashboard = await InvestorService.getInvestorDashboard();
//       setDashboardData(data);
//       setAccountId(data.accountId || null); // Set accountId if provided by endpoint
//       setLoading(false);
//     } catch (error: any) {
//       setLoading(false);
//       toast.error(error.response?.data?.detail || "Failed to load dashboard data");
//     }
//   };

//   const fetchAccountId = async () => {
//     try {
//       const accounts = await InvestorService.getInvestorAccounts({}); // Fetch accounts to get investor's accountId
//       if (accounts.results && accounts.results.length > 0) {
//         setAccountId(accounts.results[0].id); // Assume first account is the investor's
//       }
//     } catch (error: any) {
//       toast.error("Failed to load account details");
//     }
//   };

//   const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
//     setTabValue(newValue);
//   };

//   const formatCurrency = (value: string | number) => {
//     return `UGX ${parseFloat(value.toString()).toLocaleString()}`;
//   };

//   const formatPercentage = (value: string | number) => {
//     return `${parseFloat(value.toString()).toFixed(2)}%`;
//   };

//   if (loading) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
//         <ProgressIndicator size={60} />
//       </Box>
//     );
//   }

//   if (!dashboardData) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
//         <Typography variant="h6">No dashboard data available</Typography>
//       </Box>
//     );
//   }

//   // Prepare monthly returns data for chart
//   const monthlyReturnsData = Object.entries(dashboardData.monthly_returns || {}).map(([month, value]) => ({
//     month,
//     return: value, // Value is already a number
//   }));

//   // Prepare receivables aging data for pie chart
//   const receivablesAgingData = [
//     { name: '0-3 days', value: dashboardData.receivables_aging['0-3_days'] },
//     { name: '4-7 days', value: dashboardData.receivables_aging['4-7_days'] },
//     { name: '8-14 days', value: dashboardData.receivables_aging['8-14_days'] },
//     { name: '15-30 days', value: dashboardData.receivables_aging['15-30_days'] },
//     { name: 'Above 30 days', value: dashboardData.receivables_aging['above_30_days'] },
//   ].filter(item => item.value > 0);

//   return (
//     <Box pt={2} pb={4} px={3}>
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//         <Typography variant="h4">Investor Dashboard</Typography>
//         <Button 
//           variant="contained" 
//           color="primary"
//           onClick={() => setShowModal(true)}
//           disabled={!accountId} // Disable if accountId is not available
//         >
//           Request Withdrawal
//         </Button>
//       </Box>

//       {/* Summary Cards */}
//       <Grid container spacing={3} sx={{ mb: 3 }}>
//         <Grid item xs={12} sm={6} md={3}>
//           <Card>
//             <CardContent>
//               <Typography color="textSecondary" gutterBottom variant="body2">
//                 Total Deposited
//               </Typography>
//               <Typography variant="h5" component="div">
//                 {formatCurrency(dashboardData.total_deposited)}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <Card>
//             <CardContent>
//               <Typography color="textSecondary" gutterBottom variant="body2">
//                 Available Balance
//               </Typography>
//               <Typography variant="h5" component="div" color="success.main">
//                 {formatCurrency(dashboardData.available_balance)}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <Card>
//             <CardContent>
//               <Typography color="textSecondary" gutterBottom variant="body2">
//                 Total Utilized
//               </Typography>
//               <Typography variant="h5" component="div" color="warning.main">
//                 {formatCurrency(dashboardData.total_utilized)}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <Card>
//             <CardContent>
//               <Typography color="textSecondary" gutterBottom variant="body2">
//                 Total Margin Earned
//               </Typography>
//               <Typography variant="h5" component="div" color="success.main">
//                 {formatCurrency(dashboardData.total_margin_earned)}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* Tabs */}
//       <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
//         <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
//           <Tab label="Overview" />
//           <Tab label="Balance Sheet" />
//           <Tab label="Receivables Aging" />
//           <Tab label="Profit & Loss" />
//           <Tab label="Trade Summary" />
//         </Tabs>
//       </Box>

//       {/* Overview Tab */}
//       <TabPanel value={tabValue} index={0}>
//         <Grid container spacing={3}>
//           <Grid item xs={12}>
//             <Card>
//               <CardContent>
//                 <Typography variant="h6" gutterBottom color="primary">
//                   Financial Overview
//                 </Typography>
//                 <Grid container spacing={2}>
//                   <Grid item xs={12} sm={6} md={3}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
//                       <Typography variant="h4" color="primary">
//                         {formatCurrency(dashboardData.total_deposited)}
//                       </Typography>
//                       <Typography variant="body2" color="textSecondary">
//                         Total Deposited
//                       </Typography>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12} sm={6} md={3}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
//                       <Typography variant="h4" color="success.main">
//                         {formatCurrency(dashboardData.available_balance)}
//                       </Typography>
//                       <Typography variant="body2" color="textSecondary">
//                         Available Balance
//                       </Typography>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12} sm={6} md={3}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
//                       <Typography variant="h4" color="warning.main">
//                         {formatCurrency(dashboardData.total_utilized)}
//                       </Typography>
//                       <Typography variant="body2" color="textSecondary">
//                         Total Utilized
//                       </Typography>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12} sm={6} md={3}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
//                       <Typography variant="h4" color="success.main">
//                         {formatCurrency(dashboardData.total_margin_earned)}
//                       </Typography>
//                       <Typography variant="body2" color="textSecondary">
//                         Total Margin Earned
//                       </Typography>
//                     </Box>
//                   </Grid>
//                 </Grid>
//               </CardContent>
//             </Card>
//           </Grid>
//         </Grid>
//       </TabPanel>

//       {/* Balance Sheet Tab */}
//       <TabPanel value={tabValue} index={1}>
//         <Grid container spacing={3}>
//           <Grid item xs={12}>
//             <Card>
//               <CardContent>
//                 <Typography variant="h6" gutterBottom color="primary">
//                   Balance Sheet
//                 </Typography>
//                 <Grid container spacing={2}>
//                   <Grid item xs={12} sm={6} md={3}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
//                       <Typography variant="h4" color="primary">
//                         {formatCurrency(dashboardData.balance_sheet.cash_available)}
//                       </Typography>
//                       <Typography variant="body2" color="textSecondary">
//                         Cash Available
//                       </Typography>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12} sm={6} md={3}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
//                       <Typography variant="h4" color="warning.main">
//                         {formatCurrency(dashboardData.balance_sheet.funds_in_trades)}
//                       </Typography>
//                       <Typography variant="body2" color="textSecondary">
//                         Funds in Trades
//                       </Typography>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12} sm={6} md={3}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
//                       <Typography variant="h4" color="warning.main">
//                         {formatCurrency(dashboardData.balance_sheet.loans_outstanding)}
//                       </Typography>
//                       <Typography variant="body2" color="textSecondary">
//                         Loans Outstanding
//                       </Typography>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12} sm={6} md={3}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
//                       <Typography variant="h4" color="success.main">
//                         {formatCurrency(dashboardData.balance_sheet.total_assets)}
//                       </Typography>
//                       <Typography variant="body2" color="textSecondary">
//                         Total Assets
//                       </Typography>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12} sm={6}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
//                       <Typography variant="body2" color="textSecondary">
//                         Total Earnings
//                       </Typography>
//                       <Typography variant="h6">
//                         {formatCurrency(dashboardData.balance_sheet.total_earnings)}
//                       </Typography>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12} sm={6}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
//                       <Typography variant="body2" color="textSecondary">
//                         Net Earnings
//                       </Typography>
//                       <Typography variant="h6" color="success.main">
//                         {formatCurrency(dashboardData.balance_sheet.net_earnings)}
//                       </Typography>
//                     </Box>
//                   </Grid>
//                 </Grid>
//               </CardContent>
//             </Card>
//           </Grid>
//         </Grid>
//       </TabPanel>

//       {/* Receivables Aging Tab */}
//       <TabPanel value={tabValue} index={2}>
//         <Grid container spacing={3}>
//           <Grid item xs={12}>
//             <Card>
//               <CardContent>
//                 <Typography variant="h6" gutterBottom color="primary">
//                   Receivables Aging
//                 </Typography>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <PieChart>
//                     <Pie
//                       data={receivablesAgingData}
//                       cx="50%"
//                       cy="50%"
//                       labelLine={false}
//                       label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                       outerRadius={80}
//                       fill="#8884d8"
//                       dataKey="value"
//                     >
//                       {receivablesAgingData.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                       ))}
//                     </Pie>
//                     <Tooltip formatter={(value: number) => formatCurrency(value)} />
//                     <Legend />
//                   </PieChart>
//                 </ResponsiveContainer>
//                 <Grid container spacing={2} sx={{ mt: 2 }}>
//                   <Grid item xs={12}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
//                       <Typography variant="body2" color="textSecondary">
//                         Total Receivables
//                       </Typography>
//                       <Typography variant="h6">
//                         {formatCurrency(dashboardData.receivables_aging.total)}
//                       </Typography>
//                     </Box>
//                   </Grid>
//                 </Grid>
//               </CardContent>
//             </Card>
//           </Grid>
//         </Grid>
//       </TabPanel>

//       {/* Profit & Loss Tab */}
//       <TabPanel value={tabValue} index={3}>
//         <Grid container spacing={3}>
//           <Grid item xs={12}>
//             <Card>
//               <CardContent>
//                 <Typography variant="h6" gutterBottom color="primary">
//                   Profit & Loss
//                 </Typography>
//                 <Grid container spacing={2}>
//                   <Grid item xs={12} sm={6} md={3}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
//                       <Typography variant="h4" color="primary">
//                         {formatCurrency(dashboardData.profit_and_loss.total_invested)}
//                       </Typography>
//                       <Typography variant="body2" color="textSecondary">
//                         Total Invested
//                       </Typography>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12} sm={6} md={3}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
//                       <Typography variant="h4" color="success.main">
//                         {formatCurrency(dashboardData.profit_and_loss.trade_profits)}
//                       </Typography>
//                       <Typography variant="body2" color="textSecondary">
//                         Trade Profits
//                       </Typography>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12} sm={6} md={3}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
//                       <Typography variant="h4" color="success.main">
//                         {formatCurrency(dashboardData.profit_and_loss.loan_interest)}
//                       </Typography>
//                       <Typography variant="body2" color="textSecondary">
//                         Loan Interest
//                       </Typography>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12} sm={6} md={3}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
//                       <Typography variant="h4" color="success.main">
//                         {formatCurrency(dashboardData.profit_and_loss.total_revenue)}
//                       </Typography>
//                       <Typography variant="body2" color="textSecondary">
//                         Total Revenue
//                       </Typography>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12} sm={6}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
//                       <Typography variant="body2" color="textSecondary">
//                         Net Profit
//                       </Typography>
//                       <Typography variant="h6" color="success.main">
//                         {formatCurrency(dashboardData.profit_and_loss.net_profit)}
//                       </Typography>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12} sm={6}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
//                       <Typography variant="body2" color="textSecondary">
//                         Overall ROI
//                       </Typography>
//                       <Typography variant="h6">
//                         {formatPercentage(dashboardData.profit_and_loss.overall_roi)}
//                       </Typography>
//                     </Box>
//                   </Grid>
//                 </Grid>
//               </CardContent>
//             </Card>
//           </Grid>
//         </Grid>
//       </TabPanel>

//       {/* Trade Summary Tab */}
//       <TabPanel value={tabValue} index={4}>
//         <Grid container spacing={3}>
//           <Grid item xs={12}>
//             <Card>
//               <CardContent>
//                 <Typography variant="h6" gutterBottom color="primary">
//                   Trade Summary
//                 </Typography>
//                 <Grid container spacing={2}>
//                   <Grid item xs={12} sm={6} md={3}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
//                       <Typography variant="h4" color="primary">
//                         {dashboardData.trade_summary.number_of_trades}
//                       </Typography>
//                       <Typography variant="body2" color="textSecondary">
//                         Number of Trades
//                       </Typography>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12} sm={6} md={3}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
//                       <Typography variant="h4" color="info.main">
//                         {dashboardData.trade_summary.active_trades}
//                       </Typography>
//                       <Typography variant="body2" color="textSecondary">
//                         Active Trades
//                       </Typography>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12} sm={6} md={3}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
//                       <Typography variant="h4">
//                         {formatCurrency(dashboardData.trade_summary.total_value_invested)}
//                       </Typography>
//                       <Typography variant="body2" color="textSecondary">
//                         Total Value Invested
//                       </Typography>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12} sm={6} md={3}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
//                       <Typography variant="h4">
//                         {formatCurrency(dashboardData.trade_summary.average_investment)}
//                       </Typography>
//                       <Typography variant="body2" color="textSecondary">
//                         Average Investment
//                       </Typography>
//                     </Box>
//                   </Grid>
//                 </Grid>
//               </CardContent>
//             </Card>
//           </Grid>

//           {/* Financing Summary */}
//           <Grid item xs={12}>
//             <Card>
//               <CardContent>
//                 <Typography variant="h6" gutterBottom color="primary">
//                   Financing Summary
//                 </Typography>
//                 <Grid container spacing={2}>
//                   <Grid item xs={4}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
//                       <Typography variant="h4" color="primary">
//                         {dashboardData.financing_summary.total_financings}
//                       </Typography>
//                       <Typography variant="body2" color="textSecondary">
//                         Total Financings
//                       </Typography>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={4}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
//                       <Typography variant="h4" color="info.main">
//                         {dashboardData.financing_summary.active_financings}
//                       </Typography>
//                       <Typography variant="body2" color="textSecondary">
//                         Active
//                       </Typography>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={4}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
//                       <Typography variant="h4" color="success.main">
//                         {dashboardData.financing_summary.completed_financings}
//                       </Typography>
//                       <Typography variant="body2" color="textSecondary">
//                         Completed
//                       </Typography>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
//                       <Typography variant="body2" color="textSecondary">
//                         Total Allocated
//                       </Typography>
//                       <Typography variant="h6">
//                         {formatCurrency(dashboardData.financing_summary.total_allocated)}
//                       </Typography>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
//                       <Typography variant="body2" color="textSecondary">
//                         Total Earnings from Financing
//                       </Typography>
//                       <Typography variant="h6" color="success.main">
//                         {formatCurrency(dashboardData.financing_summary.total_earnings)}
//                       </Typography>
//                     </Box>
//                   </Grid>
//                 </Grid>
//               </CardContent>
//             </Card>
//           </Grid>

//           {/* Loan Summary */}
//           <Grid item xs={12}>
//             <Card>
//               <CardContent>
//                 <Typography variant="h6" gutterBottom color="primary">
//                   Loan Portfolio Summary
//                 </Typography>
//                 <Grid container spacing={2}>
//                   <Grid item xs={12} sm={6} md={3}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
//                       <Typography variant="h4" color="primary">
//                         {dashboardData.loan_summary.total_loans}
//                       </Typography>
//                       <Typography variant="body2" color="textSecondary">
//                         Total Loans
//                       </Typography>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12} sm={6} md={3}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
//                       <Typography variant="h4" color="info.main">
//                         {dashboardData.loan_summary.active_loans}
//                       </Typography>
//                       <Typography variant="body2" color="textSecondary">
//                         Active Loans
//                       </Typography>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12} sm={6} md={3}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
//                       <Typography variant="h4" color="warning.main">
//                         {dashboardData.loan_summary.overdue_loans}
//                       </Typography>
//                       <Typography variant="body2" color="textSecondary">
//                         Overdue Loans
//                       </Typography>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12} sm={6} md={3}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
//                       <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
//                         Interest Earned
//                       </Typography>
//                       <Typography variant="h5" color="success.main" sx={{ textAlign: 'center' }}>
//                         {formatCurrency(dashboardData.loan_summary.total_interest_earned)}
//                       </Typography>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12} md={6}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
//                       <Typography variant="body2" color="textSecondary">
//                         Total Loaned Amount
//                       </Typography>
//                       <Typography variant="h6">
//                         {formatCurrency(dashboardData.loan_summary.total_loaned)}
//                       </Typography>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12} md={6}>
//                     <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
//                       <Typography variant="body2" color="textSecondary">
//                         Total Outstanding
//                       </Typography>
//                       <Typography variant="h6" color="warning.main">
//                         {formatCurrency(dashboardData.loan_summary.total_outstanding)}
//                       </Typography>
//                     </Box>
//                   </Grid>
//                 </Grid>
//               </CardContent>
//             </Card>
//           </Grid>
//         </Grid>
//       </TabPanel>

//       {/* Withdrawal Form Modal */}
//       {showModal && accountId && (
//         <WithdrawalForm
//           accountId={accountId}
//           callBack={fetchDashboardData}
//           handleClose={() => setShowModal(false)}
//         />
//       )}
//     </Box>
//   );
// };

// export default InvestorDashboard;