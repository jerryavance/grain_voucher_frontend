import React, { FC } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Paper,
  Typography,
  Box,
  Chip,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  Verified,
  Person,
  Business,
  LocationOn,
  Phone,
  Download,
  MonetizationOn,
  QrCode,
  Water,
} from '@mui/icons-material';
import { IVoucher } from './Voucher.interface';

interface VoucherDetailsDialogProps {
  voucher: IVoucher | null;
  open: boolean;
  onClose: () => void;
  onRedeem: (voucher: IVoucher) => void;
  onDownloadPDF: (voucher: IVoucher) => void;
}

const VoucherDetailsDialog: FC<VoucherDetailsDialogProps> = ({
  voucher,
  open,
  onClose,
  onRedeem,
  onDownloadPDF,
}) => {
  const theme = useTheme();
  if (!voucher) return null;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('en-UG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatUGX = (value: string | number) =>
    `UGX ${parseFloat(value.toString()).toLocaleString()}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued':
        return 'success';
      case 'traded':
        return 'warning';
      case 'redeemed':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
            Voucher Details
          </Typography>
          <Chip
            label={voucher.status.toUpperCase()}
            color={getStatusColor(voucher.status)}
            icon={<Verified />}
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            {/* Voucher Info */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main }}>
                Voucher Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace', color: 'text.primary' }}>
                    {voucher.id}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Issue Date
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.primary' }}>
                    {formatDate(voucher.issue_date)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Entry Price
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.primary' }}>
                    {formatUGX(voucher.entry_price)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Current Value
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {formatUGX(voucher.current_value)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Deposit Info */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main }}>
                Grain Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Grain Type
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.primary' }}>
                    {voucher.deposit.grain_type_details.name}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Quality Grade
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.primary' }}>
                    {voucher.deposit.quality_grade_details.name}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Quantity
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {parseFloat(voucher.deposit.quantity_kg).toFixed(2)} kg
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Moisture Level
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Water sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                      {voucher.deposit.moisture_level}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Quality Range
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    {voucher.deposit.quality_grade_details.min_moisture}% -{' '}
                    {voucher.deposit.quality_grade_details.max_moisture}% moisture
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Notes
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.primary' }}>
                    {voucher.deposit.notes || 'No additional notes'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Farmer & Hub Info */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main }}>
                    Farmer Details
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: theme.palette.primary.main }}>
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {voucher.deposit.farmer.first_name} {voucher.deposit.farmer.last_name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.primary' }}>
                        {voucher.deposit.farmer.phone_number}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.primary' }}>
                        Role: {voucher.deposit.farmer.role}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main }}>
                    Storage Hub
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Business sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {voucher.deposit.hub.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                      {voucher.deposit.hub.location}
                    </Typography>
                  </Box>
                  {voucher.deposit.hub.hub_admin && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Phone sx={{ mr: 1, color: theme.palette.primary.main }} />
                      <Typography variant="body2" sx={{ color: 'text.primary' }}>
                        {voucher.deposit.hub.hub_admin.first_name}{' '}
                        {voucher.deposit.hub.hub_admin.last_name} -{' '}
                        {voucher.deposit.hub.hub_admin.phone_number}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Right Column - QR Code */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center', height: 'fit-content' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main }}>
                Verification QR Code
              </Typography>
              <Box
                sx={{
                  display: 'inline-block',
                  p: 2,
                  bgcolor: 'white',
                  borderRadius: 2,
                  border: `2px solid ${theme.palette.primary.main}`,
                }}
              >
                <QrCode sx={{ fontSize: 120, color: theme.palette.primary.main }} />
              </Box>
              <Typography variant="body2" sx={{ mt: 1, color: 'text.primary' }}>
                Scan to verify authenticity
              </Typography>
              <Typography
                variant="caption"
                sx={{ display: 'block', mt: 1, fontFamily: 'monospace', color: 'text.primary' }}
              >
                ID: {voucher.id.substring(0, 8)}...
              </Typography>
            </Paper>

            {/* Deposit Date */}
            <Paper sx={{ p: 3, mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Deposit Date
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {formatDate(voucher.deposit.deposit_date)}
              </Typography>
            </Paper>

            {/* Validation Status */}
            <Paper sx={{ p: 3, mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 600 }}>
                Validation Status
              </Typography>
              <Chip
                label={voucher.deposit.validated ? 'VALIDATED' : 'PENDING'}
                color={voucher.deposit.validated ? 'success' : 'warning'}
                icon={<Verified />}
              />
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="primary">
          Close
        </Button>
        <Button onClick={() => onDownloadPDF(voucher)} variant="outlined" color="primary" startIcon={<Download />}>
          Download PDF
        </Button>
        <Button
          onClick={() => onRedeem(voucher)}
          variant="contained"
          color="primary"
          startIcon={<MonetizationOn />}
          disabled={voucher.status === 'redeemed'}
        >
          {voucher.status === 'redeemed' ? 'Already Redeemed' : 'Redeem Voucher'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VoucherDetailsDialog;
