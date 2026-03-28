// sourcing/utils/SupplierInvoicePDF.tsx
import React, { useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { ISupplierInvoice } from "./Sourcing.interface";
import { formatCurrency, formatDate, formatKg } from "../../utils/formatters";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Mirrors the flat shape returned directly by the supplier invoice API:
 * {
 *   invoice_number, order_number, supplier_name, supplier_detail,
 *   quantity_kg, offered_price_per_kg, grain_type_name, trade_type, trade_type_display,
 *   hub_name, grain_cost, logistics_cost, loading_cost, offloading_cost,
 *   weighbridge_cost, handling_cost, other_costs,
 *   amount_due, amount_paid, balance_due,
 *   payment_method, payment_reference, status, status_display,
 *   due_date, issued_at, paid_at, notes
 * }
 */
export interface SupplierInvoiceData {
  invoice_number: string;
  order_number: string;
  supplier_name: string;
  supplier_detail?: {
    business_name?: string;
    farm_location?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  quantity_kg: number | string;
  offered_price_per_kg: number | string;
  grain_type_name: string;
  trade_type?: string;
  trade_type_display?: string;
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
  notes?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ugx = (val: number | string): string => {
  const n = Number(val || 0);
  return `UGX ${n.toLocaleString("en-UG", { minimumFractionDigits: 0 })}`;
};

const fmt = (val: number | string): string =>
  Number(val || 0).toLocaleString("en-UG", { minimumFractionDigits: 0 });

// ─── HTML Generator ───────────────────────────────────────────────────────────

export const generateSupplierInvoiceHTML = (
  invoice: SupplierInvoiceData,
  logoDataUrl?: string
): string => {
  // ── Supplier resolution ──────────────────────────────────────────────────
  const supplierName =
    invoice.supplier_detail?.business_name || invoice.supplier_name || "Supplier";
  const supplierLocation = invoice.supplier_detail?.farm_location || "Uganda";
  const supplierPhone = invoice.supplier_detail?.phone || "";
  const supplierEmail = invoice.supplier_detail?.email || "";
  const supplierContactName = invoice.supplier_detail
    ? `${invoice.supplier_detail.first_name || ""} ${invoice.supplier_detail.last_name || ""}`.trim()
    : "";

  // ── Numeric values ────────────────────────────────────────────────────────
  const qty = Number(invoice.quantity_kg || 0);
  const pricePerKg = Number(invoice.offered_price_per_kg || 0);
  const qtyMT = qty / 1000;

  const grainCost = Number(invoice.grain_cost || 0);
  const logisticsCost = Number(invoice.logistics_cost || 0);
  const loadingCost = Number(invoice.loading_cost || 0);
  const offloadingCost = Number(invoice.offloading_cost || 0);
  const weighbridgeCost = Number(invoice.weighbridge_cost || 0);
  const handlingCost = Number(invoice.handling_cost || 0);
  const otherCosts = Number(invoice.other_costs || 0);
  const amountDue = Number(invoice.amount_due || 0);
  const amountPaid = Number(invoice.amount_paid || 0);
  const balanceDue = Number(invoice.balance_due || 0);

  const totalAdditionalCosts =
    logisticsCost + loadingCost + offloadingCost + weighbridgeCost + handlingCost + otherCosts;

  const costRows: { label: string; value: number }[] = [
    { label: "Grain Cost", value: grainCost },
    { label: "Logistics", value: logisticsCost },
    { label: "Loading", value: loadingCost },
    { label: "Offloading", value: offloadingCost },
    { label: "Weighbridge", value: weighbridgeCost },
    { label: "Handling / Storage", value: handlingCost },
    { label: "Other Costs", value: otherCosts },
  ].filter((r) => r.value > 0);

  // ── Status ────────────────────────────────────────────────────────────────
  const statusColorMap: Record<string, { bg: string; color: string }> = {
    paid:     { bg: "#1b5e20", color: "#fff" },
    partial:  { bg: "#e65100", color: "#fff" },
    pending:  { bg: "#1565c0", color: "#fff" },
    cancelled:{ bg: "#424242", color: "#fff" },
  };
  const statusStyle = statusColorMap[invoice.status] ?? { bg: "#424242", color: "#fff" };
  const statusLabel = (invoice.status_display || invoice.status || "PENDING").toUpperCase();

  // ── Payment method display ────────────────────────────────────────────────
  const methodDisplayMap: Record<string, string> = {
    mobile_money: "Mobile Money",
    bank_transfer: "Bank Transfer",
    cash: "Cash",
    check: "Cheque",
    cheque: "Cheque",
  };
  const paymentMethodDisplay =
    methodDisplayMap[invoice.payment_method?.toLowerCase()] ||
    invoice.payment_method?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ||
    "—";

  // ── Logo HTML ─────────────────────────────────────────────────────────────
  const logoHtml = logoDataUrl
    ? `<img src="${logoDataUrl}" alt="Bennu Logo" style="height:52px; width:auto; object-fit:contain;" />`
    : `<div style="width:52px;height:52px;background:#2371B9;border-radius:6px;display:flex;align-items:center;justify-content:center;">
         <span style="color:#fff;font-weight:900;font-size:20px;">B</span>
       </div>`;

  // ── Cost breakdown rows HTML ──────────────────────────────────────────────
  const costRowsHtml = costRows.length > 0
    ? costRows.map((r) => `
      <tr>
        <td style="padding:7px 12px;border-bottom:1px solid #f0f0f0;color:#555;">${r.label}</td>
        <td style="padding:7px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">${ugx(r.value)}</td>
      </tr>`).join("")
    : `<tr><td colspan="2" style="padding:8px 12px;color:#999;">No additional costs</td></tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Supplier Invoice — ${invoice.invoice_number}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    font-size: 12px;
    color: #1a1a1a;
    background: #fff;
    line-height: 1.5;
  }

  /* ── Header ── */
  .header {
    background: #2371B9;
    color: #fff;
    padding: 22px 36px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .header-left { display: flex; align-items: center; gap: 14px; }
  .header-brand .company-sub {
    font-size: 9px; color: rgba(255,255,255,0.7); letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px;
  }
  .header-right { text-align: right; }
  .doc-title {
    font-size: 24px; font-weight: 800; letter-spacing: 3px; color: #fff; text-transform: uppercase;
  }
  .doc-subtitle { font-size: 10px; color: rgba(255,255,255,0.65); margin-top: 3px; letter-spacing: 0.5px; }

  /* ── Blue accent line ── */
  .accent-bar {
    height: 3px;
    background: linear-gradient(90deg, #1a5fa0 0%, #5ba3e0 50%, #2371B9 100%);
  }

  /* ── Body ── */
  .body { padding: 28px 36px; }

  /* ── Invoice meta strip ── */
  .meta-strip {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    border: 1px solid #e8e8e8;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 24px;
  }
  .meta-cell {
    padding: 12px 14px;
    border-right: 1px solid #e8e8e8;
    background: #fafafa;
  }
  .meta-cell:last-child { border-right: none; }
  .meta-cell.highlight { background: #2371B9; color: #fff; }
  .meta-label {
    font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.8px; color: #5c8abf; margin-bottom: 4px;
  }
  .meta-cell.highlight .meta-label { color: rgba(255,255,255,0.6); }
  .meta-value { font-size: 12px; font-weight: 600; color: #1a1a1a; }
  .meta-cell.highlight .meta-value { color: #fff; }

  /* ── Status badge ── */
  .status-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    background: ${statusStyle.bg};
    color: ${statusStyle.color};
  }

  /* ── Parties ── */
  .parties {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 24px;
  }
  .party-card {
    border: 1px solid #e8e8e8;
    border-radius: 6px;
    padding: 14px 16px;
  }
  .party-card.issuer { border-left: 3px solid #2371B9; }
  .party-card.payee  { border-left: 3px solid #15803d; }
  .party-role {
    font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1px; margin-bottom: 8px;
  }
  .party-card.issuer .party-role { color: #2371B9; }
  .party-card.payee .party-role  { color: #15803d; }
  .party-name { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
  .party-detail { font-size: 11px; color: #666; line-height: 1.6; }

  /* ── Section heading ── */
  .section-heading {
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1px; color: #5c8abf;
    border-bottom: 2px solid #e0e8f4;
    padding-bottom: 6px; margin-bottom: 12px;
  }

  /* ── Line items table ── */
  .line-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  .line-table thead tr {
    background: #2371B9; color: #fff;
  }
  .line-table thead th {
    padding: 9px 12px; text-align: left;
    font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;
  }
  .line-table thead th.right { text-align: right; }
  .line-table tbody td {
    padding: 10px 12px; border-bottom: 1px solid #f0f4fa; font-size: 12px;
  }
  .line-table tbody tr:last-child td { border-bottom: none; }
  .line-table tfoot td {
    padding: 8px 12px; font-size: 12px; font-weight: 600;
    background: #f6f9fd; border-top: 2px solid #d0dff0;
  }
  .grain-name { font-weight: 700; font-size: 13px; }
  .grain-meta { font-size: 10px; color: #888; margin-top: 2px; }

  /* ── Two-column bottom ── */
  .bottom-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 4px;
  }

  /* ── Cost breakdown ── */
  .cost-table { width: 100%; border-collapse: collapse; }
  .cost-table td { font-size: 11px; }

  /* ── Summary ── */
  .summary-box { border: 1px solid #e0e8f4; border-radius: 6px; overflow: hidden; }
  .summary-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 9px 14px; border-bottom: 1px solid #f0f4fa;
    font-size: 12px;
  }
  .summary-row:last-child { border-bottom: none; }
  .summary-row .label { color: #555; }
  .summary-row .value { font-weight: 600; }
  .summary-row.paid .value  { color: #15803d; }
  .summary-row.balance {
    background: #2371B9; color: #fff; padding: 13px 14px;
  }
  .summary-row.balance .label { color: rgba(255,255,255,0.7); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
  .summary-row.balance .value { color: #fff; font-weight: 800; font-size: 16px; }

  /* ── Notes ── */
  .notes-box {
    margin-top: 20px; padding: 12px 14px;
    border: 1px solid #e0e8f4; border-radius: 6px;
    background: #f6f9fd; font-size: 11px; color: #555;
  }
  .notes-box strong { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #5c8abf; margin-bottom: 4px; }

  /* ── Footer ── */
  .footer {
    margin-top: 28px; padding-top: 14px;
    border-top: 1px solid #e0e8f4;
    display: flex; justify-content: space-between; align-items: flex-end;
    font-size: 10px; color: #999;
  }
  .footer .stamp {
    background: #2371B9; color: #fff;
    padding: 6px 14px; border-radius: 3px;
    font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
  }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @page { margin: 10mm; size: A4 portrait; }
  }
</style>
</head>
<body>

<!-- ── Header ── -->
<div class="header">
  <div class="header-left">
    ${logoHtml}
    <div class="header-brand">
      <div class="company-sub">Agfin Services Limited</div>
    </div>
  </div>
  <div class="header-right">
    <div class="doc-title">Supplier Invoice</div>
    <div class="doc-subtitle">
      Plot 16 Mackinnon Road, Nakasero · P.O. Box 19298, Kampala, Uganda<br/>
      info@bennu.ug · www.bennu.ug
    </div>
  </div>
</div>
<div class="accent-bar"></div>

<!-- ── Body ── -->
<div class="body">

  <!-- ── Meta strip ── -->
  <div class="meta-strip">
    <div class="meta-cell">
      <div class="meta-label">Invoice No.</div>
      <div class="meta-value">${invoice.invoice_number}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Purchase Order</div>
      <div class="meta-value">${invoice.order_number || "—"}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Issued</div>
      <div class="meta-value">${formatDate(invoice.issued_at)}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Due Date</div>
      <div class="meta-value">${invoice.due_date ? formatDate(invoice.due_date) : "—"}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Destination Warehouse</div>
      <div class="meta-value">${invoice.hub_name || "—"}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Trade Type</div>
      <div class="meta-value">${invoice.trade_type_display || invoice.trade_type || "—"}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Payment Method</div>
      <div class="meta-value">${paymentMethodDisplay}</div>
    </div>
    <div class="meta-cell highlight">
      <div class="meta-label">Status</div>
      <div class="meta-value">
        <span class="status-badge">${statusLabel}</span>
      </div>
    </div>
  </div>

  <!-- ── Parties ── -->
  <div class="parties">
    <div class="party-card issuer">
      <div class="party-role">Issuer / Buyer</div>
      <div class="party-name">Bennu Agfin Services Limited</div>
      <div class="party-detail">
        Plot 16 Mackinnon Road, Nakasero<br/>
        P.O. Box 19298, Kampala, Uganda<br/>
        info@bennu.ug
      </div>
    </div>
    <div class="party-card payee">
      <div class="party-role">Pay To (Supplier)</div>
      <div class="party-name">${supplierName}</div>
      <div class="party-detail">
        ${supplierContactName ? `${supplierContactName}<br/>` : ""}
        ${supplierPhone ? `${supplierPhone}<br/>` : ""}
        ${supplierEmail ? `${supplierEmail}<br/>` : ""}
        ${supplierLocation}
      </div>
    </div>
  </div>

  <!-- ── Line items ── -->
  <div class="section-heading">Purchase Details</div>
  <table class="line-table">
    <thead>
      <tr>
        <th style="width:36%">Description</th>
        <th>Quantity (KG)</th>
        <th>Quantity (MT)</th>
        <th class="right">Unit Price / KG</th>
        <th class="right">Grain Cost</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <div class="grain-name">${invoice.grain_type_name || "Grain Purchase"}</div>
          <div class="grain-meta">
            ${invoice.trade_type_display ? `Trade: ${invoice.trade_type_display}` : ""}
            ${invoice.hub_name ? ` · Dest. Warehouse: ${invoice.hub_name}` : ""}
          </div>
        </td>
        <td>${qty > 0 ? fmt(qty) + " KG" : "—"}</td>
        <td>${qty > 0 ? qtyMT.toFixed(3) + " MT" : "—"}</td>
        <td style="text-align:right">${pricePerKg > 0 ? ugx(pricePerKg) : "—"}</td>
        <td style="text-align:right; font-weight:700;">${ugx(grainCost)}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td colspan="4" style="text-align:right; font-size:11px; color:#777;">Grain Sub-total</td>
        <td style="text-align:right; font-size:13px; font-weight:700;">${ugx(grainCost)}</td>
      </tr>
    </tfoot>
  </table>

  <!-- ── Bottom: cost breakdown + summary ── -->
  <div class="bottom-grid">

    <!-- Cost Breakdown -->
    <div>
      <div class="section-heading">Cost Breakdown</div>
      <table class="cost-table">
        <tbody>
          ${costRowsHtml}
          ${totalAdditionalCosts > 0 ? `
          <tr>
            <td style="padding:9px 12px;font-weight:700;border-top:2px solid #e0e0e0;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#555;">
              Total Additional Costs
            </td>
            <td style="padding:9px 12px;text-align:right;font-weight:700;border-top:2px solid #e0e0e0;">
              ${ugx(totalAdditionalCosts)}
            </td>
          </tr>` : ""}
        </tbody>
      </table>

      ${invoice.payment_reference ? `
      <div style="margin-top:14px; padding:10px 12px; background:#f8f8f8; border:1px solid #e8e8e8; border-radius:4px;">
        <div style="font-size:9px;text-transform:uppercase;font-weight:700;letter-spacing:0.8px;color:#7a8899;margin-bottom:3px;">Payment Reference</div>
        <div style="font-family:monospace;font-size:12px;font-weight:600;">${invoice.payment_reference}</div>
      </div>` : ""}

      ${invoice.paid_at ? `
      <div style="margin-top:10px; padding:10px 12px; background:#f0faf0; border:1px solid #c3e6cb; border-radius:4px;">
        <div style="font-size:9px;text-transform:uppercase;font-weight:700;letter-spacing:0.8px;color:#2e7d32;margin-bottom:3px;">Paid On</div>
        <div style="font-size:12px;font-weight:600;color:#1b5e20;">${formatDate(invoice.paid_at)}</div>
      </div>` : ""}
    </div>

    <!-- Payment Summary -->
    <div>
      <div class="section-heading">Payment Summary</div>
      <div class="summary-box">
        <div class="summary-row">
          <span class="label">Grain Cost</span>
          <span class="value">${ugx(grainCost)}</span>
        </div>
        ${totalAdditionalCosts > 0 ? `
        <div class="summary-row">
          <span class="label">Additional Costs</span>
          <span class="value">${ugx(totalAdditionalCosts)}</span>
        </div>` : ""}
        <div class="summary-row" style="background:#f8f8f8; font-weight:700;">
          <span class="label" style="font-weight:700;">Total Amount Due</span>
          <span class="value" style="font-size:13px;">${ugx(amountDue)}</span>
        </div>
        ${amountPaid > 0 ? `
        <div class="summary-row paid">
          <span class="label">Amount Paid</span>
          <span class="value">− ${ugx(amountPaid)}</span>
        </div>` : ""}
        <div class="summary-row balance">
          <span class="label">Balance Due</span>
          <span class="value">${ugx(balanceDue)}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Notes ── -->
  ${invoice.notes ? `
  <div class="notes-box">
    <strong>Notes</strong>
    ${invoice.notes}
  </div>` : ""}

  <!-- ── Footer ── -->
  <div class="footer">
    <div>
      <div>Bennu Agfin Services Limited · Plot 16 Mackinnon Road, Nakasero, Kampala, Uganda</div>
      <div style="margin-top:2px;">Generated on ${new Date().toLocaleDateString("en-UG", { year: "numeric", month: "long", day: "numeric" })}</div>
    </div>
    <div class="stamp">Official Document</div>
  </div>

</div>
</body>
</html>`;
};

// ─── Payment Receipt Generator ────────────────────────────────────────────────
// (unchanged from original — kept for backward compat)

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
}, logoDataUrl?: string): string => {
  const supplierName =
    payment.supplier_detail?.business_name || payment.supplier_name || "Supplier";

  const logoHtml = logoDataUrl
    ? `<img src="${logoDataUrl}" alt="Bennu Logo" style="height:48px;width:auto;object-fit:contain;" />`
    : `<div style="width:48px;height:48px;background:#2371B9;border-radius:6px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:18px;">B</span></div>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { margin:0;padding:0;box-sizing:border-box; }
  body { font-family:'Inter','Helvetica Neue',Arial,sans-serif;color:#1a1a1a; }
  .header { background:#2371B9;color:#fff;padding:22px 36px;display:flex;justify-content:space-between;align-items:center; }
  .header-left { display:flex;align-items:center;gap:14px; }
  .company-sub { font-size:9px;color:rgba(255,255,255,0.7);letter-spacing:1.5px;text-transform:uppercase; }
  .doc-title { font-size:22px;font-weight:800;letter-spacing:3px;color:#fff;text-transform:uppercase; }
  .accent-bar { height:3px;background:linear-gradient(90deg,#1a5fa0 0%,#5ba3e0 50%,#2371B9 100%); }
  .content { padding:36px; }
  .amount-box { background:#2371B9;color:#fff;text-align:center;padding:28px;border-radius:8px;margin:24px 0; }
  .amount-label { font-size:10px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.7);font-weight:700; }
  .amount-value { font-size:36px;font-weight:800;color:#fff;margin-top:8px; }
  .details { border:1px solid #e0e8f4;border-radius:6px;overflow:hidden; }
  .detail-row { display:flex;justify-content:space-between;padding:11px 16px;border-bottom:1px solid #f0f4fa;font-size:12px; }
  .detail-row:last-child { border-bottom:none; }
  .detail-label { color:#888; }
  .detail-value { font-weight:700; }
  .footer { margin-top:28px;padding-top:12px;border-top:1px solid #e0e8f4;font-size:10px;color:#999;text-align:center; }
  @media print { body{-webkit-print-color-adjust:exact;print-color-adjust:exact;} @page{margin:10mm;size:A4 portrait;} }
</style>
</head>
<body>
<div class="header">
  <div class="header-left">
    ${logoHtml}
    <div class="company-sub">Agfin Services Limited</div>
  </div>
  <div class="doc-title">Payment Receipt</div>
</div>
<div class="accent-bar"></div>
<div class="content">
  <div class="amount-box">
    <div class="amount-label">Amount Paid</div>
    <div class="amount-value">UGX ${Number(payment.amount).toLocaleString("en-UG")}</div>
  </div>
  <div class="details">
    <div class="detail-row"><span class="detail-label">Receipt #</span><span class="detail-value">${payment.payment_number}</span></div>
    <div class="detail-row"><span class="detail-label">Type</span><span class="detail-value">Supplier Payment</span></div>
    <div class="detail-row"><span class="detail-label">Paid To</span><span class="detail-value">${supplierName}</span></div>
    <div class="detail-row"><span class="detail-label">Invoice #</span><span class="detail-value">${payment.invoice_number}</span></div>
    <div class="detail-row"><span class="detail-label">Payment Method</span><span class="detail-value">${(payment.method_display || payment.method || "—").replace(/_/g," ").toUpperCase()}</span></div>
    <div class="detail-row"><span class="detail-label">Reference</span><span class="detail-value">${payment.reference_number || "—"}</span></div>
    <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${formatDate(payment.created_at)}</span></div>
    <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">${(payment.status || "").toUpperCase()}</span></div>
  </div>
  <div class="footer">Bennu Agfin Services Limited · Plot 16 Mackinnon Road, Nakasero, Kampala, Uganda</div>
</div>
</body>
</html>`;
};

// ─── PDF Button ───────────────────────────────────────────────────────────────

interface SupplierInvoicePDFButtonProps {
  invoice: ISupplierInvoice;
  isFullDetail?: boolean;
  size?: "small" | "medium" | "large";
}

/**
 * Converts the logo at /favicon.png to a base64 data URL so it embeds
 * correctly in the print window (avoids cross-origin / blank-page issues).
 */
const fetchLogoAsDataUrl = (): Promise<string | undefined> =>
  fetch("/favicon.png")
    .then((res) => res.blob())
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    )
    .catch(() => undefined);

export const SupplierInvoicePDFButton: React.FC<SupplierInvoicePDFButtonProps> = ({
  invoice,
  isFullDetail = false,
  size = "medium",
}) => {
  const [loading, setLoading] = useState(false);

  const handlePrint = async () => {
    setLoading(true);
    try {
      // ── Fetch logo for embedding ─────────────────────────────────────────
      const logoDataUrl = await fetchLogoAsDataUrl();

      // ── The API returns all cost fields FLAT on the invoice itself.
      //    Fall back to source_order sub-object for older list-level shapes. ──
      const inv = invoice as any;
      const src = typeof inv.source_order === "object" && inv.source_order !== null
        ? inv.source_order
        : {};

      const pick = (field: string) =>
        inv[field] ?? src[field] ?? 0;

      const data: SupplierInvoiceData = {
        invoice_number:      inv.invoice_number,
        order_number:        inv.order_number ?? src.order_number ?? String(inv.source_order ?? ""),
        supplier_name:       inv.supplier_name ?? (inv.supplier_detail as any)?.business_name ?? "",
        supplier_detail:     inv.supplier_detail ?? (
                               typeof inv.supplier === "object" && inv.supplier !== null
                                 ? {
                                     business_name: inv.supplier.business_name,
                                     farm_location: inv.supplier.farm_location,
                                     phone:         inv.supplier.phone ?? inv.supplier.user_detail?.phone_number,
                                     first_name:    inv.supplier.first_name ?? inv.supplier.user?.first_name,
                                     last_name:     inv.supplier.last_name  ?? inv.supplier.user?.last_name,
                                     email:         inv.supplier.email      ?? inv.supplier.user?.email,
                                   }
                                 : undefined
                             ),
        quantity_kg:         pick("quantity_kg"),
        offered_price_per_kg:pick("offered_price_per_kg"),
        grain_type_name:     inv.grain_type_name ?? src.grain_type_name ?? "",
        trade_type:          inv.trade_type         ?? src.trade_type         ?? "",
        trade_type_display:  inv.trade_type_display ?? src.trade_type_display ?? "",
        hub_name:            inv.hub_name            ?? src.hub_name           ?? "",
        grain_cost:          pick("grain_cost"),
        logistics_cost:      pick("logistics_cost"),
        loading_cost:        pick("loading_cost"),
        offloading_cost:     pick("offloading_cost"),
        weighbridge_cost:    pick("weighbridge_cost"),
        handling_cost:       pick("handling_cost"),
        other_costs:         pick("other_costs"),
        amount_due:          inv.amount_due,
        amount_paid:         inv.amount_paid,
        balance_due:         inv.balance_due,
        payment_method:      typeof inv.payment_method === "object"
                               ? (inv.payment_method as any)?.method ?? (inv.payment_method as any)?.method_display ?? ""
                               : String(inv.payment_method ?? ""),
        payment_reference:   inv.payment_reference ?? "",
        status:              inv.status,
        status_display:      inv.status_display,
        due_date:            inv.due_date ?? "",
        issued_at:           inv.issued_at,
        paid_at:             inv.paid_at ?? undefined,
        notes:               inv.notes   ?? "",
      };

      const html = generateSupplierInvoiceHTML(data, logoDataUrl);
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); }, 600);
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
      {loading ? "Generating…" : "Print / PDF"}
    </Button>
  );
};