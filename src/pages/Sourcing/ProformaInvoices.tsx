/**
 * ProformaInvoices.tsx
 *
 * Admin list + create page for Proforma Invoices (PFIs).
 *
 * FIXES:
 *  - created_by removed from form payload (set automatically by backend)
 *  - Row click navigates to detail page
 *  - PDF button in each table row
 *  - Edit lives on the detail page (no separate dialog here)
 */

import { FC, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, FormControl, Grid, InputLabel, MenuItem,
  Paper, Select, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Typography,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import AddIcon from "@mui/icons-material/Add";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import useTitle from "../../hooks/useTitle";
import LoadingScreen from "../../components/LoadingScreen";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import { SourcingService } from "./Sourcing.service";
import { IProformaInvoice } from "./Sourcing.interface";
import { formatCurrency } from "./SourcingConstants";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import ProformaInvoicePDFButton from "./ProformaInvoicePDFButton";

const PFI_STATUS_COLORS: Record<string, any> = {
  draft: "default", sent: "primary", accepted: "success",
  rejected: "error", expired: "warning",
};

// ─── Create PFI Form ──────────────────────────────────────────────────────────

const CreatePFIForm: FC<{
  open: boolean;
  prefillBuyerOrderId?: string;
  handleClose: () => void;
  callBack?: () => void;
}> = ({ open, prefillBuyerOrderId, handleClose, callBack }) => {
  const [loading, setLoading] = useState(false);
  // Store full buyer order data so we can read currency when one is selected
  const [buyerOrders, setBuyerOrders] = useState<{ value: string; label: string; currency: string }[]>([]);
  // Store grain types with unit labels so quantity/price labels can be dynamic
  const [grainTypes, setGrainTypes] = useState<{ value: string; label: string; unit_label: string; unit_of_measure: string }[]>([]);

  useEffect(() => {
    if (!open) return;
    SourcingService.getBuyerOrders({ status: "quotation", page_size: 100 })
      .then(r => setBuyerOrders(
        (r.results || []).map((o: any) => ({
          value: o.id,
          label: `${o.order_number} — ${o.buyer_detail?.business_name || o.buyer_name}`,
          currency: o.currency || "UGX",
        }))
      ))
      .catch(() => {});
    SourcingService.getGrainTypes()
      .then(r => setGrainTypes((r.results || r).map((g: any) => ({
        value: g.id,
        label: g.name,
        unit_label: g.unit_label || "kg",
        unit_of_measure: g.unit_of_measure || "kg",
      }))))
      .catch(() => {});
  }, [open]);

  const form = useFormik({
    initialValues: {
      buyer_order:                  prefillBuyerOrderId || "",
      grain_type:                   "",
      quantity_kg:                  "",
      unit_price:                   "",
      required_deposit:             "0",
      // ship_date is free text — no date picker
      ship_date:                    "",
      shipped_via:                  "",
      pick_from:                    "Ex-Warehouse",
      payment_terms_narrative:      "",
      delivery_timeline_narrative:  "",
      signatory_name:               "",
      signatory_title:              "",
      signatory_contact:            "",
      // expiry_date uses a date input → sends YYYY-MM-DD automatically
      expiry_date:                  "",
      notes:                        "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      buyer_order:  Yup.string().required("Buyer order is required"),
      grain_type:   Yup.string().required("Grain type is required"),
      quantity_kg:  Yup.number().positive("Must be positive").required("Quantity is required"),
      unit_price:   Yup.number().positive("Must be positive").required("Unit price is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // NOTE: created_by is intentionally NOT sent — the backend sets it
        // from request.user in perform_create. Sending it causes a 400 error
        // because it's a read-only field on the serializer.
        const payload: Record<string, any> = {
          buyer_order:                  values.buyer_order,
          grain_type:                   values.grain_type,
          quantity_kg:                  Number(values.quantity_kg),
          unit_price:                   Number(values.unit_price),
          required_deposit:             Number(values.required_deposit),
          ship_date:                    values.ship_date,
          shipped_via:                  values.shipped_via,
          pick_from:                    values.pick_from,
          payment_terms_narrative:      values.payment_terms_narrative,
          delivery_timeline_narrative:  values.delivery_timeline_narrative,
          signatory_name:               values.signatory_name,
          signatory_title:              values.signatory_title,
          signatory_contact:            values.signatory_contact,
          notes:                        values.notes,
        };
        // Only include expiry_date if the user actually set one
        if (values.expiry_date) payload.expiry_date = values.expiry_date;

        const pfi = await SourcingService.createProformaInvoice(payload as any);
        toast.success(`PFI ${pfi.pfi_number} created`);
        form.resetForm();
        callBack?.();
        handleClose();
      } catch (e: any) {
        const err = e?.response?.data;
        // Surface the most useful field error first
        const msg =
          err?.buyer_order?.[0] ||
          err?.grain_type?.[0]  ||
          err?.quantity_kg?.[0] ||
          err?.unit_price?.[0]  ||
          err?.created_by?.[0]  ||
          err?.non_field_errors?.[0] ||
          err?.detail ||
          "Failed to create PFI";
        toast.error(msg);
      } finally { setLoading(false); }
    },
  });

  // Derive currency from selected buyer order, unit label from selected grain type
  const selectedOrder = buyerOrders.find(o => o.value === form.values.buyer_order);
  const selectedGrain = grainTypes.find(g => g.value === form.values.grain_type);
  const pfiCurrency  = selectedOrder?.currency  || "UGX";
  const pfiUnitLabel = selectedGrain?.unit_label || "kg";

  return (
    <Dialog open={open} onClose={() => !loading && handleClose()} maxWidth="md" fullWidth>
      <DialogTitle>New Proforma Invoice (PFI)</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ pt: 1 }}>

          {/* Buyer Order */}
          <Grid item xs={12}>
            <FormControl fullWidth error={Boolean(form.touched.buyer_order && form.errors.buyer_order)}>
              <InputLabel>Buyer Order *</InputLabel>
              <Select
                value={form.values.buyer_order}
                label="Buyer Order *"
                onChange={e => form.setFieldValue("buyer_order", e.target.value)}
              >
                {buyerOrders.map(o => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
              {form.touched.buyer_order && form.errors.buyer_order && (
                <Typography variant="caption" color="error">{form.errors.buyer_order as string}</Typography>
              )}
            </FormControl>
          </Grid>

          {/* Show inherited currency from buyer order */}
          {selectedOrder && pfiCurrency !== "UGX" && (
            <Grid item xs={12}>
              <Alert severity="info" sx={{ py: 0.5 }}>
                This order is in <strong>{pfiCurrency}</strong>. The unit price below should be entered in {pfiCurrency}.
              </Alert>
            </Grid>
          )}

          {/* Grain & pricing */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth error={Boolean(form.touched.grain_type && form.errors.grain_type)}>
              <InputLabel>Product Type *</InputLabel>
              <Select
                value={form.values.grain_type}
                label="Product Type *"
                onChange={e => form.setFieldValue("grain_type", e.target.value)}
              >
                {grainTypes.map(g => <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>)}
              </Select>
              {form.touched.grain_type && form.errors.grain_type && (
                <Typography variant="caption" color="error">{form.errors.grain_type as string}</Typography>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label={`Quantity (${pfiUnitLabel}) *`} type="number"
              value={form.values.quantity_kg}
              onChange={e => form.setFieldValue("quantity_kg", e.target.value)}
              error={Boolean(form.touched.quantity_kg && form.errors.quantity_kg)}
              helperText={form.touched.quantity_kg && form.errors.quantity_kg as string} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label={`Unit Price (${pfiCurrency}/${pfiUnitLabel}) *`} type="number"
              value={form.values.unit_price}
              onChange={e => form.setFieldValue("unit_price", e.target.value)}
              error={Boolean(form.touched.unit_price && form.errors.unit_price)}
              helperText={(form.touched.unit_price && form.errors.unit_price as string) || `Price per ${pfiUnitLabel} in ${pfiCurrency}`}
              inputProps={{ step: "0.0001" }} />
          </Grid>

          {/* Live sub-total preview */}
          {form.values.quantity_kg && form.values.unit_price && (
            <Grid item xs={12}>
              <Alert severity="info">
                Sub-total: <strong>
                  {pfiCurrency} {(Number(form.values.quantity_kg) * Number(form.values.unit_price)).toLocaleString("en-UG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
              </Alert>
            </Grid>
          )}

          {/* Deposit + expiry */}
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Required Deposit (UGX)" type="number"
              value={form.values.required_deposit}
              onChange={e => form.setFieldValue("required_deposit", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            {/*
              expiry_date: uses HTML date input which gives YYYY-MM-DD — exactly what the
              Django DateField expects. The browser renders a native date picker.
            */}
            <TextField fullWidth label="Expiry Date (optional)" type="date"
              value={form.values.expiry_date}
              onChange={e => form.setFieldValue("expiry_date", e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText="Date after which this PFI lapses" />
          </Grid>

          {/* Logistics */}
          <Grid item xs={12} md={4}>
            {/*
              ship_date is a free-text CharField — buyer-facing, can be "Various",
              "10th May 2026", etc. NOT a date input.
            */}
            <TextField fullWidth label="Ship Date" value={form.values.ship_date}
              onChange={e => form.setFieldValue("ship_date", e.target.value)}
              helperText='Free text — e.g. "10th May 2026" or "Various"' />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Shipped Via" value={form.values.shipped_via}
              onChange={e => form.setFieldValue("shipped_via", e.target.value)}
              helperText="e.g. Truck, Various" />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Pick From" value={form.values.pick_from}
              onChange={e => form.setFieldValue("pick_from", e.target.value)} />
          </Grid>

          {/* Signatory */}
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Signatory Name" value={form.values.signatory_name}
              onChange={e => form.setFieldValue("signatory_name", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Signatory Title" value={form.values.signatory_title}
              onChange={e => form.setFieldValue("signatory_title", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Signatory Contact" value={form.values.signatory_contact}
              onChange={e => form.setFieldValue("signatory_contact", e.target.value)} />
          </Grid>

          {/* Narratives */}
          <Grid item xs={12}>
            <TextField fullWidth label="Payment Terms" multiline rows={2}
              value={form.values.payment_terms_narrative}
              onChange={e => form.setFieldValue("payment_terms_narrative", e.target.value)}
              placeholder="e.g. 50% deposit required before loading, balance on delivery" />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Delivery Timeline" multiline rows={2}
              value={form.values.delivery_timeline_narrative}
              onChange={e => form.setFieldValue("delivery_timeline_narrative", e.target.value)}
              placeholder="e.g. Delivery within 5 business days of deposit confirmation" />
          </Grid>

          {/* Notes */}
          <Grid item xs={12}>
            <TextField fullWidth label="Notes" multiline rows={2}
              value={form.values.notes}
              onChange={e => form.setFieldValue("notes", e.target.value)} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" onClick={() => form.handleSubmit()} disabled={loading}
          startIcon={loading ? <ProgressIndicator color="inherit" size={18} /> : <AddIcon />}>
          {loading ? "Creating..." : "Create PFI"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Main List Page ───────────────────────────────────────────────────────────

const ProformaInvoices: FC = () => {
  useTitle("Proforma Invoices");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillBuyerOrderId = searchParams.get("buyer_order") || undefined;

  const [pfis, setPfis] = useState<IProformaInvoice[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(Boolean(prefillBuyerOrderId));
  const [rejectPFI, setRejectPFI] = useState<IProformaInvoice | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => { fetchData(); }, [page, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await SourcingService.getProformaInvoices({
        page,
        page_size: INITIAL_PAGE_SIZE,
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      setPfis(r.results || []);
      setCount(r.count || 0);
    } catch { toast.error("Failed to load PFIs"); }
    finally { setLoading(false); }
  };

  const handleAction = async (pfi: IProformaInvoice, action: "send" | "accept" | "expire") => {
    setActionLoading(pfi.id + action);
    try {
      if (action === "send")   await SourcingService.sendProformaInvoice(pfi.id);
      if (action === "accept") await SourcingService.acceptProformaInvoice(pfi.id);
      if (action === "expire") await SourcingService.expireProformaInvoice(pfi.id);
      toast.success(`PFI ${action}d`);
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || `Failed to ${action} PFI`);
    } finally { setActionLoading(null); }
  };

  const handleReject = async () => {
    if (!rejectPFI) return;
    setActionLoading(rejectPFI.id + "reject");
    try {
      await SourcingService.rejectProformaInvoice(rejectPFI.id, rejectReason);
      toast.success("PFI rejected");
      setRejectPFI(null);
      setRejectReason("");
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to reject PFI");
    } finally { setActionLoading(null); }
  };

  return (
    <Box pt={2} pb={4}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>Proforma Invoices</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowCreate(true)}>
          New PFI
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status"
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <MenuItem value="">All</MenuItem>
            {["draft", "sent", "accepted", "rejected", "expired"].map(s => (
              <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      {loading ? <LoadingScreen /> : (
        <Paper variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                {["PFI #", "Order #", "Buyer", "Grain", "Qty (kg)", "Unit Price", "Sub-total", "Status", "Sent At", "Actions"].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {pfis.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                    No proforma invoices found.
                  </TableCell>
                </TableRow>
              ) : pfis.map(pfi => (
                <TableRow
                  key={pfi.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/admin/sourcing/proforma-invoices/${pfi.id}`)}
                >
                  <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>{pfi.pfi_number}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2" color="primary" sx={{ fontWeight: 600 }}
                      onClick={e => { e.stopPropagation(); navigate(`/admin/sourcing/buyer-orders/${pfi.buyer_order}`); }}
                    >
                      {pfi.order_number}
                    </Typography>
                  </TableCell>
                  <TableCell>{pfi.buyer_name}</TableCell>
                  <TableCell>{pfi.grain_type_name}</TableCell>
                  <TableCell>{Number(pfi.quantity_kg).toLocaleString()}</TableCell>
                  <TableCell>{formatCurrency(pfi.unit_price)}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(pfi.sub_total)}</TableCell>
                  <TableCell>
                    <Chip label={pfi.status_display} color={PFI_STATUS_COLORS[pfi.status]} size="small" />
                  </TableCell>
                  <TableCell sx={{ fontSize: 12 }}>
                    {pfi.sent_at ? formatDateToDDMMYYYY(pfi.sent_at) : "—"}
                  </TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "nowrap", alignItems: "center" }}>
                      {/* PDF export — stop row click propagation */}
                      <ProformaInvoicePDFButton pfi={pfi} compact size="small" />

                      {pfi.status === "draft" && (
                        <Button size="small" variant="outlined" startIcon={<SendIcon />}
                          disabled={actionLoading === pfi.id + "send"}
                          onClick={() => handleAction(pfi, "send")}>
                          Send
                        </Button>
                      )}
                      {pfi.status === "sent" && (
                        <>
                          <Button size="small" variant="contained" color="success" startIcon={<CheckCircleIcon />}
                            disabled={actionLoading === pfi.id + "accept"}
                            onClick={() => handleAction(pfi, "accept")}>
                            Accept
                          </Button>
                          <Button size="small" variant="outlined" color="error" startIcon={<CancelIcon />}
                            disabled={!!actionLoading}
                            onClick={() => { setRejectPFI(pfi); setRejectReason(""); }}>
                            Reject
                          </Button>
                        </>
                      )}
                      {["draft", "sent"].includes(pfi.status) && (
                        <Button size="small" variant="text" color="warning"
                          disabled={!!actionLoading}
                          onClick={() => handleAction(pfi, "expire")}>
                          Expire
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {count > INITIAL_PAGE_SIZE && (
            <Box sx={{ display: "flex", justifyContent: "center", gap: 1, p: 2 }}>
              <Button size="small" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Span sx={{ alignSelf: "center" }}>Page {page}</Span>
              <Button size="small" disabled={page * INITIAL_PAGE_SIZE >= count} onClick={() => setPage(p => p + 1)}>Next</Button>
            </Box>
          )}
        </Paper>
      )}

      {/* Create PFI dialog */}
      <CreatePFIForm
        open={showCreate}
        prefillBuyerOrderId={prefillBuyerOrderId}
        handleClose={() => setShowCreate(false)}
        callBack={fetchData}
      />

      {/* Reject PFI dialog */}
      <Dialog open={Boolean(rejectPFI)} onClose={() => setRejectPFI(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Reject PFI</DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            Rejecting <strong>{rejectPFI?.pfi_number}</strong>. Optionally provide a reason.
          </Typography>
          <TextField
            fullWidth label="Rejection Reason (optional)" multiline rows={3} sx={{ mt: 2 }}
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectPFI(null)} disabled={!!actionLoading}>Cancel</Button>
          <Button variant="contained" color="error"
            disabled={actionLoading === (rejectPFI?.id + "reject")}
            onClick={handleReject}>
            {actionLoading === (rejectPFI?.id + "reject") ? "Rejecting..." : "Reject PFI"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProformaInvoices;