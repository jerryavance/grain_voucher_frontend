// TradeDetails.tsx
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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import { toast } from "react-hot-toast";
import { ITrade, ICostBreakdown, ITradeCost, IBrokerage, IGoodsReceivedNote } from "./Trade.interface";
import { TradeService } from "./Trade.service";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import TradeCostForm from "./TradeCostForm";
import BrokerageForm from "./BrokerageForm";
import GRNForm from "./GRNForm";
import TradeStatusUpdateForm from "./TradeStatusUpdateForm";
import { useModalContext } from "../../contexts/ModalDialogContext";

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
  }).format(amount);
};

const TradeDetails: FC<ITradeDetailsProps> = ({ trade: initialTrade, onClose, onRefresh }) => {
  const { setShowModal } = useModalContext();
  const [activeTab, setActiveTab] = useState(0);
  const [trade, setTrade] = useState<ITrade>(initialTrade);
  const [costBreakdown, setCostBreakdown] = useState<ICostBreakdown | null>(null);
  const [tradeCosts, setTradeCosts] = useState<ITradeCost[]>([]);
  const [brokerages, setBrokerages] = useState<IBrokerage[]>([]);
  const [grns, setGrns] = useState<IGoodsReceivedNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCost, setEditingCost] = useState<ITradeCost | null>(null);
  const [editingBrokerage, setEditingBrokerage] = useState<IBrokerage | null>(null);
  const [showStatusUpdateForm, setShowStatusUpdateForm] = useState(false);

  useEffect(() => {
    fetchTradeDetails();
  }, [initialTrade.id]);

  const fetchTradeDetails = async () => {
    setLoading(true);
    try {
      const [tradeData, breakdown, costs, brokerage, grnData] = await Promise.all([
        TradeService.getTradeDetails(initialTrade.id),
        TradeService.getCostBreakdown(initialTrade.id),
        TradeService.getTradeCosts(initialTrade.id),
        TradeService.getBrokerages({ trade: initialTrade.id }),
        TradeService.getGRNs({ trade: initialTrade.id }),
      ]);

      setTrade(tradeData);
      setCostBreakdown(breakdown);
      setTradeCosts(costs);
      setBrokerages(brokerage);
      setGrns(grnData);
    } catch (error: any) {
      toast.error("Failed to fetch trade details");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAddCost = () => {
    setEditingCost(null);
    setShowModal(true);
  };

  const handleEditCost = (cost: ITradeCost) => {
    setEditingCost(cost);
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
    setShowModal(true);
  };

  const handleEditBrokerage = (brokerage: IBrokerage) => {
    setEditingBrokerage(brokerage);
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

  return (
    <Box>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={onClose}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Trade Details</Typography>
        <Chip label={trade.status_display} color="primary" sx={{ ml: 2 }} />
        
        {!['completed', 'cancelled'].includes(trade.status) && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setShowStatusUpdateForm(true)}
            sx={{ ml: 'auto' }}
          >
            Update Status
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Trade Number</Typography>
            <Typography variant="h6">{trade.trade_number}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Buyer</Typography>
            <Typography variant="h6">{trade.buyer?.name || trade.buyer_name}</Typography>
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
            <Typography>{Number(trade.quantity_mt).toFixed(2)} MT ({Number(trade.quantity_kg).toFixed(0)} kg)</Typography>
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
          <Tab label="Costs" />
          <Tab label="Brokerage" />
          <Tab label="Logistics" />
          <Tab label="Vouchers" />
          <Tab label="GRN" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Pricing</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Purchase Price/kg</Typography>
                    <Typography variant="h6">{formatCurrency(trade.purchase_price_per_kg)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Selling Price/kg</Typography>
                    <Typography variant="h6">{formatCurrency(trade.buyer_price_per_kg)}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Total Revenue</Typography>
                    <Typography variant="h5" color="primary">{formatCurrency(trade.total_revenue)}</Typography>
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
                    <Typography variant="h6" color="success.main">{formatCurrency(trade.gross_profit)}</Typography>
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

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Trade Information</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="caption" color="text.secondary">Initiated By</Typography>
                    <Typography>{trade.initiated_by_name || "N/A"}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="caption" color="text.secondary">Created Date</Typography>
                    <Typography>{formatDateToDDMMYYYY(trade.created_at)}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="caption" color="text.secondary">Expected Delivery</Typography>
                    <Typography>
                      {trade.expected_delivery_date ? formatDateToDDMMYYYY(trade.expected_delivery_date) : "N/A"}
                    </Typography>
                  </Grid>
                  {trade.remarks && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Remarks</Typography>
                      <Typography>{trade.remarks}</Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {costBreakdown && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Cost Breakdown</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Purchase Cost</TableCell>
                          <TableCell align="right">{formatCurrency(costBreakdown.total_purchase_cost)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Aflatoxin/QA Cost</TableCell>
                          <TableCell align="right">{formatCurrency(costBreakdown.aflatoxin_qa_cost)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Weighbridge Cost</TableCell>
                          <TableCell align="right">{formatCurrency(costBreakdown.weighbridge_cost)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Loading Cost</TableCell>
                          <TableCell align="right">{formatCurrency(costBreakdown.loading_cost)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Offloading Cost</TableCell>
                          <TableCell align="right">{formatCurrency(costBreakdown.offloading_cost)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Transport Cost</TableCell>
                          <TableCell align="right">{formatCurrency(costBreakdown.transport_cost_total)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Financing Cost</TableCell>
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
                          <TableCell>Other Costs</TableCell>
                          <TableCell align="right">{formatCurrency(costBreakdown.other_costs)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Brokerage Costs</TableCell>
                          <TableCell align="right">{formatCurrency(costBreakdown.brokerage_costs)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Additional Costs</TableCell>
                          <TableCell align="right">{formatCurrency(costBreakdown.additional_costs)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Total Costs</strong></TableCell>
                          <TableCell align="right"><strong>{formatCurrency(costBreakdown.total_costs)}</strong></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Total Revenue</strong></TableCell>
                          <TableCell align="right"><strong>{formatCurrency(costBreakdown.total_revenue)}</strong></TableCell>
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
            </Grid>
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
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
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
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
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
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

      <TabPanel value={activeTab} index={5}>
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
                          <TableCell align="right">Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {trade.vouchers_detail.map((voucher) => (
                          <TableRow key={voucher.id}>
                            <TableCell>{voucher.voucher_number}</TableCell>
                            <TableCell>
                              <Chip label={voucher.status} size="small" />
                            </TableCell>
                            <TableCell align="right">{formatCurrency(voucher.current_value)}</TableCell>
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
              <Typography color="text.secondary">
                Vouchers not yet allocated. Trade must be approved before allocation.
              </Typography>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={activeTab} index={6}>
        <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => setShowModal(true)}
            disabled={trade.status !== 'in_transit'}
          >
            Create GRN
          </Button>
        </Box>
        {grns.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary">
              No Goods Received Note created yet
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

        <GRNForm
          trade={trade}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchTradeDetails();
          }}
        />
      </TabPanel>

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
</Box>
);
};

export default TradeDetails;