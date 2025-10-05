import { Box, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import useTitle from "../../../hooks/useTitle";
import { useModalContext } from "../../../contexts/ModalDialogContext";
import { PaymentService } from "./Payments.service";
import { IPaymentsResults, IPayment } from "./Payments.interface";
import { IDropdownAction } from "../../../components/UI/DropdownActionBtn";
import SearchInput from "../../../components/SearchInput";
import CustomTable from "../../../components/UI/CustomTable";
import PaymentColumnShape from "./PaymentsColumnShape";
import PaymentForm from "./PaymentsForm";
import { INITIAL_PAGE_SIZE } from "../../../api/constants";

const Payments = () => {
  useTitle("Payments");
  const { setShowModal } = useModalContext();

  const [editPayment, setEditPayment] = useState<IPayment | null>(null);
  const [formType, setFormType] = useState<"Save" | "Update">("Save");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [payments, setPayments] = useState<IPaymentsResults>();
  const [filters, setFilters] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchData(filters);
  }, [filters]);

  const fetchData = async (params?: any) => {
    try {
      setLoading(true);
      const resp: IPaymentsResults = await PaymentService.getPayments(params);
      setPayments(resp);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching Payments:", error);
    }
  };

  const handleRefreshData = () => {
    fetchData(filters);
  };

  const handleOpenModal = () => {
    setFormType("Save");
    setEditPayment(null);
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

  const handleDeletePayment = async (payment: IPayment) => {
    try {
      await PaymentService.deletePayment(payment.id);
      toast.success("Payment deleted successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error("Something went wrong");
    }
  };

  const handleEditPayment = (payment: IPayment) => {
    setFormType("Update");
    setEditPayment(payment);
    setTimeout(() => setShowModal(true), 0);
  };

  const handleReconcilePayment = async (payment: IPayment) => {
    try {
      await PaymentService.reconcilePayment(payment.id);
      toast.success("Payment reconciled successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error("Something went wrong");
    }
  };

  const tableActions: IDropdownAction[] = [
    { label: "Edit", icon: <EditIcon color="primary" />, onClick: handleEditPayment },
    { label: "Reconcile", icon: <CheckCircleIcon color="primary" />, onClick: handleReconcilePayment },
    { label: "Delete", icon: <DeleteIcon color="error" />, onClick: handleDeletePayment },
  ];

  return (
    <Box pt={2} pb={4}>
      <Box sx={styles.tablePreHeader}>
        <SearchInput value={searchQuery} onChange={handleInputChange} type="text" placeholder="Search payment..." />
        <Button sx={{ marginLeft: "auto" }} variant="contained" onClick={handleOpenModal}>
          Create Payment
        </Button>
      </Box>

      <CustomTable
        columnShape={PaymentColumnShape(tableActions)}
        data={payments?.results || []}
        dataCount={payments?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(page: number) => setFilters({ ...filters, page })}
        pageIndex={filters?.page || 1}
        setPageSize={(size: number) => setFilters({ ...filters, page_size: size })}
        loading={loading}
      />

      <PaymentForm callBack={handleRefreshData} formType={formType} handleClose={handleCloseModal} initialValues={editPayment || {}} />
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

export default Payments;