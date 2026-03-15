/**
 * Buyers.tsx — UPDATED: ExportButtons added
 * All existing functionality preserved (search, filter, CRUD, verify, activate/deactivate)
 */

import { FC, useEffect, useState, useCallback } from "react";
import {
  Box, Button, Card, CardContent, Chip, FormControl, Grid,
  InputLabel, MenuItem, Select, TextField, Typography,
  Avatar, InputAdornment, Divider, Tooltip,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SearchIcon from "@mui/icons-material/Search";
import VerifiedIcon from "@mui/icons-material/Verified";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CustomTable from "../../components/UI/CustomTable";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import useTitle from "../../hooks/useTitle";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import { SourcingService } from "./Sourcing.service";
import { formatCurrency } from "./SourcingConstants";
import { IBuyerProfile, IBuyerProfilesResults } from "./Sourcing.interface";
import uniqueId from "../../utils/generateId";
import { ExportButtons } from "./ExportUtils";

const BUYER_TYPE_OPTIONS = [
  { value: "grain_company", label: "Grain Company" }, { value: "trader", label: "Trader" },
  { value: "processor", label: "Processor" }, { value: "exporter", label: "Exporter" },
  { value: "retailer", label: "Retailer" }, { value: "other", label: "Other" },
];
const BUYER_TYPE_COLORS: Record<string, any> = { grain_company: "primary", trader: "secondary", processor: "info", exporter: "warning", retailer: "success", other: "default" };

const BUYER_EXPORT_COLUMNS = [
  { header: "Business Name", key: "business_name" }, { header: "Type", key: "buyer_type" },
  { header: "Contact", key: "contact_name" }, { header: "Phone", key: "phone" },
  { header: "Email", key: "email" }, { header: "District", key: "district" },
  { header: "Credit Terms (Days)", key: "default_credit_terms_days" },
  { header: "Credit Limit", key: "credit_limit" },
  { header: "Outstanding Balance", key: "outstanding_balance" },
  { header: "Verified", key: "is_verified" }, { header: "Active", key: "is_active" },
  { header: "Created", key: "created_at" },
];

// ── Buyer Form ─────────────────────────────────────────────────────────────
const BuyerForm: FC<{
  handleClose: () => void; formType?: "Save" | "Update"; initialValues?: IBuyerProfile | null;
  callBack?: () => void; hubs: { value: string; label: string }[]; grainTypes: { value: string; label: string }[];
}> = ({ handleClose, formType = "Save", initialValues, callBack, hubs, grainTypes }) => {
  const [loading, setLoading] = useState(false);
  const form = useFormik({
    initialValues: {
      business_name: initialValues?.business_name || "", buyer_type: initialValues?.buyer_type || "trader",
      registration_number: initialValues?.registration_number || "", contact_name: initialValues?.contact_name || "",
      phone: initialValues?.phone || "", email: initialValues?.email || "",
      physical_address: initialValues?.physical_address || "", district: initialValues?.district || "",
      country: initialValues?.country || "Uganda", default_credit_terms_days: initialValues?.default_credit_terms_days ?? 0,
      credit_limit: initialValues?.credit_limit ?? 0, notes: initialValues?.notes || "",
    },
    validationSchema: Yup.object({
      business_name: Yup.string().required().min(2), buyer_type: Yup.string().required(),
      contact_name: Yup.string().required(), phone: Yup.string().required(),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (formType === "Update" && initialValues) { await SourcingService.updateBuyer(initialValues.id, values); toast.success("Updated"); }
        else { await SourcingService.createBuyer(values); toast.success("Created"); }
        callBack?.(); handleClose();
      } catch (e: any) { toast.error(e?.response?.data?.business_name?.[0] || "Failed"); }
      finally { setLoading(false); }
    },
  });

  return (
    <ModalDialog title={formType === "Update" ? `Edit — ${initialValues?.business_name}` : "Register New Buyer"} onClose={handleClose} id={uniqueId()} open={true}
      ActionButtons={() => (<><Button onClick={handleClose} disabled={loading}>Cancel</Button><Button variant="contained" onClick={() => form.handleSubmit()} disabled={loading}>{loading ? <ProgressIndicator color="inherit" size={20} /> : formType === "Update" ? "Save" : "Create"}</Button></>)} maxWidth="md">
      <Grid container spacing={2} sx={{ pt: 1 }}>
        <Grid item xs={12}><Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Business Information</Typography><Divider sx={{ mb: 1 }} /></Grid>
        <Grid item xs={12} md={8}><TextField fullWidth label="Business Name *" value={form.values.business_name} onChange={e => form.setFieldValue("business_name", e.target.value)} error={Boolean(form.errors.business_name)} helperText={form.errors.business_name as string} /></Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth><InputLabel>Buyer Type *</InputLabel><Select value={form.values.buyer_type} label="Buyer Type *" onChange={e => form.setFieldValue("buyer_type", e.target.value)}>{BUYER_TYPE_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}</Select></FormControl>
        </Grid>
        <Grid item xs={12} md={6}><TextField fullWidth label="Registration Number" value={form.values.registration_number} onChange={e => form.setFieldValue("registration_number", e.target.value)} /></Grid>
        <Grid item xs={12} md={6}><TextField fullWidth label="Country" value={form.values.country} onChange={e => form.setFieldValue("country", e.target.value)} /></Grid>
        <Grid item xs={12}><Typography variant="subtitle2" color="text.primary" sx={{ mt: 1, fontWeight: 700, textTransform: "uppercase" }}>Primary Contact</Typography><Divider sx={{ mb: 1 }} /></Grid>
        <Grid item xs={12} md={6}><TextField fullWidth label="Contact Person *" value={form.values.contact_name} onChange={e => form.setFieldValue("contact_name", e.target.value)} error={Boolean(form.errors.contact_name)} helperText={form.errors.contact_name as string} /></Grid>
        <Grid item xs={12} md={6}><TextField fullWidth label="Phone *" value={form.values.phone} onChange={e => form.setFieldValue("phone", e.target.value)} error={Boolean(form.errors.phone)} helperText={form.errors.phone as string} /></Grid>
        <Grid item xs={12} md={6}><TextField fullWidth label="Email" value={form.values.email} onChange={e => form.setFieldValue("email", e.target.value)} /></Grid>
        <Grid item xs={12} md={6}><TextField fullWidth label="District" value={form.values.district} onChange={e => form.setFieldValue("district", e.target.value)} /></Grid>
        <Grid item xs={12}><TextField fullWidth label="Physical Address" multiline rows={2} value={form.values.physical_address} onChange={e => form.setFieldValue("physical_address", e.target.value)} /></Grid>
        <Grid item xs={12}><Typography variant="subtitle2" color="text.primary" sx={{ mt: 1, fontWeight: 700, textTransform: "uppercase" }}>Commercial Terms</Typography><Divider sx={{ mb: 1 }} /></Grid>
        <Grid item xs={12} md={6}><TextField fullWidth label="Default Credit Terms (Days)" type="number" value={form.values.default_credit_terms_days} onChange={e => form.setFieldValue("default_credit_terms_days", parseInt(e.target.value) || 0)} helperText="0 = cash on delivery" /></Grid>
        <Grid item xs={12} md={6}><TextField fullWidth label="Credit Limit (UGX)" type="number" value={form.values.credit_limit} onChange={e => form.setFieldValue("credit_limit", parseFloat(e.target.value) || 0)} InputProps={{ startAdornment: <InputAdornment position="start">UGX</InputAdornment> }} helperText="0 = no limit" /></Grid>
        <Grid item xs={12}><TextField fullWidth label="Notes" multiline rows={2} value={form.values.notes} onChange={e => form.setFieldValue("notes", e.target.value)} /></Grid>
      </Grid>
    </ModalDialog>
  );
};

// ── Main ────────────────────────────────────────────────────────────────────
const Buyers: FC = () => {
  useTitle("Buyers");
  const navigate = useNavigate();
  const [buyers, setBuyers] = useState<IBuyerProfilesResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editBuyer, setEditBuyer] = useState<IBuyerProfile | null>(null);
  const [hubs, setHubs] = useState<{ value: string; label: string }[]>([]);
  const [grainTypes, setGrainTypes] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => { fetchData(filters); }, [filters]);
  useEffect(() => {
    SourcingService.getHubs().then(r => setHubs((r.results || r).map((h: any) => ({ value: h.id, label: h.name }))));
    SourcingService.getGrainTypes().then(r => setGrainTypes((r.results || r).map((g: any) => ({ value: g.id, label: g.name }))));
  }, []);

  const fetchData = async (params?: any) => { setLoading(true); try { setBuyers(await SourcingService.getBuyers(params)); } catch { toast.error("Failed"); } finally { setLoading(false); } };

  const handleSearch = useCallback(debounce((q: string) => setFilters((f: any) => ({ ...f, search: q || undefined, page: 1 })), 400), []);

  const tableActions: IDropdownAction[] = [
    { label: "View Profile", icon: <VisibilityIcon color="primary" />, onClick: (b: IBuyerProfile) => navigate(`/admin/sourcing/buyers/${b.id}`) },
    { label: "Edit", icon: <EditIcon color="primary" />, onClick: (b: IBuyerProfile) => { setEditBuyer(b); setShowForm(true); } },
    { label: "Verify", icon: <VerifiedIcon color="success" />, onClick: async (b: IBuyerProfile) => { if (!window.confirm(`Verify ${b.business_name}?`)) return; try { await SourcingService.verifyBuyer(b.id); toast.success("Verified"); fetchData(filters); } catch { toast.error("Failed"); } }, condition: (b: IBuyerProfile) => !b.is_verified },
    { label: "Deactivate", icon: <PauseIcon color="warning" />, onClick: async (b: IBuyerProfile) => { if (!window.confirm(`Deactivate ${b.business_name}?`)) return; try { await SourcingService.deactivateBuyer(b.id); toast.success("Deactivated"); fetchData(filters); } catch { toast.error("Failed"); } }, condition: (b: IBuyerProfile) => b.is_active },
    { label: "Reactivate", icon: <PlayArrowIcon color="success" />, onClick: async (b: IBuyerProfile) => { if (!window.confirm(`Reactivate ${b.business_name}?`)) return; try { await SourcingService.reactivateBuyer(b.id); toast.success("Reactivated"); fetchData(filters); } catch { toast.error("Failed"); } }, condition: (b: IBuyerProfile) => !b.is_active },
    { label: "Delete", icon: <DeleteIcon color="error" />, onClick: async (b: IBuyerProfile) => { if (!window.confirm(`Delete ${b.business_name}?`)) return; try { await SourcingService.deleteBuyer(b.id); toast.success("Deleted"); fetchData(filters); } catch (e: any) { toast.error(e?.response?.data?.detail || "Cannot delete"); } } },
  ];

  const columns = [
    { Header: "Business Name", accessor: "business_name", minWidth: 220, Cell: ({ row }: any) => { const b: IBuyerProfile = row.original; return (<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}><Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: 15, fontWeight: 700 }}>{b.business_name.charAt(0).toUpperCase()}</Avatar><Box><Typography variant="body2" color="primary" sx={{ fontWeight: 700, cursor: "pointer", "&:hover": { textDecoration: "underline" } }} onClick={() => navigate(`/admin/sourcing/buyers/${b.id}`)}>{b.business_name}</Typography><Typography variant="caption" color="text.primary">{b.contact_name}</Typography></Box></Box>); } },
    { Header: "Type", accessor: "buyer_type", minWidth: 130, Cell: ({ row }: any) => <Chip label={row.original.buyer_type_display} color={BUYER_TYPE_COLORS[row.original.buyer_type]} size="small" /> },
    { Header: "Phone / Email", accessor: "phone", minWidth: 170, Cell: ({ row }: any) => <Box><Typography variant="body2">{row.original.phone || "—"}</Typography><Typography variant="caption" color="text.primary">{row.original.email || ""}</Typography></Box> },
    { Header: "Credit Terms", accessor: "default_credit_terms_days", minWidth: 130, Cell: ({ row }: any) => <Span>{row.original.default_credit_terms_days === 0 ? "Cash" : `Net ${row.original.default_credit_terms_days}d`}</Span> },
    { Header: "Outstanding", accessor: "outstanding_balance", minWidth: 140, Cell: ({ row }: any) => { const bal = row.original.outstanding_balance; return <Span sx={{ fontWeight: 600, color: bal > 0 ? "error.main" : "success.main" }}>{formatCurrency(bal)}</Span>; } },
    { Header: "Status", accessor: "is_verified", minWidth: 140, Cell: ({ row }: any) => { const b: IBuyerProfile = row.original; return <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}><Chip label={b.is_verified ? "Verified" : "Unverified"} color={b.is_verified ? "success" : "warning"} size="small" />{!b.is_active && <Chip label="Inactive" color="error" size="small" />}</Box>; } },
    { Header: "Joined", accessor: "created_at", minWidth: 110, Cell: ({ row }: any) => <Span sx={{ fontSize: 12 }}>{formatDateToDDMMYYYY(row.original.created_at)}</Span> },
    { Header: "Action", accessor: "action", minWidth: 80, Cell: ({ row }: any) => <DropdownActionBtn actions={tableActions} metaData={row.original} /> },
  ];

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField size="small" placeholder="Search buyers..." value={search} onChange={e => { setSearch(e.target.value); handleSearch(e.target.value); }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "text.primary" }} /></InputAdornment> }} sx={{ minWidth: 280 }} />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select value={filters.buyer_type || ""} label="Type" onChange={e => setFilters({ ...filters, buyer_type: e.target.value || undefined, page: 1 })}>
            <MenuItem value="">All Types</MenuItem>
            {BUYER_TYPE_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </Select>
        </FormControl>
        <Button variant={filters.is_verified === true ? "contained" : "outlined"} size="small" onClick={() => setFilters({ ...filters, is_verified: filters.is_verified === true ? undefined : true, page: 1 })}>Verified</Button>
        <Button variant={filters.is_active === false ? "contained" : "outlined"} color="error" size="small" onClick={() => setFilters({ ...filters, is_active: filters.is_active === false ? undefined : false, page: 1 })}>Inactive</Button>
        <ExportButtons data={buyers?.results || []} columns={BUYER_EXPORT_COLUMNS} filename="buyers" />
        <Button sx={{ ml: "auto" }} variant="contained" startIcon={<AddIcon />} onClick={() => { setEditBuyer(null); setShowForm(true); }}>New Buyer</Button>
      </Box>

      {buyers && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {[
            { label: "Total Buyers", value: buyers.count, color: "primary.main" },
            { label: "Verified", value: buyers.results.filter(b => b.is_verified).length, color: "success.main" },
            { label: "Active", value: buyers.results.filter(b => b.is_active).length, color: "info.main" },
            { label: "Outstanding AR", value: formatCurrency(buyers.results.reduce((s, b) => s + (b.outstanding_balance || 0), 0)), color: "error.main" },
          ].map(s => (
            <Grid item xs={6} sm={3} key={s.label}>
              <Card variant="outlined"><CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography variant="caption" color="text.primary">{s.label}</Typography>
                <Typography variant="h6" sx={{ color: s.color, fontWeight: 700 }}>{s.value}</Typography>
              </CardContent></Card>
            </Grid>
          ))}
        </Grid>
      )}

      <CustomTable columnShape={columns} data={buyers?.results || []} dataCount={buyers?.count || 0} pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }} setPageIndex={(p: number) => setFilters({ ...filters, page: p + 1 })} pageIndex={filters.page - 1} setPageSize={(s: number) => setFilters({ ...filters, page_size: s, page: 1 })} loading={loading} />

      {showForm && (
        <BuyerForm handleClose={() => { setShowForm(false); setEditBuyer(null); }} formType={editBuyer ? "Update" : "Save"} initialValues={editBuyer} hubs={hubs} grainTypes={grainTypes}
          callBack={() => { setShowForm(false); setEditBuyer(null); fetchData(filters); }} />
      )}
    </Box>
  );
};

export default Buyers;