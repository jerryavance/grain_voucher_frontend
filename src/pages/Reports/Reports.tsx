// src/pages/Reports/Reports.tsx
import { Box, Button, Card, Grid, Tab, Tabs, Typography, Chip } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import useTitle from "../../hooks/useTitle";
import { useModalContext } from "../../contexts/ModalDialogContext";
import { ReportsService } from "./Reports.service";
import { IDashboardStats } from "./Reports.interface";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ScheduleIcon from "@mui/icons-material/Schedule";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ReportExportsTab from "./ReportExportsTab";
import ReportSchedulesTab from "./ReportSchedulesTab";
import ReportDashboardTab from "./ReportDashboardTab";
import ReportGeneratorModal from "./ReportGeneratorModal";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Reports = () => {
  useTitle("Reports & Analytics");
  const { setShowModal } = useModalContext();

  const [activeTab, setActiveTab] = useState<number>(0);
  const [dashboardStats, setDashboardStats] = useState<IDashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true);
      const stats = await ReportsService.getDashboardStats();
      setDashboardStats(stats);
      setLoadingStats(false);
    } catch (error) {
      setLoadingStats(false);
      console.error("Error fetching dashboard stats:", error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleOpenGenerateModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <Box pt={2} pb={4}>
      {/* Header Section */}
      <Box sx={styles.header}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Generate, schedule, and download comprehensive business reports
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AssessmentIcon />}
          onClick={handleOpenGenerateModal}
          size="large"
          sx={{ height: 'fit-content' }}
        >
          Generate Report
        </Button>
      </Box>

      {/* Quick Stats Cards */}
      {dashboardStats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={styles.statCard}>
              <Typography variant="body2" color="text.secondary">
                Trades (30 days)
              </Typography>
              <Typography variant="h4" sx={{ my: 1, fontWeight: 600 }}>
                {dashboardStats.trades.count}
              </Typography>
              <Chip 
                label={`UGX ${dashboardStats.trades.value.toLocaleString()}`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={styles.statCard}>
              <Typography variant="body2" color="text.secondary">
                Invoices
              </Typography>
              <Typography variant="h4" sx={{ my: 1, fontWeight: 600 }}>
                {dashboardStats.invoices.count}
              </Typography>
              <Chip 
                label={`${dashboardStats.invoices.overdue_count} Overdue`} 
                size="small" 
                color="error" 
                variant="outlined"
              />
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={styles.statCard}>
              <Typography variant="body2" color="text.secondary">
                Payments
              </Typography>
              <Typography variant="h4" sx={{ my: 1, fontWeight: 600 }}>
                {dashboardStats.payments.count}
              </Typography>
              <Chip 
                label={`UGX ${dashboardStats.payments.value.toLocaleString()}`} 
                size="small" 
                color="success" 
                variant="outlined"
              />
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={styles.statCard}>
              <Typography variant="body2" color="text.secondary">
                Active Vouchers
              </Typography>
              <Typography variant="h4" sx={{ my: 1, fontWeight: 600 }}>
                {dashboardStats.vouchers.active_count}
              </Typography>
              <Chip 
                label={`${dashboardStats.deposits.quantity_kg.toLocaleString()} kg`} 
                size="small" 
                color="info" 
                variant="outlined"
              />
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs Section */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{ px: 2 }}
          >
            <Tab 
              icon={<DashboardIcon />} 
              iconPosition="start" 
              label="Dashboard" 
            />
            <Tab 
              icon={<AssessmentIcon />} 
              iconPosition="start" 
              label="Report Exports" 
            />
            <Tab 
              icon={<ScheduleIcon />} 
              iconPosition="start" 
              label="Scheduled Reports" 
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <ReportDashboardTab />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <ReportExportsTab />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <ReportSchedulesTab />
        </TabPanel>
      </Card>

      {/* Report Generator Modal */}
      <ReportGeneratorModal 
        handleClose={handleCloseModal}
        callBack={() => {
          if (activeTab === 1) {
            // Refresh exports tab
          }
        }}
      />
    </Box>
  );
};

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    mb: 3,
  },
  statCard: {
    p: 2.5,
    height: '100%',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: 4,
    },
  },
};

export default Reports;