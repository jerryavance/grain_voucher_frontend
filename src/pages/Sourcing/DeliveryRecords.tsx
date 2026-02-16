// ============================================================
// DELIVERY RECORDS COMPONENT - COMPLETE FIXED VERSION
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
import { IDeliveryRecord, IDeliveryRecordsResults } from "./Sourcing.interface";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import SearchInput from "../../components/SearchInput";
import CustomTable from "../../components/UI/CustomTable";
import { DeliveryRecordColumnShape } from "./AllColumnShapes";
import { DeliveryRecordForm } from "./SourcingForms";
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
  hubs: DropdownOption[];
}

// ============================================================
// MAIN COMPONENT
// ============================================================

const DeliveryRecords = () => {
  useTitle("Delivery Records");
  const { setShowModal } = useModalContext();

  // Table state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [deliveries, setDeliveries] = useState<IDeliveryRecordsResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState<boolean>(false);

  // Form data state
  const [formData, setFormData] = useState<FormData>({
    sourceOrders: [],
    hubs: [],
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
      const resp: IDeliveryRecordsResults = await SourcingService.getDeliveryRecords(params);
      setDeliveries(resp);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching Delivery Records:", error);
      toast.error("Failed to fetch delivery records");
    }
  };

  const fetchFormData = async () => {
    try {
      setFormDataLoading(true);
      
      const [ordersResponse, hubsResponse] = await Promise.all([
        SourcingService.getSourceOrders({ status: 'in_transit', page_size: 50 }),
        SourcingService.getHubs(),
      ]);

      setFormData({
        sourceOrders: (ordersResponse.results || ordersResponse).map((order: any) => ({
          value: order.id,
          label: `${order.order_number} - ${order.supplier_name}`
        })),
        hubs: (hubsResponse.results || hubsResponse).map((hub: any) => ({
          value: hub.id,
          label: hub.name
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
          status: 'in_transit',
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
      onClick: (record: IDeliveryRecord) => {
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
            type="text"
            placeholder="Search delivery records..."
            onKeyPress={(event) => {
              if (event.key === "Enter") {
                handleSearch();
              }
            }}
          />
        </Box>

        <Button
          sx={{ marginLeft: "auto" }}
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
        >
          Record Delivery
        </Button>
      </Box>

      <CustomTable
        columnShape={DeliveryRecordColumnShape(tableActions)}
        data={deliveries?.results || []}
        dataCount={deliveries?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(page: number) => setFilters({ ...filters, page: page + 1 })}
        pageIndex={filters?.page ? filters.page - 1 : 0}
        setPageSize={(size: number) => setFilters({ ...filters, page_size: size, page: 1 })}
        loading={loading}
      />

      <DeliveryRecordForm
        callBack={handleRefreshData}
        handleClose={handleCloseModal}
        formData={formData}
        formDataLoading={formDataLoading}
        searchHandlers={{
          handleOrderSearch,
        }}
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

export default DeliveryRecords;