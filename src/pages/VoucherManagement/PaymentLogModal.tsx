import React, { FC, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { toast } from "react-hot-toast";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { IRedemption } from "./Voucher.interface";
import { VoucherService } from "./Voucher.service";

interface IPaymentLogModalProps {
  redemption: IRedemption;
  handleClose: () => void;
  onSuccess: () => void;
}

const PaymentLogModal: FC<IPaymentLogModalProps> = ({
  redemption,
  handleClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    transaction_id: "",
    payment_reference: "",
    payment_date: new Date().toISOString().split("T")[0],
    notes: "",
    confirmation_method: "system",
  });

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.transaction_id.trim()) {
      toast.error("Transaction ID is required");
      return;
    }

    setLoading(true);
    try {
      await VoucherService.markRedemptionPaid(redemption.id, {
        ...formData,
        paid_amount: redemption.net_payout,
      });
      
      toast.success("Payment logged successfully");
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to log payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={{ zIndex: 1300 }}
    >
      <DialogTitle>Log Payment</DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Recording payment for redemption to{" "}
            <strong>
              {redemption.requester.first_name} {redemption.requester.last_name}
            </strong>
          </Typography>
          
          <Box
            sx={{
              p: 2,
              bgcolor: "primary.50",
              borderRadius: 1,
              my: 2,
            }}
          >
            <Typography variant="h6" color="primary">
              Amount: UGX {parseFloat(redemption.net_payout).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Payment Method: {redemption.payment_method?.replace("_", " ").toUpperCase()}
            </Typography>
          </Box>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Transaction ID / Reference Number"
                value={formData.transaction_id}
                onChange={(e) => handleChange("transaction_id", e.target.value)}
                placeholder="Enter transaction ID or reference number"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Payment Reference"
                value={formData.payment_reference}
                onChange={(e) => handleChange("payment_reference", e.target.value)}
                placeholder="Additional reference (optional)"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Payment Date"
                value={formData.payment_date}
                onChange={(e) => handleChange("payment_date", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Confirmation Method</InputLabel>
                <Select
                  value={formData.confirmation_method}
                  onChange={(e) => handleChange("confirmation_method", e.target.value)}
                  label="Confirmation Method"
                >
                  <MenuItem value="system">System Confirmation</MenuItem>
                  <MenuItem value="manual">Manual Verification</MenuItem>
                  <MenuItem value="bank_statement">Bank Statement</MenuItem>
                  <MenuItem value="receipt">Physical Receipt</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Payment Notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Add any additional notes about this payment..."
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <ProgressIndicator color="inherit" size={20} />{" "}
              <span style={{ marginLeft: "0.5rem" }}>Logging...</span>
            </>
          ) : (
            "Confirm Payment"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentLogModal;