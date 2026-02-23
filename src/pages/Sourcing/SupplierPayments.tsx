import { Box, Button, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { Key, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddIcon from "@mui/icons-material/Add";
import useTitle from "../../hooks/useTitle";
import { useModalContext } from "../../contexts/ModalDialogContext";
import { SourcingService } from "./Sourcing.service";
import { ISupplierPayment, ISupplierPaymentsResults } from "./Sourcing.interface";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import SearchInput from "../../components/SearchInput";
import CustomTable from "../../components/UI/CustomTable";
import { SupplierPaymentColumnShape } from "./AllColumnShapes";
import { SupplierPaymentForm } from "./SupplierPaymentForm";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import { PAYMENT_STATUS_OPTIONS } from "./SourcingConstants";

const SupplierPayments = () => {
  useTitle("Supplier Payments");
  const navigate = useNavigate();
  const { setShowModal } = useModalContext();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [payments, setPayments] = useState<ISupplierPaymentsResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchData(filters);
  }, [filters]);

  const fetchData = async (params?: any) => {
    try {
      setLoading(true);
      const resp: ISupplierPaymentsResults = await SourcingService.getSupplierPayments(params);
      setPayments(resp);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching Supplier Payments:", error);
      toast.error("Failed to fetch payments");
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

  const handleMarkCompleted = async (payment: ISupplierPayment) => {
    if (!window.confirm('Mark this payment as completed?')) return;
    
    try {
      await SourcingService.confirmSupplierPayment(payment.id);
      toast.success("Payment marked as completed");
      handleRefreshData();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to update payment");
    }
  };

  const tableActions: IDropdownAction[] = [
    {
      label: "View Details",
      icon: <VisibilityIcon color="primary" />,
      onClick: (payment: ISupplierPayment) => {
        // Navigate to details
      },
    },
    {
      label: "Mark as Completed",
      icon: <CheckCircleIcon color="success" />,
      onClick: handleMarkCompleted,
      condition: (payment: ISupplierPayment) => payment.status === 'pending' || payment.status === 'processing',
    },
  ];

  const handleStatusFilter = (event: any) => {
    const value = event.target.value;
    setFilters({ ...filters, status: value || undefined, page: 1 });
  };

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
            placeholder="Search payments..."
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
            {PAYMENT_STATUS_OPTIONS.map(opt => (
              <MenuItem key={opt.value as Key} value={opt.value as string}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          sx={{ marginLeft: "auto" }}
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
        >
          Record Payment
        </Button>
      </Box>

      <CustomTable
        columnShape={SupplierPaymentColumnShape(tableActions)}
        data={payments?.results || []}
        dataCount={payments?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(page: number) => setFilters({ ...filters, page: page + 1 })}
        pageIndex={filters?.page ? filters.page - 1 : 0}
        setPageSize={(size: number) => setFilters({ ...filters, page_size: size, page: 1 })}
        loading={loading}
      />

      <SupplierPaymentForm
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

export default SupplierPayments;