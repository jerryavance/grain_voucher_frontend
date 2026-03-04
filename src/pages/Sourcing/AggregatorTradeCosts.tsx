import { FC, useEffect, useState, useCallback } from "react";
import { Box, Button, Chip, Typography } from "@mui/material";
import { toast } from "react-hot-toast";
import { debounce } from "lodash";
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
import EditIcon from "@mui/icons-material/Edit";
import { formatCurrency, formatWeight, formatPercentage } from "./SourcingConstants";

const AggregatorTradeCosts: FC = () => {
  useTitle("Aggregator Trade Costs");

  const [records, setRecords] = useState<IAggregatorTradeCostsResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state for create/edit
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState<IAggregatorTradeCost | null>(null);
  const [editOrderId, setEditOrderId] = useState<string>("");
  const [editOrderNumber, setEditOrderNumber] = useState<string>("");

  useEffect(() => { fetchData(filters); }, [filters]);

  const fetchData = async (params?: any) => {
    setLoading(true);
    try { setRecords(await SourcingService.getAggregatorTradeCosts(params)); }
    catch { toast.error("Failed to load aggregator costs"); }
    finally { setLoading(false); }
  };

  const handleSearch = () => {
    setFilters({ ...filters, search: searchQuery, page: 1 });
  };

  const handleEdit = (record: IAggregatorTradeCost) => {
    setEditRecord(record);
    setEditOrderId(record.source_order);
    setEditOrderNumber(record.source_order_number);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditRecord(null);
    setEditOrderId("");
    setEditOrderNumber("");
  };

  const tableActions: IDropdownAction[] = [
    {
      label: "Edit",
      icon: <EditIcon color="primary" />,
      onClick: handleEdit,
    },
  ];

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <Box sx={{ flexGrow: 1, minWidth: 250 }}>
          <SearchInput
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            onKeyPress={(e: React.KeyboardEvent) => { if (e.key === "Enter") handleSearch(); }}
            type="text"
            placeholder="Search by order number..."
          />
        </Box>
        <Typography variant="h5" sx={{ mr: "auto" }}>Aggregator Trade Costs</Typography>
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

      {/* Edit form — source_order is locked since we come from an existing record */}
      {showForm && editOrderId && (
        <AggregatorTradeCostForm
          open={showForm}
          sourceOrderId={editOrderId}
          sourceOrderNumber={editOrderNumber}
          existingRecord={editRecord}
          handleClose={handleCloseForm}
          callBack={() => { handleCloseForm(); fetchData(filters); }}
        />
      )}
    </Box>
  );
};

export default AggregatorTradeCosts;