// InvoiceInfoDisplay.tsx - Reusable component for showing invoice information
import React, { FC } from 'react';
import { Box, Paper, Typography, Divider, Alert } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ReceiptIcon from '@mui/icons-material/Receipt';

interface IInvoiceInfoDisplayProps {
  invoiceInfo: {
    label: string;
    days: number | null;
    invoiceType: string;
    invoiceSchedule: string;
    description: string;
  };
  estimatedDate?: string;
  showDetailedFlow?: boolean;
  variant?: 'compact' | 'detailed';
}

const InvoiceInfoDisplay: FC<IInvoiceInfoDisplayProps> = ({
  invoiceInfo,
  estimatedDate,
  showDetailedFlow = true,
  variant = 'detailed'
}) => {
  if (variant === 'compact') {
    return (
      <Alert severity="info" icon={<ReceiptIcon />} sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Invoice:</strong> {invoiceInfo.invoiceSchedule}
        </Typography>
        {estimatedDate && (
          <Typography variant="body2" color="primary">
            <strong>Generated:</strong> {estimatedDate}
          </Typography>
        )}
      </Alert>
    );
  }

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        mb: 2, 
        bgcolor: 'info.lighter',
        border: '1px solid',
        borderColor: 'info.main'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <InfoIcon color="info" />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" color="info.dark" gutterBottom>
            📄 Invoice Generation Schedule
          </Typography>
          <Divider sx={{ my: 1 }} />
          
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Payment Terms:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {invoiceInfo.label}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="caption" color="text.secondary">
                Invoice Type:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {invoiceInfo.invoiceType === 'immediate' ? '✅ Immediate' : '📅 Consolidated'}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="caption" color="text.secondary">
                Schedule:
              </Typography>
              <Typography variant="body2">
                {invoiceInfo.invoiceSchedule}
              </Typography>
            </Box>
            
            {estimatedDate && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Estimated Generation:
                </Typography>
                <Typography variant="body2" fontWeight="medium" color="primary">
                  {estimatedDate}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Description:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {invoiceInfo.description}
              </Typography>
            </Box>
          </Box>
          
          {showDetailedFlow && invoiceInfo.invoiceType !== 'immediate' && (
            <Alert severity="info" sx={{ mt: 2 }} icon={false}>
              <Typography variant="caption">
                <strong>Note:</strong> Multiple deliveries (GRNs) within the same period 
                will be combined into one invoice for this customer.
              </Typography>
            </Alert>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default InvoiceInfoDisplay;