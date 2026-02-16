// ============================================================
// WEIGHBRIDGE RECORDS COMPONENT - COMPLETE FIXED VERSION
// Loads form data in parent and passes to child form
// ============================================================

import { Box, Button } from "@mui/material";
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { debounce } from "lodash";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import useTitle from "../../hooks/useTitle";
import { useModalContext } from "../../contexts/ModalDialogContext";
import { SourcingService } from "./Sourcing.service";
import { IWeighbridgeRecord, IWeighbridgeRecordsResults } from "./Sourcing.interface";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import SearchInput from "../../components/SearchInput";
import CustomTable from "../../components/UI/CustomTable";
import { WeighbridgeRecordColumnShape } from "./AllColumnShapes";
import { WeighbridgeRecordForm } from "./SourcingForms";
import { INITIAL_PAGE_SIZE } from "../../api/constants";

// ============================================================
// INTERFACES
// ============================================================

interface DropdownOption {
  value: string;
  label: string;
}

interface FormData {
  sourceOrders: DropdownOption[];
  deliveries: DropdownOption[];
  qualityGrades: DropdownOption[];
}

// ============================================================
// MAIN COMPONENT
// ============================================================

const WeighbridgeRecords = () => {
  useTitle("Weighbridge Records");
  const { setShowModal } = useModalContext();

  // Table state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [records, setRecords] = useState<IWeighbridgeRecordsResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState<boolean>(false);

  // Form data state
  const [formData, setFormData] = useState<FormData>({
    sourceOrders: [],
    deliveries: [],
    qualityGrades: [],
  });
  const [formDataLoading, setFormDataLoading] = useState<boolean>(false);

  // ============================================================
  // EFFECTS
  // ============================================================

  useEffect(() => {
    fetchData(filters);
  }, [filters]);

  useEffect(() => {
    fetchFormData();
  }, []);

  // ============================================================
  // DATA FETCHING
  // ============================================================

  const fetchData = async (params?: any) => {
    try {
      setLoading(true);
      const resp: IWeighbridgeRecordsResults = await SourcingService.getWeighbridgeRecords(params);
      setRecords(resp);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching Weighbridge Records:", error);
      toast.error("Failed to fetch weighbridge records");
    }
  };

  const fetchFormData = async () => {
    try {
      setFormDataLoading(true);
      
      const [ordersResponse, gradesResponse] = await Promise.all([
        SourcingService.getSourceOrders({ status: 'delivered', page_size: 50 }),
        SourcingService.getQualityGrades(),
      ]);

      setFormData({
        sourceOrders: (ordersResponse.results || ordersResponse).map((order: any) => ({
          value: order.id,
          label: `${order.order_number} - ${order.supplier_name}`
        })),
        deliveries: [], // Will be loaded when order is selected
        qualityGrades: (gradesResponse.results || gradesResponse).map((grade: any) => ({
          value: grade.id,
          label: grade.name
        })),
      });
      
      setFormDataLoading(false);
    } catch (error) {
      console.error('Error fetching form data:', error);
      toast.error('Failed to load form data');
      setFormDataLoading(false);
    }
  };

  // ============================================================
  // SEARCH HANDLERS
  // ============================================================

  const handleOrderSearch = useCallback(
    debounce(async (query: string) => {
      try {
        const results = await SourcingService.getSourceOrders({ 
          search: query, 
          status: 'delivered',
          page_size: 50
        });
        setFormData(prev => ({
          ...prev,
          sourceOrders: (results.results || results).map((order: any) => ({
            value: order.id,
            label: `${order.order_number} - ${order.supplier_name}`
          }))
        }));
      } catch (error) {
        console.error('Error searching orders:', error);
      }
    }, 300),
    []
  );

  const loadDeliveries = async (orderId: string) => {
    try {
      const results = await SourcingService.getDeliveryRecords({ 
        source_order: orderId,
        page_size: 50
      });
      setFormData(prev => ({
        ...prev,
        deliveries: (results.results || results).map((delivery: any) => ({
          value: delivery.id,
          label: `Delivery at ${delivery.hub.name} - ${new Date(delivery.received_at).toLocaleDateString()}`
        }))
      }));
    } catch (error) {
      console.error('Error loading deliveries:', error);
    }
  };

  // ============================================================
  // EVENT HANDLERS
  // ============================================================

  const handleRefreshData = async () => {
    await fetchData({ ...filters, search: searchQuery });
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearch = () => {
    setFilters({ ...filters, search: searchQuery, page: 1 });
  };

  // ============================================================
  // TABLE ACTIONS
  // ============================================================

  const tableActions: IDropdownAction[] = [
    {
      label: "View Details",
      icon: <VisibilityIcon color="primary" />,
      onClick: (record: IWeighbridgeRecord) => {
        // Navigate to details or show modal
      },
    },
  ];

  // ============================================================
  // RENDER
  // ============================================================

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
            placeholder="Search weighbridge records..."
          />
        </Box>

        <Button
          sx={{ marginLeft: "auto" }}
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
        >
          Create Weighbridge Record
        </Button>
      </Box>

      <CustomTable
        columnShape={WeighbridgeRecordColumnShape(tableActions)}
        data={records?.results || []}
        dataCount={records?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(page: number) => setFilters({ ...filters, page: page + 1 })}
        pageIndex={filters?.page ? filters.page - 1 : 0}
        setPageSize={(size: number) => setFilters({ ...filters, page_size: size, page: 1 })}
        loading={loading}
      />

      <WeighbridgeRecordForm
        callBack={handleRefreshData}
        handleClose={handleCloseModal}
        formData={formData}
        formDataLoading={formDataLoading}
        searchHandlers={{
          handleOrderSearch,
        }}
        onLoadDeliveries={loadDeliveries}
      />
    </Box>
  );
};

// ============================================================
// STYLES
// ============================================================

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

export default WeighbridgeRecords;