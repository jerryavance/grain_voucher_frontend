// sourcing/utils/SupplierInvoicePDF.tsx
import React, { useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { ISupplierInvoice } from "./Sourcing.interface";
import { formatCurrency, formatDate, formatKg } from "../../utils/formatters";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SupplierInvoiceData {
  invoice_number: string;
  order_number: string;
  supplier_name: string;
  supplier_detail?: {
    business_name: string;
    farm_location?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  quantity_kg: number | string;
  offered_price_per_kg: number | string;
  grain_type_name: string;
  trade_type_display: string;
  hub_name: string;
  grain_cost: number | string;
  logistics_cost: number | string;
  loading_cost: number | string;
  offloading_cost: number | string;
  weighbridge_cost: number | string;
  handling_cost: number | string;
  other_costs: number | string;
  amount_due: number | string;
  amount_paid: number | string;
  balance_due: number | string;
  payment_method: string;
  payment_reference: string;
  status: string;
  status_display?: string;
  due_date: string;
  issued_at: string;
  paid_at?: string;
}

// ─── HTML Generators ──────────────────────────────────────────────────────────

export const generateSupplierInvoiceHTML = (
  invoice: SupplierInvoiceData
): string => {
  const supplierName =
    invoice.supplier_detail?.business_name ||
    invoice.supplier_name ||
    "Supplier";

  const supplierLocation =
    invoice.supplier_detail?.farm_location || "Uganda";

  const supplierPhone = invoice.supplier_detail?.phone || "";

  const supplierContactName = invoice.supplier_detail
    ? `${invoice.supplier_detail.first_name || ""} ${invoice.supplier_detail.last_name || ""}`.trim()
    : "";

  const qty = Number(invoice.quantity_kg || 0);
  const pricePerKg = Number(invoice.offered_price_per_kg || 0);
  const qtyMT = qty > 0 ? (qty / 1000).toFixed(2) : "0";

  const grainCost = Number(invoice.grain_cost || 0);
  const logisticsCost = Number(invoice.logistics_cost || 0);
  const loadingCost = Number(invoice.loading_cost || 0);
  const offloadingCost = Number(invoice.offloading_cost || 0);
  const weighbridgeCost = Number(invoice.weighbridge_cost || 0);
  const handlingCost = Number(invoice.handling_cost || 0);
  const otherCosts = Number(invoice.other_costs || 0);

  const costRows = [
    { label: "Logistics", value: logisticsCost },
    { label: "Loading", value: loadingCost },
    { label: "Offloading", value: offloadingCost },
    { label: "Weighbridge", value: weighbridgeCost },
    { label: "Handling", value: handlingCost },
    { label: "Other", value: otherCosts },
  ].filter((r) => r.value > 0);

  const statusBadgeColor =
    invoice.status === "paid"
      ? "#4caf50"
      : invoice.status === "partial"
      ? "#ff9800"
      : invoice.status === "pending"
      ? "#2196f3"
      : "#9e9e9e";

  return `
<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; font-size: 13px; }
  .header { background: #1a2332; color: #fff; padding: 24px 40px; display: flex; justify-content: space-between; align-items: center; }
  .header .logo { font-size: 28px; font-weight: 800; letter-spacing: 2px; color: #c8a84e; }
  .header .logo-sub { font-size: 11px; color: #c8a84e; letter-spacing: 1px; margin-top: 2px; }
  .header .title { font-size: 22px; font-weight: 700; letter-spacing: 1px; }
  .gold-line { height: 3px; background: linear-gradient(90deg, #c8a84e, #8a6d1b); }
  .content { padding: 30px 40px; }
  .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
  .meta-item label { font-size: 10px; text-transform: uppercase; font-weight: 700; color: #1a73a7; display: block; margin-bottom: 2px; }
  .meta-item span { font-size: 13px; font-weight: 600; }
  .status-badge { display: inline-block; padding: 2px 10px; border-radius: 3px; font-size: 11px; font-weight: 700; color: #fff; background: ${statusBadgeColor}; }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin: 24px 0; padding: 16px 0; border-top: 1px solid #e0e0e0; }
  .party-label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #1a73a7; margin-bottom: 6px; }
  .party-name { font-size: 15px; font-weight: 700; }
  .party-detail { font-size: 12px; color: #666; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  th { background: #1a2332; color: #fff; padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; font-weight: 700; }
  td { padding: 8px 12px; border-bottom: 1px solid #eee; }
  .costs-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 20px; }
  .cost-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dotted #ddd; }
  .summary-row { display: flex; justify-content: space-between; padding: 6px 0; }
  .summary-row.total { font-weight: 700; font-size: 14px; border-top: 2px solid #333; padding-top: 8px; }
  .summary-row .amount { text-align: right; }
  .amount-paid { color: #f44336; }
  .balance-box { background: #1a2332; color: #fff; padding: 12px 20px; display: flex; justify-content: space-between; font-weight: 700; margin-top: 8px; border-radius: 4px; }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="logo">BENNU</div>
    <div class="logo-sub">AGFIN SERVICES LIMITED</div>
  </div>
  <div>
    <div class="title">SUPPLIER INVOICE</div>
    <div style="font-size: 11px; text-align: right; margin-top: 4px;">
      Plot 16 Mackinnon Road, Nakasero<br>
      P.O. Box 19298, Kampala Uganda
    </div>
  </div>
</div>
<div class="gold-line"></div>
<div class="content">
  <div class="meta-grid">
    <div class="meta-item"><label>Date</label><span>${formatDate(invoice.issued_at)}</span></div>
    <div class="meta-item"><label>Invoice No.</label><span>${invoice.invoice_number}</span></div>
    <div class="meta-item"><label>Trade Type</label><span>${invoice.trade_type_display || "DIRECT"}</span></div>
    <div class="meta-item"><label>Hub</label><span>${invoice.hub_name || "—"}</span></div>
    <div class="meta-item"><label>PO Number</label><span>${invoice.order_number || "—"}</span></div>
    <div class="meta-item"><label>Due Date</label><span>${formatDate(invoice.due_date)}</span></div>
    <div class="meta-item"><label>Payment Method</label><span>${invoice.payment_method || "—"}</span></div>
    <div class="meta-item"><label>Status</label><span class="status-badge">${invoice.status_display || invoice.status?.toUpperCase()}</span></div>
  </div>
  <div class="parties">
    <div>
      <div class="party-label">PAY TO (SUPPLIER)</div>
      <div class="party-name">${supplierName}</div>
      <div class="party-detail">${supplierContactName ? supplierContactName + "<br>" : ""}${supplierPhone ? supplierPhone + "<br>" : ""}${supplierLocation}</div>
    </div>
    <div>
      <div class="party-label">SELLER</div>
      <div class="party-name">Bennu Agfin Services Limited</div>
      <div class="party-detail">Plot 16 Mackinnon Road, Nakasero<br>Kampala, Uganda</div>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>QTY</th><th>UNIT</th><th>DESCRIPTION</th>
        <th style="text-align:right">UNIT PRICE</th><th style="text-align:right">TOTAL</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${qty > 0 ? qty.toLocaleString() : qtyMT}</td>
        <td>${qty > 1000 ? "KG" : "MT"}</td>
        <td>${invoice.grain_type_name || "Grain Purchase"}</td>
        <td style="text-align:right">${pricePerKg > 0 ? pricePerKg.toLocaleString(undefined, { minimumFractionDigits: 0 }) : "—"}</td>
        <td style="text-align:right">${grainCost > 0 ? grainCost.toLocaleString(undefined, { minimumFractionDigits: 0 }) : Number(invoice.amount_due).toLocaleString(undefined, { minimumFractionDigits: 0 })}</td>
      </tr>
    </tbody>
  </table>
  <div class="costs-summary">
    <div>
      <div style="font-weight:700; font-size:12px; text-transform:uppercase; margin-bottom:8px;">Additional Costs</div>
      ${costRows.length > 0
        ? costRows.map((r) => `<div class="cost-row"><span>${r.label}</span><span>${r.value.toLocaleString()}</span></div>`).join("")
        : '<div class="cost-row"><span>None</span><span>—</span></div>'
      }
    </div>
    <div>
      <div style="font-weight:700; font-size:12px; text-transform:uppercase; margin-bottom:8px;">Summary</div>
      <div class="summary-row"><span>Sub Total</span><span class="amount">${Number(invoice.amount_due).toLocaleString(undefined, { minimumFractionDigits: 0 })}</span></div>
      <div class="summary-row"><span>Amount Paid</span><span class="amount amount-paid">- ${Number(invoice.amount_paid).toLocaleString(undefined, { minimumFractionDigits: 0 })}</span></div>
      <div class="balance-box">
        <span>Balance Due</span>
        <span>${Number(invoice.balance_due).toLocaleString(undefined, { minimumFractionDigits: 0 })}</span>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;
};

export const generatePaymentReceiptHTML = (payment: {
  payment_number: string;
  amount: number | string;
  method: string;
  method_display?: string;
  reference_number: string;
  invoice_number: string;
  status: string;
  supplier_name: string;
  supplier_detail?: { business_name: string; phone?: string };
  created_at: string;
}): string => {
  const supplierName =
    payment.supplier_detail?.business_name ||
    payment.supplier_name ||
    "Supplier";

  return `
<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; }
  .header { background: #1a2332; color: #fff; padding: 24px 40px; display: flex; justify-content: space-between; align-items: center; }
  .header .logo { font-size: 28px; font-weight: 800; letter-spacing: 2px; color: #c8a84e; }
  .header .logo-sub { font-size: 11px; color: #c8a84e; letter-spacing: 1px; }
  .header .title { font-size: 22px; font-weight: 700; }
  .gold-line { height: 3px; background: linear-gradient(90deg, #c8a84e, #8a6d1b); }
  .content { padding: 40px; }
  .amount-box { background: #1a2332; color: #fff; text-align: center; padding: 24px; border-radius: 8px; margin: 30px 0; }
  .amount-label { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #999; }
  .amount-value { font-size: 36px; font-weight: 800; color: #c8a84e; margin-top: 8px; }
  .details { margin-top: 20px; }
  .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dotted #ddd; }
  .detail-label { color: #999; font-size: 14px; }
  .detail-value { font-weight: 700; font-size: 14px; }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="logo">BENNU</div>
    <div class="logo-sub">AGFIN SERVICES LIMITED</div>
  </div>
  <div class="title">PAYMENT RECEIPT</div>
</div>
<div class="gold-line"></div>
<div class="content">
  <div class="amount-box">
    <div class="amount-label">AMOUNT RECEIVED</div>
    <div class="amount-value">UGX ${Number(payment.amount).toLocaleString()}</div>
  </div>
  <div class="details">
    <div style="font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px;">Receipt Details</div>
    <div class="detail-row"><span class="detail-label">Receipt #</span><span class="detail-value">${payment.payment_number}</span></div>
    <div class="detail-row"><span class="detail-label">Type</span><span class="detail-value">Supplier Payment</span></div>
    <div class="detail-row"><span class="detail-label">Paid To</span><span class="detail-value">${supplierName}</span></div>
    <div class="detail-row"><span class="detail-label">Invoice #</span><span class="detail-value">${payment.invoice_number}</span></div>
    <div class="detail-row"><span class="detail-label">Payment Method</span><span class="detail-value">${(payment.method_display || payment.method || "—").toUpperCase()}</span></div>
    <div class="detail-row"><span class="detail-label">Reference</span><span class="detail-value">${payment.reference_number || "—"}</span></div>
    <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${formatDate(payment.created_at)}</span></div>
  </div>
</div>
</body>
</html>`;
};

// ─── PDF Button Component ─────────────────────────────────────────────────────

interface SupplierInvoicePDFButtonProps {
  invoice: ISupplierInvoice;
  isFullDetail?: boolean;
  size?: "small" | "medium" | "large";
}

export const SupplierInvoicePDFButton: React.FC<SupplierInvoicePDFButtonProps> = ({
  invoice,
  isFullDetail = false,
  size = "medium",
}) => {
  const [loading, setLoading] = useState(false);

  const handlePrint = () => {
    setLoading(true);
    try {
      // Map ISupplierInvoice to the SupplierInvoiceData shape expected by the HTML generator
      const sourceOrder = invoice.source_order as any;
      const supplierObj = invoice.supplier as any;

      const data: SupplierInvoiceData = {
        invoice_number: invoice.invoice_number,
        order_number:
          sourceOrder?.order_number ?? invoice.order_number ?? String(sourceOrder ?? ""),
        supplier_name: invoice.supplier_name ?? supplierObj?.business_name ?? "",
        supplier_detail: supplierObj?.business_name
          ? {
              business_name: supplierObj.business_name,
              farm_location: supplierObj.farm_location,
              phone: supplierObj.user_detail?.phone_number ?? supplierObj.user?.phone_number,
              first_name: supplierObj.user_detail?.first_name ?? supplierObj.user?.first_name,
              last_name: supplierObj.user_detail?.last_name ?? supplierObj.user?.last_name,
            }
          : undefined,
        quantity_kg: (sourceOrder as any)?.quantity_kg ?? 0,
        offered_price_per_kg: (sourceOrder as any)?.offered_price_per_kg ?? 0,
        grain_type_name: (sourceOrder as any)?.grain_type_name ?? "",
        trade_type_display: (sourceOrder as any)?.trade_type_display ?? "",
        hub_name: (sourceOrder as any)?.hub_name ?? "",
        grain_cost: (sourceOrder as any)?.grain_cost ?? 0,
        logistics_cost: (sourceOrder as any)?.logistics_cost ?? 0,
        loading_cost: (sourceOrder as any)?.loading_cost ?? 0,
        offloading_cost: (sourceOrder as any)?.offloading_cost ?? 0,
        weighbridge_cost: (sourceOrder as any)?.weighbridge_cost ?? 0,
        handling_cost: (sourceOrder as any)?.handling_cost ?? 0,
        other_costs: (sourceOrder as any)?.other_costs ?? 0,
        amount_due: invoice.amount_due,
        amount_paid: invoice.amount_paid,
        balance_due: invoice.balance_due,
        payment_method:
          typeof invoice.payment_method === "object"
            ? (invoice.payment_method as any)?.method_display ?? ""
            : String(invoice.payment_method ?? ""),
        payment_reference: invoice.payment_reference ?? "",
        status: invoice.status,
        status_display: invoice.status_display,
        due_date: invoice.due_date ?? "",
        issued_at: invoice.issued_at,
        paid_at: invoice.paid_at ?? undefined,
      };

      const html = generateSupplierInvoiceHTML(data);
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
        win.focus();
        setTimeout(() => {
          win.print();
        }, 500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outlined"
      size={size}
      onClick={handlePrint}
      disabled={loading}
      startIcon={loading ? <CircularProgress size={16} /> : <PictureAsPdfIcon />}
    >
      {loading ? "Generating..." : "Print / PDF"}
    </Button>
  );
};