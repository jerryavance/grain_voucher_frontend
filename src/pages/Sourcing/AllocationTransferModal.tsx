import React, { useEffect, useMemo, useState } from "react";
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, FormControl, FormHelperText,
  Grid, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography,
} from "@mui/material";
import { TrendingUp } from "@mui/icons-material";
import { toast } from "react-hot-toast";
import SourcingService from "./Sourcing.service";

/**
 * AllocationTransferModal
 * ───────────────────────
 * Cost-basis transfer dialog — the "buy/sell the receivable as an asset"
 * operation. Distinct from TradeReassignmentModal (which does a face-value
 * data-fix). This one is a real economic transaction: the buyer pays
 * `transfer_price`, which becomes their new cost basis; the seller's
 * realized margin is `transfer_price − their prior cost basis`.
 */

interface Props {
  open: boolean;
  orderNumber: string;
  allocationId: string;
  allocationAmount: number;       // face value (amount_allocated)
  currentCostBasis: number | null; // null = never transferred, treat as face
  currentInvestorName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const REASON_OPTIONS = [
  { value: "primary_to_retail", label: "Primary to Retail Sell-Down" },
  { value: "risk_management",   label: "Risk Management" },
  { value: "rebalance",         label: "Portfolio Rebalance" },
  { value: "investor_exit",     label: "Investor Exit" },
  { value: "mutual_agreement",  label: "Mutual Agreement" },
  { value: "other",             label: "Other" },
];

const fmtUGX = (v: number) =>
  `UGX ${v.toLocaleString("en-UG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const AllocationTransferModal: React.FC<Props> = ({
  open, orderNumber, allocationId, allocationAmount, currentCostBasis,
  currentInvestorName, onClose, onSuccess,
}) => {
  const [investors, setInvestors] = useState<any[]>([]);
  const [loadingInvestors, setLoadingInvestors] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [toInvestorId, setToInvestorId] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [feeInput, setFeeInput] = useState("0");
  const [reason, setReason] = useState("mutual_agreement");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Seller's prior cost basis. Null in DB means "never transferred" — treat
  // as face value (the original allocator's emd cost).
  const sellerCostBasis =
    currentCostBasis != null ? currentCostBasis : allocationAmount;

  useEffect(() => {
    if (!open) return;
    setToInvestorId("");
    setPriceInput(allocationAmount.toFixed(2)); // sensible default = face value
    setFeeInput("0");
    setReason("mutual_agreement");
    setNotes("");
    setErrors({});
    setLoadingInvestors(true);
    SourcingService.getInvestorAccounts()
      .then(d => setInvestors(d.results ?? []))
      .catch(() => toast.error("Failed to load investor accounts"))
      .finally(() => setLoadingInvestors(false));
  }, [open, allocationAmount]);

  const price = useMemo(() => parseFloat(priceInput) || 0, [priceInput]);
  const fee = useMemo(() => parseFloat(feeInput) || 0, [feeInput]);
  const sellerProceeds = price - fee;
  const sellerRealizedMargin = price - sellerCostBasis;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!toInvestorId) e.toInvestorId = "Select a recipient investor.";
    if (!priceInput || price < 0) e.priceInput = "Transfer price must be ≥ 0.";
    if (fee < 0) e.feeInput = "Fee can't be negative.";
    if (fee > price) e.feeInput = "Fee can't exceed the transfer price.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    try {
      const result = await SourcingService.transferAllocation(allocationId, {
        toInvestorAccountId: toInvestorId,
        transferPrice: priceInput,
        transferFee: feeInput,
        reason,
        notes,
      });
      toast.success(`Transferred. ${result.transfer_number}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const raw = err.response?.data?.error ?? err.response?.data?.detail;
      const msg = typeof raw === "string"
        ? raw
        : raw ? JSON.stringify(raw) : "Transfer failed.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedInvestor = investors.find(i => i.id === toInvestorId);
  const selectedEMD = selectedInvestor
    ? parseFloat(selectedInvestor.emd_balance ?? selectedInvestor.available_balance ?? 0)
    : 0;
  const emdSufficient = !selectedInvestor || selectedEMD >= price;
  const sameInvestor =
    !!selectedInvestor && currentInvestorName &&
    `${selectedInvestor.investor?.first_name ?? ""} ${selectedInvestor.investor?.last_name ?? ""}`.trim() === currentInvestorName;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TrendingUp color="success" />
        Transfer Allocation — {orderNumber}
      </DialogTitle>

      <DialogContent dividers>
        {/* Asset card */}
        <Box sx={{ mb: 2, p: 1.5, bgcolor: "action.hover", borderRadius: 1 }}>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">Current Owner</Typography>
              <Typography fontWeight={700}>{currentInvestorName ?? "—"}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">Face Value</Typography>
              <Typography fontWeight={700}>{fmtUGX(allocationAmount)}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Cost Basis {currentCostBasis == null && (
                  <Chip label="implied" size="small" sx={{ ml: 0.5, height: 16, fontSize: 10 }} />
                )}
              </Typography>
              <Typography fontWeight={700}>{fmtUGX(sellerCostBasis)}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 2 }}>Sell To</Divider>

        {/* Recipient */}
        <FormControl fullWidth size="small" sx={{ mb: 2 }} error={!!errors.toInvestorId}>
          <InputLabel>Recipient Investor *</InputLabel>
          <Select
            value={toInvestorId}
            label="Recipient Investor *"
            onChange={e => { setToInvestorId(e.target.value); setErrors(p => ({ ...p, toInvestorId: "" })); }}
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

        {/* Price + fee */}
        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid item xs={8}>
            <TextField
              fullWidth size="small" label="Transfer Price *"
              type="number" value={priceInput}
              onChange={e => { setPriceInput(e.target.value); setErrors(p => ({ ...p, priceInput: "" })); }}
              error={!!errors.priceInput}
              helperText={errors.priceInput || "What the recipient pays. Becomes their new cost basis."}
              InputProps={{ startAdornment: <InputAdornment position="start">UGX</InputAdornment> }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth size="small" label="Platform Fee"
              type="number" value={feeInput}
              onChange={e => { setFeeInput(e.target.value); setErrors(p => ({ ...p, feeInput: "" })); }}
              error={!!errors.feeInput}
              helperText={errors.feeInput || "From seller's proceeds"}
              InputProps={{ startAdornment: <InputAdornment position="start">UGX</InputAdornment> }}
            />
          </Grid>
        </Grid>

        {/* Live preview */}
        <Box sx={{ p: 1.5, mb: 2, bgcolor: "background.default", border: 1, borderColor: "divider", borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            Settlement preview
          </Typography>
          <Grid container spacing={1} sx={{ mt: 0.5 }}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Seller receives</Typography>
              <Typography fontWeight={700}>{fmtUGX(sellerProceeds)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Seller realized margin</Typography>
              <Typography fontWeight={700}
                color={sellerRealizedMargin >= 0 ? "success.main" : "error.main"}>
                {sellerRealizedMargin >= 0 ? "+" : ""}{fmtUGX(sellerRealizedMargin)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Recipient's new cost basis</Typography>
              <Typography fontWeight={700}>{fmtUGX(price)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Recipient pays</Typography>
              <Typography fontWeight={700}>{fmtUGX(price)}</Typography>
            </Grid>
          </Grid>
        </Box>

        {/* EMD sufficiency */}
        {selectedInvestor && !emdSufficient && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Recipient's EMD ({fmtUGX(selectedEMD)}) is less than the transfer
            price ({fmtUGX(price)}). They need to top up first.
          </Alert>
        )}
        {sameInvestor && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Recipient is the same as the current owner — pick a different account.
          </Alert>
        )}

        {/* Reason */}
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Reason</InputLabel>
          <Select value={reason} label="Reason" onChange={e => setReason(e.target.value)}>
            {REASON_OPTIONS.map(o => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Notes */}
        <TextField
          fullWidth multiline rows={2} size="small" label="Notes (optional)"
          value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Context for the audit log…"
        />

        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>Cost-basis transfer.</strong> The recipient becomes the new
          owner at their chosen price. At settlement, their margin will be
          computed as <em>realized value − new cost basis</em> (not the original
          profit-share). All trade profit goes to the platform.
        </Alert>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button
          variant="contained" color="success"
          onClick={handleSubmit}
          disabled={submitting || !toInvestorId || !emdSufficient || price < 0 || !!sameInvestor}
          startIcon={submitting ? <CircularProgress size={16} /> : <TrendingUp />}
        >
          {submitting ? "Transferring…" : "Confirm Transfer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AllocationTransferModal;
