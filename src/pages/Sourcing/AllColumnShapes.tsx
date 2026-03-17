/**
 * AllColumnShapes.tsx — FIXED
 *
 * FIXES:
 *   - DeliveryRecordColumnShape: 
 *       Order Number now shows source_order_number (was showing UUID)
 *       Hub now shows hub_name (was showing UUID)
 *       Received By shows full name from object
 *       Received At shows date AND time
 *   - WeighbridgeRecordColumnShape:
 *       Order Number now clickable, shows source_order_number
 *       Weighed At shows date AND time
 *   - SupplierPaymentColumnShape:
 *       Method now shows formatted label (was showing empty)
 *       Processed By shows full name (was showing "undefined undefined")
 *       Invoice Number shows readable number
 *       Created At shows date AND time
 *   - SupplierInvoiceColumnShape: PDF column retained
 *   - AggregatorTradeCostColumnShape: unchanged
 *   - RejectedLotColumnShape: unchanged
 */

import { FC } from "react";
import { Box, Chip, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import { Span } from "../../components/Typography";
import {
  formatCurrency, formatWeight, formatPercentage,
  INVOICE_STATUS_COLORS, PAYMENT_STATUS_COLORS, CONDITION_COLORS,
  LOT_STATUS_COLORS, REJECTION_STATUS_COLORS,
} from "./SourcingConstants";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";

import { SupplierInvoicePDFButton } from "./SupplierInvoicePDF";

// ─── Helper: format date + time ──────────────────────────────────────────────
const formatDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })} ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    return formatDateToDDMMYYYY(dateStr);
  }
};

// ─── Helper: format payment method label ─────────────────────────────────────
const formatMethodLabel = (method: string): string => {
  if (!method) return "—";
  const labels: Record<string, string> = {
    mobile_money: "Mobile Money",
    bank_transfer: "Bank Transfer",
    cash: "Cash",
    check: "Cheque",
    cheque: "Cheque",
  };
  return labels[method] || method.replace(/_/g, " ").toUpperCase();
};


// ============ Supplier Invoice Column Shape ============
export const SupplierInvoiceColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Invoice Number",
    accessor: "invoice_number",
    minWidth: 170,
    Cell: ({ row }: any) => {
      const navigate = useNavigate();
      return (
        <Typography
          sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
          color="primary"
          variant="h6"
          onClick={() => navigate(`/admin/sourcing/invoices/${row.original.id}`)}
        >
          {row.original.invoice_number}
        </Typography>
      );
    },
  },
  { Header: "Order Number", accessor: "order_number", minWidth: 160 },
  { Header: "Supplier", accessor: "supplier_name", minWidth: 150 },
  {
    Header: "Amount Due",
    accessor: "amount_due",
    minWidth: 120,
    Cell: ({ row }: any) => (
      <Span sx={{ fontSize: 14, fontWeight: 600 }}>{formatCurrency(row.original.amount_due)}</Span>
    ),
  },
  {
    Header: "Amount Paid",
    accessor: "amount_paid",
    minWidth: 120,
    Cell: ({ row }: any) => (
      <Span sx={{ fontSize: 14, color: "success.main" }}>{formatCurrency(row.original.amount_paid)}</Span>
    ),
  },
  {
    Header: "Balance Due",
    accessor: "balance_due",
    minWidth: 120,
    Cell: ({ row }: any) => (
      <Span sx={{ fontSize: 14, fontWeight: 600, color: row.original.balance_due > 0 ? "error.main" : "success.main" }}>
        {formatCurrency(row.original.balance_due)}
      </Span>
    ),
  },
  {
    Header: "Status",
    accessor: "status",
    minWidth: 110,
    Cell: ({ row }: any) => (
      <Chip label={row.original.status?.toUpperCase()} color={INVOICE_STATUS_COLORS[row.original.status] || "default"} size="small" />
    ),
  },
  {
    Header: "Due Date",
    accessor: "due_date",
    minWidth: 110,
    Cell: ({ row }: any) => (
      <Span sx={{ fontSize: 13 }}>{row.original.due_date ? formatDateToDDMMYYYY(row.original.due_date) : "N/A"}</Span>
    ),
  },
  {
    Header: "Issued At",
    accessor: "issued_at",
    minWidth: 110,
    Cell: ({ row }: any) => <Span sx={{ fontSize: 13 }}>{formatDateToDDMMYYYY(row.original.issued_at)}</Span>,
  },
  {
    Header: "PDF",
    accessor: "pdf",
    minWidth: 60,
    maxWidth: 80,
    Cell: ({ row }: any) => (
      <SupplierInvoicePDFButton
        invoice={row.original}
        isFullDetail={false}
        // compact
        size="small"
      />
    ),
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => <DropdownActionBtn key={row.id} actions={actions} metaData={row.original} />,
  },
];


// ============ Delivery Record Column Shape — FIXED ============
export const DeliveryRecordColumnShape = (actions: IDropdownAction[]) => [
  {
    // ✅ FIX: was showing UUID (accessor "id"), now shows source order number
    Header: "Order Number",
    accessor: "source_order",
    minWidth: 170,
    Cell: ({ row }: any) => {
      const d = row.original;
      // The serializer returns source_order as UUID and source_order detail nested
      // Try to get a readable order number
      const orderNum = d.source_order_number
        || (typeof d.source_order === "object" ? d.source_order?.order_number : null)
        || d.source_order;
      return (
        <Typography color="primary" variant="body2" sx={{ fontWeight: 600, fontFamily: "monospace" }}>
          {orderNum}
        </Typography>
      );
    },
  },
  {
    // ✅ FIX: was showing UUID, now shows hub name
    Header: "Hub",
    accessor: "hub",
    minWidth: 130,
    Cell: ({ row }: any) => {
      const d = row.original;
      const hubName = d.hub_name
        || (typeof d.hub === "object" ? d.hub?.name : null)
        || "—";
      return <Span sx={{ fontSize: 14 }}>{hubName}</Span>;
    },
  },
  {
    // ✅ FIX: was showing UUID, now shows full name
    Header: "Received By",
    accessor: "received_by",
    minWidth: 140,
    Cell: ({ row }: any) => {
      const rb = row.original.received_by;
      const rbDetail = row.original.received_by_detail;
      let name = "—";
      if (rbDetail) {
        name = `${rbDetail.first_name || ""} ${rbDetail.last_name || ""}`.trim();
      } else if (rb && typeof rb === "object") {
        name = `${rb.first_name || ""} ${rb.last_name || ""}`.trim();
      }
      return <Span sx={{ fontSize: 14 }}>{name || "—"}</Span>;
    },
  },
  { Header: "Driver Name", accessor: "driver_name", minWidth: 130 },
  { Header: "Vehicle Number", accessor: "vehicle_number", minWidth: 130 },
  {
    Header: "Condition",
    accessor: "apparent_condition",
    minWidth: 100,
    Cell: ({ row }: any) => (
      <Chip
        label={row.original.apparent_condition?.toUpperCase() || "—"}
        color={CONDITION_COLORS[row.original.apparent_condition] || "default"}
        size="small"
      />
    ),
  },
  {
    // ✅ FIX: now shows date AND time
    Header: "Received At",
    accessor: "received_at",
    minWidth: 160,
    Cell: ({ row }: any) => <Span sx={{ fontSize: 13 }}>{formatDateTime(row.original.received_at)}</Span>,
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => <DropdownActionBtn key={row.id} actions={actions} metaData={row.original} />,
  },
];


// ============ Weighbridge Record Column Shape — FIXED ============
export const WeighbridgeRecordColumnShape = (actions: IDropdownAction[]) => [
  {
    // ✅ FIX: was showing UUID, now shows clickable order number
    Header: "Order Number",
    accessor: "source_order",
    minWidth: 170,
    Cell: ({ row }: any) => {
      const navigate = useNavigate();
      const d = row.original;
      const orderNum = d.source_order_number
        || (typeof d.source_order === "object" ? d.source_order?.order_number : null)
        || d.source_order;
      const orderId = typeof d.source_order === "object" ? d.source_order?.id : d.source_order;
      return (
        <Typography
          color="primary"
          variant="body2"
          sx={{ fontWeight: 600, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
          onClick={() => orderId && navigate(`/admin/sourcing/orders/${orderId}`)}
        >
          {orderNum}
        </Typography>
      );
    },
  },
  {
    Header: "Vehicle #",
    accessor: "vehicle_number",
    minWidth: 130,
    Cell: ({ row }: any) => (
      <Span sx={{ fontSize: 14, fontFamily: "monospace" }}>{row.original.vehicle_number || "—"}</Span>
    ),
  },
  {
    Header: "Gross Weight",
    accessor: "gross_weight_kg",
    minWidth: 120,
    Cell: ({ row }: any) => <Span sx={{ fontSize: 14 }}>{formatWeight(row.original.gross_weight_kg)}</Span>,
  },
  {
    Header: "Tare Weight",
    accessor: "tare_weight_kg",
    minWidth: 120,
    Cell: ({ row }: any) => <Span sx={{ fontSize: 14 }}>{formatWeight(row.original.tare_weight_kg)}</Span>,
  },
  {
    Header: "Net Weight",
    accessor: "net_weight_kg",
    minWidth: 120,
    Cell: ({ row }: any) => (
      <Span sx={{ fontSize: 14, fontWeight: 600, color: "primary.main" }}>
        {formatWeight(row.original.net_weight_kg)}
      </Span>
    ),
  },
  {
    Header: "Variance",
    accessor: "quantity_variance_kg",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const variance = row.original.quantity_variance_kg;
      return (
        <Span sx={{ fontSize: 14, fontWeight: 600, color: variance >= 0 ? "success.main" : "error.main" }}>
          {variance >= 0 ? "+" : ""}{formatWeight(variance)}
        </Span>
      );
    },
  },
  {
    // ✅ FIX: now shows date AND time
    Header: "Weighed At",
    accessor: "weighed_at",
    minWidth: 160,
    Cell: ({ row }: any) => <Span sx={{ fontSize: 13 }}>{formatDateTime(row.original.weighed_at)}</Span>,
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => <DropdownActionBtn key={row.id} actions={actions} metaData={row.original} />,
  },
];


// ============ Supplier Payment Column Shape — FIXED ============
export const SupplierPaymentColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Payment Number",
    accessor: "payment_number",
    minWidth: 180,
    Cell: ({ row }: any) => {
      const navigate = useNavigate();
      return (
        <Typography
          sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
          color="primary"
          variant="h6"
          onClick={() => navigate(`/admin/sourcing/payments/${row.original.id}`)}
        >
          {row.original.payment_number}
        </Typography>
      );
    },
  },
  {
    // ✅ FIX: was showing raw UUID, now shows invoice_number from serializer
    Header: "Invoice Number",
    accessor: "invoice_number",
    minWidth: 160,
    Cell: ({ row }: any) => {
      const d = row.original;
      const invNum = d.invoice_number || `#${d.supplier_invoice}`;
      return <Span sx={{ fontSize: 14 }}>{invNum}</Span>;
    },
  },
  {
    Header: "Amount",
    accessor: "amount",
    minWidth: 130,
    Cell: ({ row }: any) => (
      <Span sx={{ fontSize: 14, fontWeight: 600, color: "success.main" }}>{formatCurrency(row.original.amount)}</Span>
    ),
  },
  {
    // ✅ FIX: was showing empty circles — now formats method string properly
    Header: "Method",
    accessor: "method",
    minWidth: 140,
    Cell: ({ row }: any) => {
      const method = row.original.method_display || row.original.method;
      return <Chip label={formatMethodLabel(method)} size="small" variant="outlined" />;
    },
  },
  {
    Header: "Reference",
    accessor: "reference_number",
    minWidth: 150,
    Cell: ({ row }: any) => (
      <Span sx={{ fontSize: 13, fontFamily: "monospace" }}>{row.original.reference_number || "N/A"}</Span>
    ),
  },
  {
    // ✅ FIX: status display
    Header: "Status",
    accessor: "status",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const s = row.original.status;
      const label = row.original.status_display || s?.replace(/_/g, " ").toUpperCase() || "—";
      return <Chip label={label} color={PAYMENT_STATUS_COLORS[s] || "default"} size="small" />;
    },
  },
  {
    // ✅ FIX: was showing "undefined undefined" — now reads from processed_by_detail or nested object
    Header: "Processed By",
    accessor: "processed_by",
    minWidth: 140,
    Cell: ({ row }: any) => {
      const d = row.original;
      const pb = d.processed_by_detail || d.processed_by;
      let name = "—";
      if (pb && typeof pb === "object") {
        name = `${pb.first_name || ""} ${pb.last_name || ""}`.trim();
      }
      return <Span sx={{ fontSize: 14 }}>{name || "—"}</Span>;
    },
  },
  {
    // ✅ FIX: shows date AND time
    Header: "Created At",
    accessor: "created_at",
    minWidth: 150,
    Cell: ({ row }: any) => <Span sx={{ fontSize: 13 }}>{formatDateTime(row.original.created_at)}</Span>,
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => <DropdownActionBtn key={row.id} actions={actions} metaData={row.original} />,
  },
];


// ============ Aggregator Trade Cost Column Shape ============
export const AggregatorTradeCostColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Order #",
    accessor: "source_order_number",
    minWidth: 160,
    Cell: ({ row }: any) => (
      <Typography color="primary" variant="h6">{row.original.source_order_number}</Typography>
    ),
  },
  {
    Header: "Source Qty",
    accessor: "source_quantity_kg",
    minWidth: 120,
    Cell: ({ row }: any) => <Span>{formatWeight(row.original.source_quantity_kg)}</Span>,
  },
  {
    Header: "Arrived Qty",
    accessor: "arrived_quantity_kg",
    minWidth: 120,
    Cell: ({ row }: any) => <Span>{formatWeight(row.original.arrived_quantity_kg)}</Span>,
  },
  {
    Header: "Transit Loss",
    accessor: "tonnage_lost_in_transit_kg",
    minWidth: 130,
    Cell: ({ row }: any) => {
      const loss = row.original.tonnage_lost_in_transit_kg;
      return (
        <Span sx={{ color: loss > 0 ? "error.main" : "success.main", fontWeight: 600 }}>
          {loss > 0 ? `-${formatWeight(loss)}` : "None"}
        </Span>
      );
    },
  },
  {
    Header: "Loss %",
    accessor: "transit_loss_pct",
    minWidth: 90,
    Cell: ({ row }: any) => {
      const pct = parseFloat(row.original.transit_loss_pct);
      return (
        <Span sx={{ color: pct > 2 ? "error.main" : "success.main", fontWeight: 600 }}>
          {formatPercentage(pct)}
        </Span>
      );
    },
  },
  {
    Header: "Net Accepted",
    accessor: "net_accepted_quantity_kg",
    minWidth: 130,
    Cell: ({ row }: any) => (
      <Span sx={{ fontWeight: 600, color: "primary.main" }}>
        {formatWeight(row.original.net_accepted_quantity_kg)}
      </Span>
    ),
  },
  {
    Header: "Add. Costs",
    accessor: "total_additional_cost",
    minWidth: 120,
    Cell: ({ row }: any) => <Span>{formatCurrency(row.original.total_additional_cost)}</Span>,
  },
  {
    Header: "Eff. Cost/kg",
    accessor: "effective_cost_per_kg",
    minWidth: 130,
    Cell: ({ row }: any) => (
      <Span sx={{ fontWeight: 600 }}>{formatCurrency(row.original.effective_cost_per_kg)}/kg</Span>
    ),
  },
  {
    Header: "Created",
    accessor: "created_at",
    minWidth: 120,
    Cell: ({ row }: any) => <Span sx={{ fontSize: 13 }}>{formatDateToDDMMYYYY(row.original.created_at)}</Span>,
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => <DropdownActionBtn key={row.id} actions={actions} metaData={row.original} />,
  },
];


// ============ Rejected Lot Column Shape ============
export const RejectedLotColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Rejection #",
    accessor: "rejection_number",
    minWidth: 170,
    Cell: ({ row }: any) => (
      <Typography color="error" variant="h6">{row.original.rejection_number}</Typography>
    ),
  },
  {
    Header: "Lot #",
    accessor: "lot_number",
    minWidth: 140,
    Cell: ({ row }: any) => <Span sx={{ fontFamily: "monospace" }}>{row.original.lot_number}</Span>,
  },
  {
    Header: "Investor",
    accessor: "investor_name",
    minWidth: 150,
    Cell: ({ row }: any) => <Span sx={{ fontSize: 13 }}>{row.original.investor_name || "—"}</Span>,
  },
  {
    Header: "Rejected Qty",
    accessor: "rejected_quantity_kg",
    minWidth: 130,
    Cell: ({ row }: any) => (
      <Span sx={{ color: "error.main", fontWeight: 600 }}>
        {formatWeight(row.original.rejected_quantity_kg)}
      </Span>
    ),
  },
  {
    Header: "Reason",
    accessor: "rejection_reason",
    minWidth: 150,
    Cell: ({ row }: any) => (
      <Chip label={row.original.rejection_reason_display || row.original.rejection_reason} size="small" color="warning" variant="outlined" />
    ),
  },
  {
    Header: "Disposal Cost",
    accessor: "disposal_cost",
    minWidth: 130,
    Cell: ({ row }: any) => <Span>{formatCurrency(row.original.disposal_cost)}</Span>,
  },
  {
    Header: "Restock Cost",
    accessor: "restocking_cost",
    minWidth: 130,
    Cell: ({ row }: any) => <Span>{formatCurrency(row.original.restocking_cost)}</Span>,
  },
  {
    Header: "Status",
    accessor: "status",
    minWidth: 160,
    Cell: ({ row }: any) => (
      <Chip
        label={row.original.status_display || row.original.status?.replace(/_/g, " ").toUpperCase()}
        color={REJECTION_STATUS_COLORS[row.original.status] || "default"}
        size="small"
      />
    ),
  },
  {
    Header: "Replacement Order",
    accessor: "replacement_order_number",
    minWidth: 170,
    Cell: ({ row }: any) => row.original.replacement_order_number
      ? <Chip label={row.original.replacement_order_number} size="small" color="info" />
      : <Span sx={{ color: "text.primary" }}>—</Span>,
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => <DropdownActionBtn key={row.id} actions={actions} metaData={row.original} />,
  },
];