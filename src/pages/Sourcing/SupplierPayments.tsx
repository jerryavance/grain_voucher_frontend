/**
 * SupplierPayments.tsx — FIXED
 * - Payment # clickable (navigates to detail)
 * - Added receipt PDF column
 * - Added ExportButtons + DateRangeFilter
 * - Fixed: Processed By and Method display issues resolved via AllColumnShapes
 */

import { Box, Button, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { Key, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddIcon from "@mui/icons-material/Add";
import useTitle from "../../hooks/useTitle";
import { useModalContext } from "../../contexts/ModalDialogContext";
import { SourcingService } from "./Sourcing.service";
import { ISupplierPayment, ISupplierPaymentsResults } from "./Sourcing.interface";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import SearchInput from "../../components/SearchInput";
import CustomTable from "../../components/UI/CustomTable";
import { SupplierPaymentColumnShape } from "./AllColumnShapes";
import { SupplierPaymentForm } from "./SupplierPaymentForm";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import { PAYMENT_STATUS_OPTIONS } from "./SourcingConstants";
import { ExportButtons, SUPPLIER_PAYMENT_EXPORT_COLUMNS } from "./ExportUtils";
import DateRangeFilter from "./DateRangeFilter";

const SupplierPayments = () => {
  useTitle("Supplier Payments");
  const navigate = useNavigate();
  const { setShowModal } = useModalContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [payments, setPayments] = useState<ISupplierPaymentsResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchData(filters); }, [filters]);

  const fetchData = async (params?: any) => { setLoading(true); try { setPayments(await SourcingService.getSupplierPayments(params)); } catch { toast.error("Failed"); } finally { setLoading(false); } };
  const handleRefreshData = () => fetchData({ ...filters, search: searchQuery });

  const tableActions: IDropdownAction[] = [
    { label: "View Details", icon: <VisibilityIcon color="primary" />, onClick: (p: ISupplierPayment) => navigate(`/admin/sourcing/payments/${p.id}`) },
    { label: "Mark Completed", icon: <CheckCircleIcon color="success" />, onClick: async (p: ISupplierPayment) => { if (!window.confirm("Complete?")) return; try { await SourcingService.confirmSupplierPayment(p.id); toast.success("Completed"); handleRefreshData(); } catch { toast.error("Failed"); } }, condition: (p: ISupplierPayment) => p.status === "pending" || p.status === "processing" },
  ];

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <Box sx={{ flexGrow: 1, minWidth: 250 }}>
          <SearchInput value={searchQuery} onChange={(e: any) => setSearchQuery(e.target.value)} onKeyPress={(e: any) => { if (e.key === "Enter") setFilters({ ...filters, search: searchQuery, page: 1 }); }} type="text" placeholder="Search payments..." />
        </Box>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filters.status || ""} label="Status" onChange={e => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}>
            <MenuItem value="">All</MenuItem>
            {PAYMENT_STATUS_OPTIONS.map(opt => <MenuItem key={opt.value as Key} value={opt.value as string}>{opt.label}</MenuItem>)}
          </Select>
        </FormControl>
        <DateRangeFilter dateFrom={filters.date_from} dateTo={filters.date_to} onApply={(f, t) => setFilters({ ...filters, date_from: f, date_to: t, page: 1 })} />
        <ExportButtons data={payments?.results || []} columns={SUPPLIER_PAYMENT_EXPORT_COLUMNS} filename="supplier_payments" />
       <Button variant="outlined" size="small" onClick={async () => {
          try {
            const blob = await SourcingService.exportSupplierPaymentsCsv(filters);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const a = document.createElement("a"); a.href = url; a.download = "supplier_payments_all.csv"; a.click();
            window.URL.revokeObjectURL(url);
            toast.success("Exported all payments");
          } catch { toast.error("Export failed"); }
        }}>Export All (CSV)</Button>
        <Button sx={{ ml: "auto" }} variant="contained" startIcon={<AddIcon />} onClick={() => setShowModal(true)}>Record Payment</Button>
      </Box>
      <CustomTable columnShape={SupplierPaymentColumnShape(tableActions)} data={payments?.results || []} dataCount={payments?.count || 0} pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }} setPageIndex={(p: number) => setFilters({ ...filters, page: p + 1 })} pageIndex={filters?.page ? filters.page - 1 : 0} setPageSize={(s: number) => setFilters({ ...filters, page_size: s, page: 1 })} loading={loading} />
      <SupplierPaymentForm callBack={handleRefreshData} handleClose={() => setShowModal(false)} />
    </Box>
  );
};

export default SupplierPayments;