/**
 * AggregatorTradeCosts.tsx — UPDATED: Export added
 */

import { FC, useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { toast } from "react-hot-toast";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import useTitle from "../../hooks/useTitle";
import CustomTable from "../../components/UI/CustomTable";
import SearchInput from "../../components/SearchInput";
import { SourcingService } from "./Sourcing.service";
import { IAggregatorTradeCost, IAggregatorTradeCostsResults } from "./Sourcing.interface";
import { AggregatorTradeCostColumnShape } from "./AllColumnShapes";
import { AggregatorTradeCostForm } from "./SourcingForms";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import { ExportButtons } from "./ExportUtils";

const AGG_EXPORT_COLUMNS = [
  { header: "Order #", key: "source_order_number" },
  { header: "Source Qty (kg)", key: "source_quantity_kg" },
  { header: "Arrived Qty (kg)", key: "arrived_quantity_kg" },
  { header: "Transit Loss (kg)", key: "tonnage_lost_in_transit_kg" },
  { header: "Loss %", key: "transit_loss_pct" },
  { header: "Buyer Deduction (kg)", key: "buyer_deduction_kg" },
  { header: "Net Accepted (kg)", key: "net_accepted_quantity_kg" },
  { header: "Add. Costs", key: "total_additional_cost" },
  { header: "Eff. Cost/kg", key: "effective_cost_per_kg" },
  { header: "Created", key: "created_at" },
];

const AggregatorTradeCosts: FC = () => {
  useTitle("Aggregator Trade Costs");
  const [records, setRecords] = useState<IAggregatorTradeCostsResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState<IAggregatorTradeCost | null>(null);
  const [editOrderId, setEditOrderId] = useState("");
  const [editOrderNumber, setEditOrderNumber] = useState("");

  useEffect(() => { fetchData(filters); }, [filters]);

  const fetchData = async (params?: any) => {
    setLoading(true);
    try { setRecords(await SourcingService.getAggregatorTradeCosts(params)); }
    catch { toast.error("Failed to load aggregator costs"); }
    finally { setLoading(false); }
  };

  const handleEdit = (record: IAggregatorTradeCost) => {
    setEditRecord(record);
    setEditOrderId(record.source_order);
    setEditOrderNumber(record.source_order_number);
    setShowForm(true);
  };

  // ✅ FIX: New handler for creating a new aggregator cost
  const handleCreate = () => {
    setEditRecord(null);
    setEditOrderId("");
    setEditOrderNumber("");
    setShowForm(true);
  };

  const handleCloseForm = () => { setShowForm(false); setEditRecord(null); setEditOrderId(""); setEditOrderNumber(""); };

  const tableActions: IDropdownAction[] = [
    { label: "Edit", icon: <EditIcon color="primary" />, onClick: handleEdit },
  ];

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <Box sx={{ flexGrow: 1, minWidth: 250 }}>
          <SearchInput value={searchQuery} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)} onKeyPress={(e: React.KeyboardEvent) => { if (e.key === "Enter") setFilters({ ...filters, search: searchQuery, page: 1 }); }} type="text" placeholder="Search by order number..." />
        </Box>
        <Typography variant="h5" sx={{ mr: "auto" }}>Aggregator Trade Costs</Typography>
        {/* ✅ FIX: Create button — was missing entirely */}
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate} sx={{ whiteSpace: "nowrap" }}>
          New Aggregator Cost
        </Button>
        <ExportButtons data={records?.results || []} columns={AGG_EXPORT_COLUMNS} filename="aggregator_costs" />
      </Box>

      <CustomTable
        columnShape={AggregatorTradeCostColumnShape(tableActions)}
        data={records?.results || []}
        dataCount={records?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(p: number) => setFilters({ ...filters, page: p + 1 })}
        pageIndex={filters.page - 1}
        setPageSize={(s: number) => setFilters({ ...filters, page_size: s, page: 1 })}
        loading={loading}
      />

      {/* ✅ FIX: Form now opens for both create (no editOrderId) and edit */}
      {showForm && (
        <AggregatorTradeCostForm
          open={showForm} sourceOrderId={editOrderId} sourceOrderNumber={editOrderNumber}
          existingRecord={editRecord} handleClose={handleCloseForm}
          callBack={() => { handleCloseForm(); fetchData(filters); }}
        />
      )}
    </Box>
  );
};

export default AggregatorTradeCosts;