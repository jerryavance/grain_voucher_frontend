// sourcing/components/RecordRejectionForm.tsx
import React, { FC, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { toast } from "react-hot-toast";
import { SourcingService } from "./Sourcing.service";
import { formatKg } from "../../utils/formatters";

interface RecordRejectionFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    saleLot: {
      id: string;
      lot_number: string;
      available_quantity_kg: number | string;
      sold_quantity_kg: number | string;
      grain_type_name?: string | null;
      investor_name?: string | null;
      cost_per_kg?: number | string | null;
      investor_allocation?: string | null;  // ADD THIS
    };
  }

const REJECTION_REASONS = [
  { value: "quality", label: "Quality Below Standard" },
  { value: "moisture", label: "Excessive Moisture" },
  { value: "contamination", label: "Contamination / Foreign Matter" },
  { value: "weight_short", label: "Weight Shortage" },
  { value: "pest_damage", label: "Pest Damage" },
  { value: "wrong_variety", label: "Wrong Variety" },
  { value: "other", label: "Other" },
];

const RecordRejectionForm: FC<RecordRejectionFormProps> = ({
  open,
  onClose,
  onSuccess,
  saleLot,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rejected_quantity_kg: "",
    rejection_reason: "quality",
    rejection_details: "",
    disposal_cost: "0",
    restocking_cost: "0",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const maxRejectableKg =
    Number(saleLot.available_quantity_kg || 0) +
    Number(saleLot.sold_quantity_kg || 0);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const qty = Number(formData.rejected_quantity_kg);

    if (!formData.rejected_quantity_kg || qty <= 0) {
      errs.rejected_quantity_kg = "Quantity must be greater than 0";
    } else if (qty > maxRejectableKg) {
      errs.rejected_quantity_kg = `Cannot exceed ${maxRejectableKg} kg`;
    }

    if (!formData.rejection_reason) {
      errs.rejection_reason = "Please select a reason";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // FIX: was createRejection — correct method is createRejectedLot
      await SourcingService.createRejectedLot({
        sale_lot: saleLot.id,
        rejected_quantity_kg: formData.rejected_quantity_kg,
        rejection_reason: formData.rejection_reason,
        rejection_details: formData.rejection_details,
        disposal_cost: formData.disposal_cost || "0",
        restocking_cost: formData.restocking_cost || "0",
        notes: formData.notes,
        ...(saleLot.investor_allocation
          ? { original_investor_allocation: saleLot.investor_allocation }
          : {}),
      } as any);
      toast.success("Rejection recorded successfully");
      onSuccess();
      handleClose();
    } catch (error: any) {
      const data = error.response?.data;
      if (data && typeof data === "object") {
        const fieldErrors: Record<string, string> = {};
        Object.entries(data).forEach(([key, val]) => {
          fieldErrors[key] = Array.isArray(val) ? val.join(", ") : String(val);
        });
        setErrors(fieldErrors);
        toast.error(fieldErrors[Object.keys(fieldErrors)[0]] || "Validation error");
      } else {
        toast.error(error.message || "Failed to record rejection");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      rejected_quantity_kg: "",
      rejection_reason: "quality",
      rejection_details: "",
      disposal_cost: "0",
      restocking_cost: "0",
      notes: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" fontWeight={600}>
          Record Rejection
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Lot summary */}
        <Box mb={3} p={2} bgcolor="#f5f5f5" borderRadius={1}>
          <Typography variant="subtitle2" color="text.secondary">
            Lot: <strong>{saleLot.lot_number}</strong>
          </Typography>
          {saleLot.grain_type_name && (
            <Typography variant="body2">Grain: {saleLot.grain_type_name}</Typography>
          )}
          {saleLot.investor_name && (
            <Typography variant="body2">Investor: {saleLot.investor_name}</Typography>
          )}
          <Typography variant="body2">
            Available stock: {formatKg(maxRejectableKg)}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Rejected Quantity (kg)"
              type="number"
              value={formData.rejected_quantity_kg}
              onChange={(e) => handleChange("rejected_quantity_kg", e.target.value)}
              error={!!errors.rejected_quantity_kg}
              helperText={errors.rejected_quantity_kg || `Max: ${maxRejectableKg} kg`}
              inputProps={{ min: 0, max: maxRejectableKg, step: "0.01" }}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Rejection Reason"
              value={formData.rejection_reason}
              onChange={(e) => handleChange("rejection_reason", e.target.value)}
              error={!!errors.rejection_reason}
              helperText={errors.rejection_reason}
              required
            >
              {REJECTION_REASONS.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  {r.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Rejection Details"
              value={formData.rejection_details}
              onChange={(e) => handleChange("rejection_details", e.target.value)}
              placeholder="Describe the issue in detail..."
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Disposal Cost (UGX)"
              type="number"
              value={formData.disposal_cost}
              onChange={(e) => handleChange("disposal_cost", e.target.value)}
              inputProps={{ min: 0, step: "100" }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Restocking Cost (UGX)"
              type="number"
              value={formData.restocking_cost}
              onChange={(e) => handleChange("restocking_cost", e.target.value)}
              inputProps={{ min: 0, step: "100" }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Additional Notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Recording..." : "Record Rejection"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecordRejectionForm;