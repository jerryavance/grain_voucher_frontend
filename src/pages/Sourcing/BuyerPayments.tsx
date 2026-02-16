import { FC, useEffect, useState } from "react";
import {
  Box, Chip, FormControl, InputLabel, MenuItem, Select, Typography,
} from "@mui/material";
import { toast } from "react-hot-toast";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReplayIcon from "@mui/icons-material/Replay";
import { Span } from "../../components/Typography";
import CustomTable from "../../components/UI/CustomTable";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import useTitle from "../../hooks/useTitle";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import { SourcingService } from "./Sourcing.service";
import { formatCurrency } from "./SourcingConstants";
import { IBuyerPayment, IBuyerPaymentsResults } from "./Sourcing.interface";

const BUYER_PAYMENT_STATUS_COLORS: Record<string, any> = {
  pending: "warning", confirmed: "success", failed: "error", reversed: "default",
};

const BuyerPayments: FC = () => {
  useTitle("Buyer Payments");
  const [payments, setPayments] = useState<IBuyerPaymentsResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchData(filters); }, [filters]);

  const fetchData = async (params?: any) => {
    setLoading(true);
    try { setPayments(await SourcingService.getBuyerPayments(params)); }
    catch { toast.error("Failed to load payments"); }
    finally { setLoading(false); }
  };

  const tableActions: IDropdownAction[] = [
    {
      label: "Confirm",
      icon: <CheckCircleIcon color="success" />,
      onClick: async (p: IBuyerPayment) => {
        try {
          await SourcingService.confirmBuyerPayment(p.id);
          toast.success("Payment confirmed");
          fetchData(filters);
        } catch { toast.error("Failed to confirm"); }
      },
      condition: (p: IBuyerPayment) => p.status === "pending",
    },
    {
      label: "Reverse",
      icon: <ReplayIcon color="error" />,
      onClick: async (p: IBuyerPayment) => {
        if (!window.confirm("Reverse this payment? This cannot be undone.")) return;
        try {
          await SourcingService.reverseBuyerPayment(p.id);
          toast.success("Payment reversed");
          fetchData(filters);
        } catch { toast.error("Failed to reverse"); }
      },
      condition: (p: IBuyerPayment) => p.status === "confirmed",
    },
  ];

  const columns = [
    {
      Header: "Payment #", accessor: "payment_number", minWidth: 180,
      Cell: ({ row }: any) => (
        <Typography color="primary" variant="h6">{row.original.payment_number}</Typography>
      ),
    },
    { Header: "Invoice #", accessor: "invoice_number", minWidth: 160 },
    { Header: "Buyer", accessor: "buyer_name", minWidth: 150 },
    {
      Header: "Amount", accessor: "amount", minWidth: 130,
      Cell: ({ row }: any) => (
        <Span sx={{ fontWeight: 600, color: "success.main" }}>{formatCurrency(row.original.amount)}</Span>
      ),
    },
    {
      Header: "Method", accessor: "method", minWidth: 140,
      Cell: ({ row }: any) => (
        <Chip label={row.original.method.replace(/_/g, " ").toUpperCase()} size="small" variant="outlined" />
      ),
    },
    {
      Header: "Reference", accessor: "reference_number", minWidth: 160,
      Cell: ({ row }: any) => (
        <Span sx={{ fontFamily: "monospace", fontSize: 12 }}>{row.original.reference_number || "—"}</Span>
      ),
    },
    {
      Header: "Status", accessor: "status", minWidth: 110,
      Cell: ({ row }: any) => (
        <Chip
          label={row.original.status.toUpperCase()}
          color={BUYER_PAYMENT_STATUS_COLORS[row.original.status]}
          size="small"
        />
      ),
    },
    {
      Header: "Payment Date", accessor: "payment_date", minWidth: 130,
      Cell: ({ row }: any) => (
        <Span sx={{ fontSize: 13 }}>{formatDateToDDMMYYYY(row.original.payment_date)}</Span>
      ),
    },
    {
      Header: "Action", accessor: "action", minWidth: 80,
      Cell: ({ row }: any) => <DropdownActionBtn actions={tableActions} metaData={row.original} />,
    },
  ];

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Buyer Payments</Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status || ""} label="Status"
            onChange={e => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}
          >
            <MenuItem value="">All</MenuItem>
            {["pending", "confirmed", "failed", "reversed"].map(s => (
              <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <CustomTable
        columnShape={columns}
        data={payments?.results || []}
        dataCount={payments?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(p: number) => setFilters({ ...filters, page: p + 1 })}
        pageIndex={filters.page - 1}
        setPageSize={(s: number) => setFilters({ ...filters, page_size: s, page: 1 })}
        loading={loading}
      />
    </Box>
  );
};

export default BuyerPayments;