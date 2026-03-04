import { FC, useEffect, useState } from "react";
import {
  Box, Button, Chip, FormControl, InputLabel, MenuItem, Select, Typography,
} from "@mui/material";
import { toast } from "react-hot-toast";
import RecyclingIcon from "@mui/icons-material/Recycling";
import useTitle from "../../hooks/useTitle";
import CustomTable from "../../components/UI/CustomTable";
import { SourcingService } from "./Sourcing.service";
import { IRejectedLot, IRejectedLotsResults } from "./Sourcing.interface";
import { RejectedLotColumnShape } from "./AllColumnShapes";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import { REJECTION_STATUS_OPTIONS } from "./SourcingConstants";
import { useNavigate } from "react-router-dom";

const RejectedLots: FC = () => {
  useTitle("Rejected Lots");
  const navigate = useNavigate();

  const [records, setRecords] = useState<IRejectedLotsResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { fetchData(filters); }, [filters]);

  const fetchData = async (params?: any) => {
    setLoading(true);
    try { setRecords(await SourcingService.getRejectedLots(params)); }
    catch { toast.error("Failed to load rejected lots"); }
    finally { setLoading(false); }
  };

  const handleCreateReplacement = async (record: IRejectedLot) => {
    if (!window.confirm(
      `Create a replacement sourcing trade for ${record.rejected_quantity_kg} kg?\nThis will create a new Source Order.`
    )) return;

    setActionLoading(record.id);
    try {
      const newOrder = await SourcingService.createReplacementTrade(record.id);
      toast.success(`Replacement order ${newOrder.order_number} created`);
      fetchData(filters);
      // Navigate to the new order
      navigate(`/admin/sourcing/orders/${newOrder.id}`);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.response?.data?.error || "Failed to create replacement";
      toast.error(msg);
    } finally { setActionLoading(null); }
  };

  const tableActions: IDropdownAction[] = [
    {
      label: "Create Replacement Trade",
      icon: <RecyclingIcon color="success" />,
      onClick: handleCreateReplacement,
      // Only show if no replacement order yet and status is pending
      condition: (record: IRejectedLot) => !record.replacement_order && record.status === "pending",
    },
  ];

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h5">Rejected Lots</Typography>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={filters.status || ""}
            label="Status Filter"
            onChange={e => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}
          >
            <MenuItem value="">All Statuses</MenuItem>
            {REJECTION_STATUS_OPTIONS.map(opt => (
              <MenuItem key={opt.value as string} value={opt.value as string}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <CustomTable
        columnShape={RejectedLotColumnShape(tableActions)}
        data={records?.results || []}
        dataCount={records?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(p: number) => setFilters({ ...filters, page: p + 1 })}
        pageIndex={filters.page - 1}
        setPageSize={(s: number) => setFilters({ ...filters, page_size: s, page: 1 })}
        loading={loading}
      />
    </Box>
  );
};

export default RejectedLots;