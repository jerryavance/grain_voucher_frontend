import { FC, useEffect, useState } from "react";
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent,
  DialogTitle, Grid, IconButton, MenuItem, TextField, Typography,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { toast } from "react-hot-toast";
import { SourcingService } from "./Sourcing.service";
import { IRejectedLot } from "./Sourcing.interface";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  rejectedLot: IRejectedLot;
}

const CreateReplacementForm: FC<Props> = ({ open, onClose, onSuccess, rejectedLot }) => {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<{ value: string; label: string }[]>([]);
  const [grainTypes, setGrainTypes] = useState<{ value: string; label: string }[]>([]);
  const [dropdownsLoading, setDropdownsLoading] = useState(true);
  const [formData, setFormData] = useState({
    supplier_id: "",
    grain_type_id: "",
    offered_price_per_kg: "",
    logistics_cost: "0",
    other_costs: "0",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setDropdownsLoading(true);

    Promise.all([
      // Suppliers from sourcing API
      SourcingService.getSuppliers({ page_size: 200 }),
      // Grain types derived from sale lots (already in the system)
      SourcingService.getSaleLots({ page_size: 200 }),
    ])
      .then(([suppliersRes, lotsRes]) => {
        setSuppliers(
          (suppliersRes.results || []).map((s: any) => ({
            value: s.id,
            label: s.business_name,
          }))
        );

        // Deduplicate grain types from sale lots
        const seen = new Set<string>();
        const types: { value: string; label: string }[] = [];
        (lotsRes.results || []).forEach((l: any) => {
          if (l.grain_type && !seen.has(l.grain_type)) {
            seen.add(l.grain_type);
            types.push({ value: l.grain_type, label: l.grain_type_name });
          }
        });
        setGrainTypes(types);
      })
      .catch(() => toast.error("Failed to load form data"))
      .finally(() => setDropdownsLoading(false));
  }, [open]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.supplier_id) errs.supplier_id = "Supplier is required";
    if (!formData.grain_type_id) errs.grain_type_id = "Grain type is required";
    if (!formData.offered_price_per_kg || Number(formData.offered_price_per_kg) <= 0)
      errs.offered_price_per_kg = "Price must be greater than 0";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await SourcingService.createReplacementTrade(rejectedLot.id, {
        supplier_id: formData.supplier_id,
        grain_type_id: formData.grain_type_id,
        offered_price_per_kg: formData.offered_price_per_kg,
        logistics_cost: formData.logistics_cost || "0",
        other_costs: formData.other_costs || "0",
        notes: formData.notes,
      });
      toast.success(`Replacement order ${result.replacement_order_number} created`);
      onSuccess();
      handleClose();
    } catch (e: any) {
      const data = e?.response?.data;
      toast.error(data?.error || "Failed to create replacement trade");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      supplier_id: "",
      grain_type_id: "",
      offered_price_per_kg: "",
      logistics_cost: "0",
      other_costs: "0",
      notes: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" fontWeight={600}>Create Replacement Trade</Typography>
        <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Rejection summary */}
        <Box mb={3} p={2} bgcolor="#f5f5f5" borderRadius={1}>
          <Typography variant="subtitle2">
            Rejection: <strong>{rejectedLot.rejection_number}</strong>
          </Typography>
          <Typography variant="body2">Lot: {rejectedLot.lot_number}</Typography>
          <Typography variant="body2">
            Quantity: <strong>{rejectedLot.rejected_quantity_kg} kg</strong>
          </Typography>
          <Typography variant="body2">
            Reason: {rejectedLot.rejection_reason_display}
          </Typography>
          {rejectedLot.investor_name && (
            <Typography variant="body2">Investor: {rejectedLot.investor_name}</Typography>
          )}
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          A new source order will be created for <strong>{rejectedLot.rejected_quantity_kg} kg</strong> and
          automatically allocated to the same investor.
        </Alert>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Supplier"
              value={formData.supplier_id}
              onChange={(e) => handleChange("supplier_id", e.target.value)}
              error={!!errors.supplier_id}
              helperText={errors.supplier_id}
              disabled={dropdownsLoading}
              required
            >
              {suppliers.map((s) => (
                <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Grain Type"
              value={formData.grain_type_id}
              onChange={(e) => handleChange("grain_type_id", e.target.value)}
              error={!!errors.grain_type_id}
              helperText={errors.grain_type_id}
              disabled={dropdownsLoading}
              required
            >
              {grainTypes.map((g) => (
                <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Offered Price per kg (UGX)"
              type="number"
              value={formData.offered_price_per_kg}
              onChange={(e) => handleChange("offered_price_per_kg", e.target.value)}
              error={!!errors.offered_price_per_kg}
              helperText={errors.offered_price_per_kg}
              inputProps={{ min: 0, step: "100" }}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Logistics Cost (UGX)"
              type="number"
              value={formData.logistics_cost}
              onChange={(e) => handleChange("logistics_cost", e.target.value)}
              inputProps={{ min: 0, step: "100" }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Other Costs (UGX)"
              type="number"
              value={formData.other_costs}
              onChange={(e) => handleChange("other_costs", e.target.value)}
              inputProps={{ min: 0, step: "100" }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Optional notes for the replacement order..."
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleSubmit}
          disabled={loading || dropdownsLoading}
        >
          {loading ? "Creating..." : "Create Replacement"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateReplacementForm;