import { debounce } from 'lodash';
import { Box, Button, SelectChangeEvent } from "@mui/material";
import { FC, useEffect, useState } from "react";
import CustomTable from "../../components/UI/CustomTable";
import SearchInput from "../../components/SearchInput";
import { IHub, IHubResults } from "./Hub.interface";
import HubColumnShape from "./HubColumnShape";
import SelectInput from "../../components/UI/FormComponents/SelectInput";
import { useModalContext } from "../../contexts/ModalDialogContext";
import useTitle from "../../hooks/useTitle";
import HubForm from "./HubForm";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import { toast } from "react-hot-toast";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { HubService } from './Hub.service';
import { INITIAL_PAGE_SIZE } from '../../api/constants';


const Hub: FC = () => {
  useTitle("Grain Hubs");
  const { setShowModal } = useModalContext();

  const [hubs, setHubs] = useState<IHubResults>();
  const [filters, setFilters] = useState<any>({})
  const [loading, setLoading] = useState<boolean>(false);
  const [editHub, setEditHub] = useState<IHub | null>(null);
  const [formType, setFormType] = useState<'Save' | 'Update'>('Save');

  useEffect(() => {
    fetchData(filters);
  }, [filters]);


  const fetchData = async (filters?: any) => {
    try {
      setLoading(true);
      const results: IHubResults = await HubService.getHubs(filters);
      setHubs(results); // Update data with results array
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };


  const handleOpenModal = () => {
    setFormType('Save');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };


  const handleEditHub = (hub: IHub) => {
    setFormType('Update');
    setEditHub(hub);
    setTimeout(() => {
      setShowModal(true);
    });
  };

  const handleRefreshData = async () => {
    fetchData(filters)
  };


  const handleDeleteHub = async (hub: IHub) => {
    try {
      await HubService.deleteHubs(hub.id)
      toast.success('Hub deleted successfully');
      handleRefreshData()
    } catch (error: any) {
      toast.error('Something went wrong');
    }
  };


  const tableActions: IDropdownAction[] = [
    {
      label: 'Edit',
      icon: <EditIcon color="primary" />,
      onClick: (hub: IHub) => handleEditHub(hub),
    },
    {
      label: 'Delete',
      icon: <DeleteIcon color="error" />,
      onClick: (hub: IHub) => handleDeleteHub(hub),
    },
  ]
  
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
          placeholder="Search Hub..." 
        />
        <Button sx={styles.createButton} variant="contained" onClick={handleOpenModal}>
          Create
        </Button>
        <HubForm callBack={handleRefreshData} formType={formType} handleClose={handleCloseModal} initialValues={editHub} />
      </Box>

      <CustomTable
        columnShape={HubColumnShape(tableActions)}
        data={hubs?.results || []}
        dataCount={hubs?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(page: number) => setFilters({...filters, page})}
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
    alignItems: "center", // This aligns items vertically
    gap: 2, // This adds consistent spacing between elements
    marginBottom: 2,
  },
  createButton: {
    marginLeft: 'auto', // This pushes the button to the right
    height: 'fit-content', // Ensures button height matches the input
  },
  pageSize: {
    maxWidth: 60,
    marginLeft: 2,
  }
}

export default Hub;
