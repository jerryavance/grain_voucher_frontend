import React, { FC, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Skeleton,
} from "@mui/material";
import {
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
} from "@mui/icons-material";
import { VoucherService } from "./Voucher.service";

interface IStatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

const StatCard: FC<IStatCard> = ({ title, value, icon, color, loading }) => {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: `${color}.50`,
              color: `${color}.main`,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" color="textSecondary">
            {title}
          </Typography>
        </Box>
        {loading ? (
          <Skeleton variant="text" width="60%" height={40} />
        ) : (
          <Typography variant="h4" fontWeight={600}>
            {value}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

interface IVoucherStatsProps {
  refreshTrigger?: number;
}

const VoucherStats: FC<IVoucherStatsProps> = ({ refreshTrigger = 0 }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVouchers: 0,
    pendingVerification: 0,
    pendingRedemptions: 0,
    totalValue: 0,
  });

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [vouchersResp, pendingVouchers, pendingRedemptions] =
        await Promise.all([
          VoucherService.getMyVouchers({}),
          VoucherService.getPendingVerification({}),
          VoucherService.getRedemptions({ status: "pending" }),
        ]);

      // Calculate total value
      const totalValue = vouchersResp.results?.reduce(
        (sum: number, voucher: any) =>
          sum + parseFloat(voucher.current_value || 0),
        0
      );

      setStats({
        totalVouchers: vouchersResp.count || 0,
        pendingVerification: pendingVouchers.count || 0,
        pendingRedemptions: pendingRedemptions.count || 0,
        totalValue: totalValue || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Total Vouchers"
            value={stats.totalVouchers.toLocaleString()}
            icon={<ReceiptIcon />}
            color="primary"
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Pending Verification"
            value={stats.pendingVerification.toLocaleString()}
            icon={<PendingIcon />}
            color="warning"
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Pending Redemptions"
            value={stats.pendingRedemptions.toLocaleString()}
            icon={<PaymentIcon />}
            color="error"
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Total Value"
            value={`UGX ${stats.totalValue.toLocaleString()}`}
            icon={<CheckCircleIcon />}
            color="success"
            loading={loading}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default VoucherStats;