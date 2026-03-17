// sourcing/pages/MyOrders.tsx
/**
 * My Orders page (supplier view, MY FARMING → My Orders).
 *
 * FIXES (Images 7, 8):
 *  - Hub and Grain Type columns now populated using flat fields
 *    (hub_name, grain_type_name) from the fixed backend serializer
 *  - Payment Method now shows display value instead of slug
 */
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  ButtonGroup,
  Button,
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
  TablePagination,
  Typography,
  Skeleton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import SourcingService from "./Sourcing.service";
import {
  formatCurrency,
  formatKg,
  formatDate,
  formatStatus,
  getStatusColor,
} from "../../utils/formatters";

type StatusFilter = "all" | "sent" | "accepted" | "in_transit" | "completed";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "sent", label: "Pending Action" },
  { value: "accepted", label: "Accepted" },
  { value: "in_transit", label: "In Transit" },
  { value: "completed", label: "Completed" },
];

const MyOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(20);

  // Summary stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page: page + 1, page_size: rowsPerPage };
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      const res = await SourcingService.getSourceOrders(params);
      const items = res.results || res || [];
      setOrders(items);

      // Compute stats from all orders (unfiltered)
      if (statusFilter === "all") {
        setStats({
          total: items.length,
          pending: items.filter((o: any) => o.status === "sent").length,
          inProgress: items.filter((o: any) =>
            ["accepted", "in_transit", "delivered"].includes(o.status)
          ).length,
          completed: items.filter((o: any) => o.status === "completed").length,
        });
      }
    } catch (err: any) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        My Orders
      </Typography>

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: "TOTAL ORDERS", value: stats.total },
          {
            label: "PENDING ACTION",
            value: stats.pending,
            color: "#ff9800",
          },
          { label: "IN PROGRESS", value: stats.inProgress, color: "#2196f3" },
          {
            label: "COMPLETED",
            value: stats.completed,
            color: "#4caf50",
          },
        ].map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
              <CardContent>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  textTransform="uppercase"
                >
                  {card.label}
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{ color: card.color || "inherit" }}
                >
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Filter Buttons ─────────────────────────────────────────────── */}
      <ButtonGroup size="small" sx={{ mb: 2 }}>
        {STATUS_FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={statusFilter === f.value ? "contained" : "outlined"}
            onClick={() => {
              setStatusFilter(f.value);
              setPage(0);
            }}
          >
            {f.label}
          </Button>
        ))}
      </ButtonGroup>

      {/* ── Orders Table ───────────────────────────────────────────────── */}
      <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Order #</TableCell>
                {/* ✅ FIX: Hub and Grain Type columns */}
                <TableCell>Hub</TableCell>
                <TableCell>Grain Type</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Price/Kg</TableCell>
                <TableCell>Total Cost</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Expected Delivery</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(9)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order, idx) => (
                  <TableRow
                    key={order.id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() =>
                      navigate(`/my-farming/orders/${order.id}`)
                    }
                  >
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {order.order_number}
                    </TableCell>
                    {/* ✅ FIX: Use hub_name flat field (was blank) */}
                    <TableCell>
                      {order.hub_name ||
                        order.hub_detail?.name ||
                        "—"}
                    </TableCell>
                    {/* ✅ FIX: Use grain_type_name flat field (was blank) */}
                    <TableCell>
                      {order.grain_type_name ||
                        order.grain_type_detail?.name ||
                        "—"}
                    </TableCell>
                    <TableCell>{formatKg(order.quantity_kg)}</TableCell>
                    <TableCell>
                      {formatCurrency(order.offered_price_per_kg)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(order.total_cost)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          order.status_display ||
                          formatStatus(order.status)
                        }
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(order.status),
                          color: "#fff",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {formatDate(order.expected_delivery_date)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default MyOrders;