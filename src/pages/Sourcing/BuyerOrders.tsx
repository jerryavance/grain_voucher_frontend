import { FC, useEffect, useRef, useState } from "react";
import {
  Box, Button, Chip, FormControl, Grid, InputLabel,
  MenuItem, Select, TextField, Typography,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Span } from "../../components/Typography";
import CustomTable from "../../components/UI/CustomTable";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import SearchInput from "../../components/SearchInput";
import useTitle from "../../hooks/useTitle";
import uniqueId from "../../utils/generateId";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import { SourcingService } from "./Sourcing.service";
import { formatCurrency } from "./SourcingConstants";
import { IBuyerOrderList, IBuyerOrdersResults } from "./Sourcing.interface";

const BUYER_ORDER_STATUS_COLORS: Record<string, any> = {
  draft: "default", confirmed: "primary", dispatched: "warning",
  delivered: "info", invoiced: "secondary", completed: "success", cancelled: "error",
};
const BUYER_INVOICE_STATUS_COLORS: Record<string, any> = {
  draft: "default", issued: "primary", partial: "warning",
  paid: "success", overdue: "error", cancelled: "error",
};

// ─── Create Buyer Order Form ──────────────────────────────────────────────
const CreateBuyerOrderForm: FC<{
  hubs: any[];
  handleClose: () => void;
  callBack?: () => void;
}> = ({ hubs, handleClose, callBack }) => {
  const [loading, setLoading] = useState(false);
  // FIX 1: Stable modal ID — generated once on mount, never changes on re-render
  const modalId = useRef(uniqueId()).current;

  const form = useFormik({
    initialValues: {
      buyer_name: "", buyer_contact_name: "", buyer_phone: "",
      buyer_email: "", buyer_address: "", hub: "", credit_terms_days: 0, notes: "",
    },
    validationSchema: Yup.object({
      buyer_name: Yup.string().required("Buyer name is required"),
      hub: Yup.string().required("Hub is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const order = await SourcingService.createBuyerOrder(values as any);
        toast.success(`Order ${order.order_number} created`);
        callBack?.();
      } catch {
        toast.error("Failed to create order");
      } finally {
        setLoading(false);
      }
    },
  });

  // FIX 2: ActionBtns must remain a React.FC because ModalDialog calls it as <ActionButtons />.
  // Defined outside JSX but still as a function component to satisfy the prop type.
  // The loading/handleClose values it closes over are always current because the whole
  // CreateBuyerOrderForm remounts fresh each time showCreateForm flips to true.
  const ActionBtns: FC = () => (
    <>
      <Button onClick={handleClose} disabled={loading}>Cancel</Button>
      <Button variant="contained" onClick={() => form.handleSubmit()} disabled={loading}>
        {loading ? <ProgressIndicator color="inherit" size={20} /> : "Create Order"}
      </Button>
    </>
  );

  return (
    <ModalDialog
      title="New Buyer Order"
      onClose={handleClose}
      id={modalId}
      // FIX 3 (ROOT CAUSE): ModalDialog checks `showModal` from context OR the `open` prop.
      // Since we manage visibility via local state (showCreateForm), the context's showModal
      // is never set to true — so the modal always returned null without this prop.
      open={true}
      ActionButtons={ActionBtns}
      maxWidth="md"
    >
      <Grid container spacing={2} sx={{ pt: 1 }}>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Buyer / Company Name *"
            value={form.values.buyer_name}
            onChange={e => form.setFieldValue("buyer_name", e.target.value)}
            error={Boolean(form.errors.buyer_name)} helperText={form.errors.buyer_name} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Contact Person"
            value={form.values.buyer_contact_name}
            onChange={e => form.setFieldValue("buyer_contact_name", e.target.value)} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Phone"
            value={form.values.buyer_phone}
            onChange={e => form.setFieldValue("buyer_phone", e.target.value)} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Email"
            value={form.values.buyer_email}
            onChange={e => form.setFieldValue("buyer_email", e.target.value)} />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={Boolean(form.errors.hub)}>
            <InputLabel>Hub *</InputLabel>
            <Select value={form.values.hub} label="Hub *"
              onChange={e => form.setFieldValue("hub", e.target.value)}>
              {hubs.map(h => <MenuItem key={h.value} value={h.value}>{h.label}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Credit Terms (Days)" type="number"
            value={form.values.credit_terms_days}
            onChange={e => form.setFieldValue("credit_terms_days", parseInt(e.target.value) || 0)}
            helperText="0 = cash on delivery, 30 / 60 / 90 = net terms" />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Address" multiline rows={2}
            value={form.values.buyer_address}
            onChange={e => form.setFieldValue("buyer_address", e.target.value)} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Notes" multiline rows={2}
            value={form.values.notes}
            onChange={e => form.setFieldValue("notes", e.target.value)} />
        </Grid>
      </Grid>
    </ModalDialog>
  );
};

// ─── Main List Page ───────────────────────────────────────────────────────
const BuyerOrders: FC = () => {
  useTitle("Buyer Orders");
  const navigate = useNavigate();
  const [orders, setOrders] = useState<IBuyerOrdersResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [hubs, setHubs] = useState<any[]>([]);

  useEffect(() => { fetchData(filters); }, [filters]);
  useEffect(() => {
    SourcingService.getHubs()
      .then(r =>
        setHubs((r.results || r).map((h: any) => ({ value: h.id, label: h.name })))
      )
      .catch(() => toast.error("Failed to load hubs"));
  }, []);

  const fetchData = async (params?: any) => {
    setLoading(true);
    try { setOrders(await SourcingService.getBuyerOrders(params)); }
    catch { toast.error("Failed to load buyer orders"); }
    finally { setLoading(false); }
  };

  const handleQuickAction = async (action: string, id: string) => {
    try {
      if (action === "confirm") await SourcingService.confirmBuyerOrder(id);
      else if (action === "dispatch") await SourcingService.dispatchBuyerOrder(id);
      else if (action === "deliver") await SourcingService.deliverBuyerOrder(id);
      else if (action === "cancel") await SourcingService.cancelBuyerOrder(id);
      toast.success("Order updated");
      fetchData(filters);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Action failed");
    }
  };

  const tableActions: IDropdownAction[] = [
    {
      label: "View / Manage", icon: <VisibilityIcon color="primary" />,
      onClick: (o: IBuyerOrderList) => navigate(`/admin/sourcing/buyer-orders/${o.id}`),
    },
    {
      label: "Confirm", icon: <CheckCircleIcon color="success" />,
      onClick: (o: IBuyerOrderList) => handleQuickAction("confirm", o.id),
      condition: (o: IBuyerOrderList) => o.status === "draft",
    },
    {
      label: "Mark Dispatched", icon: <LocalShippingIcon color="warning" />,
      onClick: (o: IBuyerOrderList) => handleQuickAction("dispatch", o.id),
      condition: (o: IBuyerOrderList) => o.status === "confirmed",
    },
    {
      label: "Mark Delivered", icon: <CheckCircleIcon color="info" />,
      onClick: (o: IBuyerOrderList) => handleQuickAction("deliver", o.id),
      condition: (o: IBuyerOrderList) => o.status === "dispatched",
    },
    {
      label: "Cancel", icon: <DeleteIcon color="error" />,
      onClick: (o: IBuyerOrderList) => {
        if (window.confirm("Cancel this order?")) handleQuickAction("cancel", o.id);
      },
      condition: (o: IBuyerOrderList) => !["invoiced", "completed", "cancelled"].includes(o.status),
    },
  ];

  const columns = [
    {
      Header: "Order #", accessor: "order_number", minWidth: 170,
      Cell: ({ row }: any) => (
        <Typography
          color="primary" variant="h6"
          sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
          onClick={() => navigate(`/admin/sourcing/buyer-orders/${row.original.id}`)}
        >
          {row.original.order_number}
        </Typography>
      ),
    },
    { Header: "Buyer", accessor: "buyer_name", minWidth: 160 },
    {
      Header: "Revenue", accessor: "subtotal", minWidth: 130,
      Cell: ({ row }: any) => (
        <Span sx={{ fontWeight: 600 }}>{formatCurrency(row.original.subtotal)}</Span>
      ),
    },
    {
      Header: "Gross Profit", accessor: "gross_profit", minWidth: 130,
      Cell: ({ row }: any) => (
        <Span sx={{ fontWeight: 600, color: row.original.gross_profit >= 0 ? "success.main" : "error.main" }}>
          {formatCurrency(row.original.gross_profit)}
        </Span>
      ),
    },
    {
      Header: "Invoice", accessor: "invoice_status", minWidth: 120,
      Cell: ({ row }: any) => row.original.invoice_status
        ? <Chip label={row.original.invoice_status.toUpperCase()} color={BUYER_INVOICE_STATUS_COLORS[row.original.invoice_status]} size="small" />
        : <Span sx={{ color: "text.secondary", fontSize: 12 }}>Not Issued</Span>,
    },
    {
      Header: "Status", accessor: "status", minWidth: 120,
      Cell: ({ row }: any) => (
        <Chip label={row.original.status.toUpperCase()} color={BUYER_ORDER_STATUS_COLORS[row.original.status]} size="small" />
      ),
    },
    {
      Header: "Created", accessor: "created_at", minWidth: 120,
      Cell: ({ row }: any) => (
        <Span sx={{ fontSize: 13 }}>{formatDateToDDMMYYYY(row.original.created_at)}</Span>
      ),
    },
    {
      Header: "Action", accessor: "action", minWidth: 80,
      Cell: ({ row }: any) => <DropdownActionBtn actions={tableActions} metaData={row.original} />,
    },
  ];

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <SearchInput
          value={searchQuery} type="text" placeholder="Search buyer name or order number..."
          onChange={(e: any) => setSearchQuery(e.target.value)}
          onKeyPress={(e: any) => {
            if (e.key === "Enter") setFilters({ ...filters, search: searchQuery, page: 1 });
          }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status || ""} label="Status"
            onChange={e => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}
          >
            <MenuItem value="">All</MenuItem>
            {["draft", "confirmed", "dispatched", "delivered", "invoiced", "completed", "cancelled"].map(s => (
              <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button sx={{ ml: "auto" }} variant="contained" startIcon={<AddIcon />}
          onClick={() => setShowCreateForm(true)}>
          New Buyer Order
        </Button>
      </Box>

      <CustomTable
        columnShape={columns}
        data={orders?.results || []}
        dataCount={orders?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(p: number) => setFilters({ ...filters, page: p + 1 })}
        pageIndex={filters.page - 1}
        setPageSize={(s: number) => setFilters({ ...filters, page_size: s, page: 1 })}
        loading={loading}
      />

      {showCreateForm && (
        <CreateBuyerOrderForm
          hubs={hubs}
          handleClose={() => setShowCreateForm(false)}
          callBack={() => { setShowCreateForm(false); fetchData(filters); }}
        />
      )}
    </Box>
  );
};

export default BuyerOrders;