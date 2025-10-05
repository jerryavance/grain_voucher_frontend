import { Box, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import UndoIcon from "@mui/icons-material/Undo";
import useTitle from "../../../hooks/useTitle";
import { useModalContext } from "../../../contexts/ModalDialogContext";
import { JournalEntryService } from "./JournalEntries.service";
import { IJournalEntriesResults, IJournalEntry } from "./JournalEntries.interface";
import { IDropdownAction } from "../../../components/UI/DropdownActionBtn";
import SearchInput from "../../../components/SearchInput";
import CustomTable from "../../../components/UI/CustomTable";
import JournalEntryColumnShape from "./JournalEntriesColumnShape";
import JournalEntryForm from "./JournalEntriesForm";
import { INITIAL_PAGE_SIZE } from "../../../api/constants";

const JournalEntries = () => {
  useTitle("Journal Entries");
  const { setShowModal } = useModalContext();

  const [editEntry, setEditEntry] = useState<IJournalEntry | null>(null);
  const [formType, setFormType] = useState<"Save" | "Update">("Save");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [entries, setEntries] = useState<IJournalEntriesResults>();
  const [filters, setFilters] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchData(filters);
  }, [filters]);

  const fetchData = async (params?: any) => {
    try {
      setLoading(true);
      const resp: IJournalEntriesResults = await JournalEntryService.getJournalEntries(params);
      setEntries(resp);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching Journal Entries:", error);
    }
  };

  const handleRefreshData = () => {
    fetchData(filters);
  };

  const handleOpenModal = () => {
    setFormType("Save");
    setEditEntry(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
    setFilters({ ...filters, search: value });
  };

  const handleDeleteEntry = async (entry: IJournalEntry) => {
    try {
      await JournalEntryService.deleteJournalEntry(entry.id);
      toast.success("Journal entry deleted successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error("Something went wrong");
    }
  };

  const handleEditEntry = (entry: IJournalEntry) => {
    setFormType("Update");
    setEditEntry(entry);
    setTimeout(() => setShowModal(true), 0);
  };

  const handleReverseEntry = async (entry: IJournalEntry) => {
    try {
      await JournalEntryService.reverseJournalEntry(entry.id, { reason: "Reversal requested" });
      toast.success("Journal entry reversed successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error("Something went wrong");
    }
  };

  const tableActions: IDropdownAction[] = [
    { label: "Edit", icon: <EditIcon color="primary" />, onClick: handleEditEntry },
    { label: "Reverse", icon: <UndoIcon color="warning" />, onClick: handleReverseEntry },
    { label: "Delete", icon: <DeleteIcon color="error" />, onClick: handleDeleteEntry },
  ];

  return (
    <Box pt={2} pb={4}>
      <Box sx={styles.tablePreHeader}>
        <SearchInput value={searchQuery} onChange={handleInputChange} type="text" placeholder="Search entry..." />
        <Button sx={{ marginLeft: "auto" }} variant="contained" onClick={handleOpenModal}>
          Create Entry
        </Button>
      </Box>

      <CustomTable
        columnShape={JournalEntryColumnShape(tableActions)}
        data={entries?.results || []}
        dataCount={entries?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(page: number) => setFilters({ ...filters, page })}
        pageIndex={filters?.page || 1}
        setPageSize={(size: number) => setFilters({ ...filters, page_size: size })}
        loading={loading}
      />

      <JournalEntryForm callBack={handleRefreshData} formType={formType} handleClose={handleCloseModal} initialValues={editEntry || {}} />
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

export default JournalEntries;