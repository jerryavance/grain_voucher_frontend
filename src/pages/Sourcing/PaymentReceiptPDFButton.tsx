/**
 * PaymentReceiptPDF.tsx — NEW
 * Generates a payment receipt PDF for buyer or supplier payments.
 */

import React, { useState } from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Button, CircularProgress, Tooltip } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ReceiptIcon from "@mui/icons-material/Receipt";

const C = { navy: "#0D1B2A", teal: "#0E7C7B", gold: "#C9A84C", white: "#FFFFFF", ink: "#1A2230", muted: "#6B7280", border: "#D1D5DB" };

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 10, color: C.ink, padding: 40, paddingBottom: 60 },
  header: { backgroundColor: C.navy, padding: 20, marginHorizontal: -40, marginTop: -40, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 0 },
  brand: { fontSize: 20, color: C.white, fontFamily: "Helvetica-Bold" },
  subBrand: { fontSize: 8, color: "#FFFFFF99", marginTop: 2 },
  title: { fontSize: 14, color: C.white, fontFamily: "Helvetica-Bold" },
  accent: { height: 3, backgroundColor: C.gold, marginHorizontal: -40, marginBottom: 20 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 8, color: C.muted, fontFamily: "Helvetica-Bold", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: C.border, borderBottomStyle: "dashed" },
  label: { fontSize: 9.5, color: C.muted },
  value: { fontSize: 9.5, color: C.ink, fontFamily: "Helvetica-Bold" },
  amountBox: { backgroundColor: C.navy, borderRadius: 4, padding: 14, alignItems: "center", marginTop: 12, marginBottom: 16 },
  amountLabel: { fontSize: 9, color: "#FFFFFF99", marginBottom: 4 },
  amountValue: { fontSize: 22, color: C.gold, fontFamily: "Helvetica-Bold" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: C.navy, paddingHorizontal: 40, paddingVertical: 10, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7.5, color: "#FFFFFF66" },
  footerRight: { fontSize: 8, color: C.gold, fontFamily: "Helvetica-Bold" },
});

const fmtCurr = (n: number | string) => `UGX ${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
const fmtDate = (d?: string | null) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return d; }
};

interface ReceiptProps {
  receiptNumber: string;
  type: "buyer" | "supplier";
  payerName: string;
  amount: number;
  method: string;
  reference: string;
  invoiceNumber: string;
  paymentDate: string;
  confirmedAt?: string | null;
  status: string;
  notes?: string;
}

const ReceiptDocument: React.FC<ReceiptProps> = (props) => (
  <Document title={`Receipt ${props.receiptNumber}`} author="Bennu AgFin Services Limited">
    <Page size="A5" style={s.page}>
      <View style={s.header}>
        <View>
          <Text style={s.brand}>BENNU</Text>
          <Text style={s.subBrand}>AGFIN SERVICES LIMITED</Text>
        </View>
        <Text style={s.title}>PAYMENT RECEIPT</Text>
      </View>
      <View style={s.accent} />

      <View style={s.amountBox}>
        <Text style={s.amountLabel}>AMOUNT RECEIVED</Text>
        <Text style={s.amountValue}>{fmtCurr(props.amount)}</Text>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Receipt Details</Text>
        {[
          ["Receipt #", props.receiptNumber],
          ["Type", props.type === "buyer" ? "Buyer Payment" : "Supplier Payment"],
          [props.type === "buyer" ? "Received From" : "Paid To", props.payerName],
          ["Invoice #", props.invoiceNumber],
          ["Payment Method", props.method.replace(/_/g, " ").toUpperCase()],
          ["Reference", props.reference || "—"],
          ["Payment Date", fmtDate(props.paymentDate)],
          ["Confirmed At", fmtDate(props.confirmedAt)],
          ["Status", props.status.toUpperCase()],
        ].map(([label, value]) => (
          <View key={label} style={s.row}>
            <Text style={s.label}>{label}</Text>
            <Text style={s.value}>{value}</Text>
          </View>
        ))}
      </View>

      {props.notes && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Notes</Text>
          <Text style={{ fontSize: 9, color: C.muted }}>{props.notes}</Text>
        </View>
      )}

      <View style={s.footer} fixed>
        <Text style={s.footerText}>Bennu AgFin Services Limited · Plot 16 Mackinnon Road, Nakasero · Kampala, Uganda</Text>
        <Text style={s.footerRight}>{props.receiptNumber}</Text>
      </View>
    </Page>
  </Document>
);

// ─── Button Component ────────────────────────────────────────────────────────

interface PaymentReceiptPDFButtonProps {
  payment: {
    payment_number: string;
    amount: number;
    method: string;
    reference_number: string;
    invoice_number?: string;
    buyer_name?: string;
    supplier_name?: string;
    payment_date: string;
    confirmed_at?: string | null;
    status: string;
    notes?: string;
  };
  type: "buyer" | "supplier";
  size?: "small" | "medium" | "large";
  compact?: boolean;
}

const PaymentReceiptPDFButton: React.FC<PaymentReceiptPDFButtonProps> = ({
  payment, type, size = "small", compact = false,
}) => {
  const receiptProps: ReceiptProps = {
    receiptNumber: payment.payment_number,
    type,
    payerName: type === "buyer" ? (payment.buyer_name || "Buyer") : (payment.supplier_name || "Supplier"),
    amount: Number(payment.amount),
    method: payment.method,
    reference: payment.reference_number || "—",
    invoiceNumber: payment.invoice_number || "—",
    paymentDate: payment.payment_date,
    confirmedAt: payment.confirmed_at,
    status: payment.status,
    notes: payment.notes,
  };

  const fileName = `Receipt_${payment.payment_number.replace(/\s/g, "_")}.pdf`;

  return (
    <PDFDownloadLink document={<ReceiptDocument {...receiptProps} />} fileName={fileName} style={{ textDecoration: "none" }}>
      {({ loading: pdfLoading }) => (
        <Tooltip title={`Download receipt ${payment.payment_number}`}>
          <Button
            size={size}
            variant={compact ? "text" : "outlined"}
            color="primary"
            disabled={pdfLoading}
            startIcon={pdfLoading ? <CircularProgress size={14} color="inherit" /> : <ReceiptIcon />}
          >
            {compact ? "" : pdfLoading ? "Building..." : "Receipt PDF"}
          </Button>
        </Tooltip>
      )}
    </PDFDownloadLink>
  );
};

export default PaymentReceiptPDFButton;