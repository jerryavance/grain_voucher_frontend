/**
 * SourceOrders.tsx — UPDATED
 * Added: ExportButtons, DateRangeFilter
 */

import { Box, Button, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { Key, useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { debounce } from "lodash";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import VisibilityIcon from "@mui/icons-material/Visibility";
import useTitle from "../../hooks/useTitle";
import { useModalContext } from "../../contexts/ModalDialogContext";
import { SourcingService } from "./Sourcing.service";
import { ISourceOrderList, ISourceOrdersResults } from "./Sourcing.interface";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import SearchInput from "../../components/SearchInput";
import CustomTable from "../../components/UI/CustomTable";
import SourceOrderColumnShape from "./SourceOrderColumnShape";
import SourceOrderForm from "./SourceOrderForm";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import { ORDER_STATUS_OPTIONS } from "./SourcingConstants";
import { ExportButtons, SOURCE_ORDER_EXPORT_COLUMNS } from "./ExportUtils";
import DateRangeFilter from "./DateRangeFilter";

interface FormDataState {
  suppliers: { value: string; label: string }[];
  hubs: { value: string; label: string }[];
  grainTypes: { value: string; label: string }[];
  paymentMethods: { value: string; label: string }[];
}

const SourceOrders = () => {
  useTitle("Source Orders");
  const navigate = useNavigate();
  const { setShowModal } = useModalContext();

  const [editOrder, setEditOrder] = useState<any>(null);
  const [formType, setFormType] = useState<"Save" | "Update">("Save");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [orders, setOrders] = useState<ISourceOrdersResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormDataState>({ suppliers: [], hubs: [], grainTypes: [], paymentMethods: [] });
  const [formDataLoading, setFormDataLoading] = useState<boolean>(true);

  useEffect(() => { fetchData(filters); }, [filters]);
  useEffect(() => { fetchFormData(); }, []);

  const fetchData = async (params?: any) => {
    try {
      setLoading(true);
      setOrders(await SourcingService.getSourceOrders(params));
    } catch { toast.error("Failed to fetch orders"); }
    finally { setLoading(false); }
  };

  const fetchFormData = async () => {
    try {
      setFormDataLoading(true);
      const [s, h, g] = await Promise.all([
        SourcingService.getSuppliers({ is_verified: true, page_size: 50 }),
        SourcingService.getHubs(),
        SourcingService.getGrainTypes(),
      ]);
      setFormData({
        suppliers: (s.results || s).map((x: any) => ({ value: x.id, label: x.user?.phone_number ? `${x.business_name} (${x.user.phone_number})` : x.business_name })),
        hubs: (h.results || h).map((x: any) => ({ value: x.id, label: x.name })),
        grainTypes: (g.results || g).map((x: any) => ({ value: x.id, label: x.name })),
        paymentMethods: [],
      });
    } catch { toast.error("Failed to load form data"); }
    finally { setFormDataLoading(false); }
  };

  const handleSupplierSearch = useCallback(debounce(async (q: string) => {
    try { const r = await SourcingService.getSuppliers({ search: q, is_verified: true, page_size: 50 }); setFormData(p => ({ ...p, suppliers: (r.results || r).map((x: any) => ({ value: x.id, label: x.user?.phone_number ? `${x.business_name} (${x.user.phone_number})` : x.business_name })) })); } catch {}
  }, 300), []);

  const handleHubSearch = useCallback(debounce(async (q: string) => {
    try { const r = await SourcingService.getHubs(q); setFormData(p => ({ ...p, hubs: (r.results || r).map((x: any) => ({ value: x.id, label: x.name })) })); } catch {}
  }, 300), []);

  const handleGrainTypeSearch = useCallback(debounce(async (q: string) => {
    try { const r = await SourcingService.getGrainTypes(q); setFormData(p => ({ ...p, grainTypes: (r.results || r).map((x: any) => ({ value: x.id, label: x.name })) })); } catch {}
  }, 300), []);

  const loadPaymentMethods = async (supplierId: string) => {
    if (!supplierId) return;
    try { const r = await SourcingService.getPaymentPreferences({ supplier: supplierId, is_active: true, page_size: 50 }); setFormData(p => ({ ...p, paymentMethods: (r.results || r).map((x: any) => ({ value: x.id, label: `${x.method_display}${x.is_default ? " (Default)" : ""}` })) })); } catch {}
  };

  const handleRefreshData = () => fetchData({ ...filters, search: searchQuery });
  const handleOpenModal = () => { setFormType("Save"); setEditOrder(null); setShowModal(true); };
  const handleCloseModal = () => { setShowModal(false); setEditOrder(null); };

  const handleEditOrder = async (order: ISourceOrderList) => {
    try { const full = await SourcingService.getSourceOrderDetails(order.id); if (full.supplier?.id) await loadPaymentMethods(full.supplier.id); setFormType("Update"); setEditOrder(full); setTimeout(() => setShowModal(true), 100); } catch { toast.error("Failed to load order details"); }
  };

  const tableActions: IDropdownAction[] = [
    { label: "View Details", icon: <VisibilityIcon color="primary" />, onClick: (o: ISourceOrderList) => navigate(`/admin/sourcing/orders/${o.id}`) },
    { label: "Edit", icon: <EditIcon color="primary" />, onClick: handleEditOrder, condition: (o: ISourceOrderList) => ["draft", "open"].includes(o.status) },
    { label: "Send to Supplier", icon: <SendIcon color="info" />, onClick: async (o: ISourceOrderList) => { try { await SourcingService.sendToSupplier(o.id); toast.success("Sent"); handleRefreshData(); } catch { toast.error("Failed"); } }, condition: (o: ISourceOrderList) => o.status === "draft" },
    { label: "Accept Order", icon: <CheckIcon color="success" />, onClick: async (o: ISourceOrderList) => { try { await SourcingService.acceptOrder(o.id); toast.success("Accepted"); handleRefreshData(); } catch { toast.error("Failed"); } }, condition: (o: ISourceOrderList) => o.status === "sent" },
    { label: "Mark In Transit", icon: <LocalShippingIcon color="warning" />, onClick: async (o: ISourceOrderList) => { try { await SourcingService.markInTransit(o.id); toast.success("In transit"); handleRefreshData(); } catch { toast.error("Failed"); } }, condition: (o: ISourceOrderList) => o.status === "accepted" },
    { label: "Cancel", icon: <DeleteIcon color="error" />, onClick: async (o: ISourceOrderList) => { if (!window.confirm("Cancel?")) return; try { await SourcingService.cancelOrder(o.id); toast.success("Cancelled"); handleRefreshData(); } catch { toast.error("Failed"); } }, condition: (o: ISourceOrderList) => !["completed", "cancelled", "rejected"].includes(o.status) },
    { label: "Delete", icon: <DeleteIcon color="error" />, onClick: async (o: ISourceOrderList) => { if (!window.confirm(`Delete ${o.order_number}?`)) return; try { await SourcingService.deleteSourceOrder(o.id); toast.success("Deleted"); handleRefreshData(); } catch (e: any) { toast.error(e?.response?.data?.detail || "Failed"); } }, condition: (o: ISourceOrderList) => o.status === "draft" },
  ];

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <Box sx={{ flexGrow: 1, minWidth: 250 }}>
          <SearchInput value={searchQuery} onChange={(e: any) => setSearchQuery(e.target.value)} onKeyPress={(e: any) => { if (e.key === "Enter") setFilters({ ...filters, search: searchQuery, page: 1 }); }} type="text" placeholder="Search orders..." />
        </Box>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select value={filters.status || ""} label="Status Filter" onChange={e => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}>
            <MenuItem value="">All Statuses</MenuItem>
            {ORDER_STATUS_OPTIONS.map(opt => <MenuItem key={opt.value as Key} value={opt.value as string}>{opt.label}</MenuItem>)}
          </Select>
        </FormControl>
        {/* ✅ NEW: Date Range */}
        <DateRangeFilter dateFrom={filters.date_from} dateTo={filters.date_to} onApply={(from, to) => setFilters({ ...filters, date_from: from, date_to: to, page: 1 })} />
        {/* ✅ NEW: Export */}
        <ExportButtons data={orders?.results || []} columns={SOURCE_ORDER_EXPORT_COLUMNS} filename="source_orders" />
        <Button sx={{ ml: "auto" }} variant="contained" onClick={handleOpenModal}>Create Order</Button>
      </Box>
      <CustomTable columnShape={SourceOrderColumnShape(tableActions)} data={orders?.results || []} dataCount={orders?.count || 0} pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }} setPageIndex={(p: number) => setFilters({ ...filters, page: p + 1 })} pageIndex={filters?.page ? filters.page - 1 : 0} setPageSize={(s: number) => setFilters({ ...filters, page_size: s, page: 1 })} loading={loading} />
      <SourceOrderForm callBack={handleRefreshData} formType={formType} handleClose={handleCloseModal} initialValues={editOrder} formData={formData} formDataLoading={formDataLoading} searchHandlers={{ handleSupplierSearch, handleHubSearch, handleGrainTypeSearch }} onLoadPaymentMethods={loadPaymentMethods} />
    </Box>
  );
};

export default SourceOrders;