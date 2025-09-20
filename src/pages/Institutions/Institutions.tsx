import { debounce } from 'lodash';
import { Box, Button, SelectChangeEvent } from "@mui/material";
import { FC, useEffect, useState } from "react";
import CustomTable from "../../components/UI/CustomTable";
import SearchInput from "../../components/SearchInput";
import { IInstitutions, IInstitutionsResults } from "./Institutions.interface";
import InstitutionsColumnShape from "./InstitutionsColumnShape";
import SelectInput from "../../components/UI/FormComponents/SelectInput";
import { useModalContext } from "../../contexts/ModalDialogContext";
import useTitle from "../../hooks/useTitle";
import InstitutionsForm from "./InstitutionsForm";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import { toast } from "react-hot-toast";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { InstitutionsService } from './Institutions.service';
import { INITIAL_PAGE_SIZE } from '../../api/constants';


const Institutions: FC = () => {
  useTitle("Institutions");
  const { setShowModal } = useModalContext();

  const [institutions, setInstitutions] = useState<IInstitutionsResults>();
  const [filters, setFilters] = useState<any>({})
  const [loading, setLoading] = useState<boolean>(false);
  const [editInstitutions, setEditInstitutions] = useState<IInstitutions | null>(null);
  const [formType, setFormType] = useState<'Save' | 'Update'>('Save');

  useEffect(() => {
    fetchData(filters);
  }, [filters]);


  const fetchData = async (filters?: any) => {
    try {
      setLoading(true);
      const results: IInstitutionsResults = await InstitutionsService.getInstitutions(filters);
      setInstitutions(results); // results.results is an object containing institutions array
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


  const handleEditInstitutions = (institutions: IInstitutions) => {
    setFormType('Update');
    setEditInstitutions(institutions);
    setTimeout(() => {
      setShowModal(true);
    });
  };

  const handleRefreshData = async () => {
    fetchData(filters)
  };


  const handleDeleteInstitutions = async (institutions: IInstitutions) => {
    try {
      await InstitutionsService.deleteInstitutions(institutions.id)
      toast.success('Institutions deleted successfully');
      handleRefreshData()
    } catch (error: any) {
      toast.error('Something went wrong');
    }
  };


  const tableActions: IDropdownAction[] = [
    {
      label: 'Edit',
      icon: <EditIcon color="primary" />,
      onClick: (institutions: IInstitutions) => handleEditInstitutions(institutions),
    },
    {
      label: 'Delete',
      icon: <DeleteIcon color="error" />,
      onClick: (institutions: IInstitutions) => handleDeleteInstitutions(institutions),
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
          placeholder="Search Institutions..." 
        />
        <Button sx={{ marginLeft: 'auto' }} variant="contained" onClick={handleOpenModal}>
          Create Institutions
        </Button>
        <InstitutionsForm callBack={handleRefreshData} formType={formType} handleClose={handleCloseModal} initailValues={editInstitutions} />
      </Box>

      <CustomTable
        columnShape={InstitutionsColumnShape(tableActions)}
        data={institutions?.results?.institutions || []}  // access the array correctly
        dataCount={institutions?.count || 0}
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
    marginBottom: 2,
  },
  pageSize: {
    maxWidth: 60,
    marginLeft: 2,
  }
}

export default Institutions;
