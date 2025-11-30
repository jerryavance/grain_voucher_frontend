import React, { FC, useState } from "react";
import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import { Select, MenuItem, FormControl, InputLabel, TextField } from "@mui/material";

interface TradeFiltersProps {
  onApplyFilters: (filters: any) => void;
  onClearFilters: () => void;
  currentFilters: any;
}

const TradeFilters: FC<TradeFiltersProps> = ({
  onApplyFilters,
  onClearFilters,
  currentFilters,
}) => {
  const [filters, setFilters] = useState(currentFilters);

  const handleChange = (field: string, value: any) => {
    setFilters({ ...filters, [field]: value });
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status || ""}
              label="Status"
              onChange={(e) => handleChange("status", e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="pending_approval">Pending Approval</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="ready_for_delivery">Ready for Delivery</MenuItem>
              <MenuItem value="in_transit">In Transit</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Created After"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={filters.created_after || ""}
            onChange={(e) => handleChange("created_after", e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Created Before"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={filters.created_before || ""}
            onChange={(e) => handleChange("created_before", e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Min Revenue"
            type="number"
            value={filters.min_revenue || ""}
            onChange={(e) => handleChange("min_revenue", e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Max Revenue"
            type="number"
            value={filters.max_revenue || ""}
            onChange={(e) => handleChange("max_revenue", e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Allocated</InputLabel>
            <Select
              value={filters.allocated !== undefined ? filters.allocated.toString() : ""}
              label="Allocated"
              onChange={(e) => handleChange("allocated", e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
            <Button variant="outlined" onClick={onClearFilters}>
              Clear
            </Button>
            <Button variant="contained" onClick={() => onApplyFilters(filters)}>
              Apply Filters
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TradeFilters;