/**
 * InvestorAllocations.tsx — UPDATED
 * - Ref and Order # are now clickable links to source order details
 * - Added ExportButtons and DateRangeFilter
 * - NEW: Financing % and EMD Timing columns
 * - NEW: Reassign Investor action for active allocations
 */

import { FC, useEffect, useState } from "react";
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, MenuItem, Select, Typography,
} from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Span } from "../../components/Typography";
import CustomTable from "../../components/UI/CustomTable";
import useTitle from "../../hooks/useTitle";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import { SourcingService } from "./Sourcing.service";
import { formatCurrency } from "./SourcingConstants";
import { IInvestorAllocationsResults } from "./Sourcing.interface";
import { ExportButtons, INVESTOR_ALLOCATION_EXPORT_COLUMNS } from "./ExportUtils";
import DateRangeFilter from "./DateRangeFilter";

const ALLOCATION_STATUS_COLORS: Record<string, any> = { active: "primary", settled: "success", cancelled: "error" };
const EMD_TIMING_LABELS: Record<string, string> = {
  on_assignment: "Immediate",
  on_weighbridge: "On Weighbridge",
  on_supplier_payment: "On Payment",
};

const InvestorAllocations: FC = () => {
  useTitle("Investor Allocations");
  const navigate = useNavigate();
  const [allocations, setAllocations] = useState<IInvestorAllocationsResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignId, setReassignId] = useState("");
  const [reassignCurrentName, setReassignCurrentName] = useState("");
  const [investorAccounts, setInvestorAccounts] = useState<any[]>([]);
  const [newInvestorId, setNewInvestorId] = useState("");
  const [reassigning, setReassigning] = useState(false);

  useEffect(() => { fetchData(filters); }, [filters]);

  const fetchData = async (params?: any) => {
    setLoading(true);
    try { setAllocations(await SourcingService.getInvestorAllocations(params)); }
    catch { toast.error("Failed to load allocations"); }
    finally { setLoading(false); }
  };

  const handleOpenReassign = async (allocationId: string, currentInvestor: string) => {
    setReassignId(allocationId);
    setReassignCurrentName(currentInvestor);
    setReassignOpen(true);
    try {
      const resp = await SourcingService.getInvestorAccounts();
      setInvestorAccounts(resp.results ?? resp);
    } catch { toast.error("Failed to load investors"); }
  };

  const handleReassign = async () => {
    if (!newInvestorId) return;
    setReassigning(true);
    try {
      await SourcingService.reassignInvestor(reassignId, newInvestorId);
      toast.success("Investor reassigned successfully");
      setReassignOpen(false);
      setNewInvestorId("");
      fetchData(filters);
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Reassignment failed");
    } finally { setReassigning(false); }
  };

  const columns = [
    {
      Header: "Ref", accessor: "allocation_number", minWidth: 180,
      Cell: ({ row }: any) => (
        <Typography color="primary" variant="h6"
          sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
          onClick={() => navigate(`/admin/sourcing/orders/${row.original.source_order}`)}>
          {row.original.allocation_number}
        </Typography>
      ),
    },
    { Header: "Investor", accessor: "investor_name", minWidth: 160 },
    {
      Header: "Order #", accessor: "source_order_number", minWidth: 150,
      Cell: ({ row }: any) => (
        <Typography color="primary" variant="body2"
          sx={{ cursor: "pointer", fontWeight: 600, "&:hover": { textDecoration: "underline" } }}
          onClick={() => navigate(`/admin/sourcing/orders/${row.original.source_order}`)}>
          {row.original.source_order_number}
        </Typography>
      ),
    },
    { Header: "Allocated", accessor: "amount_allocated", minWidth: 140, Cell: ({ row }: any) => <Span sx={{ fontWeight: 600 }}>{formatCurrency(row.original.amount_allocated)}</Span> },
    {
      Header: "Fin. %", accessor: "financing_percentage", minWidth: 80,
      Cell: ({ row }: any) => (
        <Chip label={`${row.original.financing_percentage ?? 100}%`} size="small"
          color={Number(row.original.financing_percentage) < 100 ? "warning" : "default"} variant="outlined" />
      ),
    },
    {
      Header: "EMD Timing", accessor: "emd_deduction_timing", minWidth: 110,
      Cell: ({ row }: any) => (
        <Chip label={EMD_TIMING_LABELS[row.original.emd_deduction_timing] || "Immediate"} size="small"
          color={row.original.emd_deducted ? "success" : "warning"} variant="outlined" />
      ),
    },
    { Header: "Margin", accessor: "investor_margin", minWidth: 130, Cell: ({ row }: any) => <Span sx={{ color: Number(row.original.investor_margin) >= 0 ? "success.main" : "error.main" }}>{formatCurrency(row.original.investor_margin)}</Span> },
    { Header: "Returned", accessor: "amount_returned", minWidth: 130, Cell: ({ row }: any) => <Span sx={{ fontWeight: 600, color: "info.main" }}>{formatCurrency(row.original.amount_returned)}</Span> },
    { Header: "Status", accessor: "status", minWidth: 100, Cell: ({ row }: any) => <Chip label={row.original.status.toUpperCase()} color={ALLOCATION_STATUS_COLORS[row.original.status]} size="small" /> },
    { Header: "Date", accessor: "allocated_at", minWidth: 110, Cell: ({ row }: any) => <Span sx={{ fontSize: 13 }}>{formatDateToDDMMYYYY(row.original.allocated_at)}</Span> },
    {
      Header: "", accessor: "actions", minWidth: 100,
      Cell: ({ row }: any) => row.original.status === "active" ? (
        <Button size="small" startIcon={<SwapHorizIcon />}
          onClick={() => handleOpenReassign(row.original.id, row.original.investor_name)}>
          Reassign
        </Button>
      ) : null,
    },
  ];

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h5">Investor Allocations</Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
          <DateRangeFilter dateFrom={filters.date_from} dateTo={filters.date_to} onApply={(f, t) => setFilters({ ...filters, date_from: f, date_to: t, page: 1 })} />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select value={filters.status || ""} label="Status" onChange={e => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}>
              <MenuItem value="">All</MenuItem>
              {["active", "settled", "cancelled"].map(s => <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
            </Select>
          </FormControl>
          <ExportButtons data={allocations?.results || []} columns={INVESTOR_ALLOCATION_EXPORT_COLUMNS} filename="investor_allocations" />
        </Box>
      </Box>
      <CustomTable columnShape={columns} data={allocations?.results || []} dataCount={allocations?.count || 0} pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }} setPageIndex={(p: number) => setFilters({ ...filters, page: p + 1 })} pageIndex={filters.page - 1} setPageSize={(s: number) => setFilters({ ...filters, page_size: s, page: 1 })} loading={loading} />

      <Dialog open={reassignOpen} onClose={() => !reassigning && setReassignOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reassign Investor</DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>Current investor: <strong>{reassignCurrentName}</strong></Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>New Investor Account</InputLabel>
            <Select value={newInvestorId} label="New Investor Account" onChange={e => setNewInvestorId(e.target.value as string)}>
              {investorAccounts.map((a: any) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.investor?.first_name} {a.investor?.last_name} — EMD: {formatCurrency(a.emd_balance ?? a.available_balance)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReassignOpen(false)} disabled={reassigning}>Cancel</Button>
          <Button variant="contained" onClick={handleReassign} disabled={reassigning || !newInvestorId}>
            {reassigning ? "Reassigning..." : "Reassign"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvestorAllocations;