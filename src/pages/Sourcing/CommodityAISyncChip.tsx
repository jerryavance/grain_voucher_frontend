/**
 * Tiny reusable sync-status chip for CommodityAI integration.
 *
 * Drop next to any record that should be (or has been) pushed to
 * CommodityAI. Polls the backend's /sync-status/ endpoint once on mount.
 *
 * Right-click / tooltip exposes the last error if any.
 * Click to manually re-push (super_admin / finance / hub_admin only —
 * backend enforces the role).
 */
import { FC, useEffect, useState } from "react";
import { Box, Chip, CircularProgress, Tooltip } from "@mui/material";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import RefreshIcon from "@mui/icons-material/Refresh";
import { toast } from "react-hot-toast";

import { SourcingService } from "./Sourcing.service";
import { ICommodityAISyncStatus, ICommodityAIPushLog } from "./Sourcing.interface";

interface Props {
  /** Mapper slug, e.g. "commercial_invoice" */
  kind: string;
  /** Primary key value, e.g. invoice_number */
  primaryKeyValue: string;
  /** Bennu's own UUID — required for manual re-push of buyer invoices */
  bennuRecordId?: string;
  /** Optional: re-push handler. If omitted and kind === commercial_invoice,
   *  defaults to SourcingService.pushBuyerInvoiceToCommodityAI(bennuRecordId). */
  onRetry?: () => Promise<ICommodityAIPushLog>;
  size?: "small" | "medium";
}

const STATUS_DISPLAY: Record<string, { label: string; color: any; icon: any }> = {
  success:        { label: "Synced",         color: "success", icon: <CloudDoneIcon fontSize="small" /> },
  already_synced: { label: "Synced",         color: "success", icon: <CloudDoneIcon fontSize="small" /> },
  pending:        { label: "Syncing…",       color: "info",    icon: <CloudQueueIcon fontSize="small" /> },
  skipped:        { label: "Not synced",     color: "default", icon: <CloudOffIcon fontSize="small" /> },
  failed:         { label: "Sync failed",    color: "error",   icon: <CloudOffIcon fontSize="small" /> },
  never_pushed:   { label: "Not yet synced", color: "default", icon: <CloudOffIcon fontSize="small" /> },
};

const CommodityAISyncChip: FC<Props> = ({
  kind, primaryKeyValue, bennuRecordId, onRetry, size = "small",
}) => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ICommodityAISyncStatus | null>(null);
  const [retrying, setRetrying] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const s = await SourcingService.getCommodityAISyncStatus(kind, primaryKeyValue);
      setStatus(s);
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (primaryKeyValue) fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, primaryKeyValue]);

  const handleRetry = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setRetrying(true);
    try {
      let log: ICommodityAIPushLog;
      if (onRetry) {
        log = await onRetry();
      } else if (kind === "commercial_invoice" && bennuRecordId) {
        log = await SourcingService.pushBuyerInvoiceToCommodityAI(bennuRecordId);
      } else {
        toast.error("No retry handler configured for this object.");
        setRetrying(false);
        return;
      }
      if (log.status === "success" || log.status === "already_synced") {
        toast.success("Pushed to CommodityAI");
      } else {
        toast.error(log.error_message || `Push status: ${log.status}`);
      }
      await fetchStatus();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to push to CommodityAI");
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <Chip
        size={size}
        icon={<CircularProgress size={12} />}
        label="CommodityAI…"
        variant="outlined"
      />
    );
  }

  const key = status?.status ?? "never_pushed";
  const display = STATUS_DISPLAY[key] ?? STATUS_DISPLAY.never_pushed;
  const last = status?.last_attempt;
  const tooltipLines: string[] = [`CommodityAI: ${display.label}`];
  if (last?.attempt_number) tooltipLines.push(`Attempts: ${last.attempt_number}`);
  if (last?.http_status) tooltipLines.push(`HTTP: ${last.http_status}`);
  if (last?.error_message) tooltipLines.push(`Error: ${last.error_message}`);
  if (last?.created_at) tooltipLines.push(`Last: ${new Date(last.created_at).toLocaleString()}`);

  const canRetry =
    !!(bennuRecordId || onRetry) &&
    (status?.status === "failed" || status?.status === "never_pushed" || status?.status === "skipped");

  return (
    <Tooltip title={<Box>{tooltipLines.map((l, i) => <div key={i}>{l}</div>)}</Box>}>
      <Box sx={{ display: "inline-flex", gap: 0.5, alignItems: "center" }}>
        <Chip
          size={size}
          color={display.color}
          icon={display.icon}
          label={`CommodityAI: ${display.label}`}
          variant={display.color === "default" ? "outlined" : "filled"}
        />
        {canRetry && (
          <Chip
            size={size}
            icon={retrying ? <CircularProgress size={12} /> : <RefreshIcon fontSize="small" />}
            label={retrying ? "Pushing…" : "Push"}
            color="primary"
            variant="outlined"
            onClick={handleRetry}
            disabled={retrying}
          />
        )}
      </Box>
    </Tooltip>
  );
};

export default CommodityAISyncChip;
