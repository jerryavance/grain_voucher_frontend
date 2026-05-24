/**
 * BuyerAccounts.tsx
 *
 * List page for buyer cash accounts. Each account is one buyer × one
 * currency, with a running available balance and a payment reference
 * the buyer quotes at the bank counter.
 *
 * UX choices:
 *   - Headline stat cards show portfolio-wide totals (count, total
 *     available cash) to give accountants a quick read.
 *   - Payment references are click-to-copy (most-requested action).
 *   - Auto-apply strategy is shown as a colored chip; click row to drill
 *     in and edit it on the detail page.
 */
import { FC, useEffect, useState } from "react";
import {
  Alert, Autocomplete, Box, Button, Card, CardContent, Chip, CircularProgress,
  FormControl, Grid, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import CustomTable from "../../components/UI/CustomTable";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import SearchInput from "../../components/SearchInput";
import { Span } from "../../components/Typography";
import useTitle from "../../hooks/useTitle";
import uniqueId from "../../utils/generateId";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import { SourcingService } from "./Sourcing.service";
import { formatCurrency } from "./SourcingConstants";
import {
  IBuyerAccount, IBuyerAccountsResults, IBuyerProfile, TBuyerAccountAutoApply,
} from "./Sourcing.interface";

const AUTO_APPLY_COLOR: Record<string, any> = {
  none: "default",
  fifo: "primary",
  lifo: "secondary",
};

// ─── Create Account Form ─────────────────────────────────────────────────────
const CreateAccountForm: FC<{
  handleClose: () => void;
  callBack?: () => void;
}> = ({ handleClose, callBack }) => {
  const [loading, setLoading] = useState(false);
  const [buyers, setBuyers] = useState<IBuyerProfile[]>([]);
  const [buyerSearch, setBuyerSearch] = useState("");
  const [buyersLoading, setBuyersLoading] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<IBuyerProfile | null>(null);
  const modalId = useState(uniqueId())[0];

  useEffect(() => {
    let cancelled = false;
    setBuyersLoading(true);
    SourcingService.getBuyers({ search: buyerSearch, is_active: true, page_size: 30 })
      .then(r => { if (!cancelled) setBuyers(r.results); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setBuyersLoading(false); });
    return () => { cancelled = true; };
  }, [buyerSearch]);

  const form = useFormik({
    initialValues: { buyer: "", currency: "UGX", auto_apply_strategy: "none" as TBuyerAccountAutoApply, notes: "" },
    validationSchema: Yup.object({
      buyer: Yup.string().required("Buyer is required"),
      currency: Yup.string().required("Currency is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await SourcingService.createBuyerAccount(values as any);
        toast.success("Cash account created");
        callBack?.();
        handleClose();
      } catch (e: any) {
        toast.error(
          e?.response?.data?.detail ||
          JSON.stringify(e?.response?.data) ||
          "Failed to create account",
        );
      } finally { setLoading(false); }
    },
  });

  return (
    <ModalDialog
      title="New Buyer Cash Account"
      id={modalId} open
      onClose={handleClose}
      ActionButtons={() => (
        <>
          <Button onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={() => form.handleSubmit()} disabled={loading}>
            {loading ? <ProgressIndicator color="inherit" size={20} /> : "Create Account"}
          </Button>
        </>
      )}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Alert severity="info">
            A buyer can have one cash account per currency (UGX, USD, EUR, GBP). A
            unique payment reference will be generated and shown to the buyer to
            quote at the bank.
          </Alert>
        </Grid>
        <Grid item xs={12}>
          <Autocomplete
            options={buyers}
            getOptionLabel={(o: any) => o.business_name || ""}
            value={selectedBuyer}
            onChange={(_, val) => {
              setSelectedBuyer(val);
              form.setFieldValue("buyer", val?.id || "");
            }}
            onInputChange={(_, val) => setBuyerSearch(val)}
            loading={buyersLoading}
            renderInput={params => (
              <TextField
                {...params} label="Buyer *"
                error={Boolean(form.touched.buyer && form.errors.buyer)}
                helperText={form.touched.buyer && (form.errors.buyer as string)}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {buyersLoading && <CircularProgress color="inherit" size={18} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Currency *</InputLabel>
            <Select
              value={form.values.currency} label="Currency *"
              onChange={e => form.setFieldValue("currency", e.target.value)}
            >
              {["UGX", "USD", "EUR", "GBP"].map(c => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Auto-apply Strategy</InputLabel>
            <Select
              value={form.values.auto_apply_strategy}
              label="Auto-apply Strategy"
              onChange={e => form.setFieldValue("auto_apply_strategy", e.target.value)}
            >
              <MenuItem value="none">Manual only (no auto-apply)</MenuItem>
              <MenuItem value="fifo">FIFO — oldest invoices first</MenuItem>
              <MenuItem value="lifo">LIFO — newest invoices first</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth label="Notes" multiline rows={2}
            value={form.values.notes}
            onChange={e => form.setFieldValue("notes", e.target.value)}
          />
        </Grid>
      </Grid>
    </ModalDialog>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const BuyerAccounts: FC = () => {
  useTitle("Buyer Cash Accounts");
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<IBuyerAccountsResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { fetchData(filters); }, [filters]);

  const fetchData = async (params?: any) => {
    setLoading(true);
    try { setAccounts(await SourcingService.getBuyerAccounts(params)); }
    catch { toast.error("Failed to load accounts"); }
    finally { setLoading(false); }
  };

  const copyReference = (ref: string) => {
    navigator.clipboard.writeText(ref).then(
      () => toast.success(`Copied ${ref}`),
      () => toast.error("Copy failed"),
    );
  };

  const tableActions: IDropdownAction[] = [
    {
      label: "Open Account",
      icon: <VisibilityIcon color="primary" />,
      onClick: (a: IBuyerAccount) => navigate(`/admin/sourcing/buyer-accounts/${a.id}`),
    },
  ];

  // Portfolio-wide totals (across the current page — backend doesn't yet
  // return aggregated totals so we sum what we have).
  const totals = (() => {
    const list = accounts?.results || [];
    const byCurrency: Record<string, number> = {};
    list.forEach(a => {
      byCurrency[a.currency] = (byCurrency[a.currency] || 0) + Number(a.available_balance || 0);
    });
    return byCurrency;
  })();

  const columns = [
    {
      Header: "Reference",
      accessor: "payment_reference",
      minWidth: 160,
      Cell: ({ row }: any) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography
            variant="body2"
            sx={{ fontFamily: "monospace", fontWeight: 700, color: "primary.main", cursor: "pointer" }}
            onClick={() => navigate(`/admin/sourcing/buyer-accounts/${row.original.id}`)}
          >
            {row.original.payment_reference}
          </Typography>
          <Tooltip title="Copy reference">
            <IconButton
              size="small"
              onClick={(e: any) => { e.stopPropagation(); copyReference(row.original.payment_reference); }}
            >
              <ContentCopyIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
    {
      Header: "Buyer",
      accessor: "buyer_name",
      minWidth: 200,
      Cell: ({ row }: any) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.original.buyer_name}</Typography>
      ),
    },
    {
      Header: "Currency",
      accessor: "currency",
      minWidth: 90,
      Cell: ({ row }: any) => <Chip label={row.original.currency} size="small" variant="outlined" />,
    },
    {
      Header: "Available",
      accessor: "available_balance",
      minWidth: 160,
      Cell: ({ row }: any) => {
        const bal = Number(row.original.available_balance || 0);
        return (
          <Typography variant="body2" sx={{ fontWeight: 700, color: bal > 0 ? "success.main" : "text.secondary" }}>
            {formatCurrency(bal, row.original.currency)}
          </Typography>
        );
      },
    },
    {
      Header: "Total Deposits",
      accessor: "total_deposits",
      minWidth: 160,
      Cell: ({ row }: any) => <Span>{formatCurrency(row.original.total_deposits, row.original.currency)}</Span>,
    },
    {
      Header: "Total Applied",
      accessor: "total_applied",
      minWidth: 160,
      Cell: ({ row }: any) => <Span>{formatCurrency(row.original.total_applied, row.original.currency)}</Span>,
    },
    {
      Header: "Auto-apply",
      accessor: "auto_apply_strategy",
      minWidth: 130,
      Cell: ({ row }: any) => (
        <Chip
          label={(row.original.auto_apply_strategy || "none").toUpperCase()}
          size="small"
          color={AUTO_APPLY_COLOR[row.original.auto_apply_strategy] ?? "default"}
          variant={row.original.auto_apply_strategy === "none" ? "outlined" : "filled"}
        />
      ),
    },
    {
      Header: "Created",
      accessor: "created_at",
      minWidth: 110,
      Cell: ({ row }: any) => <Span sx={{ fontSize: 12 }}>{formatDateToDDMMYYYY(row.original.created_at)}</Span>,
    },
    {
      Header: "Action",
      accessor: "action",
      minWidth: 80,
      Cell: ({ row }: any) => <DropdownActionBtn actions={tableActions} metaData={row.original} />,
    },
  ];

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
        <AccountBalanceWalletIcon sx={{ fontSize: 32, color: "primary.main" }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Buyer Cash Accounts</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          Wallet-style accounts holding lump-sum bank deposits before allocation to invoices.
        </Typography>
      </Box>

      {/* Portfolio totals */}
      {accounts && Object.keys(totals).length > 0 && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography variant="overline" color="text.secondary" display="block">Total Accounts</Typography>
                <Typography variant="h5" fontWeight={700}>{accounts.count}</Typography>
              </CardContent>
            </Card>
          </Grid>
          {Object.entries(totals).map(([cur, val]) => (
            <Grid item xs={6} sm={3} key={cur}>
              <Card variant="outlined">
                <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Typography variant="overline" color="text.secondary" display="block">
                    Available — {cur}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ color: val > 0 ? "success.main" : "text.primary" }}>
                    {formatCurrency(val, cur)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Toolbar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <SearchInput
          value={searchQuery} type="text"
          placeholder="Search by reference or buyer..."
          onChange={(e: any) => setSearchQuery(e.target.value)}
          onKeyPress={(e: any) => {
            if (e.key === "Enter") setFilters({ ...filters, search: searchQuery, page: 1 });
          }}
        />
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Currency</InputLabel>
          <Select
            value={filters.currency || ""} label="Currency"
            onChange={e => setFilters({ ...filters, currency: e.target.value || undefined, page: 1 })}
          >
            <MenuItem value="">All</MenuItem>
            {["UGX", "USD", "EUR", "GBP"].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Auto-apply</InputLabel>
          <Select
            value={filters.auto_apply_strategy || ""} label="Auto-apply"
            onChange={e => setFilters({ ...filters, auto_apply_strategy: e.target.value || undefined, page: 1 })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="none">Manual only</MenuItem>
            <MenuItem value="fifo">FIFO</MenuItem>
            <MenuItem value="lifo">LIFO</MenuItem>
          </Select>
        </FormControl>
        <Button sx={{ ml: "auto" }} variant="contained" startIcon={<AddIcon />} onClick={() => setShowCreate(true)}>
          New Account
        </Button>
      </Box>

      <CustomTable
        columnShape={columns}
        data={accounts?.results || []}
        dataCount={accounts?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(p: number) => setFilters({ ...filters, page: p + 1 })}
        pageIndex={filters.page - 1}
        setPageSize={(s: number) => setFilters({ ...filters, page_size: s, page: 1 })}
        loading={loading}
      />

      {showCreate && (
        <CreateAccountForm
          handleClose={() => setShowCreate(false)}
          callBack={() => { setShowCreate(false); fetchData(filters); }}
        />
      )}
    </Box>
  );
};

export default BuyerAccounts;
