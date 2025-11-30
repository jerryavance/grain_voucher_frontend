// src/pages/Trade/TradeDetails.tsx - FIXED VERSION with proper GRN/allocation visibility
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Chip,
  Paper,
  Tabs,
  Tab,
  Stack,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  LocalShipping as LocalShippingIcon,
  Delete as DeleteIcon,
  AssignmentTurnedIn as AllocateIcon,
} from "@mui/icons-material";
import { toast } from "react-hot-toast";
import { TradeService } from "./Trade.service";
import { ITrade } from "./Trade.interface";
import TradeStatusStepper from "./TradeStatusStepper";
import CostBreakdown from "./components/CostBreakdown";
import TradeCostForm from "./components/TradeCostForm";
import TradeBrokerageForm from "./components/TradeBrokerageForm";
import TradeFinancingForm from "./components/TradeFinancingForm";
import TradeLoanForm from "./components/TradeLoanForm";
import GRNForm from "./components/GRNForm";
import useTitle from "../../hooks/useTitle";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import TradeForm from "./TradeForm";
import DeliveryProgressCard from "./components/DeliveryProgressCard";
import GRNListWithInvoices from "./components/GRNListWithInvoices";
import DeliveryBatchForm from "./components/DeliveryBatchForm";
import VoucherAllocationDialog from "./components/VoucherAllocationDialog";
import { canCreateDelivery, getNextActionMessage } from "./tradeWorkflowHelper";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const TradeDetails = () => {
  const { tradeId } = useParams<{ tradeId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [trade, setTrade] = useState<ITrade | null>(null);
  const [loading, setLoading] = useState(true);
  
  // ✅ FIX: Get initial tab from URL query param
  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'delivery') return 7; // GRN/Delivery tab
    if (tab === 'vouchers') return 8; // New voucher allocation tab
    return 0;
  };
  
  const [tabValue, setTabValue] = useState(getInitialTab());

  const [openDeliveryForm, setOpenDeliveryForm] = useState(false);
  const [deliveryProgress, setDeliveryProgress] = useState<any>(null);

  // Modal states
  const [openCostForm, setOpenCostForm] = useState(false);
  const [openBrokerageForm, setOpenBrokerageForm] = useState(false);
  const [openFinancingForm, setOpenFinancingForm] = useState(false);
  const [openLoanForm, setOpenLoanForm] = useState(false);
  const [openGRNForm, setOpenGRNForm] = useState(false);
  const [openVoucherAllocation, setOpenVoucherAllocation] = useState(false); // ✅ NEW

  // Edit states
  const [editingCost, setEditingCost] = useState<any>(null);
  const [editingBrokerage, setEditingBrokerage] = useState<any>(null);
  const [openEditForm, setOpenEditForm] = useState(false);

  useTitle(trade ? `Trade ${trade.trade_number}` : "Trade Details");

  useEffect(() => {
    if (tradeId) fetchTradeDetails();
  }, [tradeId]);

  const fetchTradeDetails = async () => {
    try {
      setLoading(true);
      const data = await TradeService.getTradeDetails(tradeId!);
      setTrade(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to load trade");
      navigate("/admin/trade");
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryProgress = async () => {
    try {
      const data = await TradeService.getDeliveryProgress(tradeId!);
      setDeliveryProgress(data);
    } catch (error) {
      console.error("Failed to load delivery progress:", error);
    }
  };
  
  useEffect(() => {
    if (tradeId && trade && ['ready_for_delivery', 'in_transit', 'delivered'].includes(trade.status)) {
      fetchDeliveryProgress();
    }
  }, [tradeId, trade?.status]);

  const handleProgressStatus = async () => {
    try {
      await TradeService.progressStatus(tradeId!, { notes: "Progressed from details page" });
      toast.success("Status progressed successfully");
      fetchTradeDetails();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to progress status");
    }
  };

  // ✅ NEW: Voucher allocation handler
  const handleAllocateVouchers = async (payload: any) => {
    try {
      await TradeService.allocateVouchers(tradeId!, payload);
      toast.success("Vouchers allocated successfully");
      fetchTradeDetails();
      setOpenVoucherAllocation(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to allocate vouchers");
    }
  };

  const handleDeleteCost = async (costId: string) => {
    if (window.confirm("Are you sure you want to delete this cost?")) {
      try {
        await TradeService.deleteTradeCost(costId);
        toast.success("Cost deleted successfully");
        fetchTradeDetails();
      } catch (error: any) {
        toast.error("Failed to delete cost");
      }
    }
  };

  const handleDeleteBrokerage = async (brokerageId: string) => {
    if (window.confirm("Are you sure you want to delete this brokerage?")) {
      try {
        await TradeService.deleteBrokerage(brokerageId);
        toast.success("Brokerage deleted successfully");
        fetchTradeDetails();
      } catch (error: any) {
        toast.error("Failed to delete brokerage");
      }
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(value);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <ProgressIndicator />
      </Box>
    );
  }

  if (!trade) {
    return (
      <Box p={3}>
        <Typography>Trade not found</Typography>
      </Box>
    );
  }

  // ✅ CRITICAL: Determine what actions are available
  const showVoucherAllocation = trade.requires_voucher_allocation && !trade.allocation_complete;
  const showDeliveryCreation = canCreateDelivery(trade);

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: "lg", mx: "auto" }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        mb={4}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/admin/trade")}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
          >
            Back
          </Button>
          <Box>
            <Typography variant={isMobile ? "h5" : "h4"} fontWeight={700}>
              {trade.trade_number}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Created {new Date(trade.created_at).toLocaleDateString()}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
          <Chip label={trade.status_display} color="primary" />
          
          {/* ✅ CRITICAL: Show voucher allocation button when needed */}
          {showVoucherAllocation && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<AllocateIcon />}
              onClick={() => setOpenVoucherAllocation(true)}
              size="small"
            >
              Allocate Vouchers
            </Button>
          )}
          
          {trade.status === "draft" && (
            <Tooltip title="Edit Trade">
              <IconButton onClick={() => setOpenEditForm(true)} color="primary">
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {trade.status !== "completed" && trade.status !== "cancelled" && (
            <Button
              variant="contained"
              startIcon={<LocalShippingIcon />}
              onClick={handleProgressStatus}
              size="small"
            >
              Progress
            </Button>
          )}
        </Stack>
      </Stack>

      {/* ✅ Show warning if blocking issues exist */}
      {(showVoucherAllocation || (trade.requires_financing && !trade.financing_complete)) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Action Required:
          </Typography>
          <ul style={{ margin: "8px 0", paddingLeft: 20 }}>
            {showVoucherAllocation && (
              <li>
                <Typography variant="body2">
                  Allocate vouchers before progressing to delivery
                </Typography>
              </li>
            )}
            {trade.requires_financing && !trade.financing_complete && (
              <li>
                <Typography variant="body2">
                  Complete investor financing allocation
                </Typography>
              </li>
            )}
          </ul>
        </Alert>
      )}

      {/* Stepper */}
      <Card sx={{ mb: 4, borderRadius: 2, overflow: "hidden" }}>
        <CardContent sx={{ py: 5 }}>
          <TradeStatusStepper currentStatus={trade.status} />
        </CardContent>
      </Card>

      {/* Tabs + Content */}
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            px: { xs: 2, sm: 3 },
            pt: 1,
          }}
        >
          <Tab label="Overview" />
          <Tab label="Cost Breakdown" />
          <Tab label="Costs" />
          <Tab label="Brokerages" />
          <Tab label="Financing" />
          <Tab label="Loans" />
          <Tab label="Invoices" />
          <Tab label="Delivery & GRN" />
          {trade.requires_voucher_allocation && <Tab label="Voucher Allocation" />}
        </Tabs>

        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          {/* Overview Tab */}
          <TabPanel value={tabValue} index={0}>
            {/* ... existing overview content ... */}
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Parties
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { label: "Buyer", value: trade.buyer?.name },
                    { label: "Supplier", value: `${trade.supplier?.first_name} ${trade.supplier?.last_name}` },
                    { label: "Hub", value: trade.hub?.name },
                    { label: "Grain & Grade", value: `${trade.grain_type?.name} – ${trade.quality_grade?.name}` },
                  ].map((item) => (
                    <Grid item xs={12} sm={6} key={item.label}>
                      <Typography variant="body2" color="text.secondary">
                        {item.label}
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {item.value || "N/A"}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              {/* ... rest of overview ... */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Quantities
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { label: "Gross Tonnage", value: `${(trade.gross_tonnage / 1000).toFixed(2)} MT` },
                    { label: "Net Tonnage", value: `${(trade.net_tonnage / 1000).toFixed(2)} MT` },
                    { label: "Quantity (kg)", value: trade.quantity_kg.toLocaleString() + " kg" },
                    { label: "Bags", value: trade.quantity_bags || "N/A" },
                  ].map((item) => (
                    <Grid item xs={12} sm={6} key={item.label}>
                      <Typography variant="body2" color="text.secondary">
                        {item.label}
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {item.value}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Financial Summary
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { label: "Buying Price", value: `${formatCurrency(trade.buying_price)}/kg`, color: "error.main" },
                    { label: "Selling Price", value: `${formatCurrency(trade.selling_price)}/kg`, color: "success.main" },
                    { label: "Total Cost", value: formatCurrency(trade.total_trade_cost) },
                    { label: "Revenue", value: formatCurrency(trade.payable_by_buyer) },
                    { label: "Margin", value: formatCurrency(trade.margin), bold: true, color: "primary.main" },
                    { label: "ROI", value: `${trade.roi_percentage.toFixed(2)}%`, bold: true, color: "success.main" },
                  ].map((item) => (
                    <Grid item xs={6} sm={4} md={2} key={item.label}>
                      <Paper sx={{ p: 2, bgcolor: "background.default", borderRadius: 2, height: "100%" }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {item.label}
                        </Typography>
                        <Typography variant="h6" fontWeight={item.bold ? 700 : 600} color={item.color}>
                          {item.value}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {trade.loss_summary?.has_loss && (
                <Grid item xs={12}>
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600}>Loss Detected</Typography>
                    <Typography>Quantity Lost: {trade.loss_summary.quantity_kg.toFixed(2)} kg ({trade.loss_summary.percentage.toFixed(2)}%)</Typography>
                    <Typography>Cost of Loss: {formatCurrency(trade.loss_summary.cost)}</Typography>
                    {trade.loss_summary.reason && <Typography>Reason: {trade.loss_summary.reason}</Typography>}
                  </Alert>
                </Grid>
              )}

            </Grid>
          </TabPanel>

          {/* Other existing tabs 1-6 remain the same */}
          <TabPanel value={tabValue} index={1}>
            <CostBreakdown tradeId={trade.id} />
          </TabPanel>

          {/* ... Costs, Brokerages, Financing, Loans, Invoices tabs ... */}

          {/* ✅ FIXED: Delivery & GRN Tab - Tab Index 7 */}
          {/* Costs */}
          <TabPanel value={tabValue} index={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Additional Costs</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingCost(null); setOpenCostForm(true); }}>
                Add Cost
              </Button>
            </Stack>

            {trade.additional_costs && trade.additional_costs.length > 0 ? (
              <TableContainer component={Paper} sx={{ border: 1, borderColor: "divider" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Cost Type</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="center">Per Unit</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trade.additional_costs.map((cost: any) => (
                      <TableRow key={cost.id}>
                        <TableCell>{cost.cost_type}</TableCell>
                        <TableCell>{cost.description || "-"}</TableCell>
                        <TableCell align="right">{formatCurrency(cost.amount)}</TableCell>
                        <TableCell align="center">{cost.is_per_unit ? "Yes" : "No"}</TableCell>
                        <TableCell align="right">{formatCurrency(cost.total_amount || cost.amount)}</TableCell>
                        <TableCell align="center">
                          <IconButton size="small" onClick={() => { setEditingCost(cost); setOpenCostForm(true); }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDeleteCost(cost.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Paper sx={{ p: 8, textAlign: "center", bgcolor: "grey.50", borderRadius: 2 }}>
                <Typography color="text.secondary">No additional costs added yet</Typography>
              </Paper>
            )}
          </TabPanel>

          {/* Brokerages */}
          <TabPanel value={tabValue} index={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Brokerages</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingBrokerage(null); setOpenBrokerageForm(true); }}>
                Add Brokerage
              </Button>
            </Stack>

            {trade.brokerages && trade.brokerages.length > 0 ? (
              <TableContainer component={Paper} sx={{ border: 1, borderColor: "divider" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Agent</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Commission Value</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trade.brokerages.map((brokerage: any) => (
                      <TableRow key={brokerage.id}>
                        <TableCell>{brokerage.agent ? `${brokerage.agent.first_name} ${brokerage.agent.last_name}` : "N/A"}</TableCell>
                        <TableCell>{brokerage.commission_type}</TableCell>
                        <TableCell align="right">{brokerage.commission_value}</TableCell>
                        <TableCell align="right">{formatCurrency(brokerage.amount)}</TableCell>
                        <TableCell>{brokerage.notes || "-"}</TableCell>
                        <TableCell align="center">
                          <IconButton size="small" onClick={() => { setEditingBrokerage(brokerage); setOpenBrokerageForm(true); }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDeleteBrokerage(brokerage.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Paper sx={{ p: 8, textAlign: "center", bgcolor: "grey.50", borderRadius: 2 }}>
                <Typography color="text.secondary">No brokerages added</Typography>
              </Paper>
            )}
          </TabPanel>

          {/* Financing */}
          <TabPanel value={tabValue} index={4}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Typography variant="h6">Investor Financing</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Allocated: {formatCurrency(trade.total_financing_allocated || 0)}
                </Typography>
              </Box>
              {trade.requires_financing && !trade.financing_complete && (
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenFinancingForm(true)}>
                  Add Financing
                </Button>
              )}
            </Stack>
            {/* Table or empty state - same pattern */}
            {trade.financing_allocations && trade.financing_allocations.length > 0 ? (
              <TableContainer component={Paper} sx={{ border: 1, borderColor: "divider" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Investor</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Percentage</TableCell>
                      <TableCell align="right">Margin Earned</TableCell>
                      <TableCell align="right">Investor Share</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trade.financing_allocations.map((fin: any) => (
                      <TableRow key={fin.id}>
                        <TableCell>{fin.investor ? `${fin.investor.first_name} ${fin.investor.last_name}` : "N/A"}</TableCell>
                        <TableCell align="right">{formatCurrency(fin.allocated_amount)}</TableCell>
                        <TableCell align="right">{fin.allocation_percentage.toFixed(2)}%</TableCell>
                        <TableCell align="right">{formatCurrency(fin.margin_earned)}</TableCell>
                        <TableCell align="right">{formatCurrency(fin.investor_margin)}</TableCell>
                        <TableCell>{new Date(fin.allocation_date).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Paper sx={{ p: 8, textAlign: "center", bgcolor: "grey.50", borderRadius: 2 }}>
                <Typography color="text.secondary">
                  {trade.requires_financing ? "No financing allocated yet" : "This trade does not require investor financing"}
                </Typography>
              </Paper>
            )}
          </TabPanel>

          {/* Loans */}
          <TabPanel value={tabValue} index={5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Typography variant="h6">Trade Loans</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Loans: {formatCurrency(trade.total_loans || 0)}
                </Typography>
              </Box>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenLoanForm(true)}>
                Add Loan
              </Button>
            </Stack>
            {trade.loans && trade.loans.length > 0 ? (
              <TableContainer component={Paper} sx={{ border: 1, borderColor: "divider" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Investor</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Interest Rate</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell align="right">Total Due</TableCell>
                      <TableCell align="right">Outstanding</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trade.loans.map((loan: any) => (
                      <TableRow key={loan.id}>
                        <TableCell>{loan.investor ? `${loan.investor.first_name} ${loan.investor.last_name}` : "N/A"}</TableCell>
                        <TableCell align="right">{formatCurrency(loan.amount)}</TableCell>
                        <TableCell align="right">{loan.interest_rate}%</TableCell>
                        <TableCell>{new Date(loan.due_date).toLocaleDateString()}</TableCell>
                        <TableCell align="right">{formatCurrency(loan.total_due || 0)}</TableCell>
                        <TableCell align="right">{formatCurrency(loan.outstanding_balance || 0)}</TableCell>
                        <TableCell>
                          <Chip label={loan.status} size="small" color={loan.status === "repaid" ? "success" : loan.status === "active" ? "primary" : "default"} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Paper sx={{ p: 8, textAlign: "center", bgcolor: "grey.50", borderRadius: 2 }}>
                <Typography color="text.secondary">No loans for this trade</Typography>
              </Paper>
            )}
          </TabPanel>

          {/* Invoices */}
          <TabPanel value={tabValue} index={6}>
            {trade.invoices_list && trade.invoices_list.length > 0 ? (
              <Grid container spacing={3}>
                {trade.invoices_list.map((inv) => (
                  <Grid item xs={12} md={6} key={inv.id}>
                    <Paper sx={{ p: 3, height: "100%" }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>{inv.invoice_number}</Typography>
                          {inv.grn_number && <Typography variant="body2" color="text.secondary">GRN: {inv.grn_number}</Typography>}
                          <Typography variant="body2">Amount: {formatCurrency(inv.total_amount)}</Typography>
                          <Typography variant="body2" color="error.main">Due: {formatCurrency(inv.amount_due)}</Typography>
                        </Box>
                        <Chip label={inv.status} size="small" />
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper sx={{ p: 8, textAlign: "center", bgcolor: "grey.50", borderRadius: 2 }}>
                <Typography color="text.secondary" gutterBottom>No invoices generated yet</Typography>
                {trade.status === "delivered" && (
                  <Typography variant="body2" color="text.secondary">
                    Create a GRN to automatically generate an invoice
                  </Typography>
                )}
              </Paper>
            )}
          </TabPanel>

          {/* GRN */}
          {/* <TabPanel value={tabValue} index={7}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Goods Received Note</Typography>
              {trade.status === "in_transit" && !trade.grn && (
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenGRNForm(true)}>
                  Create GRN
                </Button>
              )}
            </Stack>

            {trade.grn ? (
              <Paper sx={{ p: 4 }}>
                <Typography>GRN details will be displayed here</Typography>
              </Paper>
            ) : (
              <Paper sx={{ p: 8, textAlign: "center", bgcolor: "grey.50", borderRadius: 2 }}>
                <Typography color="text.secondary">
                  {trade.status === "in_transit"
                    ? "No GRN created yet - Click 'Create GRN' to generate"
                    : "GRN can only be created when trade is in transit"}
                </Typography>
              </Paper>
            )}
          </TabPanel> */}
          <TabPanel value={tabValue} index={7}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Delivery Management
            </Typography>

            {/* ✅ Show based on trade status */}
            {['ready_for_delivery', 'in_transit', 'delivered', 'completed'].includes(trade.status) ? (
              <>
                {/* Delivery Progress Card */}
                {deliveryProgress?.delivery_summary && (
                  <DeliveryProgressCard
                    deliverySummary={deliveryProgress.delivery_summary}
                    onCreateDelivery={() => setOpenDeliveryForm(true)}
                  />
                )}

                {/* Next Steps Alert */}
                {deliveryProgress?.next_steps && deliveryProgress.next_steps.length > 0 && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Next Steps:
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {deliveryProgress.next_steps.map((step: string, idx: number) => (
                        <li key={idx}>
                          <Typography variant="body2">{step}</Typography>
                        </li>
                      ))}
                    </ul>
                  </Alert>
                )}

                {/* GRN List with Invoices */}
                {trade.grns && trade.grns.length > 0 ? (
                  <GRNListWithInvoices
                    grns={trade.grns}
                    onViewGRN={(grn) => console.log("View GRN:", grn)}
                    onRecordPayment={(invoiceId) => console.log("Record payment:", invoiceId)}
                  />
                ) : (
                  <Paper sx={{ p: 8, textAlign: "center", bgcolor: "grey.50", borderRadius: 2 }}>
                    <Typography color="text.secondary" gutterBottom>
                      No delivery batches created yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Click "Create New Delivery Batch" above to start deliveries
                    </Typography>
                  </Paper>
                )}
              </>
            ) : (
              <Alert severity="info">
                <Typography variant="body2">
                  Delivery management will be available when trade reaches 'ready_for_delivery' status.
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ mt: 1 }}>
                  Current status: {trade.status_display}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                  {getNextActionMessage(trade)}
                </Typography>
              </Alert>
            )}
          </TabPanel>

          {/* ✅ NEW: Voucher Allocation Tab - Tab Index 8 (if required) */}
          {trade.requires_voucher_allocation && (
            <TabPanel value={tabValue} index={8}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Voucher Allocation
              </Typography>

              {trade.allocation_complete ? (
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="body2" fontWeight={600}>
                    ✓ Vouchers allocated successfully
                  </Typography>
                  <Typography variant="body2">
                    {trade.vouchers_count} voucher(s) allocated for this trade
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="body2" fontWeight={600}>
                    Voucher allocation required
                  </Typography>
                  <Typography variant="body2">
                    This trade requires voucher allocation before delivery can begin.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AllocateIcon />}
                    onClick={() => setOpenVoucherAllocation(true)}
                    sx={{ mt: 2 }}
                  >
                    Allocate Vouchers Now
                  </Button>
                </Alert>
              )}

              {/* Show allocated vouchers if any */}
              {trade.vouchers_detail && trade.vouchers_detail.length > 0 && (
                <TableContainer component={Paper} sx={{ mt: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Voucher Number</TableCell>
                        <TableCell>Farmer</TableCell>
                        <TableCell align="right">Quantity (kg)</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {trade.vouchers_detail.map((voucher: any) => (
                        <TableRow key={voucher.id}>
                          <TableCell>{voucher.voucher_number}</TableCell>
                          <TableCell>{voucher.farmer_name}</TableCell>
                          <TableCell align="right">{voucher.quantity_kg?.toLocaleString()}</TableCell>
                          <TableCell>
                            <Chip label={voucher.status} size="small" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>
          )}
        </Box>
      </Paper>

      {/* Modals */}
      <TradeCostForm
        open={openCostForm}
        onClose={() => { setOpenCostForm(false); setEditingCost(null); }}
        tradeId={trade.id}
        onSuccess={fetchTradeDetails}
        initialValues={editingCost}
      />
      <TradeBrokerageForm
        open={openBrokerageForm}
        onClose={() => { setOpenBrokerageForm(false); setEditingBrokerage(null); }}
        tradeId={trade.id}
        onSuccess={fetchTradeDetails}
        initialValues={editingBrokerage}
      />
      <TradeFinancingForm
        open={openFinancingForm}
        onClose={() => setOpenFinancingForm(false)}
        tradeId={trade.id}
        onSuccess={fetchTradeDetails}
        tradeDetails={trade}
      />
      <TradeLoanForm
        open={openLoanForm}
        onClose={() => setOpenLoanForm(false)}
        tradeId={trade.id}
        onSuccess={fetchTradeDetails}
      />

      {/* ✅ Delivery Batch Form Dialog */}
      <DeliveryBatchForm
        open={openDeliveryForm}
        onClose={() => setOpenDeliveryForm(false)}
        tradeId={trade.id}
        tradeNumber={trade.trade_number}
        remainingQuantityKg={trade.remaining_quantity_kg}
        onSuccess={() => {
          fetchTradeDetails();
          fetchDeliveryProgress();
        }}
      />

      {/* ✅ NEW: Voucher Allocation Dialog */}
      {trade.requires_voucher_allocation && (
        <VoucherAllocationDialog
          open={openVoucherAllocation}
          onClose={() => setOpenVoucherAllocation(false)}
          tradeId={trade.id}
          tradeNumber={trade.trade_number}
          requiredQuantityKg={trade.quantity_kg}
          grainTypeId={trade.grain_type?.id}
          hubId={trade.hub?.id}
          onSuccess={handleAllocateVouchers}
        />
      )}

      {/* Edit Trade Form */}
      {openEditForm && (
        <TradeForm
          callBack={fetchTradeDetails}
          formType="Update"
          handleClose={() => setOpenEditForm(false)}
          initialValues={trade}
        />
      )}
    </Box>
  );
};

export default TradeDetails;