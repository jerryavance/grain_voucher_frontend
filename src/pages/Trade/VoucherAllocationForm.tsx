// VoucherAllocationForm.tsx
import React, { FC, useEffect, useState } from "react";
import { 
  Box, 
  Button, 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  FormControl,
  FormLabel,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper
} from "@mui/material";
import { useFormik } from "formik";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import { toast } from "react-hot-toast";
import uniqueId from "../../utils/generateId";
import { TradeService } from "./Trade.service";
import { VoucherAllocationValidations } from "./TradeFormValidations";
import { ITrade, IVoucher, IAvailableVouchers } from "./Trade.interface";
import { useModalContext } from "../../contexts/ModalDialogContext";

interface IVoucherAllocationFormProps {
  trade: ITrade;
  onClose: () => void;
  onSuccess: () => void;
}

const VoucherAllocationForm: FC<IVoucherAllocationFormProps> = ({
  trade,
  onClose,
  onSuccess,
}) => {
  const { showModal } = useModalContext();
  const [loading, setLoading] = useState(false);
  const [fetchingVouchers, setFetchingVouchers] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState<IAvailableVouchers | null>(null);
  const [selectedVouchers, setSelectedVouchers] = useState<string[]>([]);
  const [allocationType, setAllocationType] = useState<'auto' | 'manual'>('auto');

  const allocationForm = useFormik({
    initialValues: {
      allocation_type: 'auto',
      voucher_ids: [],
    },
    validationSchema: VoucherAllocationValidations(),
    validateOnChange: false,
    onSubmit: async (values: any) => {
      setLoading(true);
      try {
        const payload = {
          allocation_type: allocationType,
          voucher_ids: allocationType === 'manual' ? selectedVouchers : undefined,
        };
        
        await TradeService.allocateVouchers(trade.id, payload);
        toast.success("Vouchers allocated successfully");
        
        allocationForm.resetForm();
        onSuccess();
      } catch (error: any) {
        const errorMsg = error.response?.data?.detail || 
                        error.response?.data?.error || 
                        error.message || 
                        "Failed to allocate vouchers";
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (allocationType === 'manual') {
      fetchAvailableVouchers();
    }
  }, [allocationType]);

  const fetchAvailableVouchers = async () => {
    setFetchingVouchers(true);
    try {
      const data = await TradeService.getAvailableVouchers({
        hub_id: trade.hub.id,
        grain_type_id: trade.grain_type.id,
        quality_grade_id: trade.quality_grade.id,
      });
      setAvailableVouchers(data);
    } catch (error: any) {
      toast.error("Failed to fetch available vouchers");
      console.error(error);
    } finally {
      setFetchingVouchers(false);
    }
  };

  const handleVoucherToggle = (voucherId: string) => {
    setSelectedVouchers(prev => {
      if (prev.includes(voucherId)) {
        return prev.filter(id => id !== voucherId);
      } else {
        return [...prev, voucherId];
      }
    });
  };

  const calculateSelectedQuantity = () => {
    if (!availableVouchers) return 0;
    return availableVouchers.vouchers
      .filter(v => selectedVouchers.includes(v.id))
      .reduce((sum, v) => sum + (v.deposit?.quantity_kg || 0), 0);
  };

  const selectedQty = calculateSelectedQuantity();
  const isSelectionValid = selectedQty >= trade.quantity_kg;

  const ActionBtns: FC = () => (
    <>
      <Button onClick={onClose} disabled={loading}>
        Cancel
      </Button>
      <Button
        onClick={() => allocationForm.handleSubmit()}
        variant="contained"
        disabled={loading || (allocationType === 'manual' && !isSelectionValid)}
      >
        {loading ? (
          <>
            <ProgressIndicator color="inherit" size={20} />
            <Span style={{ marginLeft: "0.5rem" }}>Allocating...</Span>
          </>
        ) : (
          "Allocate Vouchers"
        )}
      </Button>
    </>
  );

  if (!showModal) return null;

  return (
    <ModalDialog
      title={`Allocate Vouchers for ${trade.trade_number}`}
      onClose={onClose}
      id={uniqueId()}
      ActionButtons={ActionBtns}
      maxWidth="md"
    >
      <Box sx={{ width: "100%" }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Trade Quantity:</strong> {Number(trade.quantity_kg ?? 0).toFixed(2)} kg ({Number(trade.net_tonnage ?? 0).toFixed(2)} MT)
          </Typography>
        </Alert>

        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend">Allocation Method</FormLabel>
          <RadioGroup
            value={allocationType}
            onChange={(e) => setAllocationType(e.target.value as 'auto' | 'manual')}
          >
            <FormControlLabel 
              value="auto" 
              control={<Radio />} 
              label="Automatic (FIFO - First In First Out)" 
            />
            <FormControlLabel 
              value="manual" 
              control={<Radio />} 
              label="Manual Selection" 
            />
          </RadioGroup>
        </FormControl>

        {allocationType === 'auto' && (
          <Alert severity="info">
            Vouchers will be automatically allocated using FIFO (First In First Out) method.
          </Alert>
        )}

        {allocationType === 'manual' && (
          <Box>
            {fetchingVouchers ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <ProgressIndicator />
              </Box>
            ) : availableVouchers ? (
              <>
                <Alert severity={isSelectionValid ? "success" : "warning"} sx={{ mb: 2 }}>
                  <Typography variant="body2">

                    <strong>Selected:</strong>{" "}
                    {Number(selectedQty).toFixed(2)} kg / {Number(trade.quantity_kg).toFixed(2)} kg required

                    {!isSelectionValid && " - Select more vouchers"}
                  </Typography>
                  <Typography variant="caption">
                    Available: {availableVouchers.count} vouchers ({Number(availableVouchers.total_quantity_kg || 0).toFixed(2)} kg)
                  </Typography>
                </Alert>

                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">Select</TableCell>
                        <TableCell>Voucher Number</TableCell>
                        <TableCell align="right">Quantity (kg)</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {availableVouchers.vouchers.map((voucher) => (
                        <TableRow key={voucher.id}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedVouchers.includes(voucher.id)}
                              onChange={() => handleVoucherToggle(voucher.id)}
                            />
                          </TableCell>
                          <TableCell>{voucher.voucher_number}</TableCell>
                          <TableCell align="right">
                            {voucher.deposit?.quantity_kg
                                ? Number(voucher.deposit.quantity_kg).toFixed(2)
                                : "N/A"}
                          </TableCell>
                          <TableCell>{voucher.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <Alert severity="error">
                No available vouchers found for this grain type and quality grade at the selected hub.
              </Alert>
            )}
          </Box>
        )}
      </Box>
    </ModalDialog>
  );
};

export default VoucherAllocationForm;
