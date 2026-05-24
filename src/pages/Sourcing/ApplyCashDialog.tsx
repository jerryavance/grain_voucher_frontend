/**
 * ApplyCashDialog.tsx
 *
 * Apply a buyer-account deposit against one or more open invoices.
 * Three modes:
 *   - Manual      → accountant types an amount per invoice; running total
 *                   shows applied vs remaining as they type.
 *   - FIFO auto   → preview which invoices will be paid, oldest due first.
 *   - LIFO auto   → preview which invoices will be paid, newest due first.
 *
 * Key UX principles:
 *   - The preview for auto modes is computed CLIENT-SIDE using the same
 *     algorithm the backend uses, so the user sees exactly what will
 *     happen before clicking Apply. Backend still validates on submit.
 *   - Currency-aware throughout (deposit drives, invoices are filtered).
 *   - "Apply" button is disabled when nothing would happen (sum = 0).
 *   - On success, toast + refresh callback fires; dialog closes.
 */
import { FC, useEffect, useMemo, useState } from "react";
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, IconButton, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography,
} from "@mui/material";
import { toast } from "react-hot-toast";
import PaidIcon from "@mui/icons-material/Paid";
import AutoModeIcon from "@mui/icons-material/AutoMode";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

import { Span } from "../../components/Typography";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import { SourcingService } from "./Sourcing.service";
import { formatCurrency } from "./SourcingConstants";
import { IBuyerAccount, IBuyerAccountDeposit, IBuyerInvoice } from "./Sourcing.interface";

type Mode = "manual" | "fifo" | "lifo";

interface Props {
  open: boolean;
  deposit: IBuyerAccountDeposit;
  account: IBuyerAccount;
  onClose: () => void;
  onApplied: () => void;
}

const ApplyCashDialog: FC<Props> = ({ open, deposit, account, onClose, onApplied }) => {
  const [mode, setMode] = useState<Mode>("manual");
  const [openInvoices, setOpenInvoices] = useState<IBuyerInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [manualAllocations, setManualAllocations] = useState<Record<string, string>>({});

  const unapplied = Number(deposit.amount_unapplied || 0);
  const currency = deposit.currency || account.currency;

  // Reset on open + fetch latest open invoices
  useEffect(() => {
    if (!open) return;
    setMode("manual");
    setManualAllocations({});
    setLoading(true);
    SourcingService.getBuyerAccountOpenInvoices(account.id)
      .then(invs => {
        // Same-currency only — backend filters this too but defensive.
        const filtered = (invs || []).filter(inv => (inv.currency || "UGX") === currency);
        // Sort by due_date ASC so manual mode also shows oldest first.
        filtered.sort((a, b) => {
          const ad = a.due_date || "";
          const bd = b.due_date || "";
          return ad.localeCompare(bd);
        });
        setOpenInvoices(filtered);
      })
      .catch(() => toast.error("Failed to load open invoices"))
      .finally(() => setLoading(false));
  }, [open, account.id, currency]);

  // ─── Auto-mode cascade preview (matches the backend algorithm) ──────────
  const autoPreview = useMemo(() => {
    if (mode === "manual") return [] as { invoice: IBuyerInvoice; amount: number }[];
    const sorted = [...openInvoices].sort((a, b) => {
      const ad = a.due_date || "";
      const bd = b.due_date || "";
      return mode === "fifo" ? ad.localeCompare(bd) : bd.localeCompare(ad);
    });
    const out: { invoice: IBuyerInvoice; amount: number }[] = [];
    let remaining = unapplied;
    for (const inv of sorted) {
      if (remaining <= 0) break;
      const bal = Number(inv.balance_due || 0);
      if (bal <= 0) continue;
      const chunk = Math.min(remaining, bal);
      out.push({ invoice: inv, amount: chunk });
      remaining -= chunk;
    }
    return out;
  }, [mode, openInvoices, unapplied]);

  // ─── Manual running total ──────────────────────────────────────────────
  const manualTotal = useMemo(() => {
    return Object.values(manualAllocations).reduce(
      (sum, v) => sum + (Number(v) || 0), 0,
    );
  }, [manualAllocations]);

  const manualRemaining = unapplied - manualTotal;
  const manualOverflow = manualRemaining < -0.001;

  const setManualAmount = (invoiceId: string, value: string) => {
    setManualAllocations(prev => ({ ...prev, [invoiceId]: value }));
  };

  const fillToBalance = (inv: IBuyerInvoice) => {
    // Convenience: fill an invoice's row up to either its balance_due
    // or the deposit's remaining unapplied, whichever is smaller.
    const otherTotal = Object.entries(manualAllocations)
      .filter(([id]) => id !== inv.id)
      .reduce((s, [_, v]) => s + (Number(v) || 0), 0);
    const remaining = unapplied - otherTotal;
    const cap = Math.min(remaining, Number(inv.balance_due || 0));
    setManualAmount(inv.id, cap > 0 ? cap.toFixed(2) : "0");
  };

  const totalForCurrentMode = mode === "manual"
    ? manualTotal
    : autoPreview.reduce((s, it) => s + it.amount, 0);

  const canSubmit = !submitting && !manualOverflow && totalForCurrentMode > 0;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (mode === "manual") {
        const apps = Object.entries(manualAllocations)
          .map(([invoice, amount]) => ({ invoice, amount }))
          .filter(it => Number(it.amount) > 0);
        if (apps.length === 0) {
          toast.error("Enter at least one amount.");
          return;
        }
        await SourcingService.applyDepositManual(deposit.id, { applications: apps });
        toast.success(`Applied ${apps.length} allocation${apps.length === 1 ? "" : "s"}`);
      } else {
        const res = await SourcingService.applyDepositAuto(deposit.id, { strategy: mode });
        toast.success(`${mode.toUpperCase()} applied ${res.applications.length} invoice${res.applications.length === 1 ? "" : "s"}`);
      }
      onApplied();
      onClose();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.error
          ? typeof e.response.data.error === "string"
            ? e.response.data.error
            : JSON.stringify(e.response.data.error)
          : "Apply failed",
      );
    } finally { setSubmitting(false); }
  };

  return (
    <Dialog open={open} onClose={() => !submitting && onClose()} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
        <PaidIcon color="primary" />
        Apply Cash
        <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
          {deposit.deposit_number}
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        {/* Deposit hero */}
        <Box
          sx={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            p: 2, bgcolor: "primary.50", borderRadius: 1, mb: 2, flexWrap: "wrap", gap: 2,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
              Available on deposit
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ color: "primary.main" }}>
              {formatCurrency(unapplied, currency)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              of {formatCurrency(deposit.amount, currency)} total
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Chip
              size="small"
              label={deposit.source_display || deposit.source}
              color={deposit.source === "bank_api" ? "info" : "default"}
              variant="outlined"
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
              {account.payment_reference} · {account.buyer_name}
            </Typography>
          </Box>
        </Box>

        {/* Mode picker */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, v) => v && setMode(v)}
            size="small"
          >
            <ToggleButton value="manual">Manual</ToggleButton>
            <ToggleButton value="fifo">
              <AutoModeIcon fontSize="small" sx={{ mr: 0.5 }} /> Auto FIFO
            </ToggleButton>
            <ToggleButton value="lifo">
              <AutoModeIcon fontSize="small" sx={{ mr: 0.5 }} /> Auto LIFO
            </ToggleButton>
          </ToggleButtonGroup>
          <Tooltip
            title={
              mode === "manual"
                ? "Type an amount in each row you want to allocate to. Total must not exceed available."
                : mode === "fifo"
                  ? "Auto-allocates oldest-due-first. Preview below shows exactly what will happen."
                  : "Auto-allocates newest-due-first. Preview below shows exactly what will happen."
            }
          >
            <IconButton size="small" color="default"><HelpOutlineIcon fontSize="small" /></IconButton>
          </Tooltip>
        </Box>

        {/* Loading / empty state */}
        {loading ? (
          <LinearProgress />
        ) : openInvoices.length === 0 ? (
          <Alert severity="info">
            No open invoices for {account.buyer_name} in {currency}. Money will remain on the
            account until invoices are issued.
          </Alert>
        ) : (
          <>
            {/* ── Manual mode ────────────────────────────────────────── */}
            {mode === "manual" && (
              <>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "action.hover" }}>
                        <TableCell sx={{ fontWeight: 700 }}>Invoice #</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Due</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Balance</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 200 }}>Apply</TableCell>
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {openInvoices.map(inv => {
                        const bal = Number(inv.balance_due || 0);
                        const val = manualAllocations[inv.id] || "";
                        const num = Number(val) || 0;
                        const overshoot = num > bal;
                        return (
                          <TableRow key={inv.id} hover>
                            <TableCell sx={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600 }}>
                              {inv.invoice_number}
                            </TableCell>
                            <TableCell sx={{ fontSize: 12 }}>
                              {inv.due_date ? formatDateToDDMMYYYY(inv.due_date) : "—"}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {formatCurrency(bal, currency)}
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small" type="number"
                                value={val}
                                onChange={e => setManualAmount(inv.id, e.target.value)}
                                error={overshoot}
                                helperText={overshoot ? `Max ${bal}` : ""}
                                inputProps={{ step: "0.01", min: 0, max: bal }}
                                sx={{ width: 170 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Button size="small" onClick={() => fillToBalance(inv)}>
                                Fill
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box
                  sx={{
                    mt: 2, p: 1.5, borderRadius: 1,
                    bgcolor: manualOverflow ? "error.50" : "action.hover",
                    display: "flex", justifyContent: "space-between",
                  }}
                >
                  <Span sx={{ fontWeight: 600 }}>
                    Applying: <strong>{formatCurrency(manualTotal, currency)}</strong>
                  </Span>
                  <Span sx={{ color: manualOverflow ? "error.main" : "text.primary" }}>
                    Remaining on deposit: <strong>{formatCurrency(Math.max(0, manualRemaining), currency)}</strong>
                    {manualOverflow && " — over by " + formatCurrency(-manualRemaining, currency)}
                  </Span>
                </Box>
              </>
            )}

            {/* ── Auto-mode preview ──────────────────────────────────── */}
            {(mode === "fifo" || mode === "lifo") && (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Preview — applying <strong>{mode.toUpperCase()}</strong> will allocate
                  the deposit across the invoices below in this order. Nothing will be
                  written until you click <strong>Apply</strong>.
                </Alert>
                {autoPreview.length === 0 ? (
                  <Alert severity="warning">
                    No invoices would be touched (no open balances in {currency}).
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: "action.hover" }}>
                          <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Invoice #</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Due</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Balance Before</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Will Apply</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Balance After</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {autoPreview.map((row, i) => {
                          const bal = Number(row.invoice.balance_due || 0);
                          const after = bal - row.amount;
                          const fullyPaid = after <= 0.001;
                          return (
                            <TableRow key={row.invoice.id} hover>
                              <TableCell>{i + 1}</TableCell>
                              <TableCell sx={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600 }}>
                                {row.invoice.invoice_number}
                              </TableCell>
                              <TableCell sx={{ fontSize: 12 }}>
                                {row.invoice.due_date ? formatDateToDDMMYYYY(row.invoice.due_date) : "—"}
                              </TableCell>
                              <TableCell>{formatCurrency(bal, currency)}</TableCell>
                              <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>
                                {formatCurrency(row.amount, currency)}
                              </TableCell>
                              <TableCell>
                                {fullyPaid
                                  ? <Chip label="PAID" color="success" size="small" />
                                  : <Span>{formatCurrency(after, currency)}</Span>}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Span sx={{ fontWeight: 600 }}>
                    Total to apply: <strong>{formatCurrency(totalForCurrentMode, currency)}</strong>
                  </Span>
                  <Span color="text.secondary">
                    Remaining on deposit: <strong>{formatCurrency(unapplied - totalForCurrentMode, currency)}</strong>
                  </Span>
                </Box>
              </>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button
          variant="contained"
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <PaidIcon />}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {submitting
            ? "Applying..."
            : mode === "manual"
              ? `Apply ${formatCurrency(manualTotal, currency)}`
              : `Apply ${mode.toUpperCase()} (${formatCurrency(totalForCurrentMode, currency)})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApplyCashDialog;
