// TradeDetails.tsx - UPDATED with Financing Tab
import React, { FC, useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Tabs,
  Tab,
  Divider,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PaymentIcon from "@mui/icons-material/Payment";
import { toast } from "react-hot-toast";
import { ITrade, ICostBreakdown, ITradeCost, IBrokerage, IGoodsReceivedNote, ITradeFinancing, ITradeLoan } from "./Trade.interface";
import { TradeService } from "./Trade.service";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import TradeCostForm from "./TradeCostForm";
import BrokerageForm from "./BrokerageForm";
import GRNForm from "./GRNForm";
import TradeStatusUpdateForm from "./TradeStatusUpdateForm";
import TradeFinancingForm from "./TradeFinancingForm";
import VoucherAllocationForm from "./VoucherAllocationForm";
import PaymentRecordForm from "./PaymentRecordForm";
import { useModalContext } from "../../contexts/ModalDialogContext";



// Add this to TradeDetails.tsx in the Payments Tab section
import InvoiceInfoDisplay from './InvoiceInfoDisplay';
import { getInvoiceInfoFromPaymentTerms } from './TradeFormFields';



interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`trade-details-tabpanel-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

interface ITradeDetailsProps {
  trade: ITrade;
  onClose: () => void;
  onRefresh: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

const TradeDetails: FC<ITradeDetailsProps> = ({ trade: initialTrade, onClose, onRefresh }) => {
  const { setShowModal } = useModalContext();
  const [activeTab, setActiveTab] = useState(0);
  const [trade, setTrade] = useState<ITrade>(initialTrade);
  const [costBreakdown, setCostBreakdown] = useState<ICostBreakdown | null>(null);
  const [tradeCosts, setTradeCosts] = useState<ITradeCost[]>([]);
  const [brokerages, setBrokerages] = useState<IBrokerage[]>([]);
  const [grns, setGrns] = useState<IGoodsReceivedNote[]>([]);
  const [financing, setFinancing] = useState<ITradeFinancing[]>([]);
  const [loans, setLoans] = useState<ITradeLoan[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCost, setEditingCost] = useState<ITradeCost | null>(null);
  const [editingBrokerage, setEditingBrokerage] = useState<IBrokerage | null>(null);
  const [showStatusUpdateForm, setShowStatusUpdateForm] = useState(false);
  const [showCostForm, setShowCostForm] = useState(false);  // ✅ ADD
  const [showBrokerageForm, setShowBrokerageForm] = useState(false);  // ✅ ADD
  const [showFinancingForm, setShowFinancingForm] = useState(false);
  const [showAllocationForm, setShowAllocationForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showGRNForm, setShowGRNForm] = useState(false);



  // Inside the component, add:
  const invoiceInfo = getInvoiceInfoFromPaymentTerms(trade.payment_terms);




  useEffect(() => {
    fetchTradeDetails();
  }, [initialTrade.id]);

  const fetchTradeDetails = async () => {
    setLoading(true);
    try {
      const [tradeData, breakdown, costs, brokerage, grnData, financingData, loansData] = await Promise.all([
        TradeService.getTradeDetails(initialTrade.id),
        TradeService.getCostBreakdown(initialTrade.id).catch(() => null),
        TradeService.getTradeCosts(initialTrade.id),
        TradeService.getBrokerages({ trade: initialTrade.id }),
        TradeService.getGRNs({ trade: initialTrade.id }),
        TradeService.getTradeFinancing({ trade: initialTrade.id }).catch(() => []),
        TradeService.getTradeLoans({ trade: initialTrade.id }).catch(() => []),
      ]);

      setTrade(tradeData);
      setCostBreakdown(breakdown);
      setTradeCosts(costs);
      setBrokerages(brokerage);
      setGrns(grnData);
      setFinancing(financingData);
      setLoans(loansData);
    } catch (error: any) {
      toast.error("Failed to fetch trade details");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleApprove = async () => {
    const notes = window.prompt("Approval notes (optional):");
    if (notes === null) return;

    try {
      await TradeService.approveTrade(trade.id, { notes });
      toast.success("Trade approved successfully");
      fetchTradeDetails();
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to approve trade");
    }
  };

  const handleReject = async () => {
    const reason = window.prompt("Enter rejection reason:");
    if (!reason) {
      toast.error("Rejection reason is required");
      return;
    }

    try {
      await TradeService.rejectTrade(trade.id, { notes: reason });
      toast.success("Trade rejected");
      fetchTradeDetails();
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to reject trade");
    }
  };

  const handleAllocateVouchers = () => {
    setShowAllocationForm(true);
    setShowModal(true);
  };

  const handleAddCost = () => {
    setEditingCost(null);
    setShowCostForm(true);  // ✅ ADD
    setShowModal(true);
  };

  const handleEditCost = (cost: ITradeCost) => {
    setEditingCost(cost);
    setShowCostForm(true);  // ✅ ADD
    setShowModal(true);
  };

  const handleDeleteCost = async (costId: string) => {
    if (!window.confirm("Delete this cost?")) return;

    try {
      await TradeService.deleteTradeCost(costId);
      toast.success("Cost deleted");
      fetchTradeDetails();
    } catch (error: any) {
      toast.error("Failed to delete cost");
    }
  };

  const handleAddBrokerage = () => {
    setEditingBrokerage(null);
    setShowBrokerageForm(true);  // ✅ ADD
    setShowModal(true);
  };

  const handleEditBrokerage = (brokerage: IBrokerage) => {
    setEditingBrokerage(brokerage);
    setShowBrokerageForm(true);  // ✅ ADD
    setShowModal(true);
  };

  const handleDeleteBrokerage = async (brokerageId: string) => {
    if (!window.confirm("Delete this brokerage?")) return;

    try {
      await TradeService.deleteBrokerage(brokerageId);
      toast.success("Brokerage deleted");
      fetchTradeDetails();
    } catch (error: any) {
      toast.error("Failed to delete brokerage");
    }
  };

  const handleDownloadGRN = async (grnId: string) => {
    try {
      const blob = await TradeService.downloadGRNPDF(grnId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `GRN_${grnId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error("Failed to download GRN");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <ProgressIndicator />
      </Box>
    );
  }

  const canApprove = trade.status === 'pending_approval';
  const canAllocateFinancing = trade.status === 'approved' && trade.requires_financing && !trade.financing_complete;
  const canAllocateVouchers = ['approved', 'pending_allocation'].includes(trade.status) && !trade.allocation_complete;
  const canRecordPayment = ['delivered', 'completed'].includes(trade.status) && trade.amount_due > 0;
  const canCreateGRN = trade.status === 'in_transit';

  return (
    <Box>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2, flexWrap: 'wrap' }}>
        <IconButton onClick={onClose}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Trade Details</Typography>
        <Chip label={trade.status_display} color="primary" />
        
        {trade.requires_financing && (
          <Chip 
            label={trade.financing_complete ? "Financing Complete" : "Requires Financing"} 
            color={trade.financing_complete ? "success" : "warning"}
            size="small"
          />
        )}
        
        {trade.allocation_complete && (
          <Chip label="Vouchers Allocated" color="success" size="small" />
        )}
        
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {canApprove && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={handleApprove}
              >
                Approve
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleReject}
              >
                Reject
              </Button>
            </>
          )}
          
          {canAllocateFinancing && (
            <Button
              variant="contained"
              color="info"
              startIcon={<AccountBalanceIcon />}
              onClick={() => {
                setShowFinancingForm(true);
                setShowModal(true);
              }}
            >
              Allocate Financing
            </Button>
          )}
          
          {canAllocateVouchers && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AssignmentIcon />}
              onClick={handleAllocateVouchers}
            >
              Allocate Vouchers
            </Button>
          )}
          
          {canRecordPayment && (
            <Button
              variant="contained"
              color="success"
              startIcon={<PaymentIcon />}
              onClick={() => {
                setShowPaymentForm(true);
                setShowModal(true);
              }}
            >
              Record Payment
            </Button>
          )}
          
          {!['completed', 'cancelled'].includes(trade.status) && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setShowStatusUpdateForm(true)}
            >
              Update Status
            </Button>
          )}
        </Box>
      </Box>

      {/* Workflow Status Alert */}
      {trade.requires_financing && !trade.financing_complete && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          This trade requires investor financing before vouchers can be allocated.
        </Alert>
      )}

      {!trade.inventory_available && trade.status === 'approved' && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Insufficient inventory available for this trade. Voucher allocation may fail.
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Trade Number</Typography>
            <Typography variant="h6">{trade.trade_number}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">GRN Number</Typography>
            <Typography variant="h6">{trade.grn_number || "Not generated"}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Buyer</Typography>
            <Typography variant="h6">{trade.buyer?.name || trade.buyer_name}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Supplier</Typography>
            <Typography variant="h6">
              {trade.supplier ? `${trade.supplier.first_name} ${trade.supplier.last_name}` : "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary">Grain Type</Typography>
            <Typography>{trade.grain_type?.name || trade.grain_type_name}</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary">Quality Grade</Typography>
            <Typography>{trade.quality_grade?.name || trade.quality_grade_name}</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary">Quantity</Typography>
            <Typography>
              {Number(trade.net_tonnage).toFixed(2)} MT ({Number(trade.quantity_kg).toFixed(0)} kg)
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary">Hub</Typography>
            <Typography>{trade.hub?.name || trade.hub_name}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Financials" />
          <Tab label="Financing" />
          <Tab label="Costs" />
          <Tab label="Brokerage" />
          <Tab label="Logistics" />
          <Tab label="Vouchers" />
          <Tab label="GRN" />
          <Tab label="Payments" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Pricing</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Buying Price/kg</Typography>
                    <Typography variant="h6">{formatCurrency(trade.buying_price)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Selling Price/kg</Typography>
                    <Typography variant="h6">{formatCurrency(trade.selling_price)}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Total Revenue</Typography>
                    <Typography variant="h5" color="primary">{formatCurrency(trade.payable_by_buyer)}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Profitability</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Gross Profit</Typography>
                    <Typography variant="h6" color="success.main">{formatCurrency(trade.margin)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">ROI</Typography>
                    <Typography variant="h6">{Number(trade.roi_percentage).toFixed(2)}%</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Gross Margin</Typography>
                    <Typography variant="h5">{Number(trade.gross_margin_percentage).toFixed(2)}%</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Financials Tab */}
      <TabPanel value={activeTab} index={1}>
        {costBreakdown && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Cost Breakdown</Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Purchase Cost</TableCell>
                      <TableCell align="right">{formatCurrency(costBreakdown.purchase_cost)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Aflatoxin/QA</TableCell>
                      <TableCell align="right">{formatCurrency(costBreakdown.aflatoxin_qa_cost)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Weighbridge</TableCell>
                      <TableCell align="right">{formatCurrency(costBreakdown.weighbridge_cost)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Loading</TableCell>
                      <TableCell align="right">{formatCurrency(costBreakdown.loading_cost)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Offloading</TableCell>
                      <TableCell align="right">{formatCurrency(costBreakdown.offloading_cost)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Transport</TableCell>
                      <TableCell align="right">{formatCurrency(costBreakdown.transport_cost)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Financing</TableCell>
                      <TableCell align="right">{formatCurrency(costBreakdown.financing_cost)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>GIT Insurance</TableCell>
                      <TableCell align="right">{formatCurrency(costBreakdown.git_insurance_cost)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Deductions</TableCell>
                      <TableCell align="right">{formatCurrency(costBreakdown.deduction_cost)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Other Expenses</TableCell>
                      <TableCell align="right">{formatCurrency(costBreakdown.other_expenses)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>AMSAF Fees</TableCell>
                      <TableCell align="right">{formatCurrency(costBreakdown.amsaf_fees)}</TableCell>
                    </TableRow>

                    {/* Brokerage Costs */}
                    {Array.isArray(costBreakdown.brokerage_costs) && costBreakdown.brokerage_costs.length > 0 && (
                      <>
                        <TableRow>
                          <TableCell colSpan={2}><strong>Brokerage</strong></TableCell>
                        </TableRow>
                        {costBreakdown.brokerage_costs.map((b, index) => (
                          <TableRow key={`broker-${index}`}>
                            <TableCell sx={{ pl: 4 }}>
                              {b.agent} ({b.commission_type})
                              {b.notes && <Typography variant="caption" display="block">{b.notes}</Typography>}
                            </TableCell>
                            <TableCell align="right">{formatCurrency(b.amount)}</TableCell>
                          </TableRow>
                        ))}
                      </>
                    )}

                    {/* Additional Costs */}
                    {Array.isArray(costBreakdown.additional_costs) && costBreakdown.additional_costs.length > 0 && (
                      <>
                        <TableRow>
                          <TableCell colSpan={2}><strong>Additional Costs</strong></TableCell>
                        </TableRow>
                        {costBreakdown.additional_costs.map((a, index) => (
                          <TableRow key={`addcost-${index}`}>
                            <TableCell sx={{ pl: 4 }}>
                              {a.cost_type}
                              {a.description && <Typography variant="caption" display="block">{a.description}</Typography>}
                            </TableCell>
                            <TableCell align="right">{formatCurrency(a.total)}</TableCell>
                          </TableRow>
                        ))}
                      </>
                    )}

                    {/* Totals */}
                    <TableRow>
                      <TableCell><strong>Total Trade Cost</strong></TableCell>
                      <TableCell align="right"><strong>{formatCurrency(costBreakdown.total_trade_cost)}</strong></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Payable by Buyer</strong></TableCell>
                      <TableCell align="right"><strong>{formatCurrency(costBreakdown.payable_by_buyer)}</strong></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Margin</strong></TableCell>
                      <TableCell align="right"><strong>{formatCurrency(costBreakdown.margin)}</strong></TableCell>
                    </TableRow>
                    <TableRow sx={{ bgcolor: 'success.light' }}>
                      <TableCell><strong>Net Profit</strong></TableCell>
                      <TableCell align="right"><strong>{formatCurrency(costBreakdown.net_profit)}</strong></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </TabPanel>


      {/* Financing Tab (NEW) */}
      <TabPanel value={activeTab} index={2}>
        <Box sx={{ mb: 2 }}>
          <Alert severity={trade.requires_financing ? "info" : "success"}>
            {trade.requires_financing ? (
              <>
                This trade requires investor financing.
                {trade.financing_complete ? " Financing is complete." : " Financing allocation pending."}
              </>
            ) : (
              "This trade is self-financed and does not require investor allocation."
            )}
          </Alert>
        </Box>

        {trade.requires_financing && (
          <>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Financing Summary</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Total Trade Cost</Typography>
                    <Typography variant="h6">{formatCurrency(trade.total_trade_cost)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Allocated Financing</Typography>
                    <Typography variant="h6" color={trade.financing_complete ? "success.main" : "warning.main"}>
                      {formatCurrency(trade.total_financing_allocated || 0)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {financing.length > 0 && (
              <Paper sx={{ mb: 3 }}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Investor Financing Allocations</Typography>
                  <Divider sx={{ mb: 2 }} />
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Investor</TableCell>
                        <TableCell align="right">Allocated Amount</TableCell>
                        <TableCell align="right">Percentage</TableCell>
                        <TableCell align="right">Margin Earned</TableCell>
                        <TableCell align="right">Investor Share</TableCell>
                        <TableCell align="right">AMSAF Share</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {financing.map((fin) => (
                        <TableRow key={fin.id}>
                          <TableCell>
                            {fin.investor ? `${fin.investor.first_name} ${fin.investor.last_name}` : 'N/A'}
                          </TableCell>
                          <TableCell align="right">{formatCurrency(fin.allocated_amount)}</TableCell>
                          <TableCell align="right">{Number(fin.allocation_percentage).toFixed(2)}%</TableCell>
                          <TableCell align="right">{formatCurrency(fin.margin_earned)}</TableCell>
                          <TableCell align="right">{formatCurrency(fin.investor_margin)}</TableCell>
                          <TableCell align="right">{formatCurrency(fin.amsaf_margin)}</TableCell>
                          <TableCell>{formatDateToDDMMYYYY(fin.allocation_date)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}

            {loans.length > 0 && (
              <Paper>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Trade Loans</Typography>
                  <Divider sx={{ mb: 2 }} />
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Investor</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">Interest Rate</TableCell>
                        <TableCell align="right">Amount Repaid</TableCell>
                        <TableCell align="right">Outstanding</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loans.map((loan) => (
                        <TableRow key={loan.id}>
                          <TableCell>
                            {loan.investor ? `${loan.investor.first_name} ${loan.investor.last_name}` : 'N/A'}
                          </TableCell>
                          <TableCell align="right">{formatCurrency(loan.amount)}</TableCell>
                          <TableCell align="right">{Number(loan.interest_rate).toFixed(2)}%</TableCell>
                          <TableCell align="right">{formatCurrency(loan.amount_repaid)}</TableCell>
                          <TableCell align="right">{formatCurrency(loan.outstanding_balance)}</TableCell>
                          <TableCell>{formatDateToDDMMYYYY(loan.due_date)}</TableCell>
                          <TableCell>
                            <Chip label={loan.status} size="small" color={loan.status === 'repaid' ? 'success' : 'warning'} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </>
        )}
      </TabPanel>

      {/* Costs Tab */}
      <TabPanel value={activeTab} index={3}>
        <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddCost}>
            Add Cost
          </Button>
        </Box>
        <TableContainer component={Paper}>
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
              {tradeCosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">No additional costs</TableCell>
                </TableRow>
              ) : (
                tradeCosts.map((cost) => (
                  <TableRow key={cost.id}>
                    <TableCell>{cost.cost_type}</TableCell>
                    <TableCell>{cost.description || "-"}</TableCell>
                    <TableCell align="right">{formatCurrency(cost.amount)}</TableCell>
                    <TableCell align="center">{cost.is_per_unit ? "Yes" : "No"}</TableCell>
                    <TableCell align="right">{formatCurrency(cost.total_amount)}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleEditCost(cost)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteCost(cost.id)}>
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {editingCost !== null && (
          <TradeCostForm
            tradeId={trade.id}
            initialValues={editingCost}
            onClose={() => {
              setShowModal(false);
              setEditingCost(null);
            }}
            onSuccess={() => {
              setShowModal(false);
              setEditingCost(null);
              fetchTradeDetails();
            }}
          />
        )}
      </TabPanel>

      {/* Brokerage Tab */}
      <TabPanel value={activeTab} index={4}>
        <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddBrokerage}>
            Add Brokerage
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Agent</TableCell>
                <TableCell>Commission Type</TableCell>
                <TableCell align="right">Commission Value</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {brokerages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">No brokerage commissions</TableCell>
                </TableRow>
              ) : (
                brokerages.map((brokerage) => (
                  <TableRow key={brokerage.id}>
                    <TableCell>
                      {`${brokerage.agent.first_name} ${brokerage.agent.last_name}`}
                    </TableCell>
                    <TableCell>{brokerage.commission_type}</TableCell>
                    <TableCell align="right">{brokerage.commission_value}</TableCell>
                    <TableCell align="right">{formatCurrency(brokerage.amount)}</TableCell>
                    <TableCell>{brokerage.notes || "-"}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleEditBrokerage(brokerage)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteBrokerage(brokerage.id)}>
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {editingBrokerage !== null && (
          <BrokerageForm
            tradeId={trade.id}
            initialValues={editingBrokerage}
            onClose={() => {
              setShowModal(false);
              setEditingBrokerage(null);
            }}
            onSuccess={() => {
              setShowModal(false);
              setEditingBrokerage(null);
              fetchTradeDetails();
            }}
          />
        )}
      </TabPanel>

      {/* Logistics Tab */}
      <TabPanel value={activeTab} index={5}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Delivery Information</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Delivery Location</Typography>
                    <Typography>{trade.delivery_location}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Distance</Typography>
                    <Typography>{trade.delivery_distance_km ? `${trade.delivery_distance_km} km` : "N/A"}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Expected Delivery</Typography>
                    <Typography>
                      {trade.expected_delivery_date ? formatDateToDDMMYYYY(trade.expected_delivery_date) : "N/A"}
                    </Typography>
                  </Grid>
                  {trade.actual_delivery_date && (
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Actual Delivery</Typography>
                      <Typography>{formatDateToDDMMYYYY(trade.actual_delivery_date)}</Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Transport Details</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Vehicle Number</Typography>
                    <Typography>{trade.vehicle_number || "N/A"}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Driver Name</Typography>
                    <Typography>{trade.driver_name || "N/A"}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Driver Phone</Typography>
                    <Typography>{trade.driver_phone || "N/A"}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Driver ID</Typography>
                    <Typography>{trade.driver_id || "N/A"}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {(trade.gross_weight_kg || trade.net_weight_kg) && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Weight Details</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">Gross Weight</Typography>
                      <Typography>{trade.gross_weight_kg ? `${trade.gross_weight_kg} kg` : "N/A"}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">Tare Weight</Typography>
                      <Typography>{trade.tare_weight_kg ? `${trade.tare_weight_kg} kg` : "N/A"}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">Net Weight</Typography>
                      <Typography>{trade.net_weight_kg ? `${trade.net_weight_kg} kg` : "N/A"}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* Vouchers Tab */}
      <TabPanel value={activeTab} index={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Allocated Vouchers</Typography>
            <Divider sx={{ mb: 2 }} />
            {trade.allocation_complete ? (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Total Vouchers: {trade.vouchers_count}
                </Typography>
                {trade.vouchers_detail && trade.vouchers_detail.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Voucher Number</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Quantity (kg)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {trade.vouchers_detail.map((voucher) => (
                          <TableRow key={voucher.id}>
                            <TableCell>{voucher.voucher_number}</TableCell>
                            <TableCell>
                              <Chip label={voucher.status} size="small" />
                            </TableCell>
                            <TableCell align="right">
                              {/* ✅ FIXED: Convert to Number before calling toFixed */}
                              {voucher.deposit?.quantity_kg
                                ? Number(voucher.deposit.quantity_kg).toFixed(2)
                                : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography>No voucher details available</Typography>
                )}
              </>
            ) : (
              <Alert severity="warning">
                Vouchers not yet allocated. 
                {trade.requires_financing && !trade.financing_complete 
                  ? " Complete financing allocation first." 
                  : " Trade must be approved before allocation."}
              </Alert>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* GRN Tab */}
      <TabPanel value={activeTab} index={7}>
        <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => {
              setShowGRNForm(true);
              setShowModal(true);
            }}
            disabled={!canCreateGRN}
          >
            Create GRN
          </Button>
        </Box>
        {grns.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary">
              No Goods Received Note created yet
              {canCreateGRN && " - Create one to document delivery"}
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {grns.map((grn) => (
              <Grid item xs={12} key={grn.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                      <Typography variant="h6">GRN: {grn.grn_number}</Typography>
                      <IconButton onClick={() => handleDownloadGRN(grn.id)}>
                        <DownloadIcon />
                      </IconButton>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="caption" color="text.secondary">Loading Date</Typography>
                        <Typography>{formatDateToDDMMYYYY(grn.loading_date)}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="caption" color="text.secondary">Delivery Date</Typography>
                        <Typography>{formatDateToDDMMYYYY(grn.delivery_date)}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="caption" color="text.secondary">Delivered To</Typography>
                        <Typography>{grn.delivered_to_name}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="caption" color="text.secondary">Vehicle Number</Typography>
                        <Typography>{grn.vehicle_number}</Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="caption" color="text.secondary">Gross Weight</Typography>
                        <Typography>{grn.gross_weight_kg} kg</Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="caption" color="text.secondary">Tare Weight</Typography>
                        <Typography>{grn.tare_weight_kg || "N/A"} kg</Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="caption" color="text.secondary">Net Weight</Typography>
                        <Typography fontWeight="bold">{grn.net_weight_kg} kg</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Payments Tab (NEW) */}
      <TabPanel value={activeTab} index={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Payment Status</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Typography variant="caption" color="text.secondary">Total Amount</Typography>
                <Typography variant="h6">{formatCurrency(trade.payable_by_buyer)}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="caption" color="text.secondary">Amount Paid</Typography>
                <Typography variant="h6" color="success.main">{formatCurrency(trade.amount_paid)}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="caption" color="text.secondary">Amount Due</Typography>
                <Typography variant="h6" color="error.main">{formatCurrency(trade.amount_due)}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="caption" color="text.secondary">Payment Status</Typography>
                <Chip label={trade.payment_status_display || trade.payment_status} color="primary" />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Payment Terms</Typography>
                <Typography>{trade.payment_terms_display || trade.payment_terms}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Payment Due Date</Typography>
                <Typography>{formatDateToDDMMYYYY(trade.payment_due_date)}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box sx={{ mt: 2 }}>
          <InvoiceInfoDisplay 
            invoiceInfo={invoiceInfo}
            variant="compact"
            showDetailedFlow={false}
          />
        </Box>


      </TabPanel>

      {/* Modal Forms */}
      {showStatusUpdateForm && (
        <TradeStatusUpdateForm
          trade={trade}
          onClose={() => setShowStatusUpdateForm(false)}
          onSuccess={() => {
            setShowStatusUpdateForm(false);
            fetchTradeDetails();
            onRefresh();
          }}
        />
      )}

      {showFinancingForm && (
        <TradeFinancingForm
          trade={trade}
          onClose={() => {
            setShowFinancingForm(false);
            setShowModal(false);
          }}
          onSuccess={() => {
            setShowFinancingForm(false);
            setShowModal(false);
            fetchTradeDetails();
            onRefresh();
          }}
        />
      )}

      {showAllocationForm && (
        <VoucherAllocationForm
          trade={trade}
          onClose={() => {
            setShowAllocationForm(false);
            setShowModal(false);
          }}
          onSuccess={() => {
            setShowAllocationForm(false);
            setShowModal(false);
            fetchTradeDetails();
            onRefresh();
          }}
        />
      )}

      {showPaymentForm && (
        <PaymentRecordForm
          trade={trade}
          onClose={() => {
            setShowPaymentForm(false);
            setShowModal(false);
          }}
          onSuccess={() => {
            setShowPaymentForm(false);
            setShowModal(false);
            fetchTradeDetails();
            onRefresh();
          }}
        />
      )}

      {showGRNForm && (
        <GRNForm
          trade={trade}
          onClose={() => {
            setShowGRNForm(false);
            setShowModal(false);
          }}
          onSuccess={() => {
            setShowGRNForm(false);
            setShowModal(false);
            fetchTradeDetails();
            onRefresh();
          }}
        />
      )}

      {/* ✅ FIXED: Cost Form */}
      {showCostForm && (
        <TradeCostForm
          tradeId={trade.id}
          initialValues={editingCost}
          onClose={() => {
            setShowModal(false);
            setShowCostForm(false);
            setEditingCost(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setShowCostForm(false);
            setEditingCost(null);
            fetchTradeDetails();
          }}
        />
      )}

      {/* ✅ FIXED: Brokerage Form */}
      {showBrokerageForm && (
        <BrokerageForm
          tradeId={trade.id}
          initialValues={editingBrokerage}
          onClose={() => {
            setShowModal(false);
            setShowBrokerageForm(false);
            setEditingBrokerage(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setShowBrokerageForm(false);
            setEditingBrokerage(null);
            fetchTradeDetails();
          }}
        />
      )}
    </Box>
  );
};

export default TradeDetails;