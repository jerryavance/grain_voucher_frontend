/**
 * BuyerContractPDFButton.tsx
 *
 * Print-to-PDF for BuyerContract documents. Same HTML→print-window pattern
 * as ProformaInvoicePDFButton, styled as a formal multi-delivery commercial
 * contract.
 *
 * Usage:
 *   <BuyerContractPDFButton contract={contract} orders={orders} />
 *   <BuyerContractPDFButton contract={contract} compact />
 */

import React, { useState } from "react";
import { Button, CircularProgress, IconButton, Tooltip } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { IBuyerContract, IBuyerOrder } from "./Sourcing.interface";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtMoney = (val: number | string | null | undefined, currency = "UGX"): string => {
  const n = Number(val || 0);
  const formatted = n.toLocaleString("en-UG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${currency} ${formatted}`;
};

const fmtDate = (d?: string | null): string => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return d; }
};

const fmtKg = (kg: string | number): string => {
  const n = Number(kg || 0);
  return n.toLocaleString("en-UG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtMT = (kg: string | number): string => {
  const n = Number(kg || 0) / 1000;
  return n.toLocaleString("en-UG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

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

// ─── HTML generator ───────────────────────────────────────────────────────────

export const generateContractHTML = (
  contract: IBuyerContract,
  orders: IBuyerOrder[] = [],
  logoDataUrl?: string,
): string => {
  const currency = contract.currency || "UGX";
  const unitLabel = contract.trade_unit === "tonne" ? "MT" : "kg";
  const qtyDisplay = contract.trade_unit === "tonne"
    ? `${fmtMT(contract.contracted_quantity_kg)} ${unitLabel}`
    : `${fmtKg(contract.contracted_quantity_kg)} ${unitLabel}`;
  const deliveredDisplay = contract.trade_unit === "tonne"
    ? `${fmtMT(contract.delivered_quantity_kg)} ${unitLabel}`
    : `${fmtKg(contract.delivered_quantity_kg)} ${unitLabel}`;
  const remainingDisplay = contract.trade_unit === "tonne"
    ? `${fmtMT(contract.remaining_quantity_kg)} ${unitLabel}`
    : `${fmtKg(contract.remaining_quantity_kg)} ${unitLabel}`;
  const pct = Math.min(Number(contract.fulfillment_pct || 0), 100);
  const statusText = (contract.status_display || contract.status || "").toUpperCase();
  const statusColor: Record<string, string> = {
    DRAFT: "#9e9e9e", ACTIVE: "#1976d2", COMPLETED: "#2e7d32", CANCELLED: "#c62828",
  };
  const statusBg = statusColor[statusText] || "#1976d2";
  const buyerBusinessName = contract.buyer_detail?.business_name || contract.buyer_name || "—";

  const ordersRows = orders.length === 0
    ? `<tr><td colspan="6" style="text-align:center;color:#888;padding:14px;">No delivery orders attached yet</td></tr>`
    : orders.map((o, i) => `
      <tr>
        <td>${i + 1}</td>
        <td style="font-family:monospace;font-weight:600;">${o.order_number}</td>
        <td style="text-transform:uppercase;font-size:10px;">${o.status || "—"}</td>
        <td style="text-align:right;">${fmtKg(o.quantity_requested_kg ?? 0)} kg</td>
        <td style="text-align:right;">${fmtMoney(o.subtotal, o.currency || currency)}</td>
        <td>${fmtDate(o.created_at)}</td>
      </tr>
    `).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Contract ${contract.contract_number}</title>
  <style>
    @media print {
      @page { size: A4; margin: 14mm; }
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; margin: 0; padding: 24px; font-size: 12px; }
    .wrap { max-width: 800px; margin: 0 auto; }

    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1976d2; padding-bottom: 14px; margin-bottom: 18px; }
    .header .left { display: flex; gap: 12px; align-items: center; }
    .header .logo { width: 56px; height: 56px; border-radius: 8px; background: #f0f4fa; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .header .logo img { width: 100%; height: 100%; object-fit: contain; }
    .header h1 { font-size: 22px; margin: 0; color: #1976d2; letter-spacing: 0.5px; }
    .header .sub { font-size: 11px; color: #555; margin-top: 2px; }
    .header .meta { text-align: right; font-size: 11px; color: #555; }
    .header .ref { font-family: monospace; font-weight: 700; color: #1a1a1a; font-size: 13px; }
    .status-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 10px; font-weight: 700; color: #fff; background: ${statusBg}; margin-top: 4px; letter-spacing: 0.5px; }

    .section-heading { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #1976d2; margin: 18px 0 6px; border-bottom: 1px solid #e0e8f4; padding-bottom: 4px; }

    .party-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
    .party-card { background: #f8fafd; border: 1px solid #e0e8f4; border-radius: 6px; padding: 10px 12px; }
    .party-role { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #5c8abf; margin-bottom: 4px; }
    .party-name { font-size: 13px; font-weight: 700; }
    .party-detail { font-size: 10px; color: #555; line-height: 1.5; margin-top: 2px; }

    .terms-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px; }
    .term-card { background: #f6f9fd; border: 1px solid #e0e8f4; border-radius: 6px; padding: 6px 9px; }
    .term-label { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #5c8abf; margin-bottom: 2px; }
    .term-value { font-size: 11px; font-weight: 600; }

    .data-table { width: 100%; border-collapse: collapse; margin-top: 4px; font-size: 11px; }
    .data-table th { background: #1976d2; color: #fff; padding: 7px 8px; text-align: left; font-weight: 700; font-size: 10px; letter-spacing: 0.3px; }
    .data-table td { padding: 6px 8px; border-bottom: 1px solid #e8eef5; }
    .data-table .r { text-align: right; }
    .data-table tr:nth-child(even) td { background: #fafcfe; }

    .totals { margin-top: 8px; }
    .totals .row { display: flex; justify-content: space-between; padding: 6px 12px; font-size: 11px; border-bottom: 1px dashed #e0e8f4; }
    .totals .row.grand { font-size: 13px; font-weight: 700; color: #1976d2; border-top: 2px solid #1976d2; border-bottom: 2px solid #1976d2; margin-top: 4px; padding: 8px 12px; background: #f6f9fd; }

    .progress-block { margin-top: 10px; padding: 10px 12px; background: #f8fafd; border: 1px solid #e0e8f4; border-radius: 6px; }
    .progress-label { display:flex;justify-content:space-between; font-size: 11px; font-weight: 600; margin-bottom: 4px; }
    .progress-bar { width: 100%; height: 8px; background: #e0e8f4; border-radius: 4px; overflow: hidden; }
    .progress-fill { height: 100%; background: ${pct >= 100 ? "#2e7d32" : pct >= 60 ? "#1976d2" : "#ed6c02"}; width: ${pct}%; }
    .progress-detail { font-size: 9px; color: #666; margin-top: 4px; }

    .notes-block { margin-top: 14px; padding: 10px 12px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; font-size: 11px; color: #6b4f00; }

    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 36px; }
    .sig-block { border-top: 1px solid #1a1a1a; padding-top: 4px; font-size: 11px; }
    .sig-block .role { font-size: 9px; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 0.8px; }
    .sig-block .name { font-weight: 600; margin-top: 16px; }

    .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #e0e8f4; font-size: 9px; color: #888; text-align: center; }
  </style>
</head>
<body>
  <div class="wrap">

    <!-- Header -->
    <div class="header">
      <div class="left">
        <div class="logo">
          ${logoDataUrl ? `<img src="${logoDataUrl}" alt="logo"/>` : `<div style="font-weight:700;color:#1976d2;">B</div>`}
        </div>
        <div>
          <h1>COMMERCIAL CONTRACT</h1>
          <div class="sub">Bennu Agfin Services Limited</div>
          <div class="sub">Plot 16 Mackinnon Road, Nakasero · Kampala, Uganda</div>
        </div>
      </div>
      <div class="meta">
        <div>Contract No.</div>
        <div class="ref">${contract.contract_number}</div>
        <div style="margin-top:6px;">Issued: ${fmtDate(contract.created_at)}</div>
        <div class="status-badge">${statusText}</div>
      </div>
    </div>

    <!-- Parties -->
    <div class="party-grid">
      <div class="party-card">
        <div class="party-role">Seller</div>
        <div class="party-name">Bennu Agfin Services Ltd</div>
        <div class="party-detail">
          Plot 16 Mackinnon Road, Nakasero<br/>
          Kampala, Uganda
        </div>
      </div>
      <div class="party-card">
        <div class="party-role">Buyer</div>
        <div class="party-name">${buyerBusinessName}</div>
        <div class="party-detail">
          ${contract.buyer_detail?.contact_name || "—"}<br/>
          ${contract.buyer_detail?.phone || ""}${contract.buyer_detail?.email ? ` · ${contract.buyer_detail.email}` : ""}
        </div>
      </div>
    </div>

    <!-- Headline terms -->
    <div class="terms-grid">
      <div class="term-card">
        <div class="term-label">Product</div>
        <div class="term-value">${contract.grain_type_name || "—"}</div>
      </div>
      <div class="term-card">
        <div class="term-label">Delivery Hub</div>
        <div class="term-value">${contract.hub_name || "—"}</div>
      </div>
      <div class="term-card">
        <div class="term-label">Trade Unit</div>
        <div class="term-value">${unitLabel}</div>
      </div>
      <div class="term-card">
        <div class="term-label">Contracted Volume</div>
        <div class="term-value">${qtyDisplay}</div>
      </div>
      <div class="term-card">
        <div class="term-label">Price per ${unitLabel}</div>
        <div class="term-value">${fmtMoney(contract.contracted_price_per_unit, currency)}</div>
      </div>
      <div class="term-card">
        <div class="term-label">Currency</div>
        <div class="term-value">${contract.currency_display || currency}</div>
      </div>
      <div class="term-card">
        <div class="term-label">Payment Terms</div>
        <div class="term-value">${contract.payment_terms_days === 0 ? "On delivery" : `Net ${contract.payment_terms_days} days`}</div>
      </div>
      <div class="term-card">
        <div class="term-label">Delivery Window</div>
        <div class="term-value">${contract.delivery_start_date ? fmtDate(contract.delivery_start_date) : "—"} → ${contract.delivery_end_date ? fmtDate(contract.delivery_end_date) : "—"}</div>
      </div>
      <div class="term-card">
        <div class="term-label">${contract.currency !== "UGX" ? "FX Rate to UGX" : "Currency Note"}</div>
        <div class="term-value">${contract.currency !== "UGX" && contract.exchange_rate_to_ugx ? `1 ${currency} = UGX ${Number(contract.exchange_rate_to_ugx).toLocaleString()}` : "—"}</div>
      </div>
    </div>

    <!-- Contract value summary -->
    <div class="section-heading">Contract Value</div>
    <div class="totals">
      <div class="row">
        <span>Volume × Price</span>
        <span>${qtyDisplay} × ${fmtMoney(contract.contracted_price_per_unit, currency)}/${unitLabel}</span>
      </div>
      <div class="row grand">
        <span>Total Contract Value</span>
        <span>${fmtMoney(contract.contracted_total_value, currency)}</span>
      </div>
    </div>

    <!-- Fulfillment progress -->
    <div class="section-heading">Delivery Progress</div>
    <div class="progress-block">
      <div class="progress-label">
        <span>${deliveredDisplay} delivered of ${qtyDisplay}</span>
        <span>${pct.toFixed(1)}%</span>
      </div>
      <div class="progress-bar"><div class="progress-fill"></div></div>
      <div class="progress-detail">
        Remaining: ${remainingDisplay} · ${contract.child_order_count || 0} delivery order${contract.child_order_count === 1 ? "" : "s"}
      </div>
    </div>

    <!-- Financial summary -->
    <div class="section-heading">Financial Summary</div>
    <div class="totals">
      <div class="row">
        <span>Total Invoiced</span>
        <span>${fmtMoney(contract.total_invoiced, currency)}</span>
      </div>
      <div class="row">
        <span>Total Paid</span>
        <span>${fmtMoney(contract.total_paid, currency)}</span>
      </div>
      <div class="row">
        <span>Outstanding Balance</span>
        <span>${fmtMoney(contract.total_balance_due, currency)}</span>
      </div>
      <div class="row">
        <span>Gross Profit (UGX)</span>
        <span>${fmtMoney(contract.total_gross_profit, "UGX")}</span>
      </div>
    </div>

    <!-- Delivery orders attached -->
    <div class="section-heading">Delivery Orders Attached</div>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width:30px;">#</th>
          <th>Order #</th>
          <th>Status</th>
          <th class="r">Quantity</th>
          <th class="r">Subtotal</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>${ordersRows}</tbody>
    </table>

    ${contract.notes ? `
    <!-- Notes -->
    <div class="notes-block">
      <strong>Notes:</strong> ${contract.notes.replace(/\n/g, "<br/>")}
    </div>` : ""}

    <!-- General terms -->
    <div class="section-heading">General Terms</div>
    <div style="font-size:10px;color:#444;line-height:1.55;">
      <p>1. This contract represents the agreed commercial commitment between the Seller and Buyer for the total volume above. Deliveries shall be made in multiple truckloads, each evidenced by a separate Buyer Order and Commercial Invoice linked to this contract.</p>
      <p>2. Title to the goods passes to the Buyer on issuance of the Commercial Invoice for each delivery.</p>
      <p>3. Payment terms apply per delivery invoice. Payment shall be made into the Seller's designated bank account by the invoice due date.</p>
      <p>4. Any change to volume, price or delivery window must be agreed in writing and recorded as a contract amendment.</p>
      <p>5. Disputes shall be resolved amicably; failing which, the laws of Uganda shall apply.</p>
    </div>

    <!-- Signatures -->
    <div class="signatures">
      <div class="sig-block">
        <div class="role">For Seller — Bennu Agfin Services Ltd</div>
        <div class="name">Authorised Signatory</div>
        <div style="font-size:10px;color:#888;">Date: __________________</div>
      </div>
      <div class="sig-block">
        <div class="role">For Buyer — ${buyerBusinessName}</div>
        <div class="name">Authorised Signatory</div>
        <div style="font-size:10px;color:#888;">Date: __________________</div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      Generated ${fmtDate(new Date().toISOString())} · This document is a contractual record. Retain for your files.
    </div>

  </div>
</body>
</html>`;
};

// ─── PDF Button ───────────────────────────────────────────────────────────────

interface BuyerContractPDFButtonProps {
  contract: IBuyerContract;
  orders?: IBuyerOrder[];
  compact?: boolean;
  size?: "small" | "medium" | "large";
}

const BuyerContractPDFButton: React.FC<BuyerContractPDFButtonProps> = ({
  contract, orders = [], compact = false, size = "small",
}) => {
  const [loading, setLoading] = useState(false);

  const handlePrint = async () => {
    setLoading(true);
    try {
      const logoDataUrl = await fetchLogoAsDataUrl();
      const html = generateContractHTML(contract, orders, logoDataUrl);
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
      <Tooltip title={`Print / PDF — ${contract.contract_number}`}>
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

export default BuyerContractPDFButton;
