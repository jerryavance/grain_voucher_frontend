// sourcing/pages/SupplierDashboard.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Skeleton,
} from "@mui/material";
import {
  LocalShipping,
  Receipt,
  CheckCircle,
  PendingActions,
  Inventory2,
  MonetizationOn,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { SourcingService } from "./Sourcing.service";
import { ISupplierDashboard } from "./Sourcing.interface";
import {
  formatCurrency,
  formatKg,
  formatDate,
  formatStatus,
  getStatusColor,
} from "../../utils/formatters";

const SupplierDashboard: React.FC = () => {
  const [data, setData] = useState<ISupplierDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      // FIX: getSupplierDashboard is correct in the new service
      const res = await SourcingService.getSupplierDashboard();
      setData(res);
    } catch (err: any) {
      toast.error("Failed to load dashboard");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box p={3}>
        <Skeleton variant="text" width={300} height={50} />
        <Grid container spacing={2} mt={1}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={100} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (!data) return null;

  const statCards = [
    {
      label: "TOTAL ORDERS",
      value: data.total_orders,
      icon: <LocalShipping sx={{ fontSize: 40, color: "#7c4dff" }} />,
    },
    {
      label: "PENDING ORDERS",
      value: data.pending_orders,
      icon: <PendingActions sx={{ fontSize: 40, color: "#ff9800" }} />,
    },
    {
      label: "COMPLETED ORDERS",
      value: data.completed_orders,
      icon: <CheckCircle sx={{ fontSize: 40, color: "#4caf50" }} />,
    },
    {
      label: "TOTAL SUPPLIED",
      value: formatKg(data.total_supplied_kg),
      icon: <Inventory2 sx={{ fontSize: 40, color: "#9c27b0" }} />,
    },
    {
      label: "TOTAL EARNED",
      value: formatCurrency(data.total_earned),
      icon: <MonetizationOn sx={{ fontSize: 40, color: "#4caf50" }} />,
    },
    {
      label: "PENDING PAYMENT",
      value: formatCurrency(data.pending_payment),
      icon: <Receipt sx={{ fontSize: 40, color: "#f44336" }} />,
    },
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Supplier Dashboard
      </Typography>

      <Grid container spacing={2} mb={4}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card.label}>
            <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
              <CardContent
                sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                    textTransform="uppercase"
                  >
                    {card.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {card.value}
                  </Typography>
                </Box>
                {card.icon}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Orders */}
        <Grid item xs={12} md={7}>
          <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  Recent Orders
                </Typography>
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate("/supplier/orders")}
                >
                  View All
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Order #</TableCell>
                      <TableCell>Grain Type</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.recent_orders?.length > 0 ? (
                      data.recent_orders.map((order: any) => (
                        <TableRow
                          key={order.id}
                          hover
                          sx={{ cursor: "pointer" }}
                          // onClick={() => navigate(`/my-farming/orders/${order.id}`)}
                          onClick={() => navigate(`/supplier/orders/${order.id}`)}
                        >
                          <TableCell>{order.order_number}</TableCell>
                          <TableCell>
                            {order.grain_type_name || order.grain_type_detail?.name || "—"}
                          </TableCell>
                          <TableCell>{formatKg(order.quantity_kg)}</TableCell>
                          <TableCell>{formatCurrency(order.total_cost)}</TableCell>
                          <TableCell>
                            <Chip
                              label={order.status_display || formatStatus(order.status)}
                              size="small"
                              sx={{
                                bgcolor: getStatusColor(order.status),
                                color: "#fff",
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell>{formatDate(order.created_at)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No orders yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Invoices */}
        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  Recent Invoices
                </Typography>
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{ cursor: "pointer" }}
                  // onClick={() => navigate("/my-farming/invoices")}
                  onClick={() => navigate("/supplier/invoices")}
                >
                  View All
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice #</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Balance</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.recent_invoices?.length > 0 ? (
                      data.recent_invoices.map((inv: any) => (
                        <TableRow
                          key={inv.id}
                          hover
                          sx={{ cursor: "pointer" }}
                          // onClick={() => navigate(`/my-farming/invoices/${inv.id}`)}
                          onClick={() => navigate(`/admin/sourcing/invoices/${inv.id}`)} 
                        >
                          <TableCell sx={{ fontSize: "0.8rem" }}>
                            {inv.invoice_number}
                          </TableCell>
                          <TableCell>{formatCurrency(inv.amount_due)}</TableCell>
                          <TableCell>{formatCurrency(inv.balance_due)}</TableCell>
                          <TableCell>
                            <Chip
                              label={inv.status_display || formatStatus(inv.status)}
                              size="small"
                              sx={{
                                bgcolor: getStatusColor(inv.status),
                                color: "#fff",
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No invoices yet
                        </TableCell>
                      </TableRow>
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