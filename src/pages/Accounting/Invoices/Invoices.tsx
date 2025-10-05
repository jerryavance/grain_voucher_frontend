import { Box, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import useTitle from "../../../hooks/useTitle";
import { useModalContext } from "../../../contexts/ModalDialogContext";
import { InvoiceService } from "./Invoices.service";
import { IInvoicesResults, IInvoice } from "./Invoices.interface";
import { IDropdownAction } from "../../../components/UI/DropdownActionBtn";
import SearchInput from "../../../components/SearchInput";
import CustomTable from "../../../components/UI/CustomTable";
import InvoiceColumnShape from "./InvoicesColumnShape";
import InvoiceForm from "./InvoicesForm";
import { INITIAL_PAGE_SIZE } from "../../../api/constants";

const Invoices = () => {
  useTitle("Invoices");
  const { setShowModal } = useModalContext();

  const [editInvoice, setEditInvoice] = useState<IInvoice | null>(null);
  const [formType, setFormType] = useState<"Save" | "Update">("Save");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [invoices, setInvoices] = useState<IInvoicesResults>();
  const [filters, setFilters] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchData(filters);
  }, [filters]);

  const fetchData = async (params?: any) => {
    try {
      setLoading(true);
      const resp: IInvoicesResults = await InvoiceService.getInvoices(params);
      setInvoices(resp);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching Invoices:", error);
    }
  };

  const handleRefreshData = () => {
    fetchData(filters);
  };

  const handleOpenModal = () => {
    setFormType("Save");
    setEditInvoice(null);
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

  const handleDeleteInvoice = async (invoice: IInvoice) => {
    try {
      await InvoiceService.deleteInvoice(invoice.id);
      toast.success("Invoice deleted successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error("Something went wrong");
    }
  };

  const handleEditInvoice = (invoice: IInvoice) => {
    setFormType("Update");
    setEditInvoice(invoice);
    setTimeout(() => setShowModal(true), 0);
  };

  const handleSendInvoice = async (invoice: IInvoice) => {
    try {
      await InvoiceService.sendInvoice(invoice.id);
      toast.success("Invoice sent successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error("Something went wrong");
    }
  };

  const tableActions: IDropdownAction[] = [
    { label: "Edit", icon: <EditIcon color="primary" />, onClick: handleEditInvoice },
    { label: "Send", icon: <SendIcon color="primary" />, onClick: handleSendInvoice },
    { label: "Delete", icon: <DeleteIcon color="error" />, onClick: handleDeleteInvoice },
  ];

  return (
    <Box pt={2} pb={4}>
      <Box sx={styles.tablePreHeader}>
        <SearchInput value={searchQuery} onChange={handleInputChange} type="text" placeholder="Search invoice..." />
        <Button sx={{ marginLeft: "auto" }} variant="contained" onClick={handleOpenModal}>
          Create Invoice
        </Button>
      </Box>

      <CustomTable
        columnShape={InvoiceColumnShape(tableActions)}
        data={invoices?.results || []}
        dataCount={invoices?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(page: number) => setFilters({ ...filters, page })}
        pageIndex={filters?.page || 1}
        setPageSize={(size: number) => setFilters({ ...filters, page_size: size })}
        loading={loading}
      />

      <InvoiceForm callBack={handleRefreshData} formType={formType} handleClose={handleCloseModal} initialValues={editInvoice || {}} />
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

export default Invoices;