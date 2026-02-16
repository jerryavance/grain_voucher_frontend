import { Box, Card, CardContent, Typography, Chip, Alert, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import useTitle from "../../hooks/useTitle";
import { SourcingService } from "../Sourcing/Sourcing.service";
import { IInvestorAllocation, IInvestorAllocationsResults } from "../Sourcing/Sourcing.interface";
import CustomTable from "../../components/UI/CustomTable";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import { formatCurrency } from "../Sourcing/SourcingConstants";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";

const InvestorReturns = () => {
  useTitle("My Returns");

  const [allocations, setAllocations] = useState<IInvestorAllocationsResults>();
  const [filters, setFilters] = useState<any>({
    page: 1,
    page_size: INITIAL_PAGE_SIZE,
    status: "settled", // Only show settled allocations
  });
  const [loading, setLoading] = useState(false);
  const [totalStats, setTotalStats] = useState({
    totalAllocated: 0,
    totalReturned: 0,
    totalMargin: 0,
    roi: 0,
  });

  useEffect(() => {
    fetchAllocations();
  }, [filters]);

  const fetchAllocations = async () => {
    try {
      setLoading(true);
      // Filter by current investor's account
      const response = await SourcingService.getInvestorAllocations({
        ...filters,
        investor_account: "me",
      });
      setAllocations(response);

      // Calculate totals
      if (response.results) {
        const totals = response.results.reduce(
          (acc, alloc) => ({
            totalAllocated: acc.totalAllocated + parseFloat(alloc.amount_allocated.toString()),
            totalReturned: acc.totalReturned + parseFloat(alloc.amount_returned.toString()),
            totalMargin: acc.totalMargin + parseFloat(alloc.investor_margin.toString()),
          }),
          { totalAllocated: 0, totalReturned: 0, totalMargin: 0 }
        );

        const roi = totals.totalAllocated > 0 
          ? (totals.totalMargin / totals.totalAllocated) * 100 
          : 0;

        setTotalStats({
          ...totals,
          roi,
        });
      }
    } catch (error) {
      console.error("Error fetching returns:", error);
      toast.error("Failed to fetch returns");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
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
      Cell: ({ value }: any) => (
        <Typography color="success.main" fontWeight="medium">
          {formatCurrency(value)}
        </Typography>
      ),
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
        const margin = parseFloat(row.original.investor_margin);
        const roi = allocated > 0 ? ((margin / allocated) * 100).toFixed(2) : "0.00";
        return (
          <Chip
            label={`${roi}%`}
            color={parseFloat(roi) > 0 ? "success" : "default"}
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
      Cell: ({ value }: any) => (
        <Chip
          label={value.toUpperCase()}
          color={value === "settled" ? "success" : "default"}
          size="small"
        />
      ),
    },
  ];

  if (loading && !allocations) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <TrendingUpIcon sx={{ fontSize: 40, mr: 2, color: "success.main" }} />
        <Typography variant="h4">My Returns</Typography>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 3, mb: 4 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <AccountBalanceIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="overline" color="text.secondary">
                Total Allocated
              </Typography>
            </Box>
            <Typography variant="h5">{formatCurrency(totalStats.totalAllocated)}</Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <TrendingUpIcon sx={{ mr: 1, color: "success.main" }} />
              <Typography variant="overline" color="text.secondary">
                Total Margin Earned
              </Typography>
            </Box>
            <Typography variant="h5" color="success.main">
              {formatCurrency(totalStats.totalMargin)}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <AccountBalanceIcon sx={{ mr: 1, color: "info.main" }} />
              <Typography variant="overline" color="text.secondary">
                Total Returned
              </Typography>
            </Box>
            <Typography variant="h5">{formatCurrency(totalStats.totalReturned)}</Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <TrendingUpIcon sx={{ mr: 1, color: "success.main" }} />
              <Typography variant="overline" color="text.secondary">
                Average ROI
              </Typography>
            </Box>
            <Typography variant="h5" color="success.main">
              {totalStats.roi.toFixed(2)}%
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          This shows all your settled investments where capital and profits have been returned to your account.
          ROI (Return on Investment) = (Margin Earned ÷ Amount Allocated) × 100
        </Typography>
      </Alert>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <Chip
          label="All Settled"
          color={filters.status === "settled" ? "primary" : "default"}
          onClick={() => setFilters({ ...filters, status: "settled", page: 1 })}
        />
        <Chip
          label="Active Allocations"
          color={filters.status === "active" ? "primary" : "default"}
          onClick={() => setFilters({ ...filters, status: "active", page: 1 })}
        />
      </Box>

      <CustomTable
        columnShape={columns}
        data={allocations?.results || []}
        dataCount={allocations?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(page: number) => setFilters({ ...filters, page: page + 1 })}
        pageIndex={filters?.page ? filters.page - 1 : 0}
        setPageSize={(size: number) => setFilters({ ...filters, page_size: size, page: 1 })}
        loading={loading}
      />
    </Box>
  );
};

export default InvestorReturns;