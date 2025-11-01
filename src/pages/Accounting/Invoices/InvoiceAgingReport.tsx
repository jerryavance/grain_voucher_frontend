
import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Paper, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import useTitle from "../../../hooks/useTitle";
import { InvoiceService } from "./Invoices.service";
import { formatDateToDDMMYYYY } from "../../../utils/date_formatter";
import ProgressIndicator from "../../../components/UI/ProgressIndicator";
import CustomTable from "../../../components/UI/CustomTable";
import { toast } from "react-hot-toast";
// Define the shape of the aging data from the backend
interface IAgingBucket {
  period: string;
  total_amount: number;
  invoices: {
    id: string;
    invoice_number: string;
    account: { name: string };
    due_date: string;
    amount_due: number;
  }[];
}

const InvoiceAgingReport = () => {
  useTitle("Invoice Aging Report");
  const navigate = useNavigate();
  const [agingData, setAgingData] = useState<IAgingBucket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAgingReport();
  }, []);

  const fetchAgingReport = async () => {
    try {
      setLoading(true);
      const data = await InvoiceService.getAging();
      setAgingData(data.results || []);
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

  const columns = [
    {
      Header: "Invoice Number",
      accessor: "invoice_number",
      minWidth: 150,
      Cell: ({ row }: any) => (
        <Typography
          sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline", fontWeight: "bold" } }}
          color="primary"
          onClick={() => navigate(`/admin/accounting/invoices/details/${row.original.id}`)}
        >
          {row.original.invoice_number}
        </Typography>
      ),
    },
    {
      Header: "Account",
      accessor: "account.name",
      minWidth: 150,
    },
    {
      Header: "Due Date",
      accessor: "due_date",
      minWidth: 120,
      Cell: ({ value }: any) => formatDateToDDMMYYYY(value),
    },
    {
      Header: "Amount Due",
      accessor: "amount_due",
      minWidth: 120,
      Cell: ({ value }: any) => `$${value.toFixed(2)}`,
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <ProgressIndicator size={40} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: "auto" }}>
      <Button variant="outlined" onClick={handleBack} sx={{ mb: 2 }}>
        Back to Invoices
      </Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Invoice Aging Report
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {agingData.length === 0 ? (
          <Typography>No overdue invoices found.</Typography>
        ) : (
          agingData.map((bucket, index) => (
            <Box key={index} sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {bucket.period} (Total: ${bucket.total_amount.toFixed(2)})
              </Typography>
              <CustomTable
                columnShape={columns}
                data={bucket.invoices}
                dataCount={bucket.invoices.length}
                pageInitialState={{ pageSize: 10, pageIndex: 0 }}
                setPageIndex={() => { } } // No pagination for bucket
                setPageSize={() => { } }
                loading={false} pageIndex={0}              
              />
            </Box>
          ))
        )}
      </Paper>
    </Box>
  );
};

export default InvoiceAgingReport;