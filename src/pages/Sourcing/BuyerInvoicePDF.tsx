/**
 * BuyerInvoicePDF.tsx
 *
 * Generates buyer invoice via a print-window (same approach as SupplierInvoicePDF).
 * - Company colour: #2371B9
 * - Logo only in header (no repeated "BENNU" text next to it)
 * - Uses all fields returned by the buyer invoice API
 */

import React, { useState } from "react";
import { Button, CircularProgress, IconButton, Tooltip } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { IBuyerInvoice } from "./Sourcing.interface";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ugx = (val: number | string): string =>
  `UGX ${Number(val || 0).toLocaleString("en-UG", { minimumFractionDigits: 0 })}`;

const fmtDate = (d?: string | null): string => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return d; }
};

/** Fetch /favicon.png and convert to base64 data URL so it embeds in a blank print window */
const fetchLogoAsDataUrl = (): Promise<string | undefined> =>
  fetch("/favicon.png")
    .then((r) => r.blob())
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

// ─── HTML Generator ───────────────────────────────────────────────────────────

export interface BuyerInvoiceHTMLData {
  invoice_number: string;
  order_number?: string;
  buyer_name?: string;
  buyer_profile_name?: string;
  hub_name?: string;          // resolved from hub id externally if available
  amount_due: number | string;
  amount_paid: number | string;
  balance_due: number | string;
  payment_terms_days?: number;
  issued_at?: string;
  due_date?: string | null;
  paid_at?: string | null;
  status: string;
  is_overdue?: boolean;
  notes?: string;
}

export const generateBuyerInvoiceHTML = (
  invoice: BuyerInvoiceHTMLData,
  logoDataUrl?: string
): string => {
  // ── Values ───────────────────────────────────────────────────────────────
  const buyerName = invoice.buyer_profile_name || invoice.buyer_name || "—";
  const amountDue  = Number(invoice.amount_due  || 0);
  const amountPaid = Number(invoice.amount_paid || 0);
  const balanceDue = Number(invoice.balance_due || 0);
  const paidPct    = amountDue > 0 ? Math.min(100, (amountPaid / amountDue) * 100) : 0;
  const terms      = invoice.payment_terms_days === 0
    ? "On Delivery / Cash"
    : invoice.payment_terms_days
      ? `Net ${invoice.payment_terms_days} Days`
      : "—";

  // ── Status ────────────────────────────────────────────────────────────────
  const effectiveStatus = invoice.is_overdue && invoice.status !== "paid" ? "overdue" : invoice.status;
  const statusMap: Record<string, { bg: string; color: string; label: string }> = {
    draft:    { bg: "#6b7280", color: "#fff", label: "DRAFT"    },
    issued:   { bg: "#2371B9", color: "#fff", label: "ISSUED"   },
    partial:  { bg: "#d97706", color: "#fff", label: "PARTIAL"  },
    paid:     { bg: "#15803d", color: "#fff", label: "PAID"     },
    overdue:  { bg: "#dc2626", color: "#fff", label: "OVERDUE"  },
    cancelled:{ bg: "#374151", color: "#fff", label: "CANCELLED"},
  };
  const statusStyle = statusMap[effectiveStatus] ?? statusMap.issued;

  // ── Logo ──────────────────────────────────────────────────────────────────
  const logoHtml = logoDataUrl
    ? `<img src="${logoDataUrl}" alt="Logo" style="height:52px;width:auto;object-fit:contain;" />`
    : `<div style="height:52px;width:52px;background:#2371B9;border-radius:6px;display:flex;align-items:center;justify-content:center;">
         <span style="color:#fff;font-weight:900;font-size:20px;">B</span>
       </div>`;

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
  body {
    font-family:'Inter','Helvetica Neue',Arial,sans-serif;
    font-size:12px; color:#1a1a1a; background:#fff; line-height:1.5;
  }

  /* ── Header ── */
  .header {
    background:#2371B9; padding:22px 36px;
    display:flex; justify-content:space-between; align-items:center;
  }
  .header-left  { display:flex; align-items:center; gap:14px; }
  .company-sub  { font-size:9px; color:rgba(255,255,255,0.7); letter-spacing:1.5px; text-transform:uppercase; margin-top:2px; }
  .header-right { text-align:right; }
  .doc-title    { font-size:22px; font-weight:800; letter-spacing:3px; color:#fff; text-transform:uppercase; }
  .doc-sub      { font-size:10px; color:rgba(255,255,255,0.65); margin-top:4px; }

  /* ── Accent bar ── */
  .accent-bar { height:3px; background:linear-gradient(90deg,#1a5fa0 0%,#5ba3e0 50%,#2371B9 100%); }

  /* ── Body ── */
  .body { padding:28px 36px; }

  /* ── Meta strip ── */
  .meta-strip {
    display:grid; grid-template-columns:repeat(4,1fr);
    border:1px solid #e0e8f4; border-radius:6px; overflow:hidden; margin-bottom:24px;
  }
  .meta-cell {
    padding:12px 14px; border-right:1px solid #e0e8f4; background:#f6f9fd;
  }
  .meta-cell:last-child { border-right:none; }
  .meta-cell.dark { background:#2371B9; color:#fff; }
  .meta-label {
    font-size:9px; font-weight:700; text-transform:uppercase;
    letter-spacing:0.8px; color:#5c8abf; margin-bottom:4px;
  }
  .meta-cell.dark .meta-label { color:rgba(255,255,255,0.6); }
  .meta-value { font-size:12px; font-weight:600; color:#1a1a1a; }
  .meta-cell.dark .meta-value { color:#fff; }

  /* ── Status badge ── */
  .status-badge {
    display:inline-block; padding:3px 10px; border-radius:3px;
    font-size:10px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase;
    background:${statusStyle.bg}; color:${statusStyle.color};
  }

  /* ── Parties ── */
  .parties { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:24px; }
  .party-card { border:1px solid #e0e8f4; border-radius:6px; padding:14px 16px; }
  .party-card.from { border-left:3px solid #2371B9; }
  .party-card.to   { border-left:3px solid #15803d; }
  .party-role {
    font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;
  }
  .party-card.from .party-role { color:#2371B9; }
  .party-card.to   .party-role { color:#15803d; }
  .party-name   { font-size:14px; font-weight:700; margin-bottom:4px; }
  .party-detail { font-size:11px; color:#666; line-height:1.7; }

  /* ── Section heading ── */
  .section-heading {
    font-size:10px; font-weight:700; text-transform:uppercase;
    letter-spacing:1px; color:#5c8abf;
    border-bottom:2px solid #e0e8f4; padding-bottom:6px; margin-bottom:12px;
  }

  /* ── Invoice line table ── */
  .line-table { width:100%; border-collapse:collapse; margin-bottom:24px; }
  .line-table thead tr { background:#2371B9; color:#fff; }
  .line-table thead th {
    padding:9px 12px; text-align:left;
    font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px;
  }
  .line-table thead th.right { text-align:right; }
  .line-table tbody td { padding:11px 12px; border-bottom:1px solid #f0f4fa; font-size:12px; }
  .line-table tbody tr:last-child td { border-bottom:none; }
  .line-table tfoot td {
    padding:9px 12px; font-size:12px; font-weight:600;
    background:#f6f9fd; border-top:2px solid #d0dff0;
  }

  /* ── Bottom grid ── */
  .bottom-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }

  /* ── Bank instructions ── */
  .bank-table { width:100%; border-collapse:collapse; }
  .bank-table td { font-size:11px; padding:6px 0; border-bottom:1px dotted #e0e8f4; }
  .bank-table tr:last-child td { border-bottom:none; }
  .bank-label { color:#666; width:50%; }
  .bank-value { font-weight:700; text-align:right; }

  /* ── Summary box ── */
  .summary-box { border:1px solid #e0e8f4; border-radius:6px; overflow:hidden; }
  .summary-row {
    display:flex; justify-content:space-between; align-items:center;
    padding:9px 14px; border-bottom:1px solid #f0f4fa; font-size:12px;
  }
  .summary-row:last-child { border-bottom:none; }
  .summary-row .s-label { color:#555; }
  .summary-row .s-value { font-weight:700; }
  .summary-row.sub  { background:#f6f9fd; font-weight:700; }
  .summary-row.paid .s-value { color:#15803d; }
  .summary-row.balance {
    background:#2371B9; color:#fff; padding:14px 14px;
  }
  .summary-row.balance .s-label {
    color:rgba(255,255,255,0.7); font-size:11px;
    font-weight:700; text-transform:uppercase; letter-spacing:0.5px;
  }
  .summary-row.balance .s-value { color:#fff; font-size:16px; font-weight:800; }

  /* ── Progress ── */
  .progress-wrap {
    margin-top:14px; padding:12px 14px;
    background:#f6f9fd; border:1px solid #e0e8f4; border-radius:6px;
  }
  .progress-header {
    display:flex; justify-content:space-between;
    font-size:10px; font-weight:700; margin-bottom:6px; color:#333;
  }
  .progress-track {
    height:6px; background:#d0dff0; border-radius:99px; overflow:hidden;
  }
  .progress-fill {
    height:100%; width:${paidPct.toFixed(1)}%; background:${progressColor}; border-radius:99px;
  }

  /* ── Notes ── */
  .notes-box {
    margin-top:20px; padding:12px 14px;
    border:1px solid #e0e8f4; border-radius:6px;
    background:#f6f9fd; font-size:11px; color:#555;
  }
  .notes-box strong {
    display:block; font-size:9px; text-transform:uppercase;
    font-weight:700; letter-spacing:0.8px; color:#5c8abf; margin-bottom:4px;
  }

  /* ── Footer ── */
  .footer {
    margin-top:28px; padding-top:14px; border-top:1px solid #e0e8f4;
    display:flex; justify-content:space-between; align-items:flex-end;
    font-size:10px; color:#999;
  }
  .footer .stamp {
    background:#2371B9; color:#fff;
    padding:6px 14px; border-radius:3px;
    font-size:9px; font-weight:700; letter-spacing:1px; text-transform:uppercase;
  }

  @media print {
    body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    @page { margin:10mm; size:A4 portrait; }
  }
</style>
</head>
<body>

<!-- ── Header ── -->
<div class="header">
  <div class="header-left">
    ${logoHtml}
    <div>
      <div class="company-sub">Agfin Services Limited</div>
    </div>
  </div>
  <div class="header-right">
    <div class="doc-title">Buyer Invoice</div>
    <div class="doc-sub">
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
      <div class="meta-label">Order Ref.</div>
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
      <div class="meta-label">Payment Terms</div>
      <div class="meta-value">${terms}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Hub</div>
      <div class="meta-value">${invoice.hub_name || "—"}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Paid On</div>
      <div class="meta-value">${fmtDate(invoice.paid_at)}</div>
    </div>
    <div class="meta-cell dark">
      <div class="meta-label">Status</div>
      <div class="meta-value">
        <span class="status-badge">${statusStyle.label}</span>
      </div>
    </div>
  </div>

  <!-- ── Parties ── -->
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
        ${invoice.hub_name ? `Hub: ${invoice.hub_name}<br/>` : ""}
        Uganda
      </div>
    </div>
  </div>

  <!-- ── Line items ── -->
  <div class="section-heading">Invoice Lines</div>
  <table class="line-table">
    <thead>
      <tr>
        <th style="width:55%">Description</th>
        <th>Order Ref.</th>
        <th>Terms</th>
        <th class="right">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="font-weight:700;">Grain Purchase — ${buyerName}</td>
        <td>${invoice.order_number || "—"}</td>
        <td>${terms}</td>
        <td style="text-align:right;font-weight:700;">${ugx(amountDue)}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td colspan="3" style="text-align:right;font-size:11px;color:#5c8abf;">Invoice Total</td>
        <td style="text-align:right;font-size:13px;font-weight:700;">${ugx(amountDue)}</td>
      </tr>
    </tfoot>
  </table>

  <!-- ── Bank instructions + Summary ── -->
  <div class="bottom-grid">

    <!-- Bank Instructions -->
    <div>
      <div class="section-heading">Bank Payment Instructions</div>
      <table class="bank-table">
        <tr><td class="bank-label">Bank Name</td><td class="bank-value">STANBIC BANK</td></tr>
        <tr><td class="bank-label">Account Number</td><td class="bank-value">9030026820951</td></tr>
        <tr><td class="bank-label">Account Holder</td><td class="bank-value">BENNU AGFIN SERVICES LIMITED</td></tr>
        <tr><td class="bank-label">Branch</td><td class="bank-value">NAKASERO</td></tr>
        <tr><td class="bank-label">Currency</td><td class="bank-value">UGX</td></tr>
        <tr><td class="bank-label">Reference</td><td class="bank-value">${invoice.invoice_number}</td></tr>
      </table>

      <!-- Payment progress -->
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

    <!-- Summary -->
    <div>
      <div class="section-heading">Payment Summary</div>
      <div class="summary-box">
        <div class="summary-row sub">
          <span class="s-label">Invoice Amount</span>
          <span class="s-value">${ugx(amountDue)}</span>
        </div>
        ${amountPaid > 0 ? `
        <div class="summary-row paid">
          <span class="s-label">Amount Paid</span>
          <span class="s-value">− ${ugx(amountPaid)}</span>
        </div>` : ""}
        <div class="summary-row balance">
          <span class="s-label">Balance Due</span>
          <span class="s-value">${ugx(balanceDue)}</span>
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

// ─── PDF Button ───────────────────────────────────────────────────────────────

interface BuyerInvoicePDFButtonProps {
  invoice: IBuyerInvoice & { hub_name?: string };
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

      const data: BuyerInvoiceHTMLData = {
        invoice_number:    invoice.invoice_number,
        order_number:      invoice.order_number,
        buyer_name:        invoice.buyer_name,
        buyer_profile_name:(invoice as any).buyer_profile_name,
        hub_name:          (invoice as any).hub_name,
        amount_due:        invoice.amount_due,
        amount_paid:       invoice.amount_paid,
        balance_due:       invoice.balance_due,
        payment_terms_days:invoice.payment_terms_days,
        issued_at:         invoice.issued_at,
        due_date:          invoice.due_date,
        paid_at:           invoice.paid_at,
        status:            invoice.status,
        is_overdue:        invoice.is_overdue,
        notes:             invoice.notes,
      };

      const html = generateBuyerInvoiceHTML(data, logoDataUrl);
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