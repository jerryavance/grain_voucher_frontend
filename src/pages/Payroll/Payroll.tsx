// Payroll.tsx
import { Box, Button, Tab, Tabs, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import useTitle from "../../hooks/useTitle";
import { useModalContext } from "../../contexts/ModalDialogContext";
import { PayrollService } from "./Payroll.service";
import GeneratePayslipsModal from "./GeneratePayslipsModal";
import { 
  IEmployeesResults, 
  IPayslipsResults, 
  IEmployee, 
  IPayslip, 
  PayrollViewType 
} from "./Payroll.interface";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import SearchInput from "../../components/SearchInput";
import CustomTable from "../../components/UI/CustomTable";
import EmployeeColumnShape from "./EmployeeColumnShape";
import PayslipColumnShape from "./PaysSlipColumnShape";
import EmployeeForm from "./EmployeeForm";
import PayslipForm from "./PayslipForm";
import { INITIAL_PAGE_SIZE } from "../../api/constants";

const Payroll = () => {
  useTitle("Payroll Management");
  const { setShowModal } = useModalContext();

  const [currentView, setCurrentView] = useState<PayrollViewType>("employees");
  const [editEmployee, setEditEmployee] = useState<IEmployee | null>(null);
  const [editPayslip, setEditPayslip] = useState<IPayslip | null>(null);
  const [formType, setFormType] = useState<"Save" | "Update">("Save");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [employees, setEmployees] = useState<IEmployeesResults>();
  const [payslips, setPayslips] = useState<IPayslipsResults>();
  const [filters, setFilters] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showGenerateModal, setShowGenerateModal] = useState<boolean>(false);

  useEffect(() => {
    if (currentView === "employees") {
      fetchEmployees(filters);
    } else {
      fetchPayslips(filters);
    }
  }, [filters, currentView]);

  const fetchEmployees = async (params?: any) => {
    try {
      setLoading(true);
      const resp: IEmployeesResults = await PayrollService.getEmployees(params);
      setEmployees(resp);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching Employees:", error);
    }
  };

  const fetchPayslips = async (params?: any) => {
    try {
      setLoading(true);
      const resp: IPayslipsResults = await PayrollService.getPayslips(params);
      setPayslips(resp);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching Payslips:", error);
    }
  };

  const handleRefreshData = async () => {
    try {
      setLoading(true);
      if (currentView === "employees") {
        const results: any = await PayrollService.getEmployees({ search: searchQuery });
        setEmployees(results);
      } else {
        const results: any = await PayrollService.getPayslips({ search: searchQuery });
        setPayslips(results);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormType("Save");
    setEditEmployee(null);
    setEditPayslip(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditEmployee(null);
    setEditPayslip(null);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: PayrollViewType) => {
    setCurrentView(newValue);
    setFilters(null);
    setSearchQuery("");
  };

  // Employee Actions
  const handleDeleteEmployee = async (employee: IEmployee) => {
    try {
      await PayrollService.deleteEmployee(employee?.id);
      toast.success("Employee deleted successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error("Something went wrong");
    }
  };

  const handleEditEmployee = (employee: IEmployee) => {
    setFormType("Update");
    setEditEmployee(employee);
    setTimeout(() => {
      setShowModal(true);
    });
  };

  // Payslip Actions
  const handleDeletePayslip = async (payslip: IPayslip) => {
    try {
      await PayrollService.deletePayslip(payslip?.id);
      toast.success("Payslip deleted successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error("Something went wrong");
    }
  };

  const handleEditPayslip = (payslip: IPayslip) => {
    setFormType("Update");
    setEditPayslip(payslip);
    setTimeout(() => {
      setShowModal(true);
    });
  };

  // Generate monthly payslips
  const handleGenerateMonthlyPayslips = () => {
    setShowGenerateModal(true);
  };

  const handleCloseGenerateModal = () => {
    setShowGenerateModal(false);
  };

  const employeeActions: IDropdownAction[] = [
    {
      label: "Edit",
      icon: <EditIcon color="primary" />,
      onClick: (employee: IEmployee) => handleEditEmployee(employee),
    },
    {
      label: "Delete Employee",
      icon: <DeleteIcon color="error" />,
      onClick: (employee: IEmployee) => handleDeleteEmployee(employee),
    },
  ];

  const payslipActions: IDropdownAction[] = [
    {
      label: "Edit",
      icon: <EditIcon color="primary" />,
      onClick: (payslip: IPayslip) => handleEditPayslip(payslip),
    },
    {
      label: "Delete Payslip",
      icon: <DeleteIcon color="error" />,
      onClick: (payslip: IPayslip) => handleDeletePayslip(payslip),
    },
  ];

  const renderActionButtons = () => (
    <Box sx={{ display: 'flex', gap: 1, marginLeft: 'auto' }}>
      {currentView === "payslips" && (
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<PlaylistAddIcon />}
          onClick={handleGenerateMonthlyPayslips}
        >
          Generate Monthly
        </Button>
      )}
      <Button
        variant="contained"
        onClick={handleOpenModal}
      >
        {currentView === "employees" ? "Add Employee" : "Create Payslip"}
      </Button>
    </Box>
  );

  const renderTable = () => {
    if (currentView === "employees") {
      return (
        <CustomTable
          columnShape={EmployeeColumnShape(employeeActions)}
          data={employees?.results || []}
          dataCount={employees?.count || 0}
          pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
          setPageIndex={(page: number) => setFilters({...filters, page})}
          pageIndex={filters?.page || 1}
          setPageSize={(size: number) => setFilters({ ...filters, page_size: size })}
          loading={loading}
        />
      );
    } else {
      return (
        <CustomTable
          columnShape={PayslipColumnShape(payslipActions)}
          data={payslips?.results || []}
          dataCount={payslips?.count || 0}
          pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
          setPageIndex={(page: number) => setFilters({...filters, page})}
          pageIndex={filters?.page || 1}
          setPageSize={(size: number) => setFilters({ ...filters, page_size: size })}
          loading={loading}
        />
      );
    }
  };

  const renderForm = () => {
    if (currentView === "employees") {
      return (
        <EmployeeForm
          callBack={handleRefreshData}
          formType={formType}
          handleClose={handleCloseModal}
          initialValues={editEmployee}
        />
      );
    } else {
      return (
        <PayslipForm
          callBack={handleRefreshData}
          formType={formType}
          handleClose={handleCloseModal}
          initialValues={editPayslip}
        />
      );
    }
  };

  return (
    <Box pt={2} pb={4}>
      {/* Header with Title and Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={currentView} 
          onChange={handleTabChange}
          sx={{ mb: 2 }}
        >
          <Tab label="Employees" value="employees" />
          <Tab label="Payslips" value="payslips" />
        </Tabs>
      </Box>

      {/* Search and Actions Bar */}
      <Box sx={styles.tablePreHeader}>
        <SearchInput
          value={searchQuery}
          onChange={handleInputChange}
          type="text"
          placeholder={`Search ${currentView}...`}
        />
        {renderActionButtons()}
      </Box>

      {/* Summary Stats */}
      <Box sx={styles.statsContainer}>
        <Box sx={styles.statCard}>
          <Typography variant="h6" color="primary">
            {currentView === "employees" 
              ? employees?.count || 0 
              : payslips?.count || 0
            }
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Total {currentView === "employees" ? "Employees" : "Payslips"}
          </Typography>
        </Box>
      </Box>

      {/* Table */}
      {renderTable()}

      {/* Forms */}
      {renderForm()}

      {/* Generate Payslips Modal */}
      {showGenerateModal && (
        <GeneratePayslipsModal
          handleClose={handleCloseGenerateModal}
          callBack={() => {
            setCurrentView("payslips");
            handleRefreshData();
          }}
        />
      )}
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
  statsContainer: {
    display: 'flex',
    gap: 2,
    marginBottom: 3,
  },
  statCard: {
    padding: 2,
    borderRadius: 2,
    backgroundColor: 'background.paper',
    border: '1px solid',
    borderColor: 'divider',
    minWidth: 120,
    textAlign: 'center',
  },
};

export default Payroll;