import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { InvoiceService } from "./Invoices.service";
import { IInvoiceSummary, IAgingReport } from "./Invoices.interface";
import { toast } from "react-hot-toast";
import ProgressIndicator from "../../../components/UI/ProgressIndicator";

interface DashboardStats {
  summary: IInvoiceSummary | null;
  aging: IAgingReport | null;
}

const InvoiceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    summary: null,
    aging: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryData, agingData] = await Promise.all([
        InvoiceService.getSummary(),
        InvoiceService.getAging(),
      ]);
      setStats({ summary: summaryData, aging: agingData });
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <ProgressIndicator size={40} />
      </Box>
    );
  }

  const { summary, aging } = stats;

  const statCards = [
    {
      title: "Total Invoices",
      value: summary?.summary.total_invoices || 0,
      icon: <DescriptionIcon fontSize="large" />,
      color: "primary.main",
      onClick: () => navigate("/admin/accounting/invoices"),
    },
    {
      title: "Total Outstanding",
      value: `UGX ${(summary?.summary.total_due || 0).toFixed(2)}`,
      icon: <WarningIcon fontSize="large" />,
      color: "warning.main",
      onClick: () => navigate("/admin/accounting/invoices?status=overdue"),
    },
    {
      title: "Total Collected",
      value: `UGX ${(summary?.summary.total_paid || 0).toFixed(2)}`,
      icon: <CheckCircleIcon fontSize="large" />,
      color: "success.main",
      onClick: () => navigate("/admin/accounting/invoices?status=paid"),
    },
    {
      title: "Average Invoice",
      value: `UGX ${(summary?.summary.avg_invoice_value || 0).toFixed(2)}`,
      icon: <TrendingUpIcon fontSize="large" />,
      color: "info.main",
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Invoice Dashboard
      </Typography>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: "100%",
                cursor: card.onClick ? "pointer" : "default",
                transition: "transform 0.2s",
                "&:hover": card.onClick
                  ? {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    }
                  : {},
              }}
              onClick={card.onClick}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {card.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: card.color }}>{card.icon}</Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Status Breakdown */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  By Status
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {summary.by_status.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      py: 1,
                      borderBottom: index < summary.by_status.length - 1 ? "1px solid #eee" : "none",
                    }}
                  >
                    <Typography variant="body2">{item.status}</Typography>
                    <Stack direction="row" spacing={2}>
                      <Typography variant="body2" fontWeight="medium">
                        {item.count} invoices
                      </Typography>
                      <Typography variant="body2" color="primary">
                        UGX {item.total.toFixed(2)}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  By Payment Status
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {summary.by_payment_status.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      py: 1,
                      borderBottom:
                        index < summary.by_payment_status.length - 1 ? "1px solid #eee" : "none",
                    }}
                  >
                    <Typography variant="body2">{item.payment_status}</Typography>
                    <Stack direction="row" spacing={2}>
                      <Typography variant="body2" fontWeight="medium">
                        {item.count} invoices
                      </Typography>
                      <Typography variant="body2" color="primary">
                        UGX {item.total.toFixed(2)}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Aging Summary */}
      {aging && (
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">Aging Summary</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AssessmentIcon />}
                onClick={() => navigate("/admin/accounting/invoices/aging")}
              >
                View Full Report
              </Button>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2.4}>
                <Box sx={{ textAlign: "center", p: 2, bgcolor: "success.light", borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Current
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    UGX {aging.current.toFixed(0)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Box sx={{ textAlign: "center", p: 2, bgcolor: "warning.light", borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    1-30 Days
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    UGX {aging.days_1_30.toFixed(0)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Box sx={{ textAlign: "center", p: 2, bgcolor: "orange", borderRadius: 1 }}>
                  <Typography variant="caption" color="white">
                    31-60 Days
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="white">
                    UGX {aging.days_31_60.toFixed(0)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Box sx={{ textAlign: "center", p: 2, bgcolor: "error.light", borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    61-90 Days
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    UGX {aging.days_61_90.toFixed(0)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Box sx={{ textAlign: "center", p: 2, bgcolor: "error.main", borderRadius: 1 }}>
                  <Typography variant="caption" color="white">
                    90+ Days
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="white">
                    UGX {aging.over_90_days.toFixed(0)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default InvoiceDashboard;