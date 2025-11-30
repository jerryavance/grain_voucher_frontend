// src/pages/Trade/components/GRNListWithInvoices.tsx
import React, { FC } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";
import { IGRN } from "../Trade.interface";
import {
  formatCurrency,
  formatDate,
  getPaymentStatusColor,
} from "../tradeWorkflowHelper";

interface GRNListWithInvoicesProps {
  grns: IGRN[];
  onViewGRN?: (grn: IGRN) => void;
  onRecordPayment?: (invoiceId: string) => void;
}

const GRNListWithInvoices: FC<GRNListWithInvoicesProps> = ({
  grns,
  onViewGRN,
  onRecordPayment,
}) => {
  if (!grns || grns.length === 0) {
    return (
      <Paper sx={{ p: 8, textAlign: "center", bgcolor: "grey.50", borderRadius: 2 }}>
        <Typography color="text.secondary">
          No delivery batches created yet. Create your first delivery to generate an invoice.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2, mt: 3 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "grey.100" }}>
            <TableCell>Delivery #</TableCell>
            <TableCell>GRN #</TableCell>
            <TableCell>Delivery Date</TableCell>
            <TableCell align="right">Quantity (kg)</TableCell>
            <TableCell>Vehicle</TableCell>
            <TableCell>Driver</TableCell>
            <TableCell>Invoice #</TableCell>
            <TableCell align="right">Invoice Amount</TableCell>
            <TableCell>Payment Status</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {grns.map((grn, index) => (
            <TableRow key={grn.id} hover>
              <TableCell>
                <Chip
                  label={`#${index + 1}`}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 600 }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {grn.grn_number}
                </Typography>
              </TableCell>
              <TableCell>{formatDate(grn.delivery_date)}</TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight={600}>
                  {grn.net_weight_kg.toLocaleString()}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{grn.vehicle_number}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{grn.driver_name}</Typography>
              </TableCell>
              <TableCell>
                {grn.invoice ? (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <ReceiptIcon sx={{ fontSize: 16, color: "primary.main" }} />
                    <Typography variant="body2" color="primary.main" fontWeight={600}>
                      {grn.invoice.invoice_number}
                    </Typography>
                  </Box>
                ) : (
                  <Chip label="Generating..." size="small" color="warning" />
                )}
              </TableCell>
              <TableCell align="right">
                {grn.invoice ? (
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(grn.invoice.total_amount)}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    -
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                {grn.invoice ? (
                  <Stack spacing={0.5}>
                    <Chip
                      label={grn.invoice.payment_status?.toUpperCase()}
                      size="small"
                      color={getPaymentStatusColor(grn.invoice.payment_status)}
                      sx={{ fontWeight: 600 }}
                    />
                    {grn.invoice.amount_due > 0 && (
                      <Typography variant="caption" color="error.main" fontWeight={500}>
                        Due: {formatCurrency(grn.invoice.amount_due)}
                      </Typography>
                    )}
                    {grn.invoice.days_overdue && grn.invoice.days_overdue > 0 && (
                      <Typography variant="caption" color="error.main" fontWeight={600}>
                        {grn.invoice.days_overdue} days overdue
                      </Typography>
                    )}
                  </Stack>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    Pending
                  </Typography>
                )}
              </TableCell>
              <TableCell align="center">
                <Stack direction="row" spacing={0.5} justifyContent="center">
                  <Tooltip title="View GRN Details">
                    <IconButton
                      size="small"
                      onClick={() => onViewGRN && onViewGRN(grn)}
                      color="primary"
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {grn.invoice && grn.invoice.amount_due > 0 && (
                    <Tooltip title="Record Payment">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() =>
                          onRecordPayment && grn.invoice && onRecordPayment(grn.invoice.id)
                        }
                      >
                        <PaymentIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default GRNListWithInvoices;