/**
 * TransactionTree.tsx — NEW
 *
 * End-to-end trade view: Source Order → Allocation → Delivery → Weighbridge →
 * Invoice → Payments → Stock → Buyer Order → Buyer Invoice → Buyer Payment → Settlement
 */

import { FC, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert, Box, Button, Card, CardContent, Chip, Divider, Grid,
  Typography, Stepper, Step, StepLabel, StepContent,
} from "@mui/material";
import { toast } from "react-hot-toast";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import useTitle from "../../hooks/useTitle";
import LoadingScreen from "../../components/LoadingScreen";
import { Span } from "../../components/Typography";
import { SourcingService } from "./Sourcing.service";
import { formatCurrency, formatWeight } from "./SourcingConstants";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";

interface StepData {
  label: string;
  status: "completed" | "active" | "pending";
  content: React.ReactNode;
}

const StatusChip: FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, any> = {
    completed: "success", paid: "success", confirmed: "success", settled: "success",
    active: "primary", issued: "primary", delivered: "info",
    pending: "warning", processing: "warning", partial: "warning",
    cancelled: "error", failed: "error", draft: "default",
  };
  return <Chip label={status.replace(/_/g, " ").toUpperCase()} color={colors[status] || "default"} size="small" />;
};

const InfoRow: FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
    <Span sx={{ color: "text.primary", fontSize: 13 }}>{label}</Span>
    <Span sx={{ fontWeight: 600, fontSize: 13 }}>{value ?? "—"}</Span>
  </Box>
);

const TransactionTree: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tree, setTree] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useTitle("Transaction Tree");

  useEffect(() => {
    if (id) fetchTree();
  }, [id]);

  const fetchTree = async () => {
    setLoading(true);
    try {
      const data = await SourcingService.getTransactionTree(id!);
      setTree(data);
    } catch {
      toast.error("Failed to load transaction tree");
      navigate("/admin/sourcing/orders");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!tree) return null;

  const so = tree.source_order;
  const alloc = tree.investor_allocation;
  const deliveries = tree.deliveries || [];
  const wb = tree.weighbridge;
  const sInv = tree.supplier_invoice;
  const sPayments = tree.supplier_payments || [];
  const lot = tree.sale_lot;
  const buyerOrders = tree.buyer_orders || [];
  const settlement = tree.trade_settlement;

  const steps: StepData[] = [
    {
      label: `1. Source Order — ${so.order_number}`,
      status: "completed",
      content: (
        <Card variant="outlined"><CardContent sx={{ p: 1.5 }}>
          <InfoRow label="Supplier" value={so.supplier_name} />
          <InfoRow label="Grain" value={so.grain_type_detail?.name} />
          <InfoRow label="Quantity" value={formatWeight(so.quantity_kg)} />
          <InfoRow label="Total Cost" value={formatCurrency(so.total_cost)} />
          <InfoRow label="Status" value={<StatusChip status={so.status} />} />
          <InfoRow label="Created" value={formatDateToDDMMYYYY(so.created_at)} />
        </CardContent></Card>
      ),
    },
    {
      label: `2. Investor Allocation`,
      status: alloc ? "completed" : "pending",
      content: alloc ? (
        <Card variant="outlined"><CardContent sx={{ p: 1.5 }}>
          <InfoRow label="Ref" value={alloc.allocation_number} />
          <InfoRow label="Investor" value={alloc.investor_name} />
          <InfoRow label="Amount" value={formatCurrency(alloc.amount_allocated)} />
          <InfoRow label="Status" value={<StatusChip status={alloc.status} />} />
        </CardContent></Card>
      ) : <Alert severity="warning" sx={{ py: 0.5 }}>No investor assigned</Alert>,
    },
    {
      label: `3. Delivery (${deliveries.length} record${deliveries.length !== 1 ? "s" : ""})`,
      status: deliveries.length > 0 ? "completed" : "pending",
      content: deliveries.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {deliveries.map((d: any, i: number) => (
            <Card key={i} variant="outlined"><CardContent sx={{ p: 1.5 }}>
              <InfoRow label="Hub" value={d.hub_name} />
              <InfoRow label="Driver" value={d.driver_name} />
              <InfoRow label="Vehicle" value={d.vehicle_number} />
              <InfoRow label="Condition" value={d.apparent_condition?.toUpperCase()} />
              <InfoRow label="Received" value={formatDateToDDMMYYYY(d.received_at)} />
            </CardContent></Card>
          ))}
        </Box>
      ) : <Alert severity="info" sx={{ py: 0.5 }}>Awaiting delivery</Alert>,
    },
    {
      label: "4. Weighbridge",
      status: wb ? "completed" : "pending",
      content: wb ? (
        <Card variant="outlined"><CardContent sx={{ p: 1.5 }}>
          <InfoRow label="Vehicle" value={wb.vehicle_number} />
          <InfoRow label="Gross" value={formatWeight(wb.gross_weight_kg)} />
          <InfoRow label="Tare" value={formatWeight(wb.tare_weight_kg)} />
          <InfoRow label="Net" value={formatWeight(wb.net_weight_kg)} />
          <InfoRow label="Variance" value={formatWeight(wb.quantity_variance_kg)} />
        </CardContent></Card>
      ) : <Alert severity="info" sx={{ py: 0.5 }}>Awaiting weighbridge</Alert>,
    },
    {
      label: "5. Supplier Invoice & Payments",
      status: sInv ? (sInv.status === "paid" ? "completed" : "active") : "pending",
      content: sInv ? (
        <Card variant="outlined"><CardContent sx={{ p: 1.5 }}>
          <InfoRow label="Invoice" value={sInv.invoice_number} />
          <InfoRow label="Amount" value={formatCurrency(sInv.amount_due)} />
          <InfoRow label="Paid" value={formatCurrency(sInv.amount_paid)} />
          <InfoRow label="Balance" value={formatCurrency(sInv.balance_due)} />
          <InfoRow label="Status" value={<StatusChip status={sInv.status} />} />
          {sPayments.length > 0 && (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.primary">Payments ({sPayments.length})</Typography>
              {sPayments.map((p: any, i: number) => (
                <Box key={i} sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                  <Span sx={{ fontSize: 12 }}>{p.payment_number} — {p.method_display || p.method}</Span>
                  <Span sx={{ fontSize: 12, fontWeight: 600 }}>{formatCurrency(p.amount)}</Span>
                </Box>
              ))}
            </>
          )}
        </CardContent></Card>
      ) : <Alert severity="info" sx={{ py: 0.5 }}>No invoice yet</Alert>,
    },
    {
      label: "6. Stock Lot",
      status: lot ? "completed" : "pending",
      content: lot ? (
        <Card variant="outlined"><CardContent sx={{ p: 1.5 }}>
          <InfoRow label="Lot #" value={lot.lot_number} />
          <InfoRow label="Original Qty" value={formatWeight(lot.original_quantity_kg)} />
          <InfoRow label="Available" value={formatWeight(lot.available_quantity_kg)} />
          <InfoRow label="Sold" value={formatWeight(lot.sold_quantity_kg)} />
          <InfoRow label="Cost/kg" value={formatCurrency(lot.cost_per_kg)} />
          <InfoRow label="Status" value={<StatusChip status={lot.status} />} />
        </CardContent></Card>
      ) : <Alert severity="info" sx={{ py: 0.5 }}>Stock not yet created (weighbridge needed)</Alert>,
    },
    {
      label: `7. Buyer Sales (${buyerOrders.length} order${buyerOrders.length !== 1 ? "s" : ""})`,
      status: buyerOrders.length > 0 ? "completed" : "pending",
      content: buyerOrders.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {buyerOrders.map((bo: any, i: number) => (
            <Card key={i} variant="outlined"><CardContent sx={{ p: 1.5 }}>
              <InfoRow label="Order" value={bo.order_number} />
              <InfoRow label="Buyer" value={bo.buyer_name} />
              <InfoRow label="Revenue" value={formatCurrency(bo.subtotal)} />
              <InfoRow label="COGS" value={formatCurrency(bo.total_cogs)} />
              <InfoRow label="Gross Profit" value={formatCurrency(bo.gross_profit)} />
              <InfoRow label="Status" value={<StatusChip status={bo.status} />} />
              {bo.buyer_invoice && (
                <>
                  <Divider sx={{ my: 0.75 }} />
                  <InfoRow label="Invoice" value={bo.buyer_invoice.invoice_number} />
                  <InfoRow label="Invoice Status" value={<StatusChip status={bo.buyer_invoice.status} />} />
                  <InfoRow label="Paid" value={formatCurrency(bo.buyer_invoice.amount_paid)} />
                </>
              )}
              {bo.buyer_payments?.length > 0 && (
                <>
                  <Divider sx={{ my: 0.75 }} />
                  <Typography variant="caption" color="text.primary">Buyer Payments</Typography>
                  {bo.buyer_payments.map((bp: any, j: number) => (
                    <Box key={j} sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                      <Span sx={{ fontSize: 12 }}>{bp.payment_number}</Span>
                      <Span sx={{ fontSize: 12, fontWeight: 600 }}>{formatCurrency(bp.amount)}</Span>
                    </Box>
                  ))}
                </>
              )}
            </CardContent></Card>
          ))}
        </Box>
      ) : <Alert severity="info" sx={{ py: 0.5 }}>No buyer orders yet</Alert>,
    },
    {
      label: "8. Trade Settlement",
      status: settlement ? (settlement.status === "completed" ? "completed" : "active") : "pending",
      content: settlement ? (
        <Card variant="outlined" sx={{ bgcolor: "success.50" }}><CardContent sx={{ p: 1.5 }}>
          <InfoRow label="Settlement" value={settlement.settlement_number} />
          <InfoRow label="Revenue" value={formatCurrency(settlement.buyer_revenue)} />
          <InfoRow label="COGS" value={formatCurrency(settlement.total_cogs)} />
          <InfoRow label="Expenses" value={formatCurrency(settlement.total_selling_expenses)} />
          <InfoRow label="Gross Profit" value={formatCurrency(settlement.gross_profit)} />
          <InfoRow label="Margin %" value={`${settlement.gross_margin_pct}%`} />
          <Divider sx={{ my: 0.75 }} />
          <InfoRow label="Investor Margin" value={formatCurrency(settlement.investor_margin)} />
          <InfoRow label="Platform Fee" value={formatCurrency(settlement.platform_fee)} />
          <InfoRow label="Investor Return" value={formatCurrency(settlement.investor_return)} />
          <InfoRow label="Status" value={<StatusChip status={settlement.status} />} />
        </CardContent></Card>
      ) : <Alert severity="info" sx={{ py: 0.5 }}>Trade not yet settled</Alert>,
    },
  ];

  const activeStep = steps.findIndex(s => s.status !== "completed");

  return (
    <Box pt={2} pb={6}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/admin/sourcing/orders/${id}`)}>
          Back to Order
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Trade Story — {so.order_number}
        </Typography>
        <StatusChip status={so.status} />
      </Box>

      {/* Summary banner */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Sourcing Cost", value: formatCurrency(so.total_cost), color: "text.primary" },
          { label: "Sale Revenue", value: buyerOrders.length > 0 ? formatCurrency(buyerOrders.reduce((s: number, bo: any) => s + Number(bo.subtotal || 0), 0)) : "—", color: "primary.main" },
          { label: "Gross Profit", value: settlement ? formatCurrency(settlement.gross_profit) : "—", color: "success.main" },
          { label: "Investor Return", value: settlement ? formatCurrency(settlement.investor_return) : "—", color: "info.main" },
        ].map(c => (
          <Grid item xs={6} sm={3} key={c.label}>
            <Card variant="outlined"><CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Typography variant="caption" color="text.primary">{c.label}</Typography>
              <Typography variant="h6" sx={{ color: c.color, fontWeight: 700 }}>{c.value}</Typography>
            </CardContent></Card>
          </Grid>
        ))}
      </Grid>

      {/* Step-by-step timeline */}
      <Stepper orientation="vertical" activeStep={activeStep >= 0 ? activeStep : steps.length}>
        {steps.map((step, index) => (
          <Step key={index} completed={step.status === "completed"} active={step.status === "active"}>
            <StepLabel
              icon={step.status === "completed"
                ? <CheckCircleIcon color="success" />
                : step.status === "active"
                  ? <PendingIcon color="primary" />
                  : undefined
              }
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{step.label}</Typography>
            </StepLabel>
            <StepContent>
              <Box sx={{ mb: 2 }}>{step.content}</Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default TransactionTree;