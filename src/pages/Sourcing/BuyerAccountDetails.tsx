/**
 * BuyerAccountDetails.tsx
 *
 * The centerpiece for the buyer-cash-account feature.
 *
 * Layout:
 *   - Header: buyer · currency · status chip · back · recalculate
 *   - Hero card: HUGE available balance, copyable reference, auto-apply
 *     strategy with inline edit
 *   - Stats row: total deposits / applied / withdrawn / open invoices
 *   - Action buttons: Record Deposit, Apply Cash, Request Withdrawal
 *   - Tabs:
 *       1. Deposits     — every credit, with one-click "Apply" per row
 *       2. Applications — every allocation, with reverse action
 *       3. Withdrawals  — payouts off the account
 *       4. Open Invoices — what's still payable from this account
 */
import { FC, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Dialog,
  DialogActions, DialogContent, DialogTitle, Divider, FormControl, Grid,
  IconButton, InputLabel, LinearProgress, MenuItem, Select, Tab, Tabs, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, TextField,
  Tooltip, Typography,
} from "@mui/material";
import { toast } from "react-hot-toast";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import PaidIcon from "@mui/icons-material/Paid";
import SouthIcon from "@mui/icons-material/South";
import UndoIcon from "@mui/icons-material/Undo";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";

import useTitle from "../../hooks/useTitle";
import LoadingScreen from "../../components/LoadingScreen";
import { Span } from "../../components/Typography";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import { SourcingService } from "./Sourcing.service";
import { formatCurrency } from "./SourcingConstants";
import ApplyCashDialog from "./ApplyCashDialog";
import {
  IBuyerAccount, IBuyerAccountDeposit, IBuyerAccountWithdrawal,
  ICashApplication, IBuyerInvoice, TBuyerAccountAutoApply,
} from "./Sourcing.interface";

const DEPOSIT_SOURCE_COLOR: Record<string, any> = {
  bank_api: "info",
  bank_statement: "primary",
  manual: "default",
  application_reversal: "warning",
};
const APPLICATION_STATUS_COLOR: Record<string, any> = {
  applied: "success", reversed: "default",
};
const WITHDRAWAL_STATUS_COLOR: Record<string, any> = {
  pending: "warning", approved: "success", rejected: "error",
};
const INV_STATUS_COLOR: Record<string, any> = {
  issued: "primary", partial: "warning", overdue: "error",
  paid: "success", cancelled: "default", draft: "default",
};

// ─── Record Deposit Dialog ───────────────────────────────────────────────────
const RecordDepositDialog: FC<{
  open: boolean;
  account: IBuyerAccount;
  onClose: () => void;
  onCreated: () => void;
}> = ({ open, account, onClose, onCreated }) => {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState<"manual" | "bank_statement">("manual");
  const [bankRef, setBankRef] = useState("");
  const [payer, setPayer] = useState("");
  const [channel, setChannel] = useState("");
  const [receivedAt, setReceivedAt] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAmount(""); setSource("manual"); setBankRef(""); setPayer("");
    setChannel(""); setReceivedAt(new Date().toISOString().slice(0, 16)); setNotes("");
  }, [open]);

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Amount must be positive");
      return;
    }
    setSubmitting(true);
    try {
      await SourcingService.createBuyerDeposit({
        buyer_account: account.id,
        amount,
        currency: account.currency,
        source,
        bank_reference: bankRef,
        bank_payer_name: payer,
        bank_channel: channel,
        received_at: receivedAt ? new Date(receivedAt).toISOString() : undefined,
        notes,
      } as any);
      toast.success("Deposit recorded");
      onCreated();
      onClose();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.detail ||
        JSON.stringify(e?.response?.data) ||
        "Failed to record deposit",
      );
    } finally { setSubmitting(false); }
  };

  return (
    <Dialog open={open} onClose={() => !submitting && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <SouthIcon color="primary" /> Record Deposit · {account.payment_reference}
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 2 }}>
          Credit money to <strong>{account.buyer_name}</strong>'s {account.currency} cash account.
          Use this for cheques, bank statements, or any manual entry. Deposits arriving via the
          bank API are recorded automatically.
        </Alert>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label={`Amount (${account.currency}) *`}
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Source</InputLabel>
              <Select value={source} label="Source" onChange={e => setSource(e.target.value as any)}>
                <MenuItem value="manual">Manual (cheque, journal entry)</MenuItem>
                <MenuItem value="bank_statement">Bank Statement (parsed from statement)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="Bank Reference"
              value={bankRef}
              onChange={e => setBankRef(e.target.value)}
              helperText="Bank's transaction reference (optional)"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="Payer Name"
              value={payer}
              onChange={e => setPayer(e.target.value)}
              helperText="Name on the deposit slip (optional)"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="Channel"
              value={channel}
              onChange={e => setChannel(e.target.value)}
              helperText="e.g. branch, agent, mobile_banking"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="Received At"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={receivedAt}
              onChange={e => setReceivedAt(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth label="Notes" multiline rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting} startIcon={<SouthIcon />}>
          {submitting ? "Recording..." : "Record Deposit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Withdraw Dialog ─────────────────────────────────────────────────────────
const WithdrawDialog: FC<{
  open: boolean;
  account: IBuyerAccount;
  onClose: () => void;
  onCreated: () => void;
}> = ({ open, account, onClose, onCreated }) => {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank_transfer");
  const [refNumber, setRefNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAmount(""); setMethod("bank_transfer"); setRefNumber(""); setNotes("");
  }, [open]);

  const available = Number(account.available_balance || 0);
  const overflow = Number(amount || 0) > available;

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Amount must be positive");
      return;
    }
    if (overflow) {
      toast.error("Amount exceeds available balance");
      return;
    }
    setSubmitting(true);
    try {
      await SourcingService.createBuyerWithdrawal({
        buyer_account: account.id,
        amount,
        method,
        reference_number: refNumber,
        notes,
      } as any);
      toast.success("Withdrawal request created — pending approval");
      onCreated();
      onClose();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.detail ||
        JSON.stringify(e?.response?.data) ||
        "Failed to request withdrawal",
      );
    } finally { setSubmitting(false); }
  };

  return (
    <Dialog open={open} onClose={() => !submitting && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <UndoIcon color="error" /> Request Withdrawal · {account.payment_reference}
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Withdrawals require approval before they reduce the account balance.
          Available: <strong>{formatCurrency(available, account.currency)}</strong>.
        </Alert>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label={`Amount (${account.currency}) *`}
              type="number" value={amount}
              onChange={e => setAmount(e.target.value)}
              error={overflow}
              helperText={overflow ? `Max ${formatCurrency(available, account.currency)}` : ""}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Method</InputLabel>
              <Select value={method} label="Method" onChange={e => setMethod(e.target.value)}>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                <MenuItem value="cheque">Cheque</MenuItem>
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="mobile_money">Mobile Money</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth label="Reference Number"
              value={refNumber}
              onChange={e => setRefNumber(e.target.value)}
              helperText="Cheque #, bank transfer ref, etc."
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth label="Notes" multiline rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button variant="contained" color="error" onClick={handleSubmit} disabled={submitting || overflow}>
          {submitting ? "Requesting..." : "Request Withdrawal"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Reverse-with-reason mini dialog ─────────────────────────────────────────
const ReverseReasonDialog: FC<{
  open: boolean;
  title: string;
  helperText: string;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}> = ({ open, title, helperText, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => { if (open) setReason(""); }, [open]);
  return (
    <Dialog open={open} onClose={() => !submitting && onClose()} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" gutterBottom>{helperText}</Typography>
        <TextField
          autoFocus fullWidth label="Reason *"
          multiline rows={3} value={reason}
          onChange={e => setReason(e.target.value)}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button
          variant="contained" color="warning" startIcon={<UndoIcon />}
          disabled={!reason.trim() || submitting}
          onClick={async () => {
            setSubmitting(true);
            try { await onConfirm(reason.trim()); } finally { setSubmitting(false); onClose(); }
          }}
        >
          {submitting ? "Reversing..." : "Confirm Reverse"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Auto-apply strategy edit (inline) ───────────────────────────────────────
const AutoApplyEditor: FC<{ account: IBuyerAccount; onChanged: () => void }> = ({ account, onChanged }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState<TBuyerAccountAutoApply>(account.auto_apply_strategy);
  const [saving, setSaving] = useState(false);

  if (!editing) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary">Auto-apply:</Typography>
        <Chip
          size="small"
          label={(account.auto_apply_strategy_display || account.auto_apply_strategy || "manual").toUpperCase()}
          color={account.auto_apply_strategy === "none" ? "default" : "primary"}
          variant={account.auto_apply_strategy === "none" ? "outlined" : "filled"}
        />
        <IconButton size="small" onClick={() => setEditing(true)}><EditIcon sx={{ fontSize: 14 }} /></IconButton>
      </Box>
    );
  }

  const save = async () => {
    setSaving(true);
    try {
      await SourcingService.updateBuyerAccount(account.id, { auto_apply_strategy: value });
      toast.success("Auto-apply strategy updated");
      onChanged();
      setEditing(false);
    } catch { toast.error("Update failed"); }
    finally { setSaving(false); }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <Select value={value} onChange={e => setValue(e.target.value as TBuyerAccountAutoApply)}>
          <MenuItem value="none">Manual only</MenuItem>
          <MenuItem value="fifo">Auto FIFO — oldest first</MenuItem>
          <MenuItem value="lifo">Auto LIFO — newest first</MenuItem>
        </Select>
      </FormControl>
      <Button size="small" onClick={save} disabled={saving} variant="contained">Save</Button>
      <Button size="small" onClick={() => { setValue(account.auto_apply_strategy); setEditing(false); }} disabled={saving}>Cancel</Button>
    </Box>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const BuyerAccountDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<IBuyerAccount | null>(null);
  const [deposits, setDeposits] = useState<IBuyerAccountDeposit[]>([]);
  const [applications, setApplications] = useState<ICashApplication[]>([]);
  const [withdrawals, setWithdrawals] = useState<IBuyerAccountWithdrawal[]>([]);
  const [openInvoices, setOpenInvoices] = useState<IBuyerInvoice[]>([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);

  // Action state
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [applyDeposit, setApplyDeposit] = useState<IBuyerAccountDeposit | null>(null);
  const [reverseApp, setReverseApp] = useState<ICashApplication | null>(null);
  const [reverseDep, setReverseDep] = useState<IBuyerAccountDeposit | null>(null);

  useTitle(account ? `${account.buyer_name} · ${account.currency} Cash Account` : "Buyer Cash Account");

  useEffect(() => { if (id) fetchAll(); /* eslint-disable-next-line */ }, [id]);

  const fetchAll = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [acc, deps, apps, wdr, inv] = await Promise.all([
        SourcingService.getBuyerAccountDetails(id),
        SourcingService.getBuyerAccountDeposits(id).catch(() => [] as IBuyerAccountDeposit[]),
        SourcingService.getBuyerAccountApplications(id).catch(() => [] as ICashApplication[]),
        SourcingService.getBuyerAccountWithdrawals(id).catch(() => [] as IBuyerAccountWithdrawal[]),
        SourcingService.getBuyerAccountOpenInvoices(id).catch(() => [] as IBuyerInvoice[]),
      ]);
      setAccount(acc);
      setDeposits(Array.isArray(deps) ? deps : []);
      setApplications(Array.isArray(apps) ? apps : []);
      setWithdrawals(Array.isArray(wdr) ? wdr : []);
      setOpenInvoices(Array.isArray(inv) ? inv : []);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to load account");
    } finally { setLoading(false); }
  };

  const recalc = async () => {
    if (!id) return;
    try {
      await SourcingService.recalculateBuyerAccount(id);
      toast.success("Aggregates recomputed");
      fetchAll();
    } catch { toast.error("Recalculate failed"); }
  };

  const copyReference = () => {
    if (!account) return;
    navigator.clipboard.writeText(account.payment_reference).then(
      () => toast.success(`Copied ${account.payment_reference}`),
      () => toast.error("Copy failed"),
    );
  };

  const handleApproveWithdrawal = async (w: IBuyerAccountWithdrawal) => {
    try {
      await SourcingService.approveBuyerWithdrawal(w.id);
      toast.success("Withdrawal approved");
      fetchAll();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Approve failed");
    }
  };

  const handleRejectWithdrawal = async (w: IBuyerAccountWithdrawal) => {
    const reason = window.prompt("Reason for rejection?") || "";
    if (!reason.trim()) return;
    try {
      await SourcingService.rejectBuyerWithdrawal(w.id, reason);
      toast.success("Withdrawal rejected");
      fetchAll();
    } catch { toast.error("Reject failed"); }
  };

  // Sum of open invoice balances (so the user knows total owing)
  const totalOpenBalance = useMemo(() => {
    return openInvoices.reduce((s, inv) => s + Number(inv.balance_due || 0), 0);
  }, [openInvoices]);

  if (loading) return <LoadingScreen />;
  if (!account) return <Alert severity="error">Account not found.</Alert>;

  const balance = Number(account.available_balance || 0);

  return (
    <Box pt={2} pb={4}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <Tooltip title="Back to accounts">
          <IconButton onClick={() => navigate("/admin/sourcing/buyer-accounts")}><ArrowBackIcon /></IconButton>
        </Tooltip>
        <AccountBalanceWalletIcon sx={{ fontSize: 30, color: "primary.main" }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{account.buyer_name}</Typography>
        <Chip label={account.currency} variant="outlined" />
        {!account.is_active && <Chip label="INACTIVE" color="default" />}
        <Box sx={{ ml: "auto" }}>
          <Tooltip title="Recompute aggregates from source-of-truth rows">
            <IconButton onClick={recalc}><RefreshIcon /></IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Hero card */}
      <Card
        elevation={0}
        sx={{ mb: 3, border: "1px solid", borderColor: "primary.light", bgcolor: "primary.50" }}
      >
        <CardContent sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 3 }}>
          <Box sx={{ flex: 1, minWidth: 280 }}>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.5 }}>
              Available Balance
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: balance > 0 ? "primary.main" : "text.secondary", lineHeight: 1.1 }}>
              {formatCurrency(balance, account.currency)}
            </Typography>
            <AutoApplyEditor account={account} onChanged={fetchAll} />
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.5 }}>
              Payment Reference
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "flex-end" }}>
              <Typography variant="h5" sx={{ fontFamily: "monospace", fontWeight: 700, color: "primary.dark" }}>
                {account.payment_reference}
              </Typography>
              <Tooltip title="Copy reference">
                <IconButton onClick={copyReference}><ContentCopyIcon /></IconButton>
              </Tooltip>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Quote this at the bank counter
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Total Deposits", value: account.total_deposits, color: "text.primary" },
          { label: "Total Applied", value: account.total_applied, color: "info.main" },
          { label: "Total Withdrawn", value: account.total_withdrawn, color: "warning.main" },
          { label: "Open Balance Owing", value: totalOpenBalance, color: totalOpenBalance > 0 ? "error.main" : "success.main" },
        ].map(s => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
              <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography variant="overline" color="text.secondary" display="block">{s.label}</Typography>
                <Typography variant="h6" fontWeight={700} sx={{ color: s.color }}>
                  {formatCurrency(s.value, account.currency)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Action buttons */}
      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        <Button variant="contained" startIcon={<SouthIcon />} onClick={() => setShowDeposit(true)}>
          Record Deposit
        </Button>
        <Button
          variant="contained" color="success" startIcon={<PaidIcon />}
          disabled={!deposits.some(d => !d.is_reversed && Number(d.amount_unapplied) > 0)}
          onClick={() => {
            // Pre-select the first deposit with unapplied funds
            const candidate = deposits.find(d => !d.is_reversed && Number(d.amount_unapplied) > 0);
            if (candidate) { setApplyDeposit(candidate); setShowApply(true); }
          }}
        >
          Apply Cash
        </Button>
        <Button
          variant="outlined" color="error" startIcon={<UndoIcon />}
          disabled={balance <= 0}
          onClick={() => setShowWithdraw(true)}
        >
          Request Withdrawal
        </Button>
      </Box>

      {/* Tabs */}
      <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tab label={`Deposits (${deposits.length})`} />
          <Tab label={`Applications (${applications.length})`} />
          <Tab label={`Withdrawals (${withdrawals.length})`} />
          <Tab label={`Open Invoices (${openInvoices.length})`} />
        </Tabs>

        {/* Deposits */}
        {tab === 0 && (
          <Box sx={{ p: 2 }}>
            {deposits.length === 0 ? (
              <Alert severity="info">No deposits yet. Click <strong>Record Deposit</strong> above.</Alert>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "action.hover" }}>
                      {["Deposit #", "Source", "Amount", "Applied", "Unapplied", "Received", "Reference", ""].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deposits.map(d => {
                      const unapplied = Number(d.amount_unapplied || 0);
                      return (
                        <TableRow key={d.id} hover sx={{ opacity: d.is_reversed ? 0.6 : 1 }}>
                          <TableCell sx={{ fontFamily: "monospace", fontWeight: 600, color: "primary.main" }}>
                            {d.deposit_number}
                            {d.is_reversed && <Chip label="REVERSED" size="small" color="default" sx={{ ml: 1 }} />}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={d.source_display || d.source}
                              size="small"
                              variant="outlined"
                              color={DEPOSIT_SOURCE_COLOR[d.source] ?? "default"}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(d.amount, d.currency)}</TableCell>
                          <TableCell sx={{ color: "info.main" }}>{formatCurrency(d.amount_applied, d.currency)}</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: unapplied > 0 ? "success.main" : "text.secondary" }}>
                            {formatCurrency(unapplied, d.currency)}
                          </TableCell>
                          <TableCell sx={{ fontSize: 12 }}>{formatDateToDDMMYYYY(d.received_at)}</TableCell>
                          <TableCell sx={{ fontSize: 11, fontFamily: "monospace" }}>
                            {d.bank_transaction_id || d.bank_reference || "—"}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {!d.is_reversed && unapplied > 0 && (
                              <Tooltip title="Apply to invoices">
                                <IconButton
                                  size="small" color="success"
                                  onClick={() => { setApplyDeposit(d); setShowApply(true); }}
                                >
                                  <PaidIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {!d.is_reversed && Number(d.amount_applied) === 0 && (
                              <Tooltip title="Reverse deposit (only when nothing applied)">
                                <IconButton size="small" color="error" onClick={() => setReverseDep(d)}>
                                  <UndoIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Applications */}
        {tab === 1 && (
          <Box sx={{ p: 2 }}>
            {applications.length === 0 ? (
              <Alert severity="info">No cash applications yet.</Alert>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "action.hover" }}>
                      {["Application #", "Deposit", "Invoice", "Amount", "Status", "Applied By", "When", ""].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {applications.map(a => (
                      <TableRow key={a.id} hover sx={{ opacity: a.status === "reversed" ? 0.6 : 1 }}>
                        <TableCell sx={{ fontFamily: "monospace", fontWeight: 600, color: "primary.main" }}>
                          {a.application_number}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>
                          {a.deposit_number}
                        </TableCell>
                        <TableCell
                          sx={{ fontFamily: "monospace", fontSize: 12, color: "primary.main", cursor: "pointer" }}
                          onClick={() => navigate(`/admin/sourcing/buyer-invoices/${a.invoice}`)}
                        >
                          {a.invoice_number}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{formatCurrency(a.amount, a.currency)}</TableCell>
                        <TableCell>
                          <Chip
                            label={a.status.toUpperCase()}
                            size="small"
                            color={APPLICATION_STATUS_COLOR[a.status] ?? "default"}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: 12 }}>{a.applied_by_name || "—"}</TableCell>
                        <TableCell sx={{ fontSize: 12 }}>{formatDateToDDMMYYYY(a.applied_at)}</TableCell>
                        <TableCell>
                          {a.status === "applied" && (
                            <Tooltip title="Reverse this application">
                              <IconButton size="small" color="warning" onClick={() => setReverseApp(a)}>
                                <UndoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Withdrawals */}
        {tab === 2 && (
          <Box sx={{ p: 2 }}>
            {withdrawals.length === 0 ? (
              <Alert severity="info">No withdrawals.</Alert>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "action.hover" }}>
                      {["Withdrawal #", "Amount", "Method", "Reference", "Status", "Requested By", "When", ""].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {withdrawals.map(w => (
                      <TableRow key={w.id} hover>
                        <TableCell sx={{ fontFamily: "monospace", fontWeight: 600 }}>{w.withdrawal_number}</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{formatCurrency(w.amount, account.currency)}</TableCell>
                        <TableCell sx={{ fontSize: 12, textTransform: "capitalize" }}>{w.method?.replace(/_/g, " ")}</TableCell>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>{w.reference_number || "—"}</TableCell>
                        <TableCell>
                          <Chip
                            label={w.status.toUpperCase()}
                            size="small"
                            color={WITHDRAWAL_STATUS_COLOR[w.status] ?? "default"}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: 12 }}>{w.requested_by_name || "—"}</TableCell>
                        <TableCell sx={{ fontSize: 12 }}>{formatDateToDDMMYYYY(w.created_at)}</TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {w.status === "pending" && (
                            <>
                              <Tooltip title="Approve">
                                <IconButton size="small" color="success" onClick={() => handleApproveWithdrawal(w)}>
                                  <CheckCircleIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton size="small" color="error" onClick={() => handleRejectWithdrawal(w)}>
                                  <CancelIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Open Invoices */}
        {tab === 3 && (
          <Box sx={{ p: 2 }}>
            {openInvoices.length === 0 ? (
              <Alert severity="success">No open invoices for {account.buyer_name} in {account.currency}.</Alert>
            ) : (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Total owing: <strong>{formatCurrency(totalOpenBalance, account.currency)}</strong> across {openInvoices.length} invoice{openInvoices.length === 1 ? "" : "s"}.
                  {" "}Available cash: <strong>{formatCurrency(balance, account.currency)}</strong>
                  {" "}
                  {balance >= totalOpenBalance
                    ? <Chip label="ENOUGH TO COVER ALL" color="success" size="small" sx={{ ml: 1 }} />
                    : <Chip label={`SHORT BY ${formatCurrency(totalOpenBalance - balance, account.currency)}`} color="warning" size="small" sx={{ ml: 1 }} />}
                </Alert>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "action.hover" }}>
                        {["Invoice #", "Due", "Amount Due", "Paid", "Balance", "Status", ""].map(h => (
                          <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {openInvoices.map((inv: any) => (
                        <TableRow key={inv.id} hover>
                          <TableCell sx={{ fontFamily: "monospace", fontWeight: 600, color: "primary.main", cursor: "pointer" }}
                            onClick={() => navigate(`/admin/sourcing/buyer-invoices/${inv.id}`)}>
                            {inv.invoice_number}
                          </TableCell>
                          <TableCell sx={{ fontSize: 12 }}>
                            {inv.due_date ? formatDateToDDMMYYYY(inv.due_date) : "—"}
                          </TableCell>
                          <TableCell>{formatCurrency(inv.amount_due, inv.currency || account.currency)}</TableCell>
                          <TableCell sx={{ color: "success.main" }}>{formatCurrency(inv.amount_paid, inv.currency || account.currency)}</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: "error.main" }}>
                            {formatCurrency(inv.balance_due, inv.currency || account.currency)}
                          </TableCell>
                          <TableCell>
                            <Chip label={(inv.status || "").toUpperCase()} size="small" color={INV_STATUS_COLOR[inv.status] ?? "default"} />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Open invoice">
                              <IconButton size="small" onClick={() => navigate(`/admin/sourcing/buyer-invoices/${inv.id}`)}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Box>
        )}
      </Card>

      {/* ── Dialogs ──────────────────────────────────────────────────── */}
      <RecordDepositDialog open={showDeposit} account={account} onClose={() => setShowDeposit(false)} onCreated={fetchAll} />
      <WithdrawDialog open={showWithdraw} account={account} onClose={() => setShowWithdraw(false)} onCreated={fetchAll} />
      {applyDeposit && (
        <ApplyCashDialog
          open={showApply}
          deposit={applyDeposit}
          account={account}
          onClose={() => { setShowApply(false); setApplyDeposit(null); }}
          onApplied={fetchAll}
        />
      )}
      {reverseApp && (
        <ReverseReasonDialog
          open={true}
          title={`Reverse ${reverseApp.application_number}`}
          helperText={`This will reverse ${formatCurrency(reverseApp.amount, reverseApp.currency)} applied to ${reverseApp.invoice_number}. The invoice will re-open and the amount returns to the deposit.`}
          onClose={() => setReverseApp(null)}
          onConfirm={async reason => {
            try {
              await SourcingService.reverseCashApplication(reverseApp.id, reason);
              toast.success("Application reversed");
              fetchAll();
            } catch (e: any) { toast.error(e?.response?.data?.error || "Reverse failed"); }
          }}
        />
      )}
      {reverseDep && (
        <ReverseReasonDialog
          open={true}
          title={`Reverse ${reverseDep.deposit_number}`}
          helperText={`This will reverse ${formatCurrency(reverseDep.amount, reverseDep.currency)}. Allowed only when nothing has been applied from this deposit.`}
          onClose={() => setReverseDep(null)}
          onConfirm={async reason => {
            try {
              await SourcingService.reverseDeposit(reverseDep.id, reason);
              toast.success("Deposit reversed");
              fetchAll();
            } catch (e: any) { toast.error(e?.response?.data?.error || "Reverse failed"); }
          }}
        />
      )}
    </Box>
  );
};

export default BuyerAccountDetails;
