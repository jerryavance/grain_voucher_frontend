import { FC, useEffect, useState } from "react";
import {
  Box, Chip, FormControl, InputLabel, MenuItem, Select, Typography,
} from "@mui/material";
import { toast } from "react-hot-toast";
import { Span } from "../../components/Typography";
import CustomTable from "../../components/UI/CustomTable";
import useTitle from "../../hooks/useTitle";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import { SourcingService } from "./Sourcing.service";
import { formatCurrency } from "./SourcingConstants";
import { IInvestorAllocationsResults } from "./Sourcing.interface";

const ALLOCATION_STATUS_COLORS: Record<string, any> = {
  active: "primary", settled: "success", cancelled: "error",
};

const InvestorAllocations: FC = () => {
  useTitle("Investor Allocations");
  const [allocations, setAllocations] = useState<IInvestorAllocationsResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchData(filters); }, [filters]);

  const fetchData = async (params?: any) => {
    setLoading(true);
    try { setAllocations(await SourcingService.getInvestorAllocations(params)); }
    catch { toast.error("Failed to load allocations"); }
    finally { setLoading(false); }
  };

  const columns = [
    {
      Header: "Ref", accessor: "allocation_number", minWidth: 180,
      Cell: ({ row }: any) => (
        <Typography color="primary" variant="h6">{row.original.allocation_number}</Typography>
      ),
    },
    { Header: "Investor", accessor: "investor_name", minWidth: 160 },
    { Header: "Order #", accessor: "source_order_number", minWidth: 150 },
    {
      Header: "Allocated", accessor: "amount_allocated", minWidth: 140,
      Cell: ({ row }: any) => (
        <Span sx={{ fontWeight: 600 }}>{formatCurrency(row.original.amount_allocated)}</Span>
      ),
    },
    {
      Header: "Margin Earned", accessor: "investor_margin", minWidth: 140,
      Cell: ({ row }: any) => (
        <Span sx={{ color: "success.main" }}>{formatCurrency(row.original.investor_margin)}</Span>
      ),
    },
    {
      Header: "Platform Fee", accessor: "platform_fee", minWidth: 130,
      Cell: ({ row }: any) => <Span>{formatCurrency(row.original.platform_fee)}</Span>,
    },
    {
      Header: "Amount Returned", accessor: "amount_returned", minWidth: 150,
      Cell: ({ row }: any) => (
        <Span sx={{ fontWeight: 600, color: "info.main" }}>{formatCurrency(row.original.amount_returned)}</Span>
      ),
    },
    {
      Header: "Status", accessor: "status", minWidth: 110,
      Cell: ({ row }: any) => (
        <Chip
          label={row.original.status.toUpperCase()}
          color={ALLOCATION_STATUS_COLORS[row.original.status]}
          size="small"
        />
      ),
    },
    {
      Header: "Date", accessor: "allocated_at", minWidth: 120,
      Cell: ({ row }: any) => (
        <Span sx={{ fontSize: 13 }}>{formatDateToDDMMYYYY(row.original.allocated_at)}</Span>
      ),
    },
  ];

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Investor Allocations</Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status || ""}
            label="Status"
            onChange={e => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}
          >
            <MenuItem value="">All</MenuItem>
            {["active", "settled", "cancelled"].map(s => (
              <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <CustomTable
        columnShape={columns}
        data={allocations?.results || []}
        dataCount={allocations?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(p: number) => setFilters({ ...filters, page: p + 1 })}
        pageIndex={filters.page - 1}
        setPageSize={(s: number) => setFilters({ ...filters, page_size: s, page: 1 })}
        loading={loading}
      />
    </Box>
  );
};

export default InvestorAllocations;