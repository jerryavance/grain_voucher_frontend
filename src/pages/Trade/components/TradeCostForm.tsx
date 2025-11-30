// src/pages/Trade/components/TradeCostForm.tsx
import React, { FC, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { TradeService } from "../Trade.service";

interface TradeCostFormProps {
  open: boolean;
  onClose: () => void;
  tradeId: string;
  onSuccess: () => void;
  initialValues?: any;
}

const validationSchema = Yup.object({
  cost_type: Yup.string().required("Cost type is required"),
  amount: Yup.number().required("Amount is required").min(0, "Amount must be positive"),
  description: Yup.string(),
  is_per_unit: Yup.boolean(),
});

const costTypes = [
  "Storage",
  "Handling",
  "Fumigation",
  "Packaging",
  "Administrative",
  "Insurance",
  "Security",
  "Other",
];

const TradeCostForm: FC<TradeCostFormProps> = ({
  open,
  onClose,
  tradeId,
  onSuccess,
  initialValues,
}) => {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: initialValues || {
      cost_type: "",
      amount: "",
      description: "",
      is_per_unit: false,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const payload = {
          ...values,
          trade: tradeId,
        };

        if (initialValues?.id) {
          await TradeService.updateTradeCost(payload, initialValues.id);
          toast.success("Cost updated successfully");
        } else {
          await TradeService.createTradeCost(payload);
          toast.success("Cost added successfully");
        }

        onSuccess();
        onClose();
        formik.resetForm();
      } catch (error: any) {
        toast.error(error?.response?.data?.error || "Failed to save cost");
      } finally {
        setLoading(false);
      }
    },
  });

  const handleClose = () => {
    if (!loading) {
      formik.resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialValues ? "Edit Trade Cost" : "Add Trade Cost"}
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Cost Type *"
                name="cost_type"
                value={formik.values.cost_type}
                onChange={formik.handleChange}
                error={formik.touched.cost_type && Boolean(formik.errors.cost_type)}
                helperText={formik.touched.cost_type && formik.errors.cost_type}
              >
                {costTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Amount *"
                name="amount"
                value={formik.values.amount}
                onChange={formik.handleChange}
                error={formik.touched.amount && Boolean(formik.errors.amount)}
                helperText={formik.touched.amount && formik.errors.amount}
                InputProps={{
                  startAdornment: "UGX",
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="is_per_unit"
                    checked={formik.values.is_per_unit}
                    onChange={formik.handleChange}
                  />
                }
                label="Is Per Unit (per kg)"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : initialValues ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TradeCostForm;