import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Paper, Divider } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useTitle from "../../../hooks/useTitle";
import { BudgetService } from "./Budgets.service";
import { IBudget } from "./Budgets.interface";
import { formatDateToDDMMYYYY } from "../../../utils/date_formatter";
import ProgressIndicator from "../../../components/UI/ProgressIndicator";

const BudgetDetails = () => {
  useTitle("Budget Details");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [budget, setBudget] = useState<IBudget | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      fetchBudgetDetails(id);
    }
  }, [id]);

  const fetchBudgetDetails = async (budgetId: string) => {
    try {
      setLoading(true);
      const data = await BudgetService.getBudgetDetails(budgetId);
      setBudget(data);
    } catch (error: any) {
      toast.error("Failed to fetch budget details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/accounting/budgets");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <ProgressIndicator size={40} />
      </Box>
    );
  }

  if (!budget) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" color="error">
          Budget not found
        </Typography>
        <Button variant="contained" onClick={handleBack} sx={{ mt: 2 }}>
          Back to Budgets
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Button variant="outlined" onClick={handleBack} sx={{ mb: 2 }}>
        Back to Budgets
      </Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Budget for {formatDateToDDMMYYYY(budget.period)}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Hub</Typography>
            <Typography>{budget.hub?.name || "N/A"}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Grain Type</Typography>
            <Typography>{budget.grain_type?.name || "N/A"}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Budgeted Amount</Typography>
            <Typography>${budget.budgeted_amount.toFixed(2)}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Actual Amount</Typography>
            <Typography>${budget.actual_amount.toFixed(2)}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Variance</Typography>
            <Typography>${budget.variance.toFixed(2)}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Variance Percentage</Typography>
            <Typography>{budget.variance_percentage.toFixed(2)}%</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Over Budget</Typography>
            <Typography>{budget.is_over_budget ? "Yes" : "No"}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Created At</Typography>
            <Typography>{formatDateToDDMMYYYY(budget.created_at)}</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default BudgetDetails;