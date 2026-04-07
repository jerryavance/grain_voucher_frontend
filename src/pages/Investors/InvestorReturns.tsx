/**
 * InvestorReturns.tsx — My Returns page (investor-facing)
 *
 * Three tabs:
 *   1. All Settlements  — settled allocations with confirmed margin + ROI
 *   2. Active Allocations — capital currently deployed in live trades
 *   3. Receivables       — active trades where a buyer invoice has been issued;
 *                          shows estimated margin before settlement so the
 *                          investor can see their probable return in real time.
 */
import {
  Box, Card, CardContent, Typography, Chip, Alert,
  CircularProgress, Tooltip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import useTitle from "../../hooks/useTitle";
import { SourcingService } from "../Sourcing/Sourcing.service";
import {
  IInvestorAllocationsResults,
  IInvestorReceivable,
} from "../Sourcing/Sourcing.interface";
import CustomTable from "../../components/UI/CustomTable";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import { formatCurrency } from "../Sourcing/SourcingConstants";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";

// ─── Tab type ─────────────────────────────────────────────────────────────────

type TTab = "settled" | "active" | "receivables";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const StatusChip = ({ value }: { value: string }) => (
  <Chip
    label={value.toUpperCase()}
    color={
      value === "settled" ? "success" :
      value === "active"  ? "primary" :
      value === "paid"    ? "success" :
      value === "partial" ? "warning" :
      value === "overdue" ? "error"   :
      value === "issued"  ? "info"    : "default"
    }
    size="small"
  />
);

// ─── Main Component ───────────────────────────────────────────────────────────

const InvestorReturns = () => {
  useTitle("My Returns");

  const [activeTab, setActiveTab] = useState<TTab>("settled");

  // Allocations state (settled + active tabs)
  const [allocations, setAllocations] = useState<IInvestorAllocationsResults>();
  const [allocFilters, setAllocFilters] = useState<any>({
    page: 1,
    page_size: INITIAL_PAGE_SIZE,
    status: "settled",
  });

  // Receivables state
  const [receivables, setReceivables] = useState<IInvestorReceivable[]>([]);
  const [receivablesLoading, setReceivablesLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [totalStats, setTotalStats] = useState({
    totalAllocated: 0,
    totalReturned: 0,
    totalMargin: 0,
    roi: 0,
  });

  // ── Fetch allocations (settled / active) ────────────────────────────────────
  useEffect(() => {
    if (activeTab !== "receivables") {
      fetchAllocations();
    }
  }, [allocFilters, activeTab]);

  // ── Fetch receivables ────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === "receivables") {
      fetchReceivables();
    }
  }, [activeTab]);

  const fetchAllocations = async () => {
    try {
      setLoading(true);
      const response = await SourcingService.getMyInvestorAllocations(allocFilters);
      setAllocations(response);

      if (response.results) {
        const totals = response.results.reduce(
          (acc, alloc) => ({
            totalAllocated: acc.totalAllocated + parseFloat(alloc.amount_allocated.toString()),
            totalReturned:  acc.totalReturned  + parseFloat(alloc.amount_returned.toString()),
            totalMargin:    acc.totalMargin    + parseFloat(alloc.investor_margin.toString()),
          }),
          { totalAllocated: 0, totalReturned: 0, totalMargin: 0 }
        );
        const roi = totals.totalAllocated > 0
          ? (totals.totalMargin / totals.totalAllocated) * 100
          : 0;
        setTotalStats({ ...totals, roi });
      }
    } catch (error) {
      console.error("Error fetching returns:", error);
      toast.error("Failed to fetch returns");
    } finally {
      setLoading(false);
    }
  };

  const fetchReceivables = async () => {
    try {
      setReceivablesLoading(true);
      const data = await SourcingService.getInvestorReceivables();
      setReceivables(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching receivables:", error);
      toast.error("Failed to fetch receivables");
    } finally {
      setReceivablesLoading(false);
    }
  };

  // ── Switch tab ───────────────────────────────────────────────────────────────
  const switchTab = (tab: TTab) => {
    setActiveTab(tab);
    if (tab === "settled") {
      setAllocFilters((f: any) => ({ ...f, status: "settled", page: 1 }));
    } else if (tab === "active") {
      setAllocFilters((f: any) => ({ ...f, status: "active", page: 1 }));
    }
  };

  // ── Allocation columns (settled + active) ────────────────────────────────────
  const allocationColumns = [
    {
      Header: "Allocation #",
      accessor: "allocation_number",
      minWidth: 150,
    },
    {
      Header: "Source Order",
      accessor: "source_order_number",
      minWidth: 150,
    },
    {
      Header: "Amount Allocated",
      accessor: "amount_allocated",
      minWidth: 150,
      Cell: ({ value }: any) => formatCurrency(value),
    },
    {
      Header: "Investor Margin",
      accessor: "investor_margin",
      minWidth: 150,
      Cell: ({ value }: any) => {
        const n = parseFloat(value);
        return (
          <Typography
            fontWeight="medium"
            sx={{ color: n >= 0 ? "success.main" : "error.main" }}
          >
            {formatCurrency(value)}
          </Typography>
        );
      },
    },
    {
      Header: "Amount Returned",
      accessor: "amount_returned",
      minWidth: 150,
      Cell: ({ value }: any) => (
        <Typography fontWeight="medium">{formatCurrency(value)}</Typography>
      ),
    },
    {
      Header: "ROI",
      accessor: "roi",
      minWidth: 100,
      Cell: ({ row }: any) => {
        const allocated = parseFloat(row.original.amount_allocated);
        const margin    = parseFloat(row.original.investor_margin);
        const roi       = allocated > 0 ? ((margin / allocated) * 100).toFixed(2) : "0.00";
        return (
          <Chip
            label={`${roi}%`}
            color={parseFloat(roi) > 0 ? "success" : parseFloat(roi) < 0 ? "error" : "default"}
            size="small"
          />
        );
      },
    },
    {
      Header: "Allocated Date",
      accessor: "allocated_at",
      minWidth: 120,
      Cell: ({ value }: any) => formatDateToDDMMYYYY(value),
    },
    {
      Header: "Settled Date",
      accessor: "settled_at",
      minWidth: 120,
      Cell: ({ value }: any) => (value ? formatDateToDDMMYYYY(value) : "—"),
    },
    {
      Header: "Status",
      accessor: "status",
      minWidth: 120,
      Cell: ({ value }: any) => <StatusChip value={value} />,
    },
  ];

  // ── Summary stat cards (settled / active tabs only) ──────────────────────────
  const statCards = [
    {
      icon: <AccountBalanceIcon sx={{ mr: 1, color: "primary.main" }} />,
      label: "Total Allocated",
      value: formatCurrency(totalStats.totalAllocated),
      color: "text.primary",
    },
    {
      icon: <TrendingUpIcon sx={{ mr: 1, color: "success.main" }} />,
      label: "Total Margin Earned",
      value: formatCurrency(totalStats.totalMargin),
      color: "success.main",
    },
    {
      icon: <AccountBalanceIcon sx={{ mr: 1, color: "info.main" }} />,
      label: "Total Returned",
      value: formatCurrency(totalStats.totalReturned),
      color: "text.primary",
    },
    {
      icon: <TrendingUpIcon sx={{ mr: 1, color: "success.main" }} />,
      label: "Average ROI",
      value: `${totalStats.roi.toFixed(2)}%`,
      color: totalStats.roi >= 0 ? "success.main" : "error.main",
    },
  ];

  // ── Loading state (initial load only) ────────────────────────────────────────
  if (loading && !allocations && activeTab !== "receivables") {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box pt={2} pb={4}>

      {/* Page header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <TrendingUpIcon sx={{ fontSize: 40, mr: 2, color: "success.main" }} />
        <Typography variant="h4">My Returns</Typography>
      </Box>

      {/* Summary cards — only meaningful for settled/active tabs */}
      {activeTab !== "receivables" && (
        <Box sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 2.5,
          mb: 3,
        }}>
          {statCards.map(({ icon, label, value, color }) => (
            <Card key={label}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                  {icon}
                  <Typography variant="overline" color="text.primary">{label}</Typography>
                </Box>
                <Typography variant="h5" sx={{ color }} fontWeight="bold">
                  {value}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Info alert */}
      {activeTab === "settled" && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Settled investments where capital and margin have been returned to your account.
            ROI = (Margin Earned ÷ Amount Allocated) × 100
          </Typography>
        </Alert>
      )}
      {activeTab === "active" && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Capital currently deployed in active trades. These will move to Settled once the buyer pays in full.
          </Typography>
        </Alert>
      )}

      {/* Tab chips */}
      <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
        <Chip
          label="All Settlements"
          color={activeTab === "settled" ? "primary" : "default"}
          onClick={() => switchTab("settled")}
          clickable
        />
        <Chip
          label="Active Allocations"
          color={activeTab === "active" ? "primary" : "default"}
          onClick={() => switchTab("active")}
          clickable
        />
        <Chip
          label="Receivables"
          color={activeTab === "receivables" ? "primary" : "default"}
          onClick={() => switchTab("receivables")}
          clickable
          icon={<TrendingUpIcon sx={{ fontSize: "16px !important" }} />}
        />
      </Box>

      {/* ── Allocations table (settled + active) ── */}
      {activeTab !== "receivables" && (
        <CustomTable
          columnShape={allocationColumns}
          data={allocations?.results || []}
          dataCount={allocations?.count || 0}
          pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
          setPageIndex={(page: number) =>
            setAllocFilters((f: any) => ({ ...f, page: page + 1 }))
          }
          pageIndex={allocFilters?.page ? allocFilters.page - 1 : 0}
          setPageSize={(size: number) =>
            setAllocFilters((f: any) => ({ ...f, page_size: size, page: 1 }))
          }
          loading={loading}
        />
      )}

      {/* ── Receivables tab ── */}
      {activeTab === "receivables" && (
        <ReceivablesTab data={receivables} loading={receivablesLoading} />
      )}
    </Box>
  );
};

// ─── Receivables Tab ──────────────────────────────────────────────────────────
//
// Shows every buyer invoice backed by the investor's capital that has been
// issued but not yet fully settled. The key column is "Est. Margin" —
// the investor's projected cut of the current order gross profit, calculated
// using their profit-sharing agreement and applied proportionally to their
// share of total capital in the trade.
//
// Once fully paid the trade moves to "All Settlements" and the confirmed
// margin appears there.

const ReceivablesTab = ({
  data,
  loading,
}: {
  data: IInvestorReceivable[];
  loading: boolean;
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 1 }}>
        No receivables yet. This tab shows trades where a buyer invoice has been issued
        but not yet fully paid — giving you visibility of your estimated margin before
        the trade settles.
      </Alert>
    );
  }

  // Totals
  const totals = data.reduce(
    (acc, r) => ({
      invoiceDue:      acc.invoiceDue      + Number(r.invoice_amount_due),
      invoicePaid:     acc.invoicePaid     + Number(r.invoice_amount_paid),
      invoiceBalance:  acc.invoiceBalance  + Number(r.invoice_balance_due),
      capitalDeployed: acc.capitalDeployed + Number(r.amount_allocated),
      estMargin:       acc.estMargin       + Number(r.projected_investor_margin),
      estReturn:       acc.estReturn       + Number(r.projected_return),
    }),
    { invoiceDue: 0, invoicePaid: 0, invoiceBalance: 0, capitalDeployed: 0, estMargin: 0, estReturn: 0 }
  );

  return (
    <Box>
      <Alert
        severity="info"
        icon={<InfoOutlinedIcon fontSize="inherit" />}
        sx={{ mb: 2 }}
      >
        <strong>Estimated Margin</strong> is your projected return based on the
        current order P&L and your profit-sharing agreement — updated live as
        expenses and sales prices are recorded. It becomes a <strong>Confirmed
        Margin</strong> once the buyer pays in full and the trade settles.
      </Alert>

      {/* Receivables summary cards */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 2,
        mb: 3,
      }}>
        {[
          { label: "Invoices Outstanding",  value: formatCurrency(totals.invoiceDue),      color: "text.primary" },
          { label: "Collected So Far",      value: formatCurrency(totals.invoicePaid),     color: "success.main" },
          { label: "Still to Collect",      value: formatCurrency(totals.invoiceBalance),  color: "error.main"   },
          { label: "Capital Deployed",      value: formatCurrency(totals.capitalDeployed), color: "text.primary" },
          { label: "Est. Total Margin",     value: formatCurrency(totals.estMargin),       color: "primary.main" },
          { label: "Est. Total Return",     value: formatCurrency(totals.estReturn),       color: "primary.main" },
        ].map(({ label, value, color }) => (
          <Card key={label} elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
            <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Typography variant="caption" color="text.primary" display="block">
                {label}
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ color }}>
                {value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Receivables table */}
      <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
        <TableContainer>
          <Table size="small" sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#1565c0" }}>
                {/* Invoice group */}
                <TableCell sx={{ color: "#fff", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 0.8 }}>
                  Invoice #
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 0.8 }}>
                  Buyer · Grain
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 0.8 }}>
                  Invoice Amount
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 0.8 }}>
                  Paid
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 0.8 }}>
                  Balance Due
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 0.8 }}>
                  Status
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 0.8 }}>
                  Due Date
                </TableCell>
                {/* Your return group */}
                <TableCell sx={{ color: "#fff", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 0.8 }}>
                  Capital Deployed
                </TableCell>
                <TableCell sx={{ color: "#e3f2fd", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 0.8 }}>
                  <Tooltip title="Estimated margin on this trade applying your profit-sharing agreement to the current order gross profit. Updates live until settlement.">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      Est. Margin
                      <InfoOutlinedIcon sx={{ fontSize: 13, opacity: 0.8 }} />
                    </Box>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ color: "#e3f2fd", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 0.8 }}>
                  <Tooltip title="Capital deployed + estimated margin">
                    <span>Est. Return</span>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ color: "#e3f2fd", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 0.8 }}>
                  <Tooltip title="Estimated margin ÷ capital deployed × 100">
                    <span>Est. ROI %</span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data.map((item, idx) => {
                const estMargin  = Number(item.projected_investor_margin);
                const estReturn  = Number(item.projected_return);
                const estRoi     = Number(item.projected_margin_pct);
                const balanceDue = Number(item.invoice_balance_due);
                const amtPaid    = Number(item.invoice_amount_paid);

                return (
                  <TableRow key={item.buyer_invoice_id || idx} hover>
                    {/* Invoice # */}
                    <TableCell sx={{ fontWeight: 700, color: "primary.main", whiteSpace: "nowrap" }}>
                      {item.invoice_number}
                    </TableCell>

                    {/* Buyer + grain */}
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {item.buyer_name}
                      </Typography>
                      <Typography variant="caption" color="text.primary">
                        {item.grain_type}
                        {item.hub_name ? ` · ${item.hub_name}` : ""}
                      </Typography>
                    </TableCell>

                    {/* Invoice amount */}
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {formatCurrency(item.invoice_amount_due)}
                    </TableCell>

                    {/* Amount paid */}
                    <TableCell sx={{
                      color: amtPaid > 0 ? "success.main" : "text.primary",
                      whiteSpace: "nowrap",
                    }}>
                      {formatCurrency(item.invoice_amount_paid)}
                    </TableCell>

                    {/* Balance due */}
                    <TableCell sx={{
                      fontWeight: 600,
                      color: balanceDue > 0 ? "error.main" : "success.main",
                      whiteSpace: "nowrap",
                    }}>
                      {formatCurrency(item.invoice_balance_due)}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusChip value={item.invoice_status} />
                    </TableCell>

                    {/* Due date */}
                    <TableCell sx={{
                      whiteSpace: "nowrap",
                      color: item.invoice_status === "overdue" ? "error.main" : "text.primary",
                    }}>
                      {item.invoice_due_date
                        ? formatDateToDDMMYYYY(item.invoice_due_date)
                        : "—"}
                    </TableCell>

                    {/* Capital deployed */}
                    <TableCell sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                      {formatCurrency(item.amount_allocated)}
                    </TableCell>

                    {/* Est. margin */}
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{ color: estMargin >= 0 ? "primary.main" : "error.main" }}
                      >
                        {formatCurrency(estMargin)}
                      </Typography>
                      <Typography variant="caption" color="text.primary">
                        {item.profit_threshold_pct}% threshold · {item.investor_share_pct}% share
                      </Typography>
                    </TableCell>

                    {/* Est. return */}
                    <TableCell sx={{
                      fontWeight: 700,
                      color: "primary.main",
                      whiteSpace: "nowrap",
                    }}>
                      {formatCurrency(estReturn)}
                    </TableCell>

                    {/* Est. ROI % */}
                    <TableCell>
                      <Chip
                        label={`${estRoi.toFixed(2)}%`}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          bgcolor: estRoi >= 0 ? "#e3f2fd" : "#ffebee",
                          color:   estRoi >= 0 ? "#1565c0" : "#c62828",
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>

            {/* Totals footer */}
            <TableBody>
              <TableRow sx={{ bgcolor: "#f6f9fd", borderTop: "2px solid #1565c0" }}>
                <TableCell colSpan={2} sx={{ fontWeight: 700, color: "text.primary", fontSize: "0.72rem", letterSpacing: 0.5 }}>
                  TOTALS ({data.length} invoice{data.length !== 1 ? "s" : ""})
                </TableCell>
                <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                  {formatCurrency(totals.invoiceDue)}
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "success.main", whiteSpace: "nowrap" }}>
                  {formatCurrency(totals.invoicePaid)}
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "error.main", whiteSpace: "nowrap" }}>
                  {formatCurrency(totals.invoiceBalance)}
                </TableCell>
                <TableCell />{/* status */}
                <TableCell />{/* due date */}
                <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                  {formatCurrency(totals.capitalDeployed)}
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: "primary.main", whiteSpace: "nowrap" }}>
                  {formatCurrency(totals.estMargin)}
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: "primary.main", whiteSpace: "nowrap" }}>
                  {formatCurrency(totals.estReturn)}
                </TableCell>
                <TableCell />{/* ROI */}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default InvestorReturns;