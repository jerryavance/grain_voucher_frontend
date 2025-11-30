// src/pages/Trade/Trades.tsx - FIXED button conditions
import { Box, Button, Chip } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { useNavigate } from "react-router-dom";
import useTitle from "../../hooks/useTitle";
import { useModalContext } from "../../contexts/ModalDialogContext";
import { TradeService } from "./Trade.service";
import { ITradesResults, ITradeListItem } from "./Trade.interface";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import SearchInput from "../../components/SearchInput";
import CustomTable from "../../components/UI/CustomTable";
import TradeColumnShape from "./TradeColumnShape";
import TradeForm from "./TradeForm";
import TradeFilters from "./components/TradeFilters";
import { INITIAL_PAGE_SIZE } from "../../api/constants";

const Trades = () => {
  useTitle("Trades");
  const navigate = useNavigate();
  const { setShowModal } = useModalContext();

  const [editTrade, setEditTrade] = useState<ITradeListItem | null>(null);
  const [formType, setFormType] = useState<"Save" | "Update">("Save");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [trades, setTrades] = useState<ITradesResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    fetchData(filters);
  }, [filters]);

  const fetchData = async (params?: any) => {
    try {
      setLoading(true);
      const resp: ITradesResults = await TradeService.getTrades(params);
      setTrades(resp);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching Trades:", error);
      toast.error("Failed to fetch trades");
    }
  };

  const handleRefreshData = async () => {
    await fetchData(filters);
  };

  const handleOpenModal = () => {
    setFormType("Save");
    setEditTrade(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditTrade(null);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
    setFilters({ ...filters, search: value, page: 1 });
  };

  const handleViewTrade = (trade: ITradeListItem) => {
    navigate(`/admin/trade/${trade.id}`);
  };

  const handleEditTrade = (trade: ITradeListItem) => {
    setFormType("Update");
    setEditTrade(trade);
    setTimeout(() => {
      setShowModal(true);
    });
  };

  const handleDeleteTrade = async (trade: ITradeListItem) => {
    if (window.confirm(`Are you sure you want to delete trade ${trade.trade_number}?`)) {
      try {
        await TradeService.deleteTrade(trade.id);
        toast.success("Trade deleted successfully");
        handleRefreshData();
      } catch (error: any) {
        toast.error(error?.response?.data?.error || "Failed to delete trade");
      }
    }
  };

  const handleApproveTrade = async (trade: ITradeListItem) => {
    try {
      await TradeService.quickApprove(trade.id, { notes: "Approved from list view" });
      toast.success("Trade approved successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to approve trade");
    }
  };

  const handleRejectTrade = async (trade: ITradeListItem) => {
    const reason = window.prompt("Enter rejection reason:");
    if (!reason) return;
    
    try {
      await TradeService.quickReject(trade.id, { reason });
      toast.success("Trade rejected");
      handleRefreshData();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to reject trade");
    }
  };

  const tableActions: IDropdownAction[] = [
    {
      label: "View Details",
      icon: <VisibilityIcon color="primary" />,
      onClick: (trade: ITradeListItem) => handleViewTrade(trade),
    },
    {
      label: "Edit",
      icon: <EditIcon color="primary" />,
      onClick: (trade: ITradeListItem) => handleEditTrade(trade),
      condition: (trade: ITradeListItem) => trade.status === "draft",
    },
    {
      label: "Approve",
      icon: <CheckCircleIcon color="success" />,
      onClick: (trade: ITradeListItem) => handleApproveTrade(trade),
      condition: (trade: ITradeListItem) => trade.status === "pending_approval",
    },
    {
      label: "Reject",
      icon: <CancelIcon color="error" />,
      onClick: (trade: ITradeListItem) => handleRejectTrade(trade),
      condition: (trade: ITradeListItem) => 
        trade.status === "pending_approval" || trade.status === "draft",
    },
    // ✅ FIXED: Allocate Vouchers button
    {
      label: "Allocate Vouchers",
      icon: <AssignmentTurnedInIcon color="warning" />,
      onClick: (trade: ITradeListItem) => navigate(`/admin/trade/${trade.id}?tab=vouchers`),
      condition: (trade: ITradeListItem) =>
        trade.requires_voucher_allocation && !trade.allocation_complete,
    },
    // ✅ FIXED: Create Delivery button - proper conditions
    {
      label: "Create Delivery",
      icon: <LocalShippingIcon color="primary" />,
      onClick: (trade: ITradeListItem) => navigate(`/admin/trade/${trade.id}?tab=delivery`),
      condition: (trade: ITradeListItem) => {
        // Can create delivery if:
        // 1. Status is ready_for_delivery, in_transit, or delivered
        // 2. Not fully delivered yet (completion < 100%)
        const validStatuses = ['ready_for_delivery', 'in_transit', 'delivered'];
        const notFullyDelivered = (trade.delivery_completion_percentage || 0) < 100;
        
        return validStatuses.includes(trade.status) && notFullyDelivered;
      },
    },
    // ✅ FIXED: Mark Completed button
    {
      label: "Mark Completed",
      icon: <CheckCircleIcon color="success" />,
      onClick: async (trade: ITradeListItem) => {
        try {
          await TradeService.markCompleted(trade.id);
          toast.success("Trade marked as completed");
          handleRefreshData();
        } catch (error: any) {
          toast.error(error?.response?.data?.error || "Failed to complete trade");
        }
      },
      condition: (trade: ITradeListItem) => {
        // Can mark complete if:
        // 1. Status is delivered
        // 2. Fully delivered (100%)
        // 3. Payment status is "paid" (if available)
        const isDelivered = trade.status === 'delivered';
        const fullyDelivered = (trade.delivery_completion_percentage || 0) >= 100;
        const isPaid = trade.payment_status_display?.toLowerCase() === 'paid';
        
        return isDelivered && fullyDelivered;
      },
    },
    {
      label: "Delete",
      icon: <DeleteIcon color="error" />,
      onClick: (trade: ITradeListItem) => handleDeleteTrade(trade),
      condition: (trade: ITradeListItem) => 
        trade.status === "draft" || trade.status === "cancelled",
    },
  ];

  const handleApplyFilters = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, page_size: INITIAL_PAGE_SIZE });
    setSearchQuery("");
    setShowFilters(false);
  };

  return (
    <Box pt={2} pb={4}>
      <Box sx={styles.tablePreHeader}>
        <SearchInput
          value={searchQuery}
          onChange={handleInputChange}
          type="text"
          placeholder="Search trades by number, buyer, supplier..."
        />

        <Button
          variant="outlined"
          onClick={() => setShowFilters(!showFilters)}
          sx={{ ml: 1 }}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>

        <Button
          sx={{ marginLeft: "auto" }}
          variant="contained"
          onClick={handleOpenModal}
        >
          Create Trade
        </Button>
      </Box>

      {showFilters && (
        <TradeFilters
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          currentFilters={filters}
        />
      )}

      <CustomTable
        columnShape={TradeColumnShape(tableActions)}
        data={trades?.results || []}
        dataCount={trades?.count || 0}
        pageInitialState={{ pageSize: filters.page_size, pageIndex: filters.page - 1 }}
        setPageIndex={(page: number) => setFilters({ ...filters, page: page + 1 })}
        pageIndex={filters.page - 1}
        setPageSize={(size: number) => setFilters({ ...filters, page_size: size, page: 1 })}
        loading={loading}
      />

      <TradeForm
        callBack={handleRefreshData}
        formType={formType}
        handleClose={handleCloseModal}
        initialValues={editTrade}
      />
    </Box>
  );
};

const styles = {
  tablePreHeader: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    marginBottom: 2,
  },
};

export default Trades;