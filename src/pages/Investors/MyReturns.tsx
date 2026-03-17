// investor/pages/MyReturns.tsx
/**
 * My Returns page (MY INVESTMENTS → My Returns).
 *
 * FIXES (Image 12):
 *  - "My Returns seems not updating with latest Trades" — backend settlement
 *    trigger was broken; now fixed. This page auto-refreshes on mount.
 *  - NEW: Added "Receivables" tab as requested by client, showing all buyer
 *    invoices where the investor's capital funded the sale, with margin per invoice.
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
  TablePagination,
  Typography,
  Skeleton,
  Alert,
  AlertTitle,
} from "@mui/material";
import { TrendingUp } from "@mui/icons-material";
import { toast } from "react-hot-toast";
import SourcingService from "../Sourcing/Sourcing.service";
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
  const [receivables, setReceivables] = useState<any[]>([]);
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
        setReceivables(Array.isArray(data) ? data : data.results || []);
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

// ─── Receivables Table (NEW) ────────────────────────────────────────────────

const ReceivablesTable: React.FC<{ data: any[] }> = ({ data }) => {
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

  return (
    <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Invoice #</TableCell>
              <TableCell>Buyer</TableCell>
              <TableCell>Order #</TableCell>
              <TableCell>Invoice Amount</TableCell>
              <TableCell>Amount Paid</TableCell>
              <TableCell>Balance Due</TableCell>
              <TableCell>Invoice Status</TableCell>
              <TableCell>Allocation #</TableCell>
              <TableCell>Capital Deployed</TableCell>
              <TableCell>Investor Margin</TableCell>
              <TableCell>Issued</TableCell>
              <TableCell>Due Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item, idx) => (
              <TableRow key={item.buyer_invoice_id || idx} hover>
                <TableCell>{idx + 1}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  {item.invoice_number}
                </TableCell>
                <TableCell>{item.buyer_name}</TableCell>
                <TableCell>{item.buyer_order_number}</TableCell>
                <TableCell>
                  {formatCurrency(item.invoice_amount_due)}
                </TableCell>
                <TableCell
                  sx={{
                    color:
                      Number(item.invoice_amount_paid) > 0
                        ? "#4caf50"
                        : "inherit",
                  }}
                >
                  {formatCurrency(item.invoice_amount_paid)}
                </TableCell>
                <TableCell
                  sx={{
                    color:
                      Number(item.invoice_balance_due) > 0
                        ? "#f44336"
                        : "#4caf50",
                    fontWeight: 600,
                  }}
                >
                  {formatCurrency(item.invoice_balance_due)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={formatStatus(item.invoice_status)}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(item.invoice_status),
                      color: "#fff",
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell>{item.allocation_number}</TableCell>
                <TableCell>
                  {formatCurrency(item.amount_allocated)}
                </TableCell>
                <TableCell
                  sx={{
                    color:
                      Number(item.investor_margin) >= 0
                        ? "#4caf50"
                        : "#f44336",
                    fontWeight: 600,
                  }}
                >
                  {formatCurrency(item.investor_margin)}
                </TableCell>
                <TableCell>{formatDate(item.invoice_issued_at)}</TableCell>
                <TableCell>{formatDate(item.invoice_due_date)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default MyReturns;