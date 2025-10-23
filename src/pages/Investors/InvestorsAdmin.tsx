import { Box, Button, Tabs, Tab } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import useTitle from "../../hooks/useTitle";
import { useModalContext } from "../../contexts/ModalDialogContext";
import { InvestorService } from "./Investor.service";
import { 
  IInvestorAccountsResults, 
  IInvestorDepositsResults,
  IInvestorWithdrawalsResults,
  IProfitAgreementsResults,
  IInvestorAccount,
  IInvestorDeposit,
  IInvestorWithdrawal,
  IProfitSharingAgreement
} from "./Investor.interface";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import SearchInput from "../../components/SearchInput";
import CustomTable from "../../components/UI/CustomTable";
import { 
  InvestorAccountColumnShape,
  DepositColumnShape,
  WithdrawalColumnShape,
  ProfitAgreementColumnShape
} from "./InvestorColumnShape";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import InvestorAccountForm from "./InvestorAccountForm";
import DepositForm from "./DepositForm";
import WithdrawalForm from "./WithdrawalForm";
import ProfitAgreementForm from "./ProfitAgreementForm";
import InvestorDetailsModal from "./InvestorDetailsModal";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`investor-tabpanel-${index}`}
      aria-labelledby={`investor-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

type FormType = 'account' | 'deposit' | 'withdrawal' | 'profit_agreement' | 'details' | null;

const InvestorsAdmin = () => {
  useTitle("Investors Management");
  const { showModal, setShowModal } = useModalContext();

  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<IInvestorAccountsResults>();
  const [deposits, setDeposits] = useState<IInvestorDepositsResults>();
  const [withdrawals, setWithdrawals] = useState<IInvestorWithdrawalsResults>();
  const [profitAgreements, setProfitAgreements] = useState<IProfitAgreementsResults>();
  const [selectedAccount, setSelectedAccount] = useState<IInvestorAccount | null>(null);
  const [selectedProfitAgreement, setSelectedProfitAgreement] = useState<IProfitSharingAgreement | null>(null);
  const [formType, setFormType] = useState<"Save" | "Update">("Save");
  const [activeForm, setActiveForm] = useState<FormType>(null);

  useEffect(() => {
    fetchData();
  }, [tabValue, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      switch (tabValue) {
        case 0: // Accounts
          const accountsData = await InvestorService.getInvestorAccounts(filters);
          setAccounts(accountsData);
          break;
        case 1: // Deposits
          const depositsData = await InvestorService.getInvestorDeposits(filters);
          setDeposits(depositsData);
          break;
        case 2: // Withdrawals
          const withdrawalsData = await InvestorService.getInvestorWithdrawals(filters);
          setWithdrawals(withdrawalsData);
          break;
        case 3: // Profit Agreements
          const agreementsData = await InvestorService.getProfitAgreements(filters);
          setProfitAgreements(agreementsData);
          break;
      }
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.error("Error fetching data:", error);
      toast.error(error.response?.data?.detail || "Failed to load data");
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setFilters({ page: 1, page_size: INITIAL_PAGE_SIZE });
    setSearchQuery("");
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
    // Implement search filtering here if needed
    // setFilters({ ...filters, search: value });
  };

  const closeModal = () => {
    setShowModal(false);
    setActiveForm(null);
    setSelectedAccount(null);
    setSelectedProfitAgreement(null);
  };

  // Account Actions
  const handleCreateAccount = () => {
    setFormType("Save");
    setSelectedAccount(null);
    setActiveForm('account');
    setShowModal(true);
  };

  const handleViewAccount = (account: IInvestorAccount) => {
    setSelectedAccount(account);
    setActiveForm('details');
    setShowModal(true);
  };

  const handleEditAccount = (account: IInvestorAccount) => {
    setSelectedAccount(account);
    setFormType("Update");
    setActiveForm('account');
    setShowModal(true);
  };

  const handleDeleteAccount = async (account: IInvestorAccount) => {
    if (!window.confirm(`Are you sure you want to delete the account for ${account.investor.first_name} ${account.investor.last_name}?`)) {
      return;
    }
    try {
      await InvestorService.deleteInvestorAccount(account.id);
      toast.success("Account deleted successfully");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to delete account");
    }
  };

  // Deposit Actions
  const handleCreateDeposit = () => {
    setActiveForm('deposit');
    setShowModal(true);
  };

  const handleDeleteDeposit = async (deposit: IInvestorDeposit) => {
    if (!window.confirm(`Are you sure you want to delete this deposit of ${deposit.amount} UGX?`)) {
      return;
    }
    try {
      await InvestorService.deleteInvestorDeposit(deposit.id);
      toast.success("Deposit deleted successfully");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to delete deposit");
    }
  };

  // Withdrawal Actions
  const handleCreateWithdrawal = () => {
    setActiveForm('withdrawal');
    setShowModal(true);
  };

  const handleApproveWithdrawal = async (withdrawal: IInvestorWithdrawal) => {
    if (!window.confirm(`Are you sure you want to approve withdrawal of ${withdrawal.amount} UGX for ${withdrawal.investor.first_name} ${withdrawal.investor.last_name}?`)) {
      return;
    }
    try {
      await InvestorService.approveWithdrawal(withdrawal.id);
      toast.success("Withdrawal approved successfully");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || error.response?.data?.error || "Failed to approve withdrawal");
    }
  };

  const handleRejectWithdrawal = async (withdrawal: IInvestorWithdrawal) => {
    const notes = window.prompt('Enter rejection reason:', 'Insufficient funds or invalid request');
    if (notes === null) return; // User cancelled
    
    try {
      await InvestorService.rejectWithdrawal(withdrawal.id, notes);
      toast.success("Withdrawal rejected successfully");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to reject withdrawal");
    }
  };

  // Profit Agreement Actions
  const handleCreateProfitAgreement = () => {
    setFormType("Save");
    setSelectedProfitAgreement(null);
    setActiveForm('profit_agreement');
    setShowModal(true);
  };

  const handleEditProfitAgreement = (agreement: IProfitSharingAgreement) => {
    setSelectedProfitAgreement(agreement);
    setFormType("Update");
    setActiveForm('profit_agreement');
    setShowModal(true);
  };

  const handleDeleteProfitAgreement = async (agreement: IProfitSharingAgreement) => {
    if (!window.confirm('Are you sure you want to delete this profit sharing agreement?')) {
      return;
    }
    try {
      await InvestorService.deleteProfitAgreement(agreement.id);
      toast.success("Profit agreement deleted successfully");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to delete profit agreement");
    }
  };

  // Action Definitions
  const accountActions: IDropdownAction[] = [
    {
      label: "View",
      icon: <VisibilityIcon />,
      onClick: handleViewAccount,
    },
    {
      label: "Edit",
      icon: <EditIcon />,
      onClick: handleEditAccount,
    },
    {
      label: "Delete",
      icon: <DeleteIcon />,
      onClick: handleDeleteAccount,
    },
  ];

  const depositActions: IDropdownAction[] = [
    {
      label: "Delete",
      icon: <DeleteIcon />,
      onClick: handleDeleteDeposit,
    },
  ];

  const withdrawalActions: IDropdownAction[] = [
    {
      label: "Approve",
      icon: <CheckCircleIcon />,
      onClick: handleApproveWithdrawal,
    },
    {
      label: "Reject",
      icon: <CancelIcon />,
      onClick: handleRejectWithdrawal,
    },
  ];

  const profitAgreementActions: IDropdownAction[] = [
    {
      label: "Edit",
      icon: <EditIcon />,
      onClick: handleEditProfitAgreement,
    },
    {
      label: "Delete",
      icon: <DeleteIcon />,
      onClick: handleDeleteProfitAgreement,
    },
  ];

  const renderCreateButton = () => {
    switch (tabValue) {
      case 0:
        return (
          <Button variant="contained" onClick={handleCreateAccount}>
            Create Account
          </Button>
        );
      case 1:
        return (
          <Button variant="contained" onClick={handleCreateDeposit}>
            Create Deposit
          </Button>
        );
      case 2:
        return (
          <Button variant="contained" onClick={handleCreateWithdrawal}>
            Request Withdrawal
          </Button>
        );
      case 3:
        return (
          <Button variant="contained" onClick={handleCreateProfitAgreement}>
            Create Profit Agreement
          </Button>
        );
      default:
        return null;
    }
  };

  const renderForm = () => {
    if (!showModal) return null;

    switch (activeForm) {
      case 'account':
        return (
          <InvestorAccountForm
            handleClose={closeModal}
            formType={formType}
            initialValues={selectedAccount ?? undefined}
            callBack={fetchData}
          />
        );
      case 'deposit':
        return (
          <DepositForm
            handleClose={closeModal}
            callBack={fetchData}
            accountId={selectedAccount?.id ?? ""}
          />
        );
      case 'withdrawal':
        return (
          <WithdrawalForm
            handleClose={closeModal}
            callBack={fetchData}
            accountId={selectedAccount?.id ?? ""}
          />
        );
      case 'profit_agreement':
        return (
          <ProfitAgreementForm
            handleClose={closeModal}
            formType={formType}
            initialValues={selectedProfitAgreement}
            callBack={fetchData}
          />
        );
      case 'details':
        return (
          <InvestorDetailsModal
            handleClose={closeModal}
            account={selectedAccount as IInvestorAccount}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="investor tabs">
            <Tab label="Accounts" />
            <Tab label="Deposits" />
            <Tab label="Withdrawals" />
            <Tab label="Profit Agreements" />
          </Tabs>
        </Box>
      </Box>

      {/* Accounts Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={styles.tablePreHeader}>
          <SearchInput
            value={searchQuery}
            onChange={handleInputChange}
            type="text"
            placeholder="Search accounts by name, phone..."
          />
          {renderCreateButton()}
        </Box>
        <CustomTable
          columnShape={InvestorAccountColumnShape(accountActions)}
          data={accounts?.results || []}
          dataCount={accounts?.count || 0}
          pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
          setPageIndex={(page: number) => setFilters({...filters, page})}
          pageIndex={filters?.page || 1}
          setPageSize={(size: number) => setFilters({ ...filters, page_size: size })}
          loading={loading}
          rowClick={(row) => setSelectedAccount((row as any).original)}
        />
      </TabPanel>

      {/* Deposits Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={styles.tablePreHeader}>
          <SearchInput
            value={searchQuery}
            onChange={handleInputChange}
            type="text"
            placeholder="Search deposits..."
          />
          {renderCreateButton()}
        </Box>
        <CustomTable
          columnShape={DepositColumnShape(depositActions)}
          data={deposits?.results || []}
          dataCount={deposits?.count || 0}
          pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
          setPageIndex={(page: number) => setFilters({...filters, page})}
          pageIndex={filters?.page || 1}
          setPageSize={(size: number) => setFilters({ ...filters, page_size: size })}
          loading={loading}
        />
      </TabPanel>

      {/* Withdrawals Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={styles.tablePreHeader}>
          <SearchInput
            value={searchQuery}
            onChange={handleInputChange}
            type="text"
            placeholder="Search withdrawals..."
          />
          {renderCreateButton()}
        </Box>
        <CustomTable
          columnShape={WithdrawalColumnShape(withdrawalActions)}
          data={withdrawals?.results || []}
          dataCount={withdrawals?.count || 0}
          pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
          setPageIndex={(page: number) => setFilters({...filters, page})}
          pageIndex={filters?.page || 1}
          setPageSize={(size: number) => setFilters({ ...filters, page_size: size })}
          loading={loading}
        />
      </TabPanel>

      {/* Profit Agreements Tab */}
      <TabPanel value={tabValue} index={3}>
        <Box sx={styles.tablePreHeader}>
          <SearchInput
            value={searchQuery}
            onChange={handleInputChange}
            type="text"
            placeholder="Search profit agreements..."
          />
          {renderCreateButton()}
        </Box>
        <CustomTable
          columnShape={ProfitAgreementColumnShape(profitAgreementActions)}
          data={profitAgreements?.results || []}
          dataCount={profitAgreements?.count || 0}
          pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
          setPageIndex={(page: number) => setFilters({...filters, page})}
          pageIndex={filters?.page || 1}
          setPageSize={(size: number) => setFilters({ ...filters, page_size: size })}
          loading={loading}
        />
      </TabPanel>

      {/* Render Active Form */}
      {renderForm()}
    </Box>
  );
};

const styles = {
  tablePreHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 2,
    marginBottom: 2,
  },
};

export default InvestorsAdmin;