import React, { FC, useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, Grid } from "@mui/material";
import { AccountingService } from "./Accounting.service";
import { IAgingReport } from "./Accounting.interface";
import { Span } from "../../components/Typography";
import ProgressIndicator from "../../components/UI/ProgressIndicator";

const AgingReport: FC = () => {
  const [agingData, setAgingData] = useState<IAgingReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchAgingReport();
  }, []);

  const fetchAgingReport = async () => {
    try {
      setLoading(true);
      const data = await AccountingService.getInvoiceAging();
      setAgingData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching aging report:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <ProgressIndicator size={40} />
      </Box>
    );
  }

  return (
    <Box py={2}>
      <Typography variant="h6" gutterBottom>
        Invoice Aging Report
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="error.main" gutterBottom>
                Overdue Invoices
              </Typography>
              <Typography variant="h4" color="error.main">
                UGX {agingData?.overdue?.toLocaleString() || '0'}
              </Typography>
              <Span sx={{ fontSize: 14, color: 'text.secondary' }}>
                Total amount past due date
              </Span>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main" gutterBottom>
                Due Soon (Next 7 Days)
              </Typography>
              <Typography variant="h4" color="warning.main">
                UGX {agingData?.due_soon?.toLocaleString() || '0'}
              </Typography>
              <Span sx={{ fontSize: 14, color: 'text.secondary' }}>
                Total amount due within 7 days
              </Span>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h5" color="success.main">
                    ${((agingData?.overdue || 0) + (agingData?.due_soon || 0)).toLocaleString()}
                  </Typography>
                  <Span sx={{ fontSize: 14, color: 'text.secondary' }}>
                    Total Outstanding
                  </Span>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h5" color="primary.main">
                    {agingData?.overdue ? 
                      `${((agingData.overdue / ((agingData.overdue || 0) + (agingData.due_soon || 0))) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </Typography>
                  <Span sx={{ fontSize: 14, color: 'text.secondary' }}>
                    Overdue Percentage
                  </Span>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h5" color="info.main">
                    {agingData?.due_soon ?
                      `${((agingData.due_soon / ((agingData.overdue || 0) + (agingData.due_soon || 0))) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </Typography>
                  <Span sx={{ fontSize: 14, color: 'text.secondary' }}>
                    Due Soon Percentage
                  </Span>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default AgingReport;