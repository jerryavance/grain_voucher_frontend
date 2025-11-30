// src/pages/Trade/components/TradeFinancingForm.tsx
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
  Autocomplete,
  Typography,
  Alert,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { TradeService } from "../Trade.service";

interface TradeFinancingFormProps {
  open: boolean;
  onClose: () => void;
  tradeId: string;
  onSuccess: () => void;
  tradeDetails?: any;
}

const validationSchema = Yup.object({
  investor_account_id: Yup.string().required("Investor account is required"),
  allocated_amount: Yup.number()
    .required("Allocated amount is required")
    .min(0, "Must be positive"),
  notes: Yup.string(),
});

const TradeFinancingForm: FC<TradeFinancingFormProps> = ({
  open,
  onClose,
  tradeId,
  onSuccess,
  tradeDetails,
}) => {
  const [loading, setLoading] = useState(false);
  const [investors, setInvestors] = useState<any[]>([]);
  const [investorLoading, setInvestorLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadInvestors();
    }
  }, [open]);

  const loadInvestors = async (search?: string) => {
    try {
      setInvestorLoading(true);
      const data = await TradeService.getInvestorAccounts(search);
      setInvestors(
        data.results.map((inv: any) => ({
          label: `${inv.investor_name} - Available: ${formatCurrency(
            inv.available_balance
          )}`,
          value: inv.id,
          available_balance: inv.available_balance,
        }))
      );
    } catch (error) {
      console.error("Failed to load investors:", error);
    } finally {
      setInvestorLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      investor_account_id: "",
      allocated_amount: "",
      notes: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const payload = {
          ...values,
          trade: tradeId,
        };

        await TradeService.createFinancingAllocation(payload);
        toast.success("Financing allocated successfully");

        onSuccess();
        onClose();
        formik.resetForm();
      } catch (error: any) {
        toast.error(
          error?.response?.data?.allocated_amount?.[0] ||
            error?.response?.data?.error ||
            "Failed to allocate financing"
        );
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Allocate Investor Financing</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {tradeDetails && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Trade Cost: {formatCurrency(tradeDetails.total_trade_cost || 0)}
              </Typography>
              <Typography variant="body2">
                Already Financed:{" "}
                {formatCurrency(tradeDetails.total_financing_allocated || 0)}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                Remaining:{" "}
                {formatCurrency(
                  (tradeDetails.total_trade_cost || 0) -
                    (tradeDetails.total_financing_allocated || 0)
                )}
              </Typography>
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Autocomplete
                options={investors}
                loading={investorLoading}
                value={
                  investors.find(
                    (i) => i.value === formik.values.investor_account_id
                  ) || null
                }
                onChange={(_, newValue) => {
                  formik.setFieldValue("investor_account_id", newValue?.value || "");
                }}
                onInputChange={(_, value) => {
                  if (value) loadInvestors(value);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Investor Account *"
                    error={
                      formik.touched.investor_account_id &&
                      Boolean(formik.errors.investor_account_id)
                    }
                    helperText={
                      formik.touched.investor_account_id &&
                      formik.errors.investor_account_id
                    }
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Allocated Amount *"
                name="allocated_amount"
                value={formik.values.allocated_amount}
                onChange={formik.handleChange}
                error={
                  formik.touched.allocated_amount &&
                  Boolean(formik.errors.allocated_amount)
                }
                helperText={
                  formik.touched.allocated_amount && formik.errors.allocated_amount
                }
                InputProps={{
                  startAdornment: "UGX",
                }}
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
            {loading ? <CircularProgress size={24} /> : "Allocate"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TradeFinancingForm;