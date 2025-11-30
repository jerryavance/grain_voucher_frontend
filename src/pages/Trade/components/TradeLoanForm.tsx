// src/pages/Trade/components/TradeLoanForm.tsx
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
  Alert,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { TradeService } from "../Trade.service";

interface TradeLoanFormProps {
  open: boolean;
  onClose: () => void;
  tradeId: string;
  onSuccess: () => void;
}

const validationSchema = Yup.object({
  investor_account_id: Yup.string().required("Investor account is required"),
  amount: Yup.number().required("Amount is required").min(0, "Must be positive"),
  interest_rate: Yup.number()
    .required("Interest rate is required")
    .min(0, "Must be positive")
    .max(100, "Cannot exceed 100%"),
  due_date: Yup.date().required("Due date is required"),
  notes: Yup.string(),
});

const TradeLoanForm: FC<TradeLoanFormProps> = ({
  open,
  onClose,
  tradeId,
  onSuccess,
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
      amount: "",
      interest_rate: "",
      due_date: "",
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

        await TradeService.createLoan(payload);
        toast.success("Loan created successfully");

        onSuccess();
        onClose();
        formik.resetForm();
      } catch (error: any) {
        toast.error(
          error?.response?.data?.amount?.[0] ||
            error?.response?.data?.error ||
            "Failed to create loan"
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

  // Calculate interest preview
  const calculateInterest = () => {
    const amount = parseFloat(formik.values.amount as any) || 0;
    const rate = parseFloat(formik.values.interest_rate as any) || 0;
    const dueDate = new Date(formik.values.due_date);
    const today = new Date();
    const days = Math.max(
      0,
      Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    );

    const interest = (amount * (rate / 100) * days) / 365;
    return { interest, total: amount + interest, days };
  };

  const interestCalc = calculateInterest();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Trade Loan</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
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

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Loan Amount *"
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

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Interest Rate (% p.a.) *"
                name="interest_rate"
                value={formik.values.interest_rate}
                onChange={formik.handleChange}
                error={
                  formik.touched.interest_rate && Boolean(formik.errors.interest_rate)
                }
                helperText={
                  formik.touched.interest_rate && formik.errors.interest_rate
                }
                InputProps={{
                  endAdornment: "%",
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Due Date *"
                name="due_date"
                value={formik.values.due_date}
                onChange={formik.handleChange}
                error={formik.touched.due_date && Boolean(formik.errors.due_date)}
                helperText={formik.touched.due_date && formik.errors.due_date}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: new Date().toISOString().split("T")[0],
                }}
              />
            </Grid>

            {formik.values.amount && formik.values.interest_rate && formik.values.due_date && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    Loan Period: {interestCalc.days} days
                  </Typography>
                  <Typography variant="body2">
                    Estimated Interest: {formatCurrency(interestCalc.interest)}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    Total Due: {formatCurrency(interestCalc.total)}
                  </Typography>
                </Alert>
              </Grid>
            )}

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
            {loading ? <CircularProgress size={24} /> : "Create Loan"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TradeLoanForm;