/**
 * WeighbridgeRecords.tsx — UPDATED: Export + DateRange added
 */

import { Box, Button } from "@mui/material";
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { debounce } from "lodash";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import useTitle from "../../hooks/useTitle";
import { useModalContext } from "../../contexts/ModalDialogContext";
import { SourcingService } from "./Sourcing.service";
import { IWeighbridgeRecord, IWeighbridgeRecordsResults } from "./Sourcing.interface";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import SearchInput from "../../components/SearchInput";
import CustomTable from "../../components/UI/CustomTable";
import { WeighbridgeRecordColumnShape } from "./AllColumnShapes";
import { WeighbridgeRecordForm } from "./SourcingForms";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import { ExportButtons, WEIGHBRIDGE_EXPORT_COLUMNS } from "./ExportUtils";
import DateRangeFilter from "./DateRangeFilter";

interface FormDataState { sourceOrders: { value: string; label: string }[]; deliveries: { value: string; label: string }[]; }

const WeighbridgeRecords = () => {
  useTitle("Weighbridge Records");
  const { setShowModal } = useModalContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState<IWeighbridgeRecordsResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormDataState>({ sourceOrders: [], deliveries: [] });
  const [formDataLoading, setFormDataLoading] = useState(true);

  useEffect(() => { fetchData(filters); }, [filters]);
  useEffect(() => { fetchFormData(); }, []);

  const fetchData = async (params?: any) => { setLoading(true); try { setRecords(await SourcingService.getWeighbridgeRecords(params)); } catch { toast.error("Failed"); } finally { setLoading(false); } };

  const fetchFormData = async () => {
    setFormDataLoading(true);
    try { const o = await SourcingService.getSourceOrders({ status: "delivered", page_size: 100 }); setFormData(p => ({ ...p, sourceOrders: (o.results || []).map((x: any) => ({ value: x.id, label: `${x.order_number} — ${x.supplier_name ?? "Unknown"}` })) })); }
    catch { toast.error("Failed to load form data"); }
    finally { setFormDataLoading(false); }
  };

  const loadDeliveries = async (orderId: string) => {
    try { const r = await SourcingService.getDeliveryRecords({ source_order: orderId, page_size: 100 }); setFormData(p => ({ ...p, deliveries: (r.results || []).map((d: any) => ({ value: d.id, label: `Delivery ${new Date(d.received_at).toLocaleDateString()} — ${d.driver_name} (${d.vehicle_number})` })) })); }
    catch { toast.error("Failed to load deliveries"); }
  };

  const handleOrderSearch = useCallback(debounce(async (q: string) => {
    try { const r = await SourcingService.getSourceOrders({ search: q, status: "delivered", page_size: 100 }); setFormData(p => ({ ...p, sourceOrders: (r.results || []).map((x: any) => ({ value: x.id, label: `${x.order_number} — ${x.supplier_name ?? "Unknown"}` })) })); } catch {}
  }, 300), []);

  const tableActions: IDropdownAction[] = [{ label: "View Details", icon: <VisibilityIcon color="primary" />, onClick: () => {} }];

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <Box sx={{ flexGrow: 1, minWidth: 250 }}>
          <SearchInput value={searchQuery} onChange={(e: any) => setSearchQuery(e.target.value)} onKeyPress={(e: any) => { if (e.key === "Enter") setFilters({ ...filters, search: searchQuery, page: 1 }); }} type="text" placeholder="Search weighbridge records..." />
        </Box>
        <DateRangeFilter dateFrom={filters.date_from} dateTo={filters.date_to} onApply={(f, t) => setFilters({ ...filters, date_from: f, date_to: t, page: 1 })} />
        <ExportButtons data={records?.results || []} columns={WEIGHBRIDGE_EXPORT_COLUMNS} filename="weighbridge_records" />
        <Button sx={{ ml: "auto" }} variant="contained" startIcon={<AddIcon />} onClick={() => setShowModal(true)}>Create Weighbridge Record</Button>
      </Box>
      <CustomTable columnShape={WeighbridgeRecordColumnShape(tableActions)} data={records?.results || []} dataCount={records?.count || 0} pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }} setPageIndex={(p: number) => setFilters({ ...filters, page: p + 1 })} pageIndex={filters?.page ? filters.page - 1 : 0} setPageSize={(s: number) => setFilters({ ...filters, page_size: s, page: 1 })} loading={loading} />
      <WeighbridgeRecordForm callBack={() => fetchData(filters)} handleClose={() => { setShowModal(false); setFormData(p => ({ ...p, deliveries: [] })); }} formData={formData} formDataLoading={formDataLoading} searchHandlers={{ handleOrderSearch }} onLoadDeliveries={loadDeliveries} />
    </Box>
  );
};

export default WeighbridgeRecords;