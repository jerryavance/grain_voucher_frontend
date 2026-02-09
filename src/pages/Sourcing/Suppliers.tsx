import { Box, Button, Chip } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VerifiedIcon from "@mui/icons-material/Verified";
import { useNavigate } from "react-router-dom";
import useTitle from "../../hooks/useTitle";
import { useModalContext } from "../../contexts/ModalDialogContext";
import { SourcingService } from "./Sourcing.service";
import { ISupplierProfile, ISuppliersResults } from "./Sourcing.interface";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import SearchInput from "../../components/SearchInput";
import CustomTable from "../../components/UI/CustomTable";
import SupplierColumnShape from "./SupplierColumnShape";
import SupplierForm from "./SupplierForm";
import { INITIAL_PAGE_SIZE } from "../../api/constants";

const Suppliers = () => {
  useTitle("Suppliers");
  const navigate = useNavigate();
  const { setShowModal } = useModalContext();

  const [editSupplier, setEditSupplier] = useState<ISupplierProfile | null>(null);
  const [formType, setFormType] = useState<"Save" | "Update">("Save");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [suppliers, setSuppliers] = useState<ISuppliersResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchData(filters);
  }, [filters]);

  const fetchData = async (params?: any) => {
    try {
      setLoading(true);
      const resp: ISuppliersResults = await SourcingService.getSuppliers(params);
      setSuppliers(resp);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching Suppliers:", error);
      toast.error("Failed to fetch suppliers");
    }
  };

  const handleRefreshData = async () => {
    await fetchData({ ...filters, search: searchQuery });
  };

  const handleOpenModal = () => {
    setFormType("Save");
    setEditSupplier(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditSupplier(null);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
  };

  const handleSearch = () => {
    setFilters({ ...filters, search: searchQuery, page: 1 });
  };

  const handleDeleteSupplier = async (supplier: ISupplierProfile) => {
    if (!window.confirm(`Are you sure you want to delete ${supplier.business_name}?`)) {
      return;
    }
    
    try {
      await SourcingService.deleteSupplier(supplier.id);
      toast.success("Supplier deleted successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to delete supplier");
    }
  };

  const handleEditSupplier = (supplier: ISupplierProfile) => {
    setFormType("Update");
    setEditSupplier(supplier);
    setTimeout(() => {
      setShowModal(true);
    }, 100);
  };

  const handleVerifySupplier = async (supplier: ISupplierProfile) => {
    if (supplier.is_verified) {
      toast("Supplier is already verified", { icon: "ℹ️" });
      return;
    }

    try {
      await SourcingService.verifySupplier(supplier.id);
      toast.success("Supplier verified successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to verify supplier");
    }
  };

  const handleViewDetails = (supplier: ISupplierProfile) => {
    navigate(`/admin/sourcing/suppliers/${supplier.id}`);
  };

  const tableActions: IDropdownAction[] = [
    {
      label: "View Details",
      icon: <EditIcon color="primary" />,
      onClick: (supplier: ISupplierProfile) => handleViewDetails(supplier),
    },
    {
      label: "Edit",
      icon: <EditIcon color="primary" />,
      onClick: (supplier: ISupplierProfile) => handleEditSupplier(supplier),
    },
    {
      label: "Verify",
      icon: <VerifiedIcon color="success" />,
      onClick: (supplier: ISupplierProfile) => handleVerifySupplier(supplier),
      condition: (supplier: ISupplierProfile) => !supplier.is_verified,
    },
    {
      label: "Delete",
      icon: <DeleteIcon color="error" />,
      onClick: (supplier: ISupplierProfile) => handleDeleteSupplier(supplier),
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
            placeholder="Search by business name, phone..."
          />
        </Box>

        <Box sx={styles.filterContainer}>
          <Button
            variant={filters.is_verified === true ? "contained" : "outlined"}
            size="small"
            onClick={() => setFilters({ 
              ...filters, 
              is_verified: filters.is_verified === true ? undefined : true,
              page: 1 
            })}
          >
            Verified Only
          </Button>
          <Button
            variant={filters.is_verified === false ? "contained" : "outlined"}
            size="small"
            onClick={() => setFilters({ 
              ...filters, 
              is_verified: filters.is_verified === false ? undefined : false,
              page: 1 
            })}
          >
            Unverified Only
          </Button>
        </Box>

        <Button
          sx={{ marginLeft: "auto" }}
          variant="contained"
          onClick={handleOpenModal}
        >
          Add Supplier
        </Button>
      </Box>

      <CustomTable
        columnShape={SupplierColumnShape(tableActions)}
        data={suppliers?.results || []}
        dataCount={suppliers?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(page: number) => setFilters({ ...filters, page: page + 1 })}
        pageIndex={filters?.page ? filters.page - 1 : 0}
        setPageSize={(size: number) => setFilters({ ...filters, page_size: size, page: 1 })}
        loading={loading}
      />

      <SupplierForm
        callBack={handleRefreshData}
        formType={formType}
        handleClose={handleCloseModal}
        initialValues={editSupplier}
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
  filterContainer: {
    display: "flex",
    gap: 1,
  },
};

export default Suppliers;