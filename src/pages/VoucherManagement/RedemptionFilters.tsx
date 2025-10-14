import React, { FC } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";

interface IRedemptionFiltersProps {
  filters: any;
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
}

const RedemptionFilters: FC<IRedemptionFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const handleChange = (field: string, value: any) => {
    onFilterChange({ ...filters, [field]: value, page: 1 });
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        flexWrap: "wrap",
        alignItems: "center",
        mb: 2,
      }}
    >
      <FilterListIcon color="action" />

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={filters.status || ""}
          onChange={(e) => handleChange("status", e.target.value)}
          label="Status"
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
          <MenuItem value="paid">Paid</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel>Payment Method</InputLabel>
        <Select
          value={filters.payment_method || ""}
          onChange={(e) => handleChange("payment_method", e.target.value)}
          label="Payment Method"
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="cash">Cash Pickup</MenuItem>
          <MenuItem value="mobile_money">Mobile Money</MenuItem>
          <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
          <MenuItem value="check">Bank Check</MenuItem>
          <MenuItem value="grain">In-Kind Grain</MenuItem>
        </Select>
      </FormControl>

      <Button
        variant="outlined"
        size="small"
        startIcon={<ClearIcon />}
        onClick={onClearFilters}
      >
        Clear Filters
      </Button>
    </Box>
  );
};

export default RedemptionFilters;