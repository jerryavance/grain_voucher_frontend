/**
 * ProformaInvoiceDetails.tsx
 *
 * Detail page for a single Proforma Invoice.
 * Route: /admin/sourcing/proforma-invoices/:id
 *
 * Features:
 *   - Full PFI detail display (all fields)
 *   - Lifecycle action buttons: Send → Accept | Reject → Expire
 *   - Edit dialog (PATCH) for draft/sent PFIs — all editable fields
 *   - PDF export via ProformaInvoicePDFButton
 *   - Link back to parent BuyerOrder
 */

import { FC, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert, Box, Button, Card, CardContent, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, FormControl, Grid, InputLabel,
  MenuItem, Select, TextField, Typography,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import useTitle from "../../hooks/useTitle";
import LoadingScreen from "../../components/LoadingScreen";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { SourcingService } from "./Sourcing.service";
import { IProformaInvoice } from "./Sourcing.interface";
import { formatCurrency } from "./SourcingConstants";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import ProformaInvoicePDFButton from "./ProformaInvoicePDFButton";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PFI_STATUS_COLORS: Record<string, any> = {
  draft: "default", sent: "primary", accepted: "success",
  rejected: "error", expired: "warning",
};

const InfoRow: FC<{ label: string; value?: string | null; mono?: boolean }> = ({ label, value, mono }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.8, borderBottom: "1px solid #f0f4fa" }}>
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 180 }}>{label}</Typography>
    <Typography variant="body2" fontWeight={600} sx={{ fontFamily: mono ? "monospace" : undefined, textAlign: "right" }}>
      {value || "—"}
    </Typography>
  </Box>
);

// ─── Edit PFI Dialog ──────────────────────────────────────────────────────────

const EditPFIDialog: FC<{
  open: boolean;
  pfi: IProformaInvoice;
  handleClose: () => void;
  callBack: () => void;
}> = ({ open, pfi, handleClose, callBack }) => {
  const [loading, setLoading] = useState(false);
  const [grainTypes, setGrainTypes] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    if (!open) return;
    SourcingService.getGrainTypes()
      .then(r => setGrainTypes((r.results || r).map((g: any) => ({ value: g.id, label: g.name }))))
      .catch(() => {});
  }, [open]);

  const form = useFormik({
    initialValues: {
      grain_type:                   pfi.grain_type || "",
      quantity_kg:                  pfi.quantity_kg || "",
      unit_price:                   pfi.unit_price || "",
      required_deposit:             pfi.required_deposit || "0",
      ship_date:                    pfi.ship_date || "",
      shipped_via:                  pfi.shipped_via || "",
      pick_from:                    pfi.pick_from || "Ex-Warehouse",
      payment_terms_narrative:      pfi.payment_terms_narrative || "",
      delivery_timeline_narrative:  pfi.delivery_timeline_narrative || "",
      bank_name:                    pfi.bank_name || "",
      account_number:               pfi.account_number || "",
      account_name:                 pfi.account_name || "",
      swift_code:                   pfi.swift_code || "",
      sort_code:                    pfi.sort_code || "",
      signatory_name:               pfi.signatory_name || "",
      signatory_title:              pfi.signatory_title || "",
      signatory_contact:            pfi.signatory_contact || "",
      // expiry_date must be YYYY-MM-DD for the date input
      expiry_date:                  pfi.expiry_date || "",
      notes:                        pfi.notes || "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      grain_type:  Yup.string().required("Grain type is required"),
      quantity_kg: Yup.number().positive("Must be positive").required("Required"),
      unit_price:  Yup.number().positive("Must be positive").required("Required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await SourcingService.updateProformaInvoice(pfi.id, values as any);
        toast.success("PFI updated");
        callBack();
        handleClose();
      } catch (e: any) {
        const err = e?.response?.data;
        toast.error(
          err?.grain_type?.[0] || err?.quantity_kg?.[0] || err?.unit_price?.[0] ||
          err?.non_field_errors?.[0] || err?.detail || "Failed to update PFI"
        );
      } finally { setLoading(false); }
    },
  });

  return (
    <Dialog open={open} onClose={() => !loading && handleClose()} maxWidth="md" fullWidth>
      <DialogTitle>Edit PFI — {pfi.pfi_number}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          {/* Grain + pricing */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Grain & Pricing</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth error={Boolean(form.touched.grain_type && form.errors.grain_type)}>
              <InputLabel>Grain Type *</InputLabel>
              <Select value={form.values.grain_type} label="Grain Type *"
                onChange={e => form.setFieldValue("grain_type", e.target.value)}>
                {grainTypes.map(g => <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>)}
              </Select>
              {form.touched.grain_type && form.errors.grain_type && (
                <Typography variant="caption" color="error">{form.errors.grain_type as string}</Typography>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Quantity (kg) *" type="number"
              value={form.values.quantity_kg}
              onChange={e => form.setFieldValue("quantity_kg", e.target.value)}
              error={Boolean(form.touched.quantity_kg && form.errors.quantity_kg)}
              helperText={form.touched.quantity_kg && form.errors.quantity_kg as string} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Unit Price (UGX/kg) *" type="number"
              value={form.values.unit_price}
              onChange={e => form.setFieldValue("unit_price", e.target.value)}
              error={Boolean(form.touched.unit_price && form.errors.unit_price)}
              helperText={form.touched.unit_price && form.errors.unit_price as string} />
          </Grid>
          {form.values.quantity_kg && form.values.unit_price && (
            <Grid item xs={12}>
              <Alert severity="info">
                Sub-total: <strong>{formatCurrency(Number(form.values.quantity_kg) * Number(form.values.unit_price))}</strong>
              </Alert>
            </Grid>
          )}
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Required Deposit (UGX)" type="number"
              value={form.values.required_deposit}
              onChange={e => form.setFieldValue("required_deposit", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Expiry Date" type="date"
              value={form.values.expiry_date}
              onChange={e => form.setFieldValue("expiry_date", e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText="YYYY-MM-DD format" />
          </Grid>

          {/* Logistics */}
          <Grid item xs={12}><Divider /><Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Logistics</Typography></Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Ship Date" value={form.values.ship_date}
              onChange={e => form.setFieldValue("ship_date", e.target.value)}
              helperText="Free text e.g. 'Various' or '10th May 2026'" />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Shipped Via" value={form.values.shipped_via}
              onChange={e => form.setFieldValue("shipped_via", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Pick From" value={form.values.pick_from}
              onChange={e => form.setFieldValue("pick_from", e.target.value)} />
          </Grid>

          {/* Narratives */}
          <Grid item xs={12}><Divider /><Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Terms & Timeline</Typography></Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Payment Terms" multiline rows={3}
              value={form.values.payment_terms_narrative}
              onChange={e => form.setFieldValue("payment_terms_narrative", e.target.value)}
              placeholder="e.g. 50% deposit required before loading, balance on delivery" />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Delivery Timeline" multiline rows={3}
              value={form.values.delivery_timeline_narrative}
              onChange={e => form.setFieldValue("delivery_timeline_narrative", e.target.value)}
              placeholder="e.g. Delivery within 5 business days of deposit confirmation" />
          </Grid>

          {/* Bank */}
          <Grid item xs={12}><Divider /><Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Bank Details (leave blank to use Bennu defaults)</Typography></Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Bank Name" value={form.values.bank_name}
              onChange={e => form.setFieldValue("bank_name", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Account Number" value={form.values.account_number}
              onChange={e => form.setFieldValue("account_number", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Account Name" value={form.values.account_name}
              onChange={e => form.setFieldValue("account_name", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="SWIFT Code" value={form.values.swift_code}
              onChange={e => form.setFieldValue("swift_code", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Sort Code" value={form.values.sort_code}
              onChange={e => form.setFieldValue("sort_code", e.target.value)} />
          </Grid>

          {/* Signatory */}
          <Grid item xs={12}><Divider /><Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Signatory</Typography></Grid>
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
          startIcon={loading ? <ProgressIndicator color="inherit" size={18} /> : <EditIcon />}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Reject Dialog ────────────────────────────────────────────────────────────

const RejectDialog: FC<{
  open: boolean;
  pfi: IProformaInvoice;
  handleClose: () => void;
  callBack: () => void;
}> = ({ open, pfi, handleClose, callBack }) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    setLoading(true);
    try {
      await SourcingService.rejectProformaInvoice(pfi.id, reason);
      toast.success("PFI rejected");
      callBack();
      handleClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to reject PFI");
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={() => !loading && handleClose()} maxWidth="xs" fullWidth>
      <DialogTitle>Reject PFI — {pfi.pfi_number}</DialogTitle>
      <DialogContent dividers>
        <TextField fullWidth label="Rejection Reason (optional)" multiline rows={3}
          value={reason} onChange={e => setReason(e.target.value)} sx={{ mt: 1 }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" color="error" disabled={loading} onClick={handleReject}>
          {loading ? "Rejecting..." : "Reject PFI"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ProformaInvoiceDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pfi, setPfi] = useState<IProformaInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showReject, setShowReject] = useState(false);

  useTitle(pfi ? `PFI — ${pfi.pfi_number}` : "Proforma Invoice");

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      setPfi(await SourcingService.getProformaInvoiceDetails(id));
    } catch {
      toast.error("Failed to load PFI");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleAction = async (action: "send" | "accept" | "expire") => {
    if (!pfi) return;
    setActionLoading(true);
    try {
      if (action === "send")   await SourcingService.sendProformaInvoice(pfi.id);
      if (action === "accept") await SourcingService.acceptProformaInvoice(pfi.id);
      if (action === "expire") await SourcingService.expireProformaInvoice(pfi.id);
      toast.success(`PFI ${action}ed`);
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || `Failed to ${action} PFI`);
    } finally { setActionLoading(false); }
  };

  if (loading) return <LoadingScreen />;
  if (!pfi) return <Alert severity="error">PFI not found.</Alert>;

  const canEdit = ["draft", "sent"].includes(pfi.status);

  return (
    <Box pt={2} pb={6}>
      {/* ── Top bar ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} size="small">
          Back
        </Button>
        <Typography variant="h5" fontWeight={700} sx={{ flexGrow: 1 }}>
          {pfi.pfi_number}
        </Typography>
        <Chip label={pfi.status_display} color={PFI_STATUS_COLORS[pfi.status]} />
        {/* PDF export */}
        <ProformaInvoicePDFButton pfi={pfi} size="small" />
        {/* Edit (only for draft/sent) */}
        {canEdit && (
          <Button size="small" variant="outlined" startIcon={<EditIcon />}
            onClick={() => setShowEdit(true)}>
            Edit
          </Button>
        )}
        {/* Lifecycle buttons */}
        {pfi.status === "draft" && (
          <Button size="small" variant="contained" startIcon={<SendIcon />}
            disabled={actionLoading} onClick={() => handleAction("send")}>
            Send to Buyer
          </Button>
        )}
        {pfi.status === "sent" && (
          <>
            <Button size="small" variant="contained" color="success" startIcon={<CheckCircleIcon />}
              disabled={actionLoading} onClick={() => handleAction("accept")}>
              Accept
            </Button>
            <Button size="small" variant="outlined" color="error" startIcon={<CancelIcon />}
              disabled={actionLoading} onClick={() => setShowReject(true)}>
              Reject
            </Button>
          </>
        )}
        {["draft", "sent"].includes(pfi.status) && (
          <Button size="small" variant="text" color="warning"
            disabled={actionLoading} onClick={() => handleAction("expire")}>
            Expire
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* ── Left column ── */}
        <Grid item xs={12} md={7}>

          {/* Core details */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>Quotation Details</Typography>
              <InfoRow label="PFI Number"    value={pfi.pfi_number} mono />
              <InfoRow label="Buyer Order"   value={pfi.order_number} />
              <InfoRow label="Buyer"         value={pfi.buyer_name} />
              <InfoRow label="Grain Type"    value={pfi.grain_type_name} />
              <InfoRow label="Quantity"      value={`${Number(pfi.quantity_kg).toLocaleString()} kg`} />
              <InfoRow label="Unit Price"    value={formatCurrency(pfi.unit_price)} />
              <InfoRow label="Sub-Total"     value={formatCurrency(pfi.sub_total)} />
              <InfoRow label="Deposit Req."  value={formatCurrency(pfi.required_deposit)} />
              {Number(pfi.paid_deposit) > 0 && (
                <InfoRow label="Deposit Paid" value={formatCurrency(pfi.paid_deposit)} />
              )}
              <InfoRow label="Total Due"     value={formatCurrency(pfi.total_due)} />
            </CardContent>
          </Card>

          {/* Logistics */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>Logistics</Typography>
              <InfoRow label="Ship Date"    value={pfi.ship_date} />
              <InfoRow label="Shipped Via"  value={pfi.shipped_via} />
              <InfoRow label="Pick From"    value={pfi.pick_from} />
              <InfoRow label="Salesperson"  value={pfi.salesperson_name} />
            </CardContent>
          </Card>

          {/* Narratives */}
          {(pfi.payment_terms_narrative || pfi.delivery_timeline_narrative) && (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Terms & Timeline</Typography>
                {pfi.payment_terms_narrative && (
                  <>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
                      Payment Terms
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, mb: 2, whiteSpace: "pre-wrap", color: "text.secondary" }}>
                      {pfi.payment_terms_narrative}
                    </Typography>
                  </>
                )}
                {pfi.delivery_timeline_narrative && (
                  <>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
                      Delivery Timeline
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-wrap", color: "text.secondary" }}>
                      {pfi.delivery_timeline_narrative}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {pfi.notes && (
            <Alert severity="info" sx={{ mb: 3 }}>{pfi.notes}</Alert>
          )}
        </Grid>

        {/* ── Right column ── */}
        <Grid item xs={12} md={5}>

          {/* Status timeline */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>Lifecycle</Typography>
              <InfoRow label="Status"       value={pfi.status_display} />
              <InfoRow label="Created"      value={formatDateToDDMMYYYY(pfi.created_at)} />
              <InfoRow label="Sent At"      value={pfi.sent_at ? formatDateToDDMMYYYY(pfi.sent_at) : undefined} />
              <InfoRow label="Accepted At"  value={pfi.accepted_at ? formatDateToDDMMYYYY(pfi.accepted_at) : undefined} />
              <InfoRow label="Rejected At"  value={pfi.rejected_at ? formatDateToDDMMYYYY(pfi.rejected_at) : undefined} />
              <InfoRow label="Expiry Date"  value={pfi.expiry_date ? formatDateToDDMMYYYY(pfi.expiry_date) : undefined} />
              <InfoRow label="Created By"   value={pfi.created_by_name} />
            </CardContent>
          </Card>

          {/* Bank details */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>Bank Details</Typography>
              <InfoRow label="Bank Name"      value={pfi.bank_name || "STANBIC BANK"} />
              <InfoRow label="Account Number" value={pfi.account_number || "9030026820951"} mono />
              <InfoRow label="Account Name"   value={pfi.account_name || "BENNU AGFIN SERVICES LIMITED"} />
              {pfi.swift_code && <InfoRow label="SWIFT Code" value={pfi.swift_code} mono />}
              {pfi.sort_code  && <InfoRow label="Sort Code"  value={pfi.sort_code}  mono />}
            </CardContent>
          </Card>

          {/* Signatory */}
          {pfi.signatory_name && (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Signatory</Typography>
                <InfoRow label="Name"    value={pfi.signatory_name} />
                <InfoRow label="Title"   value={pfi.signatory_title} />
                <InfoRow label="Contact" value={pfi.signatory_contact} />
              </CardContent>
            </Card>
          )}

          {/* Quick link to buyer order */}
          <Button fullWidth variant="outlined" size="small"
            onClick={() => navigate(`/admin/sourcing/buyer-orders/${pfi.buyer_order}`)}>
            View Linked Buyer Order →
          </Button>
        </Grid>
      </Grid>

      {/* Dialogs */}
      {showEdit && (
        <EditPFIDialog
          open={showEdit}
          pfi={pfi}
          handleClose={() => setShowEdit(false)}
          callBack={fetchData}
        />
      )}
      {showReject && (
        <RejectDialog
          open={showReject}
          pfi={pfi}
          handleClose={() => setShowReject(false)}
          callBack={fetchData}
        />
      )}
    </Box>
  );
};

export default ProformaInvoiceDetails;