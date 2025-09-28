import { Box, Button, Tabs, Tab } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import useTitle from "../../hooks/useTitle";
import { useModalContext } from "../../contexts/ModalDialogContext";
import { AccountingService } from "./Accounting.service";
import { 
  IInvoicesResults, 
  IJournalEntriesResults, 
  IBudgetsResults,
  IInvoice,
  IJournalEntry,
  IBudget,
  AccountingTabType
} from "./Accounting.interface";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import SearchInput from "../../components/SearchInput";
import CustomTable from "../../components/UI/CustomTable";
import { 
  InvoiceColumnShape, 
  JournalEntryColumnShape, 
  BudgetColumnShape 
} from "./AccountingColumnShapes";
import InvoiceForm from "./InvoiceForm";
import JournalEntryForm from "./JournalEntryForm";
import BudgetForm from "./BudgetForm";
import AgingReport from "./AgingReport";
import { INITIAL_PAGE_SIZE } from "../../api/constants";

const Accounting = () => {
  useTitle("Accounting");
  const { setShowModal } = useModalContext();

  // State for active tab
  const [activeTab, setActiveTab] = useState<AccountingTabType>('invoices');

  // State for invoices
  const [invoices, setInvoices] = useState<IInvoicesResults>();
  const [editInvoice, setEditInvoice] = useState<IInvoice | null>(null);
  const [invoiceFormType, setInvoiceFormType] = useState<"Save" | "Update">("Save");

  // State for journal entries
  const [journalEntries, setJournalEntries] = useState<IJournalEntriesResults>();
  const [editJournalEntry, setEditJournalEntry] = useState<IJournalEntry | null>(null);
  const [journalEntryFormType, setJournalEntryFormType] = useState<"Save" | "Update">("Save");

  // State for budgets
  const [budgets, setBudgets] = useState<IBudgetsResults>();
  const [editBudget, setEditBudget] = useState<IBudget | null>(null);
  const [budgetFormType, setBudgetFormType] = useState<"Save" | "Update">("Save");

  // Common state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filters, setFilters] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchData(filters);
  }, [filters, activeTab]);

  const fetchData = async (params?: any) => {
    try {
      setLoading(true);
      
      switch (activeTab) {
        case 'invoices':
          const invoiceResp: IInvoicesResults = await AccountingService.getInvoices(params);
          setInvoices(invoiceResp);
          break;
        case 'journal-entries':
          const journalResp: IJournalEntriesResults = await AccountingService.getJournalEntries(params);
          setJournalEntries(journalResp);
          break;
        case 'budgets':
          const budgetResp: IBudgetsResults = await AccountingService.getBudgets(params);
          setBudgets(budgetResp);
          break;
        case 'aging':
          // Aging report doesn't need pagination
          break;
      }
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(`Error fetching ${activeTab}:`, error);
    }
  };

  const handleRefreshData = async () => {
    await fetchData({ search: searchQuery });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: AccountingTabType) => {
    setActiveTab(newValue);
    setFilters(null);
    setSearchQuery("");
  };

  const handleOpenModal = () => {
    switch (activeTab) {
      case 'invoices':
        setInvoiceFormType("Save");
        break;
      case 'journal-entries':
        setJournalEntryFormType("Save");
        break;
      case 'budgets':
        setBudgetFormType("Save");
        break;
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditInvoice(null);
    setEditJournalEntry(null);
    setEditBudget(null);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
  };

  // Invoice handlers
  const handleDeleteInvoice = async (invoice: IInvoice) => {
    try {
      await AccountingService.deleteInvoice(invoice.id);
      toast.success("Invoice deleted successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error("Failed to delete invoice");
    }
  };

  const handleEditInvoice = (invoice: IInvoice) => {
    setInvoiceFormType("Update");
    setEditInvoice(invoice);
    setTimeout(() => {
      setShowModal(true);
    });
  };

  // Journal Entry handlers
  const handleDeleteJournalEntry = async (entry: IJournalEntry) => {
    try {
      await AccountingService.deleteJournalEntry(entry.id);
      toast.success("Journal entry deleted successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error("Failed to delete journal entry");
    }
  };

  const handleEditJournalEntry = (entry: IJournalEntry) => {
    setJournalEntryFormType("Update");
    setEditJournalEntry(entry);
    setTimeout(() => {
      setShowModal(true);
    });
  };

  // Budget handlers
  const handleDeleteBudget = async (budget: IBudget) => {
    try {
      await AccountingService.deleteBudget(budget.id);
      toast.success("Budget deleted successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error("Failed to delete budget");
    }
  };

  const handleEditBudget = (budget: IBudget) => {
    setBudgetFormType("Update");
    setEditBudget(budget);
    setTimeout(() => {
      setShowModal(true);
    });
  };

  // Table actions
  const invoiceActions: IDropdownAction[] = [
    {
      label: "Edit",
      icon: <EditIcon color="primary" />,
      onClick: (invoice: IInvoice) => handleEditInvoice(invoice),
    },
    {
      label: "Delete",
      icon: <DeleteIcon color="error" />,
      onClick: (invoice: IInvoice) => handleDeleteInvoice(invoice),
    },
  ];

  const journalEntryActions: IDropdownAction[] = [
    {
      label: "Edit",
      icon: <EditIcon color="primary" />,
      onClick: (entry: IJournalEntry) => handleEditJournalEntry(entry),
    },
    {
      label: "Delete",
      icon: <DeleteIcon color="error" />,
      onClick: (entry: IJournalEntry) => handleDeleteJournalEntry(entry),
    },
  ];

  const budgetActions: IDropdownAction[] = [
    {
      label: "Edit",
      icon: <EditIcon color="primary" />,
      onClick: (budget: IBudget) => handleEditBudget(budget),
    },
    {
      label: "Delete",
      icon: <DeleteIcon color="error" />,
      onClick: (budget: IBudget) => handleDeleteBudget(budget),
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'invoices':
        return (
          <CustomTable
            columnShape={InvoiceColumnShape(invoiceActions)}
            data={invoices?.results || []}
            dataCount={invoices?.count || 0}
            pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
            setPageIndex={(page: number) => setFilters({...filters, page})}
            pageIndex={filters?.page || 1}
            setPageSize={(size: number) => setFilters({ ...filters, page_size: size })}
            loading={loading}
          />
        );
      case 'journal-entries':
        return (
          <CustomTable
            columnShape={JournalEntryColumnShape(journalEntryActions)}
            data={journalEntries?.results || []}
            dataCount={journalEntries?.count || 0}
            pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
            setPageIndex={(page: number) => setFilters({...filters, page})}
            pageIndex={filters?.page || 1}
            setPageSize={(size: number) => setFilters({ ...filters, page_size: size })}
            loading={loading}
          />
        );
      case 'budgets':
        return (
          <CustomTable
            columnShape={BudgetColumnShape(budgetActions)}
            data={budgets?.results || []}
            dataCount={budgets?.count || 0}
            pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
            setPageIndex={(page: number) => setFilters({...filters, page})}
            pageIndex={filters?.page || 1}
            setPageSize={(size: number) => setFilters({ ...filters, page_size: size })}
            loading={loading}
          />
        );
      case 'aging':
        return <AgingReport />;
      default:
        return null;
    }
  };

  const getCreateButtonText = () => {
    switch (activeTab) {
      case 'invoices':
        return 'Create Invoice';
      case 'journal-entries':
        return 'Create Entry';
      case 'budgets':
        return 'Create Budget';
      default:
        return 'Create';
    }
  };

  const renderForms = () => {
    return (
      <>
        {/* Invoice Form */}
        {activeTab === 'invoices' && (
          <InvoiceForm
            callBack={handleRefreshData}
            formType={invoiceFormType}
            handleClose={handleCloseModal}
            initialValues={editInvoice}
          />
        )}
        
        {/* Journal Entry Form */}
        {activeTab === 'journal-entries' && (
          <JournalEntryForm
            callBack={handleRefreshData}
            formType={journalEntryFormType}
            handleClose={handleCloseModal}
            initialValues={editJournalEntry}
          />
        )}
        
        {/* Budget Form */}
        {activeTab === 'budgets' && (
          <BudgetForm
            callBack={handleRefreshData}
            formType={budgetFormType}
            handleClose={handleCloseModal}
            initialValues={editBudget}
          />
        )}
      </>
    );
  };

  return (
    <Box pt={2} pb={4}>
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="accounting tabs">
          <Tab label="Invoices" value="invoices" />
          <Tab label="Journal Entries" value="journal-entries" />
          <Tab label="Budgets" value="budgets" />
          <Tab label="Aging Report" value="aging" />
        </Tabs>
      </Box>

      {/* Search and Create Button - Hide for aging report */}
      {activeTab !== 'aging' && (
        <Box sx={styles.tablePreHeader}>
          <SearchInput
            value={searchQuery}
            onChange={handleInputChange}
            type="text"
            placeholder={`Search ${activeTab}...`}
          />

          <Button
            sx={{ marginLeft: "auto" }}
            variant="contained"
            onClick={handleOpenModal}
          >
            {getCreateButtonText()}
          </Button>
        </Box>
      )}

      {/* Content */}
      {renderTabContent()}

      {/* Forms */}
      {renderForms()}
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

export default Accounting;