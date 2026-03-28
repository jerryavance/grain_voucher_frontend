import { Box, Button, Tabs, Tab, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PaidIcon from "@mui/icons-material/Paid";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import useTitle from "../../hooks/useTitle";
import { useModalContext } from "../../contexts/ModalDialogContext";
import { InvestorService } from "./Investor.service";
import {
  IInvestorAccountsResults,
  IInvestorDepositsResults,
  IInvestorWithdrawalsResults,
  IProfitAgreementsResults,
  IMarginPayoutsResults,
  IInvestorAccount,
  IInvestorDeposit,
  IInvestorWithdrawal,
  IProfitSharingAgreement,
  IMarginPayout,
} from "./Investor.interface";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import SearchInput from "../../components/SearchInput";
import CustomTable from "../../components/UI/CustomTable";
import {
  InvestorAccountColumnShape,
  DepositColumnShape,
  WithdrawalColumnShape,
  ProfitAgreementColumnShape,
  MarginPayoutColumnShape,
} from "./InvestorColumnShape";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import InvestorAccountForm from "./InvestorAccountForm";
import DepositForm from "./DepositForm";
import WithdrawalForm from "./WithdrawalForm";
import ProfitAgreementForm from "./ProfitAgreementForm";
import MarginPayoutForm from "./MarginPayoutForm";
import InvestorDetailsModal from "./InvestorDetailsModal";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
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

type FormType =
  | "account"
  | "deposit"
  | "withdrawal"
  | "profit_agreement"
  | "margin_payout"
  | "details"
  | null;

const InvestorsAdmin = () => {
  useTitle("Investors Management");
  const { showModal, setShowModal } = useModalContext();

  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState(false);

  const [accounts, setAccounts] = useState<IInvestorAccountsResults>();
  const [deposits, setDeposits] = useState<IInvestorDepositsResults>();
  const [withdrawals, setWithdrawals] = useState<IInvestorWithdrawalsResults>();
  const [profitAgreements, setProfitAgreements] = useState<IProfitAgreementsResults>();
  const [marginPayouts, setMarginPayouts] = useState<IMarginPayoutsResults>();

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
        case 0:
          setAccounts(await InvestorService.getInvestorAccounts(filters));
          break;
        case 1:
          setDeposits(await InvestorService.getInvestorDeposits(filters));
          break;
        case 2:
          setWithdrawals(await InvestorService.getInvestorWithdrawals(filters));
          break;
        case 3:
          setProfitAgreements(await InvestorService.getProfitAgreements(filters));
          break;
        case 4: // Margin Payouts tab
          setMarginPayouts(await InvestorService.getMarginPayouts(filters));
          break;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, v: number) => {
    setTabValue(v);
    setFilters({ page: 1, page_size: INITIAL_PAGE_SIZE });
    setSearchQuery("");
  };

  const closeModal = () => {
    setShowModal(false);
    setActiveForm(null);
    setSelectedAccount(null);
    setSelectedProfitAgreement(null);
  };

  // ── Account Actions ──────────────────────────────────────────────────────
  const handleCreateAccount = () => {
    setFormType("Save");
    setSelectedAccount(null);
    setActiveForm("account");
    setShowModal(true);
  };
  const handleViewAccount = (account: IInvestorAccount) => {
    setSelectedAccount(account);
    setActiveForm("details");
    setShowModal(true);
  };
  const handleEditAccount = (account: IInvestorAccount) => {
    setSelectedAccount(account);
    setFormType("Update");
    setActiveForm("account");
    setShowModal(true);
  };
  const handleDeleteAccount = async (account: IInvestorAccount) => {
    if (!window.confirm(`Delete account for ${account.investor.first_name} ${account.investor.last_name}?`)) return;
    try {
      await InvestorService.deleteInvestorAccount(account.id);
      toast.success("Account deleted");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to delete account");
    }
  };

  // ── Deposit Actions ──────────────────────────────────────────────────────
  const handleCreateDeposit = () => {
    setActiveForm("deposit");
    setShowModal(true);
  };
  const handleDeleteDeposit = async (deposit: IInvestorDeposit) => {
    if (!window.confirm(`Delete deposit of ${deposit.amount} UGX?`)) return;
    try {
      await InvestorService.deleteInvestorDeposit(deposit.id);
      toast.success("Deposit deleted");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to delete deposit");
    }
  };

  // ── Withdrawal Actions ───────────────────────────────────────────────────
  const handleCreateWithdrawal = () => {
    setActiveForm("withdrawal");
    setShowModal(true);
  };
  const handleApproveWithdrawal = async (w: IInvestorWithdrawal) => {
    if (!window.confirm(`Approve withdrawal of ${w.amount} UGX for ${w.investor.first_name}?`)) return;
    try {
      await InvestorService.approveWithdrawal(w.id);
      toast.success("Withdrawal approved");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.response?.data?.error || "Failed to approve");
    }
  };
  const handleRejectWithdrawal = async (w: IInvestorWithdrawal) => {
    const notes = window.prompt("Enter rejection reason:", "Insufficient funds or invalid request");
    if (notes === null) return;
    try {
      await InvestorService.rejectWithdrawal(w.id, notes);
      toast.success("Withdrawal rejected");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to reject");
    }
  };

  // ── Profit Agreement Actions ─────────────────────────────────────────────
  const handleCreateProfitAgreement = () => {
    setFormType("Save");
    setSelectedProfitAgreement(null);
    setActiveForm("profit_agreement");
    setShowModal(true);
  };
  const handleEditProfitAgreement = (agreement: IProfitSharingAgreement) => {
    setSelectedProfitAgreement(agreement);
    setFormType("Update");
    setActiveForm("profit_agreement");
    setShowModal(true);
  };
  const handleDeleteProfitAgreement = async (agreement: IProfitSharingAgreement) => {
    if (!window.confirm("Delete this profit sharing agreement?")) return;
    try {
      await InvestorService.deleteProfitAgreement(agreement.id);
      toast.success("Profit agreement deleted");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to delete");
    }
  };

  // ── Margin Payout Actions (NEW) ──────────────────────────────────────────
  const handleCreateMarginPayout = () => {
    setActiveForm("margin_payout");
    setShowModal(true);
  };

  const handleApproveMarginPayout = async (payout: IMarginPayout) => {
    if (
      !window.confirm(
        `Approve payout of UGX ${parseFloat(payout.amount).toLocaleString()} for ${payout.investor?.first_name}?\n\nThis will deduct from the investor's margin balance and EMD wallet.`
      )
    )
      return;
    try {
      const res = await InvestorService.approveMarginPayout(payout.id);
      toast.success(res.message || "Payout approved");
      fetchData();
    } catch (err: any) {
      toast.error(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to approve payout"
      );
    }
  };

  const handleMarkMarginPayoutPaid = async (payout: IMarginPayout) => {
    // ✅ FIX: Prompt for payment reference (required by backend)
    const paymentRef = window.prompt(
      `Enter payment reference (e.g. bank ref, MoMo TxID) for disbursement of UGX ${parseFloat(payout.amount).toLocaleString()} to ${payout.investor?.first_name}:`
    );
    if (!paymentRef) return; // user cancelled or left empty
    try {
      const res = await InvestorService.markMarginPayoutPaid(payout.id, paymentRef);
      toast.success(res.message || "Payout marked as paid");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.response?.data?.error || "Failed to mark paid");
    }
  };

  const handleCancelMarginPayout = async (payout: IMarginPayout) => {
    const notes = window.prompt("Enter cancellation reason (optional):");
    if (notes === null) return; // user cancelled prompt
    try {
      const res = await InvestorService.cancelMarginPayout(payout.id, notes || undefined);
      toast.success(res.message || "Payout cancelled");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to cancel payout");
    }
  };

  // ── Action Definitions ───────────────────────────────────────────────────
  const accountActions: IDropdownAction[] = [
    { label: "View", icon: <VisibilityIcon />, onClick: handleViewAccount },
    { label: "Edit", icon: <EditIcon />, onClick: handleEditAccount },
    { label: "Delete", icon: <DeleteIcon />, onClick: handleDeleteAccount },
  ];
  const depositActions: IDropdownAction[] = [
    { label: "Delete", icon: <DeleteIcon />, onClick: handleDeleteDeposit },
  ];
  const withdrawalActions: IDropdownAction[] = [
    { label: "Approve", icon: <CheckCircleIcon />, onClick: handleApproveWithdrawal },
    { label: "Reject", icon: <CancelIcon />, onClick: handleRejectWithdrawal },
  ];
  const profitAgreementActions: IDropdownAction[] = [
    { label: "Edit", icon: <EditIcon />, onClick: handleEditProfitAgreement },
    { label: "Delete", icon: <DeleteIcon />, onClick: handleDeleteProfitAgreement },
  ];
  const marginPayoutActions: IDropdownAction[] = [
    { label: "Approve", icon: <CheckCircleIcon />, onClick: handleApproveMarginPayout },
    { label: "Mark Paid", icon: <PaidIcon />, onClick: handleMarkMarginPayoutPaid },
    { label: "Cancel", icon: <CancelIcon />, onClick: handleCancelMarginPayout },
  ];

  // ── Create Button per Tab ────────────────────────────────────────────────
  const renderCreateButton = () => {
    const map: Record<number, { label: string; fn: () => void }> = {
      0: { label: "Create Account", fn: handleCreateAccount },
      1: { label: "Create Deposit", fn: handleCreateDeposit },
      2: { label: "Request Withdrawal", fn: handleCreateWithdrawal },
      3: { label: "Create Profit Agreement", fn: handleCreateProfitAgreement },
      4: { label: "New Payout Request", fn: handleCreateMarginPayout },
    };
    const item = map[tabValue];
    return item ? (
      <Button variant="contained" onClick={item.fn}>
        {item.label}
      </Button>
    ) : null;
  };

  // ── Form Renderer ────────────────────────────────────────────────────────
  const renderForm = () => {
    if (!showModal) return null;
    switch (activeForm) {
      case "account":
        return (
          <InvestorAccountForm
            handleClose={closeModal}
            formType={formType}
            initialValues={selectedAccount ?? undefined}
            callBack={fetchData}
          />
        );
      case "deposit":
        return (
          <DepositForm
            handleClose={closeModal}
            callBack={fetchData}
            accountId={selectedAccount?.id ?? ""}
          />
        );
      case "withdrawal":
        return (
          <WithdrawalForm
            handleClose={closeModal}
            callBack={fetchData}
            accountId={selectedAccount?.id ?? ""}
          />
        );
      case "profit_agreement":
        return (
          <ProfitAgreementForm
            handleClose={closeModal}
            formType={formType}
            initialValues={selectedProfitAgreement ?? undefined}
            callBack={fetchData}
          />
        );
      case "margin_payout":
        return (
          <MarginPayoutForm
            handleClose={closeModal}
            callBack={fetchData}
            accountId={selectedAccount?.id}
          />
        );
      case "details":
        return (
          <InvestorDetailsModal
            handleClose={closeModal}
            account={selectedAccount}
          />
        );
      default:
        return null;
    }
  };

  const tableHeader = (placeholder: string) => (
    <Box sx={styles.tablePreHeader}>
      <SearchInput
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        type="text"
        placeholder={placeholder}
      />
      {renderCreateButton()}
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* ── Page Header ── */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <AccountBalanceWalletIcon sx={{ fontSize: 36, mr: 1.5, color: "primary.main" }} />
        <Typography variant="h4">Investors Management</Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 0 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="investor tabs">
          <Tab label="Accounts" />
          <Tab label="Deposits" />
          <Tab label="Withdrawals" />
          <Tab label="Profit Agreements" />
          <Tab label="Margin Payouts" />
        </Tabs>
      </Box>

      {/* ── Accounts ── */}
      <TabPanel value={tabValue} index={0}>
        {tableHeader("Search accounts by name, phone…")}
        <CustomTable
          columnShape={InvestorAccountColumnShape(accountActions, handleViewAccount)}
          data={accounts?.results || []}
          dataCount={accounts?.count || 0}
          pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
          setPageIndex={(p: number) => setFilters({ ...filters, page: p + 1 })}
          pageIndex={filters.page - 1}
          setPageSize={(s: any) => setFilters({ ...filters, page_size: s, page: 1 })}
          loading={loading}
        />
      </TabPanel>

      {/* ── Deposits ── */}
      <TabPanel value={tabValue} index={1}>
        {tableHeader("Search deposits…")}
        <CustomTable
          columnShape={DepositColumnShape(depositActions)}
          data={deposits?.results || []}
          dataCount={deposits?.count || 0}
          pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
          setPageIndex={(p: number) => setFilters({ ...filters, page: p + 1 })}
          pageIndex={filters.page - 1}
          setPageSize={(s: any) => setFilters({ ...filters, page_size: s, page: 1 })}
          loading={loading}
        />
      </TabPanel>

      {/* ── Withdrawals ── */}
      <TabPanel value={tabValue} index={2}>
        {tableHeader("Search withdrawals…")}
        <CustomTable
          columnShape={WithdrawalColumnShape(withdrawalActions)}
          data={withdrawals?.results || []}
          dataCount={withdrawals?.count || 0}
          pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
          setPageIndex={(p: number) => setFilters({ ...filters, page: p + 1 })}
          pageIndex={filters.page - 1}
          setPageSize={(s: any) => setFilters({ ...filters, page_size: s, page: 1 })}
          loading={loading}
        />
      </TabPanel>

      {/* ── Profit Agreements ── */}
      <TabPanel value={tabValue} index={3}>
        {tableHeader("Search profit agreements…")}
        <CustomTable
          columnShape={ProfitAgreementColumnShape(profitAgreementActions)}
          data={profitAgreements?.results || []}
          dataCount={profitAgreements?.count || 0}
          pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
          setPageIndex={(p: number) => setFilters({ ...filters, page: p + 1 })}
          pageIndex={filters.page - 1}
          setPageSize={(s: any) => setFilters({ ...filters, page_size: s, page: 1 })}
          loading={loading}
        />
      </TabPanel>

      {/* ── Margin Payouts (NEW) ── */}
      <TabPanel value={tabValue} index={4}>
        {tableHeader("Search margin payouts…")}
        <CustomTable
          columnShape={MarginPayoutColumnShape(marginPayoutActions)}
          data={marginPayouts?.results || []}
          dataCount={marginPayouts?.count || 0}
          pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
          setPageIndex={(p: any) => setFilters({ ...filters, page: p + 1 })}
          pageIndex={filters.page - 1}
          setPageSize={(s: any) => setFilters({ ...filters, page_size: s, page: 1 })}
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
    justifyContent: "space-between",
    gap: 2,
    marginBottom: 2,
  },
};

export default InvestorsAdmin;