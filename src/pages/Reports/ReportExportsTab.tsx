// src/pages/Reports/components/ReportExportsTab.tsx
import { Box, Button, Chip, Typography, IconButton, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchInput from "../../components/SearchInput";
import CustomTable from "../../components/UI/CustomTable";
import { ReportsService } from "./Reports.service";
import { IReportExport, IReportExportsResults } from "./Reports.interface";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import { Span } from "../../components/Typography";
import ProgressIndicator from "../../components/UI/ProgressIndicator";

const ReportExportsTab = () => {
  const [exports, setExports] = useState<IReportExportsResults>();
  const [filters, setFilters] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchData(filters);
  }, [filters]);

  const fetchData = async (params?: any) => {
    try {
      setLoading(true);
      const resp: IReportExportsResults = await ReportsService.getReportExports(params);
      setExports(resp);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching exports:", error);
      toast.error("Failed to load report exports");
    }
  };

  const handleDownloadReport = async (reportExport: IReportExport) => {
    try {
      toast.loading("Preparing download...");
      const blob = await ReportsService.downloadReport(reportExport.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportExport.report_type}_report_${formatDateToDDMMYYYY(reportExport.requested_at)}.${reportExport.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success("Report downloaded successfully");
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Failed to download report");
    }
  };

  const handleRefresh = () => {
    fetchData(filters);
  };

  const getStatusChip = (status: string) => {
    const statusConfig: Record<string, { color: any; label: string }> = {
      pending: { color: "default", label: "Pending" },
      processing: { color: "info", label: "Processing" },
      completed: { color: "success", label: "Completed" },
      failed: { color: "error", label: "Failed" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const columns = [
    {
      Header: "Report Type",
      accessor: "report_type_display",
      minWidth: 150,
      Cell: ({ row }: any) => {
        const data = row.original;
        return (
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {data.report_type_display}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {data.format_display}
            </Typography>
          </Box>
        );
      },
    },
    {
      Header: "Status",
      accessor: "status",
      minWidth: 120,
      Cell: ({ row }: any) => {
        const data = row.original;
        return getStatusChip(data.status);
      },
    },
    {
      Header: "Records",
      accessor: "record_count",
      minWidth: 100,
      Cell: ({ row }: any) => {
        return (
          <Chip 
            label={row.original.record_count.toLocaleString()} 
            size="small" 
            variant="outlined"
          />
        );
      },
    },
    {
      Header: "Requested",
      accessor: "requested_at",
      minWidth: 150,
      Cell: ({ row }: any) => {
        const data = row.original;
        return (
          <Box>
            <Typography variant="body2">
              {formatDateToDDMMYYYY(data.requested_at)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              by {data.generated_by.first_name} {data.generated_by.last_name}
            </Typography>
          </Box>
        );
      },
    },
    {
      Header: "Completed",
      accessor: "completed_at",
      minWidth: 120,
      Cell: ({ row }: any) => {
        const data = row.original;
        return data.completed_at ? (
          <Typography variant="body2">
            {formatDateToDDMMYYYY(data.completed_at)}
          </Typography>
        ) : (
          <Span sx={{ fontSize: 12, color: 'text.secondary' }}>-</Span>
        );
      },
    },
    {
      Header: "Expires",
      accessor: "expires_at",
      minWidth: 120,
      Cell: ({ row }: any) => {
        const data = row.original;
        return (
          <Box>
            <Typography variant="body2">
              {formatDateToDDMMYYYY(data.expires_at)}
            </Typography>
            {data.is_expired && (
              <Chip label="Expired" color="error" size="small" variant="outlined" />
            )}
          </Box>
        );
      },
    },
    {
      Header: "Action",
      accessor: "action",
      minWidth: 100,
      maxWidth: 100,
      Cell: ({ row }: any) => {
        const data: IReportExport = row.original;
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {data.status === 'completed' && !data.is_expired && (
              <Tooltip title="Download Report">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleDownloadReport(data)}
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {data.status === 'processing' && (
              <ProgressIndicator size={20} />
            )}
            {data.status === 'failed' && (
              <Tooltip title={data.error_message}>
                <Chip label="Error" color="error" size="small" />
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      <Box sx={styles.tablePreHeader}>
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          type="text"
          placeholder="Search reports..."
        />
        <Tooltip title="Refresh">
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <CustomTable
        columnShape={columns}
        data={exports?.results || []}
        dataCount={exports?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(page: number) => setFilters({ ...filters, page })}
        pageIndex={filters?.page || 1}
        setPageSize={(size: number) => setFilters({ ...filters, page_size: size })}
        loading={loading}
      />
    </Box>
  );
};

const styles = {
  tablePreHeader: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    marginBottom: 2,
  },
};

export default ReportExportsTab;