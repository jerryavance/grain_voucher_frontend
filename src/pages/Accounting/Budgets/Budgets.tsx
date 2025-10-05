import { Box, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import useTitle from "../../../hooks/useTitle";
import { useModalContext } from "../../../contexts/ModalDialogContext";
import { BudgetService } from "./Budgets.service";
import { IBudgetsResults, IBudget } from "./Budgets.interface";
import { IDropdownAction } from "../../../components/UI/DropdownActionBtn";
import SearchInput from "../../../components/SearchInput";
import CustomTable from "../../../components/UI/CustomTable";
import BudgetColumnShape from "./BudgetsColumnShape";
import BudgetForm from "./BudgetsForm";
import { INITIAL_PAGE_SIZE } from "../../../api/constants";

const Budgets = () => {
  useTitle("Budgets");
  const { setShowModal } = useModalContext();

  const [editBudget, setEditBudget] = useState<IBudget | null>(null);
  const [formType, setFormType] = useState<"Save" | "Update">("Save");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [budgets, setBudgets] = useState<IBudgetsResults>();
  const [filters, setFilters] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchData(filters);
  }, [filters]);

  const fetchData = async (params?: any) => {
    try {
      setLoading(true);
      const resp: IBudgetsResults = await BudgetService.getBudgets(params);
      setBudgets(resp);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching Budgets:", error);
    }
  };

  const handleRefreshData = () => {
    fetchData(filters);
  };

  const handleOpenModal = () => {
    setFormType("Save");
    setEditBudget(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
    setFilters({ ...filters, search: value });
  };

  const handleDeleteBudget = async (budget: IBudget) => {
    try {
      await BudgetService.deleteBudget(budget.id);
      toast.success("Budget deleted successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error("Something went wrong");
    }
  };

  const handleEditBudget = (budget: IBudget) => {
    setFormType("Update");
    setEditBudget(budget);
    setTimeout(() => setShowModal(true), 0);
  };

  const tableActions: IDropdownAction[] = [
    { label: "Edit", icon: <EditIcon color="primary" />, onClick: handleEditBudget },
    { label: "Delete", icon: <DeleteIcon color="error" />, onClick: handleDeleteBudget },
  ];

  return (
    <Box pt={2} pb={4}>
      <Box sx={styles.tablePreHeader}>
        <SearchInput value={searchQuery} onChange={handleInputChange} type="text" placeholder="Search budget..." />
        <Button sx={{ marginLeft: "auto" }} variant="contained" onClick={handleOpenModal}>
          Create Budget
        </Button>
      </Box>

      <CustomTable
        columnShape={BudgetColumnShape(tableActions)}
        data={budgets?.results || []}
        dataCount={budgets?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(page: number) => setFilters({ ...filters, page })}
        pageIndex={filters?.page || 1}
        setPageSize={(size: number) => setFilters({ ...filters, page_size: size })}
        loading={loading}
      />

      <BudgetForm callBack={handleRefreshData} formType={formType} handleClose={handleCloseModal} initialValues={editBudget || {}} />
    </Box>
  );
};

const styles = {
  tablePreHeader: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    marginBottom: 2,
  },
};

export default Budgets;