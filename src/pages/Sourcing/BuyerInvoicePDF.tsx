/**
 * BuyerInvoicePDF.tsx — NEW
 * Generates a professional buyer invoice PDF using @react-pdf/renderer.
 * Used by BuyerInvoices list (compact icon) and BuyerInvoiceDetails (full button).
 */

import React from "react";
import {
  Document, Page, Text, View, StyleSheet,
} from "@react-pdf/renderer";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Button, CircularProgress, IconButton, Tooltip } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

const C = {
  navy: "#0D1B2A", teal: "#0E7C7B", gold: "#C9A84C",
  white: "#FFFFFF", ink: "#1A2230", muted: "#6B7280", border: "#D1D5DB",
};

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 10, color: C.ink, padding: 40, paddingBottom: 60 },
  header: {
    backgroundColor: C.navy, padding: 20, marginHorizontal: -40, marginTop: -40,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 0,
  },
  brand: { fontSize: 20, color: C.white, fontFamily: "Helvetica-Bold" },
  subBrand: { fontSize: 8, color: "#FFFFFF99", marginTop: 2 },
  titleBlock: { alignItems: "flex-end" },
  title: { fontSize: 14, color: C.white, fontFamily: "Helvetica-Bold" },
  titleSub: { fontSize: 8, color: "#FFFFFF88", marginTop: 2 },
  accent: { height: 3, backgroundColor: C.gold, marginHorizontal: -40, marginBottom: 20 },
  meta: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  metaCol: { width: "48%" },
  metaLabel: { fontSize: 7.5, color: C.muted, fontFamily: "Helvetica-Bold", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 },
  metaValue: { fontSize: 9.5, color: C.ink, marginBottom: 2 },
  metaValueBold: { fontSize: 9.5, color: C.ink, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  table: { marginTop: 12, marginBottom: 16 },
  tableHeader: {
    flexDirection: "row", backgroundColor: C.navy, paddingVertical: 6, paddingHorizontal: 8,
    borderTopLeftRadius: 3, borderTopRightRadius: 3,
  },
  tableHeaderText: { color: C.white, fontSize: 8, fontFamily: "Helvetica-Bold", letterSpacing: 0.3, textTransform: "uppercase" },
  tableRow: { flexDirection: "row", paddingVertical: 6, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  tableRowAlt: { backgroundColor: "#F9FAFB" },
  tableCell: { fontSize: 9.5, color: C.ink },
  summaryRow: { flexDirection: "row", justifyContent: "flex-end", paddingVertical: 3, paddingHorizontal: 8 },
  summaryLabel: { fontSize: 9, color: C.muted, width: 120, textAlign: "right", paddingRight: 12 },
  summaryValue: { fontSize: 9.5, color: C.ink, fontFamily: "Helvetica-Bold", width: 100, textAlign: "right" },
  totalRow: {
    flexDirection: "row", justifyContent: "flex-end", paddingVertical: 6, paddingHorizontal: 8,
    borderTopWidth: 2, borderTopColor: C.navy, marginTop: 4,
  },
  totalLabel: { fontSize: 11, color: C.navy, fontFamily: "Helvetica-Bold", width: 120, textAlign: "right", paddingRight: 12 },
  totalValue: { fontSize: 11, color: C.gold, fontFamily: "Helvetica-Bold", width: 100, textAlign: "right" },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 8, color: C.muted, fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8,
  },
  bankRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  bankLabel: { fontSize: 9, color: C.muted },
  bankValue: { fontSize: 9.5, color: C.ink, fontFamily: "Helvetica-Bold" },
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: C.navy,
    paddingHorizontal: 40, paddingVertical: 10, flexDirection: "row", justifyContent: "space-between",
  },
  footerText: { fontSize: 7.5, color: "#FFFFFF66" },
  footerRight: { fontSize: 8, color: C.gold, fontFamily: "Helvetica-Bold" },
});

const fmtCurr = (n: number | string) => `UGX ${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
const fmtDate = (d?: string | null) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return d; }
};

interface BuyerInvoicePDFProps {
  invoice: {
    invoice_number: string;
    order_number?: string;
    buyer_name?: string;
    buyer_profile_name?: string;
    amount_due: number;
    amount_paid: number;
    balance_due: number;
    payment_terms_days?: number;
    issued_at?: string;
    due_date?: string | null;
    status: string;
    notes?: string;
  };
}

const BuyerInvoiceDocument: React.FC<BuyerInvoicePDFProps> = ({ invoice }) => (
  <Document title={`Buyer Invoice ${invoice.invoice_number}`} author="Bennu AgFin Services Limited">
    <Page size="A4" style={s.page}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.brand}>BENNU</Text>
          <Text style={s.subBrand}>AGFIN SERVICES LIMITED</Text>
        </View>
        <View style={s.titleBlock}>
          <Text style={s.title}>BUYER INVOICE</Text>
          <Text style={s.titleSub}>Plot 16 Mackinnon Road, Nakasero</Text>
          <Text style={s.titleSub}>P.O. Box 19298, Kampala Uganda</Text>
        </View>
      </View>
      <View style={s.accent} />

      {/* Meta */}
      <View style={s.meta}>
        <View style={s.metaCol}>
          <Text style={s.metaLabel}>Invoice Details</Text>
          <Text style={s.metaValueBold}>{invoice.invoice_number}</Text>
          <Text style={s.metaValue}>Order: {invoice.order_number || "—"}</Text>
          <Text style={s.metaValue}>Issued: {fmtDate(invoice.issued_at)}</Text>
          <Text style={s.metaValue}>Due: {fmtDate(invoice.due_date)}</Text>
          <Text style={s.metaValue}>Terms: {invoice.payment_terms_days === 0 ? "On Delivery" : `Net ${invoice.payment_terms_days} days`}</Text>
          <Text style={s.metaValue}>Status: {invoice.status.toUpperCase()}</Text>
        </View>
        <View style={s.metaCol}>
          <Text style={s.metaLabel}>Bill To</Text>
          <Text style={s.metaValueBold}>{invoice.buyer_name || invoice.buyer_profile_name || "—"}</Text>
        </View>
      </View>

      {/* Summary */}
      <View style={s.table}>
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderText, { width: "50%" }]}>Description</Text>
          <Text style={[s.tableHeaderText, { width: "25%", textAlign: "right" }]}>Amount</Text>
          <Text style={[s.tableHeaderText, { width: "25%", textAlign: "right" }]}>Status</Text>
        </View>
        <View style={s.tableRow}>
          <Text style={[s.tableCell, { width: "50%" }]}>Grain Purchase — {invoice.order_number || "N/A"}</Text>
          <Text style={[s.tableCell, { width: "25%", textAlign: "right", fontFamily: "Helvetica-Bold" }]}>{fmtCurr(invoice.amount_due)}</Text>
          <Text style={[s.tableCell, { width: "25%", textAlign: "right" }]}>{invoice.status.toUpperCase()}</Text>
        </View>
      </View>

      {/* Totals */}
      <View style={s.summaryRow}>
        <Text style={s.summaryLabel}>Amount Due</Text>
        <Text style={s.summaryValue}>{fmtCurr(invoice.amount_due)}</Text>
      </View>
      <View style={s.summaryRow}>
        <Text style={s.summaryLabel}>Amount Paid</Text>
        <Text style={[s.summaryValue, { color: "#059669" }]}>- {fmtCurr(invoice.amount_paid)}</Text>
      </View>
      <View style={s.totalRow}>
        <Text style={s.totalLabel}>Balance Due</Text>
        <Text style={s.totalValue}>{fmtCurr(invoice.balance_due)}</Text>
      </View>

      {/* Bank Instructions */}
      <View style={[s.section, { marginTop: 20 }]}>
        <Text style={s.sectionTitle}>Bank Instructions</Text>
        {[
          ["Account Number", "9030026820951"],
          ["Bank Name", "STANBIC BANK"],
          ["Currency", "UGX"],
          ["Account Holder", "BENNU AGFIN SERVICES LIMITED"],
          ["Branch", "NAKASERO"],
        ].map(([label, value]) => (
          <View key={label} style={s.bankRow}>
            <Text style={s.bankLabel}>{label}</Text>
            <Text style={s.bankValue}>{value}</Text>
          </View>
        ))}
      </View>

      {invoice.notes && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Notes</Text>
          <Text style={{ fontSize: 9, color: C.muted }}>{invoice.notes}</Text>
        </View>
      )}

      {/* Footer */}
      <View style={s.footer} fixed>
        <Text style={s.footerText}>
          Bennu AgFin Services Limited · Plot 16 Mackinnon Road, Nakasero · Kampala, Uganda
        </Text>
        <Text style={s.footerRight}>{invoice.invoice_number}</Text>
      </View>
    </Page>
  </Document>
);

// ─── Button Component ─────────────────────────────────────────────────────────

interface BuyerInvoicePDFButtonProps {
  invoice: BuyerInvoicePDFProps["invoice"];
  compact?: boolean;
  size?: "small" | "medium" | "large";
}

const BuyerInvoicePDFButton: React.FC<BuyerInvoicePDFButtonProps> = ({
  invoice, compact = false, size = "small",
}) => {
  const fileName = `Buyer_Invoice_${invoice.invoice_number.replace(/\s/g, "_")}.pdf`;

  return (
    <PDFDownloadLink
      document={<BuyerInvoiceDocument invoice={invoice} />}
      fileName={fileName}
      style={{ textDecoration: "none" }}
    >
      {({ loading: pdfLoading }) =>
        compact ? (
          <Tooltip title={`Download ${invoice.invoice_number}`}>
            <IconButton size={size} color="primary" disabled={pdfLoading}>
              {pdfLoading ? <CircularProgress size={16} /> : <PictureAsPdfIcon />}
            </IconButton>
          </Tooltip>
        ) : (
          <Button
            size={size}
            variant="outlined"
            color="primary"
            disabled={pdfLoading}
            startIcon={pdfLoading ? <CircularProgress size={14} color="inherit" /> : <PictureAsPdfIcon />}
          >
            {pdfLoading ? "Building PDF..." : "Download PDF"}
          </Button>
        )
      }
    </PDFDownloadLink>
  );
};

export default BuyerInvoicePDFButton;