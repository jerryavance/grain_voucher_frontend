import React, { FC, useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { TradeService } from "../Trade.service";
import ProgressIndicator from "../../../components/UI/ProgressIndicator";

interface CostBreakdownProps {
  tradeId: string;
}

const CostBreakdown: FC<CostBreakdownProps> = ({ tradeId }) => {
  const [breakdown, setBreakdown] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBreakdown();
  }, [tradeId]);

  const fetchBreakdown = async () => {
    try {
      setLoading(true);
      const data = await TradeService.getCostBreakdown(tradeId);
      setBreakdown(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Failed to load cost breakdown");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <ProgressIndicator />
      </Box>
    );
  }

  if (!breakdown) {
    return <Typography>No cost breakdown available</Typography>;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Direct Costs */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Direct Costs
            </Typography>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell>Purchase Cost</TableCell>
                  <TableCell align="right">
                    {formatCurrency(breakdown.purchase_cost)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Aflatoxin/QA Cost</TableCell>
                  <TableCell align="right">
                    {formatCurrency(breakdown.aflatoxin_qa_cost)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Weighbridge Cost</TableCell>
                  <TableCell align="right">
                    {formatCurrency(breakdown.weighbridge_cost)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Offloading Cost</TableCell>
                  <TableCell align="right">
                    {formatCurrency(breakdown.offloading_cost)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Loading Cost</TableCell>
                  <TableCell align="right">
                    {formatCurrency(breakdown.loading_cost)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Transport Cost</TableCell>
                  <TableCell align="right">
                    {formatCurrency(breakdown.transport_cost)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* Additional Costs */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Additional Costs
            </Typography>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell>Financing Cost</TableCell>
                  <TableCell align="right">
                    {formatCurrency(breakdown.financing_cost)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>GIT Insurance</TableCell>
                  <TableCell align="right">
                    {formatCurrency(breakdown.git_insurance_cost)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Deductions</TableCell>
                  <TableCell align="right">
                    {formatCurrency(breakdown.deduction_cost)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Other Expenses</TableCell>
                  <TableCell align="right">
                    {formatCurrency(breakdown.other_expenses)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Bennu Fees (to seller)</TableCell>
                  <TableCell align="right">
                    {formatCurrency(breakdown.bennu_to_seller)}
                  </TableCell>
                </TableRow>
                {breakdown.loss_cost > 0 && (
                  <TableRow>
                    <TableCell>Loss Cost</TableCell>
                    <TableCell align="right" sx={{ color: "error.main" }}>
                      {formatCurrency(breakdown.loss_cost)}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* Summary */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Summary
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Total Trade Cost
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {formatCurrency(breakdown.total_trade_cost)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Payable by Buyer
                </Typography>
                <Typography variant="h6" fontWeight={700} color="success.main">
                  {formatCurrency(breakdown.payable_by_buyer)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Gross Margin
                </Typography>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  {formatCurrency(breakdown.margin)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Net Profit (after brokerage)
                </Typography>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  {formatCurrency(breakdown.net_profit)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Brokerages */}
        {breakdown.brokerage_costs && breakdown.brokerage_costs.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Brokerage Costs
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Agent</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {breakdown.brokerage_costs.map((brokerage: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{brokerage.agent || "N/A"}</TableCell>
                      <TableCell>{brokerage.commission_type}</TableCell>
                      <TableCell>{brokerage.commission_value}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(brokerage.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default CostBreakdown;