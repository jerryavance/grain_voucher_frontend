import React, { FC } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  Tooltip,
  Chip,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LockIcon from "@mui/icons-material/Lock";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import { IInvestorAccount } from "./Investor.interface";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import uniqueId from "../../utils/generateId";

interface IInvestorDetailsModalProps {
  account: IInvestorAccount | null;
  handleClose: () => void;
}

const InvestorDetailsModal: FC<IInvestorDetailsModalProps> = ({
  account,
  handleClose,
}) => {
  const fmt = (v: string | number) =>
    `UGX ${parseFloat((v ?? 0).toString()).toLocaleString()}`;

  const ActionBtns: FC = () => (
    <Button onClick={handleClose} variant="contained">
      Close
    </Button>
  );

  if (!account || !account.investor) {
    return (
      <ModalDialog
        title="Error"
        onClose={handleClose}
        id={uniqueId()}
        ActionButtons={ActionBtns}
        maxWidth="md"
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" color="error">
            Investor data is not available.
          </Typography>
        </Box>
      </ModalDialog>
    );
  }

  // EMD stats (new fields, fall back to legacy if not present)
  const emdBalance = parseFloat(
    (account as any).emd_balance ?? account.available_balance ?? "0"
  );
  const emdUtilized = parseFloat(
    (account as any).emd_utilized ?? account.total_utilized ?? "0"
  );
  const emdTotal = emdBalance + emdUtilized;
  const emdPct = emdTotal > 0 ? (emdUtilized / emdTotal) * 100 : 0;

  const marginEarned = parseFloat(account.total_margin_earned ?? "0");
  const marginPaid = parseFloat(account.total_margin_paid ?? "0");
  const marginAvailable = marginEarned - marginPaid;

  const utilizationRate =
    parseFloat(account.total_deposited ?? "1") > 0
      ? (
          (parseFloat(account.total_utilized ?? "0") /
            parseFloat(account.total_deposited)) *
          100
        ).toFixed(2)
      : "0.00";

  return (
    <ModalDialog
      title="Investor Account Details"
      onClose={handleClose}
      id={uniqueId()}
      ActionButtons={ActionBtns}
      maxWidth="md"
    >
      <Box sx={{ width: "100%", p: 2 }}>

        {/* ── Investor Info ───────────────────────────────────────────────── */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Investor Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">Name</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {account.investor.first_name} {account.investor.last_name}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">Phone</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {account.investor.phone_number || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">Email</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {account.investor.email || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">Account Created</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formatDateToDDMMYYYY(account.created_at)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ── EMD Wallet (NEW) ────────────────────────────────────────────── */}
        <Card
          sx={{
            mb: 2,
            background: "linear-gradient(135deg, #e8f5e9 0%, #f3e5f5 100%)",
            border: "1px solid #a5d6a7",
          }}
        >
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <AccountBalanceWalletIcon sx={{ mr: 1, color: "success.main" }} />
              <Typography variant="h6" color="success.dark">
                EMD Wallet
              </Typography>
              <Chip
                label="Earnest Money Deposit"
                size="small"
                sx={{ ml: 1, fontSize: 11 }}
                color="success"
                variant="outlined"
              />
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, bgcolor: "#fff", borderRadius: 1, textAlign: "center" }}>
                  <AccountBalanceWalletIcon sx={{ color: "success.main", mb: 0.5 }} />
                  <Typography variant="body2" color="textSecondary">
                    Available (Liquid)
                  </Typography>
                  <Typography variant="h6" color="success.main" fontWeight="bold">
                    {fmt(emdBalance)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, bgcolor: "#fff", borderRadius: 1, textAlign: "center" }}>
                  <LockIcon sx={{ color: "warning.main", mb: 0.5 }} />
                  <Typography variant="body2" color="textSecondary">
                    In Active Trades
                  </Typography>
                  <Typography variant="h6" color="warning.main" fontWeight="bold">
                    {fmt(emdUtilized)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, bgcolor: "#fff", borderRadius: 1, textAlign: "center" }}>
                  <Typography variant="body2" color="textSecondary">
                    Utilization
                  </Typography>
                  <Typography
                    variant="h6"
                    color={emdPct > 80 ? "error.main" : "text.primary"}
                    fontWeight="bold"
                  >
                    {emdPct.toFixed(1)}%
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">
                  EMD Utilization — {fmt(emdUtilized)} of {fmt(emdTotal)} in use
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={emdPct}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    mt: 0.5,
                    bgcolor: "#e8f5e9",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: emdPct > 80 ? "#ef5350" : emdPct > 50 ? "#ffa726" : "#43a047",
                    },
                  }}
                />
                <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: "block" }}>
                  ⚠️ Trades cannot be allocated if invoice value exceeds available EMD balance
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ── Financial Summary ───────────────────────────────────────────── */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Financial Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: "#e3f2fd", borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary">Total Deposited</Typography>
                  <Typography variant="h6" color="primary">{fmt(account.total_deposited || 0)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: "#fff3e0", borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary">Utilization Rate</Typography>
                  <Typography variant="h6" color="warning.main">{utilizationRate}%</Typography>
                </Box>
              </Grid>

              {/* Margin section */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "#f3e5f5",
                    borderRadius: 1,
                    border: "1px dashed #ba68c8",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <TrendingUpIcon sx={{ mr: 1, color: "secondary.main", fontSize: 20 }} />
                    <Typography variant="subtitle1" fontWeight="bold" color="secondary.main">
                      Margin Summary
                    </Typography>
                  </Box>
                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="textSecondary">Total Earned</Typography>
                      <Typography variant="body1" fontWeight="bold" color="success.main">
                        {fmt(marginEarned)}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="textSecondary">Total Paid Out</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {fmt(marginPaid)}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="textSecondary">Unpaid Balance</Typography>
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        color={marginAvailable > 0 ? "success.main" : "text.secondary"}
                      >
                        {fmt(marginAvailable > 0 ? marginAvailable : 0)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ── Profit Sharing Agreement ────────────────────────────────────── */}
        {account.profit_agreement && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Active Profit Sharing Agreement
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="textSecondary">Profit Threshold</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {account.profit_agreement.profit_threshold || 0}%
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="textSecondary">Investor Share</Typography>
                  <Typography variant="body1" fontWeight="bold" color="success.main">
                    {account.profit_agreement.investor_share || 0}%
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="textSecondary">BENNU Share</Typography>
                  <Typography variant="body1" fontWeight="bold" color="info.main">
                    {account.profit_agreement.bennu_share || 0}%
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">Effective Date</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatDateToDDMMYYYY(
                      account.profit_agreement.effective_date || new Date()
                    )}
                  </Typography>
                </Grid>
                {account.profit_agreement.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">Notes</Typography>
                    <Typography variant="body1">{account.profit_agreement.notes}</Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        )}
      </Box>
    </ModalDialog>
  );
};

export default InvestorDetailsModal;