/**
 * InvoiceDocument.tsx
 *
 * Shared @react-pdf/renderer document used by BOTH BuyerInvoicePDF and
 * SupplierInvoicePDF.  Import this directly if you ever need a generic
 * invoice renderer.
 *
 * Dependencies (already in package.json):
 *   @react-pdf/renderer ^4.x
 */

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
  navy: "#0D1B2A",
  teal: "#0E7C7B",
  gold: "#C9A84C",
  ash: "#F4F5F0",
  smoke: "#E8EAE3",
  ink: "#1A2230",
  muted: "#6B7280",
  border: "#D1D5DB",
  white: "#FFFFFF",
  red: "#DC2626",
  green: "#16A34A",
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: C.ink,
    backgroundColor: C.white,
    paddingBottom: 40,
  },

  // Header
  header: {
    backgroundColor: C.navy,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  headerLogo: { flexDirection: "column" },
  headerBrand: { fontSize: 22, color: C.white, fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  headerSubBrand: { fontSize: 8, color: "#FFFFFF99", letterSpacing: 1.5, marginTop: 2 },
  headerRight: { alignItems: "flex-end" },
  headerTitle: { fontSize: 13, color: C.white, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  headerAddr: { fontSize: 8, color: "#FFFFFF99", lineHeight: 1.6 },

  // Gold bar
  accentBar: {
    height: 3,
    backgroundColor: C.gold,
  },

  // Meta grid
  metaSection: {
    backgroundColor: C.ash,
    paddingHorizontal: 32,
    paddingVertical: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 0,
  },
  metaCell: { width: "25%", paddingVertical: 3, paddingRight: 8 },
  metaLabel: { fontSize: 7, color: C.muted, fontFamily: "Helvetica-Bold", letterSpacing: 0.8, textTransform: "uppercase" },
  metaValue: { fontSize: 9, color: C.ink, fontFamily: "Helvetica-Bold", marginTop: 2 },

  // Parties
  partiesRow: {
    flexDirection: "row",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 24,
  },
  partyBlock: { flex: 1 },
  partyLabel: { fontSize: 7, color: C.teal, fontFamily: "Helvetica-Bold", letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 },
  partyName: { fontSize: 10, color: C.ink, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  partyLine: { fontSize: 8.5, color: C.muted, lineHeight: 1.5 },

  // Table
  tableSection: { paddingHorizontal: 32, marginTop: 14 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.navy,
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  tableHeaderCell: { fontSize: 8, color: C.white, fontFamily: "Helvetica-Bold", letterSpacing: 0.5 },
  tableRow: { flexDirection: "row", paddingVertical: 7, paddingHorizontal: 8 },
  tableRowAlt: { backgroundColor: C.ash },
  tableCell: { fontSize: 9, color: C.ink },

  // Col widths
  colQty: { width: "12%" },
  colUnit: { width: "10%" },
  colDesc: { width: "42%" },
  colPrice: { width: "18%", textAlign: "right" },
  colTotal: { width: "18%", textAlign: "right" },

  // Costs + Summary two-col
  bottomSection: {
    flexDirection: "row",
    paddingHorizontal: 32,
    marginTop: 16,
    gap: 32,
  },
  bottomLeft: { flex: 1 },
  bottomRight: { flex: 1 },
  sectionTitle: { fontSize: 7.5, color: C.muted, fontFamily: "Helvetica-Bold", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3.5,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    borderBottomStyle: "dashed",
  },
  costLabel: { fontSize: 8.5, color: C.muted },
  costValue: { fontSize: 8.5, color: C.ink, fontFamily: "Helvetica" },

  // Total box
  totalBox: {
    backgroundColor: C.navy,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  totalLabel: { fontSize: 10, color: C.white, fontFamily: "Helvetica-Bold" },
  totalValue: { fontSize: 14, color: C.gold, fontFamily: "Helvetica-Bold" },
  currencyNote: { fontSize: 7.5, color: C.muted, textAlign: "right", marginTop: 3 },

  // Bank
  bankSection: {
    paddingHorizontal: 32,
    marginTop: 16,
  },
  bankGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 6, gap: 0 },
  bankCell: { width: "50%", flexDirection: "row", marginBottom: 5 },
  bankLabel: { fontSize: 8, color: C.muted, width: 110 },
  bankValue: { fontSize: 8, color: C.ink, fontFamily: "Helvetica-Bold", flex: 1 },

  // Payment history
  paymentSection: { paddingHorizontal: 32, marginTop: 16 },
  payTableHeader: { flexDirection: "row", backgroundColor: C.smoke, paddingVertical: 5, paddingHorizontal: 6 },
  payTableHeaderCell: { fontSize: 7.5, color: C.muted, fontFamily: "Helvetica-Bold" },
  payTableRow: { flexDirection: "row", paddingVertical: 5, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: C.border },
  payCell: { fontSize: 8.5, color: C.ink },
  colPayNum: { width: "22%" },
  colPayMethod: { width: "18%" },
  colPayRef: { width: "28%" },
  colPayAmt: { width: "17%", textAlign: "right" },
  colPayStatus: { width: "15%", textAlign: "right" },

  // Notes
  notesSection: { paddingHorizontal: 32, marginTop: 14 },
  notesText: { fontSize: 8.5, color: C.muted, lineHeight: 1.5 },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.navy,
    paddingHorizontal: 32,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: { fontSize: 8, color: "#FFFFFF66" },
  footerRight: { fontSize: 8, color: C.gold, fontFamily: "Helvetica-Bold" },

  // Divider
  divider: { height: 1, backgroundColor: C.border, marginHorizontal: 32, marginVertical: 4 },

  // Status badge
  statusBadge: {
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  statusText: { fontSize: 7.5, fontFamily: "Helvetica-Bold", letterSpacing: 0.5 },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt3 = (n: number | string | null | undefined) => {
  const num = Number(n || 0);
  return num.toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
};

const fmtCurr = (n: number | string | null | undefined, currency = "USD") =>
  `${currency} ${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (d?: string | null) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return d;
  }
};

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  draft:    { bg: "#F3F4F6", fg: "#6B7280" },
  issued:   { bg: "#DBEAFE", fg: "#1D4ED8" },
  partial:  { bg: "#FEF3C7", fg: "#B45309" },
  paid:     { bg: "#D1FAE5", fg: "#065F46" },
  overdue:  { bg: "#FEE2E2", fg: "#B91C1C" },
  cancelled:{ bg: "#FEE2E2", fg: "#B91C1C" },
  pending:  { bg: "#FEF3C7", fg: "#B45309" },
  completed:{ bg: "#D1FAE5", fg: "#065F46" },
  failed:   { bg: "#FEE2E2", fg: "#B91C1C" },
  processing:{ bg: "#DBEAFE", fg: "#1D4ED8" },
};

const StatusBadge = ({ status }: { status: string }) => {
  const colors = STATUS_COLORS[status] ?? { bg: "#F3F4F6", fg: "#6B7280" };
  return (
    <View style={[s.statusBadge, { backgroundColor: colors.bg }]}>
      <Text style={[s.statusText, { color: colors.fg }]}>
        {status.replace(/_/g, " ").toUpperCase()}
      </Text>
    </View>
  );
};

// ─── Types ────────────────────────────────────────────────────────────────────
export interface IInvoiceLineItem {
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
}

export interface ICostItem {
  label: string;
  amount: number;
}

export interface IBankDetails {
  accountNumber: string;
  accountHolder: string;
  bankName: string;
  branch: string;
  currency: string;
  swift?: string;
}

export interface IPaymentRecord {
  paymentNumber: string;
  method: string;
  reference: string;
  amount: number;
  status: string;
  date: string;
}

export interface IInvoiceDocumentProps {
  // Type
  invoiceType: "buyer" | "supplier";

  // Header meta
  invoiceNumber: string;
  invoiceStatus: string;
  date: string;
  dueDate?: string | null;
  tradeType?: string;
  tradeId?: string;
  poNumber?: string;
  grnNumber?: string;
  creditTermsDays?: number;

  // Parties
  billedToName: string;
  billedToReg?: string;
  billedToAddress?: string;
  billedToCity?: string;
  billedToCountry?: string;
  shipTo?: string;

  // Seller extras (supplier invoice)
  supplierName?: string;
  supplierHub?: string;

  // Line items
  lines: IInvoiceLineItem[];

  // Costs
  costs: ICostItem[];   // shown in "Additional Costs" section
  deposit?: number;
  tax?: number;
  currency?: string;

  // Paid / balance (supplier invoice)
  amountPaid?: number;
  paymentMethod?: string;
  paymentReference?: string;

  // Bank
  bank: IBankDetails;

  // Payment history (optional)
  payments?: IPaymentRecord[];

  // Notes
  notes?: string;
}

// ─── Main Document ────────────────────────────────────────────────────────────
const InvoiceDocument: React.FC<IInvoiceDocumentProps> = (props) => {
  const {
    invoiceType, invoiceNumber, invoiceStatus, date, dueDate, tradeType,
    tradeId, poNumber, grnNumber, creditTermsDays,
    billedToName, billedToReg, billedToAddress, billedToCity, billedToCountry, shipTo,
    supplierName, supplierHub,
    lines, costs, deposit = 0, tax = 0, currency = "USD",
    amountPaid = 0, paymentMethod, paymentReference,
    bank, payments = [], notes,
  } = props;

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const totalCosts = costs.reduce((s, c) => s + (c.amount || 0), 0);
  const totalDue = subtotal + totalCosts - deposit + tax;
  const balance = totalDue - amountPaid;
  const isBuyer = invoiceType === "buyer";

  const metaCells = [
    { label: "Date", value: fmtDate(date) },
    { label: "Invoice No.", value: invoiceNumber },
    { label: "Trade Type", value: tradeType ? tradeType.toUpperCase() : "—" },
    { label: "Trade ID", value: tradeId || "—" },
    { label: "PO Number", value: poNumber || "—" },
    { label: "GRN Number", value: grnNumber || "—" },
    ...(isBuyer
      ? [
          { label: "Credit Terms", value: creditTermsDays != null ? (creditTermsDays === 0 ? "On Delivery" : `Net ${creditTermsDays}`) : "—" },
          { label: "Due Date", value: dueDate ? fmtDate(dueDate) : "—" },
        ]
      : [
          { label: "Due Date", value: dueDate ? fmtDate(dueDate) : "—" },
          { label: "Payment Method", value: paymentMethod?.replace(/_/g, " ") || "—" },
        ]),
  ];

  return (
    <Document
      title={`${invoiceNumber} — Bennu AgFin`}
      author="Bennu AgFin Services Limited"
      subject={isBuyer ? "Commercial Invoice" : "Supplier Invoice"}
    >
      <Page size="A4" style={s.page}>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={s.header}>
          <View style={s.headerLogo}>
            <Text style={s.headerBrand}>BENNU</Text>
            <Text style={s.headerSubBrand}>AGFIN SERVICES LIMITED</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerTitle}>
              {isBuyer ? "COMMERCIAL INVOICE" : "SUPPLIER INVOICE"}
            </Text>
            <Text style={s.headerAddr}>Plot 16 Mackinnon Road, Nakasero</Text>
            <Text style={s.headerAddr}>P.O. Box 19298, Kampala Uganda</Text>
          </View>
        </View>

        {/* ── Gold accent bar ────────────────────────────────────────── */}
        <View style={s.accentBar} />

        {/* ── Meta grid ─────────────────────────────────────────────── */}
        <View style={s.metaSection}>
          {metaCells.map((cell) => (
            <View key={cell.label} style={s.metaCell}>
              <Text style={s.metaLabel}>{cell.label}</Text>
              <Text style={s.metaValue}>{cell.value}</Text>
            </View>
          ))}
          <View style={s.metaCell}>
            <Text style={s.metaLabel}>Status</Text>
            <StatusBadge status={invoiceStatus} />
          </View>
        </View>

        {/* ── Parties ───────────────────────────────────────────────── */}
        <View style={s.partiesRow}>
          <View style={s.partyBlock}>
            <Text style={s.partyLabel}>{isBuyer ? "Billed To" : "Pay To (Supplier)"}</Text>
            <Text style={s.partyName}>{billedToName || "—"}</Text>
            {billedToReg ? <Text style={s.partyLine}>{billedToReg}</Text> : null}
            {billedToAddress ? <Text style={s.partyLine}>{billedToAddress}</Text> : null}
            {(billedToCity || billedToCountry) ? (
              <Text style={s.partyLine}>{[billedToCity, billedToCountry].filter(Boolean).join(", ")}</Text>
            ) : null}
            {shipTo ? <Text style={[s.partyLine, { marginTop: 4 }]}>Ship To: {shipTo}</Text> : null}
          </View>
          <View style={s.partyBlock}>
            <Text style={s.partyLabel}>Seller</Text>
            <Text style={s.partyName}>Bennu Agfin Services Limited</Text>
            <Text style={s.partyLine}>Plot 16 Mackinnon Road, Nakasero</Text>
            <Text style={s.partyLine}>Kampala, Uganda</Text>
            {!isBuyer && supplierName ? (
              <>
                <Text style={[s.partyLabel, { marginTop: 8 }]}>Supplier</Text>
                <Text style={s.partyName}>{supplierName}</Text>
                {supplierHub ? <Text style={s.partyLine}>Hub: {supplierHub}</Text> : null}
              </>
            ) : null}
          </View>
        </View>

        {/* ── Line items table ───────────────────────────────────────── */}
        <View style={s.tableSection}>
          {/* Header row */}
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, s.colQty]}>QTY</Text>
            <Text style={[s.tableHeaderCell, s.colUnit]}>UNIT</Text>
            <Text style={[s.tableHeaderCell, s.colDesc]}>DESCRIPTION</Text>
            <Text style={[s.tableHeaderCell, s.colPrice]}>UNIT PRICE</Text>
            <Text style={[s.tableHeaderCell, s.colTotal]}>TOTAL</Text>
          </View>

          {lines.map((line, i) => (
            <View key={i} style={[s.tableRow, i % 2 !== 0 ? s.tableRowAlt : {}]}>
              <Text style={[s.tableCell, s.colQty]}>{line.qty}</Text>
              <Text style={[s.tableCell, s.colUnit]}>{line.unit}</Text>
              <Text style={[s.tableCell, s.colDesc]}>{line.description}</Text>
              <Text style={[s.tableCell, s.colPrice]}>{fmt3(line.unitPrice)}</Text>
              <Text style={[s.tableCell, s.colTotal, { fontFamily: "Helvetica-Bold" }]}>
                {fmt3(line.lineTotal)}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Costs + Summary ────────────────────────────────────────── */}
        <View style={s.bottomSection}>
          {/* Costs */}
          <View style={s.bottomLeft}>
            <Text style={s.sectionTitle}>Additional Costs</Text>
            {costs.map((c) => (
              <View key={c.label} style={s.costRow}>
                <Text style={s.costLabel}>{c.label}</Text>
                <Text style={s.costValue}>{c.amount ? fmt3(c.amount) : "—"}</Text>
              </View>
            ))}
          </View>

          {/* Summary */}
          <View style={s.bottomRight}>
            <Text style={s.sectionTitle}>Summary</Text>

            <View style={s.costRow}>
              <Text style={s.costLabel}>Sub Total</Text>
              <Text style={s.costValue}>{fmt3(subtotal)}</Text>
            </View>

            {totalCosts > 0 && (
              <View style={s.costRow}>
                <Text style={s.costLabel}>Total Costs</Text>
                <Text style={s.costValue}>{fmt3(totalCosts)}</Text>
              </View>
            )}

            {deposit > 0 && (
              <View style={s.costRow}>
                <Text style={s.costLabel}>Deposit / Advance</Text>
                <Text style={[s.costValue, { color: C.green }]}>- {fmt3(deposit)}</Text>
              </View>
            )}

            {tax > 0 && (
              <View style={s.costRow}>
                <Text style={s.costLabel}>Tax</Text>
                <Text style={s.costValue}>{fmt3(tax)}</Text>
              </View>
            )}

            {!isBuyer && amountPaid > 0 && (
              <View style={s.costRow}>
                <Text style={s.costLabel}>Amount Paid</Text>
                <Text style={[s.costValue, { color: C.green, fontFamily: "Helvetica-Bold" }]}>
                  - {fmt3(amountPaid)}
                </Text>
              </View>
            )}

            {/* Total Due box */}
            <View style={s.totalBox}>
              <Text style={s.totalLabel}>
                {!isBuyer && amountPaid > 0 ? "Balance Due" : "Total Due"}
              </Text>
              <Text style={s.totalValue}>
                {fmt3(!isBuyer && amountPaid > 0 ? balance : totalDue)}
              </Text>
            </View>
            <Text style={s.currencyNote}>Amount in {currency}</Text>
          </View>
        </View>

        {/* ── Bank Instructions ──────────────────────────────────────── */}
        <View style={s.bankSection}>
          <Text style={s.sectionTitle}>Bank Instructions</Text>
          <View style={[s.divider, { marginHorizontal: 0, marginTop: 6, marginBottom: 8 }]} />
          <View style={s.bankGrid}>
            {[
              ["Account Number", bank.accountNumber],
              ["Account Holder", bank.accountHolder],
              ["Bank Name", bank.bankName],
              ["Branch", bank.branch],
              ["Currency", bank.currency],
              ["SWIFT Code", bank.swift || "—"],
            ].map(([label, value]) => (
              <View key={label} style={s.bankCell}>
                <Text style={s.bankLabel}>{label}</Text>
                <Text style={s.bankValue}>{value || "—"}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Payment history (if any) ───────────────────────────────── */}
        {payments.length > 0 && (
          <View style={s.paymentSection}>
            <Text style={s.sectionTitle}>Payment History</Text>
            <View style={[s.divider, { marginHorizontal: 0, marginTop: 6, marginBottom: 0 }]} />

            <View style={s.payTableHeader}>
              <Text style={[s.payTableHeaderCell, s.colPayNum]}>Payment #</Text>
              <Text style={[s.payTableHeaderCell, s.colPayMethod]}>Method</Text>
              <Text style={[s.payTableHeaderCell, s.colPayRef]}>Reference</Text>
              <Text style={[s.payTableHeaderCell, s.colPayAmt]}>Amount</Text>
              <Text style={[s.payTableHeaderCell, s.colPayStatus]}>Status</Text>
            </View>

            {payments.map((p, i) => (
              <View key={i} style={s.payTableRow}>
                <Text style={[s.payCell, s.colPayNum]}>{p.paymentNumber}</Text>
                <Text style={[s.payCell, s.colPayMethod]}>{p.method}</Text>
                <Text style={[s.payCell, s.colPayRef]}>{p.reference || "—"}</Text>
                <Text style={[s.payCell, s.colPayAmt, { fontFamily: "Helvetica-Bold" }]}>
                  {fmt3(p.amount)}
                </Text>
                <Text style={[s.payCell, s.colPayStatus, { color: p.status === "completed" || p.status === "confirmed" ? C.green : C.muted }]}>
                  {p.status.toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Notes ─────────────────────────────────────────────────── */}
        {notes && (
          <View style={s.notesSection}>
            <Text style={s.sectionTitle}>Notes</Text>
            <Text style={s.notesText}>{notes}</Text>
          </View>
        )}

        {/* ── Footer ────────────────────────────────────────────────── */}
        <View style={s.footer} fixed>
          <Text style={s.footerLeft}>
            Bennu AgFin Services Limited · Plot 16 Mackinnon Road, Nakasero · Kampala, Uganda
          </Text>
          <Text style={s.footerRight}>{invoiceNumber}</Text>
        </View>

      </Page>
    </Document>
  );
};

export default InvoiceDocument;