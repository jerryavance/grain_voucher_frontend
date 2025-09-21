// RedemptionDialog.tsx
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
import { MonetizationOn, AttachMoney, Warning } from '@mui/icons-material';
import { IVoucher, IRedemption } from './Voucher.interface';

interface RedemptionDialogProps {
  voucher: IVoucher | null;
  open: boolean;
  onClose: () => void;
  onRedeem: (voucher: IVoucher, redemptionData: Omit<IRedemption, 'id' | 'created_at' | 'updated_at'>) => void;
}

const RedemptionDialog: FC<RedemptionDialogProps> = ({ voucher, open, onClose, onRedeem }) => {
  const [redemptionData, setRedemptionData] = useState<{
    amount: string;
    payment_method: 'mobile_money' | 'bank_transfer' | 'cash' | 'check';
    notes: string;
  }>({
    amount: '',
    payment_method: 'mobile_money',
    notes: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Set default amount when voucher changes
  React.useEffect(() => {
    if (voucher && open) {
      setRedemptionData(prev => ({
        ...prev,
        amount: voucher.current_value
      }));
    }
  }, [voucher, open]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!redemptionData.amount) {
      newErrors.amount = 'Redemption amount is required';
    } else if (parseFloat(redemptionData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (voucher && parseFloat(redemptionData.amount) > parseFloat(voucher.current_value)) {
      newErrors.amount = 'Amount cannot exceed voucher value';
    }

    if (!redemptionData.payment_method) {
      newErrors.payment_method = 'Payment method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!voucher) return;
    
    if (validateForm()) {
      const redemptionPayload: Omit<IRedemption, 'id' | 'created_at' | 'updated_at'> = {
        voucher: voucher.id,
        amount: redemptionData.amount,
        payment_method: redemptionData.payment_method,
        notes: redemptionData.notes
      };
      
      onRedeem(voucher, redemptionPayload);
      onClose();
      
      // Reset form
      setRedemptionData({
        amount: '',
        payment_method: 'mobile_money',
        notes: ''
      });
      setErrors({});
    }
  };

  const handleClose = () => {
    onClose();
    setErrors({});
  };

  if (!voucher) return null;

  const isPartialRedemption = parseFloat(redemptionData.amount) < parseFloat(voucher.current_value);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MonetizationOn color="success" />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Redeem Voucher
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Voucher Summary */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {voucher.deposit.grain_type_details.name} Voucher
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={`${parseFloat(voucher.deposit.quantity_kg).toFixed(0)}kg`} 
                  size="small" 
                  variant="outlined" 
                />
                <Chip 
                  label={voucher.deposit.quality_grade_details.name} 
                  size="small" 
                  variant="outlined" 
                />
                <Chip 
                  label={`Moisture: ${voucher.deposit.moisture_level}%`} 
                  size="small" 
                  variant="outlined" 
                />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Total Value</Typography>
              <Typography variant="h6" color="success.main" sx={{ fontWeight: 700 }}>
                ${parseFloat(voucher.current_value).toFixed(2)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Storage Hub</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {voucher.deposit.hub.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {voucher.deposit.hub.location}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Redemption will convert your grain voucher to cash. This action cannot be undone once approved.
        </Alert>

        {/* Redemption Form */}
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Redemption Amount"
            type="number"
            value={redemptionData.amount}
            onChange={(e) => setRedemptionData(prev => ({ ...prev, amount: e.target.value }))}
            error={!!errors.amount}
            helperText={
              errors.amount || 
              `Maximum redemption value: $${voucher.current_value}`
            }
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><AttachMoney /></InputAdornment>
            }}
            inputProps={{
              min: 0,
              max: parseFloat(voucher.current_value),
              step: 0.01
            }}
          />

          {isPartialRedemption && redemptionData.amount && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Warning fontSize="small" />
                <Typography variant="body2">
                  Partial redemption: ${(parseFloat(voucher.current_value) - parseFloat(redemptionData.amount)).toFixed(2)} will remain in your voucher
                </Typography>
              </Box>
            </Alert>
          )}
          
          <FormControl 
            fullWidth 
            sx={{ mb: 2 }}
            error={!!errors.payment_method}
          >
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={redemptionData.payment_method}
              onChange={(e) => setRedemptionData(prev => ({ 
                ...prev, 
                payment_method: e.target.value as typeof prev.payment_method 
              }))}
              label="Payment Method"
            >
              <MenuItem value="mobile_money">
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Mobile Money</Typography>
                  <Typography variant="caption" color="text.secondary">
                    MTN Mobile Money, Airtel Money, etc.
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem value="bank_transfer">
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Bank Transfer</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Direct transfer to your bank account
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem value="cash">
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Cash Pickup</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Collect cash at the storage hub
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem value="check">
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Bank Check</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Receive a bank check
                  </Typography>
                </Box>
              </MenuItem>
            </Select>
            {errors.payment_method && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                {errors.payment_method}
              </Typography>
            )}
          </FormControl>
          
          <TextField
            fullWidth
            label="Additional Notes (Optional)"
            multiline
            rows={3}
            value={redemptionData.notes}
            onChange={(e) => setRedemptionData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Add any special instructions for redemption..."
            helperText="Include payment details like mobile money number or bank account information"
          />
        </Box>

        {/* Processing Information */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'info.main', color: 'white', borderRadius: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Processing Information:
          </Typography>
          <Typography variant="caption">
            • Redemption requests are processed within 1-3 business days<br/>
            • You will receive a confirmation once approved<br/>
            • Payment will be sent via your selected method<br/>
            • Contact the hub admin if you have questions: {voucher.deposit.hub.hub_admin?.phone_number}
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          color="success"
          startIcon={<MonetizationOn />}
          disabled={!redemptionData.amount || parseFloat(redemptionData.amount) <= 0}
        >
          Submit Redemption Request
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RedemptionDialog;