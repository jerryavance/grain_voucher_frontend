// CRM.tsx
import { Box, Button, Tabs, Tab, Badge } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import useTitle from "../../hooks/useTitle";
import { useModalContext } from "../../contexts/ModalDialogContext";
import { CRMService } from "./CRM.service";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import SearchInput from "../../components/SearchInput";
import CustomTable from "../../components/UI/CustomTable";
import { 
  LeadColumnShape, 
  AccountColumnShape, 
  ContactColumnShape, 
  OpportunityColumnShape, 
  ContractColumnShape 
} from "./CRMColumnShapes";
import { 
  LeadForm, 
  AccountForm, 
  ContactForm, 
  OpportunityForm, 
  ContractForm 
} from "./CRMForms";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import {
  CRMTabType,
  ICRMTabData,
  ILead,
  IAccount,
  IContact,
  IOpportunity,
  IContract,
  ILeadsResults,
  IAccountsResults,
  IContactsResults,
  IOpportunitiesResults,
  IContractsResults,
} from "./CRM.interface";

const CRM = () => {
  useTitle("CRM");
  const { setShowModal } = useModalContext();

  // State management
  const [activeTab, setActiveTab] = useState<CRMTabType>('leads');
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filters, setFilters] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);

  // Form states
  const [editItem, setEditItem] = useState<any>(null);
  const [formType, setFormType] = useState<"Save" | "Update">("Save");

  // Data states
  const [leadsData, setLeadsData] = useState<ILeadsResults>();
  const [accountsData, setAccountsData] = useState<IAccountsResults>();
  const [contactsData, setContactsData] = useState<IContactsResults>();
  const [opportunitiesData, setOpportunitiesData] = useState<IOpportunitiesResults>();
  const [contractsData, setContractsData] = useState<IContractsResults>();

  // Tab configuration
  const tabs: ICRMTabData[] = [
    { label: 'Leads', value: 'leads', count: leadsData?.count },
    { label: 'Accounts', value: 'accounts', count: accountsData?.count },
    { label: 'Contacts', value: 'contacts', count: contactsData?.count },
    { label: 'Opportunities', value: 'opportunities', count: opportunitiesData?.count },
    { label: 'Contracts', value: 'contracts', count: contractsData?.count },
  ];

  useEffect(() => {
    fetchData(activeTab, filters);
  }, [activeTab, filters]);

  const fetchData = async (tab: CRMTabType, params?: any) => {
    try {
      setLoading(true);
      const searchParams = searchQuery ? { search: searchQuery, ...params } : params;
      
      switch (tab) {
        case 'leads':
          const leadsResp = await CRMService.getLeads(searchParams);
          setLeadsData(leadsResp);
          break;
        case 'accounts':
          const accountsResp = await CRMService.getAccounts(searchParams);
          setAccountsData(accountsResp);
          break;
        case 'contacts':
          const contactsResp = await CRMService.getContacts(searchParams);
          setContactsData(contactsResp);
          break;
        case 'opportunities':
          const opportunitiesResp = await CRMService.getOpportunities(searchParams);
          setOpportunitiesData(opportunitiesResp);
          break;
        case 'contracts':
          const contractsResp = await CRMService.getContracts(searchParams);
          setContractsData(contractsResp);
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${tab}:`, error);
      toast.error(`Failed to fetch ${tab}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshData = () => {
    fetchData(activeTab, filters);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: CRMTabType) => {
    setActiveTab(newValue);
    setSearchQuery("");
    setFilters({});
  };

  const handleOpenModal = () => {
    setFormType("Save");
    setEditItem(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditItem(null);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
    
    // Debounce search
    const timer = setTimeout(() => {
      fetchData(activeTab, { ...filters, search: value });
    }, 500);
    
    return () => clearTimeout(timer);
  };

  const handleEditItem = (item: any) => {
    setFormType("Update");
    setEditItem(item);
    setTimeout(() => {
      setShowModal(true);
    });
  };

  const handleDeleteItem = async (item: any) => {
    try {
      switch (activeTab) {
        case 'leads':
          await CRMService.deleteLead(item.id);
          break;
        case 'accounts':
          await CRMService.deleteAccount(item.id);
          break;
        case 'contacts':
          await CRMService.deleteContact(item.id);
          break;
        case 'opportunities':
          await CRMService.deleteOpportunity(item.id);
          break;
        case 'contracts':
          await CRMService.deleteContract(item.id);
          break;
      }
      toast.success(`${activeTab.slice(0, -1)} deleted successfully`);
      handleRefreshData();
    } catch (error: any) {
      toast.error("Failed to delete item");
    }
  };

  const handleQualifyLead = async (lead: ILead) => {
    try {
      await CRMService.qualifyLead(lead.id);
      toast.success("Lead qualified successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error("Failed to qualify lead");
    }
  };

  const handleExecuteContract = async (contract: IContract) => {
    try {
      await CRMService.executeContract(contract.id);
      toast.success("Contract executed successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error("Failed to execute contract");
    }
  };

  // Get table actions based on active tab
  const getTableActions = (): IDropdownAction[] => {
    const commonActions: IDropdownAction[] = [
      {
        label: "Edit",
        icon: <EditIcon color="primary" />,
        onClick: (item: any) => handleEditItem(item),
      },
      {
        label: "Delete",
        icon: <DeleteIcon color="error" />,
        onClick: (item: any) => handleDeleteItem(item),
      },
    ];

    switch (activeTab) {
      case 'leads':
        return [
          {
            label: "Qualify",
            icon: <CheckCircleIcon color="success" />,
            onClick: (item: ILead) => {
              if (item.status === 'new') {
                handleQualifyLead(item);
              } else {
                toast.error("Only new leads can be qualified");
              }
            },
          },
          ...commonActions,
        ];
      case 'contracts':
        return [
          {
            label: "Execute",
            icon: <PlayArrowIcon color="warning" />,
            onClick: (item: IContract) => {
              if (item.status === 'signed') {
                handleExecuteContract(item);
              } else {
                toast.error("Only signed contracts can be executed");
              }
            },
          },
          ...commonActions,
        ];
      default:
        return commonActions;
    }
  };

  // Get current data and column shape based on active tab
  const getCurrentTableData = () => {
    switch (activeTab) {
      case 'leads':
        return {
          data: leadsData?.results || [],
          count: leadsData?.count || 0,
          columnShape: LeadColumnShape(getTableActions()),
        };
      case 'accounts':
        return {
          data: accountsData?.results || [],
          count: accountsData?.count || 0,
          columnShape: AccountColumnShape(getTableActions()),
        };
      case 'contacts':
        return {
          data: contactsData?.results || [],
          count: contactsData?.count || 0,
          columnShape: ContactColumnShape(getTableActions()),
        };
      case 'opportunities':
        return {
          data: opportunitiesData?.results || [],
          count: opportunitiesData?.count || 0,
          columnShape: OpportunityColumnShape(getTableActions()),
        };
      case 'contracts':
        return {
          data: contractsData?.results || [],
          count: contractsData?.count || 0,
          columnShape: ContractColumnShape(getTableActions()),
        };
      default:
        return { data: [], count: 0, columnShape: [] };
    }
  };

  const getCurrentForm = () => {
    switch (activeTab) {
      case 'leads':
        return (
          <LeadForm
            callBack={handleRefreshData}
            formType={formType}
            handleClose={handleCloseModal}
            initialValues={editItem}
          />
        );
      case 'accounts':
        return (
          <AccountForm
            callBack={handleRefreshData}
            formType={formType}
            handleClose={handleCloseModal}
            initialValues={editItem}
          />
        );
      case 'contacts':
        return (
          <ContactForm
            callBack={handleRefreshData}
            formType={formType}
            handleClose={handleCloseModal}
            initialValues={editItem}
          />
        );
      case 'opportunities':
        return (
          <OpportunityForm
            callBack={handleRefreshData}
            formType={formType}
            handleClose={handleCloseModal}
            initialValues={editItem}
          />
        );
      case 'contracts':
        return (
          <ContractForm
            callBack={handleRefreshData}
            formType={formType}
            handleClose={handleCloseModal}
            initialValues={editItem}
          />
        );
      default:
        return null;
    }
  };

  const tableData = getCurrentTableData();

  return (
    <Box pt={2} pb={4}>
      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="CRM tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              label={
                <Badge
                  badgeContent={tab.count}
                  color="primary"
                  invisible={!tab.count}
                >
                  {tab.label}
                </Badge>
              }
              value={tab.value}
            />
          ))}
        </Tabs>
      </Box>

      {/* Table Header Controls */}
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
          Create {activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)}
        </Button>
      </Box>

      {/* Data Table */}
      <CustomTable
        columnShape={tableData.columnShape}
        data={tableData.data}
        dataCount={tableData.count}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(page: number) => setFilters({ ...filters, page })}
        pageIndex={filters?.page || 1}
        setPageSize={(size: number) => setFilters({ ...filters, page_size: size })}
        loading={loading}
      />

      {/* Forms */}
      {getCurrentForm()}
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

export default CRM;