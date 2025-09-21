import { debounce } from 'lodash';
import { Box, Button, SelectChangeEvent } from "@mui/material";
import { FC, useEffect, useState, useCallback } from "react";
import CustomTable from "../../components/UI/CustomTable";
import SearchInput from "../../components/SearchInput";
import { IDeposit, IDepositResults } from "./Deposit.interface";
import DepositColumnShape from "./DepositColumnShape";
import SelectInput from "../../components/UI/FormComponents/SelectInput";
import { useModalContext } from "../../contexts/ModalDialogContext";
import useTitle from "../../hooks/useTitle";
import DepositForm from "./DepositForm";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import { toast } from "react-hot-toast";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DepositService } from './Deposit.service';
import { INITIAL_PAGE_SIZE } from '../../api/constants';

// Define interfaces for your dropdown options
interface DropdownOption {
  value: string;
  label: string;
}

interface FormData {
  users: DropdownOption[];
  farmers: DropdownOption[];
  hubs: DropdownOption[];
  agents: DropdownOption[];
  grainTypes: DropdownOption[];
  qualityGrades: DropdownOption[];
}

const Deposit: FC = () => {
  useTitle("Deposits");
  const { setShowModal } = useModalContext();

  const [deposits, setDeposits] = useState<IDepositResults>();
  const [filters, setFilters] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [editDeposit, setEditDeposit] = useState<IDeposit | null>(null);
  const [formType, setFormType] = useState<'Save' | 'Update'>('Save');
  
  // Form data state
  const [formData, setFormData] = useState<FormData>({
    users: [],
    farmers: [],
    hubs: [],
    agents: [],
    grainTypes: [],
    qualityGrades: [],
  });
  const [formDataLoading, setFormDataLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchData(filters);
  }, [filters]);

  useEffect(() => {
    // Fetch form data when component mounts
    fetchFormData();
  }, []);

  const fetchData = async (filters?: any) => {
    try {
      setLoading(true);
      const results: IDepositResults = await DepositService.getDeposits(filters);
      setDeposits(results);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const fetchFormData = async () => {
    try {
      setFormDataLoading(true);
      
      // Fetch all required data concurrently
      const [
        usersResponse,
        farmersResponse,
        hubsResponse,
        agentsResponse,
        grainTypesResponse,
        qualityGradesResponse
      ] = await Promise.all([
        DepositService.getUsers(), // Assuming these methods exist in your service
        DepositService.getFarmers(),
        DepositService.getHubs(),
        DepositService.getAgents(),
        DepositService.getGrainTypes(),
        DepositService.getQualityGrades(),
      ]);

      setFormData({
        users: usersResponse.map((user: any) => ({
          value: user.id,
          label: `${user.first_name} ${user.last_name} (${user.phone_number})`
        })),
        farmers: farmersResponse.map((farmer: any) => ({
          value: farmer.id,
          label: `${farmer.first_name} ${farmer.last_name} (${farmer.phone_number})`
        })),
        hubs: hubsResponse.map((hub: any) => ({
          value: hub.id,
          label: hub.name
        })),
        agents: agentsResponse.map((agent: any) => ({
          value: agent.id,
          label: `${agent.first_name} ${agent.last_name} (${agent.phone_number})`
        })),
        grainTypes: grainTypesResponse.map((grainType: any) => ({
          value: grainType.id,
          label: grainType.name
        })),
        qualityGrades: qualityGradesResponse.map((qualityGrade: any) => ({
          value: qualityGrade.id,
          label: qualityGrade.name
        })),
      });
      
      setFormDataLoading(false);
    } catch (error) {
      console.error('Error fetching form data:', error);
      toast.error('Failed to load form data');
      setFormDataLoading(false);
    }
  };

  // Search handlers with debouncing
  const handleGrainTypeSearch = useCallback(
    debounce(async (query: string) => {
      try {
        const results = await DepositService.searchGrainTypes(query);
        setFormData(prev => ({
          ...prev,
          grainTypes: results.map((item: any) => ({
            value: item.id,
            label: item.name
          }))
        }));
      } catch (error) {
        console.error('Error searching grain types:', error);
      }
    }, 300),
    []
  );

  const handleQualityGradeSearch = useCallback(
    debounce(async (query: string) => {
      try {
        const results = await DepositService.searchQualityGrades(query);
        setFormData(prev => ({
          ...prev,
          qualityGrades: results.map((item: any) => ({
            value: item.id,
            label: item.name
          }))
        }));
      } catch (error) {
        console.error('Error searching quality grades:', error);
      }
    }, 300),
    []
  );

  const handleUserSearch = useCallback(
    debounce(async (query: string) => {
      try {
        const results = await DepositService.searchUsers(query);
        setFormData(prev => ({
          ...prev,
          users: results.map((user: any) => ({
            value: user.id,
            label: `${user.first_name} ${user.last_name} (${user.phone_number})`
          }))
        }));
      } catch (error) {
        console.error('Error searching users:', error);
      }
    }, 300),
    []
  );

  const handleFarmerSearch = useCallback(
    debounce(async (query: string) => {
      try {
        const results = await DepositService.searchFarmers(query);
        setFormData(prev => ({
          ...prev,
          farmers: results.map((farmer: any) => ({
            value: farmer.id,
            label: `${farmer.first_name} ${farmer.last_name} (${farmer.phone_number})`
          }))
        }));
      } catch (error) {
        console.error('Error searching farmers:', error);
      }
    }, 300),
    []
  );

  const handleHubSearch = useCallback(
    debounce(async (query: string) => {
      try {
        const results = await DepositService.searchHubs(query);
        setFormData(prev => ({
          ...prev,
          hubs: results.map((hub: any) => ({
            value: hub.id,
            label: hub.name
          }))
        }));
      } catch (error) {
        console.error('Error searching hubs:', error);
      }
    }, 300),
    []
  );

  const handleAgentSearch = useCallback(
    debounce(async (query: string) => {
      try {
        const results = await DepositService.searchAgents(query);
        setFormData(prev => ({
          ...prev,
          agents: results.map((agent: any) => ({
            value: agent.id,
            label: `${agent.first_name} ${agent.last_name} (${agent.phone_number})`
          }))
        }));
      } catch (error) {
        console.error('Error searching agents:', error);
      }
    }, 300),
    []
  );

  const handleOpenModal = () => {
    setFormType('Save');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleEditDeposit = (deposit: IDeposit) => {
    setFormType('Update');
    setEditDeposit(deposit);
    setTimeout(() => {
      setShowModal(true);
    });
  };

  const handleRefreshData = async () => {
    fetchData(filters);
  };

  const handleDeleteDeposit = async (deposit: IDeposit) => {
    try {
      await DepositService.deleteDeposits(deposit.id);
      toast.success('Deposit deleted successfully');
      handleRefreshData();
    } catch (error: any) {
      toast.error('Something went wrong');
    }
  };

  const tableActions: IDropdownAction[] = [
    {
      label: 'Edit',
      icon: <EditIcon color="primary" />,
      onClick: (deposit: IDeposit) => handleEditDeposit(deposit),
    },
    {
      label: 'Delete',
      icon: <DeleteIcon color="error" />,
      onClick: (deposit: IDeposit) => handleDeleteDeposit(deposit),
    },
  ];
  
  return (
    <Box pt={2} pb={4}>
      <Box sx={styles.tablePreHeader}>
        <SearchInput 
          onBlur={(event) => setFilters({ ...filters, name: event.target.value})} 
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              const target = event.target as HTMLInputElement;
              setFilters({ ...filters, name: target?.value });
            }
          }}
          type="text" 
          placeholder="Search Deposit..." 
        />
        <Button sx={styles.createButton} variant="contained" onClick={handleOpenModal}>
          Create
        </Button>
        <DepositForm 
          callBack={handleRefreshData} 
          formType={formType} 
          handleClose={handleCloseModal} 
          initialValues={editDeposit}
          // Pass all form data and search handlers
          formData={formData}
          formDataLoading={formDataLoading}
          searchHandlers={{
            handleGrainTypeSearch,
            handleQualityGradeSearch,
            handleUserSearch,
            handleFarmerSearch,
            handleHubSearch,
            handleAgentSearch,
          }}
        />
      </Box>

      <CustomTable
        columnShape={DepositColumnShape(tableActions, "id")}
        data={deposits?.results || []}
        dataCount={deposits?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(page: number) => setFilters({ ...filters, page })}
        pageIndex={filters?.page || 1}
        setPageSize={(page_size: number) => setFilters({ ...filters, page_size })}
        loading={loading}
      />
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
  createButton: {
    marginLeft: 'auto',
    height: 'fit-content',
  },
  pageSize: {
    maxWidth: 60,
    marginLeft: 2,
  }
};

export default Deposit;