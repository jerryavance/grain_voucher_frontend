import { FC, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert, Box, Button, Card, CardContent, Chip, Divider, Grid,
  Tab, Tabs, TextField, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, FormHelperText,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ScaleIcon from "@mui/icons-material/Scale";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import StorefrontIcon from "@mui/icons-material/Storefront";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import EditIcon from "@mui/icons-material/Edit";
import useTitle from "../../hooks/useTitle";
import { SourcingService } from "./Sourcing.service";
import { ISourceOrder, IInvestorAccount, IAggregatorTradeCost } from "./Sourcing.interface";
import { formatCurrency, formatWeight, formatPercentage, ORDER_STATUS_COLORS } from "./SourcingConstants";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import { Span } from "../../components/Typography";
import LoadingScreen from "../../components/LoadingScreen";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { StandaloneDeliveryRecordForm, StandaloneWeighbridgeRecordForm, AggregatorTradeCostForm } from "./SourcingForms";

interface TabPanelProps { children?: React.ReactNode; index: number; value: number; }
function TabPanel({ children, value, index }: TabPanelProps) {
  return <div role="tabpanel" hidden={value !== index}>{value === index && <Box sx={{ p: 3 }}>{children}</Box>}</div>;
}

const LOGISTICS_LABELS: Record<string, string> = {
  supplier: "Supplier Arranged",
  supplier_driver: "Supplier Driver",
  bennu_truck: "Bennu Truck",
  third_party: "Third Party",
  company: "Company Arranged",
};

// ─── Investor Allocation Form ──────────────────────────────────────────────
const InvestorAllocationForm: FC<{
  open: boolean; order: ISourceOrder; handleClose: () => void; callBack?: () => void;
}> = ({ open, order, handleClose, callBack }) => {
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [investorAccounts, setInvestorAccounts] = useState<IInvestorAccount[]>([]);

  useEffect(() => {
    if (!open) return;
    setOptionsLoading(true);
    SourcingService.getInvestorAccounts()
      .then(r => setInvestorAccounts(r.results ?? (r as any)))
      .catch(() => toast.error("Failed to load investor accounts"))
      .finally(() => setOptionsLoading(false));
  }, [open]);

  const form = useFormik({
    initialValues: {
      investor_account: "",
      source_order: order.id,
      amount_allocated: order.total_cost,
      notes: "",
    },
    validationSchema: Yup.object({
      investor_account: Yup.string().required("Investor account is required"),
      amount_allocated: Yup.number()
        .typeError("Must be a number")
        .positive("Must be positive")
        .required("Amount is required"),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await SourcingService.createInvestorAllocation({
          investor_account: values.investor_account,
          source_order: values.source_order,
          amount_allocated: Number(values.amount_allocated),
          notes: values.notes,
        });
        toast.success("Investor allocated successfully");
        form.resetForm(); callBack?.(); handleClose();
      } catch (e: any) {
        const msg =
          e.response?.data?.amount_allocated?.[0] ||
          e.response?.data?.non_field_errors?.[0] ||
          e.response?.data?.source_order?.[0] ||
          e.response?.data?.detail ||
          "Failed to create allocation";
        toast.error(msg);
      } finally { setLoading(false); }
    },
  });

  const handleDialogClose = () => {
    if (loading) return;
    form.resetForm(); handleClose();
  };

  const selected = investorAccounts.find(a => a.id === form.values.investor_account);
  // NEW: use emd_balance as primary capital source, fall back to available_balance
  const effectiveBalance = selected
    ? (selected.emd_balance ?? selected.available_balance)
    : 0;
  const sufficient = selected ? effectiveBalance >= Number(form.values.amount_allocated) : true;

  return (
    <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <AccountBalanceIcon color="secondary" />
        Assign Investor to Order
      </DialogTitle>
      <DialogContent dividers>
        {optionsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 6, gap: 2 }}>
            <ProgressIndicator /><Span>Loading investor accounts...</Span>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
            <Alert severity="info">
              Committing investor capital to fund this purchase. Funds + margin are returned once the grain is sold.
            </Alert>
            {investorAccounts.length === 0 ? (
              <Alert severity="warning">No investor accounts found. Please create an investor account first.</Alert>
            ) : (
              <FormControl fullWidth error={Boolean(form.touched.investor_account && form.errors.investor_account)}>
                <InputLabel id="investor-account-label">Investor Account *</InputLabel>
                <Select
                  labelId="investor-account-label"
                  value={form.values.investor_account}
                  label="Investor Account *"
                  onChange={e => form.setFieldValue("investor_account", e.target.value)}
                  onBlur={() => form.setFieldTouched("investor_account", true)}
                >
                  {investorAccounts.map(a => {
                    const balance = a.emd_balance ?? a.available_balance;
                    return (
                      <MenuItem key={a.id} value={a.id}>
                        {a.investor.first_name} {a.investor.last_name}
                        &nbsp;—&nbsp;EMD Balance: {formatCurrency(balance)}
                      </MenuItem>
                    );
                  })}
                </Select>
                {form.touched.investor_account && form.errors.investor_account && (
                  <FormHelperText>{form.errors.investor_account as string}</FormHelperText>
                )}
              </FormControl>
            )}
            {selected && (
              <Alert severity={sufficient ? "success" : "error"}>
                EMD Balance: <strong>{formatCurrency(effectiveBalance)}</strong>
                {!sufficient && " — Insufficient EMD balance for this allocation amount"}
              </Alert>
            )}
            <TextField
              label="Amount Allocated (UGX) *"
              type="number"
              fullWidth
              value={form.values.amount_allocated}
              onChange={e => form.setFieldValue("amount_allocated", e.target.value)}
              onBlur={() => form.setFieldTouched("amount_allocated", true)}
              error={Boolean(form.touched.amount_allocated && form.errors.amount_allocated)}
              helperText={
                (form.touched.amount_allocated && form.errors.amount_allocated as string) ||
                `Order total cost: ${formatCurrency(order.total_cost)}`
              }
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Notes (optional)"
              multiline rows={2} fullWidth
              value={form.values.notes}
              onChange={e => form.setFieldValue("notes", e.target.value)}
              placeholder="Any additional notes about this allocation..."
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={handleDialogClose} disabled={loading}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => form.handleSubmit()}
          disabled={loading || optionsLoading || !sufficient || investorAccounts.length === 0}
          startIcon={loading ? <ProgressIndicator color="inherit" size={18} /> : <AccountBalanceIcon />}
        >
          {loading ? "Allocating..." : "Allocate Investor"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────
const SourceOrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<ISourceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [showWeighbridgeForm, setShowWeighbridgeForm] = useState(false);
  const [showAllocationForm, setShowAllocationForm] = useState(false);
  // NEW: aggregator cost states
  const [showAggregatorCostForm, setShowAggregatorCostForm] = useState(false);
  const [aggregatorCost, setAggregatorCost] = useState<IAggregatorTradeCost | null>(null);
  const [aggregatorCostLoading, setAggregatorCostLoading] = useState(false);

  useTitle(order ? `Order ${order.order_number}` : "Order Details");

  useEffect(() => { if (id) fetchOrderDetails(); }, [id]);

  // NEW: load aggregator cost whenever order is an aggregator trade
  useEffect(() => {
    if (order?.trade_type === "aggregator") fetchAggregatorCost();
  }, [order?.id, order?.trade_type]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const data = await SourcingService.getSourceOrderDetails(id!);
      setOrder(data);
    } catch {
      toast.error("Failed to load order details");
      navigate("/admin/sourcing/orders");
    } finally { setLoading(false); }
  };

  const fetchAggregatorCost = async () => {
    if (!id) return;
    setAggregatorCostLoading(true);
    try {
      const cost = await SourcingService.getAggregatorTradeCostByOrder(id);
      setAggregatorCost(cost);
    } catch {
      // Not found is normal for new orders — not an error
      setAggregatorCost(null);
    } finally { setAggregatorCostLoading(false); }
  };

  const handleAction = async (action: () => Promise<any>, successMsg: string) => {
    try {
      await action();
      toast.success(successMsg);
      fetchOrderDetails();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.response?.data?.detail || "Action failed");
    }
  };

  if (loading) return <LoadingScreen />;
  if (!order) return null;

  const createdBy = order.created_by;
  const hub = order.hub;
  const grainType = order.grain_type;
  const supplier = order.supplier;
  const isAggregator = order.trade_type === "aggregator";

  return (
    <Box pt={2} pb={4}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 1 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/admin/sourcing/orders")} sx={{ mr: 1 }}>
          Back
        </Button>
        <Typography variant="h4">{order.order_number}</Typography>
        <Chip label={order.status_display ?? order.status} color={ORDER_STATUS_COLORS[order.status]} sx={{ ml: 1 }} />
        {/* NEW: trade type chip */}
        <Chip
          label={isAggregator ? "Aggregator Trade" : "Direct Purchase"}
          color={isAggregator ? "info" : "default"}
          size="small"
          variant="outlined"
          icon={isAggregator ? <StorefrontIcon /> : undefined}
        />
        {order.has_investor_allocation
          ? <Chip label="Investor Assigned" color="success" size="small" icon={<AccountBalanceIcon />} variant="outlined" />
          : <Chip label="No Investor" color="warning" size="small" variant="outlined" />}
        {order.has_sale_lot && <Chip label="Stock Created" color="info" size="small" variant="outlined" />}
        {/* NEW: rejected lot chip */}
        {order.rejected_lot && <Chip label="Has Rejection" color="error" size="small" icon={<WarningAmberIcon />} variant="outlined" />}
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {order.status === "draft" && (
          <Button variant="contained" startIcon={<SendIcon />}
            onClick={() => handleAction(() => SourcingService.sendToSupplier(id!), "Order sent to supplier")}>
            Send to Supplier
          </Button>
        )}
        {order.status === "sent" && (
          <>
            <Button variant="contained" color="success" startIcon={<CheckIcon />}
              onClick={() => handleAction(() => SourcingService.acceptOrder(id!), "Order accepted")}>
              Accept Order
            </Button>
            <Button variant="outlined" color="error" startIcon={<CloseIcon />}
              onClick={() => handleAction(() => SourcingService.cancelOrder(id!), "Order cancelled")}>
              Cancel
            </Button>
          </>
        )}
        {order.status === "accepted" && (
          <>
            {!order.has_investor_allocation && (
              <Button variant="contained" color="secondary" startIcon={<AccountBalanceIcon />}
                onClick={() => setShowAllocationForm(true)}>
                Assign Investor
              </Button>
            )}
            <Button variant="outlined" startIcon={<LocalShippingIcon />}
              onClick={() => handleAction(() => SourcingService.markInTransit(id!), "Order marked in transit")}>
              Mark In Transit
            </Button>
          </>
        )}
        {order.status === "in_transit" && (
          <Button variant="contained" startIcon={<LocalShippingIcon />}
            onClick={() => setShowDeliveryForm(true)}>
            Record Delivery
          </Button>
        )}
        {order.status === "delivered" && (
          <>
            {!order.has_weighbridge && (
              <Button variant="contained" color="secondary" startIcon={<ScaleIcon />}
                onClick={() => setShowWeighbridgeForm(true)}>
                Record Weighbridge
              </Button>
            )}
            {/* NEW: aggregator cost button */}
            {isAggregator && (
              <Button
                variant={aggregatorCost ? "outlined" : "contained"}
                color="info"
                startIcon={aggregatorCost ? <EditIcon /> : <StorefrontIcon />}
                onClick={() => setShowAggregatorCostForm(true)}
              >
                {aggregatorCost ? "Edit Aggregator Costs" : "Record Aggregator Costs"}
              </Button>
            )}
          </>
        )}
      </Box>

      {/* Alerts */}
      {order.status === "accepted" && !order.has_investor_allocation && (
        <Alert severity="warning" sx={{ mb: 2 }}
          action={<Button color="inherit" size="small" onClick={() => setShowAllocationForm(true)}>Assign Now</Button>}>
          This order has no investor assigned. Assign an investor before dispatching.
        </Alert>
      )}
      {/* NEW: alert if aggregator order delivered but no costs recorded */}
      {isAggregator && order.status === "delivered" && !aggregatorCost && !aggregatorCostLoading && (
        <Alert severity="warning" sx={{ mb: 2 }}
          action={<Button color="inherit" size="small" onClick={() => setShowAggregatorCostForm(true)}>Record Now</Button>}>
          Aggregator costs not yet recorded. Record actual tonnage and destination costs.
        </Alert>
      )}
      {/* NEW: alert if rejected lot exists */}
      {order.rejected_lot && (
        <Alert severity="error" sx={{ mb: 2 }}>
          A rejection has been recorded against this order's stock lot.
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tab label="Order Details" />
        <Tab label="Supplier Info" />
        <Tab label="Invoice & Payments" />
        {/* NEW: aggregator tab — only shown for aggregator trades */}
        {isAggregator && <Tab label="Aggregator Costs" />}
      </Tabs>

      {/* ── Tab 0: Order Details ─────────────────────────────────────────── */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Order Information</Typography>
                <Divider sx={{ mb: 2 }} />
                {([
                  ["Order Number", order.order_number],
                  ["Trade Type", isAggregator ? "Aggregator Trade" : "Direct Purchase"],
                  ["Hub", hub?.name ?? "—"],
                  ["Grain Type", grainType?.name ?? "—"],
                  ["Quantity", formatWeight(order.quantity_kg)],
                  ["Price per kg", formatCurrency(order.offered_price_per_kg)],
                  ["Created By", createdBy ? `${createdBy.first_name} ${createdBy.last_name}` : "—"],
                  ["Created At", formatDateToDDMMYYYY(order.created_at)],
                  ...(order.expected_delivery_date
                    ? [["Expected Delivery", formatDateToDDMMYYYY(order.expected_delivery_date)]]
                    : []),
                ] as [string, string][]).map(([label, value]) => (
                  <Box key={label} sx={styles.infoRow}>
                    <Span sx={styles.label}>{label}:</Span>
                    <Span sx={styles.value}>{value}</Span>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Cost Breakdown</Typography>
                <Divider sx={{ mb: 2 }} />
                {([
                  ["Grain Cost", formatCurrency(order.grain_cost)],
                  ["Weighbridge Cost", formatCurrency(order.weighbridge_cost)],
                  ["Logistics Cost", formatCurrency(order.logistics_cost)],
                  // NEW: loading/offloading
                  ["Loading Cost", formatCurrency(order.loading_cost)],
                  ["Offloading Cost", formatCurrency(order.offloading_cost)],
                  ["Handling Cost", formatCurrency(order.handling_cost)],
                  ["Other Costs", formatCurrency(order.other_costs)],
                ] as [string, string][]).map(([label, value]) => (
                  <Box key={label} sx={styles.infoRow}>
                    <Span sx={styles.label}>{label}:</Span>
                    <Span sx={styles.value}>{value}</Span>
                  </Box>
                ))}
                <Divider sx={{ my: 2 }} />
                <Box sx={styles.infoRow}>
                  <Typography variant="h6">Total Cost:</Typography>
                  <Typography variant="h6" color="primary">{formatCurrency(order.total_cost)}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {order.logistics_type && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Logistics</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Span sx={styles.label}>Type:</Span>
                      <Span sx={styles.value}> {LOGISTICS_LABELS[order.logistics_type] ?? order.logistics_type}</Span>
                    </Grid>
                    {order.driver_name && (
                      <Grid item xs={12} md={4}>
                        <Span sx={styles.label}>Driver:</Span>
                        <Span sx={styles.value}> {order.driver_name}</Span>
                      </Grid>
                    )}
                    {order.driver_phone && (
                      <Grid item xs={12} md={4}>
                        <Span sx={styles.label}>Phone:</Span>
                        <Span sx={styles.value}> {order.driver_phone}</Span>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {order.notes && (
            <Grid item xs={12}>
              <Card><CardContent>
                <Typography variant="h6" gutterBottom>Notes</Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography>{order.notes}</Typography>
              </CardContent></Card>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* ── Tab 1: Supplier Info ─────────────────────────────────────────── */}
      <TabPanel value={tabValue} index={1}>
        <Card><CardContent>
          <Typography variant="h6" gutterBottom>Supplier Information</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={styles.infoRow}>
                <Span sx={styles.label}>Business Name:</Span>
                <Span sx={styles.value}>{supplier?.business_name ?? "—"}</Span>
              </Box>
              <Box sx={styles.infoRow}>
                <Span sx={styles.label}>Contact Person:</Span>
                <Span sx={styles.value}>
                  {supplier?.user ? `${supplier.user.first_name} ${supplier.user.last_name}` : "—"}
                </Span>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={styles.infoRow}>
                <Span sx={styles.label}>Primary Hub:</Span>
                <Span sx={styles.value}>{supplier?.hub?.name ?? "Not Set"}</Span>
              </Box>
              <Box sx={styles.infoRow}>
                <Span sx={styles.label}>Verified:</Span>
                <Chip
                  label={supplier?.is_verified ? "Verified" : "Not Verified"}
                  color={supplier?.is_verified ? "success" : "warning"}
                  size="small"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent></Card>
      </TabPanel>

      {/* ── Tab 2: Invoice & Payments ────────────────────────────────────── */}
      <TabPanel value={tabValue} index={2}>
        {order.has_invoice
          ? <Alert severity="info">View invoice details in the Supplier Invoices section.</Alert>
          : <Alert severity="warning">No invoice generated yet. Invoice is auto-created when order is accepted.</Alert>}
      </TabPanel>

      {/* ── Tab 3: Aggregator Costs (only for aggregator trades) ─────────── */}
      {isAggregator && (
        <TabPanel value={tabValue} index={3}>
          {aggregatorCostLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <ProgressIndicator />
            </Box>
          ) : aggregatorCost ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Tonnage Outcome</Typography>
                    <Divider sx={{ mb: 2 }} />
                    {([
                      ["Source Quantity", formatWeight(aggregatorCost.source_quantity_kg)],
                      ["Arrived Quantity", formatWeight(aggregatorCost.arrived_quantity_kg)],
                      ["Transit Loss", formatWeight(aggregatorCost.tonnage_lost_in_transit_kg)],
                      ["Buyer Deduction", formatWeight(aggregatorCost.buyer_deduction_kg)],
                      ["Net Accepted", formatWeight(aggregatorCost.net_accepted_quantity_kg)],
                    ] as [string, string][]).map(([label, value]) => (
                      <Box key={label} sx={styles.infoRow}>
                        <Span sx={styles.label}>{label}:</Span>
                        <Span sx={styles.value}>{value}</Span>
                      </Box>
                    ))}
                    <Box sx={styles.infoRow}>
                      <Span sx={styles.label}>Transit Loss %:</Span>
                      <Span sx={{
                        color: parseFloat(String(aggregatorCost.transit_loss_pct)) > 2
                          ? "error.main" : "success.main",
                        fontWeight: 700,
                      }}>
                        {formatPercentage(aggregatorCost.transit_loss_pct)}
                      </Span>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Destination Costs</Typography>
                    <Divider sx={{ mb: 2 }} />
                    {([
                      ["Weighbridge Cost", formatCurrency(aggregatorCost.destination_weighbridge_cost)],
                      ["Transit Insurance", formatCurrency(aggregatorCost.transit_insurance_cost)],
                      ["Other Costs", formatCurrency(aggregatorCost.other_destination_costs)],
                    ] as [string, string][]).map(([label, value]) => (
                      <Box key={label} sx={styles.infoRow}>
                        <Span sx={styles.label}>{label}:</Span>
                        <Span sx={styles.value}>{value}</Span>
                      </Box>
                    ))}
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={styles.infoRow}>
                      <Span sx={{ fontWeight: 700 }}>Total Add. Costs:</Span>
                      <Span sx={{ fontWeight: 700 }}>{formatCurrency(aggregatorCost.total_additional_cost)}</Span>
                    </Box>
                    <Box sx={styles.infoRow}>
                      <Typography variant="h6">Effective Cost/kg:</Typography>
                      <Typography variant="h6" color="primary">
                        {formatCurrency(aggregatorCost.effective_cost_per_kg)}/kg
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setShowAggregatorCostForm(true)}
                >
                  Edit Aggregator Costs
                </Button>
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="text.secondary" gutterBottom>
                No aggregator costs recorded yet.
              </Typography>
              <Button
                variant="contained"
                color="info"
                startIcon={<StorefrontIcon />}
                onClick={() => setShowAggregatorCostForm(true)}
              >
                Record Aggregator Costs
              </Button>
            </Box>
          )}
        </TabPanel>
      )}

      {/* Modals */}
      <InvestorAllocationForm
        open={showAllocationForm}
        order={order}
        handleClose={() => setShowAllocationForm(false)}
        callBack={fetchOrderDetails}
      />

      {showDeliveryForm && (
        <StandaloneDeliveryRecordForm
          sourceOrderId={order.id}
          callBack={() => { setShowDeliveryForm(false); fetchOrderDetails(); }}
          handleClose={() => setShowDeliveryForm(false)}
        />
      )}

      {showWeighbridgeForm && (
        <StandaloneWeighbridgeRecordForm
          sourceOrderId={order.id}
          callBack={() => { setShowWeighbridgeForm(false); fetchOrderDetails(); }}
          handleClose={() => setShowWeighbridgeForm(false)}
        />
      )}

      {/* NEW: Aggregator Cost Form */}
      <AggregatorTradeCostForm
        open={showAggregatorCostForm}
        sourceOrderId={order.id}
        sourceOrderNumber={order.order_number}
        existingRecord={aggregatorCost}
        handleClose={() => setShowAggregatorCostForm(false)}
        callBack={() => {
          setShowAggregatorCostForm(false);
          fetchAggregatorCost();
          fetchOrderDetails();
        }}
      />
    </Box>
  );
};

const styles = {
  infoRow: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 },
  label: { fontWeight: 600, color: "text.secondary" },
  value: { color: "text.primary" },
};

export default SourceOrderDetails;