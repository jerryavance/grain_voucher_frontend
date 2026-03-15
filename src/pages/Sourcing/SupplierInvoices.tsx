/**
 * SupplierInvoices.tsx — UPDATED: Export + DateRange added
 */

import { Box, Button, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { Key, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PaymentIcon from "@mui/icons-material/Payment";
import useTitle from "../../hooks/useTitle";
import { useModalContext } from "../../contexts/ModalDialogContext";
import { SourcingService } from "./Sourcing.service";
import { ISupplierInvoice, ISupplierInvoicesResults } from "./Sourcing.interface";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import SearchInput from "../../components/SearchInput";
import CustomTable from "../../components/UI/CustomTable";
import { SupplierInvoiceColumnShape } from "./AllColumnShapes";
import { SupplierPaymentForm } from "./SupplierPaymentForm";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import { INVOICE_STATUS_OPTIONS } from "./SourcingConstants";
import { ExportButtons, SUPPLIER_INVOICE_EXPORT_COLUMNS } from "./ExportUtils";
import DateRangeFilter from "./DateRangeFilter";

const SupplierInvoices = () => {
  useTitle("Supplier Invoices");
  const navigate = useNavigate();
  const { setShowModal } = useModalContext();
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [invoices, setInvoices] = useState<ISupplierInvoicesResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchData(filters); }, [filters]);

  const fetchData = async (params?: any) => { setLoading(true); try { setInvoices(await SourcingService.getSupplierInvoices(params)); } catch { toast.error("Failed"); } finally { setLoading(false); } };
  const handleRefreshData = () => fetchData({ ...filters, search: searchQuery });

  const tableActions: IDropdownAction[] = [
    { label: "View Details", icon: <VisibilityIcon color="primary" />, onClick: (i: ISupplierInvoice) => navigate(`/admin/sourcing/invoices/${i.id}`) },
    { label: "Make Payment", icon: <PaymentIcon color="success" />, onClick: (i: ISupplierInvoice) => { setSelectedInvoice(i.id); setShowModal(true); }, condition: (i: ISupplierInvoice) => ["pending", "partial"].includes(i.status) },
  ];

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <Box sx={{ flexGrow: 1, minWidth: 250 }}>
          <SearchInput value={searchQuery} onChange={(e: any) => setSearchQuery(e.target.value)} onKeyPress={(e: any) => { if (e.key === "Enter") setFilters({ ...filters, search: searchQuery, page: 1 }); }} type="text" placeholder="Search invoices..." />
        </Box>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filters.status || ""} label="Status" onChange={e => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}>
            <MenuItem value="">All</MenuItem>
            {INVOICE_STATUS_OPTIONS.map(opt => <MenuItem key={opt.value as Key} value={opt.value as string}>{opt.label}</MenuItem>)}
          </Select>
        </FormControl>
        <DateRangeFilter dateFrom={filters.date_from} dateTo={filters.date_to} onApply={(f, t) => setFilters({ ...filters, date_from: f, date_to: t, page: 1 })} />
        <ExportButtons data={invoices?.results || []} columns={SUPPLIER_INVOICE_EXPORT_COLUMNS} filename="supplier_invoices" />
      </Box>
      <CustomTable columnShape={SupplierInvoiceColumnShape(tableActions)} data={invoices?.results || []} dataCount={invoices?.count || 0} pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }} setPageIndex={(p: number) => setFilters({ ...filters, page: p + 1 })} pageIndex={filters?.page ? filters.page - 1 : 0} setPageSize={(s: number) => setFilters({ ...filters, page_size: s, page: 1 })} loading={loading} />
      {selectedInvoice && <SupplierPaymentForm invoiceId={selectedInvoice} callBack={handleRefreshData} handleClose={() => { setShowModal(false); setSelectedInvoice(null); }} />}
    </Box>
  );
};

export default SupplierInvoices;