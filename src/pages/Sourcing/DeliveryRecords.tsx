import { Box, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
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
import { DeliveryRecordForm } from "./DeliveryRecordForm";
import { INITIAL_PAGE_SIZE } from "../../api/constants";

const DeliveryRecords = () => {
  useTitle("Delivery Records");
  const { setShowModal } = useModalContext();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [deliveries, setDeliveries] = useState<IDeliveryRecordsResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchData(filters);
  }, [filters]);

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

  const tableActions: IDropdownAction[] = [
    {
      label: "View Details",
      icon: <VisibilityIcon color="primary" />,
      onClick: (delivery: IDeliveryRecord) => {
        // Navigate to details or show modal
      },
    },
  ];

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

export default DeliveryRecords;