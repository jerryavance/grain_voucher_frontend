import React, { FC } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
  Divider,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { IVoucherDetailsModalProps } from "./Voucher.interface";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";

const VoucherDetailsModal: FC<IVoucherDetailsModalProps> = ({
  voucher,
  handleClose,
}) => {
  if (!voucher) return null;

  const DetailRow: FC<{ label: string; value: any; highlight?: boolean }> = ({
    label,
    value,
    highlight = false,
  }) => (
    <Grid container spacing={2} sx={{ mb: 1.5 }}>
      <Grid item xs={5}>
        <Typography variant="body2" color="textSecondary" fontWeight={600}>
          {label}:
        </Typography>
      </Grid>
      <Grid item xs={7}>
        <Typography
          variant="body2"
          fontWeight={highlight ? 600 : 400}
          color={highlight ? "primary" : "textPrimary"}
        >
          {value}
        </Typography>
      </Grid>
    </Grid>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "issued":
        return "success";
      case "pending_verification":
        return "warning";
      case "transferred":
        return "info";
      case "redeemed":
        return "default";
      case "expired":
        return "error";
      default:
        return "default";
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case "verified":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const ActionBtns: FC = () => (
    <Box sx={{ display: "flex", gap: 1 }}>
      <Button onClick={handleClose}>Close</Button>
    </Box>
  );

  return (
    <Dialog
      open={true}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      sx={{ zIndex: 1300 }}
    >
      <DialogTitle>Voucher Details</DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          {/* Status Section */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50", mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Status
                </Typography>
                <Chip
                  label={voucher.status.replace("_", " ").toUpperCase()}
                  color={getStatusColor(voucher.status) as any}
                  sx={{ fontWeight: 600 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Verification Status
                </Typography>
                <Chip
                  label={voucher.verification_status_display || voucher.verification_status}
                  color={getVerificationColor(voucher.verification_status) as any}
                  sx={{ fontWeight: 600 }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Voucher Information */}
          <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 2 }}>
            Voucher Information
          </Typography>
          <DetailRow label="GRN Number" value={voucher.grn_number} highlight />
          <DetailRow
            label="Current Value"
            value={`UGX ${parseFloat(voucher.current_value).toLocaleString()}`}
            highlight
          />
          <DetailRow
            label="Entry Price"
            value={`UGX ${parseFloat(voucher.entry_price).toLocaleString()}`}
          />
          <DetailRow
            label="Issue Date"
            value={formatDateToDDMMYYYY(voucher.issue_date)}
          />
          <DetailRow
            label="Last Updated"
            value={formatDateToDDMMYYYY(voucher.updated_at)}
          />
          <DetailRow
            label="Can Be Traded"
            value={voucher.can_be_traded ? "Yes" : "No"}
          />
          <DetailRow
            label="Can Be Redeemed"
            value={voucher.can_be_redeemed ? "Yes" : "No"}
          />

          <Divider sx={{ my: 3 }} />

          {/* Holder Information */}
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Holder Information
          </Typography>
          <DetailRow
            label="Name"
            value={`${voucher.holder.first_name} ${voucher.holder.last_name}`}
          />
          <DetailRow label="Phone" value={voucher.holder.phone_number} />
          <DetailRow label="Email" value={voucher.holder.email || "N/A"} />
          <DetailRow label="Role" value={voucher.holder.role.toUpperCase()} />

          <Divider sx={{ my: 3 }} />

          {/* Deposit Information */}
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Deposit Information
          </Typography>
          <DetailRow
            label="Farmer"
            value={`${voucher.deposit.farmer.first_name} ${voucher.deposit.farmer.last_name}`}
          />
          <DetailRow label="Hub" value={voucher.deposit.hub.name} />
          <DetailRow
            label="Grain Type"
            value={voucher.deposit.grain_type_details.name}
          />
          <DetailRow
            label="Quality Grade"
            value={voucher.deposit.quality_grade_details.name}
          />
          <DetailRow
            label="Quantity"
            value={`${parseFloat(voucher.deposit.quantity_kg).toFixed(2)} kg`}
          />
          <DetailRow
            label="Moisture Level"
            value={`${parseFloat(voucher.deposit.moisture_level).toFixed(2)}%`}
          />
          <DetailRow
            label="Deposit Date"
            value={formatDateToDDMMYYYY(voucher.deposit.deposit_date)}
          />
          <DetailRow
            label="Validated"
            value={voucher.deposit.validated ? "Yes" : "No"}
          />

          {voucher.deposit.agent && (
            <>
              <Divider sx={{ my: 2 }} />
              <DetailRow
                label="Agent"
                value={`${voucher.deposit.agent.first_name} ${voucher.deposit.agent.last_name}`}
              />
            </>
          )}

          {voucher.verified_by && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Verification Information
              </Typography>
              <DetailRow
                label="Verified By"
                value={`${voucher.verified_by.first_name} ${voucher.verified_by.last_name}`}
              />
              <DetailRow
                label="Verified At"
                value={
                  voucher.verified_at
                    ? formatDateToDDMMYYYY(voucher.verified_at)
                    : "N/A"
                }
              />
            </>
          )}

          {voucher.deposit.notes && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Notes
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {voucher.deposit.notes}
              </Typography>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <ActionBtns />
      </DialogActions>
    </Dialog>
  );
};

export default VoucherDetailsModal;