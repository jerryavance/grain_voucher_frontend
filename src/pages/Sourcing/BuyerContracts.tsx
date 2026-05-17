/**
 * BuyerContracts.tsx
 *
 * Lists multi-delivery buyer contracts (e.g. UNGA 400 MT split across 14
 * trucks) and provides a create form. Each contract is a parent that
 * aggregates multiple child BuyerOrders — the existing BuyerOrder /
 * BuyerInvoice flow is untouched.
 */

import { FC, useEffect, useRef, useState } from "react";
import {
  Alert, Autocomplete, Box, Button, Chip, CircularProgress, FormControl,
  Grid, InputLabel, LinearProgress, MenuItem, Select, TextField, Typography,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import CancelIcon from "@mui/icons-material/Cancel";
import HandshakeIcon from "@mui/icons-material/Handshake";

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
import {
  IBuyerContract, IBuyerContractsResults, IBuyerProfile,
} from "./Sourcing.interface";

const STATUS_COLORS: Record<string, any> = {
  draft: "default",
  active: "primary",
  completed: "success",
  cancelled: "error",
};

// ─── Create Contract Form ─────────────────────────────────────────────────────
const CreateContractForm: FC<{
  hubs: { value: string; label: string }[];
  handleClose: () => void;
  callBack?: () => void;
}> = ({ hubs, handleClose, callBack }) => {
  const [loading, setLoading] = useState(false);
  const [buyers, setBuyers] = useState<IBuyerProfile[]>([]);
  const [buyerSearch, setBuyerSearch] = useState("");
  const [buyersLoading, setBuyersLoading] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<IBuyerProfile | null>(null);
  const [grainTypes, setGrainTypes] = useState<{ value: string; label: string }[]>([]);
  const modalId = useRef(uniqueId()).current;

  useEffect(() => {
    SourcingService.getGrainTypes()
      .then(r => setGrainTypes((r.results || r).map((g: any) => ({ value: g.id, label: g.name }))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setBuyersLoading(true);
    SourcingService.getBuyers({ search: buyerSearch, is_active: true, page_size: 30 })
      .then(r => { if (!cancelled) setBuyers(r.results); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setBuyersLoading(false); });
    return () => { cancelled = true; };
  }, [buyerSearch]);

  const form = useFormik({
    initialValues: {
      buyer: "", hub: "", grain_type: "",
      contracted_quantity_kg: "", contracted_price_per_unit: "",
      currency: "UGX", exchange_rate_to_ugx: "",
      trade_unit: "kg",
      payment_terms_days: 30,
      delivery_start_date: "", delivery_end_date: "",
      notes: "",
    },
    validationSchema: Yup.object({
      buyer: Yup.string().required("Buyer is required"),
      hub: Yup.string().required("Hub is required"),
      grain_type: Yup.string().required("Grain type is required"),
      contracted_quantity_kg: Yup.number()
        .typeError("Must be a number")
        .positive("Must be positive")
        .required("Quantity is required"),
      contracted_price_per_unit: Yup.number()
        .typeError("Must be a number")
        .positive("Must be positive")
        .required("Price is required"),
      currency: Yup.string().required("Currency is required"),
      exchange_rate_to_ugx: Yup.string().test(
        "fx-required",
        "Exchange rate is required for non-UGX contracts",
        function (value) {
          if (this.parent.currency && this.parent.currency !== "UGX") {
            return Boolean(value && Number(value) > 0);
          }
          return true;
        },
      ),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Quantity stored in kg internally. If user typed MT, convert.
        const qtyKg = values.trade_unit === "tonne"
          ? Number(values.contracted_quantity_kg) * 1000
          : Number(values.contracted_quantity_kg);
        const payload: any = {
          buyer: values.buyer,
          hub: values.hub,
          grain_type: values.grain_type,
          contracted_quantity_kg: qtyKg,
          contracted_price_per_unit: Number(values.contracted_price_per_unit),
          currency: values.currency,
          trade_unit: values.trade_unit,
          payment_terms_days: values.payment_terms_days || 0,
          notes: values.notes || "",
        };
        if (values.currency !== "UGX" && values.exchange_rate_to_ugx) {
          payload.exchange_rate_to_ugx = Number(values.exchange_rate_to_ugx);
        }
        if (values.delivery_start_date) payload.delivery_start_date = values.delivery_start_date;
        if (values.delivery_end_date)   payload.delivery_end_date   = values.delivery_end_date;
        await SourcingService.createBuyerContract(payload);
        toast.success("Contract created");
        callBack?.();
        handleClose();
      } catch (e: any) {
        toast.error(
          e?.response?.data?.detail ||
          JSON.stringify(e?.response?.data) ||
          "Failed to create contract",
        );
      } finally {
        setLoading(false);
      }
    },
  });

  const isNonUGX = form.values.currency && form.values.currency !== "UGX";

  return (
    <ModalDialog
      title="New Buyer Contract"
      id={modalId}
      open
      onClose={handleClose}
      maxWidth="md"
      ActionButtons={() => (
        <>
          <Button onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => form.handleSubmit()}
            disabled={loading}
          >
            {loading ? <ProgressIndicator color="inherit" size={20} /> : "Create Contract"}
          </Button>
        </>
      )}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Alert severity="info">
            A contract represents a multi-delivery commitment (e.g. UNGA 400 MT across many trucks).
            Each truckload will be a child <strong>Buyer Order</strong> linked to this contract.
          </Alert>
        </Grid>

        {/* Buyer */}
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={buyers}
            getOptionLabel={(o: any) => o.business_name || ""}
            value={selectedBuyer}
            onChange={(_, val) => {
              setSelectedBuyer(val);
              form.setFieldValue("buyer", val?.id || "");
            }}
            onInputChange={(_, val) => setBuyerSearch(val)}
            loading={buyersLoading}
            renderInput={params => (
              <TextField
                {...params}
                label="Buyer *"
                error={Boolean(form.touched.buyer && form.errors.buyer)}
                helperText={form.touched.buyer ? (form.errors.buyer as string) : ""}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {buyersLoading && <CircularProgress color="inherit" size={18} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Hub */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Hub *</InputLabel>
            <Select
              value={form.values.hub} label="Hub *"
              onChange={e => form.setFieldValue("hub", e.target.value)}
            >
              {hubs.map(h => <MenuItem key={h.value} value={h.value}>{h.label}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>

        {/* Grain type */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Product Type *</InputLabel>
            <Select
              value={form.values.grain_type} label="Product Type *"
              onChange={e => form.setFieldValue("grain_type", e.target.value)}
            >
              {grainTypes.map(g => <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>

        {/* Trade unit */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Trade Unit</InputLabel>
            <Select
              value={form.values.trade_unit} label="Trade Unit"
              onChange={e => form.setFieldValue("trade_unit", e.target.value)}
            >
              <MenuItem value="kg">Kilograms (kg)</MenuItem>
              <MenuItem value="tonne">Metric Tonnes (MT)</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Quantity */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth label={`Contracted Quantity (${form.values.trade_unit === "tonne" ? "MT" : "kg"}) *`}
            type="number"
            value={form.values.contracted_quantity_kg}
            onChange={e => form.setFieldValue("contracted_quantity_kg", e.target.value)}
            error={Boolean(form.touched.contracted_quantity_kg && form.errors.contracted_quantity_kg)}
            helperText={form.touched.contracted_quantity_kg && (form.errors.contracted_quantity_kg as string)}
          />
        </Grid>

        {/* Price */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth label={`Price per ${form.values.trade_unit === "tonne" ? "MT" : "kg"} *`}
            type="number"
            value={form.values.contracted_price_per_unit}
            onChange={e => form.setFieldValue("contracted_price_per_unit", e.target.value)}
            error={Boolean(form.touched.contracted_price_per_unit && form.errors.contracted_price_per_unit)}
            helperText={form.touched.contracted_price_per_unit && (form.errors.contracted_price_per_unit as string)}
          />
        </Grid>

        {/* Currency */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Currency *</InputLabel>
            <Select
              value={form.values.currency} label="Currency *"
              onChange={e => form.setFieldValue("currency", e.target.value)}
            >
              <MenuItem value="UGX">UGX — Ugandan Shilling</MenuItem>
              <MenuItem value="USD">USD — US Dollar</MenuItem>
              <MenuItem value="EUR">EUR — Euro</MenuItem>
              <MenuItem value="GBP">GBP — British Pound</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Exchange rate */}
        {isNonUGX && (
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label={`Exchange Rate (1 ${form.values.currency} = ? UGX) *`}
              type="number"
              value={form.values.exchange_rate_to_ugx}
              onChange={e => form.setFieldValue("exchange_rate_to_ugx", e.target.value)}
              error={Boolean(form.touched.exchange_rate_to_ugx && form.errors.exchange_rate_to_ugx)}
              helperText={form.touched.exchange_rate_to_ugx ? (form.errors.exchange_rate_to_ugx as string) : `e.g. 3750`}
              inputProps={{ step: "0.0001" }}
            />
          </Grid>
        )}

        {/* Payment terms */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth label="Payment Terms (Days)"
            type="number"
            value={form.values.payment_terms_days}
            onChange={e => form.setFieldValue("payment_terms_days", parseInt(e.target.value) || 0)}
            helperText="0 = on delivery, 30 = Net 30"
          />
        </Grid>

        {/* Delivery window */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth label="Delivery Start Date"
            type="date" InputLabelProps={{ shrink: true }}
            value={form.values.delivery_start_date}
            onChange={e => form.setFieldValue("delivery_start_date", e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth label="Delivery End Date"
            type="date" InputLabelProps={{ shrink: true }}
            value={form.values.delivery_end_date}
            onChange={e => form.setFieldValue("delivery_end_date", e.target.value)}
          />
        </Grid>

        {/* Notes */}
        <Grid item xs={12}>
          <TextField
            fullWidth label="Notes" multiline rows={2}
            value={form.values.notes}
            onChange={e => form.setFieldValue("notes", e.target.value)}
          />
        </Grid>
      </Grid>
    </ModalDialog>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const BuyerContracts: FC = () => {
  useTitle("Buyer Contracts");
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<IBuyerContractsResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [hubs, setHubs] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => { fetchData(filters); }, [filters]);
  useEffect(() => {
    SourcingService.getHubs()
      .then(r => setHubs((r.results || r).map((h: any) => ({ value: h.id, label: h.name }))))
      .catch(() => {});
  }, []);

  const fetchData = async (params?: any) => {
    setLoading(true);
    try { setContracts(await SourcingService.getBuyerContracts(params)); }
    catch { toast.error("Failed to load contracts"); }
    finally { setLoading(false); }
  };

  const handleAction = async (action: "activate" | "complete" | "cancel", id: string) => {
    try {
      if (action === "activate") await SourcingService.activateBuyerContract(id);
      if (action === "complete") await SourcingService.completeBuyerContract(id);
      if (action === "cancel")   await SourcingService.cancelBuyerContract(id);
      toast.success("Updated");
      fetchData(filters);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed");
    }
  };

  const tableActions: IDropdownAction[] = [
    {
      label: "View / Manage",
      icon: <VisibilityIcon color="primary" />,
      onClick: (c: IBuyerContract) => navigate(`/admin/sourcing/buyer-contracts/${c.id}`),
    },
    {
      label: "Activate",
      icon: <PlayArrowIcon color="success" />,
      onClick: (c: IBuyerContract) => handleAction("activate", c.id),
      condition: (c: IBuyerContract) => c.status === "draft",
    },
    {
      label: "Mark Completed",
      icon: <DoneAllIcon color="success" />,
      onClick: (c: IBuyerContract) => handleAction("complete", c.id),
      condition: (c: IBuyerContract) => c.status === "active",
    },
    {
      label: "Cancel",
      icon: <CancelIcon color="error" />,
      onClick: (c: IBuyerContract) => { if (window.confirm("Cancel contract?")) handleAction("cancel", c.id); },
      condition: (c: IBuyerContract) => c.status !== "completed" && c.status !== "cancelled",
    },
  ];

  const columns = [
    {
      Header: "Contract #",
      accessor: "contract_number",
      minWidth: 170,
      Cell: ({ row }: any) => (
        <Typography color="primary" variant="body2" sx={{ fontWeight: 700, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
          onClick={() => navigate(`/admin/sourcing/buyer-contracts/${row.original.id}`)}>
          {row.original.contract_number}
        </Typography>
      ),
    },
    {
      Header: "Buyer",
      accessor: "buyer_name",
      minWidth: 200,
      Cell: ({ row }: any) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.original.buyer_detail?.business_name || row.original.buyer_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.original.grain_type_name} · {row.original.hub_name}
          </Typography>
        </Box>
      ),
    },
    {
      Header: "Volume",
      accessor: "contracted_quantity_kg",
      minWidth: 130,
      Cell: ({ row }: any) => {
        const kg = Number(row.original.contracted_quantity_kg);
        const display = row.original.trade_unit === "tonne"
          ? `${(kg / 1000).toLocaleString("en-UG", { maximumFractionDigits: 2 })} MT`
          : `${kg.toLocaleString("en-UG", { maximumFractionDigits: 0 })} kg`;
        return <Span sx={{ fontWeight: 600 }}>{display}</Span>;
      },
    },
    {
      Header: "Value",
      accessor: "contracted_total_value",
      minWidth: 150,
      Cell: ({ row }: any) => (
        <Span sx={{ fontWeight: 600 }}>
          {formatCurrency(row.original.contracted_total_value, row.original.currency)}
        </Span>
      ),
    },
    {
      Header: "Fulfilled",
      accessor: "fulfillment_pct",
      minWidth: 140,
      Cell: ({ row }: any) => {
        const pct = Math.min(Number(row.original.fulfillment_pct || 0), 100);
        return (
          <Box sx={{ minWidth: 120 }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>{pct.toFixed(1)}%</Typography>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{ height: 6, borderRadius: 3, mt: 0.25 }}
              color={pct >= 100 ? "success" : pct >= 60 ? "primary" : "warning"}
            />
          </Box>
        );
      },
    },
    {
      Header: "Orders",
      accessor: "child_order_count",
      minWidth: 90,
      Cell: ({ row }: any) => (
        <Chip label={row.original.child_order_count || 0} size="small" variant="outlined" />
      ),
    },
    {
      Header: "Status",
      accessor: "status",
      minWidth: 110,
      Cell: ({ row }: any) => (
        <Chip label={(row.original.status || "").toUpperCase()} color={STATUS_COLORS[row.original.status] ?? "default"} size="small" />
      ),
    },
    {
      Header: "Created",
      accessor: "created_at",
      minWidth: 110,
      Cell: ({ row }: any) => (
        <Span sx={{ fontSize: 12 }}>{formatDateToDDMMYYYY(row.original.created_at)}</Span>
      ),
    },
    {
      Header: "Action",
      accessor: "action",
      minWidth: 80,
      Cell: ({ row }: any) => <DropdownActionBtn actions={tableActions} metaData={row.original} />,
    },
  ];

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
        <HandshakeIcon sx={{ fontSize: 32, color: "primary.main" }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Buyer Contracts</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          Multi-delivery commitments — each truckload becomes a child buyer order.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <SearchInput
          value={searchQuery} type="text"
          placeholder="Search buyer or contract number..."
          onChange={(e: any) => setSearchQuery(e.target.value)}
          onKeyPress={(e: any) => {
            if (e.key === "Enter") setFilters({ ...filters, search: searchQuery, page: 1 });
          }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status || ""} label="Status"
            onChange={e => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}
          >
            <MenuItem value="">All</MenuItem>
            {["draft", "active", "completed", "cancelled"].map(s => (
              <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          sx={{ ml: "auto" }}
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreate(true)}
        >
          New Contract
        </Button>
      </Box>

      <CustomTable
        columnShape={columns}
        data={contracts?.results || []}
        dataCount={contracts?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(p: number) => setFilters({ ...filters, page: p + 1 })}
        pageIndex={filters.page - 1}
        setPageSize={(s: number) => setFilters({ ...filters, page_size: s, page: 1 })}
        loading={loading}
      />

      {showCreate && (
        <CreateContractForm
          hubs={hubs}
          handleClose={() => setShowCreate(false)}
          callBack={() => { setShowCreate(false); fetchData(filters); }}
        />
      )}
    </Box>
  );
};

export default BuyerContracts;
