import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Divider,
  Grid,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import useTitle from "../../../hooks/useTitle";
import { InvoiceService } from "./Invoices.service";
import { IAgingReport } from "./Invoices.interface";
import ProgressIndicator from "../../../components/UI/ProgressIndicator";
import { toast } from "react-hot-toast";

const InvoiceAgingReport = () => {
  useTitle("Invoice Aging Report");
  const navigate = useNavigate();
  const [agingData, setAgingData] = useState<IAgingReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAgingReport();
  }, []);

  const fetchAgingReport = async () => {
    try {
      setLoading(true);
      const data = await InvoiceService.getAging();
      setAgingData(data);
    } catch (error: any) {
      toast.error("Failed to fetch aging report");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/admin/accounting/invoices");
  };

  const formatAmount = (value: number): string => {
    return `UGX ${value.toFixed(2)}`;
  };

  const calculatePercentage = (value: number, total: number): number => {
    if (total === 0) return 0;
    return (value / total) * 100;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <ProgressIndicator size={40} />
      </Box>
    );
  }

  if (!agingData) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" color="error">
          Failed to load aging report
        </Typography>
        <Button variant="contained" onClick={handleBack} sx={{ mt: 2 }}>
          Back to Invoices
        </Button>
      </Box>
    );
  }

  const agingBuckets = [
    {
      label: "Current (Not Yet Due)",
      amount: agingData.current,
      color: "#4caf50",
      description: "Invoices not yet overdue",
    },
    {
      label: "1-30 Days Overdue",
      amount: agingData.days_1_30,
      color: "#ff9800",
      description: "Invoices 1-30 days past due",
    },
    {
      label: "31-60 Days Overdue",
      amount: agingData.days_31_60,
      color: "#ff5722",
      description: "Invoices 31-60 days past due",
    },
    {
      label: "61-90 Days Overdue",
      amount: agingData.days_61_90,
      color: "#f44336",
      description: "Invoices 61-90 days past due",
    },
    {
      label: "Over 90 Days",
      amount: agingData.over_90_days,
      color: "#d32f2f",
      description: "Invoices more than 90 days past due",
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ mb: 3 }}
      >
        Back to Invoices
      </Button>

      <Paper sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <TrendingUpIcon color="primary" fontSize="large" />
          <Typography variant="h4">Accounts Receivable Aging Report</Typography>
        </Stack>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Analysis of outstanding invoices by age. This report helps identify collection priorities
          and potential bad debts.
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {/* Total Outstanding */}
        <Card
          sx={{
            mb: 3,
            bgcolor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Total Outstanding
            </Typography>
            <Typography variant="h3" fontWeight="bold">
              {formatAmount(agingData.total)}
            </Typography>
          </CardContent>
        </Card>

        {/* Aging Buckets */}
        <Grid container spacing={2}>
          {agingBuckets.map((bucket, index) => {
            const percentage = calculatePercentage(bucket.amount, agingData.total);
            return (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    borderLeft: 4,
                    borderColor: bucket.color,
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 3,
                    },
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                      sx={{ minHeight: 40 }}
                    >
                      {bucket.label}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                      {formatAmount(bucket.amount)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: bucket.color,
                        fontWeight: "medium",
                        mb: 1,
                      }}
                    >
                      {percentage.toFixed(1)}% of total
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {bucket.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Analysis Summary */}
        <Box sx={{ mt: 4, p: 3, bgcolor: "background.default", borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Analysis Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Current & On-Time:</strong>
              </Typography>
              <Typography variant="h6" color="success.main">
                {formatAmount(agingData.current)} (
                {calculatePercentage(agingData.current, agingData.total).toFixed(1)}%)
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Total Overdue:</strong>
              </Typography>
              <Typography variant="h6" color="error.main">
                {formatAmount(
                  agingData.days_1_30 +
                    agingData.days_31_60 +
                    agingData.days_61_90 +
                    agingData.over_90_days
                )}{" "}
                (
                {calculatePercentage(
                  agingData.days_1_30 +
                    agingData.days_31_60 +
                    agingData.days_61_90 +
                    agingData.over_90_days,
                  agingData.total
                ).toFixed(1)}
                %)
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Critically Overdue (60+ days):</strong>
              </Typography>
              <Typography variant="h6" color="error.dark">
                {formatAmount(agingData.days_61_90 + agingData.over_90_days)} (
                {calculatePercentage(
                  agingData.days_61_90 + agingData.over_90_days,
                  agingData.total
                ).toFixed(1)}
                %)
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>High Risk (90+ days):</strong>
              </Typography>
              <Typography variant="h6" sx={{ color: "#d32f2f" }}>
                {formatAmount(agingData.over_90_days)} (
                {calculatePercentage(agingData.over_90_days, agingData.total).toFixed(1)}%)
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Recommendations */}
        {agingData.over_90_days > 0 && (
          <Box sx={{ mt: 3, p: 2, bgcolor: "error.light", borderRadius: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              ⚠️ Action Required
            </Typography>
            <Typography variant="body2">
              You have {formatAmount(agingData.over_90_days)} in invoices overdue by more than 90
              days. Consider escalating collection efforts or reviewing write-off procedures.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default InvoiceAgingReport;














// import React, { useEffect, useState } from "react";
// import { Box, Button, Typography, Paper, Divider } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import useTitle from "../../../hooks/useTitle";
// import { InvoiceService } from "./Invoices.service";
// import { formatDateToDDMMYYYY } from "../../../utils/date_formatter";
// import ProgressIndicator from "../../../components/UI/ProgressIndicator";
// import CustomTable from "../../../components/UI/CustomTable";
// import { toast } from "react-hot-toast";
// // Define the shape of the aging data from the backend
// interface IAgingBucket {
//   period: string;
//   total_amount: number;
//   invoices: {
//     id: string;
//     invoice_number: string;
//     account: { name: string };
//     due_date: string;
//     amount_due: number;
//   }[];
// }

// const InvoiceAgingReport = () => {
//   useTitle("Invoice Aging Report");
//   const navigate = useNavigate();
//   const [agingData, setAgingData] = useState<IAgingBucket[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   useEffect(() => {
//     fetchAgingReport();
//   }, []);

//   const fetchAgingReport = async () => {
//     try {
//       setLoading(true);
//       const data = await InvoiceService.getAging();
//       setAgingData(data.results || []);
//     } catch (error: any) {
//       toast.error("Failed to fetch aging report");
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBack = () => {
//     navigate("/admin/accounting/invoices");
//   };

//   const columns = [
//     {
//       Header: "Invoice Number",
//       accessor: "invoice_number",
//       minWidth: 150,
//       Cell: ({ row }: any) => (
//         <Typography
//           sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline", fontWeight: "bold" } }}
//           color="primary"
//           onClick={() => navigate(`/admin/accounting/invoices/details/${row.original.id}`)}
//         >
//           {row.original.invoice_number}
//         </Typography>
//       ),
//     },
//     {
//       Header: "Account",
//       accessor: "account.name",
//       minWidth: 150,
//     },
//     {
//       Header: "Due Date",
//       accessor: "due_date",
//       minWidth: 120,
//       Cell: ({ value }: any) => formatDateToDDMMYYYY(value),
//     },
//     {
//       Header: "Amount Due",
//       accessor: "amount_due",
//       minWidth: 120,
//       Cell: ({ value }: any) => `$${value.toFixed(2)}`,
//     },
//   ];

//   if (loading) {
//     return (
//       <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
//         <ProgressIndicator size={40} />
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ p: 4, maxWidth: 1200, mx: "auto" }}>
//       <Button variant="outlined" onClick={handleBack} sx={{ mb: 2 }}>
//         Back to Invoices
//       </Button>
//       <Paper sx={{ p: 3 }}>
//         <Typography variant="h4" gutterBottom>
//           Invoice Aging Report
//         </Typography>
//         <Divider sx={{ mb: 2 }} />
//         {agingData.length === 0 ? (
//           <Typography>No overdue invoices found.</Typography>
//         ) : (
//           agingData.map((bucket, index) => (
//             <Box key={index} sx={{ mb: 4 }}>
//               <Typography variant="h6" sx={{ mb: 2 }}>
//                 {bucket.period} (Total: ${bucket.total_amount.toFixed(2)})
//               </Typography>
//               <CustomTable
//                 columnShape={columns}
//                 data={bucket.invoices}
//                 dataCount={bucket.invoices.length}
//                 pageInitialState={{ pageSize: 10, pageIndex: 0 }}
//                 setPageIndex={() => { } } // No pagination for bucket
//                 setPageSize={() => { } }
//                 loading={false} pageIndex={0}              
//               />
//             </Box>
//           ))
//         )}
//       </Paper>
//     </Box>
//   );
// };

// export default InvoiceAgingReport;