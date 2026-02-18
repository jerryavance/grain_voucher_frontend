import { Box, MenuItem, Select, FormControl, InputLabel, Typography } from "@mui/material";
import { Key, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import useTitle from "../../hooks/useTitle";
import { SourcingService } from "./Sourcing.service";
import { ISupplierInvoice, ISupplierInvoicesResults } from "./Sourcing.interface";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import SearchInput from "../../components/SearchInput";
import CustomTable from "../../components/UI/CustomTable";
import { SupplierInvoiceColumnShape } from "./AllColumnShapes";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import { INVOICE_STATUS_OPTIONS } from "./SourcingConstants";

const SupplierInvoicesView = () => {
  useTitle("My Invoices");
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [invoices, setInvoices] = useState<ISupplierInvoicesResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchData(filters);
  }, [filters]);

  // The backend's SupplierInvoiceViewSet.get_queryset() already scopes results
  // to the authenticated supplier's own invoices, so we use the standard list
  // endpoint — no separate my_invoices action is needed.
  const fetchData = async (params?: any) => {
    try {
      setLoading(true);
      const resp: ISupplierInvoicesResults = await SourcingService.getSupplierInvoices(params);
      setInvoices(resp);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to fetch your invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (invoice: ISupplierInvoice) => {
    navigate(`/supplier/invoices/${invoice.id}`);
  };

  const tableActions: IDropdownAction[] = [
    {
      label: "View Details",
      icon: <VisibilityIcon color="primary" />,
      onClick: handleViewDetails,
    },
  ];

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearch = () => {
    setFilters({ ...filters, search: searchQuery, page: 1 });
  };

  const handleStatusFilter = (event: any) => {
    const value = event.target.value;
    setFilters({ ...filters, status: value || undefined, page: 1 });
  };

  return (
    <Box pt={2} pb={4}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        My Invoices
      </Typography>

      <Box sx={styles.header}>
        <Box sx={styles.searchContainer}>
          <SearchInput
            value={searchQuery}
            onChange={handleInputChange}
            onKeyPress={(event: React.KeyboardEvent) => {
              if (event.key === "Enter") handleSearch();
            }}
            type="text"
            placeholder="Search by invoice or order number..."
          />
        </Box>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status || ""}
            label="Status"
            onChange={handleStatusFilter}
          >
            <MenuItem value="">All Statuses</MenuItem>
            {INVOICE_STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value as Key} value={opt.value as string}>
                {opt.label}
              </MenuItem>
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

export default SupplierInvoicesView;