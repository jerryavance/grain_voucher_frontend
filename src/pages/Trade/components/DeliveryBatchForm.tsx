// src/pages/Trade/components/DeliveryBatchForm.tsx
import React, { FC, useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Typography,
  Divider,
  Alert,
  Box,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { TradeService } from "../Trade.service";
import { formatNumber } from "../tradeWorkflowHelper";

interface DeliveryBatchFormProps {
  open: boolean;
  onClose: () => void;
  tradeId: string;
  tradeNumber: string;
  remainingQuantityKg?: number;
  onSuccess: () => void;
}

const validationSchema = Yup.object({
  net_weight_kg: Yup.number()
    .required("Net weight is required")
    .min(1, "Must be greater than 0")
    .test("max-remaining", "Cannot exceed remaining quantity", function (value) {
      const { remainingQuantity } = this.options.context as any;
      return !value || !remainingQuantity || value <= remainingQuantity;
    }),
  point_of_loading: Yup.string().required("Point of loading is required"),
  loading_date: Yup.date().required("Loading date is required"),
  delivery_date: Yup.date()
    .required("Delivery date is required")
    .min(Yup.ref("loading_date"), "Delivery date must be after loading date"),
  delivered_to_name: Yup.string().required("Delivered to name is required"),
  delivered_to_address: Yup.string().required("Delivery address is required"),
  delivered_to_contact: Yup.string().required("Contact is required"),
  vehicle_number: Yup.string().required("Vehicle number is required"),
  driver_name: Yup.string().required("Driver name is required"),
  driver_id_number: Yup.string().required("Driver ID is required"),
  driver_phone: Yup.string().required("Driver phone is required"),
  gross_weight_kg: Yup.number()
    .required("Gross weight is required")
    .min(0, "Must be positive"),
  tare_weight_kg: Yup.number().min(0, "Must be positive"),
  warehouse_manager_name: Yup.string().required("Warehouse manager name is required"),
  warehouse_manager_date: Yup.date().required("Manager date is required"),
  received_by_name: Yup.string().required("Received by name is required"),
  received_by_date: Yup.date().required("Received date is required"),
});

const DeliveryBatchForm: FC<DeliveryBatchFormProps> = ({
  open,
  onClose,
  tradeId,
  tradeNumber,
  remainingQuantityKg,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      net_weight_kg: remainingQuantityKg || "",
      point_of_loading: "",
      loading_date: "",
      delivery_date: "",
      delivered_to_name: "",
      delivered_to_address: "",
      delivered_to_contact: "",
      vehicle_number: "",
      driver_name: "",
      driver_id_number: "",
      driver_phone: "",
      quantity_bags: "",
      gross_weight_kg: "",
      tare_weight_kg: "",
      warehouse_manager_name: "",
      warehouse_manager_date: "",
      received_by_name: "",
      received_by_date: "",
      remarks: "",
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const response = await TradeService.createDeliveryBatch(tradeId, values as any);
        
        toast.success(
          `Delivery batch created! Invoice ${response.invoice?.invoice_number || ""} generated.`
        );

        onSuccess();
        onClose();
        formik.resetForm();
      } catch (error: any) {
        const errorMsg =
          error?.response?.data?.error ||
          error?.response?.data?.net_weight_kg?.[0] ||
          "Failed to create delivery batch";
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
  });

  // Auto-calculate net weight
  useEffect(() => {
    const gross = parseFloat(formik.values.gross_weight_kg as any) || 0;
    const tare = parseFloat(formik.values.tare_weight_kg as any) || 0;
    if (gross > 0 && tare >= 0) {
      formik.setFieldValue("net_weight_kg", gross - tare);
    }
  }, [formik.values.gross_weight_kg, formik.values.tare_weight_kg]);

  const handleClose = () => {
    if (!loading) {
      formik.resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h6">Create Delivery Batch</Typography>
          <Typography variant="body2" color="text.secondary">
            {tradeNumber}
          </Typography>
        </Box>
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {remainingQuantityKg && remainingQuantityKg > 0 && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Remaining to deliver:</strong> {formatNumber(remainingQuantityKg, 0)} kg
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                This delivery will automatically generate an invoice
              </Typography>
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Loading Details */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mt: 1 }}>
                Loading Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Point of Loading *"
                name="point_of_loading"
                value={formik.values.point_of_loading}
                onChange={formik.handleChange}
                error={formik.touched.point_of_loading && Boolean(formik.errors.point_of_loading)}
                helperText={formik.touched.point_of_loading && formik.errors.point_of_loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Loading Date *"
                name="loading_date"
                value={formik.values.loading_date}
                onChange={formik.handleChange}
                error={formik.touched.loading_date && Boolean(formik.errors.loading_date)}
                helperText={formik.touched.loading_date && formik.errors.loading_date}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Delivery Details */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                Delivery Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Delivery Date *"
                name="delivery_date"
                value={formik.values.delivery_date}
                onChange={formik.handleChange}
                error={formik.touched.delivery_date && Boolean(formik.errors.delivery_date)}
                helperText={formik.touched.delivery_date && formik.errors.delivery_date}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Delivered To Name *"
                name="delivered_to_name"
                value={formik.values.delivered_to_name}
                onChange={formik.handleChange}
                error={formik.touched.delivered_to_name && Boolean(formik.errors.delivered_to_name)}
                helperText={formik.touched.delivered_to_name && formik.errors.delivered_to_name}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Delivery Address *"
                name="delivered_to_address"
                value={formik.values.delivered_to_address}
                onChange={formik.handleChange}
                error={
                  formik.touched.delivered_to_address && Boolean(formik.errors.delivered_to_address)
                }
                helperText={formik.touched.delivered_to_address && formik.errors.delivered_to_address}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Number *"
                name="delivered_to_contact"
                value={formik.values.delivered_to_contact}
                onChange={formik.handleChange}
                error={
                  formik.touched.delivered_to_contact && Boolean(formik.errors.delivered_to_contact)
                }
                helperText={formik.touched.delivered_to_contact && formik.errors.delivered_to_contact}
              />
            </Grid>

            {/* Vehicle & Driver */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                Vehicle & Driver Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vehicle Number *"
                name="vehicle_number"
                value={formik.values.vehicle_number}
                onChange={formik.handleChange}
                error={formik.touched.vehicle_number && Boolean(formik.errors.vehicle_number)}
                helperText={formik.touched.vehicle_number && formik.errors.vehicle_number}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Driver Name *"
                name="driver_name"
                value={formik.values.driver_name}
                onChange={formik.handleChange}
                error={formik.touched.driver_name && Boolean(formik.errors.driver_name)}
                helperText={formik.touched.driver_name && formik.errors.driver_name}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Driver ID Number *"
                name="driver_id_number"
                value={formik.values.driver_id_number}
                onChange={formik.handleChange}
                error={formik.touched.driver_id_number && Boolean(formik.errors.driver_id_number)}
                helperText={formik.touched.driver_id_number && formik.errors.driver_id_number}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Driver Phone *"
                name="driver_phone"
                value={formik.values.driver_phone}
                onChange={formik.handleChange}
                error={formik.touched.driver_phone && Boolean(formik.errors.driver_phone)}
                helperText={formik.touched.driver_phone && formik.errors.driver_phone}
              />
            </Grid>

            {/* Weight Details */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                Weight Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Quantity (Bags)"
                name="quantity_bags"
                value={formik.values.quantity_bags}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Gross Weight (kg) *"
                name="gross_weight_kg"
                value={formik.values.gross_weight_kg}
                onChange={formik.handleChange}
                error={formik.touched.gross_weight_kg && Boolean(formik.errors.gross_weight_kg)}
                helperText={formik.touched.gross_weight_kg && formik.errors.gross_weight_kg}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Tare Weight (kg)"
                name="tare_weight_kg"
                value={formik.values.tare_weight_kg}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Net Weight (kg) *"
                name="net_weight_kg"
                value={formik.values.net_weight_kg}
                onChange={formik.handleChange}
                error={formik.touched.net_weight_kg && Boolean(formik.errors.net_weight_kg)}
                helperText={formik.touched.net_weight_kg && formik.errors.net_weight_kg}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>

            {/* Sign-off Details */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                Sign-off Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Warehouse Manager Name *"
                name="warehouse_manager_name"
                value={formik.values.warehouse_manager_name}
                onChange={formik.handleChange}
                error={
                  formik.touched.warehouse_manager_name &&
                  Boolean(formik.errors.warehouse_manager_name)
                }
                helperText={
                  formik.touched.warehouse_manager_name && formik.errors.warehouse_manager_name
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Manager Sign Date *"
                name="warehouse_manager_date"
                value={formik.values.warehouse_manager_date}
                onChange={formik.handleChange}
                error={
                  formik.touched.warehouse_manager_date &&
                  Boolean(formik.errors.warehouse_manager_date)
                }
                helperText={
                  formik.touched.warehouse_manager_date && formik.errors.warehouse_manager_date
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Received By Name *"
                name="received_by_name"
                value={formik.values.received_by_name}
                onChange={formik.handleChange}
                error={formik.touched.received_by_name && Boolean(formik.errors.received_by_name)}
                helperText={formik.touched.received_by_name && formik.errors.received_by_name}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Received Date *"
                name="received_by_date"
                value={formik.values.received_by_date}
                onChange={formik.handleChange}
                error={formik.touched.received_by_date && Boolean(formik.errors.received_by_date)}
                helperText={formik.touched.received_by_date && formik.errors.received_by_date}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Remarks"
                name="remarks"
                value={formik.values.remarks}
                onChange={formik.handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading} size="large">
            {loading ? <CircularProgress size={24} /> : "Create Delivery & Generate Invoice"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DeliveryBatchForm;