/**
 * PaymentReceiptPDFButton.tsx — REWRITTEN
 *
 * ✅ Now uses the same HTML → window.open → print pattern as SupplierInvoicePDF
 *    and BuyerInvoicePDF, matching the exact visual style:
 *    - Blue header with Bennu branding
 *    - Gradient accent bar
 *    - Meta strip with receipt details
 *    - Parties section (From / To)
 *    - Amount highlight box
 *    - Payment details table
 *    - Notes section
 *    - Footer
 */

import React, { useState } from "react";
import { Button, CircularProgress, Tooltip } from "@mui/material";
import ReceiptIcon from "@mui/icons-material/Receipt";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ugx = (val: number | string): string => {
  const n = Number(val || 0);
  return `UGX ${n.toLocaleString("en-UG", { minimumFractionDigits: 0 })}`;
};

const fmtDate = (d?: string | null): string => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return d; }
};

const fmtDateTime = (d?: string | null): string => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    } as any);
  } catch { return d; }
};

const methodLabel = (method: string): string => {
  const map: Record<string, string> = {
    mobile_money: "Mobile Money",
    bank_transfer: "Bank Transfer",
    cash: "Cash",
    check: "Cheque",
    cheque: "Cheque",
  };
  return map[method?.toLowerCase()] ||
    method?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "—";
};

// ─── Fetch logo as base64 (same as invoice PDFs) ────────────────────────────

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

// ─── HTML Generator ──────────────────────────────────────────────────────────

interface ReceiptData {
  payment_number: string;
  type: "buyer" | "supplier";
  payer_name: string;
  amount: number;
  method: string;
  reference: string;
  invoice_number: string;
  payment_date: string;
  confirmed_at?: string | null;
  status: string;
  notes?: string;
  // Optional enrichment
  order_number?: string;
  hub_name?: string;
  grain_type?: string;
  quantity_kg?: number;
}

const generateReceiptHTML = (
  receipt: ReceiptData,
  logoDataUrl?: string
): string => {
  const isBuyer = receipt.type === "buyer";
  const docTitle = isBuyer ? "Payment Receipt" : "Payment Receipt";
  const partyRole = isBuyer ? "Received From" : "Paid To";
  const partyColor = isBuyer ? "#15803d" : "#e65100";
  const amountLabel = isBuyer ? "Amount Received" : "Amount Paid";

  // Status styling
  const statusColorMap: Record<string, { bg: string; color: string }> = {
    confirmed: { bg: "#1b5e20", color: "#fff" },
    completed: { bg: "#1b5e20", color: "#fff" },
    pending:   { bg: "#e65100", color: "#fff" },
    failed:    { bg: "#c62828", color: "#fff" },
    reversed:  { bg: "#424242", color: "#fff" },
  };
  const statusStyle = statusColorMap[receipt.status] ?? { bg: "#424242", color: "#fff" };
  const statusLabel = (receipt.status || "PENDING").toUpperCase();

  // Logo
  const logoHtml = logoDataUrl
    ? `<img src="${logoDataUrl}" alt="Bennu Logo" style="height:38px; width:auto; object-fit:contain;" />`
    : `<div style="width:38px;height:38px;background:#2371B9;border-radius:6px;display:flex;align-items:center;justify-content:center;">
         <span style="color:#fff;font-weight:900;font-size:15px;">B</span>
       </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${docTitle} — ${receipt.payment_number}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    font-size: 11px;
    color: #1a1a1a;
    background: #fff;
    line-height: 1.4;
  }

  /* ── Header ── */
  .header {
    background: #2371B9;
    color: #fff;
    padding: 10px 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .header-left { display: flex; align-items: center; gap: 14px; }
  .header-brand .company-sub {
    font-size: 9px; color: rgba(255,255,255,0.7); letter-spacing: 1.5px;
    text-transform: uppercase; margin-top: 2px;
  }
  .header-right { text-align: right; }
  .doc-title {
    font-size: 18px; font-weight: 800; letter-spacing: 3px;
    color: #fff; text-transform: uppercase;
  }
  .doc-subtitle {
    font-size: 10px; color: rgba(255,255,255,0.65);
    margin-top: 3px; letter-spacing: 0.5px;
  }

  /* ── Accent ── */
  .accent-bar {
    height: 2px;
    background: linear-gradient(90deg, #1a5fa0 0%, #5ba3e0 50%, #2371B9 100%);
  }

  /* ── Body ── */
  .body { padding: 12px 18px; }

  /* ── Meta strip ── */
  .meta-strip {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    border: 1px solid #e8e8e8;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 12px;
  }
  .meta-cell {
    padding: 6px 8px;
    border-right: 1px solid #e8e8e8;
    background: #fafafa;
  }
  .meta-cell:last-child { border-right: none; }
  .meta-cell.highlight { background: #2371B9; color: #fff; }
  .meta-label {
    font-size: 8px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.8px; color: #5c8abf; margin-bottom: 2px;
  }
  .meta-cell.highlight .meta-label { color: rgba(255,255,255,0.6); }
  .meta-value { font-size: 11px; font-weight: 600; color: #1a1a1a; }
  .meta-cell.highlight .meta-value { color: #fff; }

  /* ── Status badge ── */
  .status-badge {
    display: inline-block;
    padding: 2px 7px;
    border-radius: 3px;
    font-size: 9px;
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
    gap: 10px;
    margin-bottom: 10px;
  }
  .party-card {
    border: 1px solid #e8e8e8;
    border-radius: 6px;
    padding: 7px 10px;
  }
  .party-card.issuer { border-left: 3px solid #2371B9; }
  .party-card.payee  { border-left: 3px solid ${partyColor}; }
  .party-role {
    font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1px; margin-bottom: 4px;
  }
  .party-card.issuer .party-role { color: #2371B9; }
  .party-card.payee .party-role  { color: ${partyColor}; }
  .party-name { font-size: 11px; font-weight: 700; margin-bottom: 2px; }
  .party-detail { font-size: 10px; color: #666; line-height: 1.5; }

  /* ── Amount box ── */
  .amount-box {
    background: #2371B9; color: #fff;
    text-align: center; padding: 12px 16px;
    border-radius: 6px; margin-bottom: 12px;
  }
  .amount-label {
    font-size: 9px; text-transform: uppercase; letter-spacing: 2px;
    color: rgba(255,255,255,0.7); font-weight: 700;
  }
  .amount-value {
    font-size: 22px; font-weight: 800; color: #fff; margin-top: 4px;
  }

  /* ── Section heading ── */
  .section-heading {
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1px; color: #5c8abf;
    border-bottom: 2px solid #e0e8f4;
    padding-bottom: 4px; margin-bottom: 8px;
  }

  /* ── Detail rows ── */
  .details { border: 1px solid #e0e8f4; border-radius: 6px; overflow: hidden; margin-bottom: 10px; }
  .detail-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 6px 10px; border-bottom: 1px solid #f0f4fa; font-size: 11px;
  }
  .detail-row:last-child { border-bottom: none; }
  .detail-row .label { color: #888; }
  .detail-row .value { font-weight: 700; }
  .detail-row.highlight {
    background: #f6f9fd;
  }
  .detail-row.highlight .value { color: #2371B9; }

  /* ── Summary box ── */
  .summary-box { border: 1px solid #e0e8f4; border-radius: 6px; overflow: hidden; margin-bottom: 10px; }
  .summary-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 6px 10px; border-bottom: 1px solid #f0f4fa; font-size: 11px;
  }
  .summary-row:last-child { border-bottom: none; }
  .summary-row .label { color: #555; }
  .summary-row .value { font-weight: 600; }
  .summary-row.total {
    background: #2371B9; color: #fff; padding: 8px 10px;
  }
  .summary-row.total .label {
    color: rgba(255,255,255,0.7); font-weight: 600; font-size: 11px;
    text-transform: uppercase; letter-spacing: 0.5px;
  }
  .summary-row.total .value { color: #fff; font-weight: 800; font-size: 14px; }

  /* ── Notes ── */
  .notes-box {
    margin-top: 0; padding: 6px 10px;
    border: 1px solid #e0e8f4; border-radius: 6px;
    background: #f6f9fd; font-size: 10px; color: #555;
    margin-bottom: 10px;
  }
  .notes-box strong {
    display: block; font-size: 10px; text-transform: uppercase;
    letter-spacing: 0.8px; color: #5c8abf; margin-bottom: 4px;
  }

  /* ── Footer ── */
  .footer {
    margin-top: 8px; padding-top: 8px;
    border-top: 1px solid #e0e8f4;
    display: flex; justify-content: space-between; align-items: flex-end;
    font-size: 10px; color: #999;
  }
  .footer .stamp {
    background: #2371B9; color: #fff;
    padding: 4px 10px; border-radius: 3px;
    font-size: 8px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
  }

  @media print {
    @page { margin: 6mm; size: A4 portrait; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>

<!-- ── Header ── -->
<div class="header">
  <div class="header-left">
    ${logoHtml}
  </div>
  <div class="header-right">
    <div class="doc-title">${docTitle}</div>
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
      <div class="meta-label">Receipt No.</div>
      <div class="meta-value">${receipt.payment_number}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Invoice No.</div>
      <div class="meta-value">${receipt.invoice_number || "—"}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Payment Date</div>
      <div class="meta-value">${fmtDate(receipt.payment_date)}</div>
    </div>
    <div class="meta-cell highlight">
      <div class="meta-label">Status</div>
      <div class="meta-value"><span class="status-badge">${statusLabel}</span></div>
    </div>
  </div>

  <!-- ── Parties ── -->
  <div class="parties">
    <div class="party-card issuer">
      <div class="party-role">${isBuyer ? "Received By" : "Paid By"}</div>
      <div class="party-name">Bennu Agfin Services Limited</div>
      <div class="party-detail">
        Plot 16 Mackinnon Road, Nakasero<br/>
        P.O. Box 19298, Kampala, Uganda<br/>
        info@bennu.ug
      </div>
    </div>
    <div class="party-card payee">
      <div class="party-role">${partyRole}</div>
      <div class="party-name">${receipt.payer_name}</div>
      <div class="party-detail">
        ${receipt.hub_name ? `Destination Warehouse: ${receipt.hub_name}<br/>` : ""}
        ${receipt.grain_type ? `Grain: ${receipt.grain_type}` : ""}
        ${receipt.quantity_kg ? ` · ${Number(receipt.quantity_kg).toLocaleString("en-UG")} KG` : ""}
      </div>
    </div>
  </div>

  <!-- ── Amount highlight ── -->
  <div class="amount-box">
    <div class="amount-label">${amountLabel}</div>
    <div class="amount-value">${ugx(receipt.amount)}</div>
  </div>

  <!-- ── Payment details ── -->
  <div class="section-heading">Payment Details</div>
  <div class="details">
    <div class="detail-row">
      <span class="label">Receipt Number</span>
      <span class="value">${receipt.payment_number}</span>
    </div>
    <div class="detail-row">
      <span class="label">Type</span>
      <span class="value">${isBuyer ? "Buyer Payment" : "Supplier Payment"}</span>
    </div>
    <div class="detail-row">
      <span class="label">${partyRole}</span>
      <span class="value">${receipt.payer_name}</span>
    </div>
    <div class="detail-row">
      <span class="label">Invoice Number</span>
      <span class="value">${receipt.invoice_number || "—"}</span>
    </div>
    ${receipt.order_number ? `
    <div class="detail-row">
      <span class="label">Order Number</span>
      <span class="value">${receipt.order_number}</span>
    </div>` : ""}
    <div class="detail-row highlight">
      <span class="label">Payment Method</span>
      <span class="value">${methodLabel(receipt.method)}</span>
    </div>
    <div class="detail-row highlight">
      <span class="label">Reference Number</span>
      <span class="value">${receipt.reference || "—"}</span>
    </div>
    <div class="detail-row">
      <span class="label">Payment Date</span>
      <span class="value">${fmtDate(receipt.payment_date)}</span>
    </div>
    ${receipt.confirmed_at ? `
    <div class="detail-row">
      <span class="label">Confirmed At</span>
      <span class="value">${fmtDateTime(receipt.confirmed_at)}</span>
    </div>` : ""}
  </div>

  <!-- ── Summary ── -->
  <div class="summary-box">
    <div class="summary-row total">
      <span class="label">${amountLabel}</span>
      <span class="value">${ugx(receipt.amount)}</span>
    </div>
  </div>

  ${receipt.notes ? `
  <!-- ── Notes ── -->
  <div class="notes-box">
    <strong>Notes</strong>
    ${receipt.notes}
  </div>
  ` : ""}

  <!-- ── Signature Block ── -->
  <div style="margin-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:40px;">
    <div style="border-top:1px solid #1a1a1a;padding-top:4px;text-align:center;font-size:10px;color:#555;">
      Issued By (Authorized Signature)
    </div>
    <div style="border-top:1px solid #1a1a1a;padding-top:4px;text-align:center;font-size:10px;color:#555;">
      Received By (Customer Signature)
    </div>
  </div>

  <!-- ── Footer ── -->
  <div class="footer">
    <div>
      Bennu Agfin Services Limited · Plot 16 Mackinnon Road, Nakasero, Kampala, Uganda<br/>
      Generated on ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
    </div>
    <div class="stamp">${receipt.payment_number}</div>
  </div>

</div>
</body>
</html>`;
};


// ─── Button Component ────────────────────────────────────────────────────────

interface PaymentReceiptPDFButtonProps {
  payment: {
    payment_number: string;
    amount: number;
    method: string;
    method_display?: string;
    reference_number: string;
    invoice_number?: string;
    order_number?: string;
    // ✅ FIX: Accept multiple possible name fields for robust resolution
    buyer_name?: string;
    supplier_name?: string;
    // Nested objects the API may return
    supplier_invoice?: any;
    buyer_invoice?: any;
    processed_by_detail?: any;
    hub_name?: string;
    grain_type_name?: string;
    quantity_kg?: number;
    payment_date: string;
    confirmed_at?: string | null;
    status: string;
    notes?: string;
    // catch-all for any extra fields
    [key: string]: any;
  };
  type: "buyer" | "supplier";
  size?: "small" | "medium" | "large";
  compact?: boolean;
}

// ✅ FIX: Helper to resolve supplier name from multiple possible paths
const resolveSupplierName = (payment: any): string => {
  // Direct flat field
  if (payment.supplier_name) return payment.supplier_name;
  // From supplier_invoice → supplier detail
  const si = payment.supplier_invoice;
  if (si) {
    if (typeof si === "object") {
      if (si.supplier_name) return si.supplier_name;
      if (si.supplier?.business_name) return si.supplier.business_name;
      if (si.supplier_detail?.business_name) return si.supplier_detail.business_name;
    }
  }
  // From source_order → supplier
  const so = payment.source_order;
  if (so && typeof so === "object") {
    if (so.supplier_name) return so.supplier_name;
    if (so.supplier?.business_name) return so.supplier.business_name;
  }
  return "Supplier";
};

// ✅ FIX: Helper to resolve buyer name from multiple possible paths
const resolveBuyerName = (payment: any): string => {
  if (payment.buyer_name) return payment.buyer_name;
  const bi = payment.buyer_invoice;
  if (bi && typeof bi === "object") {
    if (bi.buyer_name) return bi.buyer_name;
    if (bi.buyer_order?.buyer_name) return bi.buyer_order.buyer_name;
    if (bi.buyer_profile?.business_name) return bi.buyer_profile.business_name;
  }
  return "Buyer";
};

const PaymentReceiptPDFButton: React.FC<PaymentReceiptPDFButtonProps> = ({
  payment, type, size = "small", compact = false,
}) => {
  const [loading, setLoading] = useState(false);

  const handlePrint = async () => {
    setLoading(true);
    try {
      const logoDataUrl = await fetchLogoAsDataUrl();

      // ✅ FIX: Use resolver functions to find name from any available path
      const data: ReceiptData = {
        payment_number: payment.payment_number,
        type,
        payer_name: type === "buyer"
          ? resolveBuyerName(payment)
          : resolveSupplierName(payment),
        amount: Number(payment.amount),
        method: payment.method_display || payment.method,
        reference: payment.reference_number || "—",
        invoice_number: payment.invoice_number
          || payment.supplier_invoice?.invoice_number
          || payment.buyer_invoice?.invoice_number
          || "—",
        payment_date: payment.payment_date,
        confirmed_at: payment.confirmed_at,
        status: payment.status,
        notes: payment.notes,
        order_number: payment.order_number
          || payment.source_order_number
          || (typeof payment.source_order === "object" ? payment.source_order?.order_number : undefined),
        hub_name: payment.hub_name,
        grain_type: payment.grain_type_name,
        quantity_kg: payment.quantity_kg,
      };

      const html = generateReceiptHTML(data, logoDataUrl);
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
    <Tooltip title={`Print receipt ${payment.payment_number}`}>
      <Button
        size={size}
        variant={compact ? "text" : "outlined"}
        color="primary"
        onClick={handlePrint}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <ReceiptIcon />}
      >
        {compact ? "" : loading ? "Generating…" : "Receipt"}
      </Button>
    </Tooltip>
  );
};

export default PaymentReceiptPDFButton;