/**
 * BuyerContractDetails.tsx
 *
 * Detail view for a single BuyerContract. Shows:
 *   - Header card with status / aggregates / fulfillment %
 *   - Contract terms (price, currency, payment terms, delivery window)
 *   - Child Buyer Orders table — "+ New Delivery Order" pre-fills the
 *     contract so users can create truckload orders quickly
 *   - Invoices for this contract (each child order's invoice)
 */

import { FC, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert, Box, Button, Card, CardContent, Chip, Divider, Grid, IconButton,
  LinearProgress, Tab, Tabs, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Tooltip,
} from "@mui/material";
import { toast } from "react-hot-toast";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HandshakeIcon from "@mui/icons-material/Handshake";
import AddIcon from "@mui/icons-material/Add";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";

import useTitle from "../../hooks/useTitle";
import LoadingScreen from "../../components/LoadingScreen";
import { Span } from "../../components/Typography";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import { SourcingService } from "./Sourcing.service";
import { formatCurrency } from "./SourcingConstants";
import {
  IBuyerContract, IBuyerOrder, IBuyerInvoice,
} from "./Sourcing.interface";

const STATUS_COLORS: Record<string, any> = {
  draft: "default",
  active: "primary",
  completed: "success",
  cancelled: "error",
};
const BO_STATUS_COLORS: Record<string, any> = {
  quotation: "info", draft: "default", confirmed: "primary",
  dispatched: "warning", delivered: "info",
  invoiced: "secondary", completed: "success", cancelled: "error",
};
const INV_STATUS_COLORS: Record<string, any> = {
  draft: "default", issued: "primary", partial: "warning",
  paid: "success", overdue: "error", cancelled: "error",
};

const InfoRow: FC<{ label: string; value?: string | null }> = ({ label, value }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.75 }}>
    <Span sx={{ color: "text.secondary", fontSize: 13 }}>{label}</Span>
    <Span sx={{ fontWeight: 600, fontSize: 13 }}>{value || "—"}</Span>
  </Box>
);

const BuyerContractDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<IBuyerContract | null>(null);
  const [orders, setOrders] = useState<IBuyerOrder[]>([]);
  const [invoices, setInvoices] = useState<IBuyerInvoice[]>([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useTitle(contract ? `Contract ${contract.contract_number}` : "Buyer Contract");

  useEffect(() => { if (id) fetchAll(); /* eslint-disable-next-line */ }, [id]);

  const fetchAll = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [c, os, invs] = await Promise.all([
        SourcingService.getBuyerContractDetails(id),
        SourcingService.getBuyerContractOrders(id).catch(() => [] as IBuyerOrder[]),
        SourcingService.getBuyerContractInvoices(id).catch(() => [] as IBuyerInvoice[]),
      ]);
      setContract(c);
      setOrders(Array.isArray(os) ? os : []);
      setInvoices(Array.isArray(invs) ? invs : []);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to load contract");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusAction = async (action: "activate" | "complete" | "cancel") => {
    if (!id) return;
    setActionLoading(true);
    try {
      if (action === "activate") await SourcingService.activateBuyerContract(id);
      if (action === "complete") await SourcingService.completeBuyerContract(id);
      if (action === "cancel")   await SourcingService.cancelBuyerContract(id);
      toast.success("Contract updated");
      fetchAll();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!contract) return <Alert severity="error">Contract not found.</Alert>;

  const pct = Math.min(Number(contract.fulfillment_pct || 0), 100);
  const qtyDisplay = (kg: string | number) => {
    const n = Number(kg || 0);
    return contract.trade_unit === "tonne"
      ? `${(n / 1000).toLocaleString("en-UG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT`
      : `${n.toLocaleString("en-UG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} kg`;
  };

  return (
    <Box pt={2} pb={4}>
      {/* ── Header ── */}
      <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1, mb: 3 }}>
        <Tooltip title="Back to contracts">
          <IconButton onClick={() => navigate("/admin/sourcing/buyer-contracts")}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <HandshakeIcon sx={{ fontSize: 30, color: "primary.main" }} />
        <Typography variant="h4">{contract.contract_number}</Typography>
        <Chip
          label={contract.status_display || contract.status.toUpperCase()}
          color={STATUS_COLORS[contract.status]}
          sx={{ ml: 1 }}
        />
      </Box>

      {/* ── Action buttons ── */}
      <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {contract.status === "draft" && (
          <Button
            variant="contained" color="success" startIcon={<PlayArrowIcon />}
            disabled={actionLoading}
            onClick={() => handleStatusAction("activate")}
          >
            Activate Contract
          </Button>
        )}
        {(contract.status === "draft" || contract.status === "active") && (
          <Button
            variant="contained" startIcon={<AddIcon />}
            onClick={() => {
              const qs = new URLSearchParams({
                contract: contract.id,
                buyer: contract.buyer,
                hub: contract.hub,
                grain_type: contract.grain_type,
                currency: contract.currency,
                trade_unit: contract.trade_unit,
              }).toString();
              navigate(`/admin/sourcing/buyer-orders?${qs}&new=1`);
            }}
          >
            New Delivery Order
          </Button>
        )}
        {contract.status === "active" && (
          <Button
            variant="outlined" color="success" startIcon={<DoneAllIcon />}
            disabled={actionLoading}
            onClick={() => handleStatusAction("complete")}
          >
            Mark Completed
          </Button>
        )}
        {contract.status !== "completed" && contract.status !== "cancelled" && (
          <Button
            variant="outlined" color="error" startIcon={<CancelIcon />}
            disabled={actionLoading}
            onClick={() => { if (window.confirm("Cancel this contract?")) handleStatusAction("cancel"); }}
          >
            Cancel Contract
          </Button>
        )}
      </Box>

      {/* ── Summary cards ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Volume Contracted", value: qtyDisplay(contract.contracted_quantity_kg), color: "text.primary" },
          { label: "Delivered", value: qtyDisplay(contract.delivered_quantity_kg), color: "primary.main" },
          { label: "Remaining", value: qtyDisplay(contract.remaining_quantity_kg), color: pct >= 100 ? "success.main" : "warning.main" },
          { label: "Contract Value", value: formatCurrency(contract.contracted_total_value, contract.currency), color: "text.primary" },
          { label: "Total Invoiced", value: formatCurrency(contract.total_invoiced, contract.currency), color: "info.main" },
          { label: "Total Paid", value: formatCurrency(contract.total_paid, contract.currency), color: "success.main" },
          { label: "Outstanding", value: formatCurrency(contract.total_balance_due, contract.currency), color: Number(contract.total_balance_due) > 0 ? "error.main" : "success.main" },
          { label: "Gross Profit (UGX)", value: formatCurrency(contract.total_gross_profit, "UGX"), color: Number(contract.total_gross_profit) >= 0 ? "success.main" : "error.main" },
        ].map(({ label, value, color }) => (
          <Grid key={label} item xs={6} sm={3}>
            <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
              <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography variant="overline" color="text.secondary" display="block">{label}</Typography>
                <Typography variant="h6" fontWeight={700} sx={{ color }}>{value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Fulfillment progress ── */}
      <Card elevation={0} sx={{ border: "1px solid #e0e0e0", mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography variant="subtitle1" fontWeight={700}>Fulfillment Progress</Typography>
            <Typography variant="subtitle1" fontWeight={700} color={pct >= 100 ? "success.main" : "text.primary"}>
              {pct.toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate" value={pct}
            sx={{ height: 10, borderRadius: 5 }}
            color={pct >= 100 ? "success" : pct >= 60 ? "primary" : "warning"}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            {qtyDisplay(contract.delivered_quantity_kg)} delivered of {qtyDisplay(contract.contracted_quantity_kg)} contracted
            {" · "}{contract.child_order_count} delivery order{contract.child_order_count === 1 ? "" : "s"}
          </Typography>
        </CardContent>
      </Card>

      {/* ── Two-column detail ── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: "1px solid #e0e0e0", height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Contract Terms</Typography>
              <Divider sx={{ mb: 1 }} />
              <InfoRow label="Buyer" value={contract.buyer_detail?.business_name || contract.buyer_name} />
              <InfoRow label="Hub" value={contract.hub_name} />
              <InfoRow label="Product" value={contract.grain_type_name} />
              <InfoRow label="Price" value={`${formatCurrency(contract.contracted_price_per_unit, contract.currency)} / ${contract.trade_unit === "tonne" ? "MT" : "kg"}`} />
              <InfoRow label="Currency" value={contract.currency_display || contract.currency} />
              {contract.currency !== "UGX" && (
                <InfoRow label="FX Rate to UGX" value={contract.exchange_rate_to_ugx || "—"} />
              )}
              <InfoRow label="Payment Terms" value={contract.payment_terms_days === 0 ? "On delivery" : `Net ${contract.payment_terms_days} days`} />
              <InfoRow label="Delivery Window" value={
                contract.delivery_start_date || contract.delivery_end_date
                  ? `${contract.delivery_start_date ? formatDateToDDMMYYYY(contract.delivery_start_date) : "—"} → ${contract.delivery_end_date ? formatDateToDDMMYYYY(contract.delivery_end_date) : "—"}`
                  : "—"
              } />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: "1px solid #e0e0e0", height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Audit Trail</Typography>
              <Divider sx={{ mb: 1 }} />
              <InfoRow label="Created By" value={contract.created_by_name} />
              <InfoRow label="Created At" value={formatDateToDDMMYYYY(contract.created_at)} />
              <InfoRow label="Updated At" value={formatDateToDDMMYYYY(contract.updated_at)} />
              <InfoRow label="Completed At" value={contract.completed_at ? formatDateToDDMMYYYY(contract.completed_at) : "—"} />
              {contract.notes && (
                <Box sx={{ mt: 1.5 }}>
                  <Span sx={{ fontWeight: 600, color: "text.secondary" }}>Notes:</Span>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{contract.notes}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Tabs: Orders / Invoices ── */}
      <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tab label={`Delivery Orders (${orders.length})`} />
          <Tab label={`Invoices (${invoices.length})`} />
        </Tabs>

        {tab === 0 && (
          <Box sx={{ p: 2 }}>
            {orders.length === 0 ? (
              <Alert severity="info">
                No delivery orders yet.
                {(contract.status === "draft" || contract.status === "active") && (
                  <> Click <strong>New Delivery Order</strong> to add the first truckload.</>
                )}
              </Alert>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "action.hover" }}>
                      {["Order #", "Status", "Revenue", "Gross Profit (UGX)", "Created", ""].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map(o => (
                      <TableRow key={o.id} hover sx={{ cursor: "pointer" }}
                        onClick={() => navigate(`/admin/sourcing/buyer-orders/${o.id}`)}>
                        <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>{o.order_number}</TableCell>
                        <TableCell>
                          <Chip label={(o.status || "").toUpperCase()} size="small" color={BO_STATUS_COLORS[o.status] ?? "default"} />
                        </TableCell>
                        <TableCell>{formatCurrency(o.subtotal, o.currency || contract.currency)}</TableCell>
                        <TableCell sx={{ color: (o.gross_profit ?? 0) >= 0 ? "success.main" : "error.main" }}>
                          {formatCurrency(o.gross_profit, "UGX")}
                        </TableCell>
                        <TableCell sx={{ fontSize: 12 }}>{formatDateToDDMMYYYY(o.created_at)}</TableCell>
                        <TableCell>
                          <Tooltip title="Open">
                            <IconButton size="small"><VisibilityIcon fontSize="small" /></IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {tab === 1 && (
          <Box sx={{ p: 2 }}>
            {invoices.length === 0 ? (
              <Alert severity="info">No invoices have been issued on this contract yet.</Alert>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "action.hover" }}>
                      {["Invoice #", "Order #", "Amount Due", "Paid", "Balance", "Status", "Due Date"].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoices.map((inv: any) => (
                      <TableRow key={inv.id} hover sx={{ cursor: "pointer" }}
                        onClick={() => navigate(`/admin/sourcing/buyer-invoices/${inv.id}`)}>
                        <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>{inv.invoice_number}</TableCell>
                        <TableCell sx={{ fontSize: 12 }}>{inv.order_number || "—"}</TableCell>
                        <TableCell>{formatCurrency(inv.amount_due, inv.currency || contract.currency)}</TableCell>
                        <TableCell sx={{ color: "success.main" }}>{formatCurrency(inv.amount_paid, inv.currency || contract.currency)}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: Number(inv.balance_due) > 0 ? "error.main" : "success.main" }}>
                          {formatCurrency(inv.balance_due, inv.currency || contract.currency)}
                        </TableCell>
                        <TableCell>
                          <Chip label={(inv.status || "").toUpperCase()} size="small" color={INV_STATUS_COLORS[inv.status] ?? "default"} />
                        </TableCell>
                        <TableCell sx={{ fontSize: 12 }}>
                          {inv.due_date ? formatDateToDDMMYYYY(inv.due_date) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default BuyerContractDetails;
