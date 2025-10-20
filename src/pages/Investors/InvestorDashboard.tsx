import { Box, Card, CardContent, Grid, Typography, Tabs, Tab, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import useTitle from "../../hooks/useTitle";
import { InvestorService } from "./Investor.service";
import { IInvestorDashboard } from "./Investor.interface";
import { Span } from "../../components/Typography";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import WithdrawalForm from "./WithdrawalForm";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
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

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [dashboardData, setDashboardData] = useState<IInvestorDashboard | null>(null);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [accountId, setAccountId] = useState<string>("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const data = await InvestorService.getInvestorDashboard();
      setDashboardData(data);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      toast.error(error.message || "Failed to load dashboard data");
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
  const monthlyReturnsData = Object.entries(dashboardData.monthly_returns).map(([month, value]) => ({
    month,
    return: parseFloat(value),
  }));

  // Prepare receivables aging data for pie chart
  const receivablesAgingData = [
    { name: '0-3 days', value: parseFloat(dashboardData.receivables_aging['0-3_days']) },
    { name: '4-7 days', value: parseFloat(dashboardData.receivables_aging['4-7_days']) },
    { name: '8-14 days', value: parseFloat(dashboardData.receivables_aging['8-14_days']) },
    { name: '15-30 days', value: parseFloat(dashboardData.receivables_aging['15-30_days']) },
    { name: 'Above 30 days', value: parseFloat(dashboardData.receivables_aging['above_30_days']) },
  ].filter(item => item.value > 0);

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Investor Dashboard</Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => setShowWithdrawalForm(true)}
        >
          Request Withdrawal
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
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
              <Typography color="textSecondary" gutterBottom>
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
              <Typography color="textSecondary" gutterBottom>
                Total Utilized
              </Typography>
              <Typography variant="h5" component="div">
                {formatCurrency(dashboardData.total_utilized)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Margin Earned
              </Typography>
              <Typography variant="h5" component="div" color="primary.main">
                {formatCurrency(dashboardData.total_margin_earned)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
          <Tab label="Balance Sheet" />
          <Tab label="Profit & Loss" />
          <Tab label="Receivables Aging" />
          <Tab label="Monthly Returns" />
          <Tab label="Trade Summary" />
        </Tabs>
      </Box>

      {/* Balance Sheet Tab */}
      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Balance Sheet</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary">Cash</Typography>
                  <Typography variant="h6">{formatCurrency(dashboardData.balance_sheet.cash)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary">Goods in Transit</Typography>
                  <Typography variant="h6">{formatCurrency(dashboardData.balance_sheet.goods_in_transit)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary">Receivables</Typography>
                  <Typography variant="h6">{formatCurrency(dashboardData.balance_sheet.receivables)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="textSecondary">Funds Borrowed</Typography>
                  <Typography variant="h6">{formatCurrency(dashboardData.balance_sheet.funds_borrowed)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ p: 2, border: '2px solid #1976d2', borderRadius: 1, bgcolor: '#e3f2fd' }}>
                  <Typography variant="subtitle1" color="primary">Current Cash Remaining</Typography>
                  <Typography variant="h5" color="primary">{formatCurrency(dashboardData.balance_sheet.current_cash_remaining)}</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Profit & Loss Tab */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Profit & Loss Statement</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Revenue</Typography>
                <Box sx={{ pl: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Sales</Typography>
                    <Typography>{formatCurrency(dashboardData.profit_and_loss.revenue.sales)}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Costs</Typography>
                <Box sx={{ pl: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Cost of Grain</Typography>
                    <Typography>{formatCurrency(dashboardData.profit_and_loss.costs.cost_of_grain)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Fees & Commission</Typography>
                    <Typography>{formatCurrency(dashboardData.profit_and_loss.costs.fees_and_commission)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Logistics</Typography>
                    <Typography>{formatCurrency(dashboardData.profit_and_loss.costs.logistics)}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ p: 2, border: '2px solid #2e7d32', borderRadius: 1, bgcolor: '#e8f5e9' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" color="success.main" sx={{ fontWeight: 'bold' }}>Net Profit</Typography>
                    <Typography variant="h6" color="success.main">{formatCurrency(dashboardData.profit_and_loss.net_profit)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Profit Paid</Typography>
                    <Typography>{formatCurrency(dashboardData.profit_and_loss.profit_paid)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Overall Return</Typography>
                    <Typography variant="h6" color="success.main">{formatPercentage(dashboardData.profit_and_loss.overall_return)}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Receivables Aging Tab */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Receivables Aging</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #e0e0e0' }}>
                    <Typography>0-3 days</Typography>
                    <Typography>{formatCurrency(dashboardData.receivables_aging['0-3_days'])}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #e0e0e0' }}>
                    <Typography>4-7 days</Typography>
                    <Typography>{formatCurrency(dashboardData.receivables_aging['4-7_days'])}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #e0e0e0' }}>
                    <Typography>8-14 days</Typography>
                    <Typography>{formatCurrency(dashboardData.receivables_aging['8-14_days'])}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #e0e0e0' }}>
                    <Typography>15-30 days</Typography>
                    <Typography>{formatCurrency(dashboardData.receivables_aging['15-30_days'])}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #e0e0e0' }}>
                    <Typography>Above 30 days</Typography>
                    <Typography color="error">{formatCurrency(dashboardData.receivables_aging['above_30_days'])}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: '#e3f2fd' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Total</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{formatCurrency(dashboardData.receivables_aging.total)}</Typography>
                  </Box>
                </Box>
              </Grid>
              </Grid>
              <Grid item xs={12} md={6}>
                {receivablesAgingData.length > 0 && (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={receivablesAgingData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => {
                          const pct = typeof percent === 'number' ? percent : 0;
                          return `${name}: ${(pct * 100).toFixed(0)}%`;
                        }}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {receivablesAgingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number | string) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Monthly Returns Tab */}
      <TabPanel value={tabValue} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Monthly Returns</Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyReturnsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${parseFloat(value.toString()).toFixed(2)}%`} />
                <Legend />
                <Line type="monotone" dataKey="return" stroke="#8884d8" name="Return (%)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Trade Summary Tab */}
      <TabPanel value={tabValue} index={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Trade Summary</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">{dashboardData.trade_summary.number_of_trades}</Typography>
                  <Typography variant="subtitle1" color="textSecondary">Number of Trades</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="h6" color="primary">{formatCurrency(dashboardData.trade_summary.value_of_trades)}</Typography>
                  <Typography variant="subtitle1" color="textSecondary">Value of Trades</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="h6" color="success.main">{formatCurrency(dashboardData.trade_summary.average_price_sold)}</Typography>
                  <Typography variant="subtitle1" color="textSecondary">Average Selling Price</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="h6" color="info.main">{formatCurrency(dashboardData.trade_summary.average_price_bought)}</Typography>
                  <Typography variant="subtitle1" color="textSecondary">Average Buying Price</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Withdrawal Form */}
      {showWithdrawalForm && (
        <WithdrawalForm
          callBack={fetchDashboardData}
          handleClose={() => setShowWithdrawalForm(false)}
          accountId={accountId}
        />
      )}
    </Box>
  );
};

export default InvestorDashboard;