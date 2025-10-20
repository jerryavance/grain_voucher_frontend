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
  ITradesResults,
  ITradeAllocationsResults,
  ILoansResults,
  IInvestorAccount,
  IInvestorDeposit,
  IInvestorWithdrawal,
  ITrade,
  ITradeAllocation,
  ILoan
} from "./Investor.interface";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import SearchInput from "../../components/SearchInput";
import CustomTable from "../../components/UI/CustomTable";
import { 
  InvestorAccountColumnShape,
  DepositColumnShape,
  WithdrawalColumnShape,
  TradeColumnShape,
  TradeAllocationColumnShape,
  LoanColumnShape
} from "./InvestorColumnShape";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import InvestorAccountForm from "./InvestorAccountForm";
import DepositForm from "./DepositForm";
import WithdrawalForm from "./WithdrawalForm";
import TradeForm from "./TradeForm";
import TradeAllocationForm from "./TradeAllocationForm";
import LoanForm from "./LoanForm";
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

type FormType = 'account' | 'deposit' | 'withdrawal' | 'trade' | 'allocation' | 'loan' | 'details' | null;

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
  const [trades, setTrades] = useState<ITradesResults>();
  const [allocations, setAllocations] = useState<ITradeAllocationsResults>();
  const [loans, setLoans] = useState<ILoansResults>();
  const [selectedAccount, setSelectedAccount] = useState<IInvestorAccount | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<ITrade | null>(null);
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
        case 3: // Trades
          const tradesData = await InvestorService.getTrades(filters);
          setTrades(tradesData);
          break;
        case 4: // Allocations
          const allocationsData = await InvestorService.getTradeAllocations(filters);
          setAllocations(allocationsData);
          break;
        case 5: // Loans
          const loansData = await InvestorService.getLoans(filters);
          setLoans(loansData);
          break;
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
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
    try {
      await InvestorService.deleteInvestorAccount(account.id);
      toast.success("Account deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete account");
    }
  };

  // Deposit Actions
  const handleCreateDeposit = () => {
    setActiveForm('deposit');
    setShowModal(true);
  };

  const handleDeleteDeposit = async (deposit: IInvestorDeposit) => {
    try {
      await InvestorService.deleteInvestorDeposit(deposit.id);
      toast.success("Deposit deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete deposit");
    }
  };

  // Withdrawal Actions
  const handleCreateWithdrawal = () => {
    setActiveForm('withdrawal');
    setShowModal(true);
  };

  const handleApproveWithdrawal = async (withdrawal: IInvestorWithdrawal) => {
    try {
      await InvestorService.approveWithdrawal(withdrawal.id);
      toast.success("Withdrawal approved successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to approve withdrawal");
    }
  };

  const handleRejectWithdrawal = async (withdrawal: IInvestorWithdrawal, notes: string) => {
    try {
      await InvestorService.rejectWithdrawal(withdrawal.id, notes);
      toast.success("Withdrawal rejected successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to reject withdrawal");
    }
  };
  

  // Trade Actions
  const handleCreateTrade = () => {
    setFormType("Save");
    setSelectedTrade(null);
    setActiveForm('trade');
    setShowModal(true);
  };

  const handleEditTrade = (trade: ITrade) => {
    setSelectedTrade(trade);
    setFormType("Update");
    setActiveForm('trade');
    setShowModal(true);
  };

  const handleDeleteTrade = async (trade: ITrade) => {
    try {
      await InvestorService.deleteTrade(trade.id);
      toast.success("Trade deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete trade");
    }
  };

  // Allocation Actions
  const handleCreateAllocation = () => {
    if (!selectedTrade) {
      toast.error("Please select a trade first");
      return;
    }
    setActiveForm('allocation');
    setShowModal(true);
  };

  const handleDeleteAllocation = async (allocation: ITradeAllocation) => {
    try {
      await InvestorService.deleteTradeAllocation(allocation.id);
      toast.success("Allocation deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete allocation");
    }
  };

  // Loan Actions
  const handleCreateLoan = () => {
    if (!selectedTrade) {
      toast.error("Please select a trade first");
      return;
    }
    setActiveForm('loan');
    setShowModal(true);
  };

  const handleDeleteLoan = async (loan: ILoan) => {
    try {
      await InvestorService.deleteLoan(loan.id);
      toast.success("Loan deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete loan");
    }
  };

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
    // {
    //   label: "Reject",
    //   icon: <CancelIcon />,
    //   onClick: handleRejectWithdrawal,
    // },
    {
      label: "Reject",
      icon: <CancelIcon />,
      onClick: (withdrawal: IInvestorWithdrawal) =>
        handleRejectWithdrawal(withdrawal, ""),
    },
  ];

  const tradeActions: IDropdownAction[] = [
    {
      label: "Edit",
      icon: <EditIcon />,
      onClick: handleEditTrade,
    },
    {
      label: "Delete",
      icon: <DeleteIcon />,
      onClick: handleDeleteTrade,
    },
  ];

  const allocationActions: IDropdownAction[] = [
    {
      label: "Delete",
      icon: <DeleteIcon />,
      onClick: handleDeleteAllocation,
    },
  ];

  const loanActions: IDropdownAction[] = [
    {
      label: "Delete",
      icon: <DeleteIcon />,
      onClick: handleDeleteLoan,
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
            Create Withdrawal
          </Button>
        );
      case 3:
        return (
          <Button variant="contained" onClick={handleCreateTrade}>
            Create Trade
          </Button>
        );
      case 4:
        return (
          <Button 
            variant="contained" 
            onClick={handleCreateAllocation}
            disabled={!selectedTrade}
          >
            Create Allocation
          </Button>
        );
      case 5:
        return (
          <Button 
            variant="contained" 
            onClick={handleCreateLoan}
            disabled={!selectedTrade}
          >
            Create Loan
          </Button>
        );
      default:
        return null;
    }
  };

  const renderForm = () => {
    switch (activeForm) {
      case 'account':
        return (
          <InvestorAccountForm
            handleClose={() => {
              setShowModal(false);
              setActiveForm(null);
            }}
            formType={formType}
            initialValues={selectedAccount}
            callBack={fetchData}
          />
        );
      case 'deposit':
        return (
          <DepositForm
            handleClose={() => {
              setShowModal(false);
              setActiveForm(null);
            } }
            callBack={fetchData} accountId={""}          />
        );
      case 'withdrawal':
        return (
          <WithdrawalForm
            handleClose={() => {
              setShowModal(false);
              setActiveForm(null);
            } }
            callBack={fetchData} accountId={""}          />
        );
      case 'trade':
        return (
          <TradeForm
            handleClose={() => {
              setShowModal(false);
              setActiveForm(null);
            }}
            formType={formType}
            initialValues={selectedTrade}
            callBack={fetchData}
          />
        );
      case 'allocation':
        return (
          <TradeAllocationForm
            handleClose={() => {
              setShowModal(false);
              setActiveForm(null);
            }}
            tradeId={selectedTrade?.id}
            callBack={fetchData}
          />
        );
      case 'loan':
        return (
          <LoanForm
            handleClose={() => {
              setShowModal(false);
              setActiveForm(null);
            }}
            tradeId={selectedTrade?.id}
            callBack={fetchData}
          />
        );
      case 'details':
        return (
          <InvestorDetailsModal
            handleClose={() => {
              setShowModal(false);
              setActiveForm(null);
            }}
            account={selectedAccount as IInvestorAccount}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="investor tabs">
          <Tab label="Accounts" />
          <Tab label="Deposits" />
          <Tab label="Withdrawals" />
          <Tab label="Trades" />
          <Tab label="Allocations" />
          <Tab label="Loans" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={styles.tablePreHeader}>
          <SearchInput
            value={searchQuery}
            onChange={handleInputChange}
            type="text"
            placeholder="Search accounts..."
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

      <TabPanel value={tabValue} index={3}>
        <Box sx={styles.tablePreHeader}>
          <SearchInput
            value={searchQuery}
            onChange={handleInputChange}
            type="text"
            placeholder="Search trades..."
          />
          {renderCreateButton()}
        </Box>
        <CustomTable
          columnShape={TradeColumnShape(tradeActions)}
          data={trades?.results || []}
          dataCount={trades?.count || 0}
          pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
          setPageIndex={(page: number) => setFilters({...filters, page})}
          pageIndex={filters?.page || 1}
          setPageSize={(size: number) => setFilters({ ...filters, page_size: size })}
          loading={loading}
          rowClick={(row: any) => setSelectedTrade(row.original)}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <Box sx={styles.tablePreHeader}>
          <SearchInput
            value={searchQuery}
            onChange={handleInputChange}
            type="text"
            placeholder="Search allocations..."
          />
          {renderCreateButton()}
        </Box>
        <CustomTable
          columnShape={TradeAllocationColumnShape(allocationActions)}
          data={allocations?.results || []}
          dataCount={allocations?.count || 0}
          pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
          setPageIndex={(page: number) => setFilters({...filters, page})}
          pageIndex={filters?.page || 1}
          setPageSize={(size: number) => setFilters({ ...filters, page_size: size })}
          loading={loading}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={5}>
        <Box sx={styles.tablePreHeader}>
          <SearchInput
            value={searchQuery}
            onChange={handleInputChange}
            type="text"
            placeholder="Search loans..."
          />
          {renderCreateButton()}
        </Box>
        <CustomTable
          columnShape={LoanColumnShape(loanActions)}
          data={loans?.results || []}
          dataCount={loans?.count || 0}
          pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
          setPageIndex={(page: number) => setFilters({...filters, page})}
          pageIndex={filters?.page || 1}
          setPageSize={(size: number) => setFilters({ ...filters, page_size: size })}
          loading={loading}
        />
      </TabPanel>

      {renderForm()}
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

export default InvestorsAdmin;