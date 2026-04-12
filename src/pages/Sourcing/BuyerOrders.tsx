/**
 * BuyerOrders.tsx — UPDATED
 * Added: ExportButtons, DateRangeFilter
 * Kept: all existing functionality (create form, quick actions, buyer profile links)
 */

import { FC, useEffect, useRef, useState } from "react";
import {
  Alert, Autocomplete, Box, Button, Chip, CircularProgress, FormControl,
  Grid, InputLabel, MenuItem, Select, TextField, Typography,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import CustomTable from "../../components/UI/CustomTable";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import SearchInput from "../../components/SearchInput";
import { Span } from "../../components/Typography";
import useTitle from "../../hooks/useTitle";
import uniqueId from "../../utils/generateId";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import { SourcingService } from "./Sourcing.service";
import { formatCurrency } from "./SourcingConstants";
import { IBuyerOrderList, IBuyerOrdersResults, IBuyerProfile } from "./Sourcing.interface";
import { ExportButtons, BUYER_ORDER_EXPORT_COLUMNS } from "./ExportUtils";
import DateRangeFilter from "./DateRangeFilter";

const BUYER_ORDER_STATUS_COLORS: Record<string, any> = { quotation: "info", draft: "default", confirmed: "primary", dispatched: "warning", delivered: "info", invoiced: "secondary", completed: "success", cancelled: "error" };
const PAYMENT_TYPE_COLORS: Record<string, any> = { cash: "success", financed: "secondary" };
const BUYER_INVOICE_STATUS_COLORS: Record<string, any> = { draft: "default", issued: "primary", partial: "warning", paid: "success", overdue: "error", cancelled: "error" };

// ── Create Buyer Order Form (same as original, abbreviated for space) ────
const CreateBuyerOrderForm: FC<{
  hubs: { value: string; label: string }[]; handleClose: () => void; callBack?: () => void;
}> = ({ hubs, handleClose, callBack }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [buyerMode, setBuyerMode] = useState<"profile" | "adhoc">("profile");
  const [buyers, setBuyers] = useState<IBuyerProfile[]>([]);
  const [buyerSearch, setBuyerSearch] = useState("");
  const [buyersLoading, setBuyersLoading] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<IBuyerProfile | null>(null);
  const [grainTypes, setGrainTypes] = useState<{ value: string; label: string }[]>([]);
  const modalId = useRef(uniqueId()).current;

  useEffect(() => {
    SourcingService.getGrainTypes().then(r =>
      setGrainTypes((r.results || r).map((g: any) => ({ value: g.id, label: g.name })))
    ).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setBuyersLoading(true);
    SourcingService.getBuyers({ search: buyerSearch, is_active: true, page_size: 30 })
      .then(r => { if (!cancelled) setBuyers(r.results); }).catch(() => {})
      .finally(() => { if (!cancelled) setBuyersLoading(false); });
    return () => { cancelled = true; };
  }, [buyerSearch]);

  const form = useFormik({
    initialValues: { buyer: "", buyer_name: "", buyer_contact_name: "", buyer_phone: "", buyer_email: "", buyer_address: "", hub: "", credit_terms_days: 0, payment_type: "financed", grain_type: "", quantity_requested_kg: "", notes: "" },
    validationSchema: Yup.object({
      hub: Yup.string().required("Hub is required"),
      buyer: Yup.string(),
      buyer_name: Yup.string(),
    }).test("buyer-required", "Select buyer", function (values) {
      if (buyerMode === "profile" && !values.buyer) return this.createError({ path: "buyer", message: "Select a buyer profile" });
      if (buyerMode === "adhoc" && !values.buyer_name) return this.createError({ path: "buyer_name", message: "Buyer name is required" });
      return true;
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const payload: any = { hub: values.hub, notes: values.notes, credit_terms_days: values.credit_terms_days, payment_type: values.payment_type };
        if (values.grain_type) payload.grain_type = values.grain_type;
        if (values.quantity_requested_kg) payload.quantity_requested_kg = Number(values.quantity_requested_kg);
        if (buyerMode === "profile" && values.buyer) { payload.buyer = values.buyer; }
        else { payload.buyer_name = values.buyer_name; payload.buyer_contact_name = values.buyer_contact_name; payload.buyer_phone = values.buyer_phone; payload.buyer_email = values.buyer_email; payload.buyer_address = values.buyer_address; }
        const order = await SourcingService.createBuyerOrder(payload);
        toast.success(`Order ${order.order_number} created`);
        callBack?.(); navigate(`/admin/sourcing/buyer-orders/${order.id}`);
      } catch (e: any) { toast.error(e?.response?.data?.non_field_errors?.[0] || e?.response?.data?.buyer?.[0] || "Failed"); }
      finally { setLoading(false); }
    },
  });

  useEffect(() => { if (selectedBuyer) { form.setFieldValue("buyer", selectedBuyer.id); form.setFieldValue("credit_terms_days", selectedBuyer.default_credit_terms_days); } }, [selectedBuyer]);

  return (
    <ModalDialog title="New Buyer Order" onClose={handleClose} id={modalId} open={true} ActionButtons={() => (<><Button onClick={handleClose} disabled={loading}>Cancel</Button><Button variant="contained" onClick={() => form.handleSubmit()} disabled={loading}>{loading ? <ProgressIndicator color="inherit" size={20} /> : "Create & Open Order"}</Button></>)} maxWidth="md">
      <Grid container spacing={2} sx={{ pt: 1 }}>
        <Grid item xs={12}>
          <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
            <Button variant={buyerMode === "profile" ? "contained" : "outlined"} size="small" startIcon={<BusinessIcon />} onClick={() => { setBuyerMode("profile"); form.setFieldValue("buyer_name", ""); }}>Registered Buyer</Button>
            <Button variant={buyerMode === "adhoc" ? "contained" : "outlined"} size="small" color="secondary" startIcon={<PersonIcon />} onClick={() => { setBuyerMode("adhoc"); form.setFieldValue("buyer", ""); setSelectedBuyer(null); }}>Ad-hoc Buyer</Button>
          </Box>
        </Grid>
        {buyerMode === "profile" && (
          <Grid item xs={12}>
            <Autocomplete options={buyers} loading={buyersLoading} value={selectedBuyer} onChange={(_, val) => setSelectedBuyer(val)} onInputChange={(_, val) => setBuyerSearch(val)} getOptionLabel={b => `${b.business_name} — ${b.buyer_type_display}`} isOptionEqualToValue={(a, b) => a.id === b.id}
              renderInput={params => <TextField {...params} label="Search buyer *" error={Boolean(form.errors.buyer)} helperText={form.errors.buyer as string} InputProps={{ ...params.InputProps, endAdornment: <>{buyersLoading && <CircularProgress color="inherit" size={18} />}{params.InputProps.endAdornment}</> }} />} />
            {selectedBuyer && <Alert severity="info" sx={{ mt: 1 }}><strong>{selectedBuyer.business_name}</strong> · Credit: {selectedBuyer.default_credit_terms_days === 0 ? "Cash" : `Net ${selectedBuyer.default_credit_terms_days}d`} · AR: {formatCurrency(selectedBuyer.outstanding_balance)}</Alert>}
          </Grid>
        )}
        {buyerMode === "adhoc" && (
          <><Grid item xs={12} md={6}><TextField fullWidth label="Buyer Name *" value={form.values.buyer_name} onChange={e => form.setFieldValue("buyer_name", e.target.value)} error={Boolean(form.errors.buyer_name)} helperText={form.errors.buyer_name as string} /></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth label="Contact Person" value={form.values.buyer_contact_name} onChange={e => form.setFieldValue("buyer_contact_name", e.target.value)} /></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth label="Phone" value={form.values.buyer_phone} onChange={e => form.setFieldValue("buyer_phone", e.target.value)} /></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth label="Email" value={form.values.buyer_email} onChange={e => form.setFieldValue("buyer_email", e.target.value)} /></Grid></>
        )}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={Boolean(form.errors.hub)}><InputLabel>Hub *</InputLabel><Select value={form.values.hub} label="Hub *" onChange={e => form.setFieldValue("hub", e.target.value)}>{hubs.map(h => <MenuItem key={h.value} value={h.value}>{h.label}</MenuItem>)}</Select></FormControl>
        </Grid>
        <Grid item xs={12} md={6}><TextField fullWidth label="Credit Terms (Days)" type="number" value={form.values.credit_terms_days} onChange={e => form.setFieldValue("credit_terms_days", parseInt(e.target.value) || 0)} /></Grid>
        {/* Payment type — cash buyer funds own purchase, financed = investor EMD backs it */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth><InputLabel>Payment Type</InputLabel>
            <Select value={form.values.payment_type} label="Payment Type" onChange={e => form.setFieldValue("payment_type", e.target.value)}>
              <MenuItem value="financed">Financed (Investor-backed)</MenuItem>
              <MenuItem value="cash">Cash (Buyer self-financed)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {/* Pre-sourcing demand — optional grain type + quantity for quotation */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth><InputLabel>Grain Type (optional)</InputLabel>
            <Select value={form.values.grain_type} label="Grain Type (optional)" onChange={e => form.setFieldValue("grain_type", e.target.value)}>
              <MenuItem value="">— Not specified —</MenuItem>
              {grainTypes.map(g => <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}><TextField fullWidth label="Quantity Requested (kg)" type="number" value={form.values.quantity_requested_kg} onChange={e => form.setFieldValue("quantity_requested_kg", e.target.value)} helperText="Used for quotation / PFI generation" /></Grid>
        <Grid item xs={12}><TextField fullWidth label="Notes" multiline rows={2} value={form.values.notes} onChange={e => form.setFieldValue("notes", e.target.value)} /></Grid>
      </Grid>
    </ModalDialog>
  );
};

// ── Main ────────────────────────────────────────────────────────────────────
const BuyerOrders: FC = () => {
  useTitle("Buyer Orders");
  const navigate = useNavigate();
  const [orders, setOrders] = useState<IBuyerOrdersResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [hubs, setHubs] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => { fetchData(filters); }, [filters]);
  useEffect(() => { SourcingService.getHubs().then(r => setHubs((r.results || r).map((h: any) => ({ value: h.id, label: h.name })))).catch(() => {}); }, []);

  const fetchData = async (params?: any) => { setLoading(true); try { setOrders(await SourcingService.getBuyerOrders(params)); } catch { toast.error("Failed"); } finally { setLoading(false); } };

  const handleQuickAction = async (action: string, id: string) => { try { if (action === "confirm") await SourcingService.confirmBuyerOrder(id); else if (action === "dispatch") await SourcingService.dispatchBuyerOrder(id); else if (action === "deliver") await SourcingService.deliverBuyerOrder(id); else if (action === "cancel") await SourcingService.cancelBuyerOrder(id); toast.success("Updated"); fetchData(filters); } catch (e: any) { toast.error(e?.response?.data?.error || "Failed"); } };

  const tableActions: IDropdownAction[] = [
    { label: "View / Manage", icon: <VisibilityIcon color="primary" />, onClick: (o: IBuyerOrderList) => navigate(`/admin/sourcing/buyer-orders/${o.id}`) },
    { label: "Confirm", icon: <CheckCircleIcon color="success" />, onClick: (o: IBuyerOrderList) => handleQuickAction("confirm", o.id), condition: (o: IBuyerOrderList) => o.status === "draft" },
    { label: "Dispatch", icon: <LocalShippingIcon color="warning" />, onClick: (o: IBuyerOrderList) => handleQuickAction("dispatch", o.id), condition: (o: IBuyerOrderList) => o.status === "confirmed" },
    { label: "Deliver", icon: <CheckCircleIcon color="info" />, onClick: (o: IBuyerOrderList) => handleQuickAction("deliver", o.id), condition: (o: IBuyerOrderList) => o.status === "dispatched" },
    { label: "Cancel", icon: <DeleteIcon color="error" />, onClick: (o: IBuyerOrderList) => { if (window.confirm("Cancel?")) handleQuickAction("cancel", o.id); }, condition: (o: IBuyerOrderList) => !["invoiced", "completed", "cancelled"].includes(o.status) },
  ];

  const columns = [
    { Header: "Order #", accessor: "order_number", minWidth: 170, Cell: ({ row }: any) => <Typography color="primary" variant="body2" sx={{ fontWeight: 700, cursor: "pointer", "&:hover": { textDecoration: "underline" } }} onClick={() => navigate(`/admin/sourcing/buyer-orders/${row.original.id}`)}>{row.original.order_number}</Typography> },
    { Header: "Buyer", accessor: "buyer_name", minWidth: 200, Cell: ({ row }: any) => { const o = row.original; return (<Box><Typography variant="body2" sx={{ fontWeight: 600 }}>{o.buyer_detail?.business_name || o.buyer_name}</Typography>{o.buyer_detail && <Typography variant="caption" color="primary" sx={{ cursor: "pointer" }} onClick={(e: any) => { e.stopPropagation(); navigate(`/admin/sourcing/buyers/${o.buyer}`); }}>View profile →</Typography>}</Box>); } },
    { Header: "Type", accessor: "payment_type", minWidth: 100, Cell: ({ row }: any) => <Chip label={(row.original.payment_type_display || row.original.payment_type || "—").toUpperCase()} color={PAYMENT_TYPE_COLORS[row.original.payment_type] ?? "default"} size="small" variant="outlined" /> },
    { Header: "Revenue", accessor: "subtotal", minWidth: 130, Cell: ({ row }: any) => <Span sx={{ fontWeight: 600 }}>{formatCurrency(row.original.subtotal)}</Span> },
    { Header: "Gross Profit", accessor: "gross_profit", minWidth: 130, Cell: ({ row }: any) => <Span sx={{ fontWeight: 600, color: row.original.gross_profit >= 0 ? "success.main" : "error.main" }}>{formatCurrency(row.original.gross_profit)}</Span> },
    { Header: "Invoice", accessor: "invoice_status", minWidth: 120, Cell: ({ row }: any) => row.original.invoice_status ? <Chip label={row.original.invoice_status.toUpperCase()} color={BUYER_INVOICE_STATUS_COLORS[row.original.invoice_status]} size="small" /> : <Span sx={{ color: "text.primary", fontSize: 12 }}>Not Issued</Span> },
    { Header: "Status", accessor: "status", minWidth: 120, Cell: ({ row }: any) => <Chip label={row.original.status.toUpperCase()} color={BUYER_ORDER_STATUS_COLORS[row.original.status]} size="small" /> },
    { Header: "Created", accessor: "created_at", minWidth: 110, Cell: ({ row }: any) => <Span sx={{ fontSize: 12 }}>{formatDateToDDMMYYYY(row.original.created_at)}</Span> },
    { Header: "Action", accessor: "action", minWidth: 80, Cell: ({ row }: any) => <DropdownActionBtn actions={tableActions} metaData={row.original} /> },
  ];

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <SearchInput value={searchQuery} type="text" placeholder="Search buyer or order number..." onChange={(e: any) => setSearchQuery(e.target.value)} onKeyPress={(e: any) => { if (e.key === "Enter") setFilters({ ...filters, search: searchQuery, page: 1 }); }} />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filters.status || ""} label="Status" onChange={e => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}>
            <MenuItem value="">All</MenuItem>
            {["quotation", "draft", "confirmed", "dispatched", "delivered", "invoiced", "completed", "cancelled"].map(s => <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
          </Select>
        </FormControl>
        <DateRangeFilter dateFrom={filters.date_from} dateTo={filters.date_to} onApply={(f, t) => setFilters({ ...filters, date_from: f, date_to: t, page: 1 })} />
        <ExportButtons data={orders?.results || []} columns={BUYER_ORDER_EXPORT_COLUMNS} filename="buyer_orders" />
        <Button sx={{ ml: "auto" }} variant="contained" startIcon={<AddIcon />} onClick={() => setShowCreateForm(true)}>New Buyer Order</Button>
      </Box>
      <CustomTable columnShape={columns} data={orders?.results || []} dataCount={orders?.count || 0} pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }} setPageIndex={(p: number) => setFilters({ ...filters, page: p + 1 })} pageIndex={filters.page - 1} setPageSize={(s: number) => setFilters({ ...filters, page_size: s, page: 1 })} loading={loading} />
      {showCreateForm && <CreateBuyerOrderForm hubs={hubs} handleClose={() => setShowCreateForm(false)} callBack={() => { setShowCreateForm(false); fetchData(filters); }} />}
    </Box>
  );
};

export default BuyerOrders;