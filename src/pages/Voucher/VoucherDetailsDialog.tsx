import React, { FC, useRef } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableRow,
  Divider,
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
import { toast } from 'react-hot-toast';
import { IVoucher } from './Voucher.interface';

interface VoucherDetailsDialogProps {
  voucher: IVoucher | null;
  open: boolean;
  onClose: () => void;
  onRedeem: (voucher: IVoucher) => void;
}

const VoucherDetailsDialog: FC<VoucherDetailsDialogProps> = ({
  voucher,
  open,
  onClose,
  onRedeem,
}) => {
  const theme = useTheme();
  const voucherRef = useRef<HTMLDivElement>(null);

  if (!voucher) return null;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('en-UG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatDateShort = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  const loadHtml2Pdf = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).html2pdf) {
        resolve((window as any).html2pdf);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => resolve((window as any).html2pdf);
      script.onerror = () => reject(new Error('Failed to load PDF library'));
      document.head.appendChild(script);
    });
  };

  const handleDownloadPDF = async () => {
    try {
      toast.loading('Generating voucher PDF...');

      const html2pdf = await loadHtml2Pdf();

      const element = voucherRef.current;
      const opt = {
        margin: 10,
        filename: `Voucher-${voucher.id.substring(0, 8)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      await html2pdf().set(opt).from(element).save();
      toast.dismiss();
      toast.success('Voucher downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.dismiss();
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <>
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
          <Button onClick={handleDownloadPDF} variant="outlined" color="primary" startIcon={<Download />}>
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

      {/* Hidden Printable Voucher for PDF */}
      <Box sx={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <Box ref={voucherRef} sx={{ width: '190mm', bgcolor: 'white', p: 0 }}>
          {/* Header with Logo and Title */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                bgcolor: '#76c045',
                px: 2,
                py: 1,
                borderRadius: 1,
              }}
            >
              <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.5rem' }}>
                AMSAF
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '1.5rem', mb: 0.5 }}>
                GRAIN VOUCHER
              </Typography>
              <Chip
                label={voucher.status.toUpperCase()}
                size="small"
                sx={{
                  bgcolor: getStatusColor(voucher.status) === 'success' ? '#4caf50' : '#ff9800',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.7rem',
                }}
              />
            </Box>
          </Box>

          {/* Voucher ID and Value - Combined */}
          <Box
            sx={{
              bgcolor: '#e8f5e9',
              border: '2px solid #4caf50',
              p: 2,
              mb: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography sx={{ fontSize: '0.75rem', color: '#666', mb: 0.5 }}>
                Voucher ID
              </Typography>
              <Typography sx={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600 }}>
                {voucher.id}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#2e7d32', mb: 0.5 }}>
                Current Value
              </Typography>
              <Typography sx={{ fontWeight: 'bold', color: '#1b5e20', fontSize: '1.5rem' }}>
                {formatUGX(voucher.current_value)}
              </Typography>
            </Box>
          </Box>

          {/* Main Details Grid */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {/* Left Column */}
            <Grid item xs={7}>
              {/* Grain Details */}
              <Box sx={{ border: '1px solid #ddd', p: 1.5, mb: 2, height: '140px' }}>
                <Typography sx={{ mb: 1, fontWeight: 'bold', color: '#76c045', fontSize: '0.9rem' }}>
                  Grain Information
                </Typography>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ border: 'none', py: 0.3, pl: 0, fontWeight: 600, fontSize: '0.75rem', width: '35%' }}>
                        Type:
                      </TableCell>
                      <TableCell sx={{ border: 'none', py: 0.3, fontSize: '0.75rem' }}>
                        {voucher.deposit.grain_type_details.name}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ border: 'none', py: 0.3, pl: 0, fontWeight: 600, fontSize: '0.75rem' }}>
                        Grade:
                      </TableCell>
                      <TableCell sx={{ border: 'none', py: 0.3, fontSize: '0.75rem' }}>
                        {voucher.deposit.quality_grade_details.name}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ border: 'none', py: 0.3, pl: 0, fontWeight: 600, fontSize: '0.75rem' }}>
                        Quantity:
                      </TableCell>
                      <TableCell sx={{ border: 'none', py: 0.3, fontWeight: 'bold', fontSize: '0.75rem' }}>
                        {parseFloat(voucher.deposit.quantity_kg).toFixed(2)} kg
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ border: 'none', py: 0.3, pl: 0, fontWeight: 600, fontSize: '0.75rem' }}>
                        Moisture:
                      </TableCell>
                      <TableCell sx={{ border: 'none', py: 0.3, fontSize: '0.75rem' }}>
                        {voucher.deposit.moisture_level}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ border: 'none', py: 0.3, pl: 0, fontWeight: 600, fontSize: '0.75rem' }}>
                        Deposit:
                      </TableCell>
                      <TableCell sx={{ border: 'none', py: 0.3, fontSize: '0.75rem' }}>
                        {formatDateShort(voucher.deposit.deposit_date)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>

              {/* Farmer Details */}
              <Box sx={{ border: '1px solid #ddd', p: 1.5, mb: 2, height: '100px' }}>
                <Typography sx={{ mb: 1, fontWeight: 'bold', color: '#76c045', fontSize: '0.9rem' }}>
                  Farmer Details
                </Typography>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ border: 'none', py: 0.3, pl: 0, fontWeight: 600, fontSize: '0.75rem', width: '35%' }}>
                        Name:
                      </TableCell>
                      <TableCell sx={{ border: 'none', py: 0.3, fontSize: '0.75rem' }}>
                        {voucher.deposit.farmer.first_name} {voucher.deposit.farmer.last_name}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ border: 'none', py: 0.3, pl: 0, fontWeight: 600, fontSize: '0.75rem' }}>
                        Phone:
                      </TableCell>
                      <TableCell sx={{ border: 'none', py: 0.3, fontSize: '0.75rem' }}>
                        {voucher.deposit.farmer.phone_number}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ border: 'none', py: 0.3, pl: 0, fontWeight: 600, fontSize: '0.75rem' }}>
                        Role:
                      </TableCell>
                      <TableCell sx={{ border: 'none', py: 0.3, fontSize: '0.75rem' }}>
                        {voucher.deposit.farmer.role}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>

              {/* Storage Hub */}
              <Box sx={{ border: '1px solid #ddd', p: 1.5, height: '110px' }}>
                <Typography sx={{ mb: 1, fontWeight: 'bold', color: '#76c045', fontSize: '0.9rem' }}>
                  Storage Hub
                </Typography>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ border: 'none', py: 0.3, pl: 0, fontWeight: 600, fontSize: '0.75rem', width: '35%' }}>
                        Hub:
                      </TableCell>
                      <TableCell sx={{ border: 'none', py: 0.3, fontSize: '0.75rem' }}>
                        {voucher.deposit.hub.name}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ border: 'none', py: 0.3, pl: 0, fontWeight: 600, fontSize: '0.75rem' }}>
                        Location:
                      </TableCell>
                      <TableCell sx={{ border: 'none', py: 0.3, fontSize: '0.75rem' }}>
                        {voucher.deposit.hub.location}
                      </TableCell>
                    </TableRow>
                    {voucher.deposit.hub.hub_admin && (
                      <>
                        <TableRow>
                          <TableCell sx={{ border: 'none', py: 0.3, pl: 0, fontWeight: 600, fontSize: '0.75rem' }}>
                            Admin:
                          </TableCell>
                          <TableCell sx={{ border: 'none', py: 0.3, fontSize: '0.75rem' }}>
                            {voucher.deposit.hub.hub_admin.first_name} {voucher.deposit.hub.hub_admin.last_name}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ border: 'none', py: 0.3, pl: 0, fontWeight: 600, fontSize: '0.75rem' }}>
                            Contact:
                          </TableCell>
                          <TableCell sx={{ border: 'none', py: 0.3, fontSize: '0.75rem' }}>
                            {voucher.deposit.hub.hub_admin.phone_number}
                          </TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Grid>

            {/* Right Column - QR Code and Verification */}
            <Grid item xs={5}>
              <Box
                sx={{
                  border: '2px solid #76c045',
                  p: 2,
                  textAlign: 'center',
                  bgcolor: '#f9f9f9',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography sx={{ mb: 1, fontWeight: 'bold', fontSize: '0.9rem' }}>
                    Verification Code
                  </Typography>
                  <Box
                    sx={{
                      display: 'inline-block',
                      p: 1.5,
                      bgcolor: 'white',
                      border: '1px solid #ddd',
                    }}
                  >
                    <QrCode sx={{ fontSize: 120, color: '#76c045' }} />
                  </Box>
                  <Typography sx={{ mt: 1, fontSize: '0.7rem', fontFamily: 'monospace' }}>
                    Scan to verify authenticity
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #ddd' }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#666', mb: 0.5 }}>
                    Entry Price
                  </Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    {formatUGX(voucher.entry_price)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#666', mt: 1, mb: 0.5 }}>
                    Issue Date
                  </Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    {formatDateShort(voucher.issue_date)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#666', mt: 1, mb: 0.5 }}>
                    Validated
                  </Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    {voucher.deposit.validated ? '✓ Yes' : '✗ Pending'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Notes Section - Only if exists */}
          {voucher.deposit.notes && (
            <Box sx={{ border: '1px solid #ddd', p: 1.5, mb: 2, bgcolor: '#fafafa' }}>
              <Typography sx={{ fontWeight: 'bold', mb: 0.5, fontSize: '0.8rem' }}>
                Additional Notes
              </Typography>
              <Typography sx={{ fontSize: '0.75rem' }}>{voucher.deposit.notes}</Typography>
            </Box>
          )}

          {/* Footer */}
          <Box sx={{ mt: 2, pt: 1.5, borderTop: '2px solid #ddd', textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.7rem', color: '#666' }}>
              This is an official AMSAF grain voucher. For verification or inquiries, contact AMSAF support.
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', mt: 0.5, fontFamily: 'monospace', color: '#999' }}>
              Generated on {formatDateShort(new Date().toISOString())}
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default VoucherDetailsDialog;







// import React, { FC, useRef } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Grid,
//   Paper,
//   Typography,
//   Box,
//   Chip,
//   Avatar,
//   useTheme,
//   Table,
//   TableBody,
//   TableCell,
//   TableRow,
//   Divider,
// } from '@mui/material';
// import {
//   Verified,
//   Person,
//   Business,
//   LocationOn,
//   Phone,
//   Download,
//   MonetizationOn,
//   QrCode,
//   Water,
// } from '@mui/icons-material';
// import { toast } from 'react-hot-toast';
// import { IVoucher } from './Voucher.interface';

// interface VoucherDetailsDialogProps {
//   voucher: IVoucher | null;
//   open: boolean;
//   onClose: () => void;
//   onRedeem: (voucher: IVoucher) => void;
// }

// const VoucherDetailsDialog: FC<VoucherDetailsDialogProps> = ({
//   voucher,
//   open,
//   onClose,
//   onRedeem,
// }) => {
//   const theme = useTheme();
//   const voucherRef = useRef<HTMLDivElement>(null);

//   if (!voucher) return null;

//   const formatDate = (dateString: string) =>
//     new Date(dateString).toLocaleString('en-UG', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     });

//   const formatDateShort = (dateString: string) =>
//     new Date(dateString).toLocaleDateString('en-UG', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     });

//   const formatUGX = (value: string | number) =>
//     `UGX ${parseFloat(value.toString()).toLocaleString()}`;

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'issued':
//         return 'success';
//       case 'traded':
//         return 'warning';
//       case 'redeemed':
//         return 'info';
//       default:
//         return 'default';
//     }
//   };

//   const loadHtml2Pdf = (): Promise<any> => {
//     return new Promise((resolve, reject) => {
//       if ((window as any).html2pdf) {
//         resolve((window as any).html2pdf);
//         return;
//       }

//       const script = document.createElement('script');
//       script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
//       script.onload = () => resolve((window as any).html2pdf);
//       script.onerror = () => reject(new Error('Failed to load PDF library'));
//       document.head.appendChild(script);
//     });
//   };

//   const handleDownloadPDF = async () => {
//     try {
//       toast.loading('Generating voucher PDF...');

//       const html2pdf = await loadHtml2Pdf();

//       const element = voucherRef.current;
//       const opt = {
//         margin: 10,
//         filename: `Voucher-${voucher.id.substring(0, 8)}.pdf`,
//         image: { type: 'jpeg', quality: 0.98 },
//         html2canvas: { scale: 2, useCORS: true },
//         jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
//       };

//       await html2pdf().set(opt).from(element).save();
//       toast.dismiss();
//       toast.success('Voucher downloaded successfully');
//     } catch (error) {
//       console.error('Error generating PDF:', error);
//       toast.dismiss();
//       toast.error('Failed to generate PDF');
//     }
//   };

//   return (
//     <>
//       <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
//         <DialogTitle sx={{ pb: 1 }}>
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
//               Voucher Details
//             </Typography>
//             <Chip
//               label={voucher.status.toUpperCase()}
//               color={getStatusColor(voucher.status)}
//               icon={<Verified />}
//             />
//           </Box>
//         </DialogTitle>
//         <DialogContent>
//           <Grid container spacing={3}>
//             {/* Left Column */}
//             <Grid item xs={12} md={8}>
//               {/* Voucher Info */}
//               <Paper sx={{ p: 3, mb: 3 }}>
//                 <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main }}>
//                   Voucher Information
//                 </Typography>
//                 <Grid container spacing={2}>
//                   <Grid item xs={6}>
//                     <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
//                       ID
//                     </Typography>
//                     <Typography variant="body1" sx={{ fontFamily: 'monospace', color: 'text.primary' }}>
//                       {voucher.id}
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={6}>
//                     <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
//                       Issue Date
//                     </Typography>
//                     <Typography variant="body1" sx={{ color: 'text.primary' }}>
//                       {formatDate(voucher.issue_date)}
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={6}>
//                     <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
//                       Entry Price
//                     </Typography>
//                     <Typography variant="body1" sx={{ color: 'text.primary' }}>
//                       {formatUGX(voucher.entry_price)}
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={6}>
//                     <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
//                       Current Value
//                     </Typography>
//                     <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
//                       {formatUGX(voucher.current_value)}
//                     </Typography>
//                   </Grid>
//                 </Grid>
//               </Paper>

//               {/* Deposit Info */}
//               <Paper sx={{ p: 3, mb: 3 }}>
//                 <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main }}>
//                   Grain Details
//                 </Typography>
//                 <Grid container spacing={2}>
//                   <Grid item xs={6}>
//                     <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
//                       Grain Type
//                     </Typography>
//                     <Typography variant="body1" sx={{ color: 'text.primary' }}>
//                       {voucher.deposit.grain_type_details.name}
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={6}>
//                     <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
//                       Quality Grade
//                     </Typography>
//                     <Typography variant="body1" sx={{ color: 'text.primary' }}>
//                       {voucher.deposit.quality_grade_details.name}
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={6}>
//                     <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
//                       Quantity
//                     </Typography>
//                     <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
//                       {parseFloat(voucher.deposit.quantity_kg).toFixed(2)} kg
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={6}>
//                     <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
//                       Moisture Level
//                     </Typography>
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                       <Water sx={{ fontSize: 16, color: theme.palette.primary.main }} />
//                       <Typography variant="body1" sx={{ color: 'text.primary' }}>
//                         {voucher.deposit.moisture_level}%
//                       </Typography>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12}>
//                     <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
//                       Quality Range
//                     </Typography>
//                     <Typography variant="body2" sx={{ color: 'text.primary' }}>
//                       {voucher.deposit.quality_grade_details.min_moisture}% -{' '}
//                       {voucher.deposit.quality_grade_details.max_moisture}% moisture
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={12}>
//                     <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
//                       Notes
//                     </Typography>
//                     <Typography variant="body1" sx={{ color: 'text.primary' }}>
//                       {voucher.deposit.notes || 'No additional notes'}
//                     </Typography>
//                   </Grid>
//                 </Grid>
//               </Paper>

//               {/* Farmer & Hub Info */}
//               <Grid container spacing={3}>
//                 <Grid item xs={12} md={6}>
//                   <Paper sx={{ p: 3 }}>
//                     <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main }}>
//                       Farmer Details
//                     </Typography>
//                     <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                       <Avatar sx={{ mr: 2, bgcolor: theme.palette.primary.main }}>
//                         <Person />
//                       </Avatar>
//                       <Box>
//                         <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
//                           {voucher.deposit.farmer.first_name} {voucher.deposit.farmer.last_name}
//                         </Typography>
//                         <Typography variant="body2" sx={{ color: 'text.primary' }}>
//                           {voucher.deposit.farmer.phone_number}
//                         </Typography>
//                         <Typography variant="body2" sx={{ color: 'text.primary' }}>
//                           Role: {voucher.deposit.farmer.role}
//                         </Typography>
//                       </Box>
//                     </Box>
//                   </Paper>
//                 </Grid>
//                 <Grid item xs={12} md={6}>
//                   <Paper sx={{ p: 3 }}>
//                     <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main }}>
//                       Storage Hub
//                     </Typography>
//                     <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                       <Business sx={{ mr: 1, color: theme.palette.primary.main }} />
//                       <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
//                         {voucher.deposit.hub.name}
//                       </Typography>
//                     </Box>
//                     <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                       <LocationOn sx={{ mr: 1, color: theme.palette.primary.main }} />
//                       <Typography variant="body2" sx={{ color: 'text.primary' }}>
//                         {voucher.deposit.hub.location}
//                       </Typography>
//                     </Box>
//                     {voucher.deposit.hub.hub_admin && (
//                       <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                         <Phone sx={{ mr: 1, color: theme.palette.primary.main }} />
//                         <Typography variant="body2" sx={{ color: 'text.primary' }}>
//                           {voucher.deposit.hub.hub_admin.first_name}{' '}
//                           {voucher.deposit.hub.hub_admin.last_name} -{' '}
//                           {voucher.deposit.hub.hub_admin.phone_number}
//                         </Typography>
//                       </Box>
//                     )}
//                   </Paper>
//                 </Grid>
//               </Grid>
//             </Grid>

//             {/* Right Column - QR Code */}
//             <Grid item xs={12} md={4}>
//               <Paper sx={{ p: 3, textAlign: 'center', height: 'fit-content' }}>
//                 <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main }}>
//                   Verification QR Code
//                 </Typography>
//                 <Box
//                   sx={{
//                     display: 'inline-block',
//                     p: 2,
//                     bgcolor: 'white',
//                     borderRadius: 2,
//                     border: `2px solid ${theme.palette.primary.main}`,
//                   }}
//                 >
//                   <QrCode sx={{ fontSize: 120, color: theme.palette.primary.main }} />
//                 </Box>
//                 <Typography variant="body2" sx={{ mt: 1, color: 'text.primary' }}>
//                   Scan to verify authenticity
//                 </Typography>
//                 <Typography
//                   variant="caption"
//                   sx={{ display: 'block', mt: 1, fontFamily: 'monospace', color: 'text.primary' }}
//                 >
//                   ID: {voucher.id.substring(0, 8)}...
//                 </Typography>
//               </Paper>

//               {/* Deposit Date */}
//               <Paper sx={{ p: 3, mt: 2, textAlign: 'center' }}>
//                 <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
//                   Deposit Date
//                 </Typography>
//                 <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
//                   {formatDate(voucher.deposit.deposit_date)}
//                 </Typography>
//               </Paper>

//               {/* Validation Status */}
//               <Paper sx={{ p: 3, mt: 2, textAlign: 'center' }}>
//                 <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 600 }}>
//                   Validation Status
//                 </Typography>
//                 <Chip
//                   label={voucher.deposit.validated ? 'VALIDATED' : 'PENDING'}
//                   color={voucher.deposit.validated ? 'success' : 'warning'}
//                   icon={<Verified />}
//                 />
//               </Paper>
//             </Grid>
//           </Grid>
//         </DialogContent>
//         <DialogActions sx={{ p: 3, gap: 1 }}>
//           <Button onClick={onClose} variant="outlined" color="primary">
//             Close
//           </Button>
//           <Button onClick={handleDownloadPDF} variant="outlined" color="primary" startIcon={<Download />}>
//             Download PDF
//           </Button>
//           <Button
//             onClick={() => onRedeem(voucher)}
//             variant="contained"
//             color="primary"
//             startIcon={<MonetizationOn />}
//             disabled={voucher.status === 'redeemed'}
//           >
//             {voucher.status === 'redeemed' ? 'Already Redeemed' : 'Redeem Voucher'}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Hidden Printable Voucher for PDF */}
//       <Box sx={{ position: 'absolute', left: '-9999px', top: 0 }}>
//         <Box ref={voucherRef} sx={{ width: '210mm', bgcolor: 'white', p: 4 }}>
//           {/* Header with Logo and Title */}
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
//             <Box
//               sx={{
//                 bgcolor: '#76c045',
//                 px: 3,
//                 py: 1.5,
//                 borderRadius: 1,
//               }}
//             >
//               <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
//                 AMSAF
//               </Typography>
//             </Box>
//             <Box sx={{ textAlign: 'right' }}>
//               <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
//                 GRAIN VOUCHER
//               </Typography>
//               <Chip
//                 label={voucher.status.toUpperCase()}
//                 sx={{
//                   bgcolor: getStatusColor(voucher.status) === 'success' ? '#4caf50' : '#ff9800',
//                   color: 'white',
//                   fontWeight: 'bold',
//                 }}
//               />
//             </Box>
//           </Box>

//           {/* Voucher ID Banner */}
//           <Box
//             sx={{
//               bgcolor: '#f5f5f5',
//               p: 2,
//               mb: 3,
//               borderLeft: '4px solid #76c045',
//             }}
//           >
//             <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
//               Voucher ID
//             </Typography>
//             <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
//               {voucher.id}
//             </Typography>
//           </Box>

//           {/* Value Section - Highlighted */}
//           <Box
//             sx={{
//               bgcolor: '#e8f5e9',
//               border: '2px solid #4caf50',
//               p: 3,
//               mb: 3,
//               borderRadius: 2,
//               textAlign: 'center',
//             }}
//           >
//             <Typography variant="h6" sx={{ color: '#2e7d32', mb: 1 }}>
//               Current Voucher Value
//             </Typography>
//             <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1b5e20' }}>
//               {formatUGX(voucher.current_value)}
//             </Typography>
//             <Divider sx={{ my: 2 }} />
//             <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
//               <Box>
//                 <Typography variant="caption" sx={{ color: '#666' }}>
//                   Entry Price
//                 </Typography>
//                 <Typography variant="body1" sx={{ fontWeight: 600 }}>
//                   {formatUGX(voucher.entry_price)}
//                 </Typography>
//               </Box>
//               <Box>
//                 <Typography variant="caption" sx={{ color: '#666' }}>
//                   Issue Date
//                 </Typography>
//                 <Typography variant="body1" sx={{ fontWeight: 600 }}>
//                   {formatDateShort(voucher.issue_date)}
//                 </Typography>
//               </Box>
//             </Box>
//           </Box>

//           {/* Main Details Grid */}
//           <Grid container spacing={3} sx={{ mb: 3 }}>
//             {/* Grain Details */}
//             <Grid item xs={6}>
//               <Box sx={{ border: '1px solid #ddd', p: 2, height: '100%' }}>
//                 <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#76c045' }}>
//                   Grain Information
//                 </Typography>
//                 <Table size="small">
//                   <TableBody>
//                     <TableRow>
//                       <TableCell sx={{ border: 'none', py: 0.5, pl: 0, fontWeight: 600 }}>
//                         Grain Type:
//                       </TableCell>
//                       <TableCell sx={{ border: 'none', py: 0.5 }}>
//                         {voucher.deposit.grain_type_details.name}
//                       </TableCell>
//                     </TableRow>
//                     <TableRow>
//                       <TableCell sx={{ border: 'none', py: 0.5, pl: 0, fontWeight: 600 }}>
//                         Quality Grade:
//                       </TableCell>
//                       <TableCell sx={{ border: 'none', py: 0.5 }}>
//                         {voucher.deposit.quality_grade_details.name}
//                       </TableCell>
//                     </TableRow>
//                     <TableRow>
//                       <TableCell sx={{ border: 'none', py: 0.5, pl: 0, fontWeight: 600 }}>
//                         Quantity:
//                       </TableCell>
//                       <TableCell sx={{ border: 'none', py: 0.5, fontWeight: 'bold' }}>
//                         {parseFloat(voucher.deposit.quantity_kg).toFixed(2)} kg
//                       </TableCell>
//                     </TableRow>
//                     <TableRow>
//                       <TableCell sx={{ border: 'none', py: 0.5, pl: 0, fontWeight: 600 }}>
//                         Moisture Level:
//                       </TableCell>
//                       <TableCell sx={{ border: 'none', py: 0.5 }}>
//                         {voucher.deposit.moisture_level}%
//                       </TableCell>
//                     </TableRow>
//                     <TableRow>
//                       <TableCell sx={{ border: 'none', py: 0.5, pl: 0, fontWeight: 600 }}>
//                         Deposit Date:
//                       </TableCell>
//                       <TableCell sx={{ border: 'none', py: 0.5 }}>
//                         {formatDateShort(voucher.deposit.deposit_date)}
//                       </TableCell>
//                     </TableRow>
//                     <TableRow>
//                       <TableCell sx={{ border: 'none', py: 0.5, pl: 0, fontWeight: 600 }}>
//                         Validated:
//                       </TableCell>
//                       <TableCell sx={{ border: 'none', py: 0.5 }}>
//                         {voucher.deposit.validated ? '✓ Yes' : '✗ No'}
//                       </TableCell>
//                     </TableRow>
//                   </TableBody>
//                 </Table>
//               </Box>
//             </Grid>

//             {/* Farmer & Hub Details */}
//             <Grid item xs={6}>
//               <Box sx={{ border: '1px solid #ddd', p: 2, mb: 2 }}>
//                 <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#76c045' }}>
//                   Farmer Details
//                 </Typography>
//                 <Table size="small">
//                   <TableBody>
//                     <TableRow>
//                       <TableCell sx={{ border: 'none', py: 0.5, pl: 0, fontWeight: 600 }}>
//                         Name:
//                       </TableCell>
//                       <TableCell sx={{ border: 'none', py: 0.5 }}>
//                         {voucher.deposit.farmer.first_name} {voucher.deposit.farmer.last_name}
//                       </TableCell>
//                     </TableRow>
//                     <TableRow>
//                       <TableCell sx={{ border: 'none', py: 0.5, pl: 0, fontWeight: 600 }}>
//                         Phone:
//                       </TableCell>
//                       <TableCell sx={{ border: 'none', py: 0.5 }}>
//                         {voucher.deposit.farmer.phone_number}
//                       </TableCell>
//                     </TableRow>
//                     <TableRow>
//                       <TableCell sx={{ border: 'none', py: 0.5, pl: 0, fontWeight: 600 }}>
//                         Role:
//                       </TableCell>
//                       <TableCell sx={{ border: 'none', py: 0.5 }}>
//                         {voucher.deposit.farmer.role}
//                       </TableCell>
//                     </TableRow>
//                   </TableBody>
//                 </Table>
//               </Box>

//               <Box sx={{ border: '1px solid #ddd', p: 2 }}>
//                 <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#76c045' }}>
//                   Storage Hub
//                 </Typography>
//                 <Table size="small">
//                   <TableBody>
//                     <TableRow>
//                       <TableCell sx={{ border: 'none', py: 0.5, pl: 0, fontWeight: 600 }}>
//                         Hub Name:
//                       </TableCell>
//                       <TableCell sx={{ border: 'none', py: 0.5 }}>
//                         {voucher.deposit.hub.name}
//                       </TableCell>
//                     </TableRow>
//                     <TableRow>
//                       <TableCell sx={{ border: 'none', py: 0.5, pl: 0, fontWeight: 600 }}>
//                         Location:
//                       </TableCell>
//                       <TableCell sx={{ border: 'none', py: 0.5 }}>
//                         {voucher.deposit.hub.location}
//                       </TableCell>
//                     </TableRow>
//                     {voucher.deposit.hub.hub_admin && (
//                       <>
//                         <TableRow>
//                           <TableCell sx={{ border: 'none', py: 0.5, pl: 0, fontWeight: 600 }}>
//                             Admin:
//                           </TableCell>
//                           <TableCell sx={{ border: 'none', py: 0.5 }}>
//                             {voucher.deposit.hub.hub_admin.first_name}{' '}
//                             {voucher.deposit.hub.hub_admin.last_name}
//                           </TableCell>
//                         </TableRow>
//                         <TableRow>
//                           <TableCell sx={{ border: 'none', py: 0.5, pl: 0, fontWeight: 600 }}>
//                             Contact:
//                           </TableCell>
//                           <TableCell sx={{ border: 'none', py: 0.5 }}>
//                             {voucher.deposit.hub.hub_admin.phone_number}
//                           </TableCell>
//                         </TableRow>
//                       </>
//                     )}
//                   </TableBody>
//                 </Table>
//               </Box>
//             </Grid>
//           </Grid>

//           {/* Notes Section */}
//           {voucher.deposit.notes && (
//             <Box sx={{ border: '1px solid #ddd', p: 2, mb: 3, bgcolor: '#fafafa' }}>
//               <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
//                 Additional Notes
//               </Typography>
//               <Typography variant="body2">{voucher.deposit.notes}</Typography>
//             </Box>
//           )}

//           {/* QR Code Section */}
//           <Box
//             sx={{
//               border: '2px solid #76c045',
//               p: 3,
//               textAlign: 'center',
//               bgcolor: '#f9f9f9',
//             }}
//           >
//             <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
//               Verification Code
//             </Typography>
//             <Box
//               sx={{
//                 display: 'inline-block',
//                 p: 2,
//                 bgcolor: 'white',
//                 border: '1px solid #ddd',
//               }}
//             >
//               <QrCode sx={{ fontSize: 100, color: '#76c045' }} />
//             </Box>
//             <Typography variant="caption" sx={{ display: 'block', mt: 2, fontFamily: 'monospace' }}>
//               Scan QR code to verify voucher authenticity
//             </Typography>
//           </Box>

//           {/* Footer */}
//           <Box sx={{ mt: 4, pt: 3, borderTop: '2px solid #ddd', textAlign: 'center' }}>
//             <Typography variant="caption" sx={{ color: '#666' }}>
//               This is an official AMSAF grain voucher. For verification or inquiries, please contact AMSAF support.
//             </Typography>
//             <Typography variant="caption" sx={{ display: 'block', mt: 1, fontFamily: 'monospace', color: '#999' }}>
//               Generated on {formatDateShort(new Date().toISOString())}
//             </Typography>
//           </Box>
//         </Box>
//       </Box>
//     </>
//   );
// };

// export default VoucherDetailsDialog;