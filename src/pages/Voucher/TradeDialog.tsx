import React, { FC, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Grid,
  Chip,
  InputAdornment,
  Alert,
} from '@mui/material';
import { TrendingUp } from '@mui/icons-material';
import { IVoucher, ITrade } from './Voucher.interface';

interface TradeDialogProps {
  voucher: IVoucher | null;
  open: boolean;
  onClose: () => void;
  onTrade: (
    voucher: IVoucher,
    tradeData: Omit<ITrade, 'id' | 'created_at' | 'updated_at'>
  ) => void;
}

const TradeDialog: FC<TradeDialogProps> = ({
  voucher,
  open,
  onClose,
  onTrade,
}) => {
  const [tradeData, setTradeData] = useState<{
    amount: string;
    payment_method: 'mobile_money' | 'bank_transfer' | 'cash';
    notes: string;
  }>({
    amount: '',
    payment_method: 'mobile_money',
    notes: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!tradeData.amount) {
      newErrors.amount = 'Trade amount is required';
    } else if (parseFloat(tradeData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (
      voucher &&
      parseFloat(tradeData.amount) > parseFloat(voucher.current_value)
    ) {
      newErrors.amount = 'Amount cannot exceed voucher value';
    }

    if (!tradeData.payment_method) {
      newErrors.payment_method = 'Payment method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!voucher) return;

    if (validateForm()) {
      const tradePayload: Omit<ITrade, 'id' | 'created_at' | 'updated_at'> = {
        voucher: voucher.id,
        amount: tradeData.amount,
        payment_method: tradeData.payment_method,
        notes: tradeData.notes,
      };

      onTrade(voucher, tradePayload);
      onClose();

      // Reset form
      setTradeData({
        amount: '',
        payment_method: 'mobile_money',
        notes: '',
      });
      setErrors({});
    }
  };

  const handleClose = () => {
    onClose();
    setErrors({});
  };

  if (!voucher) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Trade Voucher
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Voucher Summary */}
        <Box
          sx={{
            mb: 3,
            p: 2,
            bgcolor: 'grey.50',
            borderRadius: 2,
            border: theme => `1px solid ${theme.palette.primary.main}40`,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {voucher.deposit.grain_type_details.name} Voucher
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`${parseFloat(voucher.deposit.quantity_kg).toFixed(
                    0
                  )}kg`}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
                <Chip
                  label={voucher.deposit.quality_grade_details.name}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={voucher.status.toUpperCase()}
                  size="small"
                  color="success"
                />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Typography
                variant="body2"
                sx={{ color: 'text.primary', fontWeight: 600 }}
              >
                Current Value
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: 'success.main', fontWeight: 700 }}
              >
                UGX {parseFloat(voucher.current_value).toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography
                variant="body2"
                sx={{ color: 'text.primary', fontWeight: 600 }}
              >
                Storage Hub
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {voucher.deposit.hub.name}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Enter the amount you want to sell this voucher for. The buyer will pay
          you directly using your selected payment method.
        </Alert>

        {/* Trade Form */}
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Trade Amount (UGX)"
            type="number"
            value={tradeData.amount}
            onChange={e =>
              setTradeData(prev => ({ ...prev, amount: e.target.value }))
            }
            error={!!errors.amount}
            helperText={
              errors.amount ||
              `Maximum: UGX ${parseFloat(voucher.current_value).toLocaleString()}`
            }
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    UGX
                  </Typography>
                </InputAdornment>
              ),
            }}
            inputProps={{
              min: 0,
              max: parseFloat(voucher.current_value),
              step: 1,
            }}
          />

          <FormControl
            fullWidth
            sx={{ mb: 2 }}
            error={!!errors.payment_method}
          >
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={tradeData.payment_method}
              onChange={e =>
                setTradeData(prev => ({
                  ...prev,
                  payment_method: e.target.value as typeof prev.payment_method,
                }))
              }
              label="Payment Method"
            >
              <MenuItem value="mobile_money">
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Mobile Money
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    MTN, Airtel, etc.
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem value="bank_transfer">
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Bank Transfer
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Direct bank transfer
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem value="cash">
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Cash
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Physical cash payment
                  </Typography>
                </Box>
              </MenuItem>
            </Select>
            {errors.payment_method && (
              <Typography
                variant="caption"
                color="error"
                sx={{ mt: 0.5, ml: 1.5 }}
              >
                {errors.payment_method}
              </Typography>
            )}
          </FormControl>

          <TextField
            fullWidth
            label="Additional Notes (Optional)"
            multiline
            rows={3}
            value={tradeData.notes}
            onChange={e =>
              setTradeData(prev => ({ ...prev, notes: e.target.value }))
            }
            placeholder="Add any specific requirements or details for the trade..."
            helperText="Include any special instructions for the buyer"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<TrendingUp />}
          disabled={!tradeData.amount || parseFloat(tradeData.amount) <= 0}
        >
          Create Trade Listing
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TradeDialog;
