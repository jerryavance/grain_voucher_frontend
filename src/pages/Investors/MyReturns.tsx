// investor/pages/MyReturns.tsx
/**
 * My Returns page (MY INVESTMENTS → My Returns).
 *
 * FIXES:
 *  - "My Returns seems not updating with latest Trades" — backend settlement
 *    trigger was fixed. This page auto-refreshes on mount.
 *  - Receivables tab now shows projected margin fields from the backend so
 *    investors can see probable returns before settlement completes.
 */
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Skeleton,
  Alert,
  AlertTitle,
} from "@mui/material";
import { TrendingUp } from "@mui/icons-material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { toast } from "react-hot-toast";
import SourcingService from "../Sourcing/Sourcing.service";
import { IInvestorReceivable } from "../Sourcing/Sourcing.interface";
import {
  formatCurrency,
  formatDate,
  formatPct,
  formatStatus,
  getStatusColor,
} from "../../utils/formatters";

type TabKey = "settled" | "active" | "receivables";

const MyReturns: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("settled");
  const [allocations, setAllocations] = useState<any[]>([]);
  const [receivables, setReceivables] = useState<IInvestorReceivable[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(20);

  // Summary stats
  const [stats, setStats] = useState({
    totalAllocated: 0,
    totalMarginEarned: 0,
    totalReturned: 0,
    averageROI: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "receivables") {
        const data = await SourcingService.getInvestorReceivables();
        setReceivables(Array.isArray(data) ? data : []);
      } else {
        const statusParam =
          activeTab === "settled" ? "settled" : "active";
        const data = await SourcingService.getInvestorAllocations({

          status: statusParam,
          page: page + 1,
          page_size: rowsPerPage,
        });
        const items = data.results || data || [];
        setAllocations(items);

        // Compute summary stats from settled allocations
        if (activeTab === "settled") {
          const totalAlloc = items.reduce(
            (s: number, a: any) => s + Number(a.amount_allocated || 0),
            0
          );
          const totalMargin = items.reduce(
            (s: number, a: any) => s + Number(a.investor_margin || 0),
            0
          );
          const totalRet = items.reduce(
            (s: number, a: any) => s + Number(a.amount_returned || 0),
            0
          );
          const avgROI =
            totalAlloc > 0 ? (totalMargin / totalAlloc) * 100 : 0;

          setStats({
            totalAllocated: totalAlloc,
            totalMarginEarned: totalMargin,
            totalReturned: totalRet,
            averageROI: avgROI,
          });
        }
      }
    } catch (err: any) {
      toast.error("Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, rowsPerPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const statCards = [
    { label: "TOTAL ALLOCATED", value: formatCurrency(stats.totalAllocated) },
    {
      label: "TOTAL MARGIN EARNED",
      value: formatCurrency(stats.totalMarginEarned),
      color: stats.totalMarginEarned >= 0 ? "#4caf50" : "#f44336",
    },
    { label: "TOTAL RETURNED", value: formatCurrency(stats.totalReturned) },
    {
      label: "AVERAGE ROI",
      value: formatPct(stats.averageROI),
      color: stats.averageROI >= 0 ? "#4caf50" : "#f44336",
    },
  ];

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <TrendingUp sx={{ fontSize: 36, color: "#1565c0", mr: 1 }} />
        <Typography variant="h4" fontWeight={700}>
          My Returns
        </Typography>
      </Box>

      {/* ── Summary Cards ──────────────────────────────────────────────── */}
      <Grid container spacing={2} mb={3}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
              <CardContent>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  {card.label}
                </Typography>
                <Typography
                  variant="h5"
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

      {/* Info banner */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>About Returns</AlertTitle>
        This shows all your settled investments where capital and profits have
        been returned to your account. ROI (Return on Investment) = (Margin
        Earned ÷ Amount Allocated) × 100
      </Alert>

      {/* ── Tab Buttons ────────────────────────────────────────────────── */}
      <ButtonGroup sx={{ mb: 3 }}>
        <Button
          variant={activeTab === "settled" ? "contained" : "outlined"}
          onClick={() => {
            setActiveTab("settled");
            setPage(0);
          }}
        >
          All Settled
        </Button>
        <Button
          variant={activeTab === "active" ? "contained" : "outlined"}
          onClick={() => {
            setActiveTab("active");
            setPage(0);
          }}
        >
          Active Allocations
        </Button>
        {/* ✅ NEW: Receivables tab as requested by client */}
        <Button
          variant={activeTab === "receivables" ? "contained" : "outlined"}
          onClick={() => {
            setActiveTab("receivables");
            setPage(0);
          }}
        >
          Receivables
        </Button>
      </ButtonGroup>

      {/* ── Tables ─────────────────────────────────────────────────────── */}
      {loading ? (
        <Box>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={48} sx={{ mb: 0.5 }} />
          ))}
        </Box>
      ) : activeTab === "receivables" ? (
        <ReceivablesTable data={receivables} />
      ) : (
        <AllocationsTable
          data={allocations}
          isSettled={activeTab === "settled"}
        />
      )}
    </Box>
  );
};

// ─── Allocations Table (Settled & Active) ───────────────────────────────────

const AllocationsTable: React.FC<{
  data: any[];
  isSettled: boolean;
}> = ({ data, isSettled }) => {
  if (data.length === 0) {
    return (
      <Card elevation={0} sx={{ border: "1px solid #e0e0e0", p: 4 }}>
        <Typography align="center" color="text.secondary">
          No {isSettled ? "settled" : "active"} allocations found
        </Typography>
      </Card>
    );
  }

  return (
    <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Allocation #</TableCell>
              <TableCell>Source Order</TableCell>
              <TableCell>Amount Allocated</TableCell>
              <TableCell>Investor Margin</TableCell>
              {isSettled && <TableCell>Amount Returned</TableCell>}
              {isSettled && <TableCell>ROI</TableCell>}
              <TableCell>Allocated Date</TableCell>
              {isSettled && <TableCell>Settled Date</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((alloc, idx) => {
              const margin = Number(alloc.investor_margin || 0);
              const allocated = Number(alloc.amount_allocated || 0);
              const roi = allocated > 0 ? (margin / allocated) * 100 : 0;

              return (
                <TableRow key={alloc.id} hover>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{alloc.allocation_number}</TableCell>
                  <TableCell>{alloc.source_order_number}</TableCell>
                  <TableCell>
                    {formatCurrency(alloc.amount_allocated)}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: margin >= 0 ? "#4caf50" : "#f44336",
                      fontWeight: 600,
                    }}
                  >
                    {formatCurrency(margin)}
                  </TableCell>
                  {isSettled && (
                    <TableCell>
                      {formatCurrency(alloc.amount_returned)}
                    </TableCell>
                  )}
                  {isSettled && (
                    <TableCell>
                      <Chip
                        label={formatPct(roi)}
                        size="small"
                        sx={{
                          bgcolor: roi >= 0 ? "#e8f5e9" : "#ffebee",
                          color: roi >= 0 ? "#2e7d32" : "#c62828",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                  )}
                  <TableCell>{formatDate(alloc.allocated_at)}</TableCell>
                  {isSettled && (
                    <TableCell>{formatDate(alloc.settled_at)}</TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

// ─── Receivables Table ──────────────────────────────────────────────────────
//
// Two column groups:
//   LEFT  — invoice / receivable status (what the buyer owes)
//   RIGHT — investor's projected & settled margin (probable return)
//
// Projected margin is always live (recalculated from current order P&L).
// Settled margin is non-zero only after TradeSettlement completes.

const ReceivablesTable: React.FC<{ data: IInvestorReceivable[] }> = ({ data }) => {
  if (data.length === 0) {
    return (
      <Card elevation={0} sx={{ border: "1px solid #e0e0e0", p: 4 }}>
        <Typography align="center" color="text.secondary">
          No receivables found. Receivables appear here when buyer invoices are
          issued for sales funded by your capital.
        </Typography>
      </Card>
    );
  }

  // Totals row
  const totals = data.reduce(
    (acc, item) => ({
      invoiceAmountDue:  acc.invoiceAmountDue  + Number(item.invoice_amount_due),
      invoiceAmountPaid: acc.invoiceAmountPaid + Number(item.invoice_amount_paid),
      invoiceBalanceDue: acc.invoiceBalanceDue + Number(item.invoice_balance_due),
      amountAllocated:   acc.amountAllocated   + Number(item.amount_allocated),
      projectedMargin:   acc.projectedMargin   + Number(item.projected_investor_margin),
      projectedReturn:   acc.projectedReturn   + Number(item.projected_return),
      settledMargin:     acc.settledMargin     + Number(item.investor_margin),
    }),
    {
      invoiceAmountDue: 0, invoiceAmountPaid: 0, invoiceBalanceDue: 0,
      amountAllocated: 0,  projectedMargin: 0,   projectedReturn: 0,
      settledMargin: 0,
    }
  );

  return (
    <Box>
      {/* Explanatory banner */}
      <Alert
        severity="info"
        icon={<InfoOutlinedIcon fontSize="inherit" />}
        sx={{ mb: 2 }}
      >
        <strong>Projected Margin</strong> is your estimated return on each trade
        based on the current order P&L and your profit-sharing agreement — updated
        live before settlement. <strong>Settled Margin</strong> is the confirmed
        amount credited to your account after the invoice is fully paid.
      </Alert>

      <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
        <TableContainer>
          <Table size="small" sx={{ minWidth: 1100 }}>
            <TableHead>
              {/* Group header row */}
              <TableRow sx={{ bgcolor: "#1565c0" }}>
                <TableCell colSpan={2} sx={{ color: "#fff", fontWeight: 700, fontSize: "0.7rem", letterSpacing: 1, textTransform: "uppercase", borderRight: "1px solid rgba(255,255,255,0.2)" }}>
                  Trade
                </TableCell>
                <TableCell colSpan={5} sx={{ color: "#fff", fontWeight: 700, fontSize: "0.7rem", letterSpacing: 1, textTransform: "uppercase", borderRight: "1px solid rgba(255,255,255,0.2)" }}>
                  Invoice / Receivable
                </TableCell>
                <TableCell colSpan={2} sx={{ color: "#fff", fontWeight: 700, fontSize: "0.7rem", letterSpacing: 1, textTransform: "uppercase", borderRight: "1px solid rgba(255,255,255,0.2)" }}>
                  Your Capital
                </TableCell>
                <TableCell colSpan={4} sx={{ color: "#e8f5e9", fontWeight: 700, fontSize: "0.7rem", letterSpacing: 1, textTransform: "uppercase" }}>
                  📈 Your Return
                </TableCell>
              </TableRow>
              {/* Column header row */}
              <TableRow sx={{ bgcolor: "action.hover" }}>
                {/* Trade */}
                <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>Invoice #</TableCell>
                <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>Buyer · Grain · Hub</TableCell>
                {/* Invoice */}
                <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>Inv. Amount</TableCell>
                <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>Paid</TableCell>
                <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>Balance Due</TableCell>
                <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>Due Date</TableCell>
                {/* Capital */}
                <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>Capital Deployed</TableCell>
                <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                  <Tooltip title="Your share of total capital in this trade">
                    <span>Share %</span>
                  </Tooltip>
                </TableCell>
                {/* Return */}
                <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", color: "#1565c0" }}>
                  <Tooltip title="Estimated margin applying your profit-sharing agreement to the current order gross profit. Updates live.">
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      Proj. Margin <InfoOutlinedIcon sx={{ fontSize: 13, opacity: 0.7 }} />
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", color: "#1565c0" }}>
                  <Tooltip title="amount_allocated + projected_investor_margin">
                    <span>Proj. Return</span>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", color: "#1565c0" }}>
                  <Tooltip title="projected_investor_margin ÷ amount_allocated × 100">
                    <span>Proj. ROI %</span>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", color: "#2e7d32" }}>
                  <Tooltip title="Confirmed margin credited to your account after full payment (0 until settlement completes)">
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      Settled Margin <InfoOutlinedIcon sx={{ fontSize: 13, opacity: 0.7 }} />
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data.map((item, idx) => {
                const projMargin  = Number(item.projected_investor_margin);
                const projReturn  = Number(item.projected_return);
                const projRoi     = Number(item.projected_margin_pct);
                const settledMgn  = Number(item.investor_margin);
                const isSettled   = item.allocation_status === "settled";
                const balanceDue  = Number(item.invoice_balance_due);
                const amtPaid     = Number(item.invoice_amount_paid);
                const proportion  = (Number(item.allocation_proportion) * 100).toFixed(1);

                return (
                  <TableRow key={item.buyer_invoice_id || idx} hover>
                    {/* Invoice # */}
                    <TableCell sx={{ fontWeight: 700, color: "primary.main", whiteSpace: "nowrap" }}>
                      {item.invoice_number}
                    </TableCell>

                    {/* Buyer · Grain · Hub */}
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{item.buyer_name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.grain_type}{item.hub_name ? ` · ${item.hub_name}` : ""}
                      </Typography>
                    </TableCell>

                    {/* Invoice amount */}
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {formatCurrency(item.invoice_amount_due)}
                    </TableCell>

                    {/* Amount paid */}
                    <TableCell sx={{ color: amtPaid > 0 ? "#4caf50" : "inherit", whiteSpace: "nowrap" }}>
                      {formatCurrency(item.invoice_amount_paid)}
                    </TableCell>

                    {/* Balance due */}
                    <TableCell sx={{ color: balanceDue > 0 ? "#f44336" : "#4caf50", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {formatCurrency(item.invoice_balance_due)}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip
                        label={formatStatus(item.invoice_status)}
                        size="small"
                        sx={{ bgcolor: getStatusColor(item.invoice_status), color: "#fff", fontWeight: 600, fontSize: "0.68rem" }}
                      />
                    </TableCell>

                    {/* Due date */}
                    <TableCell sx={{ whiteSpace: "nowrap", color: balanceDue > 0 && item.invoice_status === "overdue" ? "#f44336" : "inherit" }}>
                      {formatDate(item.invoice_due_date)}
                    </TableCell>

                    {/* Capital deployed */}
                    <TableCell sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                      {formatCurrency(item.amount_allocated)}
                    </TableCell>

                    {/* Capital share % */}
                    <TableCell>
                      <Chip
                        label={`${proportion}%`}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                      />
                    </TableCell>

                    {/* Projected margin */}
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{ color: projMargin >= 0 ? "#1565c0" : "#f44336" }}
                      >
                        {formatCurrency(projMargin)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        threshold: {item.profit_threshold_pct}% · share: {item.investor_share_pct}%
                      </Typography>
                    </TableCell>

                    {/* Projected return */}
                    <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", color: "#1565c0" }}>
                      {formatCurrency(projReturn)}
                    </TableCell>

                    {/* Projected ROI % */}
                    <TableCell>
                      <Chip
                        label={`${projRoi.toFixed(2)}%`}
                        size="small"
                        sx={{
                          bgcolor: projRoi >= 0 ? "#e3f2fd" : "#ffebee",
                          color:   projRoi >= 0 ? "#1565c0" : "#c62828",
                          fontWeight: 700,
                          fontSize: "0.72rem",
                        }}
                      />
                    </TableCell>

                    {/* Settled margin */}
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {isSettled ? (
                        <Typography variant="body2" fontWeight={700} sx={{ color: "#2e7d32" }}>
                          {formatCurrency(settledMgn)}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                          Pending settlement
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>

            {/* Totals footer */}
            <TableBody>
              <TableRow sx={{ bgcolor: "#f6f9fd", borderTop: "2px solid #1565c0" }}>
                <TableCell colSpan={2} sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.75rem", letterSpacing: 0.5 }}>
                  TOTALS ({data.length} invoice{data.length !== 1 ? "s" : ""})
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{formatCurrency(totals.invoiceAmountDue)}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#4caf50" }}>{formatCurrency(totals.invoiceAmountPaid)}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: totals.invoiceBalanceDue > 0 ? "#f44336" : "#4caf50" }}>
                  {formatCurrency(totals.invoiceBalanceDue)}
                </TableCell>
                <TableCell />{/* status */}
                <TableCell />{/* due date */}
                <TableCell sx={{ fontWeight: 700 }}>{formatCurrency(totals.amountAllocated)}</TableCell>
                <TableCell />{/* share % */}
                <TableCell sx={{ fontWeight: 800, color: "#1565c0" }}>{formatCurrency(totals.projectedMargin)}</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#1565c0" }}>{formatCurrency(totals.projectedReturn)}</TableCell>
                <TableCell />{/* ROI */}
                <TableCell sx={{ fontWeight: 800, color: "#2e7d32" }}>{formatCurrency(totals.settledMargin)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default MyReturns;