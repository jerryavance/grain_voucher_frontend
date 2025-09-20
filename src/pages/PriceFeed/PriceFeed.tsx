import { debounce } from 'lodash';
import { Box, Button } from "@mui/material";
import { FC, useEffect, useState } from "react";
import CustomTable from "../../components/UI/CustomTable";
import SearchInput from "../../components/SearchInput";
import { IPriceFeed, IPriceFeedResults } from "./PriceFeed.interface";
import PriceFeedColumnShape from "./PriceFeedColumnShape";
import { useModalContext } from "../../contexts/ModalDialogContext";
import useTitle from "../../hooks/useTitle";
import PriceFeedForm from "./PriceFeedForm";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import { toast } from "react-hot-toast";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { PriceFeedService } from './PriceFeed.service';
import { HubService } from "../Hub/Hub.service";
import { GrainTypeService } from "../GrainType/GrainType.service"; // fetch grain types
import { INITIAL_PAGE_SIZE } from '../../api/constants';

const PriceFeed: FC = () => {
  useTitle("Price Feeds");
  const { setShowModal } = useModalContext();

  const [PriceFeeds, setPriceFeeds] = useState<IPriceFeedResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState<boolean>(false);
  const [editPriceFeed, setEditPriceFeed] = useState<IPriceFeed | null>(null);
  const [formType, setFormType] = useState<'Save' | 'Update'>('Save');

  const [hubOptions, setHubOptions] = useState<{ value: string; label: string }[]>([]);
  const [grainTypeOptions, setGrainTypeOptions] = useState<{ value: string; label: string }[]>([]);

  // Fetch price feeds
  const fetchData = async (filters?: any) => {
    try {
      setLoading(true);
      const results: IPriceFeedResults = await PriceFeedService.getPriceFeeds(filters);
      setPriceFeeds(results);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Failed to fetch price feeds");
    }
  };

  // Fetch hubs
  const fetchHubs = async (query: string) => {
    try {
      const response = await HubService.getHubs({ search: query });
      setHubOptions(response.results.map((hub: any) => ({
        value: hub.id,
        label: `${hub.name} : ${hub.location}`,
      })));
    } catch (error) {
      console.error("Error fetching hubs:", error);
    }
  };

  // Fetch grain types
  const fetchGrainTypes = async (query: string) => {
    try {
      const response = await GrainTypeService.getGrainTypes({ search: query });
      setGrainTypeOptions(response.results.map((type: any) => ({
        value: type.id,
        label: type.name,
      })));
    } catch (error) {
      console.error("Error fetching grain types:", error);
    }
  };

  useEffect(() => {
    fetchData(filters);
    fetchHubs("");
    fetchGrainTypes("");
  }, [filters]);

  const handleOpenModal = () => {
    setFormType('Save');
    setEditPriceFeed(null);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleEditPriceFeed = (PriceFeed: IPriceFeed) => {
    setFormType('Update');
    setEditPriceFeed(PriceFeed);
    setTimeout(() => setShowModal(true));
  };

  const handleRefreshData = () => fetchData(filters);

  const handleDeletePriceFeed = async (PriceFeed: IPriceFeed) => {
    try {
      await PriceFeedService.deletePriceFeeds(PriceFeed.id);
      toast.success('PriceFeed deleted successfully');
      handleRefreshData();
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const tableActions: IDropdownAction[] = [
    { label: 'Edit', icon: <EditIcon color="primary" />, onClick: handleEditPriceFeed },
    { label: 'Delete', icon: <DeleteIcon color="error" />, onClick: handleDeletePriceFeed },
  ];

  return (
    <Box pt={2} pb={4}>
      <Box sx={styles.tablePreHeader}>
        <SearchInput
          placeholder="Search by Hub or Grain Type..."
          onKeyUp={debounce((event: any) => {
            const value = event.target.value;
            setFilters({ ...filters, search: value, page: 1 });
          }, 500)}
        />
        <Button sx={{ marginLeft: 'auto' }} variant="contained" onClick={handleOpenModal}>
          Create
        </Button>

        <PriceFeedForm
          callBack={handleRefreshData}
          formType={formType}
          handleClose={handleCloseModal}
          initialValues={editPriceFeed}
        />
      </Box>

      <CustomTable
        columnShape={PriceFeedColumnShape(tableActions)}
        data={PriceFeeds?.results || []}
        dataCount={PriceFeeds?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: (filters?.page || 1) - 1 }}
        pageIndex={(filters?.page || 1) - 1}
        setPageIndex={(page: number) => setFilters({ ...filters, page: page + 1 })}
        setPageSize={(page_size: number) => setFilters({ ...filters, page_size })}
        loading={loading}
      />
    </Box>
  );
}

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

export default PriceFeed;
