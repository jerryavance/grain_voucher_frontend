/**
 * ProformaInvoicePDF.tsx
 *
 * Print-to-PDF for Proforma Invoices (PFIs).
 * Matches the exact visual style of BuyerInvoicePDF — same header, meta strip,
 * party cards, table, bank details, footer — but adapted for a quotation:
 *   - Title: "PROFORMA INVOICE"
 *   - Shows: grain, quantity, unit price, sub-total, deposit required
 *   - Shows: payment terms narrative, delivery timeline narrative
 *   - Shows: bank details (from PFI fields, falls back to Bennu defaults)
 *   - Shows: signatory block
 *   - Status badge: draft / sent / accepted / rejected / expired
 *
 * Usage:
 *   <ProformaInvoicePDFButton pfi={pfi} />
 *   <ProformaInvoicePDFButton pfi={pfi} compact />
 */

import React, { useState } from "react";
import { Button, CircularProgress, IconButton, Tooltip } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { IProformaInvoice } from "./Sourcing.interface";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ugx = (val: number | string | null | undefined): string =>
  `UGX ${Number(val || 0).toLocaleString("en-UG", { minimumFractionDigits: 0 })}`;

const fmtDate = (d?: string | null): string => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return d; }
};

const fmtNum = (v: number | string | null | undefined): string =>
  Number(v || 0).toLocaleString("en-UG", { minimumFractionDigits: 0 });

const fetchLogoAsDataUrl = (): Promise<string | undefined> =>
  fetch("/favicon.png")
    .then(r => r.blob())
    .then(blob => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    }))
    .catch(() => undefined);

// ─── HTML Generator ───────────────────────────────────────────────────────────

export const generatePFIHTML = (
  pfi: IProformaInvoice,
  logoDataUrl?: string,
): string => {
  const subTotal      = Number(pfi.sub_total || 0);
  const deposit       = Number(pfi.required_deposit || 0);
  const paidDeposit   = Number(pfi.paid_deposit || 0);
  const totalDue      = Number(pfi.total_due || 0);
  const qty           = Number(pfi.quantity_kg || 0);
  const unitPrice     = Number(pfi.unit_price || 0);

  // Status badge colours
  const statusMap: Record<string, { bg: string; color: string; label: string }> = {
    draft:    { bg: "#6b7280", color: "#fff", label: "DRAFT"    },
    sent:     { bg: "#2371B9", color: "#fff", label: "SENT"     },
    accepted: { bg: "#15803d", color: "#fff", label: "ACCEPTED" },
    rejected: { bg: "#dc2626", color: "#fff", label: "REJECTED" },
    expired:  { bg: "#92400e", color: "#fff", label: "EXPIRED"  },
  };
  const ss = statusMap[pfi.status] ?? statusMap.draft;

  const logoHtml = logoDataUrl
    ? `<img src="${logoDataUrl}" alt="Logo" style="height:52px;width:auto;object-fit:contain;" />`
    : `<div style="height:52px;width:52px;background:#2371B9;border-radius:6px;display:flex;align-items:center;justify-content:center;">
         <span style="color:#fff;font-weight:900;font-size:20px;">B</span></div>`;

  // Bank — prefer PFI-level fields, fallback to Bennu defaults
  const bankName    = pfi.bank_name    || "STANBIC BANK";
  const accountNum  = pfi.account_number || "9030026820951";
  const accountName = pfi.account_name || "BENNU AGFIN SERVICES LIMITED";
  const swift       = pfi.swift_code   || "—";
  const sortCode    = pfi.sort_code    || "—";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Proforma Invoice — ${pfi.pfi_number}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { margin:0;padding:0;box-sizing:border-box; }
  body { font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:12px;color:#1a1a1a;background:#fff;line-height:1.5; }

  .header { background:#2371B9;padding:22px 36px;display:flex;justify-content:space-between;align-items:center; }
  .header-left { display:flex;align-items:center;gap:14px; }
  .company-name { font-size:18px;font-weight:800;color:#fff;letter-spacing:1px; }
  .company-sub { font-size:9px;color:rgba(255,255,255,0.7);letter-spacing:1.5px;text-transform:uppercase;margin-top:2px; }
  .header-right { text-align:right; }
  .doc-title { font-size:22px;font-weight:800;letter-spacing:3px;color:#fff;text-transform:uppercase; }
  .doc-sub { font-size:10px;color:rgba(255,255,255,0.65);margin-top:4px; }
  .accent-bar { height:3px;background:linear-gradient(90deg,#1a5fa0 0%,#5ba3e0 50%,#2371B9 100%); }
  .body { padding:28px 36px; }

  /* Meta strip */
  .meta-strip { display:grid;grid-template-columns:repeat(5,1fr);border:1px solid #e0e8f4;border-radius:6px;overflow:hidden;margin-bottom:20px; }
  .meta-cell { padding:10px 12px;border-right:1px solid #e0e8f4;background:#f6f9fd; }
  .meta-cell:last-child { border-right:none; }
  .meta-cell.dark { background:#2371B9;color:#fff; }
  .meta-label { font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#5c8abf;margin-bottom:3px; }
  .meta-cell.dark .meta-label { color:rgba(255,255,255,0.6); }
  .meta-value { font-size:12px;font-weight:600;color:#1a1a1a; }
  .meta-cell.dark .meta-value { color:#fff; }
  .status-badge { display:inline-block;padding:3px 10px;border-radius:3px;font-size:10px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;background:${ss.bg};color:${ss.color}; }

  /* Parties */
  .parties { display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:20px; }
  .party-card { border:1px solid #e0e8f4;border-radius:6px;padding:12px 14px; }
  .party-card.from { border-left:3px solid #2371B9; }
  .party-card.to   { border-left:3px solid #15803d; }
  .party-role { font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px; }
  .party-card.from .party-role { color:#2371B9; }
  .party-card.to   .party-role { color:#15803d; }
  .party-name   { font-size:13px;font-weight:700;margin-bottom:3px; }
  .party-detail { font-size:11px;color:#666;line-height:1.7; }

  /* Section heading */
  .section-heading { font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#5c8abf;border-bottom:2px solid #e0e8f4;padding-bottom:5px;margin-bottom:10px;margin-top:18px; }

  /* Tables */
  .data-table { width:100%;border-collapse:collapse;margin-bottom:4px; }
  .data-table thead tr { background:#2371B9;color:#fff; }
  .data-table thead th { padding:8px 10px;text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px; }
  .data-table thead th.r { text-align:right; }
  .data-table tbody td { padding:8px 10px;border-bottom:1px solid #f0f4fa; }
  .data-table tfoot td { padding:8px 10px;font-size:12px;font-weight:600;background:#f6f9fd;border-top:2px solid #d0dff0; }

  /* Bottom grid */
  .bottom-grid { display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:18px; }

  /* Bank table */
  .bank-table { width:100%;border-collapse:collapse; }
  .bank-table td { font-size:11px;padding:6px 0;border-bottom:1px dotted #e0e8f4; }
  .bank-label { color:#888;width:130px; }
  .bank-value { font-weight:600;color:#1a1a1a; }

  /* Summary box */
  .summary-box { border:1px solid #e0e8f4;border-radius:6px;overflow:hidden; }
  .summary-row { display:flex;justify-content:space-between;padding:8px 14px;border-bottom:1px solid #f0f4fa;font-size:12px; }
  .summary-row:last-child { border-bottom:none; }
  .summary-row.balance { background:#2371B9;color:#fff;font-weight:700;font-size:14px; }
  .s-label { color:inherit; }
  .s-value { font-weight:600; }

  /* Narrative box */
  .narrative-box { border:1px solid #e0e8f4;border-radius:6px;padding:12px 14px;font-size:11px;color:#444;line-height:1.8;white-space:pre-wrap;margin-bottom:12px; }
  .narrative-label { font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#5c8abf;margin-bottom:6px; }

  /* Signatory */
  .signatory-box { border-top:2px solid #2371B9;padding-top:10px;margin-top:30px; }
  .signatory-name { font-size:13px;font-weight:700;color:#1a1a1a; }
  .signatory-title { font-size:11px;color:#666; }

  /* Notes */
  .notes-box { background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:10px 14px;margin-top:14px;font-size:11px;color:#78350f; }

  /* Validity */
  .validity-bar { background:#f0f9ff;border:1px solid #bae6fd;border-radius:6px;padding:10px 14px;margin-bottom:18px;font-size:11px;color:#0369a1;display:flex;align-items:center;gap:8px; }

  /* Footer */
  .footer { margin-top:32px;padding-top:14px;border-top:1px solid #e0e8f4;display:flex;justify-content:space-between;align-items:flex-end; }
  .footer-text { font-size:10px;color:#999;line-height:1.7; }
  .stamp { background:#2371B9;color:#fff;font-size:10px;font-weight:700;padding:5px 14px;border-radius:4px;letter-spacing:1px;text-transform:uppercase; }

  @media print {
    body { -webkit-print-color-adjust:exact;print-color-adjust:exact; }
    .no-print { display:none !important; }
  }
</style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div class="header-left">
      ${logoHtml}
      <div>
        <div class="company-name">BENNU AGFIN</div>
        <div class="company-sub">Agri-Finance Services</div>
      </div>
    </div>
    <div class="header-right">
      <div class="doc-title">Proforma Invoice</div>
      <div class="doc-sub">Plot 16 Mackinnon Road, Nakasero · Kampala, Uganda</div>
    </div>
  </div>
  <div class="accent-bar"></div>

  <div class="body">

    <!-- Meta strip -->
    <div class="meta-strip">
      <div class="meta-cell">
        <div class="meta-label">PFI Number</div>
        <div class="meta-value">${pfi.pfi_number}</div>
      </div>
      <div class="meta-cell">
        <div class="meta-label">Order Ref</div>
        <div class="meta-value">${pfi.order_number || "—"}</div>
      </div>
      <div class="meta-cell">
        <div class="meta-label">Issue Date</div>
        <div class="meta-value">${fmtDate(pfi.created_at)}</div>
      </div>
      <div class="meta-cell">
        <div class="meta-label">Valid Until</div>
        <div class="meta-value">${fmtDate(pfi.expiry_date)}</div>
      </div>
      <div class="meta-cell dark">
        <div class="meta-label">Status</div>
        <div class="meta-value"><span class="status-badge">${ss.label}</span></div>
      </div>
    </div>

    ${pfi.expiry_date ? `
    <div class="validity-bar">
      ⏳ &nbsp; This proforma invoice is valid until <strong>${fmtDate(pfi.expiry_date)}</strong>.
      Please confirm acceptance before this date.
    </div>` : ""}

    <!-- Parties -->
    <div class="parties">
      <div class="party-card from">
        <div class="party-role">Seller / Issuer</div>
        <div class="party-name">Bennu Agfin Services Limited</div>
        <div class="party-detail">
          Plot 16 Mackinnon Road, Nakasero<br/>
          Kampala, Uganda<br/>
          ${pfi.salesperson_name ? `Salesperson: ${pfi.salesperson_name}<br/>` : ""}
          ${pfi.signatory_contact ? `${pfi.signatory_contact}` : ""}
        </div>
      </div>
      <div class="party-card to">
        <div class="party-role">Buyer / Quotation For</div>
        <div class="party-name">${pfi.buyer_name || "—"}</div>
        <div class="party-detail">
          Ref: ${pfi.order_number || "—"}<br/>
          Uganda
        </div>
      </div>
    </div>

    <!-- Logistics row -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:18px;">
      <div style="background:#f6f9fd;border:1px solid #e0e8f4;border-radius:6px;padding:10px 12px;">
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#5c8abf;margin-bottom:3px;">Ship Date</div>
        <div style="font-size:12px;font-weight:600;">${pfi.ship_date || "To be confirmed"}</div>
      </div>
      <div style="background:#f6f9fd;border:1px solid #e0e8f4;border-radius:6px;padding:10px 12px;">
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#5c8abf;margin-bottom:3px;">Shipped Via</div>
        <div style="font-size:12px;font-weight:600;">${pfi.shipped_via || "—"}</div>
      </div>
      <div style="background:#f6f9fd;border:1px solid #e0e8f4;border-radius:6px;padding:10px 12px;">
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#5c8abf;margin-bottom:3px;">Pick From</div>
        <div style="font-size:12px;font-weight:600;">${pfi.pick_from || "Ex-Warehouse"}</div>
      </div>
    </div>

    <!-- Line items table -->
    <div class="section-heading">Quotation Line Items</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Grain Type</th>
          <th class="r">Quantity (kg)</th>
          <th class="r">Unit Price (UGX/kg)</th>
          <th class="r">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-weight:600;">${pfi.grain_type_name || "—"}</td>
          <td style="text-align:right;">${fmtNum(qty)} kg</td>
          <td style="text-align:right;">${ugx(unitPrice)}</td>
          <td style="text-align:right;font-weight:700;">${ugx(subTotal)}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="text-align:right;font-size:11px;color:#5c8abf;">Sub-Total</td>
          <td style="text-align:right;font-size:13px;font-weight:700;">${ugx(subTotal)}</td>
        </tr>
      </tfoot>
    </table>

    <!-- Bank + Summary -->
    <div class="bottom-grid">

      <div>
        <div class="section-heading" style="margin-top:0;">Bank Payment Instructions</div>
        <table class="bank-table">
          <tr><td class="bank-label">Bank Name</td><td class="bank-value">${bankName}</td></tr>
          <tr><td class="bank-label">Account Number</td><td class="bank-value">${accountNum}</td></tr>
          <tr><td class="bank-label">Account Holder</td><td class="bank-value">${accountName}</td></tr>
          ${swift !== "—" ? `<tr><td class="bank-label">SWIFT Code</td><td class="bank-value">${swift}</td></tr>` : ""}
          ${sortCode !== "—" ? `<tr><td class="bank-label">Sort Code</td><td class="bank-value">${sortCode}</td></tr>` : ""}
          <tr><td class="bank-label">Currency</td><td class="bank-value">UGX</td></tr>
          <tr><td class="bank-label">Reference</td><td class="bank-value">${pfi.pfi_number}</td></tr>
        </table>
      </div>

      <div>
        <div class="section-heading" style="margin-top:0;">Payment Summary</div>
        <div class="summary-box">
          <div class="summary-row">
            <span class="s-label">Sub-Total</span>
            <span class="s-value">${ugx(subTotal)}</span>
          </div>
          ${deposit > 0 ? `
          <div class="summary-row">
            <span class="s-label">Required Deposit</span>
            <span class="s-value">${ugx(deposit)}</span>
          </div>` : ""}
          ${paidDeposit > 0 ? `
          <div class="summary-row" style="color:#15803d;">
            <span class="s-label">Deposit Received</span>
            <span class="s-value" style="color:#15803d;">− ${ugx(paidDeposit)}</span>
          </div>` : ""}
          <div class="summary-row balance">
            <span class="s-label">Total Due</span>
            <span class="s-value">${ugx(totalDue > 0 ? totalDue : subTotal)}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Terms Narrative -->
    ${pfi.payment_terms_narrative ? `
    <div class="section-heading">Payment Terms</div>
    <div class="narrative-box">${pfi.payment_terms_narrative}</div>` : ""}

    <!-- Delivery Timeline Narrative -->
    ${pfi.delivery_timeline_narrative ? `
    <div class="section-heading">Delivery Timeline</div>
    <div class="narrative-box">${pfi.delivery_timeline_narrative}</div>` : ""}

    <!-- Notes -->
    ${pfi.notes ? `
    <div class="notes-box">
      <strong>Notes:</strong> ${pfi.notes}
    </div>` : ""}

    <!-- Signatory -->
    ${pfi.signatory_name ? `
    <div class="signatory-box">
      <div style="font-size:11px;color:#888;margin-bottom:6px;">Authorised by:</div>
      <div class="signatory-name">${pfi.signatory_name}</div>
      <div class="signatory-title">${pfi.signatory_title || ""}</div>
      ${pfi.signatory_contact ? `<div style="font-size:11px;color:#666;margin-top:2px;">${pfi.signatory_contact}</div>` : ""}
    </div>` : ""}

    <!-- Footer -->
    <div class="footer">
      <div class="footer-text">
        <div>Bennu Agfin Services Limited · Plot 16 Mackinnon Road, Nakasero, Kampala, Uganda</div>
        <div style="margin-top:2px;">Generated on ${new Date().toLocaleDateString("en-UG", { year: "numeric", month: "long", day: "numeric" })}</div>
        <div style="margin-top:2px;color:#bbb;">This is a proforma invoice and not a demand for payment.</div>
      </div>
      <div class="stamp">Proforma Invoice</div>
    </div>

  </div>
</body>
</html>`;
};

// ─── PDF Button ───────────────────────────────────────────────────────────────

interface ProformaInvoicePDFButtonProps {
  pfi: IProformaInvoice;
  compact?: boolean;
  size?: "small" | "medium" | "large";
}

const ProformaInvoicePDFButton: React.FC<ProformaInvoicePDFButtonProps> = ({
  pfi,
  compact = false,
  size = "small",
}) => {
  const [loading, setLoading] = useState(false);

  const handlePrint = async () => {
    setLoading(true);
    try {
      const logoDataUrl = await fetchLogoAsDataUrl();
      const html = generatePFIHTML(pfi, logoDataUrl);
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

  if (compact) {
    return (
      <Tooltip title={`Print / PDF — ${pfi.pfi_number}`}>
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

export default ProformaInvoicePDFButton;