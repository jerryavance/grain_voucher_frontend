import { debounce } from 'lodash';
import { Box, Button, SelectChangeEvent } from "@mui/material";
import { FC, useEffect, useState } from "react";
import CustomTable from "../../components/UI/CustomTable";
import SearchInput from "../../components/SearchInput";
import { IInventories, IInventoriesResults } from "./Inventories.interface";
import InventoriesColumnShape from "./InventoriesColumnShape";
import SelectInput from "../../components/UI/FormComponents/SelectInput";
import { useModalContext } from "../../contexts/ModalDialogContext";
import useTitle from "../../hooks/useTitle";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import { toast } from "react-hot-toast";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { InventoriesService } from './Inventories.service';
import { INITIAL_PAGE_SIZE } from '../../api/constants';


const Inventories: FC = () => {
  useTitle("Grain Inventories");
  const { setShowModal } = useModalContext();

  const [inventories, setInventories] = useState<IInventoriesResults>();
  const [filters, setFilters] = useState<any>({})
  const [loading, setLoading] = useState<boolean>(false);
  const [editInventories, setEditInventories] = useState<IInventories | null>(null);
  const [formType, setFormType] = useState<'Save' | 'Update'>('Save');

  useEffect(() => {
    fetchData(filters);
  }, [filters]);


  const fetchData = async (filters?: any) => {
    try {
      setLoading(true);
      const results: IInventoriesResults = await InventoriesService.getInventories(filters);
      setInventories(results); // Update data with results array
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


  const handleEditInventories = (inventories: IInventories) => {
    setFormType('Update');
    setEditInventories(inventories);
    setTimeout(() => {
      setShowModal(true);
    });
  };

  const handleRefreshData = async () => {
    fetchData(filters)
  };


  const handleDeleteInventories = async (inventories: IInventories) => {
    try {
      await InventoriesService.deleteInventories(inventories.id)
      toast.success('Inventories deleted successfully');
      handleRefreshData()
    } catch (error: any) {
      toast.error('Something went wrong');
    }
  };


  const tableActions: IDropdownAction[] = [
    {
      label: 'Edit',
      icon: <EditIcon color="primary" />,
      onClick: (inventories: IInventories) => handleEditInventories(inventories),
    },
    {
      label: 'Delete',
      icon: <DeleteIcon color="error" />,
      onClick: (inventories: IInventories) => handleDeleteInventories(inventories),
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
          placeholder="Search Inventories..." 
        />
      </Box>

      <CustomTable
        columnShape={InventoriesColumnShape(tableActions)}
        data={inventories?.results || []}
        dataCount={inventories?.count || 0}
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

export default Inventories;
