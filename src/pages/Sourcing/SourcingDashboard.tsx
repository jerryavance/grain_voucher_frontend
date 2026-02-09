import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { toast } from "react-hot-toast";
import PeopleIcon from "@mui/icons-material/People";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptIcon from "@mui/icons-material/Receipt";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import useTitle from "../../hooks/useTitle";
import { SourcingService } from "./Sourcing.service";
import { formatCurrency, formatWeight } from "./SourcingConstants";

interface IDashboardStats {
  total_suppliers: number;
  verified_suppliers: number;
  total_orders: number;
  pending_orders: number;
  in_transit_orders: number;
  completed_orders: number;
  total_invoices: number;
  pending_invoices: number;
  total_grain_sourced_kg: number;
  total_amount_spent: number;
  pending_payments: number;
}

const SourcingDashboard = () => {
  useTitle("Sourcing Dashboard");
  const navigate = useNavigate();

  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all necessary data
      const [suppliers, orders, invoices] = await Promise.all([
        SourcingService.getSuppliers({}),
        SourcingService.getSourceOrders({}),
        SourcingService.getSupplierInvoices({}),
      ]);

      // Calculate statistics
      const dashboardStats: IDashboardStats = {
        total_suppliers: suppliers.count,
        verified_suppliers: suppliers.results.filter((s: any) => s.is_verified).length,
        total_orders: orders.count,
        pending_orders: orders.results.filter((o: any) => ['open', 'accepted'].includes(o.status)).length,
        in_transit_orders: orders.results.filter((o: any) => o.status === 'in_transit').length,
        completed_orders: orders.results.filter((o: any) => o.status === 'completed').length,
        total_invoices: invoices.count,
        pending_invoices: invoices.results.filter((i: any) => ['pending', 'partial'].includes(i.status)).length,
        total_grain_sourced_kg: orders.results
          .filter((o: any) => o.status === 'completed')
          .reduce((sum: number, o: any) => sum + parseFloat(o.quantity_kg), 0),
        total_amount_spent: invoices.results
          .filter((i: any) => i.status === 'paid')
          .reduce((sum: number, i: any) => sum + parseFloat(i.amount_paid), 0),
        pending_payments: invoices.results
          .filter((i: any) => ['pending', 'partial'].includes(i.status))
          .reduce((sum: number, i: any) => sum + parseFloat(i.balance_due), 0),
      };

      setStats(dashboardStats);
    } catch (error: any) {
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Alert severity="error">
        Failed to load dashboard data. Please try again.
      </Alert>
    );
  }

  const statCards = [
    {
      title: "Total Suppliers",
      value: stats.total_suppliers,
      subtitle: `${stats.verified_suppliers} verified`,
      icon: <PeopleIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
      color: "primary.light",
      action: () => navigate("/admin/sourcing/suppliers"),
    },
    {
      title: "Total Orders",
      value: stats.total_orders,
      subtitle: `${stats.pending_orders} pending`,
      icon: <ShoppingCartIcon sx={{ fontSize: 50, color: 'info.main' }} />,
      color: "info.light",
      action: () => navigate("/admin/sourcing/orders"),
    },
    {
      title: "In Transit",
      value: stats.in_transit_orders,
      subtitle: "Active deliveries",
      icon: <LocalShippingIcon sx={{ fontSize: 50, color: 'warning.main' }} />,
      color: "warning.light",
      action: () => navigate("/admin/sourcing/orders?status=in_transit"),
    },
    {
      title: "Completed Orders",
      value: stats.completed_orders,
      subtitle: "Successfully delivered",
      icon: <CheckCircleIcon sx={{ fontSize: 50, color: 'success.main' }} />,
      color: "success.light",
      action: () => navigate("/admin/sourcing/orders?status=completed"),
    },
    {
      title: "Total Grain Sourced",
      value: formatWeight(stats.total_grain_sourced_kg),
      subtitle: "All time",
      icon: <LocalShippingIcon sx={{ fontSize: 50, color: 'success.main' }} />,
      color: "success.light",
      action: () => navigate("/admin/sourcing/orders?status=completed"),
    },
    {
      title: "Total Amount Spent",
      value: formatCurrency(stats.total_amount_spent),
      subtitle: "Paid invoices",
      icon: <MonetizationOnIcon sx={{ fontSize: 50, color: 'success.main' }} />,
      color: "success.light",
      action: () => navigate("/admin/sourcing/invoices?status=paid"),
    },
    {
      title: "Pending Invoices",
      value: stats.pending_invoices,
      subtitle: formatCurrency(stats.pending_payments),
      icon: <ReceiptIcon sx={{ fontSize: 50, color: 'error.main' }} />,
      color: "error.light",
      action: () => navigate("/admin/sourcing/invoices?status=pending"),
    },
    {
      title: "Total Invoices",
      value: stats.total_invoices,
      subtitle: "All time",
      icon: <ReceiptIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
      color: "primary.light",
      action: () => navigate("/admin/sourcing/invoices"),
    },
  ];

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Sourcing Dashboard</Typography>
        <Button variant="outlined" onClick={fetchDashboardStats}>
          Refresh
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                }
              }}
              onClick={stat.action}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography color="text.secondary" gutterBottom variant="overline">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.subtitle}
                    </Typography>
                  </Box>
                  <Box sx={{ bgcolor: stat.color, borderRadius: 2, p: 1.5 }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Quick Actions</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => navigate("/admin/sourcing/orders/new")}
                >
                  Create New Source Order
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => navigate("/admin/sourcing/suppliers/new")}
                >
                  Add New Supplier
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => navigate("/admin/sourcing/deliveries/new")}
                >
                  Record Delivery
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => navigate("/admin/sourcing/payments/new")}
                >
                  Record Payment
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Reports</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => navigate("/admin/sourcing/reports/suppliers")}
                >
                  Supplier Performance Report
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => navigate("/admin/sourcing/reports/orders")}
                >
                  Order Summary Report
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => navigate("/admin/sourcing/reports/payments")}
                >
                  Payment History Report
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => navigate("/admin/sourcing/reports/inventory")}
                >
                  Inventory Impact Report
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SourcingDashboard;