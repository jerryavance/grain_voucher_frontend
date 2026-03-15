/**
 * TradeSettlements.tsx — UPDATED: Export added
 */

import { FC, useEffect, useState } from "react";
import { Box, Card, CardContent, Chip, Grid, Typography } from "@mui/material";
import { toast } from "react-hot-toast";
import { Span } from "../../components/Typography";
import CustomTable from "../../components/UI/CustomTable";
import useTitle from "../../hooks/useTitle";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import { SourcingService } from "./Sourcing.service";
import { formatCurrency, formatPercentage } from "./SourcingConstants";
import { ITradeSettlementsResults, IHubPLSummary } from "./Sourcing.interface";
import { ExportButtons, TRADE_SETTLEMENT_EXPORT_COLUMNS } from "./ExportUtils";

const STATUS_COLORS: Record<string, any> = { pending: "warning", processing: "info", completed: "success", failed: "error" };

const TradeSettlements: FC = () => {
  useTitle("Trade Settlements");
  const [settlements, setSettlements] = useState<ITradeSettlementsResults>();
  const [summary, setSummary] = useState<IHubPLSummary | null>(null);
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchData(filters); }, [filters]);
  useEffect(() => { SourcingService.getHubPLSummary().then(setSummary).catch(() => {}); }, []);

  const fetchData = async (params?: any) => { setLoading(true); try { setSettlements(await SourcingService.getTradeSettlements(params)); } catch { toast.error("Failed"); } finally { setLoading(false); } };

  const summaryCards = summary ? [
    { label: "Total Revenue", value: formatCurrency(summary.total_buyer_revenue), color: "primary.main" },
    { label: "Total COGS", value: formatCurrency(summary.total_cogs), color: "text.primary" },
    { label: "Expenses", value: formatCurrency(summary.total_selling_expenses), color: "warning.main" },
    { label: "Gross Profit", value: formatCurrency(summary.gross_profit), color: "success.main" },
    { label: "Margin", value: formatPercentage(summary.gross_margin_pct), color: parseFloat(String(summary.gross_margin_pct)) >= 5 ? "success.main" : "warning.main" },
    { label: "Investor Margins", value: formatCurrency(summary.total_investor_margin), color: "info.main" },
    { label: "Platform Fees", value: formatCurrency(summary.total_platform_fee), color: "primary.main" },
    { label: "Settled", value: String(summary.settled_trades), color: "success.main" },
  ] : [];

  const columns = [
    { Header: "Settlement #", accessor: "settlement_number", minWidth: 190, Cell: ({ row }: any) => <Typography color="primary" variant="h6">{row.original.settlement_number}</Typography> },
    { Header: "Order #", accessor: "order_number", minWidth: 150 },
    { Header: "Revenue", accessor: "buyer_revenue", minWidth: 130, Cell: ({ row }: any) => <Span sx={{ fontWeight: 600 }}>{formatCurrency(row.original.buyer_revenue)}</Span> },
    { Header: "Gross Profit", accessor: "gross_profit", minWidth: 130, Cell: ({ row }: any) => <Span sx={{ fontWeight: 600, color: "success.main" }}>{formatCurrency(row.original.gross_profit)}</Span> },
    { Header: "Margin %", accessor: "gross_margin_pct", minWidth: 100, Cell: ({ row }: any) => <Span sx={{ fontWeight: 600, color: parseFloat(row.original.gross_margin_pct) >= 5 ? "success.main" : "warning.main" }}>{formatPercentage(row.original.gross_margin_pct)}</Span> },
    { Header: "Investor Margin", accessor: "investor_margin", minWidth: 145, Cell: ({ row }: any) => <Span sx={{ color: "info.main" }}>{formatCurrency(row.original.investor_margin)}</Span> },
    { Header: "Platform Fee", accessor: "platform_fee", minWidth: 130, Cell: ({ row }: any) => <Span sx={{ color: "primary.main" }}>{formatCurrency(row.original.platform_fee)}</Span> },
    { Header: "Status", accessor: "status", minWidth: 120, Cell: ({ row }: any) => <Chip label={row.original.status.toUpperCase()} color={STATUS_COLORS[row.original.status]} size="small" /> },
    { Header: "Settled At", accessor: "settled_at", minWidth: 130, Cell: ({ row }: any) => <Span sx={{ fontSize: 13 }}>{row.original.settled_at ? formatDateToDDMMYYYY(row.original.settled_at) : "—"}</Span> },
  ];

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Trade Settlements & P&L</Typography>
        <ExportButtons data={settlements?.results || []} columns={TRADE_SETTLEMENT_EXPORT_COLUMNS} filename="trade_settlements" />
      </Box>
      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {summaryCards.map(card => (
            <Grid item xs={6} sm={3} md={1.5} key={card.label}>
              <Card variant="outlined"><CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography variant="caption" color="text.primary" display="block">{card.label}</Typography>
                <Typography variant="h6" sx={{ color: card.color, fontWeight: 700, fontSize: "0.9rem" }}>{card.value}</Typography>
              </CardContent></Card>
            </Grid>
          ))}
        </Grid>
      )}
      <CustomTable columnShape={columns} data={settlements?.results || []} dataCount={settlements?.count || 0} pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }} setPageIndex={(p: number) => setFilters({ ...filters, page: p + 1 })} pageIndex={filters.page - 1} setPageSize={(s: number) => setFilters({ ...filters, page_size: s, page: 1 })} loading={loading} />
    </Box>
  );
};

export default TradeSettlements;