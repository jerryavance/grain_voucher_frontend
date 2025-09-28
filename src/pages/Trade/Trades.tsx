import { Box, Button, Tabs, Tab } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import AssessmentIcon from "@mui/icons-material/Assessment";
import useTitle from "../../hooks/useTitle";
import { useModalContext } from "../../contexts/ModalDialogContext";
import { TradeService } from "./Trade.service";
import { ITradesResults, IBrokeragesResults, ITrade, IBrokerage } from "./Trades.interface";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import SearchInput from "../../components/SearchInput";
import CustomTable from "../../components/UI/CustomTable";
import TradeColumnShape from "./TradeColumnShape";
import BrokerageColumnShape from "./BrokerageColumnShape";
import TradeForm from "./TradeForm";
import BrokerageForm from "./BrokerageForm";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import useAuth from "../../hooks/useAuth";

const Trades = () => {
  useTitle("Trades & Brokerages");
  const { setShowModal } = useModalContext();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"trades" | "brokerages">("trades");
  const [editTrade, setEditTrade] = useState<ITrade | null>(null);
  const [editBrokerage, setEditBrokerage] = useState<IBrokerage | null>(null);
  const [formType, setFormType] = useState<"Save" | "Update">("Save");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [trades, setTrades] = useState<ITradesResults>();
  const [brokerages, setBrokerages] = useState<IBrokeragesResults>();
  const [tradeFilters, setTradeFilters] = useState<any>(null);
  const [brokerageFilters, setBrokerageFilters] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, [tradeFilters, brokerageFilters, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === "trades") {
        const resp: ITradesResults = await TradeService.getTrades(tradeFilters);
        setTrades(resp);
      } else {
        const resp: IBrokeragesResults = await TradeService.getBrokerages(brokerageFilters);
        setBrokerages(resp);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Error fetching data");
    }
  };

  const handleRefreshData = async () => {
    try {
      setLoading(true);
      if (activeTab === "trades") {
        const results: ITradesResults = await TradeService.getTrades({ search: searchQuery });
        setTrades(results);
      } else {
        const results: IBrokeragesResults = await TradeService.getBrokerages({ search: searchQuery });
        setBrokerages(results);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Error refreshing data");
    }
  };

  const handleOpenTradeModal = () => {
    setFormType("Save");
    setEditTrade(null);
    setEditBrokerage(null);
    setShowModal(true);
  };

  const handleOpenBrokerageModal = () => {
    setFormType("Save");
    setEditBrokerage(null);
    setEditTrade(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditTrade(null);
    setEditBrokerage(null);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
  };

  const handleEditTrade = (trade: ITrade) => {
    setFormType("Update");
    setEditTrade(trade);
    setEditBrokerage(null);
    setShowModal(true);
  };

  const handleDeleteTrade = async (trade: ITrade) => {
    try {
      await TradeService.deleteTrade(trade.id);
      toast.success("Trade deleted successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error(error.message || "Error deleting trade");
    }
  };

  const handleApproveTrade = async (trade: ITrade) => {
    try {
      await TradeService.approveTrade(trade.id);
      toast.success("Trade approved successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error(error.message || "Error approving trade");
    }
  };

  const handleCompleteTrade = async (trade: ITrade) => {
    try {
      await TradeService.completeTrade(trade.id);
      toast.success("Trade completed successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error(error.message || "Error completing trade");
    }
  };

  const handleViewPnl = async (trade: ITrade) => {
    try {
      const { pnl } = await TradeService.getTradePnl(trade.id);
      toast.success(`Trade PNL: ${pnl}`);
    } catch (error: any) {
      toast.error(error.message || "Error fetching PNL");
    }
  };

  const handleEditBrokerage = (brokerage: IBrokerage) => {
    setFormType("Update");
    setEditBrokerage(brokerage);
    setEditTrade(null);
    setShowModal(true);
  };

  const handleDeleteBrokerage = async (brokerage: IBrokerage) => {
    try {
      await TradeService.deleteBrokerage(brokerage.id);
      toast.success("Brokerage deleted successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error(error.message || "Error deleting brokerage");
    }
  };

  const tradeTableActions: IDropdownAction[] = [
    {
      label: "Edit",
      icon: <EditIcon color="primary" />,
      onClick: (trade: ITrade) => handleEditTrade(trade),
    },
    {
      label: "Delete",
      icon: <DeleteIcon color="error" />,
      onClick: (trade: ITrade) => handleDeleteTrade(trade),
    },
    {
      label: "Approve",
      icon: <CheckCircleIcon color="success" />,
      onClick: (trade: ITrade) => handleApproveTrade(trade),
    },
    {
      label: "Complete",
      icon: <DoneAllIcon color="success" />,
      onClick: (trade: ITrade) => handleCompleteTrade(trade),
    },
    {
      label: "View PNL",
      icon: <AssessmentIcon color="info" />,
      onClick: (trade: ITrade) => handleViewPnl(trade),
    },
  ];

  const brokerageTableActions: IDropdownAction[] = [
    {
      label: "Edit",
      icon: <EditIcon color="primary" />,
      onClick: (brokerage: IBrokerage) => handleEditBrokerage(brokerage),
    },
    {
      label: "Delete",
      icon: <DeleteIcon color="error" />,
      onClick: (brokerage: IBrokerage) => handleDeleteBrokerage(brokerage),
    },
  ];

  return (
    <Box pt={2} pb={4}>
      <Box sx={styles.tablePreHeader}>
        <SearchInput
          value={searchQuery}
          onChange={handleInputChange}
          type="text"
          placeholder={`Search ${activeTab === "trades" ? "trades" : "brokerages"}...`}
        />
        <Button
          sx={{ marginLeft: "auto" }}
          variant="contained"
          onClick={activeTab === "trades" ? handleOpenTradeModal : handleOpenBrokerageModal}
        >
          Create {activeTab === "trades" ? "Trade" : "Brokerage"}
        </Button>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ mb: 2 }}
      >
        <Tab label="Trades" value="trades" />
        <Tab label="Brokerages" value="brokerages" />
      </Tabs>

      {activeTab === "trades" ? (
        <CustomTable
          columnShape={TradeColumnShape(tradeTableActions)}
          data={trades?.results || []}
          dataCount={trades?.count || 0}
          pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
          setPageIndex={(page: number) => setTradeFilters({ ...tradeFilters, page })}
          pageIndex={tradeFilters?.page || 1}
          setPageSize={(size: number) => setTradeFilters({ ...tradeFilters, page_size: size })}
          loading={loading}
        />
      ) : (
        <CustomTable
          columnShape={BrokerageColumnShape(brokerageTableActions)}
          data={brokerages?.results || []}
          dataCount={brokerages?.count || 0}
          pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
          setPageIndex={(page: number) => setBrokerageFilters({ ...brokerageFilters, page })}
          pageIndex={brokerageFilters?.page || 1}
          setPageSize={(size: number) => setBrokerageFilters({ ...brokerageFilters, page_size: size })}
          loading={loading}
        />
      )}

      {activeTab === "trades" ? (
        <TradeForm
          callBack={handleRefreshData}
          formType={formType}
          handleClose={handleCloseModal}
          initialValues={editTrade}
        />
      ) : (
        <BrokerageForm
          callBack={handleRefreshData}
          formType={formType}
          handleClose={handleCloseModal}
          initialValues={editBrokerage}
        />
      )}
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