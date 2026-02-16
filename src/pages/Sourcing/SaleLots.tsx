import { FC, useEffect, useState } from "react";
import { Box, Button, Chip, Typography } from "@mui/material";
import { toast } from "react-hot-toast";
import { Span } from "../../components/Typography";
import CustomTable from "../../components/UI/CustomTable";
import useTitle from "../../hooks/useTitle";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import { SourcingService } from "./Sourcing.service";
import { formatCurrency, formatWeight } from "./SourcingConstants";
import { ISaleLotsResults } from "./Sourcing.interface";

const LOT_STATUS_COLORS: Record<string, any> = {
  available: "success", partially_sold: "warning", sold: "default",
};

const STATUS_TABS = ["", "available", "partially_sold", "sold"];

const SaleLots: FC = () => {
  useTitle("Stock Inventory");
  const [lots, setLots] = useState<ISaleLotsResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchData(filters); }, [filters]);

  const fetchData = async (params?: any) => {
    setLoading(true);
    try { setLots(await SourcingService.getSaleLots(params)); }
    catch { toast.error("Failed to load stock lots"); }
    finally { setLoading(false); }
  };

  const columns = [
    {
      Header: "Lot #", accessor: "lot_number", minWidth: 160,
      Cell: ({ row }: any) => (
        <Typography color="primary" variant="h6">{row.original.lot_number}</Typography>
      ),
    },
    { Header: "Grain Type", accessor: "grain_type_name", minWidth: 130 },
    {
      Header: "Grade", accessor: "quality_grade_name", minWidth: 100,
      Cell: ({ row }: any) => row.original.quality_grade_name
        ? <Chip label={row.original.quality_grade_name} size="small" color="success" variant="outlined" />
        : <Span sx={{ color: "text.secondary" }}>—</Span>,
    },
    { Header: "Hub", accessor: "hub_name", minWidth: 120 },
    {
      Header: "Investor", accessor: "investor_name", minWidth: 150,
      Cell: ({ row }: any) => (
        <Span sx={{ fontSize: 13 }}>{row.original.investor_name || "—"}</Span>
      ),
    },
    {
      Header: "Available (kg)", accessor: "available_quantity_kg", minWidth: 140,
      Cell: ({ row }: any) => (
        <Span sx={{ fontWeight: 600, color: "success.main" }}>
          {formatWeight(row.original.available_quantity_kg)}
        </Span>
      ),
    },
    {
      Header: "Sold (kg)", accessor: "sold_quantity_kg", minWidth: 110,
      Cell: ({ row }: any) => <Span>{formatWeight(row.original.sold_quantity_kg)}</Span>,
    },
    {
      Header: "Cost/kg", accessor: "cost_per_kg", minWidth: 120,
      Cell: ({ row }: any) => <Span>{formatCurrency(row.original.cost_per_kg)}</Span>,
    },
    {
      Header: "Total Cost", accessor: "total_sourcing_cost", minWidth: 130,
      Cell: ({ row }: any) => (
        <Span sx={{ fontWeight: 600 }}>{formatCurrency(row.original.total_sourcing_cost)}</Span>
      ),
    },
    {
      Header: "Status", accessor: "status", minWidth: 140,
      Cell: ({ row }: any) => (
        <Chip
          label={row.original.status.replace(/_/g, " ").toUpperCase()}
          color={LOT_STATUS_COLORS[row.original.status]}
          size="small"
        />
      ),
    },
  ];

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h5">Stock Inventory (Sale Lots)</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {STATUS_TABS.map(s => (
            <Button
              key={s}
              size="small"
              variant={(filters.status || "") === s ? "contained" : "outlined"}
              onClick={() => setFilters({ ...filters, status: s || undefined, page: 1 })}
            >
              {s ? s.replace(/_/g, " ") : "All"}
            </Button>
          ))}
        </Box>
      </Box>
      <CustomTable
        columnShape={columns}
        data={lots?.results || []}
        dataCount={lots?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(p: number) => setFilters({ ...filters, page: p + 1 })}
        pageIndex={filters.page - 1}
        setPageSize={(s: number) => setFilters({ ...filters, page_size: s, page: 1 })}
        loading={loading}
      />
    </Box>
  );
};

export default SaleLots;