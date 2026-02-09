import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-hot-toast";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import useTitle from "../../hooks/useTitle";
import { SourcingService } from "./Sourcing.service";       
import { ISupplierDashboard } from "./Sourcing.interface";
import { formatCurrency, formatWeight, ORDER_STATUS_COLORS, INVOICE_STATUS_COLORS } from "./SourcingConstants";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";

const SupplierDashboard = () => {
  useTitle("Supplier Dashboard");
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState<ISupplierDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await SourcingService.getSupplierDashboard();
      setDashboard(data);
    } catch (error: any) {
      toast.error("Failed to load dashboard data");
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

  if (!dashboard) {
    return (
      <Alert severity="error">
        Failed to load dashboard data. Please try again.
      </Alert>
    );
  }

  const statCards = [
    {
      title: "Total Orders",
      value: dashboard.total_orders,
      icon: <LocalShippingIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: "primary.light",
    },
    {
      title: "Pending Orders",
      value: dashboard.pending_orders,
      icon: <ReceiptIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: "warning.light",
    },
    {
      title: "Completed Orders",
      value: dashboard.completed_orders,
      icon: <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: "success.light",
    },
    {
      title: "Total Supplied",
      value: formatWeight(dashboard.total_supplied_kg),
      icon: <LocalShippingIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      color: "info.light",
    },
    {
      title: "Total Earned",
      value: formatCurrency(dashboard.total_earned),
      icon: <MonetizationOnIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: "success.light",
    },
    {
      title: "Pending Payment",
      value: formatCurrency(dashboard.pending_payment),
      icon: <MonetizationOnIcon sx={{ fontSize: 40, color: 'error.main' }} />,
      color: "error.light",
    },
  ];

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Supplier Dashboard</Typography>
        {dashboard.unread_notifications > 0 && (
          <Chip
            icon={<NotificationsIcon />}
            label={`${dashboard.unread_notifications} unread notifications`}
            color="warning"
            onClick={() => navigate("/supplier/notifications")}
          />
        )}
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="overline">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4">{stat.value}</Typography>
                  </Box>
                  <Box sx={{ bgcolor: stat.color, borderRadius: 1, p: 1 }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Orders */}
        <Grid item xs={12} lg={7}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Recent Orders</Typography>
                <Button size="small" onClick={() => navigate("/supplier/orders")}>
                  View All
                </Button>
              </Box>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Order #</TableCell>
                      <TableCell>Grain Type</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboard.recent_orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography color="text.secondary">No orders yet</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      dashboard.recent_orders.map((order) => (
                        <TableRow 
                          key={order.id}
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/supplier/orders/${order.id}`)}
                        >
                          <TableCell>{order.order_number}</TableCell>
                          <TableCell>{order.grain_type_name}</TableCell>
                          <TableCell align="right">{formatWeight(order.quantity_kg)}</TableCell>
                          <TableCell align="right">{formatCurrency(order.total_cost)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={order.status_display} 
                              size="small" 
                              color={ORDER_STATUS_COLORS[order.status]} 
                            />
                          </TableCell>
                          <TableCell>{formatDateToDDMMYYYY(order.created_at)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Invoices */}
        <Grid item xs={12} lg={5}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Recent Invoices</Typography>
                <Button size="small" onClick={() => navigate("/supplier/invoices")}>
                  View All
                </Button>
              </Box>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice #</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Balance</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboard.recent_invoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography color="text.secondary">No invoices yet</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      dashboard.recent_invoices.map((invoice) => (
                        <TableRow 
                          key={invoice.id}
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/supplier/invoices/${invoice.id}`)}
                        >
                          <TableCell>{invoice.invoice_number}</TableCell>
                          <TableCell align="right">{formatCurrency(invoice.amount_due)}</TableCell>
                          <TableCell align="right">{formatCurrency(invoice.balance_due)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={invoice.status_display} 
                              size="small" 
                              color={INVOICE_STATUS_COLORS[invoice.status]} 
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SupplierDashboard;