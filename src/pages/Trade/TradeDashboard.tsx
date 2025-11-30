// src/pages/Trade/TradeDashboard.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  useTheme,
  alpha,
  LinearProgress,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  PendingActions as PendingIcon,
  CheckCircle as CheckIcon,
  LocalShipping as ShippingIcon,
  DoneAll as CompletedIcon,
  Scale as ScaleIcon,
} from "@mui/icons-material";
import { TradeService } from "./Trade.service";
import useTitle from "../../hooks/useTitle";
import ProgressIndicator from "../../components/UI/ProgressIndicator";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: number; // optional trend indicator
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle, trend }) => {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        background: `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, ${alpha(color, 0.01)} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        borderRadius: 3,
        overflow: "hidden",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 24px ${alpha(color, 0.15)}`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h3" fontWeight={800} sx={{ color, mb: 0.5 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {trend !== undefined && (
              <Chip
                size="small"
                label={`${trend > 0 ? "+" : ""}${trend}%`}
                color={trend > 0 ? "success" : "error"}
                sx={{ mt: 1, height: 24, fontWeight: 600 }}
              />
            )}
          </Box>
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: alpha(color, 0.12),
              color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {React.cloneElement(icon as React.ReactElement, { fontSize: "large" })}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const TradeDashboard = () => {
  useTitle("Trade Dashboard");
  const theme = useTheme();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<string>("30");

  useEffect(() => {
    fetchDashboardStats();
  }, [dateRange]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const data = await TradeService.getDashboardStats({
        start_date: startDate.toISOString().split("T")[0],
      });
      setStats(data);
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-UG").format(value || 0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <ProgressIndicator />
      </Box>
    );
  }

  const totalQuantityKg = stats?.summary?.total_quantity_kg || 0;
  const totalQuantityMT = (totalQuantityKg / 1000).toFixed(1);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        gap={2}
        mb={5}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} color="text.primary">
            Trade Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Overview of your trading performance
          </Typography>
        </Box>

        <FormControl sx={{ minWidth: { xs: "100%", sm: 220 } }}>
          <InputLabel id="date-range-label">Date Range</InputLabel>
          <Select
            labelId="date-range-label"
            value={dateRange}
            label="Date Range"
            onChange={(e) => setDateRange(e.target.value)}
            size="medium"
          >
            <MenuItem value="7">Last 7 Days</MenuItem>
            <MenuItem value="30">Last 30 Days</MenuItem>
            <MenuItem value="90">Last 90 Days</MenuItem>
            <MenuItem value="365">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Primary KPIs */}
      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Trades"
            value={formatNumber(stats?.summary?.total_trades)}
            icon={<InventoryIcon />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats?.summary?.total_revenue)}
            icon={<MoneyIcon />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Profit"
            value={formatCurrency(stats?.summary?.total_profit)}
            icon={<TrendingUpIcon />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Average ROI"
            value={`${(stats?.summary?.avg_roi || 0).toFixed(1)}%`}
            icon={<AssessmentIcon />}
            color={theme.palette.warning.main}
            trend={12.5} // example trend (you can compute real one)
          />
        </Grid>
      </Grid>

      {/* Status Overview */}
      <Typography variant="h5" fontWeight={700} mb={3}>
        Trade Status Overview
      </Typography>
      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Pending Approval"
            value={formatNumber(stats?.summary?.pending_approval)}
            subtitle="Awaiting review"
            icon={<PendingIcon />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Ready for Delivery"
            value={formatNumber(stats?.summary?.ready_for_delivery)}
            subtitle="Approved & packed"
            icon={<CheckIcon />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="In Transit"
            value={formatNumber(stats?.summary?.in_transit)}
            subtitle="On the way"
            icon={<ShippingIcon />}
            color={theme.palette.info.main}
          />
        </Grid>
      </Grid>

      {/* Status Distribution + Quantity & Completed */}
      <Grid container spacing={4}>
        {/* Status Distribution */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ borderRadius: 3, height: "100%" }} elevation={2}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Status Distribution by Value
              </Typography>
              <Grid container spacing={2} mt={1}>
                {stats?.status_breakdown?.map((item: any, index: number) => {
                  const colors = [
                    theme.palette.primary.main,
                    theme.palette.success.main,
                    theme.palette.warning.main,
                    theme.palette.info.main,
                    theme.palette.error.main,
                  ];
                  const color = colors[index % colors.length];

                  return (
                    <Grid item xs={12} sm={6} key={item.status}>
                      <Box
                        sx={{
                          p: 2.5,
                          borderRadius: 2,
                          backgroundColor: alpha(color, 0.08),
                          border: `1px solid ${alpha(color, 0.2)}`,
                          transition: "0.2s",
                          "&:hover": { backgroundColor: alpha(color, 0.15) },
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          {item.status.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </Typography>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
                          <Typography variant="h5" fontWeight={700}>
                            {item.count}
                          </Typography>
                          <Typography variant="body1" fontWeight={600} color={color}>
                            {formatCurrency(item.total_value)}
                          </Typography>
                        </Stack>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Quantity + Completed */}
        <Grid item xs={12} lg={5}>
          <Stack spacing={4} height="100%">
            {/* Total Quantity */}
            <Card sx={{ borderRadius: 3, flex: 1 }} elevation={2}>
              <CardContent sx={{ p: 4, height: "100%", display: "flex", flexDirection: "column" }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <ScaleIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                  <Typography variant="h6" fontWeight={700}>
                    Total Quantity Traded
                  </Typography>
                </Box>
                <Typography variant="h2" fontWeight={800} color="primary" lineHeight={1}>
                  {formatNumber(totalQuantityKg)} <small style={{ fontSize: "1rem" }}>kg</small>
                </Typography>
                <Typography variant="h4" color="text.secondary" fontWeight={600}>
                  {totalQuantityMT} Metric Tons
                </Typography>
              </CardContent>
            </Card>

            {/* Completed Trades */}
            <Card sx={{ borderRadius: 3, flex: 1 }} elevation={2}>
              <CardContent sx={{ p: 4, height: "100%", display: "flex", flexDirection: "column" }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <CompletedIcon sx={{ fontSize: 32, color: theme.palette.success.main }} />
                  <Typography variant="h6" fontWeight={700}>
                    Completed Trades
                  </Typography>
                </Box>
                <Typography variant="h2" fontWeight={800} color="success.main" lineHeight={1}>
                  {formatNumber(stats?.summary?.completed)}
                </Typography>
                <Typography variant="body1" color="text.secondary" mt={1}>
                  Successfully closed & delivered
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TradeDashboard;