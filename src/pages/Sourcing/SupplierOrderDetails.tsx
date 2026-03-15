import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableRow,
  CircularProgress,
  Paper,
} from "@mui/material";
import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineOppositeContent, TimelineSeparator } from "@mui/lab";
import { toast } from "react-hot-toast";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import useTitle from "../../hooks/useTitle";
import { SourcingService } from "./Sourcing.service";
import { ISourceOrder } from "./Sourcing.interface";
import { ORDER_STATUS_COLORS, formatCurrency, formatWeight } from "./SourcingConstants";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";

const SupplierOrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useTitle("Order Details");

  const [order, setOrder] = useState<ISourceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await SourcingService.getSourceOrderDetails(id);
      setOrder(response);
    } catch (error: any) {
      toast.error("Failed to load order details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async () => {
    if (!order || !id) return;

    if (order.status !== "sent") {
      toast.error("Only orders with 'Sent' status can be accepted");
      return;
    }

    if (!window.confirm(`Accept order ${order.order_number}?`)) {
      return;
    }

    try {
      setActionLoading(true);
      await SourcingService.acceptOrder(id);
      toast.success("Order accepted successfully");
      fetchOrderDetails();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to accept order");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectOrder = async () => {
    if (!order || !id) return;

    if (order.status !== "sent") {
      toast.error("Only orders with 'Sent' status can be rejected");
      return;
    }

    const reason = window.prompt("Please provide a reason for rejecting this order:");
    if (!reason) return;

    try {
      setActionLoading(true);
      await SourcingService.rejectOrder(id, reason);
      toast.success("Order rejected");
      navigate("/supplier/orders");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to reject order");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box pt={2}>
        <Alert severity="error">Order not found</Alert>
      </Box>
    );
  }

  const canAcceptReject = order.status === "sent";

  return (
    <Box pt={2} pb={4}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/supplier/orders")} sx={{ mb: 1 }}>
            Back to Orders
          </Button>
          <Typography variant="h4">{order.order_number}</Typography>
        </Box>
        <Chip
          label={order.status_display}
          color={ORDER_STATUS_COLORS[order.status] || "default"}
        
        />
      </Box>

      {/* Action Buttons */}
      {canAcceptReject && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            This order is awaiting your response. Please review and accept or reject.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={handleAcceptOrder}
              disabled={actionLoading}
            >
              Accept Order
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={handleRejectOrder}
              disabled={actionLoading}
            >
              Reject Order
            </Button>
          </Box>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Order Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: "bold", width: "200px" }}>
                      Order Number
                    </TableCell>
                    <TableCell>{order.order_number}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: "bold" }}>
                      Hub
                    </TableCell>
                    <TableCell>{order.hub?.name || "—"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: "bold" }}>
                      Grain Type
                    </TableCell>
                    <TableCell>{order.grain_type?.name || "—"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: "bold" }}>
                      Quantity
                    </TableCell>
                    <TableCell>{formatWeight(order.quantity_kg)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: "bold" }}>
                      Price per Kg
                    </TableCell>
                    <TableCell>{formatCurrency(order.offered_price_per_kg)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: "bold" }}>
                      Grain Cost
                    </TableCell>
                    <TableCell>{formatCurrency(order.grain_cost)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: "bold" }}>
                      Total Cost
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6" color="primary">
                        {formatCurrency(order.total_cost)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: "bold" }}>
                      Expected Delivery
                    </TableCell>
                    <TableCell>
                      {order.expected_delivery_date ? formatDateToDDMMYYYY(order.expected_delivery_date) : "—"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: "bold" }}>
                      Payment Method
                    </TableCell>
                    <TableCell>{order.payment_method?.method_display || "—"}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {order.notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Notes:
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body2">{order.notes}</Typography>
                  </Paper>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Logistics Info */}
          {(order.logistics_type || order.driver_name) && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <LocalShippingIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Logistics Information</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Table size="small">
                  <TableBody>
                    {order.logistics_type && (
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: "bold", width: "200px" }}>
                          Logistics Type
                        </TableCell>
                        <TableCell>{order.logistics_type_display}</TableCell>
                      </TableRow>
                    )}
                    {order.driver_name && (
                      <>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: "bold" }}>
                            Driver Name
                          </TableCell>
                          <TableCell>{order.driver_name}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: "bold" }}>
                            Driver Phone
                          </TableCell>
                          <TableCell>{order.driver_phone}</TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Timeline */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Timeline
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Timeline>
                <TimelineItem>
                  <TimelineOppositeContent color="text.primary" sx={{ flex: 0.3 }}>
                    {formatDateToDDMMYYYY(order.created_at)}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color="primary" />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography>Order Created</Typography>
                  </TimelineContent>
                </TimelineItem>

                {order.sent_at && (
                  <TimelineItem>
                    <TimelineOppositeContent color="text.primary" sx={{ flex: 0.3 }}>
                      {formatDateToDDMMYYYY(order.sent_at)}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color="info" />
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography>Sent to Supplier</Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}

                {order.accepted_at && (
                  <TimelineItem>
                    <TimelineOppositeContent color="text.primary" sx={{ flex: 0.3 }}>
                      {formatDateToDDMMYYYY(order.accepted_at)}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color="success" />
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography>Accepted</Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}

                {order.shipped_at && (
                  <TimelineItem>
                    <TimelineOppositeContent color="text.primary" sx={{ flex: 0.3 }}>
                      {formatDateToDDMMYYYY(order.shipped_at)}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color="warning" />
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography>In Transit</Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}

                {order.delivered_at && (
                  <TimelineItem>
                    <TimelineOppositeContent color="text.primary" sx={{ flex: 0.3 }}>
                      {formatDateToDDMMYYYY(order.delivered_at)}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color="success" />
                      {order.completed_at && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography>Delivered</Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}

                {order.completed_at && (
                  <TimelineItem>
                    <TimelineOppositeContent color="text.primary" sx={{ flex: 0.3 }}>
                      {formatDateToDDMMYYYY(order.completed_at)}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color="success" />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography fontWeight="bold">Completed</Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}
              </Timeline>
            </CardContent>
          </Card>

          {/* Status Cards */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <ReceiptIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Status Indicators</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Chip
                  label={order.has_delivery ? "Delivery Recorded" : "No Delivery Record"}
                  color={order.has_delivery ? "success" : "default"}
                  size="small"
                  icon={order.has_delivery ? <CheckCircleIcon /> : undefined}
                />
                <Chip
                  label={order.has_weighbridge ? "Weighbridge Done" : "Weighbridge Pending"}
                  color={order.has_weighbridge ? "success" : "default"}
                  size="small"
                  icon={order.has_weighbridge ? <CheckCircleIcon /> : undefined}
                />
                <Chip
                  label={order.has_invoice ? "Invoice Issued" : "Invoice Pending"}
                  color={order.has_invoice ? "success" : "default"}
                  size="small"
                  icon={order.has_invoice ? <CheckCircleIcon /> : undefined}
                />
                <Chip
                  label={order.has_investor_allocation ? "Investor Funded" : "No Funding"}
                  color={order.has_investor_allocation ? "info" : "default"}
                  size="small"
                  icon={order.has_investor_allocation ? <AccountBalanceIcon /> : undefined}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SupplierOrderDetails;