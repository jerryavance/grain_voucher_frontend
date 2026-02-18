import { Box, Card, CardContent, Typography, Chip, Tab, Tabs, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CallMadeIcon from "@mui/icons-material/CallMade";
import CallReceivedIcon from "@mui/icons-material/CallReceived";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import useTitle from "../../hooks/useTitle";
import { InvestorService } from "./Investor.service";
import { SourcingService } from "../Sourcing/Sourcing.service";
import CustomTable from "../../components/UI/CustomTable";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import { formatCurrency } from "../Sourcing/SourcingConstants";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`transaction-tabpanel-${index}`}
      aria-labelledby={`transaction-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const InvestorTransactions = () => {
  useTitle("Transaction History");

  const [tabValue, setTabValue] = useState(0);
  const [deposits, setDeposits] = useState<any>();
  const [withdrawals, setWithdrawals] = useState<any>();
  const [allocations, setAllocations] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ page: 1, page_size: INITIAL_PAGE_SIZE });

  useEffect(() => {
    fetchData();
  }, [tabValue, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      switch (tabValue) {
        case 0:
          await Promise.all([fetchDeposits(), fetchWithdrawals(), fetchAllocations()]);
          break;
        case 1:
          await fetchDeposits();
          break;
        case 2:
          await fetchWithdrawals();
          break;
        case 3:
          await fetchAllocations();
          break;
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const fetchDeposits = async () => {
    const response = await InvestorService.getInvestorDeposits(filters);
    setDeposits(response);
  };

  const fetchWithdrawals = async () => {
    const response = await InvestorService.getInvestorWithdrawals(filters);
    setWithdrawals(response);
  };

  const fetchAllocations = async () => {
    // ✅ FIX: use getMyInvestorAllocations — resolves account UUID automatically
    const response = await SourcingService.getMyInvestorAllocations(filters);
    setAllocations(response);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setFilters({ page: 1, page_size: INITIAL_PAGE_SIZE });
  };

  const depositColumns = [
    {
      Header: "Date",
      accessor: "deposit_date",
      minWidth: 120,
      Cell: ({ value }: any) => formatDateToDDMMYYYY(value),
    },
    {
      Header: "Type",
      accessor: "type",
      minWidth: 100,
      Cell: () => (
        <Chip icon={<CallReceivedIcon />} label="Deposit" color="success" size="small" />
      ),
    },
    {
      Header: "Amount",
      accessor: "amount",
      minWidth: 150,
      Cell: ({ value }: any) => (
        <Typography color="success.main" fontWeight="medium">
          + {formatCurrency(value)}
        </Typography>
      ),
    },
    {
      Header: "Notes",
      accessor: "notes",
      minWidth: 200,
    },
    {
      Header: "Created",
      accessor: "created_at",
      minWidth: 120,
      Cell: ({ value }: any) => formatDateToDDMMYYYY(value),
    },
  ];

  const withdrawalColumns = [
    {
      Header: "Date",
      accessor: "withdrawal_date",
      minWidth: 120,
      Cell: ({ value }: any) => formatDateToDDMMYYYY(value),
    },
    {
      Header: "Type",
      accessor: "type",
      minWidth: 100,
      Cell: () => (
        <Chip icon={<CallMadeIcon />} label="Withdrawal" color="error" size="small" />
      ),
    },
    {
      Header: "Amount",
      accessor: "amount",
      minWidth: 150,
      Cell: ({ value }: any) => (
        <Typography color="error.main" fontWeight="medium">
          - {formatCurrency(value)}
        </Typography>
      ),
    },
    {
      Header: "Status",
      accessor: "status",
      minWidth: 120,
      Cell: ({ value }: any) => {
        const colors: any = { pending: "warning", approved: "success", rejected: "error" };
        return <Chip label={value.toUpperCase()} color={colors[value] || "default"} size="small" />;
      },
    },
    {
      Header: "Notes",
      accessor: "notes",
      minWidth: 200,
    },
  ];

  const allocationColumns = [
    {
      Header: "Date",
      accessor: "allocated_at",
      minWidth: 120,
      Cell: ({ value }: any) => formatDateToDDMMYYYY(value),
    },
    {
      Header: "Type",
      accessor: "type",
      minWidth: 100,
      Cell: () => (
        <Chip icon={<TrendingUpIcon />} label="Allocation" color="info" size="small" />
      ),
    },
    {
      Header: "Allocation #",
      accessor: "allocation_number",
      minWidth: 150,
    },
    {
      Header: "Amount",
      accessor: "amount_allocated",
      minWidth: 150,
      Cell: ({ value }: any) => (
        <Typography color="primary.main" fontWeight="medium">
          {formatCurrency(value)}
        </Typography>
      ),
    },
    {
      Header: "Status",
      accessor: "status",
      minWidth: 120,
      Cell: ({ value }: any) => {
        const colors: any = { active: "info", settled: "success", cancelled: "error" };
        return <Chip label={value.toUpperCase()} color={colors[value] || "default"} size="small" />;
      },
    },
    {
      Header: "Order #",
      accessor: "source_order_number",
      minWidth: 150,
    },
  ];

  const getCombinedTransactions = () => {
    const allTxns: any[] = [];

    if (deposits?.results) {
      deposits.results.forEach((d: any) => {
        allTxns.push({
          date: d.deposit_date,
          type: "Deposit",
          typeIcon: <CallReceivedIcon />,
          amount: parseFloat(d.amount),
          amountDisplay: `+ ${formatCurrency(d.amount)}`,
          color: "success.main",
          status: "Completed",
          details: d.notes || "—",
          created_at: d.created_at,
        });
      });
    }

    if (withdrawals?.results) {
      withdrawals.results.forEach((w: any) => {
        allTxns.push({
          date: w.withdrawal_date,
          type: "Withdrawal",
          typeIcon: <CallMadeIcon />,
          amount: -parseFloat(w.amount),
          amountDisplay: `- ${formatCurrency(w.amount)}`,
          color: "error.main",
          status: w.status,
          details: w.notes || "—",
          created_at: w.created_at,
        });
      });
    }

    if (allocations?.results) {
      allocations.results.forEach((a: any) => {
        allTxns.push({
          date: a.allocated_at,
          type: "Allocation",
          typeIcon: <TrendingUpIcon />,
          amount: -parseFloat(a.amount_allocated),
          amountDisplay: formatCurrency(a.amount_allocated),
          color: "info.main",
          status: a.status,
          details: a.source_order_number,
          created_at: a.created_at,
        });
      });
    }

    return allTxns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const combinedColumns = [
    {
      Header: "Date",
      accessor: "date",
      minWidth: 120,
      Cell: ({ value }: any) => formatDateToDDMMYYYY(value),
    },
    {
      Header: "Type",
      accessor: "type",
      minWidth: 120,
      Cell: ({ row }: any) => (
        <Chip
          icon={row.original.typeIcon}
          label={row.original.type}
          size="small"
          color={
            row.original.type === "Deposit" ? "success"
            : row.original.type === "Withdrawal" ? "error"
            : "info"
          }
        />
      ),
    },
    {
      Header: "Amount",
      accessor: "amountDisplay",
      minWidth: 150,
      Cell: ({ row }: any) => (
        <Typography color={row.original.color} fontWeight="medium">
          {row.original.amountDisplay}
        </Typography>
      ),
    },
    {
      Header: "Status",
      accessor: "status",
      minWidth: 120,
      Cell: ({ value }: any) => {
        const colors: any = {
          Completed: "success",
          pending: "warning",
          approved: "success",
          rejected: "error",
          active: "info",
          settled: "success",
          cancelled: "error",
        };
        return (
          <Chip
            label={typeof value === "string" ? value.toUpperCase() : value}
            color={colors[value] || "default"}
            size="small"
          />
        );
      },
    },
    {
      Header: "Details",
      accessor: "details",
      minWidth: 200,
    },
  ];

  if (loading && !deposits && !withdrawals && !allocations) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <AccountBalanceWalletIcon sx={{ fontSize: 40, mr: 2, color: "primary.main" }} />
        <Typography variant="h4">Transaction History</Typography>
      </Box>

      <Card>
        <CardContent>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="transaction tabs">
            <Tab label="All Transactions" />
            <Tab label="Deposits" />
            <Tab label="Withdrawals" />
            <Tab label="Allocations" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <CustomTable
              columnShape={combinedColumns}
              data={getCombinedTransactions()}
              dataCount={getCombinedTransactions().length}
              pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
              setPageIndex={(page: number) => setFilters({ ...filters, page: page + 1 })}
              pageIndex={filters.page - 1}
              loading={loading}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <CustomTable
              columnShape={depositColumns}
              data={deposits?.results || []}
              dataCount={deposits?.count || 0}
              pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
              setPageIndex={(page: number) => setFilters({ ...filters, page: page + 1 })}
              pageIndex={filters.page - 1}
              loading={loading}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <CustomTable
              columnShape={withdrawalColumns}
              data={withdrawals?.results || []}
              dataCount={withdrawals?.count || 0}
              pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
              setPageIndex={(page: number) => setFilters({ ...filters, page: page + 1 })}
              pageIndex={filters.page - 1}
              loading={loading}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <CustomTable
              columnShape={allocationColumns}
              data={allocations?.results || []}
              dataCount={allocations?.count || 0}
              pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
              setPageIndex={(page: number) => setFilters({ ...filters, page: page + 1 })}
              pageIndex={filters.page - 1}
              loading={loading}
            />
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InvestorTransactions;