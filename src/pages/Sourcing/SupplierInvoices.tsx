import { Box, Button, Chip, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { Key, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PaymentIcon from "@mui/icons-material/Payment";
import useTitle from "../../hooks/useTitle";
import { useModalContext } from "../../contexts/ModalDialogContext";
import { SourcingService } from "./Sourcing.service";
import { ISupplierInvoice, ISupplierInvoicesResults } from "./Sourcing.interface";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import SearchInput from "../../components/SearchInput";
import CustomTable from "../../components/UI/CustomTable";
import { SupplierInvoiceColumnShape } from "./AllColumnShapes";
import { SupplierPaymentForm } from "./SupplierPaymentForm";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import { INVOICE_STATUS_OPTIONS } from "./SourcingConstants";

const SupplierInvoices = () => {
  useTitle("Supplier Invoices");
  const navigate = useNavigate();
  const { setShowModal } = useModalContext();

  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [invoices, setInvoices] = useState<ISupplierInvoicesResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchData(filters);
  }, [filters]);

  const fetchData = async (params?: any) => {
    try {
      setLoading(true);
      const resp: ISupplierInvoicesResults = await SourcingService.getSupplierInvoices(params);
      setInvoices(resp);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching Supplier Invoices:", error);
      toast.error("Failed to fetch invoices");
    }
  };

  const handleRefreshData = async () => {
    await fetchData({ ...filters, search: searchQuery });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearch = () => {
    setFilters({ ...filters, search: searchQuery, page: 1 });
  };

  const handleViewDetails = (invoice: ISupplierInvoice) => {
    navigate(`/admin/sourcing/invoices/${invoice.id}`);
  };

  const handleMakePayment = (invoice: ISupplierInvoice) => {
    setSelectedInvoice(invoice.id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedInvoice(null);
  };

  const tableActions: IDropdownAction[] = [
    {
      label: "View Details",
      icon: <VisibilityIcon color="primary" />,
      onClick: handleViewDetails,
    },
    {
      label: "Make Payment",
      icon: <PaymentIcon color="success" />,
      onClick: handleMakePayment,
      condition: (invoice: ISupplierInvoice) => ['pending', 'partial'].includes(invoice.status),
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
            placeholder="Search invoices..."
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
            {INVOICE_STATUS_OPTIONS.map(opt => (
              <MenuItem key={opt.value as Key} value={opt.value as string}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <CustomTable
        columnShape={SupplierInvoiceColumnShape(tableActions)}
        data={invoices?.results || []}
        dataCount={invoices?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(page: number) => setFilters({ ...filters, page: page + 1 })}
        pageIndex={filters?.page ? filters.page - 1 : 0}
        setPageSize={(size: number) => setFilters({ ...filters, page_size: size, page: 1 })}
        loading={loading}
      />

      {selectedInvoice && (
        <SupplierPaymentForm
          invoiceId={selectedInvoice}
          callBack={handleRefreshData}
          handleClose={handleCloseModal}
        />
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
    flexWrap: "wrap",
  },
  searchContainer: {
    flexGrow: 1,
    minWidth: 250,
  },
};

export default SupplierInvoices;