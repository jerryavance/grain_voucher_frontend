import React, { useEffect, useState } from "react";
import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, FormControl, FormHelperText,
  InputLabel, MenuItem, Select, TextField, Typography,
} from "@mui/material";
import { SwapHoriz } from "@mui/icons-material";
import { toast } from "react-hot-toast";
import SourcingService from "./Sourcing.service";

interface Props {
  open: boolean;
  sourceOrderId: string;
  orderNumber: string;
  currentInvestorName?: string;
  allocationId: string;
  allocationAmount: number;
  onClose: () => void;
  onSuccess: () => void;
}

const REASON_OPTIONS = [
  { value: "investor_exit",        label: "Investor Exit" },
  { value: "risk_management",      label: "Risk Management" },
  { value: "capital_reallocation", label: "Capital Reallocation" },
  { value: "mutual_agreement",     label: "Mutual Agreement" },
  { value: "other",                label: "Other" },
];

const fmtUGX = (v: number) =>
  `UGX ${v.toLocaleString("en-UG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const TradeReassignmentModal: React.FC<Props> = ({
  open, sourceOrderId, orderNumber, currentInvestorName,
  allocationId, allocationAmount, onClose, onSuccess,
}) => {
  const [investors, setInvestors] = useState<any[]>([]);
  const [loadingInvestors, setLoadingInvestors] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [toInvestorId, setToInvestorId] = useState("");
  const [reason, setReason] = useState("mutual_agreement");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setToInvestorId(""); setReason("mutual_agreement"); setNotes(""); setErrors({});
    setLoadingInvestors(true);
    SourcingService.getInvestorAccounts()
      .then(d => setInvestors(d.results ?? []))
      .catch(() => toast.error("Failed to load investor accounts"))
      .finally(() => setLoadingInvestors(false));
  }, [open]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!toInvestorId) e.toInvestorId = "Please select an investor.";
    if (!reason) e.reason = "Please select a reason.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setSubmitting(true);
    try {
      const result = await SourcingService.reassignInvestor(allocationId, toInvestorId, reason, notes);
      toast.success(`Trade re-assigned! ${result.reassignment_number ?? ""}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.detail || "Re-assignment failed.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedInvestor = investors.find(i => i.id === toInvestorId);
  const selectedEMD = selectedInvestor
    ? parseFloat(selectedInvestor.emd_balance ?? selectedInvestor.available_balance ?? 0)
    : 0;
  const emdSufficient = selectedEMD >= allocationAmount;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <SwapHoriz color="warning" />
        Re-assign Investor — {orderNumber}
      </DialogTitle>
      <DialogContent dividers>
        {/* Current investor */}
        <Box sx={{ mb: 2, p: 1.5, bgcolor: "action.hover", borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">Current Investor</Typography>
          <Typography fontWeight={700}>{currentInvestorName ?? "—"}</Typography>
          <Typography variant="body2" color="text.secondary">
            Allocation: {fmtUGX(allocationAmount)}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }}>Transfer To</Divider>

        {/* New investor selector */}
        <FormControl fullWidth size="small" sx={{ mb: 2 }} error={!!errors.toInvestorId}>
          <InputLabel>New Investor *</InputLabel>
          <Select
            value={toInvestorId}
            label="New Investor *"
            onChange={e => { setToInvestorId(e.target.value); setErrors(prev => ({ ...prev, toInvestorId: "" })); }}
            disabled={loadingInvestors}
          >
            {loadingInvestors
              ? <MenuItem disabled><CircularProgress size={16} sx={{ mr: 1 }} />Loading…</MenuItem>
              : investors.map((inv: any) => (
                <MenuItem key={inv.id} value={inv.id}>
                  {inv.investor?.first_name} {inv.investor?.last_name}
                  {inv.investor?.business_name ? ` (${inv.investor.business_name})` : ""}
                  {" — "}EMD: {fmtUGX(parseFloat(inv.emd_balance ?? inv.available_balance ?? 0))}
                </MenuItem>
              ))
            }
          </Select>
          {errors.toInvestorId && <FormHelperText>{errors.toInvestorId}</FormHelperText>}
        </FormControl>

        {/* EMD sufficiency warning */}
        {selectedInvestor && !emdSufficient && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Selected investor's EMD ({fmtUGX(selectedEMD)}) is insufficient for this
            allocation ({fmtUGX(allocationAmount)}). Choose a different investor or ask
            them to top up.
          </Alert>
        )}
        {selectedInvestor && emdSufficient && (
          <Alert severity="success" sx={{ mb: 2 }}>
            EMD sufficient — {fmtUGX(selectedEMD)} available, {fmtUGX(allocationAmount)} required.
          </Alert>
        )}

        {/* Reason */}
        <FormControl fullWidth size="small" sx={{ mb: 2 }} error={!!errors.reason}>
          <InputLabel>Reason *</InputLabel>
          <Select value={reason} label="Reason *" onChange={e => setReason(e.target.value)}>
            {REASON_OPTIONS.map(o => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </Select>
          {errors.reason && <FormHelperText>{errors.reason}</FormHelperText>}
        </FormControl>

        {/* Notes */}
        <TextField
          fullWidth multiline rows={3} size="small" label="Notes (optional)"
          value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Additional context about this re-assignment…"
        />

        <Alert severity="warning" sx={{ mt: 2 }}>
          <strong>This action is irreversible.</strong> The current investor's EMD will be
          restored and the new investor's EMD will be locked. A permanent audit record will
          be created.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button
          variant="contained" color="warning"
          onClick={handleSubmit}
          disabled={submitting || !toInvestorId || !emdSufficient}
          startIcon={submitting ? <CircularProgress size={16} /> : <SwapHoriz />}
        >
          {submitting ? "Re-assigning…" : "Confirm Re-assignment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TradeReassignmentModal;
