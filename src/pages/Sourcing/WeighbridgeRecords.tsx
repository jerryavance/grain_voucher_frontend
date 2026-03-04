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

// UPDATED: removed qualityGrades from FormDataState
interface FormDataState {
  sourceOrders: { value: string; label: string }[];
  deliveries: { value: string; label: string }[];
}

const WeighbridgeRecords = () => {
  useTitle("Weighbridge Records");
  const { setShowModal } = useModalContext();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [records, setRecords] = useState<IWeighbridgeRecordsResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState<boolean>(false);

  // UPDATED: no qualityGrades
  const [formData, setFormData] = useState<FormDataState>({
    sourceOrders: [],
    deliveries: [],
  });
  const [formDataLoading, setFormDataLoading] = useState<boolean>(true);

  useEffect(() => { fetchData(filters); }, [filters]);
  useEffect(() => { fetchFormData(); }, []);

  const fetchData = async (params?: any) => {
    try {
      setLoading(true);
      const resp: IWeighbridgeRecordsResults = await SourcingService.getWeighbridgeRecords(params);
      setRecords(resp);
    } catch (error) {
      console.error("Error fetching Weighbridge Records:", error);
      toast.error("Failed to fetch weighbridge records");
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: removed quality grades fetch
  const fetchFormData = async () => {
    try {
      setFormDataLoading(true);
      const ordersResponse = await SourcingService.getSourceOrders({ status: "delivered", page_size: 100 });
      setFormData(prev => ({
        ...prev,
        sourceOrders: (ordersResponse.results || []).map((order: any) => ({
          value: order.id,
          label: `${order.order_number} — ${order.supplier_name ?? order.supplier?.business_name ?? "Unknown"}`,
        })),
      }));
    } catch (error) {
      console.error("Error fetching form data:", error);
      toast.error("Failed to load form data");
    } finally {
      setFormDataLoading(false);
    }
  };

  const loadDeliveries = async (orderId: string) => {
    if (!orderId) return;
    try {
      const results = await SourcingService.getDeliveryRecords({ source_order: orderId, page_size: 100 });
      setFormData(prev => ({
        ...prev,
        deliveries: (results.results || []).map((delivery: any) => ({
          value: delivery.id,
          label: `Delivery on ${new Date(delivery.received_at).toLocaleDateString()} — ${delivery.driver_name} (${delivery.vehicle_number})`,
        })),
      }));
    } catch (error) {
      console.error("Error loading deliveries:", error);
      toast.error("Failed to load deliveries for selected order");
    }
  };

  const handleOrderSearch = useCallback(
    debounce(async (query: string) => {
      try {
        const results = await SourcingService.getSourceOrders({ search: query, status: "delivered", page_size: 100 });
        setFormData(prev => ({
          ...prev,
          sourceOrders: (results.results || []).map((order: any) => ({
            value: order.id,
            label: `${order.order_number} — ${order.supplier_name ?? order.supplier?.business_name ?? "Unknown"}`,
          })),
        }));
      } catch (error) {
        console.error("Error searching orders:", error);
      }
    }, 300), []
  );

  const handleRefreshData = async () => {
    await fetchData({ ...filters, search: searchQuery });
  };

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    // Reset deliveries when modal closes
    setFormData(prev => ({ ...prev, deliveries: [] }));
  };

  const tableActions: IDropdownAction[] = [
    {
      label: "View Details",
      icon: <VisibilityIcon color="primary" />,
      onClick: (_record: IWeighbridgeRecord) => {},
    },
  ];

  return (
    <Box pt={2} pb={4}>
      <Box sx={styles.header}>
        <Box sx={styles.searchContainer}>
          <SearchInput
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            onKeyPress={(event: React.KeyboardEvent) => {
              if (event.key === "Enter") setFilters({ ...filters, search: searchQuery, page: 1 });
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

      {/* UPDATED: no qualityGrades prop */}
      <WeighbridgeRecordForm
        callBack={handleRefreshData}
        handleClose={handleCloseModal}
        formData={formData}
        formDataLoading={formDataLoading}
        searchHandlers={{ handleOrderSearch }}
        onLoadDeliveries={loadDeliveries}
      />
    </Box>
  );
};

const styles = {
  header: { display: "flex", alignItems: "center", gap: 2, marginBottom: 2, flexWrap: "wrap" },
  searchContainer: { flexGrow: 1, minWidth: 250 },
};

export default WeighbridgeRecords;