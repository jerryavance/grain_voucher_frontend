// src/pages/Trade/components/TradeBrokerageForm.tsx
import React, { FC, useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { TradeService } from "../Trade.service";

interface TradeBrokerageFormProps {
  open: boolean;
  onClose: () => void;
  tradeId: string;
  onSuccess: () => void;
  initialValues?: any;
}

const validationSchema = Yup.object({
  agent_id: Yup.string().required("Agent is required"),
  commission_type: Yup.string().required("Commission type is required"),
  commission_value: Yup.number()
    .required("Commission value is required")
    .min(0, "Must be positive"),
  notes: Yup.string(),
});

const commissionTypes = [
  { value: "percentage", label: "Percentage of Trade Value" },
  { value: "per_mt", label: "Per Metric Ton" },
  { value: "per_kg", label: "Per Kilogram" },
  { value: "fixed", label: "Fixed Amount" },
];

const TradeBrokerageForm: FC<TradeBrokerageFormProps> = ({
  open,
  onClose,
  tradeId,
  onSuccess,
  initialValues,
}) => {
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [agentLoading, setAgentLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadAgents();
    }
  }, [open]);

  const loadAgents = async (search?: string) => {
    try {
      setAgentLoading(true);
      const data = await TradeService.getAgents(search);
      setAgents(
        data.results.map((agent: any) => ({
          label: `${agent.first_name} ${agent.last_name}`,
          value: agent.id,
        }))
      );
    } catch (error) {
      console.error("Failed to load agents:", error);
    } finally {
      setAgentLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: initialValues || {
      agent_id: "",
      commission_type: "percentage",
      commission_value: "",
      notes: "",
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
          await TradeService.updateBrokerage(payload, initialValues.id);
          toast.success("Brokerage updated successfully");
        } else {
          await TradeService.createBrokerage(payload);
          toast.success("Brokerage added successfully");
        }

        onSuccess();
        onClose();
        formik.resetForm();
      } catch (error: any) {
        toast.error(error?.response?.data?.error || "Failed to save brokerage");
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
        {initialValues ? "Edit Brokerage" : "Add Brokerage"}
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Autocomplete
                options={agents}
                loading={agentLoading}
                value={agents.find((a) => a.value === formik.values.agent_id) || null}
                onChange={(_, newValue) => {
                  formik.setFieldValue("agent_id", newValue?.value || "");
                }}
                onInputChange={(_, value) => {
                  if (value) loadAgents(value);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Agent/BDM *"
                    error={formik.touched.agent_id && Boolean(formik.errors.agent_id)}
                    helperText={formik.touched.agent_id && formik.errors.agent_id}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Commission Type *"
                name="commission_type"
                value={formik.values.commission_type}
                onChange={formik.handleChange}
                error={
                  formik.touched.commission_type &&
                  Boolean(formik.errors.commission_type)
                }
                helperText={
                  formik.touched.commission_type && formik.errors.commission_type
                }
              >
                {commissionTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Commission Value *"
                name="commission_value"
                value={formik.values.commission_value}
                onChange={formik.handleChange}
                error={
                  formik.touched.commission_value &&
                  Boolean(formik.errors.commission_value)
                }
                helperText={
                  formik.touched.commission_value && formik.errors.commission_value
                }
                placeholder={
                  formik.values.commission_type === "percentage"
                    ? "Enter percentage (e.g., 2.5)"
                    : "Enter amount"
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                name="notes"
                value={formik.values.notes}
                onChange={formik.handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? (
              <CircularProgress size={24} />
            ) : initialValues ? (
              "Update"
            ) : (
              "Add"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TradeBrokerageForm;