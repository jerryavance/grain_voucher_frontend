import { Box, Button, Chip, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AddIcon from "@mui/icons-material/Add";
import useTitle from "../../../hooks/useTitle";
import { useModalContext } from "../../../contexts/ModalDialogContext";
import { InvoiceService } from "./Invoices.service";
import { IInvoicesResults, IInvoice, IInvoiceSummary } from "./Invoices.interface";
import { IDropdownAction } from "../../../components/UI/DropdownActionBtn";
import SearchInput from "../../../components/SearchInput";
import CustomTable from "../../../components/UI/CustomTable";
import InvoiceColumnShape from "./InvoicesColumnShape";
import ManualInvoiceForm from "./ManualInvoiceForm";
import { INITIAL_PAGE_SIZE } from "../../../api/constants";

const Invoices = () => {
  useTitle("Invoices");
  const navigate = useNavigate();
  const { setShowModal, showModal } = useModalContext();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [invoices, setInvoices] = useState<IInvoicesResults>();
  const [summary, setSummary] = useState<IInvoiceSummary | null>(null);
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchData(filters);
    fetchSummary();
  }, [filters]);

  const fetchData = async (params?: any) => {
    try {
      setLoading(true);
      const resp: IInvoicesResults = await InvoiceService.getInvoices(params);
      setInvoices(resp);
    } catch (error) {
      console.error("Error fetching Invoices:", error);
      toast.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const resp = await InvoiceService.getSummary();
      setSummary(resp);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const handleRefreshData = () => {
    fetchData(filters);
    fetchSummary();
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
    setFilters({ ...filters, search: value, page: 1 });
  };

  const handleDeleteInvoice = async (invoice: IInvoice) => {
    if (!window.confirm(`Are you sure you want to delete invoice ${invoice.invoice_number}?`)) {
      return;
    }

    try {
      await InvoiceService.deleteInvoice(invoice.id);
      toast.success("Invoice deleted successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete invoice");
    }
  };

  const handleFinalizeInvoice = async (invoice: IInvoice) => {
    if (invoice.status !== "draft") {
      toast.error("Only draft invoices can be finalized");
      return;
    }

    try {
      await InvoiceService.finalizeInvoice(invoice.id);
      toast.success("Invoice finalized successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to finalize invoice");
    }
  };

  const handleSendInvoice = async (invoice: IInvoice) => {
    try {
      await InvoiceService.sendInvoice(invoice.id);
      toast.success("Invoice sent successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to send invoice");
    }
  };

  const handleSendReminder = async (invoice: IInvoice) => {
    try {
      await InvoiceService.sendReminder(invoice.id);
      toast.success("Payment reminder sent successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to send reminder");
    }
  };

  const handleCancelInvoice = async (invoice: IInvoice) => {
    const reason = window.prompt("Please provide a reason for cancellation:");
    if (!reason) return;

    try {
      await InvoiceService.cancelInvoice(invoice.id, reason);
      toast.success("Invoice cancelled successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to cancel invoice");
    }
  };

  const handleViewDetails = (invoice: IInvoice) => {
    navigate(`/admin/accounting/invoices/details/${invoice.id}`);
  };

  const handleViewAging = () => {
    navigate("/admin/accounting/invoices/aging");
  };

  const tableActions: IDropdownAction[] = [
    { 
      label: "View Details", 
      icon: <AssessmentIcon color="primary" />, 
      onClick: handleViewDetails 
    },
    { 
      label: "Finalize", 
      icon: <CheckCircleIcon color="success" />, 
      onClick: handleFinalizeInvoice,
      condition: (invoice: IInvoice) => invoice.status === "draft"
    },
    { 
      label: "Send Invoice", 
      icon: <SendIcon color="primary" />, 
      onClick: handleSendInvoice,
      condition: (invoice: IInvoice) => ["draft", "issued"].includes(invoice.status)
    },
    { 
      label: "Send Reminder", 
      icon: <SendIcon color="warning" />, 
      onClick: handleSendReminder,
      condition: (invoice: IInvoice) => invoice.payment_status !== "paid"
    },
    { 
      label: "Cancel", 
      icon: <CancelIcon color="error" />, 
      onClick: handleCancelInvoice,
      condition: (invoice: IInvoice) => !["paid", "cancelled", "written_off"].includes(invoice.status)
    },
    { 
      label: "Delete", 
      icon: <DeleteIcon color="error" />, 
      onClick: handleDeleteInvoice,
      condition: (invoice: IInvoice) => invoice.status === "draft"
    },
  ];

  const handleFilterByStatus = (status: string) => {
    setFilters({ ...filters, status, page: 1 });
  };

  return (
    <Box pt={2} pb={4}>
      {/* Summary Cards */}
      {summary && (
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip
              label={`Total: ${summary.summary.total_invoices}`}
              color="default"
              onClick={() => setFilters({ page: 1, page_size: INITIAL_PAGE_SIZE })}
              sx={{ cursor: "pointer" }}
            />
            <Chip
              label={`Outstanding: UGX ${summary.summary.total_due?.toFixed(2) || 0}`}
              color="warning"
              onClick={() => handleFilterByStatus("overdue")}
              sx={{ cursor: "pointer" }}
            />
            <Chip
              label={`Paid: UGX ${summary.summary.total_paid?.toFixed(2) || 0}`}
              color="success"
              onClick={() => handleFilterByStatus("paid")}
              sx={{ cursor: "pointer" }}
            />
            <Chip
              label={`Draft: ${summary.by_status.find(s => s.status === "draft")?.count || 0}`}
              color="info"
              onClick={() => handleFilterByStatus("draft")}
              sx={{ cursor: "pointer" }}
            />
          </Stack>
        </Box>
      )}

      {/* Search and Actions */}
      <Box sx={styles.tablePreHeader}>
        <SearchInput 
          value={searchQuery} 
          onChange={handleInputChange} 
          type="text" 
          placeholder="Search invoices..." 
        />
        <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
          <Button 
            variant="outlined" 
            startIcon={<AssessmentIcon />}
            onClick={handleViewAging}
          >
            Aging Report
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
          >
            Create Invoice
          </Button>
        </Box>
      </Box>

      {/* Filter Chips */}
      {filters.status && (
        <Box sx={{ mb: 2 }}>
          <Chip
            label={`Status: ${filters.status}`}
            onDelete={() => {
              const newFilters = { ...filters };
              delete newFilters.status;
              setFilters(newFilters);
            }}
            color="primary"
          />
        </Box>
      )}

      {/* Invoices Table */}
      <CustomTable
        columnShape={InvoiceColumnShape(tableActions)}
        data={invoices?.results || []}
        dataCount={invoices?.count || 0}
        pageInitialState={{ pageSize: filters.page_size, pageIndex: filters.page - 1 }}
        setPageIndex={(page: number) => setFilters({ ...filters, page: page + 1 })}
        pageIndex={filters.page - 1}
        setPageSize={(size: number) => setFilters({ ...filters, page_size: size, page: 1 })}
        loading={loading}
      />

      {/* Manual Invoice Creation Modal */}
      {showModal && (
        <ManualInvoiceForm 
          callBack={handleRefreshData} 
          handleClose={handleCloseModal}
        />
      )}
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
















// import { Box, Button } from "@mui/material";
// import { useEffect, useState } from "react";
// import { toast } from "react-hot-toast";
// import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
// import SendIcon from "@mui/icons-material/Send";
// import useTitle from "../../../hooks/useTitle";
// import { useModalContext } from "../../../contexts/ModalDialogContext";
// import { InvoiceService } from "./Invoices.service";
// import { IInvoicesResults, IInvoice } from "./Invoices.interface";
// import { IDropdownAction } from "../../../components/UI/DropdownActionBtn";
// import SearchInput from "../../../components/SearchInput";
// import CustomTable from "../../../components/UI/CustomTable";
// import InvoiceColumnShape from "./InvoicesColumnShape";
// import InvoiceForm from "./InvoicesForm";
// import { INITIAL_PAGE_SIZE } from "../../../api/constants";

// const Invoices = () => {
//   useTitle("Invoices");
//   const { setShowModal } = useModalContext();

//   const [editInvoice, setEditInvoice] = useState<IInvoice | null>(null);
//   const [formType, setFormType] = useState<"Save" | "Update">("Save");
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [invoices, setInvoices] = useState<IInvoicesResults>();
//   const [filters, setFilters] = useState<any>(null);
//   const [loading, setLoading] = useState<boolean>(false);

//   useEffect(() => {
//     fetchData(filters);
//   }, [filters]);

//   const fetchData = async (params?: any) => {
//     try {
//       setLoading(true);
//       const resp: IInvoicesResults = await InvoiceService.getInvoices(params);
//       setInvoices(resp);
//       setLoading(false);
//     } catch (error) {
//       setLoading(false);
//       console.error("Error fetching Invoices:", error);
//     }
//   };

//   const handleRefreshData = () => {
//     fetchData(filters);
//   };

//   const handleOpenModal = () => {
//     setFormType("Save");
//     setEditInvoice(null);
//     setShowModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//   };

//   const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const value = event.target.value;
//     setSearchQuery(value);
//     setFilters({ ...filters, search: value });
//   };

//   const handleDeleteInvoice = async (invoice: IInvoice) => {
//     try {
//       await InvoiceService.deleteInvoice(invoice.id);
//       toast.success("Invoice deleted successfully");
//       handleRefreshData();
//     } catch (error: any) {
//       toast.error("Something went wrong");
//     }
//   };

//   const handleEditInvoice = (invoice: IInvoice) => {
//     setFormType("Update");
//     setEditInvoice(invoice);
//     setTimeout(() => setShowModal(true), 0);
//   };

//   const handleSendInvoice = async (invoice: IInvoice) => {
//     try {
//       await InvoiceService.sendInvoice(invoice.id);
//       toast.success("Invoice sent successfully");
//       handleRefreshData();
//     } catch (error: any) {
//       toast.error("Something went wrong");
//     }
//   };

//   const tableActions: IDropdownAction[] = [
//     { label: "Edit", icon: <EditIcon color="primary" />, onClick: handleEditInvoice },
//     { label: "Send", icon: <SendIcon color="primary" />, onClick: handleSendInvoice },
//     { label: "Delete", icon: <DeleteIcon color="error" />, onClick: handleDeleteInvoice },
//   ];

//   return (
//     <Box pt={2} pb={4}>
//       <Box sx={styles.tablePreHeader}>
//         <SearchInput value={searchQuery} onChange={handleInputChange} type="text" placeholder="Search invoice..." />
//         <Button sx={{ marginLeft: "auto" }} variant="contained" onClick={handleOpenModal}>
//           Create Invoice
//         </Button>
//       </Box>

//       <CustomTable
//         columnShape={InvoiceColumnShape(tableActions)}
//         data={invoices?.results || []}
//         dataCount={invoices?.count || 0}
//         pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
//         setPageIndex={(page: number) => setFilters({ ...filters, page })}
//         pageIndex={filters?.page || 1}
//         setPageSize={(size: number) => setFilters({ ...filters, page_size: size })}
//         loading={loading}
//       />

//       <InvoiceForm callBack={handleRefreshData} formType={formType} handleClose={handleCloseModal} initialValues={editInvoice || {}} />
//     </Box>
//   );
// };

// const styles = {
//   tablePreHeader: {
//     display: "flex",
//     alignItems: "center",
//     gap: 2,
//     marginBottom: 2,
//   },
// };

// export default Invoices;