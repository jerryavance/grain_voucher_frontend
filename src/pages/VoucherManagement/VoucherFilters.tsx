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

interface IVoucherFiltersProps {
  filters: any;
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
}

const VoucherFilters: FC<IVoucherFiltersProps> = ({
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
          <MenuItem value="issued">Issued</MenuItem>
          <MenuItem value="pending_verification">Pending Verification</MenuItem>
          <MenuItem value="transferred">Transferred</MenuItem>
          <MenuItem value="redeemed">Redeemed</MenuItem>
          <MenuItem value="expired">Expired</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel>Verification Status</InputLabel>
        <Select
          value={filters.verification_status || ""}
          onChange={(e) => handleChange("verification_status", e.target.value)}
          label="Verification Status"
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="verified">Verified</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
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

export default VoucherFilters;