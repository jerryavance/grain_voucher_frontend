// src/pages/Reports/components/ReportDashboardTab.tsx
import { Box, Card, CardContent, Grid, Typography, Button, Chip } from "@mui/material";
import { useEffect, useState } from "react";
import { ReportsService } from "./Reports.service";
import { IDashboardStats } from "./Reports.interface";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const ReportDashboardTab = () => {
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await ReportsService.getDashboardStats();
      setStats(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching stats:", error);
    }
  };

  if (!stats) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Loading analytics...
        </Typography>
      </Box>
    );
  }

  // Prepare chart data
  const overviewData = [
    { name: 'Trades', value: stats.trades.count, amount: stats.trades.value },
    { name: 'Invoices', value: stats.invoices.count, amount: 0 },
    { name: 'Payments', value: stats.payments.count, amount: stats.payments.value },
    { name: 'Deposits', value: stats.deposits.count, amount: 0 },
  ];

  const financialData = [
    { name: 'Trade Value', value: stats.trades.value },
    { name: 'Payments', value: stats.payments.value },
  ];

  const invoiceStatusData = [
    { name: 'Paid', value: stats.invoices.count - stats.invoices.overdue_count },
    { name: 'Overdue', value: stats.invoices.overdue_count },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Business Analytics Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {stats.period.start_date} to {stats.period.end_date}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            startIcon={<RefreshIcon />}
            onClick={fetchStats}
            variant="outlined"
            size="small"
          >
            Refresh
          </Button>
          <Button 
            startIcon={<DownloadIcon />}
            variant="contained"
            size="small"
          >
            Export Dashboard
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={styles.kpiCard}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Trades
              </Typography>
              <Typography variant="h3" fontWeight={600} color="primary">
                {stats.trades.count}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  icon={<TrendingUpIcon />}
                  label={`UGX ${stats.trades.value.toLocaleString()}`}
                  color="success"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={styles.kpiCard}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Invoices
              </Typography>
              <Typography variant="h3" fontWeight={600} color="info.main">
                {stats.invoices.count}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  icon={<TrendingDownIcon />}
                  label={`${stats.invoices.overdue_count} Overdue`}
                  color="error"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={styles.kpiCard}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Payments
              </Typography>
              <Typography variant="h3" fontWeight={600} color="success.main">
                {stats.payments.count}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  icon={<TrendingUpIcon />}
                  label={`UGX ${stats.payments.value.toLocaleString()}`}
                  color="success"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={styles.kpiCard}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Active Vouchers
              </Typography>
              <Typography variant="h3" fontWeight={600} color="warning.main">
                {stats.vouchers.active_count}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label={`${stats.deposits.quantity_kg.toLocaleString()} kg`}
                  color="warning"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Transaction Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Transaction Overview
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={overviewData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Financial Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Financial Overview (UGX)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={financialData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    // label={(entry) => `${entry.name}: ${entry.value.toLocaleString()}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {financialData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => value.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Invoice Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Invoice Payment Status
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={invoiceStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {invoiceStatusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.name === 'Paid' ? '#00C49F' : '#FF8042'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Quick Report Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Button variant="outlined" fullWidth>
                  Generate Monthly Summary Report
                </Button>
                <Button variant="outlined" fullWidth>
                  Generate Financial Statement
                </Button>
                <Button variant="outlined" fullWidth>
                  Generate Inventory Report
                </Button>
                <Button variant="outlined" fullWidth>
                  Generate Performance Analytics
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                System Health & Insights
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={styles.insightBox}>
                    <Typography variant="body2" color="text.secondary">
                      Average Trade Value
                    </Typography>
                    <Typography variant="h5" fontWeight={600}>
                      UGX {stats.trades.count > 0 
                        ? Math.round(stats.trades.value / stats.trades.count).toLocaleString()
                        : 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={styles.insightBox}>
                    <Typography variant="body2" color="text.secondary">
                      Overdue Rate
                    </Typography>
                    <Typography variant="h5" fontWeight={600}>
                      {stats.invoices.count > 0 
                        ? Math.round((stats.invoices.overdue_count / stats.invoices.count) * 100)
                        : 0}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={styles.insightBox}>
                    <Typography variant="body2" color="text.secondary">
                      Avg Deposit Size
                    </Typography>
                    <Typography variant="h5" fontWeight={600}>
                      {stats.deposits.count > 0 
                        ? Math.round(stats.deposits.quantity_kg / stats.deposits.count).toLocaleString()
                        : 0} kg
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={styles.insightBox}>
                    <Typography variant="body2" color="text.secondary">
                      Payment Rate
                    </Typography>
                    <Typography variant="h5" fontWeight={600}>
                      {stats.invoices.count > 0 
                        ? Math.round(((stats.invoices.count - stats.invoices.overdue_count) / stats.invoices.count) * 100)
                        : 0}%
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

const styles = {
  kpiCard: {
    height: '100%',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: 6,
    },
  },
  insightBox: {
    p: 2,
    borderRadius: 2,
    bgcolor: 'background.default',
  },
};

export default ReportDashboardTab;