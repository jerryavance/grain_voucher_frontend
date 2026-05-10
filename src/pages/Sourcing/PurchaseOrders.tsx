/**
 * PurchaseOrders.tsx
 *
 * Lists all Purchase Orders (outbound LPOs and inbound BPOs).
 * Filters: direction, status, date range, search.
 * Links to PurchaseOrderDetails.
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider,
  FormControl, InputLabel, MenuItem, Paper, Select,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography,
} from "@mui/material";
import {
  Add, Assignment, ArrowDownward, ArrowUpward, Refresh,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import SourcingService from "./Sourcing.service";
import { IPurchaseOrder, TPurchaseOrderDirection, TPurchaseOrderStatus } from "./Sourcing.interface";

// ─── Create PO Dialog ─────────────────────────────────────────────────────────

const EMPTY_FORM = {
  direction: "outbound" as TPurchaseOrderDirection,
  grain_type: "",
  quantity_kg: "",
  unit_price: "",
  currency: "UGX",
  trade_unit: "kg",
  delivery_location: "",
  delivery_date: "",
  payment_terms: "",
  notes: "",
};

const CreatePODialog: React.FC<{ open: boolean; onClose: () => void; onCreated: (po: IPurchaseOrder) => void }> = ({
  open, onClose, onCreated,
}) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [grainTypes, setGrainTypes] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      SourcingService.getGrainTypes().then(r => setGrainTypes(r.results || r)).catch(() => {});
    }
  }, [open]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) =>
    setForm(f => ({ ...f, [field]: (e.target as any).value }));

  const handleSubmit = async () => {
    if (!form.grain_type || !form.quantity_kg || !form.unit_price) {
      toast.error("Grain type, quantity and unit price are required");
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        direction:         form.direction,
        grain_type:        form.grain_type,
        quantity_kg:       form.quantity_kg,
        unit_price:        form.unit_price,
        currency:          form.currency,
        trade_unit:        form.trade_unit,
        delivery_location: form.delivery_location || undefined,
        delivery_date:     form.delivery_date || undefined,
        payment_terms:     form.payment_terms || undefined,
        notes:             form.notes || undefined,
      };
      const created = await SourcingService.createPurchaseOrder(payload);
      toast.success(`Purchase Order ${created.po_number} created`);
      onCreated(created);
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data ? JSON.stringify(err.response.data) : "Failed to create";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>New Purchase Order</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "12px !important" }}>
        <FormControl size="small" fullWidth>
          <InputLabel>Direction</InputLabel>
          <Select value={form.direction} label="Direction" onChange={set("direction") as any}>
            <MenuItem value="outbound">Outbound LPO (to Supplier)</MenuItem>
            <MenuItem value="inbound">Inbound BPO (from Buyer)</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" fullWidth>
          <InputLabel>Grain Type *</InputLabel>
          <Select value={form.grain_type} label="Grain Type *" onChange={set("grain_type") as any}>
            {grainTypes.map((g: any) => (
              <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <TextField size="small" label="Quantity *" type="number" value={form.quantity_kg}
            onChange={set("quantity_kg")} fullWidth inputProps={{ min: 0 }} />
          <FormControl size="small" sx={{ minWidth: 90 }}>
            <InputLabel>Unit</InputLabel>
            <Select value={form.trade_unit} label="Unit" onChange={set("trade_unit") as any}>
              <MenuItem value="kg">kg</MenuItem>
              <MenuItem value="mt">MT</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <TextField size="small" label="Unit Price *" type="number" value={form.unit_price}
            onChange={set("unit_price")} fullWidth inputProps={{ min: 0 }} />
          <FormControl size="small" sx={{ minWidth: 90 }}>
            <InputLabel>Currency</InputLabel>
            <Select value={form.currency} label="Currency" onChange={set("currency") as any}>
              <MenuItem value="UGX">UGX</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TextField size="small" label="Delivery Location" value={form.delivery_location}
          onChange={set("delivery_location")} fullWidth />
        <TextField size="small" label="Delivery Date" type="date" value={form.delivery_date}
          onChange={set("delivery_date")} fullWidth InputLabelProps={{ shrink: true }} />
        <TextField size="small" label="Payment Terms" value={form.payment_terms}
          onChange={set("payment_terms")} fullWidth placeholder="e.g. Net 30 days, Cash on delivery" />
        <TextField size="small" label="Notes" value={form.notes}
          onChange={set("notes")} fullWidth multiline rows={2} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {saving ? "Creating…" : "Create Purchase Order"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtUGX = (v: number | string) =>
  `UGX ${Number(v || 0).toLocaleString("en-UG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const DIRECTION_COLORS: Record<string, "success" | "primary"> = {
  outbound: "success",
  inbound:  "primary",
};

const STATUS_COLORS: Record<string, "default" | "info" | "warning" | "success" | "error"> = {
  draft:        "default",
  sent:         "info",
  acknowledged: "warning",
  fulfilled:    "success",
  cancelled:    "error",
};

const STATUS_OPTIONS: { value: TPurchaseOrderStatus | ""; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "draft",        label: "Draft" },
  { value: "sent",         label: "Sent / Received" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "fulfilled",    label: "Fulfilled" },
  { value: "cancelled",    label: "Cancelled" },
];

// ─── Component ────────────────────────────────────────────────────────────────

const PurchaseOrders: React.FC = () => {
  const navigate = useNavigate();

  const [orders, setOrders]   = useState<IPurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Filters
  const [direction, setDirection] = useState<TPurchaseOrderDirection | "">("");
  const [status,    setStatus]    = useState<TPurchaseOrderStatus   | "">("");
  const [dateFrom,  setDateFrom]  = useState("");
  const [dateTo,    setDateTo]    = useState("");
  const [search,    setSearch]    = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {};
      if (direction) params.direction  = direction;
      if (status)    params.status     = status;
      if (dateFrom)  params.date_from  = dateFrom;
      if (dateTo)    params.date_to    = dateTo;
      if (search)    params.search     = search;

      const data = await SourcingService.getPurchaseOrders(params);
      setOrders(data.results ?? []);
    } catch {
      setError("Failed to load purchase orders.");
    } finally {
      setLoading(false);
    }
  }, [direction, status, dateFrom, dateTo, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Summary counts
  const outboundCount = orders.filter(o => o.direction === "outbound").length;
  const inboundCount  = orders.filter(o => o.direction === "inbound").length;
  const totalValue    = orders.reduce((s, o) => s + Number(o.total_amount || 0), 0);

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      {/* Page Title */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Assignment color="primary" />
          <Typography variant="h5" fontWeight={700}>Purchase Orders / LPOs</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowCreate(true)}
          size="small"
        >
          New Purchase Order
        </Button>
      </Box>

      {/* Summary cards */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        {[
          { label: "Outbound LPOs", value: outboundCount, icon: <ArrowUpward fontSize="small" color="success" />, color: "success.light" },
          { label: "Inbound BPOs",  value: inboundCount,  icon: <ArrowDownward fontSize="small" color="primary" />, color: "primary.light" },
          { label: "Total Orders",  value: orders.length,  icon: <Assignment fontSize="small" />, color: "grey.200" },
          { label: "Total Value",   value: fmtUGX(totalValue), icon: null, color: "grey.200" },
        ].map(card => (
          <Paper key={card.label} variant="outlined" sx={{ p: 1.5, minWidth: 160, bgcolor: card.color, flex: "1 1 150px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {card.icon}
              <Typography variant="caption" color="text.secondary">{card.label}</Typography>
            </Box>
            <Typography variant="h6" fontWeight={700}>{card.value}</Typography>
          </Paper>
        ))}
      </Box>

      {/* Filters */}
      <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Direction</InputLabel>
            <Select value={direction} label="Direction" onChange={e => setDirection(e.target.value as any)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="outbound">Outbound (LPO)</MenuItem>
              <MenuItem value="inbound">Inbound (BPO)</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={e => setStatus(e.target.value as any)}>
              {STATUS_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField
            size="small" label="From" type="date"
            value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            InputLabelProps={{ shrink: true }} sx={{ minWidth: 140 }}
          />
          <TextField
            size="small" label="To" type="date"
            value={dateTo} onChange={e => setDateTo(e.target.value)}
            InputLabelProps={{ shrink: true }} sx={{ minWidth: 140 }}
          />
          <TextField
            size="small" label="Search" placeholder="PO number, buyer ref…"
            value={search} onChange={e => setSearch(e.target.value)}
            sx={{ minWidth: 200 }}
          />

          <Button
            size="small" variant="outlined" startIcon={<Refresh />}
            onClick={fetchOrders}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* Error */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Table */}
      <Paper variant="outlined">
        <TableContainer>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>PO Number</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Direction</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Party</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Grain Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Qty (kg)</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Total Amount</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Issued</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Issued By</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    No purchase orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders.map(po => (
                  <TableRow
                    key={po.id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate(po.id)}
                  >
                    <TableCell>
                      <Typography fontWeight={600} variant="body2" color="primary">
                        {po.po_number}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={DIRECTION_COLORS[po.direction] ?? "default"}
                        icon={po.direction === "outbound" ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
                        label={po.direction === "outbound" ? "Outbound LPO" : "Inbound BPO"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={STATUS_COLORS[po.status] ?? "default"}
                        label={po.status_display}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {po.direction === "outbound" ? po.supplier_name : po.buyer_name}
                      </Typography>
                      {po.direction === "outbound" && po.source_order_number && (
                        <Typography variant="caption" color="text.secondary">
                          SO: {po.source_order_number}
                        </Typography>
                      )}
                      {po.direction === "inbound" && po.buyer_reference && (
                        <Typography variant="caption" color="text.secondary">
                          Ref: {po.buyer_reference}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{po.grain_type_name}</TableCell>
                    <TableCell align="right">
                      {Number(po.quantity_kg).toLocaleString("en-UG", { maximumFractionDigits: 0 })}
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600} variant="body2">
                        {fmtUGX(po.total_amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>{fmtDate(po.issued_at)}</TableCell>
                    <TableCell>{po.issued_by_name}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {!loading && orders.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1.5, display: "flex", justifyContent: "flex-end" }}>
              <Typography variant="body2" color="text.secondary">
                {orders.length} order{orders.length !== 1 ? "s" : ""} · Total value: <strong>{fmtUGX(totalValue)}</strong>
              </Typography>
            </Box>
          </>
        )}
      </Paper>

      <CreatePODialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(po) => {
          setOrders(prev => [po, ...prev]);
          navigate(po.id);
        }}
      />
    </Box>
  );
};

export default PurchaseOrders;
