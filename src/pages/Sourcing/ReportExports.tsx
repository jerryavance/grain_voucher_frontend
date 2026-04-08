/**
 * ReportExports.tsx
 * =================
 * Export system for all Financial Report tabs.
 *
 * Provides:
 *  - exportToCSV()        — browser-native CSV download
 *  - exportToExcel()      — XLS-compatible HTML table download
 *  - printReportPDF()     — beautiful branded print window (A4 PDF-ready)
 *  - <ReportExportBar />  — drop-in toolbar component for Reports.tsx
 *
 * Usage in Reports.tsx:
 *   import { ReportExportBar } from "./ReportExports";
 *   <ReportExportBar tab={tab} data={data} loading={loading} />
 */

import React, { useState, FC } from "react";
import {
  Button, ButtonGroup, CircularProgress, Divider, ListItemIcon,
  ListItemText, Menu, MenuItem, Tooltip, alpha,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import TableViewIcon from "@mui/icons-material/TableView";
import DescriptionIcon from "@mui/icons-material/Description";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExportColumn { header: string; key: string }

// ─── Shared helpers ────────────────────────────────────────────────────────────

const deepGet = (obj: any, path: string): any =>
  path.split(".").reduce((o, k) => (o != null ? o[k] : ""), obj) ?? "";

const fmtN = (v: any) => {
  const n = parseFloat(String(v));
  return isNaN(n) ? "—" : n.toLocaleString("en-UG", { minimumFractionDigits: 0 });
};
const fmtUGX = (v: any) => `UGX ${fmtN(v)}`;
const fmtPct = (v: any) => `${parseFloat(String(v) || "0").toFixed(1)}%`;
const fmtDate = (v: any) => {
  if (!v) return "—";
  try { return new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return v; }
};

// ─── CSV ──────────────────────────────────────────────────────────────────────

export function exportToCSV(rows: any[], columns: ExportColumn[], filename: string) {
  if (!rows?.length) return;
  const esc = (v: any) => {
    const s = String(v ?? "").replace(/"/g, '""');
    return /[,"\n]/.test(s) ? `"${s}"` : s;
  };
  const lines = [
    columns.map(c => esc(c.header)).join(","),
    ...rows.map(r => columns.map(c => esc(deepGet(r, c.key))).join(",")),
  ].join("\n");
  const blob = new Blob(["\ufeff" + lines], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `${filename}_${today()}.csv`);
}

// ─── Excel ────────────────────────────────────────────────────────────────────

export function exportToExcel(rows: any[], columns: ExportColumn[], filename: string) {
  if (!rows?.length) return;
  let t = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:x="urn:schemas-microsoft-com:office:excel"
    xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="UTF-8">
    <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets>
    <x:ExcelWorksheet><x:Name>${filename}</x:Name>
    <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
    </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
    </head><body><table border="1">`;
  t += "<tr>" + columns.map(c =>
    `<th style="background:#1a5fa0;color:#fff;font-weight:bold;padding:8px;font-family:Calibri;">${c.header}</th>`
  ).join("") + "</tr>";
  rows.forEach((r, i) => {
    t += `<tr style="background:${i % 2 ? "#f0f4fa" : "#fff"};">` +
      columns.map(c => `<td style="padding:6px;font-family:Calibri;">${String(deepGet(r, c.key) ?? "")}</td>`).join("") +
      "</tr>";
  });
  t += "</table></body></html>";
  triggerDownload(new Blob([t], { type: "application/vnd.ms-excel;charset=utf-8;" }), `${filename}_${today()}.xls`);
}

// ─── PDF print helpers ────────────────────────────────────────────────────────

const today = () => new Date().toISOString().split("T")[0];

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

const PDF_BASE_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'DM Sans','Helvetica Neue',sans-serif;font-size:11px;color:#0f172a;background:#fff;line-height:1.5;}
.hdr{background:linear-gradient(135deg,#1a3a6b 0%,#2371B9 60%,#3b82f6 100%);padding:20px 32px;display:flex;justify-content:space-between;align-items:center;}
.hdr-brand{display:flex;align-items:center;gap:12px;}
.hdr-logo{width:44px;height:44px;background:rgba(255,255,255,0.15);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:#fff;border:1.5px solid rgba(255,255,255,0.3);}
.hdr-name{font-size:15px;font-weight:700;color:#fff;}
.hdr-sub{font-size:9px;color:rgba(255,255,255,0.6);letter-spacing:1.5px;text-transform:uppercase;margin-top:2px;}
.hdr-right{text-align:right;}
.hdr-title{font-size:20px;font-weight:700;color:#fff;letter-spacing:2px;text-transform:uppercase;}
.hdr-date{font-size:9px;color:rgba(255,255,255,0.6);margin-top:4px;}
.accent{height:3px;background:linear-gradient(90deg,#1e40af,#60a5fa,#2371B9);}
.body{padding:24px 32px;}
.summary-grid{display:grid;gap:10px;margin-bottom:20px;}
.card{background:#f8faff;border:1px solid #dbeafe;border-radius:8px;padding:12px 14px;}
.card-label{font-size:8.5px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-bottom:3px;}
.card-value{font-size:14px;font-weight:700;color:#0f172a;}
.section-title{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#2371B9;border-bottom:2px solid #dbeafe;padding-bottom:5px;margin:16px 0 10px;}
table{width:100%;border-collapse:collapse;}
thead tr{background:#1a3a6b;}
thead th{padding:7px 9px;color:#fff;font-size:8.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;text-align:left;}
thead th.r{text-align:right;}
tbody tr:nth-child(even){background:#f0f6ff;}
tbody tr:hover{background:#e0eeff;}
tbody td{padding:7px 9px;border-bottom:1px solid #e2e8f0;font-size:10.5px;}
tbody td.r{text-align:right;}
tfoot td{padding:8px 9px;background:#eff6ff;border-top:2px solid #2371B9;font-weight:700;font-size:11px;}
tfoot td.r{text-align:right;}
.badge{display:inline-block;padding:2px 7px;border-radius:3px;font-size:8px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;}
.badge-blue{background:#dbeafe;color:#1e40af;}
.badge-green{background:#dcfce7;color:#166534;}
.badge-yellow{background:#fef9c3;color:#854d0e;}
.badge-red{background:#fee2e2;color:#991b1b;}
.badge-grey{background:#f1f5f9;color:#475569;}
.pos{color:#166534;font-weight:700;}
.neg{color:#991b1b;font-weight:700;}
.footer{margin-top:24px;border-top:1px solid #e2e8f0;padding-top:10px;display:flex;justify-content:space-between;align-items:center;}
.footer-text{font-size:9px;color:#94a3b8;}
.footer-stamp{font-size:8px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#2371B9;border:1.5px solid #2371B9;padding:2px 8px;border-radius:3px;}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}@page{margin:8mm;size:A4 landscape;}}
`;

function openPrintWindow(html: string) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 600);
}

function pdfShell(title: string, subtitle: string, body: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>${title}</title>
<style>${PDF_BASE_STYLES}</style>
</head><body>
<div class="hdr">
  <div class="hdr-brand">
    <div class="hdr-logo">B</div>
    <div><div class="hdr-name">Bennu Agfin Services</div><div class="hdr-sub">Grain Sourcing &amp; Trade Finance</div></div>
  </div>
  <div class="hdr-right">
    <div class="hdr-title">${title}</div>
    <div class="hdr-date">${subtitle} &nbsp;·&nbsp; Generated ${new Date().toLocaleDateString("en-UG", { year: "numeric", month: "long", day: "numeric" })}</div>
  </div>
</div>
<div class="accent"></div>
<div class="body">${body}</div>
</body></html>`;
}

function badgeClass(status: string): string {
  const map: Record<string, string> = {
    paid: "badge-green", issued: "badge-blue", partial: "badge-yellow",
    overdue: "badge-red", active: "badge-blue", settled: "badge-green",
    pending: "badge-yellow", cancelled: "badge-grey", completed: "badge-green",
  };
  return map[status?.toLowerCase()] || "badge-grey";
}

// ═══════════════════════════════════════════════════════════════════════════════
// PDF generators — one per report tab
// ═══════════════════════════════════════════════════════════════════════════════

function pdfReceivablesAging(data: any) {
  const summaryCards = `
  <div class="summary-grid" style="grid-template-columns:repeat(4,1fr);">
    <div class="card"><div class="card-label">Total Outstanding</div><div class="card-value neg">${fmtUGX(data.grand_total)}</div></div>
    <div class="card"><div class="card-label">Total Invoices</div><div class="card-value">${data.total_invoices}</div></div>
    ${(data.summary || []).slice(0, 2).map((s: any) => `
    <div class="card"><div class="card-label">${s.bucket}</div><div class="card-value">${s.count} inv · ${fmtUGX(s.total)}</div></div>`).join("")}
  </div>`;

  const bucketColors: Record<string, string> = {
    current: "#15803d", week2: "#65a30d", month1: "#d97706", month2: "#dc2626", over60: "#7f1d1d",
  };

  const bucketTables = Object.entries(data.buckets || {}).map(([key, b]: [string, any]) => {
    if (!b.invoices?.length) return "";
    return `
    <div class="section-title">${b.label} — ${b.count} invoices &nbsp; <span style="color:${bucketColors[key] || '#64748b'}">▉</span> ${fmtUGX(b.total)}</div>
    <table>
      <thead><tr>
        <th>Invoice #</th><th>Buyer</th><th>Hub</th>
        <th class="r">Due</th><th class="r">Paid</th><th class="r">Balance</th>
        <th class="r">Penalty</th><th>Due Date</th><th>Days</th><th>Status</th>
      </tr></thead>
      <tbody>
        ${b.invoices.map((inv: any) => `<tr>
          <td style="font-weight:600;color:#1d4ed8;">${inv.invoice_number}</td>
          <td>${inv.buyer_name}</td><td>${inv.hub}</td>
          <td class="r">${fmtUGX(inv.amount_due)}</td>
          <td class="r">${fmtUGX(inv.amount_paid)}</td>
          <td class="r neg">${fmtUGX(inv.balance_due)}</td>
          <td class="r">${parseFloat(inv.penalty_amount) > 0 ? fmtUGX(inv.penalty_amount) : "—"}</td>
          <td>${fmtDate(inv.due_date)}</td>
          <td><span style="font-weight:600;color:${inv.days_outstanding > 30 ? "#dc2626" : inv.days_outstanding > 14 ? "#d97706" : "#475569"}">${inv.days_outstanding}d</span></td>
          <td><span class="badge ${badgeClass(inv.status)}">${inv.status}</span></td>
        </tr>`).join("")}
      </tbody>
    </table>`;
  }).join("");

  openPrintWindow(pdfShell("Receivables Aging Report", `As at ${today()}`, summaryCards + bucketTables));
}

function pdfBuyerLedger(data: any) {
  const t = data.totals || {};
  const cards = `
  <div class="summary-grid" style="grid-template-columns:repeat(6,1fr);">
    ${[
      ["Total Invoiced", fmtUGX(t.total_invoiced), ""],
      ["Total Collected", fmtUGX(t.total_paid), "pos"],
      ["Outstanding", fmtUGX(t.total_outstanding), ""],
      ["Overdue", fmtUGX(t.total_overdue), "neg"],
      ["Penalties", fmtUGX(t.total_penalty), "neg"],
      ["Buyers", t.buyer_count, ""],
    ].map(([l, v, cls]) => `<div class="card"><div class="card-label">${l}</div><div class="card-value ${cls}">${v}</div></div>`).join("")}
  </div>`;

  const rows = (data.buyers || []).map((b: any) => `<tr${parseFloat(b.total_overdue) > 0 ? ' style="background:#fff1f2;"' : ""}>
    <td style="font-weight:600;">${b.buyer_name}</td>
    <td>${b.hub}</td><td class="r">${b.invoice_count}</td>
    <td class="r">${fmtUGX(b.total_invoiced)}</td>
    <td class="r pos">${fmtUGX(b.total_paid)}</td>
    <td class="r" style="font-weight:600;">${fmtUGX(b.total_outstanding)}</td>
    <td class="r neg">${parseFloat(b.total_overdue) > 0 ? fmtUGX(b.total_overdue) : "—"}</td>
    <td class="r">${parseFloat(b.total_penalty) > 0 ? fmtUGX(b.total_penalty) : "—"}</td>
    <td class="r">${fmtPct(b.collection_rate)}</td>
    <td>${b.oldest_overdue_days > 0 ? `${b.oldest_overdue_days}d` : "—"}</td>
  </tr>`).join("");

  const body = cards + `<div class="section-title">Buyer Summary</div>
  <table>
    <thead><tr>
      <th>Buyer</th><th>Hub</th><th class="r">Invoices</th>
      <th class="r">Total Invoiced</th><th class="r">Paid</th>
      <th class="r">Outstanding</th><th class="r">Overdue</th>
      <th class="r">Penalty</th><th class="r">Collection %</th><th>Oldest</th>
    </tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr>
      <td colspan="3">TOTALS</td>
      <td class="r">${fmtUGX(t.total_invoiced)}</td>
      <td class="r pos">${fmtUGX(t.total_paid)}</td>
      <td class="r">${fmtUGX(t.total_outstanding)}</td>
      <td class="r neg">${fmtUGX(t.total_overdue)}</td>
      <td class="r neg">${fmtUGX(t.total_penalty)}</td>
      <td colspan="2"></td>
    </tr></tfoot>
  </table>`;

  openPrintWindow(pdfShell("Buyer Ledger Report", `As at ${today()}`, body));
}

function pdfAssetsLiabilities(data: any) {
  const s = data.summary || {};
  const net = parseFloat(s.net_position || "0");
  const cards = `
  <div class="summary-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:10px;">
    <div class="card" style="border-color:#bbf7d0;"><div class="card-label">Total Receivables (Assets)</div><div class="card-value pos">${fmtUGX(s.total_receivables)}</div></div>
    <div class="card" style="border-color:#fecaca;"><div class="card-label">Investor Obligations (Liabilities)</div><div class="card-value neg">${fmtUGX(s.total_investor_obligations)}</div></div>
    <div class="card" style="border-color:${net >= 0 ? "#bbf7d0" : "#fecaca"};"><div class="card-label">Net Position</div><div class="card-value ${net >= 0 ? "pos" : "neg"}">${fmtUGX(s.net_position)}</div></div>
  </div>
  <div class="summary-grid" style="grid-template-columns:repeat(3,1fr);">
    <div class="card"><div class="card-label">Total Invoices</div><div class="card-value">${s.invoice_count || 0}</div></div>
    <div class="card"><div class="card-label">Investor-Funded</div><div class="card-value">${s.funded_invoice_count || 0}</div></div>
    <div class="card"><div class="card-label">Self-Funded</div><div class="card-value">${s.unfunded_invoice_count || 0}</div></div>
  </div>`;

  let invSummary = "";
  if (data.investor_summary?.length) {
    invSummary = `<div class="section-title">Investor Obligation Summary</div>
    <table>
      <thead><tr><th>Investor</th><th class="r">Capital Deployed</th><th class="r">Margin Owed</th><th class="r">Total Liability</th><th class="r">Allocations</th></tr></thead>
      <tbody>${data.investor_summary.map((i: any) => `<tr>
        <td style="font-weight:600;">${i.investor_name}</td>
        <td class="r">${fmtUGX(i.capital_deployed)}</td>
        <td class="r" style="color:#d97706;">${fmtUGX(i.margin_owed)}</td>
        <td class="r neg">${fmtUGX(i.total_liability)}</td>
        <td class="r">${i.allocation_count}</td>
      </tr>`).join("")}</tbody>
    </table>`;
  }

  const invRows = (data.invoices || []).map((inv: any) => `<tr>
    <td style="font-weight:600;color:#1d4ed8;">${inv.invoice_number}</td>
    <td>${inv.buyer_name}</td>
    <td class="r pos">${fmtUGX(inv.receivable)}</td>
    <td class="r neg">${fmtUGX(inv.total_liability)}</td>
    <td class="r ${parseFloat(inv.net_position) >= 0 ? "pos" : "neg"}">${fmtUGX(inv.net_position)}</td>
    <td>${inv.investor_count}</td>
    <td><span class="badge ${badgeClass(inv.invoice_status)}">${inv.invoice_status}</span></td>
  </tr>`).join("");

  const body = cards + invSummary + `
  <div class="section-title">Per-Invoice Breakdown</div>
  <table>
    <thead><tr><th>Invoice #</th><th>Buyer</th><th class="r">Receivable</th><th class="r">Investor Liability</th><th class="r">Net Position</th><th>Investors</th><th>Status</th></tr></thead>
    <tbody>${invRows}</tbody>
    <tfoot><tr>
      <td colspan="2">TOTALS</td>
      <td class="r pos">${fmtUGX(s.total_receivables)}</td>
      <td class="r neg">${fmtUGX(s.total_investor_obligations)}</td>
      <td class="r ${net >= 0 ? "pos" : "neg"}">${fmtUGX(s.net_position)}</td>
      <td colspan="2"></td>
    </tr></tfoot>
  </table>`;

  openPrintWindow(pdfShell("Assets & Liabilities Report", `As at ${today()}`, body));
}

function pdfInvestorExposure(data: any) {
  const t = data.totals || {};
  const cards = `
  <div class="summary-grid" style="grid-template-columns:repeat(6,1fr);">
    ${[
      ["EMD Available", fmtUGX(t.total_emd_available), "pos"],
      ["EMD Utilized", fmtUGX(t.total_emd_utilized), ""],
      ["Active Capital", fmtUGX(t.total_active_capital), ""],
      ["Margin Earned", fmtUGX(t.total_margin_earned), "pos"],
      ["Unpaid Margin", fmtUGX(t.total_unpaid_margin), ""],
      ["Receivable Exposure", fmtUGX(t.total_exposure), "neg"],
    ].map(([l, v, cls]) => `<div class="card"><div class="card-label">${l}</div><div class="card-value ${cls}">${v}</div></div>`).join("")}
  </div>`;

  const rows = (data.investors || []).map((inv: any) => `<tr>
    <td style="font-weight:600;">${inv.investor_name}</td>
    <td><span class="badge ${inv.payout_type === "interest" ? "badge-blue" : "badge-grey"}">${inv.payout_type === "interest" ? `Interest ${inv.interest_rate || ""}%` : "Margin"}</span></td>
    <td class="r pos">${fmtUGX(inv.emd_balance)}</td>
    <td class="r">${fmtUGX(inv.emd_utilized)}</td>
    <td class="r">${inv.active_allocations}</td>
    <td class="r" style="font-weight:600;">${fmtUGX(inv.active_capital)}</td>
    <td class="r">${inv.settled_allocations}</td>
    <td class="r pos">${fmtUGX(inv.total_margin_earned)}</td>
    <td class="r" style="color:#d97706;font-weight:600;">${fmtUGX(inv.unpaid_margin)}</td>
    <td class="r neg">${fmtUGX(inv.outstanding_receivable_exposure)}</td>
  </tr>`).join("");

  const body = cards + `<div class="section-title">Investor Exposure Detail</div>
  <table>
    <thead><tr>
      <th>Investor</th><th>Type</th><th class="r">EMD Available</th><th class="r">EMD Utilized</th>
      <th class="r">Active</th><th class="r">Active Capital</th><th class="r">Settled</th>
      <th class="r">Margin Earned</th><th class="r">Unpaid Margin</th><th class="r">Exposure</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;

  openPrintWindow(pdfShell("Investor Exposure Report", `As at ${today()}`, body));
}

function pdfTradePnl(data: any) {
  const t = data.totals || {};
  const gp = parseFloat(t.gross_profit);
  const cards = `
  <div class="summary-grid" style="grid-template-columns:repeat(6,1fr);">
    ${[
      ["Total Revenue", fmtUGX(t.revenue), ""],
      ["Total COGS", fmtUGX(t.cogs), ""],
      ["Gross Profit", fmtUGX(t.gross_profit), gp >= 0 ? "pos" : "neg"],
      ["Investor Margin", fmtUGX(t.investor_margin), ""],
      ["Platform Fee", fmtUGX(t.platform_fee), ""],
      ["Trades Settled", String(t.count || 0), ""],
    ].map(([l, v, cls]) => `<div class="card"><div class="card-label">${l}</div><div class="card-value ${cls}">${v}</div></div>`).join("")}
  </div>`;

  const rows = (data.trades || []).map((tr: any) => {
    const gpp = parseFloat(tr.gross_profit);
    return `<tr${gpp < 0 ? ' style="background:#fff1f2;"' : ""}>
      <td style="font-weight:600;color:#1d4ed8;">${tr.settlement_number}</td>
      <td>${tr.order_number}</td>
      <td>${tr.buyer_name}</td><td>${tr.hub}</td>
      <td class="r">${fmtUGX(tr.revenue)}</td>
      <td class="r">${fmtUGX(tr.cogs)}</td>
      <td class="r ${gpp >= 0 ? "pos" : "neg"}">${fmtUGX(tr.gross_profit)}</td>
      <td class="r">${fmtPct(tr.gross_margin_pct)}</td>
      <td class="r">${fmtUGX(tr.investor_margin)}</td>
      <td class="r" style="color:#0369a1;">${fmtUGX(tr.platform_fee)}</td>
      <td>${fmtDate(tr.settled_at)}</td>
    </tr>`;
  }).join("");

  const body = cards + `<div class="section-title">Per-Trade P&amp;L</div>
  <table>
    <thead><tr>
      <th>Settlement #</th><th>Order #</th><th>Buyer</th><th>Hub</th>
      <th class="r">Revenue</th><th class="r">COGS</th><th class="r">Gross Profit</th>
      <th class="r">Margin %</th><th class="r">Inv. Margin</th><th class="r">Platform Fee</th><th>Settled</th>
    </tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr>
      <td colspan="4">TOTALS</td>
      <td class="r">${fmtUGX(t.revenue)}</td>
      <td class="r">${fmtUGX(t.cogs)}</td>
      <td class="r ${gp >= 0 ? "pos" : "neg"}">${fmtUGX(t.gross_profit)}</td>
      <td class="r"></td>
      <td class="r">${fmtUGX(t.investor_margin)}</td>
      <td class="r">${fmtUGX(t.platform_fee)}</td>
      <td></td>
    </tr></tfoot>
  </table>`;

  openPrintWindow(pdfShell("Trade P&L Report", `As at ${today()}`, body));
}

function pdfSupplierPayables(data: any) {
  const t = data.totals || {};
  const cards = `
  <div class="summary-grid" style="grid-template-columns:repeat(4,1fr);">
    ${[
      ["Total Payable", fmtUGX(t.total_payable), "neg"],
      ["Total Paid", fmtUGX(t.total_paid), "pos"],
      ["Outstanding", fmtUGX(t.total_outstanding), ""],
      ["Invoices", String(t.invoice_count || 0), ""],
    ].map(([l, v, cls]) => `<div class="card"><div class="card-label">${l}</div><div class="card-value ${cls}">${v}</div></div>`).join("")}
  </div>`;

  const rows = (data.invoices || []).map((inv: any) => `<tr>
    <td style="font-weight:600;color:#1d4ed8;">${inv.invoice_number}</td>
    <td>${inv.supplier}</td><td>${inv.order_number}</td>
    <td>${inv.grain}</td><td>${inv.hub}</td>
    <td class="r">${fmtUGX(inv.amount_due)}</td>
    <td class="r pos">${fmtUGX(inv.amount_paid)}</td>
    <td class="r neg">${fmtUGX(inv.balance_due)}</td>
    <td>${fmtDate(inv.issued_at)}</td>
    <td>${fmtDate(inv.due_date)}</td>
    <td><span class="badge ${badgeClass(inv.status)}">${inv.status}</span></td>
  </tr>`).join("");

  const body = cards + `<div class="section-title">Supplier Payables Detail</div>
  <table>
    <thead><tr>
      <th>Invoice #</th><th>Supplier</th><th>Order #</th><th>Grain</th><th>Hub</th>
      <th class="r">Amount Due</th><th class="r">Paid</th><th class="r">Balance</th>
      <th>Issued</th><th>Due Date</th><th>Status</th>
    </tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr>
      <td colspan="5">TOTALS</td>
      <td class="r neg">${fmtUGX(t.total_payable)}</td>
      <td class="r pos">${fmtUGX(t.total_paid)}</td>
      <td class="r">${fmtUGX(t.total_outstanding)}</td>
      <td colspan="3"></td>
    </tr></tfoot>
  </table>`;

  openPrintWindow(pdfShell("Supplier Payables Report", `As at ${today()}`, body));
}

// ═══════════════════════════════════════════════════════════════════════════════
// Export column definitions
// ═══════════════════════════════════════════════════════════════════════════════

const COLUMNS: Record<number, ExportColumn[]> = {
  0: [ // Receivables Aging — flat list of all invoices across all buckets
    { header: "Invoice #", key: "invoice_number" },
    { header: "Buyer", key: "buyer_name" },
    { header: "Hub", key: "hub" },
    { header: "Amount Due", key: "amount_due" },
    { header: "Amount Paid", key: "amount_paid" },
    { header: "Balance Due", key: "balance_due" },
    { header: "Penalty", key: "penalty_amount" },
    { header: "Due Date", key: "due_date" },
    { header: "Days Outstanding", key: "days_outstanding" },
    { header: "Status", key: "status" },
  ],
  1: [ // Buyer Ledger
    { header: "Buyer", key: "buyer_name" },
    { header: "Hub", key: "hub" },
    { header: "Invoices", key: "invoice_count" },
    { header: "Total Invoiced", key: "total_invoiced" },
    { header: "Paid", key: "total_paid" },
    { header: "Outstanding", key: "total_outstanding" },
    { header: "Overdue", key: "total_overdue" },
    { header: "Penalty", key: "total_penalty" },
    { header: "Credit Notes", key: "credit_notes" },
    { header: "Debit Notes", key: "debit_notes" },
    { header: "Collection %", key: "collection_rate" },
    { header: "Oldest Overdue (days)", key: "oldest_overdue_days" },
  ],
  2: [ // Assets & Liabilities — per invoice
    { header: "Invoice #", key: "invoice_number" },
    { header: "Buyer", key: "buyer_name" },
    { header: "Receivable", key: "receivable" },
    { header: "Investor Liability", key: "total_liability" },
    { header: "Net Position", key: "net_position" },
    { header: "Investor Count", key: "investor_count" },
    { header: "Status", key: "invoice_status" },
  ],
  3: [ // Investor Exposure
    { header: "Investor", key: "investor_name" },
    { header: "Payout Type", key: "payout_type" },
    { header: "EMD Available", key: "emd_balance" },
    { header: "EMD Utilized", key: "emd_utilized" },
    { header: "Active Allocations", key: "active_allocations" },
    { header: "Active Capital", key: "active_capital" },
    { header: "Settled Allocations", key: "settled_allocations" },
    { header: "Margin Earned", key: "total_margin_earned" },
    { header: "Unpaid Margin", key: "unpaid_margin" },
    { header: "Receivable Exposure", key: "outstanding_receivable_exposure" },
  ],
  4: [ // Trade P&L
    { header: "Settlement #", key: "settlement_number" },
    { header: "Order #", key: "order_number" },
    { header: "Buyer", key: "buyer_name" },
    { header: "Hub", key: "hub" },
    { header: "Revenue", key: "revenue" },
    { header: "COGS", key: "cogs" },
    { header: "Gross Profit", key: "gross_profit" },
    { header: "Margin %", key: "gross_margin_pct" },
    { header: "Investor Margin", key: "investor_margin" },
    { header: "Platform Fee", key: "platform_fee" },
    { header: "Settled At", key: "settled_at" },
  ],
  5: [ // Supplier Payables
    { header: "Invoice #", key: "invoice_number" },
    { header: "Supplier", key: "supplier" },
    { header: "Order #", key: "order_number" },
    { header: "Grain", key: "grain" },
    { header: "Hub", key: "hub" },
    { header: "Amount Due", key: "amount_due" },
    { header: "Paid", key: "amount_paid" },
    { header: "Balance", key: "balance_due" },
    { header: "Issued", key: "issued_at" },
    { header: "Due Date", key: "due_date" },
    { header: "Status", key: "status" },
  ],
};

/** Flatten hierarchical report data into a flat row array for CSV/Excel export */
function flattenData(tab: number, data: any): any[] {
  if (!data) return [];
  switch (tab) {
    case 0: { // Receivables: collect all invoices across buckets
      const rows: any[] = [];
      Object.values(data.buckets || {}).forEach((b: any) => {
        (b.invoices || []).forEach((inv: any) => rows.push(inv));
      });
      return rows;
    }
    case 1: return data.buyers || [];
    case 2: return data.invoices || [];
    case 3: return data.investors || [];
    case 4: return data.trades || [];
    case 5: return data.invoices || [];
    default: return [];
  }
}

const TAB_NAMES = [
  "Receivables_Aging", "Buyer_Ledger", "Assets_Liabilities",
  "Investor_Exposure", "Trade_PnL", "Supplier_Payables",
];

const PDF_GENERATORS = [
  pdfReceivablesAging,
  pdfBuyerLedger,
  pdfAssetsLiabilities,
  pdfInvestorExposure,
  pdfTradePnl,
  pdfSupplierPayables,
];

// ═══════════════════════════════════════════════════════════════════════════════
// ReportExportBar Component
// ═══════════════════════════════════════════════════════════════════════════════

interface ReportExportBarProps {
  tab: number;
  data: any;
  loading?: boolean;
}

export const ReportExportBar: FC<ReportExportBarProps> = ({ tab, data, loading }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const open = Boolean(anchorEl);

  const hasData = !!data && !loading;
  const rows = hasData ? flattenData(tab, data) : [];
  const hasRows = rows.length > 0;
  const cols = COLUMNS[tab] || [];
  const filename = `Bennu_${TAB_NAMES[tab] || "Report"}`;

  const handlePdf = async () => {
    if (!hasData) return;
    setPdfLoading(true);
    try { PDF_GENERATORS[tab]?.(data); }
    finally { setTimeout(() => setPdfLoading(false), 800); }
  };

  return (
    <ButtonGroup variant="outlined" size="small" disableElevation>
      {/* PDF — always visible, prominent */}
      <Tooltip title="Print / save as PDF">
        <Button
          onClick={handlePdf}
          disabled={!hasData || pdfLoading}
          startIcon={pdfLoading ? <CircularProgress size={13} color="inherit" /> : <PictureAsPdfIcon />}
          sx={{
            borderColor: "#dc2626",
            color: "#dc2626",
            "&:hover": { borderColor: "#b91c1c", bgcolor: "#fff1f2" },
            fontWeight: 600,
          }}
        >
          {pdfLoading ? "Opening…" : "PDF"}
        </Button>
      </Tooltip>

      {/* CSV / Excel dropdown */}
      <Tooltip title="Export to CSV or Excel">
        <Button
          onClick={e => setAnchorEl(e.currentTarget)}
          disabled={!hasRows}
          endIcon={<KeyboardArrowDownIcon />}
          startIcon={<FileDownloadIcon />}
          sx={{ fontWeight: 600 }}
        >
          Export
        </Button>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{ elevation: 3, sx: { mt: 0.5, minWidth: 200 } }}
      >
        <MenuItem dense disabled sx={{ opacity: 1 }}>
          <ListItemText primaryTypographyProps={{ fontSize: 11, color: "text.secondary", fontWeight: 600 }}>
            {rows.length} rows · {TAB_NAMES[tab]?.replace(/_/g, " ")}
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { exportToCSV(rows, cols, filename); setAnchorEl(null); }}>
          <ListItemIcon><TableViewIcon fontSize="small" color="success" /></ListItemIcon>
          <ListItemText>Export as CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { exportToExcel(rows, cols, filename); setAnchorEl(null); }}>
          <ListItemIcon><DescriptionIcon fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText>Export as Excel (.xls)</ListItemText>
        </MenuItem>
      </Menu>
    </ButtonGroup>
  );
};

export default ReportExportBar;