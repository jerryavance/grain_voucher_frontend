// src/pages/Reports/components/ExportStatusIndicator.tsx
import { Box, Chip, CircularProgress, Tooltip, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { IReportExport } from "./Reports.interface";

interface ExportStatusIndicatorProps {
  export: IReportExport;
  showDetails?: boolean;
}

const ExportStatusIndicator = ({ export: exportData, showDetails = false }: ExportStatusIndicatorProps) => {
  const getStatusConfig = () => {
    switch (exportData.status) {
      case 'pending':
        return {
          icon: <HourglassEmptyIcon fontSize="small" />,
          color: 'default' as const,
          label: 'Pending',
          description: 'Report is queued for processing',
        };
      case 'processing':
        return {
          icon: <CircularProgress size={16} />,
          color: 'info' as const,
          label: 'Processing',
          description: 'Report is being generated',
        };
      case 'completed':
        return {
          icon: <CheckCircleIcon fontSize="small" />,
          color: exportData.is_expired ? 'default' as const : 'success' as const,
          label: exportData.is_expired ? 'Expired' : 'Completed',
          description: exportData.is_expired 
            ? 'Download link has expired' 
            : 'Report is ready for download',
        };
      case 'failed':
        return {
          icon: <ErrorIcon fontSize="small" />,
          color: 'error' as const,
          label: 'Failed',
          description: exportData.error_message || 'Report generation failed',
        };
      default:
        return {
          icon: null,
          color: 'default' as const,
          label: 'Unknown',
          description: 'Unknown status',
        };
    }
  };

  const config = getStatusConfig();

  if (showDetails) {
    return (
      <Tooltip title={config.description} arrow>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={config.icon ?? undefined}
            label={config.label}
            color={config.color}
            size="small"
            sx={{ minWidth: 100 }}
          />
          {exportData.status === 'completed' && !exportData.is_expired && (
            <Typography variant="caption" color="text.secondary">
              {exportData.record_count.toLocaleString()} records
            </Typography>
          )}
        </Box>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={config.description} arrow>
      <Chip
        icon={config.icon ?? undefined}
        label={config.label}
        color={config.color}
        size="small"
      />
    </Tooltip>
  );
};

export default ExportStatusIndicator;