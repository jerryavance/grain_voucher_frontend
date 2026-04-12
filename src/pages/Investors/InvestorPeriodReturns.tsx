/**
 * InvestorPeriodReturns.tsx
 *
 * Admin page for managing fixed-period capital + interest returns.
 * Used for "interest-type" investors whose capital + fixed interest must be
 * returned at the end of the agreed period regardless of whether buyers have paid.
 *
 * Lifecycle: pending → approved → paid | cancelled
 * payout_source: buyer_payment | platform_advance
 *   - platform_advance marks linked allocations as force_settled so future
 *     buyer payments are routed back to the platform instead of the investor.
 */

import { FC, useEffect, useState } from "react";
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, FormControl, Grid, InputLabel, MenuItem,
  Paper, Select, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Typography,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PaymentIcon from "@mui/icons-material/Payment";
import CancelIcon from "@mui/icons-material/Cancel";
import useTitle from "../../hooks/useTitle";
import LoadingScreen from "../../components/LoadingScreen";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import { InvestorService } from "./Investor.service";
import {
  IInvestorPeriodReturn, IInvestorAccount, IProfitSharingAgreement,
} from "./Investor.interface";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import { INITIAL_PAGE_SIZE } from "../../api/constants";

const STATUS_COLORS: Record<string, any> = {
  pending: "warning", approved: "primary", paid: "success", cancelled: "error",
};
const SOURCE_LABELS: Record<string, string> = {
  buyer_payment: "From Buyer Payment",
  platform_advance: "Platform Advance",
};

const formatCurrency = (v: any) =>
  v === undefined || v === null ? "—"
    : `UGX ${Number(v).toLocaleString("en-UG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

// ─── Create Period Return Form ─────────────────────────────────────────────────
const CreatePeriodReturnForm: FC<{
  open: boolean;
  handleClose: () => void;
  callBack?: () => void;
}> = ({ open, handleClose, callBack }) => {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<IInvestorAccount[]>([]);
  const [agreements, setAgreements] = useState<IProfitSharingAgreement[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<IInvestorAccount | null>(null);

  useEffect(() => {
    if (!open) return;
    InvestorService.getInvestorAccounts({ page_size: 100 })
      .then(r => setAccounts(r.results || []))
      .catch(() => {});
  }, [open]);

  const loadAgreements = (accountId: string) => {
    InvestorService.getProfitAgreements({ investor_account: accountId, payout_type: "interest", page_size: 20 })
      .then(r => setAgreements(r.results || []))
      .catch(() => {});
    const acct = accounts.find(a => a.id === accountId) || null;
    setSelectedAccount(acct);
  };

  const form = useFormik({
    initialValues: {
      investor_account_id: "",
      profit_sharing_agreement_id: "",
      capital_committed: "",
      capital_deployed: "",
      interest_earned: "",
      period_start: "",
      period_end: "",
      days_deployed: "",
      payout_source: "buyer_payment",
      notes: "",
    },
    validationSchema: Yup.object({
      investor_account_id: Yup.string().required("Investor account is required"),
      profit_sharing_agreement_id: Yup.string().required("Agreement is required"),
      capital_committed: Yup.number().positive("Must be positive").required("Capital committed is required"),
      interest_earned: Yup.number().min(0, "Cannot be negative").required("Interest earned is required"),
      period_start: Yup.string().required("Period start is required"),
      period_end: Yup.string().required("Period end is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const pr = await InvestorService.createPeriodReturn({
          investor_account_id: values.investor_account_id,
          profit_sharing_agreement_id: values.profit_sharing_agreement_id,
          capital_committed: values.capital_committed,
          capital_deployed: values.capital_deployed || undefined,
          interest_earned: values.interest_earned,
          period_start: values.period_start,
          period_end: values.period_end,
          days_deployed: values.days_deployed ? Number(values.days_deployed) : undefined,
          payout_source: values.payout_source as any,
          notes: values.notes,
        });
        toast.success(`Period Return ${pr.return_number} created`);
        form.resetForm();
        setAgreements([]);
        setSelectedAccount(null);
        callBack?.();
        handleClose();
      } catch (e: any) {
        const err = e?.response?.data;
        toast.error(
          err?.investor_account_id?.[0] || err?.profit_sharing_agreement_id?.[0] ||
          err?.capital_committed?.[0] || err?.non_field_errors?.[0] || "Failed to create period return"
        );
      } finally { setLoading(false); }
    },
  });

  const selectedAgreement = agreements.find(a => a.id === form.values.profit_sharing_agreement_id);

  return (
    <Dialog open={open} onClose={() => !loading && handleClose()} maxWidth="md" fullWidth>
      <DialogTitle>New Period Return</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          {/* Investor account selector */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={Boolean(form.touched.investor_account_id && form.errors.investor_account_id)}>
              <InputLabel>Investor Account *</InputLabel>
              <Select value={form.values.investor_account_id} label="Investor Account *"
                onChange={e => {
                  form.setFieldValue("investor_account_id", e.target.value);
                  form.setFieldValue("profit_sharing_agreement_id", "");
                  loadAgreements(e.target.value as string);
                }}>
                {accounts.map(a => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.investor.first_name} {a.investor.last_name} — {a.investor.phone_number}
                  </MenuItem>
                ))}
              </Select>
              {form.touched.investor_account_id && form.errors.investor_account_id && (
                <Typography variant="caption" color="error">{form.errors.investor_account_id as string}</Typography>
              )}
            </FormControl>
          </Grid>

          {/* Agreement selector (filtered to interest-type) */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth disabled={!form.values.investor_account_id}
              error={Boolean(form.touched.profit_sharing_agreement_id && form.errors.profit_sharing_agreement_id)}>
              <InputLabel>Interest Agreement *</InputLabel>
              <Select value={form.values.profit_sharing_agreement_id} label="Interest Agreement *"
                onChange={e => {
                  form.setFieldValue("profit_sharing_agreement_id", e.target.value);
                  // Auto-fill capital_committed from agreement
                  const agr = agreements.find(a => a.id === e.target.value);
                  if (agr?.capital_commitment) form.setFieldValue("capital_committed", agr.capital_commitment);
                }}>
                {agreements.map(a => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.fixed_interest_rate}% / {a.interest_period_days}d
                    {a.capital_commitment ? ` — UGX ${Number(a.capital_commitment).toLocaleString()}` : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {selectedAgreement && (
            <Grid item xs={12}>
              <Alert severity="info">
                Rate: <strong>{selectedAgreement.fixed_interest_rate}%</strong> per{" "}
                <strong>{selectedAgreement.interest_period_days}</strong> days.
                {selectedAgreement.capital_commitment && (
                  <> Committed capital: <strong>{formatCurrency(selectedAgreement.capital_commitment)}</strong></>
                )}
              </Alert>
            </Grid>
          )}

          {/* Period */}
          <Grid item xs={12} md={6}>
            <TextField fullWidth type="date" label="Period Start *" InputLabelProps={{ shrink: true }}
              value={form.values.period_start}
              onChange={e => form.setFieldValue("period_start", e.target.value)}
              error={Boolean(form.touched.period_start && form.errors.period_start)}
              helperText={form.touched.period_start && form.errors.period_start as string}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth type="date" label="Period End *" InputLabelProps={{ shrink: true }}
              value={form.values.period_end}
              onChange={e => form.setFieldValue("period_end", e.target.value)}
              error={Boolean(form.touched.period_end && form.errors.period_end)}
              helperText={form.touched.period_end && form.errors.period_end as string}
            />
          </Grid>

          {/* Amounts */}
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Capital Committed (UGX) *" type="number"
              value={form.values.capital_committed}
              onChange={e => form.setFieldValue("capital_committed", e.target.value)}
              error={Boolean(form.touched.capital_committed && form.errors.capital_committed)}
              helperText={(form.touched.capital_committed && form.errors.capital_committed as string) || "Full agreed capital for this period"}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Capital Deployed (UGX)" type="number"
              value={form.values.capital_deployed}
              onChange={e => form.setFieldValue("capital_deployed", e.target.value)}
              helperText="Portion actually locked in trades (optional, defaults to committed)"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Interest Earned (UGX) *" type="number"
              value={form.values.interest_earned}
              onChange={e => form.setFieldValue("interest_earned", e.target.value)}
              error={Boolean(form.touched.interest_earned && form.errors.interest_earned)}
              helperText={form.touched.interest_earned && form.errors.interest_earned as string}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Days Deployed" type="number"
              value={form.values.days_deployed}
              onChange={e => form.setFieldValue("days_deployed", e.target.value)}
              helperText="Actual trading days (for interest calc)" />
          </Grid>

          {/* Payout source */}
          <Grid item xs={12} md={8}>
            <FormControl fullWidth>
              <InputLabel>Payout Source</InputLabel>
              <Select value={form.values.payout_source} label="Payout Source"
                onChange={e => form.setFieldValue("payout_source", e.target.value)}>
                <MenuItem value="buyer_payment">From Buyer Payment (standard)</MenuItem>
                <MenuItem value="platform_advance">Platform Capital Advance (buyer not yet paid)</MenuItem>
              </Select>
            </FormControl>
            {form.values.payout_source === "platform_advance" && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                Approving with Platform Advance will mark all active investor allocations as
                <strong> force_settled</strong>. Future buyer payments will route to the platform.
              </Alert>
            )}
          </Grid>

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
          {loading ? "Creating..." : "Create Period Return"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Approve / Pay / Cancel dialogs ──────────────────────────────────────────
const ApproveDialog: FC<{
  pr: IInvestorPeriodReturn;
  open: boolean;
  handleClose: () => void;
  callBack: () => void;
}> = ({ pr, open, handleClose, callBack }) => {
  const [source, setSource] = useState<"buyer_payment" | "platform_advance">("buyer_payment");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try {
      await InvestorService.approvePeriodReturn(pr.id, source);
      toast.success("Period return approved");
      callBack();
      handleClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to approve");
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={() => !loading && handleClose()} maxWidth="xs" fullWidth>
      <DialogTitle>Approve Period Return</DialogTitle>
      <DialogContent dividers>
        <Typography gutterBottom>
          Approving <strong>{pr.return_number}</strong>.<br />
          Capital: <strong>{formatCurrency(pr.capital_committed)}</strong> +
          Interest: <strong>{formatCurrency(pr.interest_earned)}</strong> =
          Total: <strong>{formatCurrency(pr.total_amount)}</strong>
        </Typography>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Payout Source</InputLabel>
          <Select value={source} label="Payout Source" onChange={e => setSource(e.target.value as any)}>
            <MenuItem value="buyer_payment">From Buyer Payment</MenuItem>
            <MenuItem value="platform_advance">Platform Capital Advance</MenuItem>
          </Select>
        </FormControl>
        {source === "platform_advance" && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            This will mark all active allocations for this investor as <strong>force_settled</strong>.
            Subsequent buyer payments will route to the platform.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" color="primary" disabled={loading} onClick={handle}
          startIcon={<CheckCircleIcon />}>
          {loading ? "Approving..." : "Approve"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const MarkPaidDialog: FC<{
  pr: IInvestorPeriodReturn;
  open: boolean;
  handleClose: () => void;
  callBack: () => void;
}> = ({ pr, open, handleClose, callBack }) => {
  const [ref, setRef] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!ref.trim()) { toast.error("Payment reference is required"); return; }
    setLoading(true);
    try {
      await InvestorService.markPeriodReturnPaid(pr.id, ref.trim());
      toast.success("Period return marked as paid");
      callBack();
      handleClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed");
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={() => !loading && handleClose()} maxWidth="xs" fullWidth>
      <DialogTitle>Mark as Paid</DialogTitle>
      <DialogContent dividers>
        <Typography gutterBottom>
          Total to pay: <strong>{formatCurrency(pr.total_amount)}</strong>
        </Typography>
        <TextField fullWidth label="Payment Reference *" sx={{ mt: 2 }}
          value={ref} onChange={e => setRef(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" color="success" disabled={loading || !ref.trim()} onClick={handle}
          startIcon={<PaymentIcon />}>
          {loading ? "Saving..." : "Mark Paid"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const InvestorPeriodReturns: FC = () => {
  useTitle("Period Returns");
  const [returns, setReturns] = useState<IInvestorPeriodReturn[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [approvePR, setApprovePR] = useState<IInvestorPeriodReturn | null>(null);
  const [payPR, setPayPR] = useState<IInvestorPeriodReturn | null>(null);
  const [cancelPR, setCancelPR] = useState<IInvestorPeriodReturn | null>(null);
  const [cancelNotes, setCancelNotes] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => { fetchData(); }, [page, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await InvestorService.getPeriodReturns({
        page, page_size: INITIAL_PAGE_SIZE,
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      setReturns(r.results || []);
      setCount(r.count || 0);
    } catch { toast.error("Failed to load period returns"); }
    finally { setLoading(false); }
  };

  const handleCancel = async () => {
    if (!cancelPR) return;
    setCancelLoading(true);
    try {
      await InvestorService.cancelPeriodReturn(cancelPR.id, cancelNotes);
      toast.success("Period return cancelled");
      setCancelPR(null);
      setCancelNotes("");
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to cancel");
    } finally { setCancelLoading(false); }
  };

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>Investor Period Returns</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowCreate(true)}>
          New Period Return
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <MenuItem value="">All</MenuItem>
            {["pending", "approved", "paid", "cancelled"].map(s => (
              <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? <LoadingScreen /> : (
        <Paper variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                {["Return #", "Investor", "Period", "Capital", "Interest", "Total", "Source", "Status", "Actions"].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {returns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                    No period returns found.
                  </TableCell>
                </TableRow>
              ) : returns.map(pr => (
                <TableRow key={pr.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>{pr.return_number}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {pr.investor?.first_name} {pr.investor?.last_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {pr.investor?.phone_number}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: 12 }}>
                    {formatDateToDDMMYYYY(pr.period_start)} → {formatDateToDDMMYYYY(pr.period_end)}
                    {pr.days_deployed > 0 && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        {pr.days_deployed} days deployed
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(pr.capital_committed)}</TableCell>
                  <TableCell sx={{ color: "success.main", fontWeight: 600 }}>{formatCurrency(pr.interest_earned)}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{formatCurrency(pr.total_amount)}</TableCell>
                  <TableCell>
                    <Chip
                      label={SOURCE_LABELS[pr.payout_source] || pr.payout_source}
                      size="small"
                      color={pr.payout_source === "platform_advance" ? "warning" : "default"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={pr.status.toUpperCase()} color={STATUS_COLORS[pr.status]} size="small" />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {pr.status === "pending" && (
                        <>
                          <Button size="small" variant="contained" color="primary"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => setApprovePR(pr)}>
                            Approve
                          </Button>
                          <Button size="small" variant="outlined" color="error"
                            startIcon={<CancelIcon />}
                            onClick={() => { setCancelPR(pr); setCancelNotes(""); }}>
                            Cancel
                          </Button>
                        </>
                      )}
                      {pr.status === "approved" && (
                        <Button size="small" variant="contained" color="success"
                          startIcon={<PaymentIcon />}
                          onClick={() => setPayPR(pr)}>
                          Mark Paid
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

      {/* Create dialog */}
      <CreatePeriodReturnForm
        open={showCreate}
        handleClose={() => setShowCreate(false)}
        callBack={fetchData}
      />

      {/* Approve dialog */}
      {approvePR && (
        <ApproveDialog
          pr={approvePR}
          open={Boolean(approvePR)}
          handleClose={() => setApprovePR(null)}
          callBack={fetchData}
        />
      )}

      {/* Mark paid dialog */}
      {payPR && (
        <MarkPaidDialog
          pr={payPR}
          open={Boolean(payPR)}
          handleClose={() => setPayPR(null)}
          callBack={fetchData}
        />
      )}

      {/* Cancel dialog */}
      <Dialog open={Boolean(cancelPR)} onClose={() => setCancelPR(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Cancel Period Return</DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            Cancel <strong>{cancelPR?.return_number}</strong>?
            This cannot be undone for pending returns.
          </Typography>
          <TextField fullWidth label="Notes (optional)" multiline rows={2} sx={{ mt: 2 }}
            value={cancelNotes} onChange={e => setCancelNotes(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelPR(null)} disabled={cancelLoading}>Back</Button>
          <Button variant="contained" color="error" disabled={cancelLoading} onClick={handleCancel}>
            {cancelLoading ? "Cancelling..." : "Confirm Cancel"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvestorPeriodReturns;
