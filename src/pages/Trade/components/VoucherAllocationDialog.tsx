// src/pages/Trade/components/VoucherAllocationDialog.tsx - NEW
import React, { FC, useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Stack,
} from "@mui/material";
import { toast } from "react-hot-toast";
import instance from "../../../api";

interface VoucherAllocationDialogProps {
  open: boolean;
  onClose: () => void;
  tradeId: string;
  tradeNumber: string;
  requiredQuantityKg: number;
  grainTypeId?: string;
  hubId?: string;
  onSuccess: (payload: any) => void;
}

interface Voucher {
  id: string;
  voucher_number: string;
  farmer_name: string;
  quantity_kg: number;
  status: string;
  grain_type_name: string;
}

const VoucherAllocationDialog: FC<VoucherAllocationDialogProps> = ({
  open,
  onClose,
  tradeId,
  tradeNumber,
  requiredQuantityKg,
  grainTypeId,
  hubId,
  onSuccess,
}) => {
  const [allocationType, setAllocationType] = useState<"auto" | "manual">("auto");
  const [loading, setLoading] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [selectedVouchers, setSelectedVouchers] = useState<string[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);

  useEffect(() => {
    if (open && allocationType === "manual") {
      fetchAvailableVouchers();
    }
  }, [open, allocationType, grainTypeId, hubId]);

  const fetchAvailableVouchers = async () => {
    try {
      setLoadingVouchers(true);
      const params: any = {
        status: "pending_allocation",
        page_size: 100,
      };

      if (grainTypeId) params.grain_type = grainTypeId;
      if (hubId) params.hub = hubId;

      const response = await instance.get("vouchers/", { params });
      setAvailableVouchers(response.data.results || []);
    } catch (error) {
      console.error("Failed to load vouchers:", error);
      toast.error("Failed to load available vouchers");
    } finally {
      setLoadingVouchers(false);
    }
  };

  const handleVoucherToggle = (voucherId: string) => {
    setSelectedVouchers((prev) =>
      prev.includes(voucherId)
        ? prev.filter((id) => id !== voucherId)
        : [...prev, voucherId]
    );
  };

  const getSelectedQuantity = () => {
    return selectedVouchers.reduce((sum, id) => {
      const voucher = availableVouchers.find((v) => v.id === id);
      return sum + (voucher?.quantity_kg || 0);
    }, 0);
  };

  const handleAllocate = async () => {
    const payload: any = {
      allocation_type: allocationType,
    };

    if (allocationType === "manual") {
      if (selectedVouchers.length === 0) {
        toast.error("Please select at least one voucher");
        return;
      }

      const selectedQty = getSelectedQuantity();
      if (selectedQty < requiredQuantityKg) {
        toast.error(
          `Selected quantity (${selectedQty.toLocaleString()} kg) is less than required (${requiredQuantityKg.toLocaleString()} kg)`
        );
        return;
      }

      payload.voucher_ids = selectedVouchers;
    }

    setLoading(true);
    onSuccess(payload);
  };

  const selectedQty = getSelectedQuantity();
  const isQuantitySufficient = selectedQty >= requiredQuantityKg;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h6">Allocate Vouchers to Trade</Typography>
          <Typography variant="body2" color="text.secondary">
            {tradeNumber}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600}>
            Required Quantity: {requiredQuantityKg.toLocaleString()} kg
          </Typography>
          {allocationType === "manual" && selectedVouchers.length > 0 && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected Quantity: {selectedQty.toLocaleString()} kg
            </Typography>
          )}
        </Alert>

        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend">Allocation Method</FormLabel>
          <RadioGroup
            value={allocationType}
            onChange={(e) => setAllocationType(e.target.value as "auto" | "manual")}
          >
            <FormControlLabel
              value="auto"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Automatic Allocation
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    System will automatically select vouchers from available inventory
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="manual"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Manual Selection
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Manually select specific vouchers to allocate
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>

        {allocationType === "manual" && (
          <>
            {loadingVouchers ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : availableVouchers.length === 0 ? (
              <Alert severity="warning">
                <Typography variant="body2">
                  No vouchers available for allocation. Check that vouchers exist with status
                  'pending_allocation' for this grain type and hub.
                </Typography>
              </Alert>
            ) : (
              <>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle2">
                    Available Vouchers ({availableVouchers.length})
                  </Typography>
                  {selectedVouchers.length > 0 && (
                    <Chip
                      label={`${selectedVouchers.length} selected`}
                      color={isQuantitySufficient ? "success" : "warning"}
                      size="small"
                    />
                  )}
                </Stack>

                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox"></TableCell>
                        <TableCell>Voucher #</TableCell>
                        <TableCell>Farmer</TableCell>
                        <TableCell>Grain Type</TableCell>
                        <TableCell align="right">Quantity (kg)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {availableVouchers.map((voucher) => (
                        <TableRow
                          key={voucher.id}
                          hover
                          selected={selectedVouchers.includes(voucher.id)}
                          onClick={() => handleVoucherToggle(voucher.id)}
                          sx={{ cursor: "pointer" }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedVouchers.includes(voucher.id)}
                              onChange={() => handleVoucherToggle(voucher.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {voucher.voucher_number}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{voucher.farmer_name}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{voucher.grain_type_name}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={600}>
                              {voucher.quantity_kg.toLocaleString()}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {!isQuantitySufficient && selectedVouchers.length > 0 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Selected quantity ({selectedQty.toLocaleString()} kg) is less than required (
                      {requiredQuantityKg.toLocaleString()} kg). Please select more vouchers.
                    </Typography>
                  </Alert>
                )}
              </>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleAllocate}
          variant="contained"
          disabled={
            loading ||
            (allocationType === "manual" &&
              (selectedVouchers.length === 0 || !isQuantitySufficient))
          }
        >
          {loading ? <CircularProgress size={24} /> : "Allocate Vouchers"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VoucherAllocationDialog;