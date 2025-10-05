// TradeDashboard.tsx
import React, { FC, useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import { TradeService } from "./Trade.service";
import { IDashboardStats } from "./Trade.interface";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import { toast } from "react-hot-toast";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
  }).format(amount);
};

const TradeDashboard: FC = () => {
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<{ start_date?: string; end_date?: string }>({});

  useEffect(() => {
    fetchDashboardStats();
  }, [dateRange]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const data = await TradeService.getDashboardStats(dateRange);
      setStats(data);
    } catch (error: any) {
      toast.error("Failed to fetch dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <ProgressIndicator />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>No data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Trade Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Trades
              </Typography>
              <Typography variant="h4">{stats.summary.total_trades}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h5" color="primary">
                {formatCurrency(stats.summary.total_revenue || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Profit
              </Typography>
              <Typography variant="h5" color="success.main">
                {formatCurrency(stats.summary.total_profit || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Average ROI
              </Typography>
              <Typography variant="h4">
                {Number(stats.summary.avg_roi || 0).toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.light' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Pending Approval
              </Typography>
              <Typography variant="h4">
                {stats.summary.pending_approval_count}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.light' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Approved
              </Typography>
              <Typography variant="h4">{stats.summary.approved_count}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.light' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                In Transit
              </Typography>
              <Typography variant="h4">
                {stats.summary.in_transit_count}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.light' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h4">{stats.summary.completed_count}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Status Breakdown
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Total Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.status_breakdown.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Chip label={item.status} size="small" />
                      </TableCell>
                      <TableCell align="right">{item.count}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(item.total_value || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Trades
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Trade Number</TableCell>
                    <TableCell>Buyer</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.recent_trades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell>{trade.trade_number}</TableCell>
                      <TableCell>
                        {trade.buyer_name || trade.buyer?.name}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(trade.total_revenue)}
                      </TableCell>
                      <TableCell>
                        {formatDateToDDMMYYYY(trade.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TradeDashboard;