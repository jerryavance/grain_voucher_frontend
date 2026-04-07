// sourcing/pages/TransactionTree.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  Skeleton,
  Divider,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Button,
  Tooltip,
} from "@mui/material";
import {
  CheckCircle,
  RadioButtonUnchecked,
  ExpandMore,
  ExpandLess,
  ArrowBack,
  PictureAsPdf,
  TableChart,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { SourcingService } from "./Sourcing.service";
import { formatCurrency, formatDate, formatKg, formatStatus, getStatusColor } from "../../utils/formatters";

interface TreeData {
  source_order: any;
  investor_allocation: any;
  deliveries: any[];
  weighbridge: any;
  aggregator_cost: any;
  supplier_invoice: any;
  supplier_payments: any[];
  sale_lot: any;
  rejections: any[];
  buyer_orders: any[];
  trade_settlement: any;
  timeline: Array<{ event: string; timestamp: string | null; detail: string }>;
  summary: {
    order_number: string; status: string; grain: string; supplier: string;
    total_sourcing_cost: string; investor_funded: boolean;
    investor_name: string | null; has_been_sold: boolean;
    has_rejections: boolean; is_settled: boolean; timeline_events: number;
  } | null;
}

const TransactionTree: React.FC = () => {
  // ✅ FIX: support both :id and :orderId route param names
  const params = useParams<{ orderId?: string; id?: string }>();
  const resolvedId = params.orderId || params.id;

  const navigate = useNavigate();
  const [tree, setTree] = useState<TreeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (resolvedId) {
      fetchTree(resolvedId);
    } else {
      // ✅ FIX: prevent infinite skeleton if param is missing
      setLoading(false);
    }
  }, [resolvedId]);

  const fetchTree = async (id: string) => {
    try {
      const data = await SourcingService.getTransactionTree(id);
      setTree(data);
    } catch (err: any) {
      toast.error("Failed to load transaction tree");
    } finally {
      setLoading(false);
    }
  };

  const toggle = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  if (loading) {
    return (
      <Box p={3}>
        <Skeleton variant="text" width={400} height={50} />
        <Grid container spacing={2} mt={1}>
          {[...Array(4)].map((_, i) => (
            <Grid item xs={3} key={i}>
              <Skeleton variant="rectangular" height={80} />
            </Grid>
          ))}
        </Grid>
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} variant="text" height={48} sx={{ mt: 1 }} />
        ))}
      </Box>
    );
  }

  if (!resolvedId) {
    return (
      <Box p={3}>
        <Alert severity="error">No order ID found in URL. Please navigate here from an order details page.</Alert>
      </Box>
    );
  }

  if (!tree) {
    return (
      <Box p={3}>
        <Alert severity="warning">No transaction data available for this order.</Alert>
      </Box>
    );
  }

  const order = tree.source_order;
  const settlement = tree.trade_settlement;

  // ── Compute summary values ─────────────────────────────────────────────
  const sourcingCost = Number(order?.total_cost || 0);

  const saleRevenue = tree.buyer_orders.reduce(
    (s: number, bo: any) => s + Number(bo.subtotal || 0),
    0
  );

  const grossProfit = settlement
    ? Number(settlement.gross_profit || 0)
    : saleRevenue > 0
    ? saleRevenue - sourcingCost
    : null;

  const investorReturn = settlement
    ? Number(settlement.investor_return || 0)
    : null;

  const summaryCards = [
    { label: "Sourcing Cost", value: formatCurrency(sourcingCost) },
    {
      label: "Sale Revenue",
      value: saleRevenue > 0 ? formatCurrency(saleRevenue) : "—",
      color: "#4caf50",
    },
    {
      label: "Gross Profit",
      value: grossProfit !== null ? formatCurrency(grossProfit) : "—",
      color: grossProfit !== null && grossProfit >= 0 ? "#4caf50" : "#f44336",
    },
    {
      label: "Investor Return",
      value: investorReturn !== null ? formatCurrency(investorReturn) : "—",
    },
  ];

  // ── Steps ──────────────────────────────────────────────────────────────
  const steps = [
    {
      num: 1,
      label: `Source Order — ${order.order_number}`,
      done: true,
      key: "source_order",
    },
    {
      num: 2,
      label: tree.investor_allocation
        ? `Investor Allocation — ${tree.investor_allocation.investor_name}`
        : "Investor Allocation",
      done: !!tree.investor_allocation,
      key: "allocation",
    },
    {
      num: 3,
      label: `Delivery (${tree.deliveries.length} record${tree.deliveries.length !== 1 ? "s" : ""})`,
      done: tree.deliveries.length > 0,
      key: "delivery",
    },
    {
      num: 4,
      label: tree.weighbridge
        ? `Weighbridge — Net ${formatKg(tree.weighbridge.net_weight_kg)}`
        : "Weighbridge",
      done: !!tree.weighbridge,
      key: "weighbridge",
    },
    {
      num: 5,
      label: tree.supplier_invoice
        ? `Supplier Invoice — ${tree.supplier_invoice.invoice_number}`
        : "Supplier Invoice & Payments",
      done: !!tree.supplier_invoice,
      key: "invoice",
    },
    {
      num: 6,
      label: tree.sale_lot
        ? `Stock Lot — ${tree.sale_lot.lot_number}`
        : "Stock Lot",
      done: !!tree.sale_lot,
      key: "lot",
    },
    {
      num: 7,
      label: `Buyer Sales (${tree.buyer_orders.length} order${tree.buyer_orders.length !== 1 ? "s" : ""})`,
      done: tree.buyer_orders.length > 0,
      key: "buyer_orders",
    },
    {
      num: 8,
      label: settlement
        ? `Trade Settlement — ${settlement.settlement_number}`
        : "Trade Settlement",
      done: !!settlement,
      key: "settlement",
    },
  ];

  // ── Export helpers (plain functions — not hooks — OK after early returns) ──
  const handlePrintPDF = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (!tree) return;
    const o = tree.source_order;
    const alloc = tree.investor_allocation;
    const wb = tree.weighbridge;
    const inv = tree.supplier_invoice;
    const lot = tree.sale_lot;
    const stl = tree.trade_settlement;

    // Build flat rows for Excel
    const rows: Record<string, any>[] = [];

    // Source order row
    rows.push({
      Section: "Source Order",
      Reference: o.order_number,
      Detail: `${o.grain_type_name || o.grain_type_detail?.name || ""} — ${o.supplier_name || o.supplier_detail?.business_name || ""}`,
      "Qty (kg)": Number(o.quantity_kg || 0),
      "Amount (UGX)": Number(o.total_cost || 0),
      Status: o.status_display || o.status,
      Date: o.created_at,
    });

    // Allocation
    if (alloc) {
      rows.push({
        Section: "Investor Allocation",
        Reference: alloc.allocation_number,
        Detail: alloc.investor_name,
        "Qty (kg)": "",
        "Amount (UGX)": Number(alloc.amount_allocated || 0),
        Status: alloc.status,
        Date: alloc.allocated_at,
      });
    }

    // Deliveries
    tree.deliveries.forEach((d: any) => {
      rows.push({
        Section: "Delivery",
        Reference: d.id,
        Detail: `Driver: ${d.driver_name || "—"} / Vehicle: ${d.vehicle_number || "—"}`,
        "Qty (kg)": "",
        "Amount (UGX)": "",
        Status: d.apparent_condition,
        Date: d.received_at,
      });
    });

    // Weighbridge
    if (wb) {
      rows.push({
        Section: "Weighbridge",
        Reference: wb.vehicle_number,
        Detail: `Gross: ${Number(wb.gross_weight_kg).toLocaleString()} / Tare: ${Number(wb.tare_weight_kg).toLocaleString()}`,
        "Qty (kg)": Number(wb.net_weight_kg || 0),
        "Amount (UGX)": "",
        Status: `Variance: ${Number(wb.quantity_variance_kg || 0).toLocaleString()} kg`,
        Date: wb.weighed_at,
      });
    }

    // Supplier Invoice
    if (inv) {
      rows.push({
        Section: "Supplier Invoice",
        Reference: inv.invoice_number,
        Detail: `Due: ${formatCurrency(inv.amount_due)} / Paid: ${formatCurrency(inv.amount_paid)}`,
        "Qty (kg)": "",
        "Amount (UGX)": Number(inv.amount_due || 0),
        Status: inv.status,
        Date: inv.issued_at,
      });
    }

    // Supplier Payments
    tree.supplier_payments?.forEach((p: any) => {
      rows.push({
        Section: "Supplier Payment",
        Reference: p.payment_number,
        Detail: `Method: ${p.method || "—"} / Ref: ${p.reference_number || "—"}`,
        "Qty (kg)": "",
        "Amount (UGX)": Number(p.amount || 0),
        Status: p.status,
        Date: p.created_at,
      });
    });

    // Sale Lot
    if (lot) {
      rows.push({
        Section: "Stock Lot",
        Reference: lot.lot_number,
        Detail: `Available: ${Number(lot.available_quantity_kg).toLocaleString()} / Sold: ${Number(lot.sold_quantity_kg).toLocaleString()} kg`,
        "Qty (kg)": Number(lot.original_quantity_kg || 0),
        "Amount (UGX)": Number(lot.total_sourcing_cost || 0),
        Status: lot.status,
        Date: lot.created_at,
      });
    }

    // Buyer Orders
    tree.buyer_orders.forEach((bo: any) => {
      rows.push({
        Section: "Buyer Order",
        Reference: bo.order_number,
        Detail: bo.buyer_name,
        "Qty (kg)": "",
        "Amount (UGX)": Number(bo.subtotal || 0),
        Status: bo.status_display || bo.status,
        Date: bo.created_at,
      });
      // Lines
      bo.lines?.forEach((line: any) => {
        rows.push({
          Section: "  ↳ Order Line",
          Reference: line.lot_number || "",
          Detail: `${Number(line.quantity_kg).toLocaleString()} kg @ ${formatCurrency(line.sale_price_per_kg)}/kg`,
          "Qty (kg)": Number(line.quantity_kg || 0),
          "Amount (UGX)": Number(line.line_total || 0),
          Status: `Profit: ${formatCurrency(line.line_gross_profit)}`,
          Date: "",
        });
      });
      // Invoice
      if (bo.buyer_invoice) {
        rows.push({
          Section: "  ↳ Buyer Invoice",
          Reference: bo.buyer_invoice.invoice_number,
          Detail: `Balance: ${formatCurrency(bo.buyer_invoice.balance_due)}`,
          "Qty (kg)": "",
          "Amount (UGX)": Number(bo.buyer_invoice.amount_due || 0),
          Status: bo.buyer_invoice.status,
          Date: bo.buyer_invoice.due_date,
        });
      }
      // Buyer Payments
      bo.buyer_payments?.forEach((p: any) => {
        rows.push({
          Section: "  ↳ Buyer Payment",
          Reference: p.payment_number,
          Detail: `Method: ${p.method} / Ref: ${p.reference_number || "—"}`,
          "Qty (kg)": "",
          "Amount (UGX)": Number(p.amount || 0),
          Status: p.status,
          Date: p.payment_date || p.created_at,
        });
      });
    });

    // Settlement
    if (stl) {
      rows.push({
        Section: "Trade Settlement",
        Reference: stl.settlement_number,
        Detail: `Revenue: ${formatCurrency(stl.buyer_revenue)} / COGS: ${formatCurrency(stl.total_cogs)}`,
        "Qty (kg)": "",
        "Amount (UGX)": Number(stl.gross_profit || 0),
        Status: stl.status,
        Date: stl.settled_at,
      });
      rows.push({
        Section: "  ↳ Profit Split",
        Reference: "",
        Detail: `Investor: ${formatCurrency(stl.investor_margin)} (${stl.investor_share_pct}%) / Platform: ${formatCurrency(stl.platform_fee)} (${stl.platform_share_pct}%)`,
        "Qty (kg)": "",
        "Amount (UGX)": Number(stl.investor_return || 0),
        Status: `Investor Return`,
        Date: "",
      });
    }

    // Convert to CSV
    if (rows.length === 0) {
      toast.error("No data to export");
      return;
    }
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        headers.map((h) => {
          const val = String(row[h] ?? "").replace(/,/g, "").replace(/"/g, '""');
          return `"${val}"`;
        }).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Trade_Tree_${o.order_number}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success("Trade tree exported to CSV");
  };

  return (
    <Box p={3}>
      {/* ── Header ────────────────────────────────────────────────────── */}
      <Box display="flex" alignItems="center" mb={1}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" fontWeight={700} mr={2}>
          Trade Story — {order.order_number}
        </Typography>
        <Chip
          label={order.status_display || formatStatus(order.status)}
          sx={{
            bgcolor: getStatusColor(order.status),
            color: "#fff",
            fontWeight: 600,
          }}
        />
        <Chip
          label={order.trade_type === "aggregator" ? "Aggregator" : "Direct"}
          size="small"
          variant="outlined"
          sx={{ ml: 1 }}
        />
        {/* ✅ NEW: Export buttons */}
        <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
          <Tooltip title="Print / Save as PDF">
            <Button
              size="small"
              variant="outlined"
              startIcon={<PictureAsPdf />}
              onClick={handlePrintPDF}
            >
              PDF
            </Button>
          </Tooltip>
          <Tooltip title="Export trade tree to CSV / Excel">
            <Button
              size="small"
              variant="outlined"
              startIcon={<TableChart />}
              onClick={handleExportExcel}
            >
              Excel
            </Button>
          </Tooltip>
        </Box>
      </Box>
      <Typography variant="body2" color="text.primary" mb={3}>
        {order.hub_name || order.hub_detail?.name} &bull; {order.grain_type_name || order.grain_type_detail?.name} &bull; {formatKg(order.quantity_kg)}
      </Typography>

      {/* ── Summary Cards ─────────────────────────────────────────────── */}
      <Grid container spacing={2} mb={4}>
        {summaryCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
              <CardContent>
                <Typography variant="caption" color="text.primary">
                  {card.label}
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ color: card.color || "inherit" }}
                >
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Timeline Steps ────────────────────────────────────────────── */}
      <Box>
        {steps.map((step, idx) => (
          <Box key={step.key} mb={1}>
            <Box
              display="flex"
              alignItems="center"
              sx={{
                cursor: step.done ? "pointer" : "default",
                opacity: step.done ? 1 : 0.4,
                py: 1,
                borderRadius: 1,
                px: 1,
                "&:hover": step.done ? { bgcolor: "action.hover" } : {},
              }}
              onClick={() => step.done && toggle(step.key)}
            >
              {step.done ? (
                <CheckCircle sx={{ color: "#4caf50", mr: 2 }} />
              ) : (
                <RadioButtonUnchecked sx={{ color: "#bbb", mr: 2 }} />
              )}
              <Typography
                variant="subtitle1"
                fontWeight={step.done ? 600 : 400}
                sx={{ flex: 1 }}
              >
                {step.num}. {step.label}
              </Typography>
              {step.done && (
                expanded[step.key] ? <ExpandLess /> : <ExpandMore />
              )}
            </Box>

            {/* Connector line */}
            {idx < steps.length - 1 && (
              <Box
                sx={{
                  ml: "11px",
                  borderLeft: "2px solid #e0e0e0",
                  height: 16,
                }}
              />
            )}

            {/* Expandable detail */}
            <Collapse in={expanded[step.key]}>
              <Box ml={5} mb={2} p={2} bgcolor="#fafafa" borderRadius={1} border="1px solid #eeeeee">
                {step.key === "source_order" && (
                  <OrderDetail order={order} />
                )}
                {step.key === "allocation" && tree.investor_allocation && (
                  <AllocationDetail alloc={tree.investor_allocation} />
                )}
                {step.key === "delivery" && tree.deliveries.length > 0 && (
                  <DeliveriesDetail deliveries={tree.deliveries} />
                )}
                {step.key === "weighbridge" && tree.weighbridge && (
                  <WeighbridgeDetail weighbridge={tree.weighbridge} />
                )}
                {step.key === "invoice" && tree.supplier_invoice && (
                  <InvoiceDetail
                    invoice={tree.supplier_invoice}
                    payments={tree.supplier_payments}
                  />
                )}
                {step.key === "lot" && tree.sale_lot && (
                  <LotDetail lot={tree.sale_lot} />
                )}
                {step.key === "buyer_orders" && tree.buyer_orders.length > 0 && (
                  <BuyerOrdersDetail orders={tree.buyer_orders} />
                )}
                {step.key === "settlement" && settlement && (
                  <SettlementDetail settlement={settlement} />
                )}
              </Box>
            </Collapse>
          </Box>
        ))}
      </Box>

      {/* ── Trade Timeline ──────────────────────────────────────────────── */}
      {tree.timeline && tree.timeline.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Trade Timeline ({tree.timeline.length} events)
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {tree.timeline.map((event: any, idx: number) => (
              <Box
                key={idx}
                sx={{
                  display: "flex", gap: 2, mb: 2, pl: 2,
                  borderLeft: "3px solid",
                  borderColor: idx === tree.timeline.length - 1 ? "primary.main" : "divider",
                }}
              >
                <Box sx={{ minWidth: 140 }}>
                  <Typography variant="caption" color="text.secondary">
                    {event.timestamp
                      ? new Date(event.timestamp).toLocaleDateString("en-GB", {
                          day: "2-digit", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })
                      : "—"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={700}>{event.event}</Typography>
                  <Typography variant="body2" color="text.secondary">{event.detail}</Typography>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Trade Summary ───────────────────────────────────────────────── */}
      {tree.summary && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Summary</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={1}>
              {[
                ["Grain", tree.summary.grain],
                ["Supplier", tree.summary.supplier],
                ["Total Cost", tree.summary.total_sourcing_cost ? formatCurrency(Number(tree.summary.total_sourcing_cost)) : "—"],
                ["Investor", tree.summary.investor_funded ? `Yes — ${tree.summary.investor_name}` : "No"],
                ["Sold", tree.summary.has_been_sold ? "Yes" : "Not yet"],
                ["Rejections", tree.summary.has_rejections ? "Yes" : "None"],
                ["Settled", tree.summary.is_settled ? "Yes" : "Not yet"],
              ].map(([label, value]) => (
                <Grid item xs={12} sm={6} md={4} key={label as string}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">{label}:</Typography>
                    <Typography variant="body2" fontWeight={600}>{value}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

// ── Sub-components ───────────────────────────────────────────────────────────

const Row: React.FC<{ label: string; value: React.ReactNode; bold?: boolean }> = ({ label, value, bold }) => (
  <>
    <Grid item xs={6}>
      <Typography variant="body2" color="text.primary">{label}</Typography>
    </Grid>
    <Grid item xs={6}>
      <Typography variant="body2" fontWeight={bold ? 700 : 400}>{value}</Typography>
    </Grid>
  </>
);

const OrderDetail: React.FC<{ order: any }> = ({ order }) => (
  <Grid container spacing={1}>
    <Row label="Destination Warehouse" value={order.hub_name || order.hub_detail?.name || "—"} />
    <Row label="Grain Type" value={order.grain_type_name || order.grain_type_detail?.name || "—"} />
    <Row label="Supplier" value={order.supplier_name || order.supplier_detail?.business_name || "—"} />
    <Row label="Quantity" value={formatKg(order.quantity_kg)} />
    <Row label="Price/kg" value={formatCurrency(order.offered_price_per_kg)} />
    <Row label="Grain Cost" value={formatCurrency(order.grain_cost)} />
    <Row label="Logistics" value={formatCurrency(order.logistics_cost)} />
    <Row label="Weighbridge" value={formatCurrency(order.weighbridge_cost)} />
    <Row label="Handling" value={formatCurrency(order.handling_cost)} />
    <Row label="Other Costs" value={formatCurrency(order.other_costs)} />
    <Grid item xs={12}><Divider sx={{ my: 0.5 }} /></Grid>
    <Row label="Total Cost" value={formatCurrency(order.total_cost)} bold />
    <Row label="Payment Method" value={order.payment_method_display || order.payment_method || "—"} />
    {order.driver_name && <Row label="Driver" value={`${order.driver_name} — ${order.driver_phone}`} />}
    {order.notes && <Row label="Notes" value={order.notes} />}
  </Grid>
);

const AllocationDetail: React.FC<{ alloc: any }> = ({ alloc }) => (
  <Grid container spacing={1}>
    <Row label="Allocation #" value={alloc.allocation_number} />
    <Row label="Investor" value={alloc.investor_name} />
    <Row label="Amount Allocated" value={formatCurrency(alloc.amount_allocated)} />
    <Row label="Investor Margin" value={formatCurrency(alloc.investor_margin)} />
    <Row label="Platform Fee" value={formatCurrency(alloc.platform_fee)} />
    <Row label="Amount Returned" value={formatCurrency(alloc.amount_returned)} bold />
    <Row
      label="Status"
      value={
        <Chip
          label={formatStatus(alloc.status)}
          size="small"
          sx={{ bgcolor: getStatusColor(alloc.status), color: "#fff" }}
        />
      }
    />
    <Row label="Allocated At" value={formatDate(alloc.allocated_at)} />
    {alloc.settled_at && <Row label="Settled At" value={formatDate(alloc.settled_at)} />}
    {alloc.notes && <Row label="Notes" value={alloc.notes} />}
  </Grid>
);

const DeliveriesDetail: React.FC<{ deliveries: any[] }> = ({ deliveries }) => (
  <Paper variant="outlined" sx={{ overflow: "hidden" }}>
    <Table size="small">
      <TableHead>
        <TableRow sx={{ bgcolor: "action.hover" }}>
          {["Dest. Warehouse", "Driver", "Vehicle", "Condition", "Received At", "Notes"].map((h) => (
            <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.75rem" }}>{h}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {deliveries.map((d: any) => (
          <TableRow key={d.id} hover>
            <TableCell>{d.hub_name || "—"}</TableCell>
            <TableCell>{d.driver_name}</TableCell>
            <TableCell sx={{ fontFamily: "monospace" }}>{d.vehicle_number}</TableCell>
            <TableCell>
              <Chip
                label={d.apparent_condition?.toUpperCase()}
                size="small"
                color={d.apparent_condition === "good" ? "success" : d.apparent_condition === "fair" ? "warning" : "error"}
              />
            </TableCell>
            <TableCell>{formatDate(d.received_at)}</TableCell>
            <TableCell sx={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {d.notes || "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Paper>
);

const WeighbridgeDetail: React.FC<{ weighbridge: any }> = ({ weighbridge }) => {
  const variance = Number(weighbridge.quantity_variance_kg);
  return (
    <Grid container spacing={1}>
      <Row label="Gross Weight" value={formatKg(weighbridge.gross_weight_kg)} />
      <Row label="Tare Weight" value={formatKg(weighbridge.tare_weight_kg)} />
      <Row label="Net Weight" value={formatKg(weighbridge.net_weight_kg)} bold />
      <Row
        label="Variance"
        value={
          <Typography
            variant="body2"
            fontWeight={700}
            sx={{ color: variance >= 0 ? "#4caf50" : "#f44336" }}
          >
            {variance >= 0 ? "+" : ""}{formatKg(variance)}
          </Typography>
        }
      />
      <Row label="Weighed At" value={formatDate(weighbridge.weighed_at)} />
      {weighbridge.notes && <Row label="Notes" value={weighbridge.notes} />}
    </Grid>
  );
};

const InvoiceDetail: React.FC<{ invoice: any; payments: any[] }> = ({ invoice, payments }) => {
  const paidPct =
    invoice.amount_due > 0
      ? Math.min(100, (Number(invoice.amount_paid) / Number(invoice.amount_due)) * 100)
      : 0;

  return (
    <Box>
      <Grid container spacing={1} mb={2}>
        <Row label="Invoice #" value={invoice.invoice_number} />
        <Row label="Grain Type" value={invoice.grain_type_name || "—"} />
        <Row label="Quantity" value={formatKg(invoice.quantity_kg)} />
        <Row label="Amount Due" value={formatCurrency(invoice.amount_due)} />
        <Row label="Amount Paid" value={formatCurrency(invoice.amount_paid)} />
        <Row
          label="Balance Due"
          value={
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ color: Number(invoice.balance_due) > 0 ? "#f44336" : "#4caf50" }}
            >
              {formatCurrency(invoice.balance_due)}
            </Typography>
          }
        />
        <Row
          label="Status"
          value={
            <Chip
              label={invoice.status_display || invoice.status}
              size="small"
              sx={{ bgcolor: getStatusColor(invoice.status), color: "#fff" }}
            />
          }
        />
        <Row label="Due Date" value={invoice.due_date ? formatDate(invoice.due_date) : "—"} />
      </Grid>

      {/* Payment progress bar */}
      <Box mb={2}>
        <Box display="flex" justifyContent="space-between" mb={0.5}>
          <Typography variant="caption" color="text.primary">Payment Progress</Typography>
          <Typography variant="caption" fontWeight={700}>{paidPct.toFixed(0)}%</Typography>
        </Box>
        <Box sx={{ height: 8, bgcolor: "#e0e0e0", borderRadius: 4, overflow: "hidden" }}>
          <Box
            sx={{
              height: "100%",
              width: `${paidPct}%`,
              bgcolor: paidPct === 100 ? "#4caf50" : "#1976d2",
              borderRadius: 4,
              transition: "width 0.5s ease",
            }}
          />
        </Box>
      </Box>

      {/* Payment history */}
      {payments.length > 0 ? (
        <>
          <Typography variant="subtitle2" fontWeight={700} mb={1}>
            Payments ({payments.length})
          </Typography>
          <Paper variant="outlined" sx={{ overflow: "hidden" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "action.hover" }}>
                  {["Payment #", "Method", "Reference", "Amount", "Status", "Date"].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.75rem" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((p: any) => (
                  <TableRow key={p.id} hover>
                    <TableCell>
                      <Typography variant="body2" color="primary" fontWeight={600}>
                        {p.payment_number}
                      </Typography>
                    </TableCell>
                    <TableCell>{p.method_display || p.method}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace" }}>{p.reference_number || "—"}</TableCell>
                    <TableCell >{formatCurrency(p.amount)}</TableCell>
                    <TableCell>
                      <Chip
                        label={p.status_display || p.status}
                        size="small"
                        sx={{ bgcolor: getStatusColor(p.status), color: "#fff" }}
                      />
                    </TableCell>
                    <TableCell>{formatDate(p.completed_at || p.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </>
      ) : (
        <Alert severity="info" sx={{ mt: 1 }}>No payments recorded yet.</Alert>
      )}
    </Box>
  );
};

const LotDetail: React.FC<{ lot: any }> = ({ lot }) => (
  <Grid container spacing={1}>
    <Row label="Lot #" value={lot.lot_number} />
    <Row label="Investor" value={lot.investor_name || "—"} />
    <Row label="Grain Type" value={lot.grain_type_name} />
    <Row label="Quality Grade" value={lot.quality_grade_name || "—"} />
    <Row label="Original Qty" value={formatKg(lot.original_quantity_kg)} />
    <Row label="Available" value={formatKg(lot.available_quantity_kg)} />
    <Row label="Sold" value={formatKg(lot.sold_quantity_kg)} />
    {Number(lot.rejected_quantity_kg) > 0 && (
      <Row label="Rejected" value={formatKg(lot.rejected_quantity_kg)} />
    )}
    <Grid item xs={12}><Divider sx={{ my: 0.5 }} /></Grid>
    <Row label="Total Sourcing Cost" value={formatCurrency(lot.total_sourcing_cost)} />
    <Row label="Cost/kg" value={formatCurrency(lot.cost_per_kg)} bold />
    <Row
      label="Status"
      value={
        <Chip
          label={formatStatus(lot.status)}
          size="small"
          sx={{ bgcolor: getStatusColor(lot.status), color: "#fff" }}
        />
      }
    />
  </Grid>
);

const BuyerOrdersDetail: React.FC<{ orders: any[] }> = ({ orders }) => (
  <Box>
    {orders.map((bo: any, idx: number) => (
      <Box key={bo.id} mb={idx < orders.length - 1 ? 3 : 0}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Typography variant="subtitle2" fontWeight={700}>
            {bo.order_number}
          </Typography>
          <Typography variant="body2" color="text.primary">—</Typography>
          <Typography variant="body2">{bo.buyer_name}</Typography>
          <Chip
            label={bo.status_display || formatStatus(bo.status)}
            size="small"
            sx={{ bgcolor: getStatusColor(bo.status), color: "#fff", ml: "auto" }}
          />
        </Box>

        <Grid container spacing={1} mb={1}>
          <Row label="Subtotal" value={formatCurrency(bo.subtotal)} />
          <Row label="COGS" value={formatCurrency(bo.total_cogs)} />
          <Row label="Selling Expenses" value={formatCurrency(bo.total_selling_expenses)} />
          <Row label="Gross Profit" value={formatCurrency(bo.gross_profit)} bold />
        </Grid>

        {/* Order lines */}
        {bo.lines && bo.lines.length > 0 && (
          <Box mb={1}>
            <Typography variant="caption" fontWeight={700} color="text.primary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
              Lines
            </Typography>
            <Paper variant="outlined" sx={{ mt: 0.5, overflow: "hidden" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    {["Lot #", "Grain", "Qty (kg)", "Price/kg", "Line Total", "COGS", "Profit"].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.7rem" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bo.lines.map((line: any) => (
                    <TableRow key={line.id} hover>
                      <TableCell sx={{ fontSize: "0.75rem" }}>{line.lot_number}</TableCell>
                      <TableCell sx={{ fontSize: "0.75rem" }}>{line.grain_type_name || line.grain_type}</TableCell>
                      <TableCell sx={{ fontSize: "0.75rem" }}>{Number(line.quantity_kg).toLocaleString()}</TableCell>
                      <TableCell sx={{ fontSize: "0.75rem" }}>{formatCurrency(line.sale_price_per_kg)}</TableCell>
                      <TableCell sx={{ fontSize: "0.75rem", fontWeight: 600 }}>{formatCurrency(line.line_total)}</TableCell>
                      <TableCell sx={{ fontSize: "0.75rem" }}>{formatCurrency(line.cogs_total)}</TableCell>
                      <TableCell sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#4caf50" }}>{formatCurrency(line.line_gross_profit)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Box>
        )}

        {/* Sale expenses */}
        {bo.sale_expenses && bo.sale_expenses.length > 0 && (
          <Box mb={1}>
            <Typography variant="caption" fontWeight={700} color="text.primary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
              Sale Expenses
            </Typography>
            <Paper variant="outlined" sx={{ mt: 0.5, overflow: "hidden" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    {["Category", "Description", "Amount", "Reference"].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.7rem" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bo.sale_expenses.map((exp: any) => (
                    <TableRow key={exp.id} hover>
                      <TableCell sx={{ fontSize: "0.75rem", textTransform: "capitalize" }}>{exp.category}</TableCell>
                      <TableCell sx={{ fontSize: "0.75rem" }}>{exp.description}</TableCell>
                      <TableCell sx={{ fontSize: "0.75rem", fontWeight: 600 }}>{formatCurrency(exp.amount)}</TableCell>
                      <TableCell sx={{ fontSize: "0.75rem", fontFamily: "monospace" }}>{exp.receipt_reference || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Box>
        )}

        {/* Invoice */}
        {bo.buyer_invoice && (
          <Box mt={1} p={1.5} bgcolor="#f5f5f5" borderRadius={1} border="1px solid #e0e0e0">
            <Typography variant="caption" fontWeight={700} color="text.primary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
              Buyer Invoice
            </Typography>
            <Grid container spacing={1} mt={0.5}>
              <Row label="Invoice #" value={bo.buyer_invoice.invoice_number} />
              <Row label="Amount Due" value={formatCurrency(bo.buyer_invoice.amount_due)} />
              <Row label="Amount Paid" value={formatCurrency(bo.buyer_invoice.amount_paid)} />
              <Row
                label="Balance"
                value={
                  <Typography variant="body2" fontWeight={700} sx={{ color: Number(bo.buyer_invoice.balance_due) > 0 ? "#f44336" : "#4caf50" }}>
                    {formatCurrency(bo.buyer_invoice.balance_due)}
                  </Typography>
                }
              />
              <Row
                label="Status"
                value={
                  <Chip
                    label={bo.buyer_invoice.status?.toUpperCase()}
                    size="small"
                    sx={{ bgcolor: getStatusColor(bo.buyer_invoice.status), color: "#fff" }}
                  />
                }
              />
              <Row label="Due Date" value={bo.buyer_invoice.due_date ? formatDate(bo.buyer_invoice.due_date) : "—"} />
            </Grid>
          </Box>
        )}

        {/* Buyer payments */}
        {bo.buyer_payments && bo.buyer_payments.length > 0 && (
          <Box mt={1}>
            <Typography variant="caption" fontWeight={700} color="text.primary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
              Buyer Payments
            </Typography>
            <Paper variant="outlined" sx={{ mt: 0.5, overflow: "hidden" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    {["Payment #", "Method", "Reference", "Amount", "Status", "Date"].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.7rem" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bo.buyer_payments.map((p: any) => (
                    <TableRow key={p.id} hover>
                      <TableCell sx={{ fontSize: "0.75rem", color: "#1976d2", fontWeight: 600 }}>{p.payment_number}</TableCell>
                      <TableCell sx={{ fontSize: "0.75rem", textTransform: "capitalize" }}>{p.method}</TableCell>
                      <TableCell sx={{ fontSize: "0.75rem", fontFamily: "monospace" }}>{p.reference_number || "—"}</TableCell>
                      <TableCell sx={{ fontSize: "0.75rem", fontWeight: 600 }}>{formatCurrency(p.amount)}</TableCell>
                      <TableCell>
                        <Chip label={p.status} size="small" sx={{ bgcolor: getStatusColor(p.status), color: "#fff", fontSize: "0.65rem" }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.75rem" }}>{formatDate(p.payment_date || p.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Box>
        )}

        {idx < orders.length - 1 && <Divider sx={{ mt: 2 }} />}
      </Box>
    ))}
  </Box>
);

const SettlementDetail: React.FC<{ settlement: any }> = ({ settlement }) => (
  <Grid container spacing={1}>
    <Row label="Settlement #" value={settlement.settlement_number} />
    <Row label="Order #" value={settlement.order_number} />
    <Row label="Invoice #" value={settlement.invoice_number} />
    <Grid item xs={12}><Divider sx={{ my: 0.5 }} /></Grid>
    <Row label="Buyer Revenue" value={formatCurrency(settlement.buyer_revenue)} />
    <Row label="Total COGS" value={formatCurrency(settlement.total_cogs)} />
    <Row label="Selling Expenses" value={formatCurrency(settlement.total_selling_expenses)} />
    <Grid item xs={12}><Divider sx={{ my: 0.5 }} /></Grid>
    <Row
      label="Gross Profit"
      value={
        <Typography variant="body2" fontWeight={700} sx={{ color: Number(settlement.gross_profit) >= 0 ? "#4caf50" : "#f44336" }}>
          {formatCurrency(settlement.gross_profit)} ({settlement.gross_margin_pct}%)
        </Typography>
      }
    />
    <Row label="Investor Share" value={`${settlement.investor_share_pct}%`} />
    <Row label="Platform Share" value={`${settlement.platform_share_pct}%`} />
    <Row label="Investor Margin" value={formatCurrency(settlement.investor_margin)} />
    <Row label="Platform Fee" value={formatCurrency(settlement.platform_fee)} />
    <Grid item xs={12}><Divider sx={{ my: 0.5 }} /></Grid>
    <Row label="Investor Return" value={formatCurrency(settlement.investor_return)} bold />
    <Row
      label="Status"
      value={
        <Chip
          label={formatStatus(settlement.status)}
          size="small"
          sx={{ bgcolor: getStatusColor(settlement.status), color: "#fff" }}
        />
      }
    />
    <Row label="Settled At" value={settlement.settled_at ? formatDate(settlement.settled_at) : "—"} />
  </Grid>
);

export default TransactionTree;