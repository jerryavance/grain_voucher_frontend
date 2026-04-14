/**
 * BuyerInvoicePDF.tsx
 *
 * Generates a buyer-facing invoice via a print-window.
 *
 * Shows only information relevant to the buyer:
 *   - Invoice header (number, order ref, dates, terms, status)
 *   - Parties: Bennu (seller) and buyer contact block
 *   - Line items: lot #, grain type, quantity, unit price, amount
 *   - Bank payment instructions + payment progress bar
 *   - Payment summary: invoice amount, amount paid, balance due
 *
 * Internal cost data (COGS, selling expenses, gross profit, margin %)
 * is intentionally excluded — that information lives on the staff dashboard only.
 *
 * Company colour: #2371B9
 */

import React, { useState } from "react";
import { Button, CircularProgress, IconButton, Tooltip } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { IBuyerInvoice, IBuyerInvoiceOrderLine } from "./Sourcing.interface";

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

export const generateBuyerInvoiceHTML = (
  invoice: IBuyerInvoice,
  logoDataUrl?: string
): string => {
  // ── Values ────────────────────────────────────────────────────────────────
  const buyer        = invoice.buyer_detail;
  const buyerName    = buyer?.business_name     || invoice.buyer_profile_name || invoice.buyer_name || "—";
  const buyerContact = buyer?.contact_name      || "";
  const buyerPhone   = buyer?.phone             || "";
  const buyerEmail   = buyer?.email             || "";
  const buyerAddress = buyer?.address           || "";
  const buyerDistrict   = buyer?.district       || "";
  const buyerRegNum  = buyer?.registration_number || "";
  const buyerType    = buyer?.buyer_type        || "";

  const amountDue  = Number(invoice.amount_due  || 0);
  const amountPaid = Number(invoice.amount_paid || 0);
  const balanceDue = Number(invoice.balance_due || 0);
  const paidPct    = amountDue > 0 ? Math.min(100, (amountPaid / amountDue) * 100) : 0;

  const terms = invoice.payment_terms_days === 0
    ? "On Delivery / Cash"
    : invoice.payment_terms_days
      ? `Net ${invoice.payment_terms_days} Days`
      : "—";

  // ── Status ────────────────────────────────────────────────────────────────
  const effectiveStatus = invoice.is_overdue && invoice.status !== "paid" ? "overdue" : invoice.status;
  const statusMap: Record<string, { bg: string; color: string; label: string }> = {
    draft:    { bg: "#6b7280", color: "#fff", label: "DRAFT"     },
    issued:   { bg: "#2371B9", color: "#fff", label: "ISSUED"    },
    partial:  { bg: "#d97706", color: "#fff", label: "PARTIAL"   },
    paid:     { bg: "#15803d", color: "#fff", label: "PAID"      },
    overdue:  { bg: "#dc2626", color: "#fff", label: "OVERDUE"   },
    cancelled:{ bg: "#374151", color: "#fff", label: "CANCELLED" },
  };
  const ss = statusMap[effectiveStatus] ?? statusMap.issued;

  // ── Logo HTML ─────────────────────────────────────────────────────────────
  const logoHtml = logoDataUrl
    ? `<img src="${logoDataUrl}" alt="Logo" style="height:52px;width:auto;object-fit:contain;" />`
    : `<div style="height:52px;width:52px;background:#2371B9;border-radius:6px;display:flex;align-items:center;justify-content:center;">
         <span style="color:#fff;font-weight:900;font-size:20px;">B</span></div>`;

  // ── Grain sale lines HTML (buyer-facing: no COGS columns) ─────────────────
  const lines: IBuyerInvoiceOrderLine[] = invoice.order_lines || [];
  const linesHtml = lines.length > 0
    ? lines.map(l => `
      <tr>
        <td style="padding:8px 10px;border-bottom:1px solid #f0f4fa;font-weight:600;color:#1565c0;">${l.lot_number}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #f0f4fa;">${l.grain_type}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #f0f4fa;text-align:right;">${fmtNum(l.quantity_kg)} kg</td>
        <td style="padding:8px 10px;border-bottom:1px solid #f0f4fa;text-align:right;">${ugx(l.sale_price_per_kg)}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #f0f4fa;text-align:right;font-weight:700;">${ugx(l.line_total)}</td>
      </tr>`).join("")
    : `<tr><td colspan="5" style="padding:12px 10px;text-align:center;color:#999;">No line items</td></tr>`;

  // ── Selling expenses HTML (buyer-facing: shown as "Additional Charges") ────
  const expenses: Array<{ category_display?: string; description?: string; amount?: string | number }> =
    (invoice as any).sale_expenses || [];
  const totalExpenses = expenses.reduce(
    (sum: number, e: any) => sum + Number(e.amount || 0), 0
  );
  const grainSubtotal = lines.reduce(
    (sum: number, l: any) => sum + Number(l.line_total || 0), 0
  );
  const expensesHtml = expenses.length > 0
    ? expenses.map(e => `
      <tr>
        <td style="padding:8px 10px;border-bottom:1px solid #f0f4fa;">${e.category_display || "—"}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #f0f4fa;">${e.description || "—"}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #f0f4fa;text-align:right;font-weight:600;">${ugx(e.amount)}</td>
      </tr>`).join("")
    : "";

  // ── Progress bar fill ─────────────────────────────────────────────────────
  const progressColor = paidPct === 100 ? "#15803d" : paidPct > 0 ? "#d97706" : "#2371B9";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Buyer Invoice — ${invoice.invoice_number}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { margin:0;padding:0;box-sizing:border-box; }
  body { font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:12px;color:#1a1a1a;background:#fff;line-height:1.5; }

  .header { background:#2371B9;padding:22px 36px;display:flex;justify-content:space-between;align-items:center; }
  .header-left { display:flex;align-items:center;gap:14px; }
  .company-sub { font-size:9px;color:rgba(255,255,255,0.7);letter-spacing:1.5px;text-transform:uppercase;margin-top:2px; }
  .header-right { text-align:right; }
  .doc-title { font-size:22px;font-weight:800;letter-spacing:3px;color:#fff;text-transform:uppercase; }
  .doc-sub { font-size:10px;color:rgba(255,255,255,0.65);margin-top:4px; }
  .accent-bar { height:3px;background:linear-gradient(90deg,#1a5fa0 0%,#5ba3e0 50%,#2371B9 100%); }
  .body { padding:20px 28px; }

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
  .data-table tbody tr:last-child td { border-bottom:none; }
  .data-table tfoot td { padding:8px 10px;font-size:12px;font-weight:600;background:#f6f9fd;border-top:2px solid #d0dff0; }

  /* Bottom grid — bank instructions full width + payment summary side by side */
  .bottom-grid { display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:18px; }

  /* Bank table */
  .bank-table { width:100%;border-collapse:collapse; }
  .bank-table td { font-size:11px;padding:6px 0;border-bottom:1px dotted #e0e8f4; }
  .bank-table tr:last-child td { border-bottom:none; }
  .bank-label { color:#666;width:50%; }
  .bank-value { font-weight:700;text-align:right; }

  /* Summary box */
  .summary-box { border:1px solid #e0e8f4;border-radius:6px;overflow:hidden; }
  .summary-row { display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid #f0f4fa;font-size:12px; }
  .summary-row:last-child { border-bottom:none; }
  .summary-row .s-label { color:#555; }
  .summary-row .s-value { font-weight:700; }
  .summary-row.balance { background:#2371B9;color:#fff;padding:12px 12px; }
  .summary-row.balance .s-label { color:rgba(255,255,255,0.7);font-size:11px; }
  .summary-row.balance .s-value { color:#fff;font-size:16px; }

  /* Progress */
  .progress-wrap { margin-top:14px; }
  .progress-header { display:flex;justify-content:space-between;font-size:10px;color:#666;margin-bottom:4px; }
  .progress-track { height:6px;background:#e0e8f4;border-radius:3px;overflow:hidden; }
  .progress-fill  { height:100%;width:${paidPct.toFixed(1)}%;background:${progressColor};border-radius:3px;transition:width 0.3s; }

  /* Notes / footer */
  .notes-box { background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:12px 14px;margin-top:16px;font-size:11px; }
  .footer { margin-top:24px;padding-top:10px;border-top:1px solid #e0e8f4;display:flex;justify-content:space-between;align-items:flex-end; }
  .footer-text { font-size:10px;color:#999; }
  .stamp { font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#2371B9;border:1.5px solid #2371B9;padding:3px 10px;border-radius:3px; }

  @media print {
    body { -webkit-print-color-adjust:exact;print-color-adjust:exact; }
    @page { margin:8mm;size:A4 portrait; }
  }
</style>
</head>
<body>

<!-- Header -->
<div class="header">
  <div class="header-left">
    ${logoHtml}
    <div>
      <div class="company-sub">Grain Sourcing &amp; Trade Finance</div>
    </div>
  </div>
  <div class="header-right">
    <div class="doc-title">Commercial Invoice</div>
    <div class="doc-sub">${invoice.invoice_number}</div>
  </div>
</div>
<div class="accent-bar"></div>

<div class="body">

  <!-- Meta strip -->
  <div class="meta-strip">
    <div class="meta-cell">
      <div class="meta-label">Invoice #</div>
      <div class="meta-value">${invoice.invoice_number}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Order #</div>
      <div class="meta-value">${invoice.order_number || "—"}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Issued</div>
      <div class="meta-value">${fmtDate(invoice.issued_at)}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Due Date</div>
      <div class="meta-value">${fmtDate(invoice.due_date)}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Terms</div>
      <div class="meta-value">${terms}</div>
    </div>
  </div>
  <div class="meta-strip" style="margin-top:-4px;">
    <div class="meta-cell">
      <div class="meta-label">Destination Warehouse</div>
      <div class="meta-value">${invoice.hub_name || "—"}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Paid On</div>
      <div class="meta-value">${fmtDate(invoice.paid_at)}</div>
    </div>
    <div class="meta-cell" style="grid-column:span 2;">
      <div class="meta-label">Customer PO / Reference</div>
      <div class="meta-value">${invoice.notes || invoice.order_number || "—"}</div>
    </div>
    <div class="meta-cell dark">
      <div class="meta-label">Status</div>
      <div class="meta-value"><span class="status-badge">${ss.label}</span></div>
    </div>
  </div>

  <!-- Parties -->
  <div class="parties">
    <div class="party-card from">
      <div class="party-role">From (Seller)</div>
      <div class="party-name">Bennu Agfin Services Limited</div>
      <div class="party-detail">
        Plot 16 Mackinnon Road, Nakasero<br/>
        P.O. Box 19298, Kampala, Uganda<br/>
        info@bennu.ug
      </div>
    </div>
    <div class="party-card to">
      <div class="party-role">Bill To (Buyer)</div>
      <div class="party-name">${buyerName}</div>
      <div class="party-detail">
        ${buyerType ? `${buyerType}<br/>` : ""}
        ${buyerRegNum ? `Reg: ${buyerRegNum}<br/>` : ""}
        ${buyerContact ? `Attn: ${buyerContact}<br/>` : ""}
        ${buyerPhone ? `${buyerPhone}<br/>` : ""}
        ${buyerEmail ? `${buyerEmail}<br/>` : ""}
        ${buyerAddress || buyerDistrict
          ? `${[buyerAddress, buyerDistrict].filter(Boolean).join(", ")}<br/>`
          : ""}
        Uganda
      </div>
    </div>
  </div>

  <!-- Grain Sale Lines -->
  <div class="section-heading">Invoice Line Items</div>
  <table class="data-table">
    <thead>
      <tr>
        <th>Lot #</th>
        <th>Grain Type</th>
        <th class="r">Quantity (kg)</th>
        <th class="r">Unit Price</th>
        <th class="r">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${linesHtml}
    </tbody>
  </table>

  ${expenses.length > 0 ? `
  <!-- Additional Charges (Selling Expenses) -->
  <div class="section-heading">Additional Charges</div>
  <table class="data-table">
    <thead>
      <tr>
        <th>Category</th>
        <th>Description</th>
        <th class="r">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${expensesHtml}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="2" style="text-align:right;font-size:11px;color:#5c8abf;">Total Additional Charges</td>
        <td style="text-align:right;font-size:13px;font-weight:700;">${ugx(totalExpenses)}</td>
      </tr>
    </tfoot>
  </table>
  ` : ""}

  <!-- Grand Total -->
  <div style="text-align:right;margin-top:6px;padding:10px 0;border-top:2px solid #2371B9;">
    <span style="font-size:11px;color:#5c8abf;margin-right:20px;">Total</span>
    <span style="font-size:16px;font-weight:800;color:#1a1a1a;">${ugx(amountDue)}</span>
  </div>

  <!-- Bank instructions + Payment Summary -->
  <div class="bottom-grid">

    <!-- Bank instructions -->
    <div>
      <div class="section-heading" style="margin-top:0;">Bank Payment Instructions</div>
      <table class="bank-table">
        <tr><td class="bank-label">Bank Name</td><td class="bank-value">STANBIC BANK</td></tr>
        <tr><td class="bank-label">Account Number</td><td class="bank-value">9030026820951</td></tr>
        <tr><td class="bank-label">Account Holder</td><td class="bank-value">BENNU AGFIN SERVICES LIMITED</td></tr>
        <tr><td class="bank-label">Branch</td><td class="bank-value">NAKASERO</td></tr>
        <tr><td class="bank-label">Currency</td><td class="bank-value">UGX</td></tr>
        <tr><td class="bank-label">Reference</td><td class="bank-value">${invoice.invoice_number}</td></tr>
      </table>

      <div class="progress-wrap">
        <div class="progress-header">
          <span>Payment Progress</span>
          <span>${paidPct.toFixed(0)}% paid</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill"></div>
        </div>
      </div>
    </div>

    <!-- Payment Summary (buyer-facing — no internal P&L) -->
    <div>
      <div class="section-heading" style="margin-top:0;">Payment Summary</div>
      <div class="summary-box">
        <div class="summary-row">
          <span class="s-label">Invoice Amount</span>
          <span class="s-value">${ugx(amountDue)}</span>
        </div>
        ${amountPaid > 0 ? `
        <div class="summary-row" style="color:#15803d;">
          <span class="s-label">Amount Paid</span>
          <span class="s-value" style="color:#15803d;">− ${ugx(amountPaid)}</span>
        </div>` : ""}
        <div class="summary-row balance">
          <span class="s-label">Balance Due</span>
          <span class="s-value">${ugx(balanceDue)}</span>
        </div>
      </div>
    </div>
  </div>

  ${invoice.notes ? `
  <div class="notes-box">
    <strong>Buyer Reference / Customer PO</strong> &nbsp;
    ${invoice.notes}
  </div>` : ""}

  <!-- Signature block -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:24px;padding-top:16px;border-top:1px solid #e0e8f4;">
    <div>
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#5c8abf;margin-bottom:6px;">Authorised by (Seller)</div>
      <div style="border-bottom:1.5px solid #1a1a1a;height:40px;margin-bottom:4px;"></div>
      <div style="font-size:10px;color:#888;">Name &amp; Signature &nbsp;/&nbsp; Date</div>
    </div>
    <div>
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#5c8abf;margin-bottom:6px;">Received by (Buyer)</div>
      <div style="border-bottom:1.5px solid #1a1a1a;height:40px;margin-bottom:4px;"></div>
      <div style="font-size:10px;color:#888;">Name &amp; Signature &nbsp;/&nbsp; Date</div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-text">
      <div>Bennu Agfin Services Limited · Plot 16 Mackinnon Road, Nakasero, Kampala, Uganda</div>
      <div style="margin-top:2px;">Generated on ${new Date().toLocaleDateString("en-UG", { year: "numeric", month: "long", day: "numeric" })}</div>
    </div>
    <div class="stamp">Official Document</div>
  </div>

</div>
</body>
</html>`;
};

// ─── PDF Button ───────────────────────────────────────────────────────────────

interface BuyerInvoicePDFButtonProps {
  invoice: IBuyerInvoice;
  compact?: boolean;
  size?: "small" | "medium" | "large";
}

const BuyerInvoicePDFButton: React.FC<BuyerInvoicePDFButtonProps> = ({
  invoice,
  compact = false,
  size = "small",
}) => {
  const [loading, setLoading] = useState(false);

  const handlePrint = async () => {
    setLoading(true);
    try {
      const logoDataUrl = await fetchLogoAsDataUrl();
      const html = generateBuyerInvoiceHTML(invoice, logoDataUrl);
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
      <Tooltip title={`Print / PDF — ${invoice.invoice_number}`}>
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

export default BuyerInvoicePDFButton;