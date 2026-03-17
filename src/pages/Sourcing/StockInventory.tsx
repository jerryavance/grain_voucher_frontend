// sourcing/pages/StockInventory.tsx
/**
 * Stock Inventory (Sale Lots) page.
 *
 * FIXES (Images 2, 5):
 *  - "Record Rejection" button now wired with onClick handler
 *  - Button correctly only shows for lots with available or sold stock
 *  - Opens RecordRejectionForm modal on click
 */
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Tooltip,
} from "@mui/material";
import { Download as DownloadIcon } from "@mui/icons-material";
import { toast } from "react-hot-toast";
import SourcingService from "./Sourcing.service";
import RecordRejectionForm from "./RecordRejectionForm";
import {
  formatCurrency,
  formatKg,
  formatStatus,
  getStatusColor,
} from "../../utils/formatters";

type StatusFilter = "all" | "available" | "partially_sold" | "sold" | "rejected";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "available", label: "available" },
  { value: "partially_sold", label: "partially sold" },
  { value: "sold", label: "sold" },
  { value: "rejected", label: "rejected" },
];

const StockInventory: React.FC = () => {
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  // Rejection modal state
  const [rejectionOpen, setRejectionOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<any>(null);

  const fetchLots = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page: page + 1,
        page_size: rowsPerPage,
      };
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      const res = await SourcingService.getSaleLots(params);
      setLots(res.results || res);
      setTotalCount(res.count || (res.results || res).length);
    } catch (err: any) {
      toast.error("Failed to load stock inventory");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, statusFilter]);

  useEffect(() => {
    fetchLots();
  }, [fetchLots]);

  /**
   * ✅ FIX: This handler was missing — wires the "Record Rejection" button
   * that was previously inactive (Images 2, 5).
   */
  const handleRecordRejection = (lot: any) => {
    setSelectedLot(lot);
    setRejectionOpen(true);
  };

  const handleRejectionSuccess = () => {
    fetchLots(); // Refresh the table
  };

  const canRecordRejection = (lot: any): boolean => {
    // Only allow rejection if there's stock available or sold that can be rejected
    const available = Number(lot.available_quantity_kg || 0);
    const sold = Number(lot.sold_quantity_kg || 0);
    return available + sold > 0;
  };

  const handleExport = () => {
    toast.success("Export started...");
    // TODO: Implement CSV export
  };

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={700} mb={1}>
        Stock Inventory (Sale Lots)
      </Typography>

      {/* ── Filter buttons + Export ─────────────────────────────────────── */}
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
        <ButtonGroup size="small" sx={{ mr: 2 }}>
          {STATUS_FILTERS.map((f) => (
            <Button
              key={f.value}
              variant={statusFilter === f.value ? "contained" : "outlined"}
              onClick={() => {
                setStatusFilter(f.value);
                setPage(0);
              }}
            >
              {f.label}
            </Button>
          ))}
        </ButtonGroup>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
        >
          Export
        </Button>
      </Box>

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Investor</TableCell>
                <TableCell>Available (kg)</TableCell>
                <TableCell>Sold (kg)</TableCell>
                <TableCell>Rejected (kg)</TableCell>
                <TableCell>Cost/kg</TableCell>
                <TableCell>Total Cost</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : lots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    No sale lots found
                  </TableCell>
                </TableRow>
              ) : (
                lots.map((lot) => (
                  <TableRow key={lot.id} hover>
                    <TableCell>
                      {lot.investor_name || "—"}
                    </TableCell>
                    <TableCell
                      sx={{
                        color:
                          Number(lot.available_quantity_kg) === 0
                            ? "#4caf50"
                            : "#ff9800",
                        fontWeight: 600,
                      }}
                    >
                      {formatKg(lot.available_quantity_kg)}
                    </TableCell>
                    <TableCell>{formatKg(lot.sold_quantity_kg)}</TableCell>
                    <TableCell>
                      {Number(lot.rejected_quantity_kg) > 0
                        ? formatKg(lot.rejected_quantity_kg)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(lot.cost_per_kg)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(lot.total_sourcing_cost)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={formatStatus(lot.status)}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(lot.status),
                          color: "#fff",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {/* ✅ FIX: Button now has onClick handler */}
                      {canRecordRejection(lot) && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleRecordRejection(lot)}
                        >
                          Record Rejection
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {/* ── Rejection Form Modal ───────────────────────────────────────── */}
      {selectedLot && (
        <RecordRejectionForm
          open={rejectionOpen}
          onClose={() => {
            setRejectionOpen(false);
            setSelectedLot(null);
          }}
          onSuccess={handleRejectionSuccess}
          saleLot={{
            id: selectedLot.id,
            lot_number: selectedLot.lot_number,
            available_quantity_kg: selectedLot.available_quantity_kg,
            sold_quantity_kg: selectedLot.sold_quantity_kg,
            grain_type_name:
              selectedLot.grain_type_name ||
              selectedLot.grain_type_detail?.name,
            investor_name: selectedLot.investor_name,
            cost_per_kg: selectedLot.cost_per_kg,
          }}
        />
      )}
    </Box>
  );
};

export default StockInventory;