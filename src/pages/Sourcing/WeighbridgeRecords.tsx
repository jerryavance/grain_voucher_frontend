import { Box, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
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
import { WeighbridgeRecordForm } from "./WeighbridgeRecordForm";
import { INITIAL_PAGE_SIZE } from "../../api/constants";

const WeighbridgeRecords = () => {
  useTitle("Weighbridge Records");
  const { setShowModal } = useModalContext();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [records, setRecords] = useState<IWeighbridgeRecordsResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchData(filters);
  }, [filters]);

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
      onClick: (record: IWeighbridgeRecord) => {
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

export default WeighbridgeRecords;