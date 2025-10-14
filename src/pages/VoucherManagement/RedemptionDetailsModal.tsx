import React, { FC, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
  Divider,
  Chip,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { toast } from "react-hot-toast";
import { IRedemptionDetailsModalProps } from "./Voucher.interface";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import { VoucherService } from "./Voucher.service";
import ProgressIndicator from "../../components/UI/ProgressIndicator";

const RedemptionDetailsModal: FC<IRedemptionDetailsModalProps> = ({
  redemption,
  handleClose,
  onUpdate,
}) => {
  const [loading, setLoading] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  if (!redemption) return null;

  const handleApprove = async () => {
    setLoading(true);
    try {
      await VoucherService.approveRedemption(redemption.id);
      toast.success("Redemption approved successfully");
      setShowApproveDialog(false);
      onUpdate && onUpdate();
      handleClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve redemption");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setLoading(true);
    try {
      await VoucherService.rejectRedemption(redemption.id, {
        reason: rejectReason,
      });
      toast.success("Redemption rejected");
      setShowRejectDialog(false);
      onUpdate && onUpdate();
      handleClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject redemption");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    setLoading(true);
    try {
      await VoucherService.markRedemptionPaid(redemption.id, {
        notes: paymentNotes,
      });
      toast.success("Redemption marked as paid");
      setShowPaymentDialog(false);
      onUpdate && onUpdate();
      handleClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to mark as paid");
    } finally {
      setLoading(false);
    }
  };

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
    const colorMap: Record<string, any> = {
      pending: "warning",
      approved: "info",
      rejected: "error",
      paid: "success",
    };
    return colorMap[status] || "default";
  };

  const ActionBtns: FC = () => {
    const canApprove = redemption.status === "pending";
    const canMarkPaid = redemption.status === "approved";

    return (
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button onClick={handleClose}>Close</Button>
        {canApprove && (
          <>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setShowRejectDialog(true)}
            >
              Reject
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => setShowApproveDialog(true)}
            >
              Approve
            </Button>
          </>
        )}
        {canMarkPaid && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowPaymentDialog(true)}
          >
            Mark as Paid
          </Button>
        )}
      </Box>
    );
  };

  return (
    <>
      <Dialog
        open={true}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        sx={{ zIndex: 1300 }}
      >
        <DialogTitle>Redemption Details</DialogTitle>
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
                    label={redemption.status.toUpperCase()}
                    color={getStatusColor(redemption.status) as any}
                    sx={{ fontWeight: 600 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Payment Method
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {redemption.payment_method?.replace("_", " ").toUpperCase() ||
                      "N/A"}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Financial Summary */}
            <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 2 }}>
              Financial Summary
            </Typography>
            <Paper elevation={0} sx={{ p: 2, bgcolor: "primary.50", mb: 2 }}>
              <DetailRow
                label="Redemption Amount"
                value={`UGX ${parseFloat(redemption.amount).toLocaleString()}`}
                highlight
              />
              <DetailRow
                label="Fees"
                value={`UGX ${parseFloat(redemption.fee).toLocaleString()}`}
              />
              <Divider sx={{ my: 1 }} />
              <DetailRow
                label="Net Payout"
                value={`UGX ${parseFloat(redemption.net_payout).toLocaleString()}`}
                highlight
              />
            </Paper>

            {/* Redemption Information */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
              Redemption Information
            </Typography>
            <DetailRow
              label="Request Date"
              value={formatDateToDDMMYYYY(redemption.request_date)}
            />
            <DetailRow
              label="Redemption ID"
              value={redemption.id.substring(0, 16) + "..."}
            />

            <Divider sx={{ my: 3 }} />

            {/* Requester Information */}
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Requester Information
            </Typography>
            <DetailRow
              label="Name"
              value={`${redemption.requester.first_name} ${redemption.requester.last_name}`}
            />
            <DetailRow
              label="Phone"
              value={redemption.requester.phone_number}
            />
            <DetailRow
              label="Email"
              value={redemption.requester.email || "N/A"}
            />
            <DetailRow
              label="Role"
              value={redemption.requester.role.toUpperCase()}
            />

            <Divider sx={{ my: 3 }} />

            {/* Voucher Information */}
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Associated Voucher
            </Typography>
            <DetailRow
              label="GRN Number"
              value={redemption.voucher_details.grn_number}
            />
            <DetailRow
              label="Current Voucher Value"
              value={`UGX ${parseFloat(redemption.voucher_details.current_value).toLocaleString()}`}
            />
            <DetailRow
              label="Grain Type"
              value={redemption.voucher_details.deposit.grain_type_details.name}
            />
            <DetailRow
              label="Quantity"
              value={`${parseFloat(redemption.voucher_details.deposit.quantity_kg).toFixed(2)} kg`}
            />
            <DetailRow
              label="Hub"
              value={redemption.voucher_details.deposit.hub.name}
            />

            {redemption.notes && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  Notes
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {redemption.notes}
                </Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <ActionBtns />
        </DialogActions>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <Dialog open={showApproveDialog} onClose={() => setShowApproveDialog(false)}>
        <DialogTitle>Approve Redemption</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to approve this redemption request for{" "}
            <strong>
              UGX {parseFloat(redemption.net_payout).toLocaleString()}
            </strong>
            ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowApproveDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            variant="contained"
            color="success"
            disabled={loading}
          >
            {loading ? <ProgressIndicator size={20} /> : "Approve"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onClose={() => setShowRejectDialog(false)}>
        <DialogTitle>Reject Redemption</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Please provide a reason for rejecting this redemption:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter rejection reason..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRejectDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            variant="contained"
            color="error"
            disabled={loading}
          >
            {loading ? <ProgressIndicator size={20} /> : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Confirmation Dialog */}
      <Dialog open={showPaymentDialog} onClose={() => setShowPaymentDialog(false)}>
        <DialogTitle>Confirm Payment</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Confirm that payment of{" "}
            <strong>
              UGX {parseFloat(redemption.net_payout).toLocaleString()}
            </strong>{" "}
            has been made to {redemption.requester.first_name}{" "}
            {redemption.requester.last_name}.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
            placeholder="Optional: Add payment notes (transaction ID, etc.)..."
            sx={{ mt: 2 }}
            label="Payment Notes"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPaymentDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleMarkPaid}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <ProgressIndicator size={20} /> : "Confirm Payment"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RedemptionDetailsModal;