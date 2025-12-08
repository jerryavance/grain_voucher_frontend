// src/pages/Reports/components/ReportSchedulesTab.tsx
import { Box, Button, Chip, Typography, IconButton, Tooltip, Switch } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AddIcon from "@mui/icons-material/Add";
import SearchInput from "../../components/SearchInput";
import CustomTable from "../../components/UI/CustomTable";
import { ReportsService } from "./Reports.service";
import { IReportSchedule, IReportSchedulesResults } from "./Reports.interface";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import { useModalContext } from "../../contexts/ModalDialogContext";
import ScheduleForm from "./ScheduleForm";

const ReportSchedulesTab = () => {
  const { setShowModal } = useModalContext();
  const [schedules, setSchedules] = useState<IReportSchedulesResults>();
  const [filters, setFilters] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editSchedule, setEditSchedule] = useState<IReportSchedule | null>(null);
  const [formType, setFormType] = useState<"Save" | "Update">("Save");

  useEffect(() => {
    fetchData(filters);
  }, [filters]);

  const fetchData = async (params?: any) => {
    try {
      setLoading(true);
      const resp: IReportSchedulesResults = await ReportsService.getReportSchedules(params);
      setSchedules(resp);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching schedules:", error);
      toast.error("Failed to load report schedules");
    }
  };

  const handleOpenModal = () => {
    setFormType("Save");
    setEditSchedule(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditSchedule(null);
  };

  const handleEditSchedule = (schedule: IReportSchedule) => {
    setFormType("Update");
    setEditSchedule(schedule);
    setTimeout(() => {
      setShowModal(true);
    });
  };

  const handleDeleteSchedule = async (schedule: IReportSchedule) => {
    if (!window.confirm(`Are you sure you want to delete "${schedule.name}"?`)) {
      return;
    }

    try {
      await ReportsService.deleteReportSchedule(schedule.id);
      toast.success("Schedule deleted successfully");
      fetchData(filters);
    } catch (error: any) {
      toast.error("Failed to delete schedule");
    }
  };

  const handleToggleActive = async (schedule: IReportSchedule) => {
    try {
      await ReportsService.toggleScheduleActive(schedule.id);
      toast.success(`Schedule ${schedule.is_active ? 'deactivated' : 'activated'} successfully`);
      fetchData(filters);
    } catch (error: any) {
      toast.error("Failed to toggle schedule status");
    }
  };

  const handleRunNow = async (schedule: IReportSchedule) => {
    try {
      toast.loading("Triggering report generation...");
      await ReportsService.runScheduleNow(schedule.id);
      toast.dismiss();
      toast.success("Report generation started");
    } catch (error: any) {
      toast.dismiss();
      toast.error("Failed to run schedule");
    }
  };

  const columns = [
    {
      Header: "Schedule Name",
      accessor: "name",
      minWidth: 200,
      Cell: ({ row }: any) => {
        const data = row.original;
        return (
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {data.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {data.report_type_display} · {data.format.toUpperCase()}
            </Typography>
          </Box>
        );
      },
    },
    {
      Header: "Frequency",
      accessor: "frequency",
      minWidth: 120,
      Cell: ({ row }: any) => {
        const data = row.original;
        return (
          <Chip 
            label={data.frequency_display} 
            size="small" 
            color="primary"
            variant="outlined"
          />
        );
      },
    },
    {
      Header: "Schedule Details",
      accessor: "schedule_details",
      minWidth: 150,
      Cell: ({ row }: any) => {
        const data = row.original;
        let details = "";
        
        if (data.frequency === 'weekly' && data.day_of_week !== null) {
          const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          details = `${days[data.day_of_week]} at ${data.time_of_day}`;
        } else if (data.frequency === 'monthly' && data.day_of_month) {
          details = `Day ${data.day_of_month} at ${data.time_of_day}`;
        } else {
          details = `at ${data.time_of_day}`;
        }
        
        return <Typography variant="body2">{details}</Typography>;
      },
    },
    {
      Header: "Recipients",
      accessor: "recipients",
      minWidth: 100,
      Cell: ({ row }: any) => {
        const data = row.original;
        return (
          <Chip 
            label={`${data.recipients.length} users`} 
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      Header: "Last Run",
      accessor: "last_run",
      minWidth: 120,
      Cell: ({ row }: any) => {
        const data = row.original;
        return data.last_run ? (
          <Typography variant="body2">
            {formatDateToDDMMYYYY(data.last_run)}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Never
          </Typography>
        );
      },
    },
    {
      Header: "Next Run",
      accessor: "next_run",
      minWidth: 120,
      Cell: ({ row }: any) => {
        const data = row.original;
        return data.next_run ? (
          <Typography variant="body2" fontWeight={600} color="primary">
            {formatDateToDDMMYYYY(data.next_run)}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            -
          </Typography>
        );
      },
    },
    {
      Header: "Active",
      accessor: "is_active",
      minWidth: 80,
      Cell: ({ row }: any) => {
        const data: IReportSchedule = row.original;
        return (
          <Switch
            checked={data.is_active}
            onChange={() => handleToggleActive(data)}
            size="small"
          />
        );
      },
    },
    {
      Header: "Action",
      accessor: "action",
      minWidth: 150,
      Cell: ({ row }: any) => {
        const data: IReportSchedule = row.original;
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Run Now">
              <IconButton
                size="small"
                color="success"
                onClick={() => handleRunNow(data)}
              >
                <PlayArrowIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleEditSchedule(data)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteSchedule(data)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
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
          placeholder="Search schedules..."
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
        >
          New Schedule
        </Button>
      </Box>

      <CustomTable
        columnShape={columns}
        data={schedules?.results || []}
        dataCount={schedules?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(page: number) => setFilters({ ...filters, page })}
        pageIndex={filters?.page || 1}
        setPageSize={(size: number) => setFilters({ ...filters, page_size: size })}
        loading={loading}
      />

      <ScheduleForm
        handleClose={handleCloseModal}
        formType={formType}
        initialValues={editSchedule}
        callBack={() => fetchData(filters)}
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

export default ReportSchedulesTab;