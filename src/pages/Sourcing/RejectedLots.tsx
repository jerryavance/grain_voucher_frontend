import { FC, useEffect, useState } from "react";
import { Box, Button, FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
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
import { ExportButtons, REJECTED_LOT_EXPORT_COLUMNS } from "./ExportUtils";
import CreateReplacementForm from "./CreateReplacementForm";

const RejectedLots: FC = () => {
  useTitle("Rejected Lots");
  const [records, setRecords] = useState<IRejectedLotsResults>();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading] = useState(false);
  const [replacementLot, setReplacementLot] = useState<IRejectedLot | null>(null);

  useEffect(() => { fetchData(filters); }, [filters]);

  const fetchData = async (params?: any) => {
    setLoading(true);
    try {
      setRecords(await SourcingService.getRejectedLots(params));
    } catch {
      toast.error("Failed to load rejected lots");
    } finally {
      setLoading(false);
    }
  };

  const tableActions: IDropdownAction[] = [
    {
      label: "Create Replacement Trade",
      icon: <RecyclingIcon color="success" />,
      onClick: (r: IRejectedLot) => setReplacementLot(r),
      condition: (r: IRejectedLot) => !r.replacement_order_number && r.status === "pending",
    },
  ];

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h5">Rejected Lots</Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status || ""}
              label="Status"
              onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}
            >
              <MenuItem value="">All</MenuItem>
              {REJECTION_STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value as string} value={opt.value as string}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <ExportButtons
            data={records?.results || []}
            columns={REJECTED_LOT_EXPORT_COLUMNS}
            filename="rejected_lots"
          />
        </Box>
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

      {replacementLot && (
        <CreateReplacementForm
          open={!!replacementLot}
          rejectedLot={replacementLot}
          onClose={() => setReplacementLot(null)}
          onSuccess={() => {
            setReplacementLot(null);
            fetchData(filters);
          }}
        />
      )}
    </Box>
  );
};

export default RejectedLots;