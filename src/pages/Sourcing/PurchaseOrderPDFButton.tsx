/**
 * PurchaseOrderPDFButton.tsx
 *
 * HTML-based print/PDF for Purchase Orders (LPOs / BPOs).
 *   OUTBOUND (LPO): AMSAF → Supplier — title "LOCAL PURCHASE ORDER"
 *   INBOUND  (BPO): Buyer → AMSAF   — title "BUYER PURCHASE ORDER"
 *
 * Party labels and header colour flip by direction.
 * Same style system as ProformaInvoicePDFButton.
 */

import React, { useState } from "react";
import { Button, CircularProgress, IconButton, Tooltip } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { IPurchaseOrder } from "./Sourcing.interface";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtMoney = (val: number | string | null | undefined, currency = "UGX"): string => {
  const n = Number(val || 0);
  return `${currency} ${n.toLocaleString("en-UG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const fmtNum = (v: number | string | null | undefined, dp = 2): string =>
  Number(v || 0).toLocaleString("en-UG", { minimumFractionDigits: dp, maximumFractionDigits: dp });

const fmtDate = (d?: string | null): string => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return d; }
};

const fetchLogoAsDataUrl = (): Promise<string | undefined> =>
  fetch("/favicon.png")
    .then(r => r.blob())
    .then(blob => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    }))
    .catch(() => undefined);

// ─── HTML Generator ───────────────────────────────────────────────────────────

export const generatePOHTML = (po: IPurchaseOrder, logoDataUrl?: string): string => {
  const isOutbound = po.direction === "outbound";
  const currency   = po.currency || "UGX";
  const tradeUnit  = po.trade_unit || "kg";
  const isMT       = tradeUnit === "tonne";
  const unitLabel  = isMT ? "MT" : "kg";

  const qtyKg      = Number(po.quantity_kg || 0);
  const unitPriceKg= Number(po.unit_price  || 0);
  const qtyDisplay = isMT ? qtyKg / 1000 : qtyKg;
  const unitPriceD = isMT ? unitPriceKg * 1000 : unitPriceKg;
  const total      = Number(po.total_amount || 0);

  const fmt = (v: number | string | null | undefined) => fmtMoney(v, currency);

  const headerBg    = isOutbound ? "#1e6b3c" : "#1a4fa0";
  const accentColor = isOutbound ? "#22c55e" : "#3b82f6";
  const docTitle    = isOutbound ? "LOCAL PURCHASE ORDER" : "BUYER PURCHASE ORDER";
  const poLabel     = isOutbound ? "LPO Number" : "BPO Number";

  // Status badge
  const statusMap: Record<string, { bg: string; label: string }> = {
    draft:        { bg: "#6b7280", label: "DRAFT"        },
    sent:         { bg: "#2563eb", label: "SENT/RECEIVED" },
    acknowledged: { bg: "#d97706", label: "ACKNOWLEDGED" },
    fulfilled:    { bg: "#15803d", label: "FULFILLED"    },
    cancelled:    { bg: "#dc2626", label: "CANCELLED"    },
  };
  const ss = statusMap[po.status] ?? statusMap.draft;

  const logoHtml = logoDataUrl
    ? `<img src="${logoDataUrl}" alt="Logo" style="height:40px;width:auto;object-fit:contain;" />`
    : `<div style="height:40px;width:40px;background:rgba(255,255,255,0.2);border-radius:6px;display:flex;align-items:center;justify-content:center;">
         <span style="color:#fff;font-weight:900;font-size:16px;">B</span></div>`;

  // Party details
  const fromParty = isOutbound
    ? { role: "ISSUER (BUYER)", name: "Bennu Agfin Services Limited",
        detail: "Plot 16 Mackinnon Road, Nakasero<br/>Kampala, Uganda" }
    : { role: "BUYER", name: po.buyer_name || "—",
        detail: po.buyer_reference ? `Ref: ${po.buyer_reference}` : "" };

  const toParty = isOutbound
    ? { role: "SUPPLIER", name: po.supplier_name || "—",
        detail: po.source_order_number ? `Source Order: ${po.source_order_number}` : "" }
    : { role: "RECEIVER (SELLER)", name: "Bennu Agfin Services Limited",
        detail: "Plot 16 Mackinnon Road, Nakasero<br/>Kampala, Uganda" };

  const borderColor = isOutbound ? "#1e6b3c" : "#1a4fa0";
  const toBorderColor = isOutbound ? "#c05621" : "#15803d";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>${po.po_number}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:11px;color:#1a1a1a;background:#fff;line-height:1.4;}
  .header{background:${headerBg};padding:10px 18px;display:flex;justify-content:space-between;align-items:center;}
  .header-left{display:flex;align-items:center;gap:14px;}
  .company-name{font-size:18px;font-weight:800;color:#fff;letter-spacing:1px;}
  .company-sub{font-size:9px;color:rgba(255,255,255,0.7);letter-spacing:1.5px;text-transform:uppercase;margin-top:2px;}
  .header-right{text-align:right;}
  .doc-title{font-size:16px;font-weight:800;letter-spacing:2px;color:#fff;text-transform:uppercase;}
  .doc-sub{font-size:10px;color:rgba(255,255,255,0.65);margin-top:4px;}
  .accent-bar{height:3px;background:linear-gradient(90deg,${accentColor},${headerBg},${accentColor});}
  .body{padding:12px 18px;}
  .meta-strip{display:grid;grid-template-columns:repeat(5,1fr);border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;margin-bottom:10px;}
  .meta-cell{padding:6px 8px;border-right:1px solid #e2e8f0;background:#f8fafd;}
  .meta-cell:last-child{border-right:none;}
  .meta-cell.dark{background:${headerBg};color:#fff;}
  .meta-label{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#64748b;margin-bottom:2px;}
  .meta-cell.dark .meta-label{color:rgba(255,255,255,0.6);}
  .meta-value{font-size:11px;font-weight:600;}
  .meta-cell.dark .meta-value{color:#fff;}
  .status-badge{display:inline-block;padding:3px 10px;border-radius:3px;font-size:10px;font-weight:700;letter-spacing:0.8px;background:${ss.bg};color:#fff;}
  .parties{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;}
  .party-card{border:1px solid #e2e8f0;border-radius:6px;padding:7px 10px;}
  .party-card.from{border-left:3px solid ${borderColor};}
  .party-card.to{border-left:3px solid ${toBorderColor};}
  .party-role{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;}
  .party-card.from .party-role{color:${borderColor};}
  .party-card.to .party-role{color:${toBorderColor};}
  .party-name{font-size:11px;font-weight:700;margin-bottom:1px;}
  .party-detail{font-size:10px;color:#666;line-height:1.5;}
  .section-heading{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${borderColor};border-bottom:2px solid #e2e8f0;padding-bottom:3px;margin-bottom:6px;margin-top:8px;}
  .data-table{width:100%;border-collapse:collapse;margin-bottom:8px;}
  .data-table thead tr{background:${headerBg};color:#fff;}
  .data-table thead th{padding:5px 8px;text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;}
  .data-table thead th.r{text-align:right;}
  .data-table tbody td{padding:5px 8px;border-bottom:1px solid #f0f4fa;}
  .data-table tfoot td{padding:5px 8px;font-size:13px;font-weight:700;background:${headerBg}20;border-top:2px solid ${headerBg}40;}
  .info-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:8px;}
  .info-cell{background:#f8fafd;border:1px solid #e2e8f0;border-radius:6px;padding:6px 8px;}
  .info-label{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#64748b;margin-bottom:1px;}
  .info-value{font-size:11px;font-weight:600;color:#1a1a1a;}
  .narrative-box{border:1px solid #e2e8f0;border-radius:6px;padding:6px 10px;font-size:10px;color:#444;line-height:1.5;margin-bottom:6px;}
  .summary-box{border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;max-width:280px;margin-left:auto;margin-top:4px;}
  .summary-row{display:flex;justify-content:space-between;padding:5px 10px;border-bottom:1px solid #f0f4fa;font-size:11px;}
  .summary-row.total{background:${headerBg};color:#fff;font-weight:700;font-size:14px;}
  .signature-grid{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:16px;}
  .sig-block{border-top:1px solid #1a1a1a;padding-top:4px;text-align:center;font-size:10px;color:#555;}
  .footer{margin-top:10px;padding-top:8px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:flex-end;}
  .footer-text{font-size:9px;color:#999;line-height:1.5;}
  .stamp{background:${headerBg};color:#fff;font-size:9px;font-weight:700;padding:3px 10px;border-radius:4px;letter-spacing:1px;text-transform:uppercase;}
  .notes-box{background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:6px 10px;margin-top:8px;font-size:10px;color:#78350f;}
  @media print{
    @page{margin:6mm;size:A4 portrait;}
    body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  }
</style>
</head>
<body>

<div class="header">
  <div class="header-left">
    ${logoHtml}
    <div>
      <div class="company-name">Bennu Agfin Services</div>
      <div class="company-sub">Agricultural Finance</div>
    </div>
  </div>
  <div class="header-right">
    <div class="doc-title">${docTitle}</div>
    <div class="doc-sub">Plot 16 Mackinnon Road, Nakasero · Kampala, Uganda</div>
  </div>
</div>
<div class="accent-bar"></div>

<div class="body">

  <!-- Meta strip -->
  <div class="meta-strip">
    <div class="meta-cell">
      <div class="meta-label">${poLabel}</div>
      <div class="meta-value">${po.po_number}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Direction</div>
      <div class="meta-value">${po.direction_display}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Issued Date</div>
      <div class="meta-value">${fmtDate(po.issued_at)}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Issued By</div>
      <div class="meta-value">${po.issued_by_name || "—"}</div>
    </div>
    <div class="meta-cell dark">
      <div class="meta-label">Status</div>
      <div class="meta-value"><span class="status-badge">${ss.label}</span></div>
    </div>
  </div>

  <!-- Parties -->
  <div class="parties">
    <div class="party-card from">
      <div class="party-role">${fromParty.role}</div>
      <div class="party-name">${fromParty.name}</div>
      <div class="party-detail">${fromParty.detail}</div>
    </div>
    <div class="party-card to">
      <div class="party-role">${toParty.role}</div>
      <div class="party-name">${toParty.name}</div>
      <div class="party-detail">${toParty.detail}</div>
    </div>
  </div>

  <!-- Logistics info -->
  <div class="info-grid">
    <div class="info-cell">
      <div class="info-label">Delivery Location</div>
      <div class="info-value">${po.delivery_location || "—"}</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Delivery Date</div>
      <div class="info-value">${po.delivery_date || "—"}</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Currency</div>
      <div class="info-value">${currency}</div>
    </div>
  </div>

  <!-- Line items -->
  <div class="section-heading">Order Line Items</div>
  <table class="data-table">
    <thead>
      <tr>
        <th>Product / Commodity</th>
        <th>Quality Specification</th>
        <th class="r">Quantity (${unitLabel})</th>
        <th class="r">Unit Price (${currency}/${unitLabel})</th>
        <th class="r">Amount (${currency})</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="font-weight:600;">${po.grain_type_name || "—"}</td>
        <td style="color:#555;">${po.quality_spec || "As per standard grade"}</td>
        <td style="text-align:right;">${fmtNum(qtyDisplay, isMT ? 4 : 2)}</td>
        <td style="text-align:right;">${fmt(unitPriceD)}</td>
        <td style="text-align:right;font-weight:700;">${fmt(total)}</td>
      </tr>
    </tbody>
  </table>

  <!-- Summary -->
  <div class="summary-box">
    <div class="summary-row">
      <span>Sub-Total</span>
      <span style="font-weight:600;">${fmt(total)}</span>
    </div>
    <div class="summary-row total">
      <span>Total Order Value</span>
      <span>${fmt(total)}</span>
    </div>
  </div>

  <!-- Payment Terms -->
  ${po.payment_terms ? `
  <div class="section-heading">Payment Terms</div>
  <div class="narrative-box">${po.payment_terms}</div>` : ""}

  <!-- Buyer reference -->
  ${po.buyer_reference ? `
  <div class="notes-box">
    <strong>Buyer Reference / PO Number:</strong> ${po.buyer_reference}
  </div>` : ""}

  <!-- Notes -->
  ${po.notes ? `
  <div class="notes-box" style="margin-top:6px;">
    <strong>Notes:</strong> ${po.notes}
  </div>` : ""}

  <!-- Signature Block -->
  <div class="section-heading" style="margin-top:16px;">Authorisation</div>
  <div class="signature-grid">
    <div class="sig-block">
      Authorised Signature &amp; Stamp<br/>
      <span style="font-size:9px;color:#888;">${fromParty.name}</span>
    </div>
    <div class="sig-block">
      Acknowledged &amp; Accepted<br/>
      <span style="font-size:9px;color:#888;">${toParty.name}</span>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-text">
      <div>Bennu Agfin Services Limited · Plot 16 Mackinnon Road, Nakasero, Kampala, Uganda</div>
      <div style="margin-top:2px;">Generated on ${new Date().toLocaleDateString("en-UG", { year: "numeric", month: "long", day: "numeric" })}</div>
    </div>
    <div class="stamp">${isOutbound ? "Local Purchase Order" : "Buyer Purchase Order"}</div>
  </div>

</div>
</body>
</html>`;
};

// ─── Button Component ─────────────────────────────────────────────────────────

interface Props {
  po: IPurchaseOrder;
  compact?: boolean;
  size?: "small" | "medium" | "large";
}

const PurchaseOrderPDFButton: React.FC<Props> = ({ po, compact = false, size = "small" }) => {
  const [loading, setLoading] = useState(false);

  const handlePrint = async () => {
    setLoading(true);
    try {
      const logoDataUrl = await fetchLogoAsDataUrl();
      const html = generatePOHTML(po, logoDataUrl);
      const win  = window.open("", "_blank");
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

  if (compact) {
    return (
      <Tooltip title={`Print / PDF — ${po.po_number}`}>
        <IconButton size={size} color="primary" onClick={handlePrint} disabled={loading}>
          {loading ? <CircularProgress size={16} /> : <PictureAsPdfIcon />}
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Button
      size={size}
      variant="outlined"
      color="primary"
      onClick={handlePrint}
      disabled={loading}
      startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <PictureAsPdfIcon />}
    >
      {loading ? "Generating…" : "Print / PDF"}
    </Button>
  );
};

export default PurchaseOrderPDFButton;
