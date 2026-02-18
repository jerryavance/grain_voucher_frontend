// ============================================================
// ALL SOURCING MODULE COLUMN SHAPES
// This file contains all table column configurations
// ============================================================

import { FC } from "react";
import { Box, Chip, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import { Span } from "../../components/Typography";
import { formatCurrency, formatWeight, formatPercentage, INVOICE_STATUS_COLORS, PAYMENT_STATUS_COLORS, CONDITION_COLORS } from "./SourcingConstants";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";

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
    }
  },
  {
    Header: "Order Number",
    accessor: "order_number",
    minWidth: 160,
  },
  {
    Header: "Supplier",
    accessor: "supplier_name",
    minWidth: 150,
  },
  {
    Header: "Amount Due",
    accessor: "amount_due",
    minWidth: 120,
    Cell: ({ row }: any) => (
      <Span sx={{ fontSize: 14, fontWeight: 600 }}>
        {formatCurrency(row.original.amount_due)}
      </Span>
    ),
  },
  {
    Header: "Amount Paid",
    accessor: "amount_paid",
    minWidth: 120,
    Cell: ({ row }: any) => (
      <Span sx={{ fontSize: 14, color: 'success.main' }}>
        {formatCurrency(row.original.amount_paid)}
      </Span>
    ),
  },
  {
    Header: "Balance Due",
    accessor: "balance_due",
    minWidth: 120,
    Cell: ({ row }: any) => (
      <Span sx={{ fontSize: 14, fontWeight: 600, color: row.original.balance_due > 0 ? 'error.main' : 'success.main' }}>
        {formatCurrency(row.original.balance_due)}
      </Span>
    ),
  },
  {
    Header: "Status",
    accessor: "status",
    minWidth: 110,
    Cell: ({ row }: any) => (
      <Chip
        label={row.original.status_display}
        color={INVOICE_STATUS_COLORS[row.original.status]}
        size="small"
      />
    ),
  },
  {
    Header: "Due Date",
    accessor: "due_date",
    minWidth: 110,
    Cell: ({ row }: any) => (
      <Span sx={{ fontSize: 13 }}>
        {row.original.due_date ? formatDateToDDMMYYYY(row.original.due_date) : "N/A"}
      </Span>
    ),
  },
  {
    Header: "Issued At",
    accessor: "issued_at",
    minWidth: 110,
    Cell: ({ row }: any) => (
      <Span sx={{ fontSize: 13 }}>
        {formatDateToDDMMYYYY(row.original.issued_at)}
      </Span>
    ),
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => (
      <DropdownActionBtn key={row.id} actions={actions} metaData={row.original} />
    ),
  },
];

// ============ Delivery Record Column Shape ============
export const DeliveryRecordColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Order Number",
    accessor: "source_order.order_number",
    minWidth: 160,
  },
  {
    Header: "Hub",
    accessor: "hub.name",
    minWidth: 130,
  },
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
  {
    Header: "Driver Name",
    accessor: "driver_name",
    minWidth: 130,
  },
  {
    Header: "Vehicle Number",
    accessor: "vehicle_number",
    minWidth: 130,
  },
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
    Cell: ({ row }: any) => (
      <Span sx={{ fontSize: 13 }}>
        {formatDateToDDMMYYYY(row.original.received_at)}
      </Span>
    ),
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => (
      <DropdownActionBtn key={row.id} actions={actions} metaData={row.original} />
    ),
  },
];

// ============ Weighbridge Record Column Shape ============
export const WeighbridgeRecordColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Order Number",
    accessor: "source_order.order_number",
    minWidth: 160,
  },
  {
    Header: "Gross Weight",
    accessor: "gross_weight_kg",
    minWidth: 120,
    Cell: ({ row }: any) => (
      <Span sx={{ fontSize: 14 }}>{formatWeight(row.original.gross_weight_kg)}</Span>
    ),
  },
  {
    Header: "Tare Weight",
    accessor: "tare_weight_kg",
    minWidth: 120,
    Cell: ({ row }: any) => (
      <Span sx={{ fontSize: 14 }}>{formatWeight(row.original.tare_weight_kg)}</Span>
    ),
  },
  {
    Header: "Net Weight",
    accessor: "net_weight_kg",
    minWidth: 120,
    Cell: ({ row }: any) => (
      <Span sx={{ fontSize: 14, fontWeight: 600, color: 'primary.main' }}>
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
        <Span sx={{ fontSize: 14, fontWeight: 600, color: variance >= 0 ? 'success.main' : 'error.main' }}>
          {variance >= 0 ? '+' : ''}{formatWeight(variance)}
        </Span>
      );
    },
  },
  {
    Header: "Moisture",
    accessor: "moisture_level",
    minWidth: 100,
    Cell: ({ row }: any) => (
      <Span sx={{ fontSize: 14 }}>{formatPercentage(row.original.moisture_level)}</Span>
    ),
  },
  {
    Header: "Quality Grade",
    accessor: "quality_grade.name",
    minWidth: 130,
    Cell: ({ row }: any) => (
      <Chip 
        label={row.original.quality_grade?.name} 
        size="small" 
        color="success"
        variant="outlined"
      />
    ),
  },
  {
    Header: "Weighed By",
    accessor: "weighed_by",
    minWidth: 130,
    Cell: ({ row }: any) => (
      <Span sx={{ fontSize: 14 }}>
        {row.original.weighed_by?.first_name} {row.original.weighed_by?.last_name}
      </Span>
    ),
  },
  {
    Header: "Weighed At",
    accessor: "weighed_at",
    minWidth: 140,
    Cell: ({ row }: any) => (
      <Span sx={{ fontSize: 13 }}>
        {formatDateToDDMMYYYY(row.original.weighed_at)}
      </Span>
    ),
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => (
      <DropdownActionBtn key={row.id} actions={actions} metaData={row.original} />
    ),
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
    }
  },
  {
    Header: "Invoice Number",
    accessor: "supplier_invoice",
    minWidth: 160,
    Cell: ({ row }: any) => {
      // Note: You may need to fetch invoice details or include in the query
      return <Span sx={{ fontSize: 14 }}>Invoice #{row.original.supplier_invoice}</Span>;
    },
  },
  {
    Header: "Amount",
    accessor: "amount",
    minWidth: 130,
    Cell: ({ row }: any) => (
      <Span sx={{ fontSize: 14, fontWeight: 600, color: 'success.main' }}>
        {formatCurrency(row.original.amount)}
      </Span>
    ),
  },
  {
    Header: "Method",
    accessor: "method_display",
    minWidth: 140,
    Cell: ({ row }: any) => (
      <Chip 
        label={row.original.method_display} 
        size="small"
        variant="outlined"
      />
    ),
  },
  {
    Header: "Reference",
    accessor: "reference_number",
    minWidth: 150,
    Cell: ({ row }: any) => (
      <Span sx={{ fontSize: 13, fontFamily: 'monospace' }}>
        {row.original.reference_number || "N/A"}
      </Span>
    ),
  },
  {
    Header: "Status",
    accessor: "status",
    minWidth: 120,
    Cell: ({ row }: any) => (
      <Chip
        label={row.original.status_display}
        color={PAYMENT_STATUS_COLORS[row.original.status]}
        size="small"
      />
    ),
  },
  {
    Header: "Processed By",
    accessor: "processed_by",
    minWidth: 140,
    Cell: ({ row }: any) => (
      <Span sx={{ fontSize: 14 }}>
        {row.original.processed_by ? 
          `${row.original.processed_by.first_name} ${row.original.processed_by.last_name}` : 
          "N/A"
        }
      </Span>
    ),
  },
  {
    Header: "Created At",
    accessor: "created_at",
    minWidth: 130,
    Cell: ({ row }: any) => (
      <Span sx={{ fontSize: 13 }}>
        {formatDateToDDMMYYYY(row.original.created_at)}
      </Span>
    ),
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => (
      <DropdownActionBtn key={row.id} actions={actions} metaData={row.original} />
    ),
  },
];