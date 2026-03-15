/**
 * DeliveryRecords.tsx — UPDATED: Export + DateRange added
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
import { IDeliveryRecord, IDeliveryRecordsResults } from "./Sourcing.interface";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import SearchInput from "../../components/SearchInput";
import CustomTable from "../../components/UI/CustomTable";
import { DeliveryRecordColumnShape } from "./AllColumnShapes";
import { DeliveryRecordForm } from "./SourcingForms";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import { ExportButtons, DELIVERY_EXPORT_COLUMNS } from "./ExportUtils";
import DateRangeFilter from "./DateRangeFilter";

interface FormData { sourceOrders: { value: string; label: string }[]; hubs: { value: string; label: string }[]; }

const DeliveryRecords = () => {
  useTitle("Delivery Records");
  const { setShowModal } = useModalContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [deliveries, setDeliveries] = useState<IDeliveryRecordsResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({ sourceOrders: [], hubs: [] });
  const [formDataLoading, setFormDataLoading] = useState(false);

  useEffect(() => { fetchData(filters); }, [filters]);
  useEffect(() => { fetchFormData(); }, []);

  const fetchData = async (params?: any) => { setLoading(true); try { setDeliveries(await SourcingService.getDeliveryRecords(params)); } catch { toast.error("Failed"); } finally { setLoading(false); } };

  const fetchFormData = async () => {
    setFormDataLoading(true);
    try {
      const [o, h] = await Promise.all([SourcingService.getSourceOrders({ status: "in_transit", page_size: 50 }), SourcingService.getHubs()]);
      setFormData({
        sourceOrders: (o.results || o).map((x: any) => ({ value: x.id, label: `${x.order_number} - ${x.supplier_name}` })),
        hubs: (h.results || h).map((x: any) => ({ value: x.id, label: x.name })),
      });
    } catch { toast.error("Failed to load form data"); }
    finally { setFormDataLoading(false); }
  };

  const handleOrderSearch = useCallback(debounce(async (q: string) => {
    try { const r = await SourcingService.getSourceOrders({ search: q, status: "in_transit", page_size: 50 }); setFormData(p => ({ ...p, sourceOrders: (r.results || r).map((x: any) => ({ value: x.id, label: `${x.order_number} - ${x.supplier_name}` })) })); } catch {}
  }, 300), []);

  const tableActions: IDropdownAction[] = [{ label: "View Details", icon: <VisibilityIcon color="primary" />, onClick: () => {} }];

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <Box sx={{ flexGrow: 1, minWidth: 250 }}>
          <SearchInput value={searchQuery} onChange={(e: any) => setSearchQuery(e.target.value)} type="text" placeholder="Search delivery records..." onKeyPress={(e: any) => { if (e.key === "Enter") setFilters({ ...filters, search: searchQuery, page: 1 }); }} />
        </Box>
        <DateRangeFilter dateFrom={filters.date_from} dateTo={filters.date_to} onApply={(f, t) => setFilters({ ...filters, date_from: f, date_to: t, page: 1 })} />
        <ExportButtons data={deliveries?.results || []} columns={DELIVERY_EXPORT_COLUMNS} filename="delivery_records" />
        <Button sx={{ ml: "auto" }} variant="contained" startIcon={<AddIcon />} onClick={() => setShowModal(true)}>Record Delivery</Button>
      </Box>
      <CustomTable columnShape={DeliveryRecordColumnShape(tableActions)} data={deliveries?.results || []} dataCount={deliveries?.count || 0} pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }} setPageIndex={(p: number) => setFilters({ ...filters, page: p + 1 })} pageIndex={filters?.page ? filters.page - 1 : 0} setPageSize={(s: number) => setFilters({ ...filters, page_size: s, page: 1 })} loading={loading} />
      <DeliveryRecordForm callBack={() => fetchData(filters)} handleClose={() => setShowModal(false)} formData={formData} formDataLoading={formDataLoading} searchHandlers={{ handleOrderSearch }} />
    </Box>
  );
};

export default DeliveryRecords;