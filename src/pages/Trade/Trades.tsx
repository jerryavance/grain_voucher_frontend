// Trades.tsx
import { Box, Button, Tabs, Tab } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AssignmentIcon from "@mui/icons-material/Assignment";
import useTitle from "../../hooks/useTitle";
import { useModalContext } from "../../contexts/ModalDialogContext";
import { TradeService } from "./Trade.service";
import { ITradesResults, ITrade } from "./Trade.interface";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import SearchInput from "../../components/SearchInput";
import CustomTable from "../../components/UI/CustomTable";
import TradeColumnShape from "./TradeColumnShape";
import TradeForm from "./TradeForm";
import TradeDetails from "./TradeDetails";
import { INITIAL_PAGE_SIZE } from "../../api/constants";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`trade-tabpanel-${index}`}
      aria-labelledby={`trade-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const Trades = () => {
  useTitle("Trades");
  const { setShowModal } = useModalContext();

  const [editTrade, setEditTrade] = useState<ITrade | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<ITrade | null>(null);
  const [formType, setFormType] = useState<"Save" | "Update">("Save");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [trades, setTrades] = useState<ITradesResults>();
  const [filters, setFilters] = useState<any>({ page: 1 });
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);

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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSelectedTrade(null);
    
    // Apply status filter based on tab
    const statusFilters: Record<number, any> = {
      0: {}, // All trades
      1: { status: 'draft,pending_approval' },
      2: { status: 'approved,pending_allocation,allocated' },
      3: { status: 'in_transit,delivered' },
      4: { status: 'completed' },
      5: { status: 'cancelled,rejected' },
    };
    
    setFilters({ ...filters, ...statusFilters[newValue], page: 1 });
  };

  const handleDeleteTrade = async (trade: ITrade) => {
    if (!window.confirm(`Are you sure you want to delete trade ${trade.trade_number}?`)) {
      return;
    }

    try {
      await TradeService.deleteTrade(trade.id);
      toast.success("Trade deleted successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to delete trade");
    }
  };

  const handleEditTrade = (trade: ITrade) => {
    setFormType("Update");
    setEditTrade(trade);
    setTimeout(() => {
      setShowModal(true);
    });
  };

  const handleViewTrade = (trade: ITrade) => {
    setSelectedTrade(trade);
  };

  const handleApprove = async (trade: ITrade) => {
    try {
      await TradeService.approveTrade(trade.id, { action: 'approve' });
      toast.success("Trade approved successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to approve trade");
    }
  };

  const handleReject = async (trade: ITrade) => {
    const reason = window.prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      await TradeService.rejectTrade(trade.id, { action: 'reject', notes: reason });
      toast.success("Trade rejected");
      handleRefreshData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to reject trade");
    }
  };

  const handleAllocateVouchers = async (trade: ITrade) => {
    if (!window.confirm(`Allocate vouchers for trade ${trade.trade_number}?`)) {
      return;
    }

    try {
      await TradeService.allocateVouchers(trade.id, { auto_allocate: true });
      toast.success("Vouchers allocated successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to allocate vouchers");
    }
  };

  const handleUpdateStatus = async (trade: ITrade, newStatus: string) => {
    try {
      await TradeService.updateTradeStatus(trade.id, { status: newStatus });
      toast.success(`Trade status updated to ${newStatus}`);
      handleRefreshData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update status");
    }
  };

  const tableActions: IDropdownAction[] = [
    {
      label: "View Details",
      icon: <AssignmentIcon color="primary" />,
      onClick: (trade: ITrade) => handleViewTrade(trade),
    },
    {
      label: "Edit",
      icon: <EditIcon color="primary" />,
      onClick: (trade: ITrade) => handleEditTrade(trade),
      condition: (trade: ITrade) => ['draft', 'pending_approval'].includes(trade.status),
    },
    {
      label: "Approve",
      icon: <CheckCircleIcon color="success" />,
      onClick: (trade: ITrade) => handleApprove(trade),
      condition: (trade: ITrade) => trade.status === 'pending_approval',
    },
    {
      label: "Reject",
      icon: <CancelIcon color="error" />,
      onClick: (trade: ITrade) => handleReject(trade),
      condition: (trade: ITrade) => ['pending_approval', 'pending_allocation'].includes(trade.status),
    },
    {
      label: "Allocate Vouchers",
      icon: <AssignmentIcon color="info" />,
      onClick: (trade: ITrade) => handleAllocateVouchers(trade),
      condition: (trade: ITrade) => 
        ['approved', 'pending_allocation'].includes(trade.status) && !trade.allocation_complete,
    },
    {
      label: "Mark In Transit",
      icon: <LocalShippingIcon color="info" />,
      onClick: (trade: ITrade) => handleUpdateStatus(trade, 'in_transit'),
      condition: (trade: ITrade) => trade.status === 'allocated',
    },
    {
      label: "Mark Delivered",
      icon: <CheckCircleIcon color="success" />,
      onClick: (trade: ITrade) => handleUpdateStatus(trade, 'delivered'),
      condition: (trade: ITrade) => trade.status === 'in_transit',
    },
    {
      label: "Delete",
      icon: <DeleteIcon color="error" />,
      onClick: (trade: ITrade) => handleDeleteTrade(trade),
      condition: (trade: ITrade) => ['draft'].includes(trade.status),
    },
  ];

  return (
    <Box pt={2} pb={4}>
      {selectedTrade ? (
        <TradeDetails
          trade={selectedTrade}
          onClose={() => setSelectedTrade(null)}
          onRefresh={handleRefreshData}
        />
      ) : (
        <>
          <Box sx={styles.header}>
            <SearchInput
              value={searchQuery}
              onChange={handleInputChange}
              type="text"
              placeholder="Search trades..."
            />

            <Button
              sx={{ marginLeft: "auto" }}
              variant="contained"
              onClick={handleOpenModal}
            >
              Create Trade
            </Button>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="trade tabs">
              <Tab label="All Trades" />
              <Tab label="Pending" />
              <Tab label="Active" />
              <Tab label="In Transit" />
              <Tab label="Completed" />
              <Tab label="Cancelled" />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={activeTab}>
            <CustomTable
              columnShape={TradeColumnShape(tableActions, handleViewTrade)}
              data={trades?.results || []}
              dataCount={trades?.count || 0}
              pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
              setPageIndex={(page: number) => setFilters({ ...filters, page })}
              pageIndex={filters?.page || 1}
              setPageSize={(size: number) => setFilters({ ...filters, page_size: size })}
              loading={loading}
            />
          </TabPanel>

          <TradeForm
            callBack={handleRefreshData}
            formType={formType}
            handleClose={handleCloseModal}
            initialValues={editTrade}
          />
        </>
      )}
    </Box>
  );
};

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    marginBottom: 2,
  },
};

export default Trades;