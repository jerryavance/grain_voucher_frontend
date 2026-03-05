/**
 * AllColumnShapes.tsx  (updated — added PDF download column to SupplierInvoiceColumnShape)
 *
 * Changes from original:
 *   - SupplierInvoiceColumnShape: added "PDF" column before "Action"
 *     using SupplierInvoicePDFButton in compact mode.
 *
 * All other column shapes are unchanged.
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

// ✅ NEW
import SupplierInvoicePDFButton from "./SupplierInvoicePDF";

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
      <Chip label={row.original.status_display} color={INVOICE_STATUS_COLORS[row.original.status]} size="small" />
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
    // ✅ NEW: compact PDF download — fetches full detail on first click
    Header: "PDF",
    accessor: "pdf",
    minWidth: 60,
    maxWidth: 80,
    Cell: ({ row }: any) => (
      <SupplierInvoicePDFButton
        invoice={row.original}
        isFullDetail={false}
        compact
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

// ============ Delivery Record Column Shape ============
export const DeliveryRecordColumnShape = (actions: IDropdownAction[]) => [
  { Header: "Order Number", accessor: "id", minWidth: 160 },
  { Header: "Hub", accessor: "hub", minWidth: 130 },
  {
    Header: "Received By",
    accessor: "received_by",
    minWidth: 140,
    Cell: ({ row }: any) => (
      <Span sx={{ fontSize: 14 }}>
        {row.original.received_by?.first_name} {row.original.received_by?.last_name}
      </Span>
    ),
  },
  { Header: "Driver Name", accessor: "driver_name", minWidth: 130 },
  { Header: "Vehicle Number", accessor: "vehicle_number", minWidth: 130 },
  {
    Header: "Condition",
    accessor: "apparent_condition",
    minWidth: 100,
    Cell: ({ row }: any) => (
      <Chip
        label={row.original.apparent_condition.toUpperCase()}
        color={CONDITION_COLORS[row.original.apparent_condition]}
        size="small"
      />
    ),
  },
  {
    Header: "Received At",
    accessor: "received_at",
    minWidth: 140,
    Cell: ({ row }: any) => <Span sx={{ fontSize: 13 }}>{formatDateToDDMMYYYY(row.original.received_at)}</Span>,
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => <DropdownActionBtn key={row.id} actions={actions} metaData={row.original} />,
  },
];

// ============ Weighbridge Record Column Shape ============
export const WeighbridgeRecordColumnShape = (actions: IDropdownAction[]) => [
  { Header: "Order Number", accessor: "source_order", minWidth: 160 },
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
    Header: "Weighed At",
    accessor: "weighed_at",
    minWidth: 140,
    Cell: ({ row }: any) => <Span sx={{ fontSize: 13 }}>{formatDateToDDMMYYYY(row.original.weighed_at)}</Span>,
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => <DropdownActionBtn key={row.id} actions={actions} metaData={row.original} />,
  },
];

// ============ Supplier Payment Column Shape ============
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
    Header: "Invoice Number",
    accessor: "supplier_invoice",
    minWidth: 160,
    Cell: ({ row }: any) => <Span sx={{ fontSize: 14 }}>Invoice #{row.original.supplier_invoice}</Span>,
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
    Header: "Method",
    accessor: "method_display",
    minWidth: 140,
    Cell: ({ row }: any) => <Chip label={row.original.method_display} size="small" variant="outlined" />,
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
    Header: "Status",
    accessor: "status",
    minWidth: 120,
    Cell: ({ row }: any) => (
      <Chip label={row.original.status_display} color={PAYMENT_STATUS_COLORS[row.original.status]} size="small" />
    ),
  },
  {
    Header: "Processed By",
    accessor: "processed_by",
    minWidth: 140,
    Cell: ({ row }: any) => (
      <Span sx={{ fontSize: 14 }}>
        {row.original.processed_by
          ? `${row.original.processed_by.first_name} ${row.original.processed_by.last_name}`
          : "N/A"}
      </Span>
    ),
  },
  {
    Header: "Created At",
    accessor: "created_at",
    minWidth: 130,
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
    accessor: "rejection_reason_display",
    minWidth: 150,
    Cell: ({ row }: any) => (
      <Chip label={row.original.rejection_reason_display} size="small" color="warning" variant="outlined" />
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
        label={row.original.status_display}
        color={REJECTION_STATUS_COLORS[row.original.status]}
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
      : <Span sx={{ color: "text.secondary" }}>—</Span>,
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => <DropdownActionBtn key={row.id} actions={actions} metaData={row.original} />,
  },
];