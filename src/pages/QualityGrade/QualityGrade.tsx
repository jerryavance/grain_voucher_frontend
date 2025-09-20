import { debounce } from 'lodash';
import { Box, Button, SelectChangeEvent } from "@mui/material";
import { FC, useEffect, useState } from "react";
import CustomTable from "../../components/UI/CustomTable";
import SearchInput from "../../components/SearchInput";
import { IQualityGrade, IQualityGradeResults } from "./QualityGrade.interface";
import QualityGradeColumnShape from "./QualityGradeColumnShape";
import SelectInput from "../../components/UI/FormComponents/SelectInput";
import { useModalContext } from "../../contexts/ModalDialogContext";
import useTitle from "../../hooks/useTitle";
import QualityGradeForm from "./QualityGradeForm";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import { toast } from "react-hot-toast";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { QualityGradeService } from './QualityGrade.service';
import { INITIAL_PAGE_SIZE } from '../../api/constants';


const QualityGrade: FC = () => {
  useTitle("Quality Grades");
  const { setShowModal } = useModalContext();

  const [QualityGrades, setQualityGrades] = useState<IQualityGradeResults>();
  const [filters, setFilters] = useState<any>({})
  const [loading, setLoading] = useState<boolean>(false);
  const [editQualityGrade, setEditQualityGrade] = useState<IQualityGrade | null>(null);
  const [formType, setFormType] = useState<'Save' | 'Update'>('Save');

  useEffect(() => {
    fetchData(filters);
  }, [filters]);


  const fetchData = async (filters?: any) => {
    try {
      setLoading(true);
      const results: IQualityGradeResults = await QualityGradeService.getQualityGrades(filters);
      setQualityGrades(results); // Update data with results array
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


  const handleEditQualityGrade = (QualityGrade: IQualityGrade) => {
    setFormType('Update');
    setEditQualityGrade(QualityGrade);
    setTimeout(() => {
      setShowModal(true);
    });
  };

  const handleRefreshData = async () => {
    fetchData(filters)
  };


  const handleDeleteQualityGrade = async (QualityGrade: IQualityGrade) => {
    try {
      await QualityGradeService.deleteQualityGrades(QualityGrade.id)
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
      onClick: (QualityGrade: IQualityGrade) => handleEditQualityGrade(QualityGrade),
    },
    {
      label: 'Delete',
      icon: <DeleteIcon color="error" />,
      onClick: (QualityGrade: IQualityGrade) => handleDeleteQualityGrade(QualityGrade),
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
        <QualityGradeForm callBack={handleRefreshData} formType={formType} handleClose={handleCloseModal} initialValues={editQualityGrade} />
      </Box>

      <CustomTable
        columnShape={QualityGradeColumnShape(tableActions)}
        data={QualityGrades?.results || []}
        dataCount={QualityGrades?.count || 0}
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

export default QualityGrade;
