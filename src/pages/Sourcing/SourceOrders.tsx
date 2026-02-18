import { Box, Button, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { Key, useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { debounce } from "lodash";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import VisibilityIcon from "@mui/icons-material/Visibility";
import useTitle from "../../hooks/useTitle";
import { useModalContext } from "../../contexts/ModalDialogContext";
import { SourcingService } from "./Sourcing.service";
import { ISourceOrderList, ISourceOrdersResults } from "./Sourcing.interface";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import SearchInput from "../../components/SearchInput";
import CustomTable from "../../components/UI/CustomTable";
import SourceOrderColumnShape from "./SourceOrderColumnShape";
import SourceOrderForm from "./SourceOrderForm";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import { ORDER_STATUS_OPTIONS } from "./SourcingConstants";

// ✅ ADD THIS INTERFACE
interface FormDataState {
  suppliers: { value: string; label: string }[];
  hubs: { value: string; label: string }[];
  grainTypes: { value: string; label: string }[];
  paymentMethods: { value: string; label: string }[];
}

const SourceOrders = () => {
  useTitle("Source Orders");
  const navigate = useNavigate();
  const { setShowModal } = useModalContext();

  const [editOrder, setEditOrder] = useState<any>(null);
  const [formType, setFormType] = useState<"Save" | "Update">("Save");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [orders, setOrders] = useState<ISourceOrdersResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState<boolean>(false);

  // ✅ FIX: Type the state properly
  const [formData, setFormData] = useState<FormDataState>({
    suppliers: [],
    hubs: [],
    grainTypes: [],
    paymentMethods: [],
  });
  const [formDataLoading, setFormDataLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchData(filters);
  }, [filters]);

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchData = async (params?: any) => {
    try {
      setLoading(true);
      const resp: ISourceOrdersResults = await SourcingService.getSourceOrders(params);
      setOrders(resp);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching Source Orders:", error);
      toast.error("Failed to fetch orders");
    }
  };

  const fetchFormData = async () => {
    try {
      setFormDataLoading(true);
      
      const [suppliersResponse, hubsResponse, grainTypesResponse] = await Promise.all([
        SourcingService.getSuppliers({ is_verified: true, page_size: 50 }),
        SourcingService.getHubs(),
        SourcingService.getGrainTypes(),
      ]);

      setFormData({
        suppliers: (suppliersResponse.results || suppliersResponse).map((supplier: any) => ({
          value: supplier.id,
          label: supplier.user?.phone_number
            ? `${supplier.business_name} (${supplier.user.phone_number})`
            : supplier.business_name,
        })),
        hubs: (hubsResponse.results || hubsResponse).map((hub: any) => ({
          value: hub.id,
          label: hub.name
        })),
        grainTypes: (grainTypesResponse.results || grainTypesResponse).map((grain: any) => ({
          value: grain.id,
          label: grain.name
        })),
        paymentMethods: [],
      });
      
      setFormDataLoading(false);
    } catch (error) {
      console.error('Error fetching form data:', error);
      toast.error('Failed to load form data');
      setFormDataLoading(false);
    }
  };

  const handleSupplierSearch = useCallback(
    debounce(async (query: string) => {
      try {
        const results = await SourcingService.getSuppliers({ 
          search: query, 
          is_verified: true, 
          page_size: 50 
        });
        setFormData(prev => ({
          ...prev,
          suppliers: (results.results || results).map((supplier: any) => ({
            value: supplier.id,
            label: supplier.user?.phone_number
              ? `${supplier.business_name} (${supplier.user.phone_number})`
              : supplier.business_name,
          }))
        }));
      } catch (error) {
        console.error('Error searching suppliers:', error);
      }
    }, 300),
    []
  );

  const handleHubSearch = useCallback(
    debounce(async (query: string) => {
      try {
        const results = await SourcingService.getHubs(query);
        setFormData(prev => ({
          ...prev,
          hubs: (results.results || results).map((hub: any) => ({
            value: hub.id,
            label: hub.name
          }))
        }));
      } catch (error) {
        console.error('Error searching hubs:', error);
      }
    }, 300),
    []
  );

  const handleGrainTypeSearch = useCallback(
    debounce(async (query: string) => {
      try {
        const results = await SourcingService.getGrainTypes(query);
        setFormData(prev => ({
          ...prev,
          grainTypes: (results.results || results).map((grain: any) => ({
            value: grain.id,
            label: grain.name
          }))
        }));
      } catch (error) {
        console.error('Error searching grain types:', error);
      }
    }, 300),
    []
  );

  const loadPaymentMethods = async (supplierId: string) => {
    if (!supplierId) return;
    
    try {
      const results = await SourcingService.getPaymentPreferences({ 
        supplier: supplierId, 
        is_active: true,
        page_size: 50
      });
      setFormData(prev => ({
        ...prev,
        paymentMethods: (results.results || results).map((pm: any) => ({
          value: pm.id,
          label: `${pm.method_display}${pm.is_default ? ' (Default)' : ''}`
        }))
      }));
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const handleRefreshData = async () => {
    await fetchData({ ...filters, search: searchQuery });
  };

  const handleOpenModal = () => {
    setFormType("Save");
    setEditOrder(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditOrder(null);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearch = () => {
    setFilters({ ...filters, search: searchQuery, page: 1 });
  };

  const handleEditOrder = async (order: ISourceOrderList) => {
    try {
      const fullOrder = await SourcingService.getSourceOrderDetails(order.id);
      
      if (fullOrder.supplier?.id) {
        await loadPaymentMethods(fullOrder.supplier.id);
      }
      
      setFormType("Update");
      setEditOrder(fullOrder);
      setTimeout(() => setShowModal(true), 100);
    } catch (error: any) {
      toast.error("Failed to load order details");
    }
  };

  const handleDeleteOrder = async (order: ISourceOrderList) => {
    if (!window.confirm(`Delete order ${order.order_number}?`)) return;
    
    try {
      await SourcingService.deleteSourceOrder(order.id);
      toast.success("Order deleted successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to delete order");
    }
  };

  const handleSendToSupplier = async (order: ISourceOrderList) => {
    try {
      await SourcingService.sendToSupplier(order.id);
      toast.success("Order sent to supplier");
      handleRefreshData();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to send order");
    }
  };

  const handleAcceptOrder = async (order: ISourceOrderList) => {
    try {
      await SourcingService.acceptOrder(order.id);
      toast.success("Order accepted");
      handleRefreshData();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to accept order");
    }
  };

  const handleRejectOrder = async (order: ISourceOrderList) => {
    const reason = prompt("Reason for rejection (optional):") || "";
    try {
      await SourcingService.rejectOrder(order.id, reason);
      toast.success("Order rejected");
      handleRefreshData();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to reject order");
    }
  };

  const handleMarkInTransit = async (order: ISourceOrderList) => {
    try {
      await SourcingService.markInTransit(order.id);
      toast.success("Order marked as in transit");
      handleRefreshData();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to update order");
    }
  };

  const handleCancelOrder = async (order: ISourceOrderList) => {
    const reason = prompt("Reason for cancellation:");
    if (!reason) return;
    
    try {
      await SourcingService.cancelOrder(order.id, reason);
      toast.success("Order cancelled");
      handleRefreshData();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to cancel order");
    }
  };

  const handleViewDetails = (order: ISourceOrderList) => {
    navigate(`/admin/sourcing/orders/${order.id}`);
  };

  const handleStatusFilter = (event: any) => {
    const value = event.target.value;
    setFilters({ ...filters, status: value || undefined, page: 1 });
  };

  const tableActions: IDropdownAction[] = [
    {
      label: "View Details",
      icon: <VisibilityIcon color="primary" />,
      onClick: handleViewDetails,
    },
    {
      label: "Edit",
      icon: <EditIcon color="primary" />,
      onClick: handleEditOrder,
      condition: (order: ISourceOrderList) => ['draft', 'open'].includes(order.status),
    },
    {
      label: "Send to Supplier",
      icon: <SendIcon color="info" />,
      onClick: handleSendToSupplier,
      condition: (order: ISourceOrderList) => order.status === 'draft',
    },
    {
      label: "Accept Order",
      icon: <CheckIcon color="success" />,
      onClick: handleAcceptOrder,
      condition: (order: ISourceOrderList) => order.status === 'sent',
    },
    {
      label: "Reject Order",
      icon: <CloseIcon color="error" />,
      onClick: handleRejectOrder,
      condition: (order: ISourceOrderList) => order.status === 'sent',
    },
    {
      label: "Mark In Transit",
      icon: <LocalShippingIcon color="warning" />,
      onClick: handleMarkInTransit,
      condition: (order: ISourceOrderList) => order.status === 'accepted',
    },
    {
      label: "Cancel Order",
      icon: <DeleteIcon color="error" />,
      onClick: handleCancelOrder,
      condition: (order: ISourceOrderList) => !['completed', 'cancelled', 'rejected'].includes(order.status),
    },
    {
      label: "Delete",
      icon: <DeleteIcon color="error" />,
      onClick: handleDeleteOrder,
      condition: (order: ISourceOrderList) => order.status === 'draft',
    },
  ];

  return (
    <Box pt={2} pb={4}>
      <Box sx={styles.header}>
        <Box sx={styles.searchContainer}>
          <SearchInput
            value={searchQuery}
            onChange={handleInputChange}
            onKeyPress={(event) => {
              if (event.key === "Enter") {
                handleSearch();
              }
            }}
            type="text"
            placeholder="Search orders..."
          />
        </Box>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={filters.status || ''}
            label="Status Filter"
            onChange={handleStatusFilter}
          >
            <MenuItem value="">All Statuses</MenuItem>
            {ORDER_STATUS_OPTIONS.map(opt => (
              <MenuItem key={opt.value as Key} value={opt.value as string}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          sx={{ marginLeft: "auto" }}
          variant="contained"
          onClick={handleOpenModal}
        >
          Create Order
        </Button>
      </Box>

      <CustomTable
        columnShape={SourceOrderColumnShape(tableActions)}
        data={orders?.results || []}
        dataCount={orders?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(page: number) => setFilters({ ...filters, page: page + 1 })}
        pageIndex={filters?.page ? filters.page - 1 : 0}
        setPageSize={(size: number) => setFilters({ ...filters, page_size: size, page: 1 })}
        loading={loading}
      />

      <SourceOrderForm
        callBack={handleRefreshData}
        formType={formType}
        handleClose={handleCloseModal}
        initialValues={editOrder}
        formData={formData}
        formDataLoading={formDataLoading}
        searchHandlers={{
          handleSupplierSearch,
          handleHubSearch,
          handleGrainTypeSearch,
        }}
        onLoadPaymentMethods={loadPaymentMethods}
      />
    </Box>
  );
};

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    marginBottom: 2,
    flexWrap: "wrap",
  },
  searchContainer: {
    flexGrow: 1,
    minWidth: 250,
  },
};

export default SourceOrders;