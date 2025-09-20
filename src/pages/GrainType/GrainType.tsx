import { debounce } from 'lodash';
import { Box, Button, SelectChangeEvent } from "@mui/material";
import { FC, useEffect, useState } from "react";
import CustomTable from "../../components/UI/CustomTable";
import SearchInput from "../../components/SearchInput";
import { IGrainType, IGrainTypeResults } from "./GrainType.interface";
import GrainTypeColumnShape from "./GrainTypeColumnShape";
import SelectInput from "../../components/UI/FormComponents/SelectInput";
import { useModalContext } from "../../contexts/ModalDialogContext";
import useTitle from "../../hooks/useTitle";
import GrainTypeForm from "./GrainTypeForm";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import { toast } from "react-hot-toast";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { GrainTypeService } from './GrainType.service';
import { INITIAL_PAGE_SIZE } from '../../api/constants';


const GrainType: FC = () => {
  useTitle("Grain Type");
  const { setShowModal } = useModalContext();

  const [GrainTypes, setGrainTypes] = useState<IGrainTypeResults>();
  const [filters, setFilters] = useState<any>({})
  const [loading, setLoading] = useState<boolean>(false);
  const [editGrainType, setEditGrainType] = useState<IGrainType | null>(null);
  const [formType, setFormType] = useState<'Save' | 'Update'>('Save');

  useEffect(() => {
    fetchData(filters);
  }, [filters]);


  const fetchData = async (filters?: any) => {
    try {
      setLoading(true);
      const results: IGrainTypeResults = await GrainTypeService.getGrainTypes(filters);
      setGrainTypes(results); // Update data with results array
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


  const handleEditGrainType = (GrainType: IGrainType) => {
    setFormType('Update');
    setEditGrainType(GrainType);
    setTimeout(() => {
      setShowModal(true);
    });
  };

  const handleRefreshData = async () => {
    fetchData(filters)
  };


  const handleDeleteGrainType = async (GrainType: IGrainType) => {
    try {
      await GrainTypeService.deleteGrainTypes(GrainType.id)
      toast.success('Quality Grade deleted successfully');
      handleRefreshData()
    } catch (error: any) {
      toast.error('Something went wrong');
    }
  };


  const tableActions: IDropdownAction[] = [
    {
      label: 'Edit',
      icon: <EditIcon color="primary" />,
      onClick: (GrainType: IGrainType) => handleEditGrainType(GrainType),
    },
    {
      label: 'Delete',
      icon: <DeleteIcon color="error" />,
      onClick: (GrainType: IGrainType) => handleDeleteGrainType(GrainType),
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
          placeholder="Search Quality Grade..." 
        />
        <Button sx={{ marginLeft: 'auto' }} variant="contained" onClick={handleOpenModal}>
          Create
        </Button>
        <GrainTypeForm callBack={handleRefreshData} formType={formType} handleClose={handleCloseModal} initialValues={editGrainType} />
      </Box>

      <CustomTable
        columnShape={GrainTypeColumnShape(tableActions)}
        data={GrainTypes?.results || []}
        dataCount={GrainTypes?.count || 0}
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
}

export default GrainType;
