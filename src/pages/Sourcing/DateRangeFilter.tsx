/**
 * DateRangeFilter.tsx
 * 
 * Reusable date range filter for all sourcing list pages.
 * Provides date_from and date_to inputs that update parent filters.
 */

import { FC, useState } from "react";
import { Box, TextField, Button, Chip } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";

interface DateRangeFilterProps {
  onApply: (dateFrom: string | undefined, dateTo: string | undefined) => void;
  /** Currently applied date_from value */
  dateFrom?: string;
  /** Currently applied date_to value */
  dateTo?: string;
}

const DateRangeFilter: FC<DateRangeFilterProps> = ({ onApply, dateFrom, dateTo }) => {
  const [from, setFrom] = useState(dateFrom || "");
  const [to, setTo] = useState(dateTo || "");

  const handleApply = () => {
    onApply(from || undefined, to || undefined);
  };

  const handleClear = () => {
    setFrom("");
    setTo("");
    onApply(undefined, undefined);
  };

  const hasFilter = Boolean(dateFrom || dateTo);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
      <TextField
        size="small"
        type="date"
        label="From"
        value={from}
        onChange={e => setFrom(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 140 }}
      />
      <TextField
        size="small"
        type="date"
        label="To"
        value={to}
        onChange={e => setTo(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 140 }}
      />
      <Button
        size="small"
        variant="contained"
        startIcon={<FilterListIcon />}
        onClick={handleApply}
        sx={{ height: 40 }}
      >
        Filter
      </Button>
      {hasFilter && (
        <Chip
          label="Clear dates"
          size="small"
          onDelete={handleClear}
          deleteIcon={<ClearIcon />}
          color="default"
        />
      )}
    </Box>
  );
};

export default DateRangeFilter;