/**
 * PurchaseOrderDetails.tsx
 *
 * Detail view for a single Purchase Order (LPO or BPO).
 * Shows all fields, allows status updates, and prints PDF.
 */

import React, { useEffect, useState } from "react";
import {
  Alert, Box, Button, Chip, CircularProgress, Divider,
  FormControl, Grid, InputLabel, MenuItem, Paper, Select,
  Skeleton, Stack, Typography,
} from "@mui/material";
import {
  ArrowBack, ArrowDownward, ArrowUpward, Assignment,
  CheckCircleOutline, Edit, PictureAsPdf,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import SourcingService from "./Sourcing.service";
import { IPurchaseOrder } from "./Sourcing.interface";
import PurchaseOrderPDFButton from "./PurchaseOrderPDFButton";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtMoney = (v: string | number | null | undefined, currency = "UGX") =>
  `${currency} ${Number(v || 0).toLocaleString("en-UG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

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

const STATUS_FLOW: Record<string, string[]> = {
  draft:        ["sent", "cancelled"],
  sent:         ["acknowledged", "cancelled"],
  acknowledged: ["fulfilled", "cancelled"],
  fulfilled:    [],
  cancelled:    [],
};

// ─── Field row ────────────────────────────────────────────────────────────────

const Field: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={500} sx={{ mt: 0.25 }}>
      {value ?? "—"}
    </Typography>
  </Box>
);

// ─── Component ────────────────────────────────────────────────────────────────

const PurchaseOrderDetails: React.FC = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [po,      setPo]      = useState<IPurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus,      setNewStatus]      = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    SourcingService.getPurchaseOrderDetails(id)
      .then(d => {
        setPo(d);
        setError(null);
      })
      .catch(() => setError("Failed to load purchase order."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!po || !newStatus) return;
    setUpdatingStatus(true);
    try {
      const updated = await SourcingService.updatePurchaseOrderStatus(po.id, newStatus);
      setPo(updated);
      setNewStatus("");
      toast.success(`Status updated to ${updated.status_display}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={300} />
      </Box>
    );
  }

  if (error || !po) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error ?? "Purchase order not found."}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mt: 1 }}>
          Back
        </Button>
      </Box>
    );
  }

  const isOutbound    = po.direction === "outbound";
  const nextStatuses  = STATUS_FLOW[po.status] ?? [];
  const headerBg      = isOutbound ? "success.main" : "primary.main";
  const tradeUnit     = po.trade_unit || "kg";
  const isMT          = tradeUnit === "tonne";
  const unitLabel     = isMT ? "MT" : "kg";
  const qtyKg         = Number(po.quantity_kg || 0);
  const unitPriceKg   = Number(po.unit_price  || 0);
  const qtyDisplay    = isMT ? qtyKg / 1000 : qtyKg;
  const unitPriceDisp = isMT ? unitPriceKg * 1000 : unitPriceKg;

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Button size="small" startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <Divider orientation="vertical" flexItem />
        <Assignment color={isOutbound ? "success" : "primary"} />
        <Typography variant="h5" fontWeight={700}>{po.po_number}</Typography>
        <Chip
          size="small"
          color={DIRECTION_COLORS[po.direction] ?? "default"}
          icon={isOutbound ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
          label={po.direction_display}
          variant="outlined"
        />
        <Chip
          size="small"
          color={STATUS_COLORS[po.status] ?? "default"}
          label={po.status_display}
        />
        <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
          <PurchaseOrderPDFButton po={po} />
        </Box>
      </Box>

      <Grid container spacing={2}>
        {/* Left column — details */}
        <Grid item xs={12} md={8}>
          {/* Party info */}
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: isOutbound ? "success.main" : "primary.main" }}>
              {isOutbound ? "Outbound — AMSAF issues LPO to Supplier" : "Inbound — Buyer issues BPO to AMSAF"}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 1.5, borderLeft: `3px solid`, borderLeftColor: isOutbound ? "success.main" : "primary.main" }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    {isOutbound ? "ISSUER (BUYER)" : "BUYER"}
                  </Typography>
                  <Typography fontWeight={700}>
                    {isOutbound ? "Bennu Agfin Services Limited" : po.buyer_name}
                  </Typography>
                  {isOutbound && (
                    <Typography variant="caption" color="text.secondary">
                      Plot 16 Mackinnon Road, Nakasero, Kampala
                    </Typography>
                  )}
                  {!isOutbound && po.buyer_reference && (
                    <Typography variant="caption" color="text.secondary">
                      Ref: {po.buyer_reference}
                    </Typography>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 1.5, borderLeft: `3px solid`, borderLeftColor: isOutbound ? "warning.main" : "success.main" }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    {isOutbound ? "SUPPLIER" : "RECEIVER (AMSAF)"}
                  </Typography>
                  <Typography fontWeight={700}>
                    {isOutbound ? po.supplier_name : "Bennu Agfin Services Limited"}
                  </Typography>
                  {isOutbound && po.source_order_number && (
                    <Typography variant="caption" color="text.secondary">
                      Source Order: {po.source_order_number}
                    </Typography>
                  )}
                  {!isOutbound && (
                    <Typography variant="caption" color="text.secondary">
                      Plot 16 Mackinnon Road, Nakasero, Kampala
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          {/* Product details */}
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Product Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}><Field label="Grain Type" value={po.grain_type_name} /></Grid>
              <Grid item xs={6} sm={3}>
                <Field label={`Quantity (${unitLabel})`}
                  value={qtyDisplay.toLocaleString("en-UG", { maximumFractionDigits: isMT ? 4 : 2 })} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Field label={`Unit Price (${po.currency}/${unitLabel})`}
                  value={fmtMoney(unitPriceDisp, po.currency)} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Field label="Currency" value={po.currency} />
              </Grid>
            </Grid>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="caption" color="text.secondary">Total Order Value</Typography>
                <Typography variant="h5" fontWeight={800} color={isOutbound ? "success.main" : "primary.main"}>
                  {fmtMoney(po.total_amount, po.currency)}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Quality & terms */}
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Terms & Conditions</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><Field label="Delivery Location" value={po.delivery_location || "—"} /></Grid>
              <Grid item xs={12} sm={6}><Field label="Delivery Date" value={po.delivery_date || "—"} /></Grid>
              <Grid item xs={12}><Field label="Payment Terms" value={po.payment_terms || "—"} /></Grid>
              {po.quality_spec && (
                <Grid item xs={12}><Field label="Quality Specification" value={po.quality_spec} /></Grid>
              )}
              {po.notes && (
                <Grid item xs={12}>
                  <Box sx={{ bgcolor: "warning.50", border: "1px solid", borderColor: "warning.200", borderRadius: 1, p: 1.5 }}>
                    <Typography variant="caption" fontWeight={700} color="warning.dark">Notes</Typography>
                    <Typography variant="body2" sx={{ mt: 0.25 }}>{po.notes}</Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Right column — status & audit */}
        <Grid item xs={12} md={4}>
          {/* Status panel */}
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Status Management</Typography>

            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Current Status</Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  color={STATUS_COLORS[po.status] ?? "default"}
                  label={po.status_display}
                  icon={<CheckCircleOutline />}
                />
              </Box>
            </Box>

            {nextStatuses.length > 0 && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
                  Advance Status
                </Typography>
                <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                  <InputLabel>New Status</InputLabel>
                  <Select value={newStatus} label="New Status" onChange={e => setNewStatus(e.target.value)}>
                    {nextStatuses.map(s => (
                      <MenuItem key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ")}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  fullWidth variant="contained" size="small"
                  disabled={!newStatus || updatingStatus}
                  onClick={handleStatusUpdate}
                  startIcon={updatingStatus ? <CircularProgress size={14} /> : <CheckCircleOutline />}
                >
                  {updatingStatus ? "Updating…" : "Update Status"}
                </Button>
              </>
            )}
          </Paper>

          {/* Audit info */}
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Audit Information</Typography>
            <Stack spacing={1.5}>
              <Field label="PO Number"  value={po.po_number} />
              <Field label="Issued By"  value={po.issued_by_name} />
              <Field label="Issued At"  value={fmtDate(po.issued_at)} />
              <Field label="Updated At" value={fmtDate(po.updated_at)} />
              {po.source_order_number && (
                <Field label="Source Order" value={
                  <Button size="small" variant="text" sx={{ p: 0, minWidth: 0 }}
                    onClick={() => navigate(`/sourcing/source-orders/${po.source_order}`)}>
                    {po.source_order_number}
                  </Button>
                } />
              )}
              {po.buyer_order_number && (
                <Field label="Buyer Order" value={
                  <Button size="small" variant="text" sx={{ p: 0, minWidth: 0 }}
                    onClick={() => navigate(`/sourcing/buyer-orders/${po.buyer_order}`)}>
                    {po.buyer_order_number}
                  </Button>
                } />
              )}
            </Stack>
          </Paper>

          {/* PDF action */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Document</Typography>
            <PurchaseOrderPDFButton po={po} size="small" />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PurchaseOrderDetails;
