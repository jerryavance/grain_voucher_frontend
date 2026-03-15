/**
 * ExportUtils.tsx
 * 
 * CSV and Excel export utilities for all sourcing list pages.
 * Provides both a utility function and a drop-in ExportButtons component.
 */

import { FC, useState } from "react";
import { Button, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import TableViewIcon from "@mui/icons-material/TableView";
import DescriptionIcon from "@mui/icons-material/Description";

// ─── CSV Export ──────────────────────────────────────────────────────────────

export function exportToCSV(data: any[], columns: { header: string; key: string }[], filename: string) {
  if (!data || data.length === 0) return;

  const headers = columns.map(c => c.header);
  const rows = data.map(row =>
    columns.map(col => {
      let val = col.key.split(".").reduce((o: any, k: string) => (o ? o[k] : ""), row);
      if (val === null || val === undefined) val = "";
      // Escape commas and quotes
      const str = String(val).replace(/"/g, '""');
      return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str}"` : str;
    })
  );

  const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Excel Export (XLSX via simple XML spreadsheet) ──────────────────────────

export function exportToExcel(data: any[], columns: { header: string; key: string }[], filename: string) {
  if (!data || data.length === 0) return;

  // Build a simple HTML table that Excel can open
  let table = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
  table += "<head><meta charset='UTF-8'><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>";
  table += `<x:Name>${filename}</x:Name>`;
  table += "<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>";
  table += "<body><table border='1'>";

  // Header row
  table += "<tr>";
  columns.forEach(col => {
    table += `<th style="background-color:#1976d2;color:white;font-weight:bold;padding:8px;">${col.header}</th>`;
  });
  table += "</tr>";

  // Data rows
  data.forEach((row, i) => {
    const bg = i % 2 === 0 ? "#ffffff" : "#f5f5f5";
    table += `<tr style="background-color:${bg};">`;
    columns.forEach(col => {
      let val = col.key.split(".").reduce((o: any, k: string) => (o ? o[k] : ""), row);
      if (val === null || val === undefined) val = "";
      table += `<td style="padding:6px;">${String(val)}</td>`;
    });
    table += "</tr>";
  });

  table += "</table></body></html>";

  const blob = new Blob([table], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Export Buttons Component ────────────────────────────────────────────────

interface ExportColumn {
  header: string;
  key: string;
}

interface ExportButtonsProps {
  data: any[];
  columns: ExportColumn[];
  filename: string;
  disabled?: boolean;
}

export const ExportButtons: FC<ExportButtonsProps> = ({ data, columns, filename, disabled }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleCSV = () => {
    exportToCSV(data, columns, filename);
    handleClose();
  };

  const handleExcel = () => {
    exportToExcel(data, columns, filename);
    handleClose();
  };

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        startIcon={<FileDownloadIcon />}
        onClick={handleClick}
        disabled={disabled || !data || data.length === 0}
      >
        Export
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleCSV}>
          <ListItemIcon><TableViewIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Export as CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExcel}>
          <ListItemIcon><DescriptionIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Export as Excel</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

// ─── Pre-defined export column sets ──────────────────────────────────────────

export const SOURCE_ORDER_EXPORT_COLUMNS: ExportColumn[] = [
  { header: "Order Number", key: "order_number" },
  { header: "Supplier", key: "supplier_name" },
  { header: "Hub", key: "hub_detail.name" },
  { header: "Grain Type", key: "grain_type_detail.name" },
  { header: "Trade Type", key: "trade_type" },
  { header: "Quantity (kg)", key: "quantity_kg" },
  { header: "Price/kg", key: "offered_price_per_kg" },
  { header: "Grain Cost", key: "grain_cost" },
  { header: "Logistics Cost", key: "logistics_cost" },
  { header: "Loading Cost", key: "loading_cost" },
  { header: "Offloading Cost", key: "offloading_cost" },
  { header: "Weighbridge Cost", key: "weighbridge_cost" },
  { header: "Handling Cost", key: "handling_cost" },
  { header: "Other Costs", key: "other_costs" },
  { header: "Total Cost", key: "total_cost" },
  { header: "Status", key: "status" },
  { header: "Created At", key: "created_at" },
];

export const SUPPLIER_INVOICE_EXPORT_COLUMNS: ExportColumn[] = [
  { header: "Invoice Number", key: "invoice_number" },
  { header: "Order Number", key: "order_number" },
  { header: "Supplier", key: "supplier_name" },
  { header: "Amount Due", key: "amount_due" },
  { header: "Amount Paid", key: "amount_paid" },
  { header: "Balance Due", key: "balance_due" },
  { header: "Status", key: "status" },
  { header: "Due Date", key: "due_date" },
  { header: "Issued At", key: "issued_at" },
];

export const SUPPLIER_PAYMENT_EXPORT_COLUMNS: ExportColumn[] = [
  { header: "Payment Number", key: "payment_number" },
  { header: "Invoice Number", key: "invoice_number" },
  { header: "Amount", key: "amount" },
  { header: "Method", key: "method" },
  { header: "Reference", key: "reference_number" },
  { header: "Status", key: "status" },
  { header: "Created At", key: "created_at" },
];

export const DELIVERY_EXPORT_COLUMNS: ExportColumn[] = [
  { header: "Order Number", key: "source_order_number" },
  { header: "Hub", key: "hub_name" },
  { header: "Driver Name", key: "driver_name" },
  { header: "Vehicle Number", key: "vehicle_number" },
  { header: "Condition", key: "apparent_condition" },
  { header: "Received At", key: "received_at" },
];

export const WEIGHBRIDGE_EXPORT_COLUMNS: ExportColumn[] = [
  { header: "Order Number", key: "source_order_number" },
  { header: "Vehicle #", key: "vehicle_number" },
  { header: "Gross Weight", key: "gross_weight_kg" },
  { header: "Tare Weight", key: "tare_weight_kg" },
  { header: "Net Weight", key: "net_weight_kg" },
  { header: "Variance", key: "quantity_variance_kg" },
  { header: "Weighed At", key: "weighed_at" },
];

export const SALE_LOT_EXPORT_COLUMNS: ExportColumn[] = [
  { header: "Lot #", key: "lot_number" },
  { header: "Grain Type", key: "grain_type_name" },
  { header: "Grade", key: "quality_grade_name" },
  { header: "Hub", key: "hub_name" },
  { header: "Investor", key: "investor_name" },
  { header: "Original Qty", key: "original_quantity_kg" },
  { header: "Available (kg)", key: "available_quantity_kg" },
  { header: "Sold (kg)", key: "sold_quantity_kg" },
  { header: "Rejected (kg)", key: "rejected_quantity_kg" },
  { header: "Cost/kg", key: "cost_per_kg" },
  { header: "Total Cost", key: "total_sourcing_cost" },
  { header: "Status", key: "status" },
];

export const INVESTOR_ALLOCATION_EXPORT_COLUMNS: ExportColumn[] = [
  { header: "Ref", key: "allocation_number" },
  { header: "Investor", key: "investor_name" },
  { header: "Order #", key: "source_order_number" },
  { header: "Allocated", key: "amount_allocated" },
  { header: "Margin Earned", key: "investor_margin" },
  { header: "Platform Fee", key: "platform_fee" },
  { header: "Amount Returned", key: "amount_returned" },
  { header: "Status", key: "status" },
  { header: "Allocated At", key: "allocated_at" },
];

export const BUYER_ORDER_EXPORT_COLUMNS: ExportColumn[] = [
  { header: "Order #", key: "order_number" },
  { header: "Buyer", key: "buyer_name" },
  { header: "Revenue", key: "subtotal" },
  { header: "Gross Profit", key: "gross_profit" },
  { header: "Status", key: "status" },
  { header: "Invoice Status", key: "invoice_status" },
  { header: "Created", key: "created_at" },
];

export const BUYER_INVOICE_EXPORT_COLUMNS: ExportColumn[] = [
  { header: "Invoice #", key: "invoice_number" },
  { header: "Buyer", key: "buyer_name" },
  { header: "Amount Due", key: "amount_due" },
  { header: "Amount Paid", key: "amount_paid" },
  { header: "Balance Due", key: "balance_due" },
  { header: "Terms", key: "payment_terms_days" },
  { header: "Due Date", key: "due_date" },
  { header: "Status", key: "status" },
];

export const BUYER_PAYMENT_EXPORT_COLUMNS: ExportColumn[] = [
  { header: "Payment #", key: "payment_number" },
  { header: "Invoice #", key: "invoice_number" },
  { header: "Buyer", key: "buyer_name" },
  { header: "Amount", key: "amount" },
  { header: "Method", key: "method" },
  { header: "Reference", key: "reference_number" },
  { header: "Status", key: "status" },
  { header: "Payment Date", key: "payment_date" },
];

export const TRADE_SETTLEMENT_EXPORT_COLUMNS: ExportColumn[] = [
  { header: "Settlement #", key: "settlement_number" },
  { header: "Order #", key: "order_number" },
  { header: "Revenue", key: "buyer_revenue" },
  { header: "COGS", key: "total_cogs" },
  { header: "Expenses", key: "total_selling_expenses" },
  { header: "Gross Profit", key: "gross_profit" },
  { header: "Margin %", key: "gross_margin_pct" },
  { header: "Investor Margin", key: "investor_margin" },
  { header: "Platform Fee", key: "platform_fee" },
  { header: "Status", key: "status" },
  { header: "Settled At", key: "settled_at" },
];

export const REJECTED_LOT_EXPORT_COLUMNS: ExportColumn[] = [
  { header: "Rejection #", key: "rejection_number" },
  { header: "Lot #", key: "lot_number" },
  { header: "Investor", key: "investor_name" },
  { header: "Rejected Qty", key: "rejected_quantity_kg" },
  { header: "Reason", key: "rejection_reason" },
  { header: "Disposal Cost", key: "disposal_cost" },
  { header: "Restock Cost", key: "restocking_cost" },
  { header: "Status", key: "status" },
  { header: "Date", key: "rejection_date" },
];

export default ExportButtons;