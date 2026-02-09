import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  Paper,
  Tab,
  Tabs,
  Alert,
} from "@mui/material";
import { toast } from "react-hot-toast";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ScaleIcon from "@mui/icons-material/Scale";
import useTitle from "../../hooks/useTitle";
import { SourcingService } from "./Sourcing.service";
import { ISourceOrder } from "./Sourcing.interface";
import { formatCurrency, formatWeight, ORDER_STATUS_COLORS } from "./SourcingConstants";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import { Span } from "../../components/Typography";
import LoadingScreen from "../../components/LoadingScreen";
import { DeliveryRecordForm } from "./DeliveryRecordForm";
import { WeighbridgeRecordForm } from "./WeighbridgeRecordForm";
import { useModalContext } from "../../contexts/ModalDialogContext";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SourceOrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setShowModal } = useModalContext();
  
  const [order, setOrder] = useState<ISourceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [showWeighbridgeForm, setShowWeighbridgeForm] = useState(false);

  useTitle(order ? `Order ${order.order_number}` : "Order Details");

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const data = await SourcingService.getSourceOrderDetails(id!);
      setOrder(data);
    } catch (error: any) {
      toast.error("Failed to load order details");
      navigate("/admin/sourcing/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleSendToSupplier = async () => {
    try {
      await SourcingService.sendToSupplier(id!);
      toast.success("Order sent to supplier");
      fetchOrderDetails();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to send order");
    }
  };

  const handleAccept = async () => {
    try {
      await SourcingService.acceptOrder(id!);
      toast.success("Order accepted");
      fetchOrderDetails();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to accept order");
    }
  };

  const handleReject = async () => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;
    
    try {
      await SourcingService.rejectOrder(id!, reason);
      toast.success("Order rejected");
      fetchOrderDetails();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to reject order");
    }
  };

  const handleMarkInTransit = async () => {
    try {
      await SourcingService.markInTransit(id!);
      toast.success("Order marked as in transit");
      fetchOrderDetails();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to update order");
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) return <LoadingScreen />;
  if (!order) return null;

  return (
    <Box pt={2} pb={4}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin/sourcing/orders")}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4">{order.order_number}</Typography>
        <Chip
          label={order.status_display}
          color={ORDER_STATUS_COLORS[order.status]}
          sx={{ ml: 2 }}
        />
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {order.status === 'draft' && (
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleSendToSupplier}
          >
            Send to Supplier
          </Button>
        )}
        {order.status === 'open' && (
          <>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckIcon />}
              onClick={handleAccept}
            >
              Accept Order
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CloseIcon />}
              onClick={handleReject}
            >
              Reject Order
            </Button>
          </>
        )}
        {order.status === 'accepted' && (
          <Button
            variant="contained"
            color="warning"
            startIcon={<LocalShippingIcon />}
            onClick={handleMarkInTransit}
          >
            Mark In Transit
          </Button>
        )}
        {order.status === 'in_transit' && !order.has_delivery && (
          <Button
            variant="contained"
            color="info"
            onClick={() => setShowDeliveryForm(true)}
          >
            Record Delivery
          </Button>
        )}
        {order.has_delivery && !order.has_weighbridge && (
          <Button
            variant="contained"
            color="success"
            startIcon={<ScaleIcon />}
            onClick={() => setShowWeighbridgeForm(true)}
          >
            Record Weighbridge
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Order Details" />
          <Tab label="Supplier Info" />
          <Tab label="Invoice & Payments" disabled={!order.has_invoice} />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Order Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Order Information</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={styles.infoRow}>
                  <Span sx={styles.label}>Order Number:</Span>
                  <Span sx={styles.value}>{order.order_number}</Span>
                </Box>
                <Box sx={styles.infoRow}>
                  <Span sx={styles.label}>Hub:</Span>
                  <Span sx={styles.value}>{order.hub.name}</Span>
                </Box>
                <Box sx={styles.infoRow}>
                  <Span sx={styles.label}>Grain Type:</Span>
                  <Span sx={styles.value}>{order.grain_type.name}</Span>
                </Box>
                <Box sx={styles.infoRow}>
                  <Span sx={styles.label}>Quantity:</Span>
                  <Span sx={styles.value}>{formatWeight(order.quantity_kg)}</Span>
                </Box>
                <Box sx={styles.infoRow}>
                  <Span sx={styles.label}>Price per kg:</Span>
                  <Span sx={styles.value}>{formatCurrency(order.offered_price_per_kg)}</Span>
                </Box>
                <Box sx={styles.infoRow}>
                  <Span sx={styles.label}>Created By:</Span>
                  <Span sx={styles.value}>{order.created_by.first_name} {order.created_by.last_name}</Span>
                </Box>
                <Box sx={styles.infoRow}>
                  <Span sx={styles.label}>Created At:</Span>
                  <Span sx={styles.value}>{formatDateToDDMMYYYY(order.created_at)}</Span>
                </Box>
                {order.expected_delivery_date && (
                  <Box sx={styles.infoRow}>
                    <Span sx={styles.label}>Expected Delivery:</Span>
                    <Span sx={styles.value}>{formatDateToDDMMYYYY(order.expected_delivery_date)}</Span>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Cost Breakdown */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Cost Breakdown</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={styles.infoRow}>
                  <Span sx={styles.label}>Grain Cost:</Span>
                  <Span sx={styles.value}>{formatCurrency(order.grain_cost)}</Span>
                </Box>
                <Box sx={styles.infoRow}>
                  <Span sx={styles.label}>Weighbridge Cost:</Span>
                  <Span sx={styles.value}>{formatCurrency(order.weighbridge_cost)}</Span>
                </Box>
                <Box sx={styles.infoRow}>
                  <Span sx={styles.label}>Logistics Cost:</Span>
                  <Span sx={styles.value}>{formatCurrency(order.logistics_cost)}</Span>
                </Box>
                <Box sx={styles.infoRow}>
                  <Span sx={styles.label}>Handling Cost:</Span>
                  <Span sx={styles.value}>{formatCurrency(order.handling_cost)}</Span>
                </Box>
                <Box sx={styles.infoRow}>
                  <Span sx={styles.label}>Other Costs:</Span>
                  <Span sx={styles.value}>{formatCurrency(order.other_costs)}</Span>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={styles.infoRow}>
                  <Typography variant="h6">Total Cost:</Typography>
                  <Typography variant="h6" color="primary">{formatCurrency(order.total_cost)}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Logistics Information */}
          {order.logistics_type && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Logistics Information</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Span sx={styles.label}>Logistics Type:</Span>
                      <Span sx={styles.value}>{order.logistics_type_display}</Span>
                    </Grid>
                    {order.driver_name && (
                      <Grid item xs={12} md={4}>
                        <Span sx={styles.label}>Driver Name:</Span>
                        <Span sx={styles.value}>{order.driver_name}</Span>
                      </Grid>
                    )}
                    {order.driver_phone && (
                      <Grid item xs={12} md={4}>
                        <Span sx={styles.label}>Driver Phone:</Span>
                        <Span sx={styles.value}>{order.driver_phone}</Span>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Notes */}
          {order.notes && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Notes</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography>{order.notes}</Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Supplier Information</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={styles.infoRow}>
                  <Span sx={styles.label}>Business Name:</Span>
                  <Span sx={styles.value}>{order.supplier.business_name}</Span>
                </Box>
                <Box sx={styles.infoRow}>
                  <Span sx={styles.label}>Contact Person:</Span>
                  <Span sx={styles.value}>{order.supplier.user.first_name} {order.supplier.user.last_name}</Span>
                </Box>
                <Box sx={styles.infoRow}>
                  <Span sx={styles.label}>Phone:</Span>
                {/* <Span sx={styles.value}>{order.supplier.user.phone_number || "Not provided"}</Span> */}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={styles.infoRow}>
                  <Span sx={styles.label}>Primary Hub:</Span>
                  <Span sx={styles.value}>{order.supplier.hub?.name || "Not Set"}</Span>
                </Box>
                <Box sx={styles.infoRow}>
                  <Span sx={styles.label}>Verified:</Span>
                  <Chip 
                    label={order.supplier.is_verified ? "Verified" : "Not Verified"} 
                    color={order.supplier.is_verified ? "success" : "warning"} 
                    size="small"
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {order.has_invoice ? (
          <Alert severity="info">Invoice details will be displayed here</Alert>
        ) : (
          <Alert severity="warning">No invoice generated yet</Alert>
        )}
      </TabPanel>

      {/* Modals */}
      {showDeliveryForm && (
        <DeliveryRecordForm
          sourceOrderId={order.id}
          callBack={() => {
            setShowDeliveryForm(false);
            fetchOrderDetails();
          }}
          handleClose={() => setShowDeliveryForm(false)}
        />
      )}

      {showWeighbridgeForm && (
        <WeighbridgeRecordForm
          sourceOrderId={order.id}
          callBack={() => {
            setShowWeighbridgeForm(false);
            fetchOrderDetails();
          }}
          handleClose={() => setShowWeighbridgeForm(false)}
        />
      )}
    </Box>
  );
};

const styles = {
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mb: 1.5,
  },
  label: {
    fontWeight: 600,
    color: "text.secondary",
  },
  value: {
    color: "text.primary",
  },
};

export default SourceOrderDetails;