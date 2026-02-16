// SupplierOrders.tsx - UPDATED VERSION

import { Box, Button, Chip, Card, CardContent, Typography, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import useTitle from "../../hooks/useTitle";
import { SourcingService } from "./Sourcing.service";
import { ISourceOrdersResults, ISourceOrderList } from "./Sourcing.interface";
import CustomTable from "../../components/UI/CustomTable";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import { ORDER_STATUS_COLORS, formatCurrency, formatWeight } from "./SourcingConstants";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";

const SupplierOrders = () => {
  useTitle("My Orders");
  const navigate = useNavigate();

  const [orders, setOrders] = useState<ISourceOrdersResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState<boolean>(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // ✅ FIXED: Backend automatically filters by authenticated supplier
      // No need to pass supplier=me - it causes UUID error
      const response = await SourcingService.getMySupplierOrders(filters);
      setOrders(response);

      // Calculate stats
      if (response.results) {
        setStats({
          total: response.count,
          pending: response.results.filter((o: { status: string; }) => o.status === 'sent').length,
          accepted: response.results.filter((o: { status: string; }) => o.status === 'accepted' || o.status === 'in_transit').length,
          completed: response.results.filter((o: { status: string; }) => o.status === 'completed').length,
        });
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order: ISourceOrderList) => {
    navigate(`/supplier/orders/${order.id}`);
  };

  const handleAcceptOrder = async (order: ISourceOrderList) => {
    if (order.status !== 'sent') {
      toast.error("Only orders with 'Sent' status can be accepted");
      return;
    }

    if (!window.confirm(`Accept order ${order.order_number}?`)) {
      return;
    }

    try {
      await SourcingService.acceptOrder(order.id);
      toast.success("Order accepted successfully");
      fetchOrders();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to accept order");
    }
  };

  const handleRejectOrder = async (order: ISourceOrderList) => {
    if (order.status !== 'sent') {
      toast.error("Only orders with 'Sent' status can be rejected");
      return;
    }

    const reason = window.prompt("Please provide a reason for rejecting this order:");
    if (!reason) return;

    try {
      await SourcingService.rejectOrder(order.id, reason);
      toast.success("Order rejected");
      fetchOrders();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to reject order");
    }
  };

  const tableActions: IDropdownAction[] = [
    {
      label: "View Details",
      icon: <VisibilityIcon color="primary" />,
      onClick: handleViewDetails,
    },
    {
      label: "Accept Order",
      icon: <CheckCircleIcon color="success" />,
      onClick: handleAcceptOrder,
      condition: (order: ISourceOrderList) => order.status === 'sent',
    },
    {
      label: "Reject Order",
      icon: <CancelIcon color="error" />,
      onClick: handleRejectOrder,
      condition: (order: ISourceOrderList) => order.status === 'sent',
    },
  ];

  const columns = [
    {
      Header: "Order #",
      accessor: "order_number",
      minWidth: 150,
      Cell: ({ row }: any) => (
        <Button
          color="primary"
          onClick={() => handleViewDetails(row.original)}
          sx={{ textTransform: "none" }}
        >
          {row.original.order_number}
        </Button>
      ),
    },
    {
      Header: "Hub",
      accessor: "hub_name",
      minWidth: 150,
    },
    {
      Header: "Grain Type",
      accessor: "grain_type_name",
      minWidth: 120,
    },
    {
      Header: "Quantity",
      accessor: "quantity_kg",
      minWidth: 120,
      Cell: ({ value }: any) => formatWeight(value),
    },
    {
      Header: "Price/Kg",
      accessor: "offered_price_per_kg",
      minWidth: 120,
      Cell: ({ value }: any) => formatCurrency(value),
    },
    {
      Header: "Total Cost",
      accessor: "total_cost",
      minWidth: 150,
      Cell: ({ value }: any) => formatCurrency(value),
    },
    {
      Header: "Status",
      accessor: "status",
      minWidth: 150,
      Cell: ({ row }: any) => (
        <Chip
          label={row.original.status_display}
          color={ORDER_STATUS_COLORS[row.original.status] || "default"}
          size="small"
        />
      ),
    },
    {
      Header: "Expected Delivery",
      accessor: "expected_delivery_date",
      minWidth: 150,
      Cell: ({ value }: any) => value ? formatDateToDDMMYYYY(value) : "—",
    },
    {
      Header: "Created",
      accessor: "created_at",
      minWidth: 120,
      Cell: ({ value }: any) => formatDateToDDMMYYYY(value),
    },
  ];

  return (
    <Box pt={2} pb={4}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        My Orders
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="overline">
                Total Orders
              </Typography>
              <Typography variant="h4">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="overline">
                Pending Action
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="overline">
                In Progress
              </Typography>
              <Typography variant="h4" color="info.main">
                {stats.accepted}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="overline">
                Completed
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.completed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <Button
          variant={!filters.status ? "contained" : "outlined"}
          size="small"
          onClick={() => setFilters({ ...filters, status: undefined, page: 1 })}
        >
          All
        </Button>
        <Button
          variant={filters.status === "sent" ? "contained" : "outlined"}
          size="small"
          onClick={() => setFilters({ ...filters, status: "sent", page: 1 })}
        >
          Pending Action
        </Button>
        <Button
          variant={filters.status === "accepted" ? "contained" : "outlined"}
          size="small"
          onClick={() => setFilters({ ...filters, status: "accepted", page: 1 })}
        >
          Accepted
        </Button>
        <Button
          variant={filters.status === "in_transit" ? "contained" : "outlined"}
          size="small"
          onClick={() => setFilters({ ...filters, status: "in_transit", page: 1 })}
        >
          In Transit
        </Button>
        <Button
          variant={filters.status === "completed" ? "contained" : "outlined"}
          size="small"
          onClick={() => setFilters({ ...filters, status: "completed", page: 1 })}
        >
          Completed
        </Button>
      </Box>

      <CustomTable
        columnShape={columns}
        data={orders?.results || []}
        dataCount={orders?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(page: number) => setFilters({ ...filters, page: page + 1 })}
        pageIndex={filters?.page ? filters.page - 1 : 0}
        setPageSize={(size: number) => setFilters({ ...filters, page_size: size, page: 1 })}
        loading={loading}
      />
    </Box>
  );
};

export default SupplierOrders;