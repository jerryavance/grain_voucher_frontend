/**
 * SupplierInvoicePDF.tsx
 *
 * Drop-in "Download Invoice" button for:
 *   1. SupplierInvoices list  → receives ISupplierInvoice (list row)
 *   2. SupplierInvoiceDetails → receives ISupplierInvoice (full detail with payments_list)
 *
 * Usage (list row):
 *   <SupplierInvoicePDFButton invoice={row} />
 *
 * Usage (detail page — already has full data):
 *   <SupplierInvoicePDFButton invoice={invoice} isFullDetail />
 *
 * Full detail (ISupplierInvoice from the detail endpoint) contains:
 *   - source_order  (ISourceOrderList | ISourceOrder)
 *   - supplier      (ISupplierProfile)
 *   - payments_list (ISupplierPayment[])
 *
 * The component fetches the full invoice when `isFullDetail` is false
 * to ensure payment history and supplier info are always present.
 */

import React, { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Button, CircularProgress, Tooltip } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { toast } from "react-hot-toast";

import InvoiceDocument, {
  IInvoiceDocumentProps,
  IInvoiceLineItem,
  ICostItem,
  IPaymentRecord,
} from "./InvoiceDocument";
import { SourcingService } from "./Sourcing.service";
import { ISupplierInvoice, ISupplierProfile } from "./Sourcing.interface";

// ─── Bennu bank details ───────────────────────────────────────────────────────
const BENNU_BANK = {
  accountNumber: "9030026820951",
  accountHolder: "BENNU AGFIN SERVICES LIMITED",
  bankName: "STANBIC BANK",
  branch: "NAKASERO",
  currency: "USD",
  swift: "",
};

// ─── Map API data → PDF props ─────────────────────────────────────────────────
function buildSupplierPDFProps(invoice: ISupplierInvoice): IInvoiceDocumentProps {
  // source_order is typed ISourceOrderList (always present on a saved invoice).
  // Cast to any so we can safely access fields that may or may not be serialised
  // by the detail endpoint (e.g. grain_type_name, grain_cost).
  const order = invoice.source_order as any;
  const supplier = invoice.supplier as ISupplierProfile;
  const payments = invoice.payments_list ?? [];

  // ── Line item from source order ─────────────────────────────────────────────
  const lines: IInvoiceLineItem[] = [
    {
      description:
        order.grain_type_name ??
        (order.grain_type && typeof order.grain_type === "object"
          ? order.grain_type.name
          : "Grain Purchase"),
      qty: Number(order.quantity_kg ?? 0),
      unit: "MT",
      unitPrice: Number(order.offered_price_per_kg ?? 0),
      lineTotal: Number(
        order.grain_cost != null
          ? order.grain_cost
          : (Number(order.quantity_kg ?? 0) * Number(order.offered_price_per_kg ?? 0)) || Number(invoice.amount_due)
      ),
    },
  ];

  // ── Costs from source order ─────────────────────────────────────────────────
  const costItems: ICostItem[] = [
    { label: "Logistics",   amount: Number(order.logistics_cost   ?? 0) },
    { label: "Loading",     amount: Number(order.loading_cost     ?? 0) },
    { label: "Offloading",  amount: Number(order.offloading_cost  ?? 0) },
    { label: "Weighbridge", amount: Number(order.weighbridge_cost ?? 0) },
    { label: "Handling",    amount: Number(order.handling_cost    ?? 0) },
    { label: "Others",      amount: Number(order.other_costs      ?? 0) },
  ];

  // ── Payment history ─────────────────────────────────────────────────────────
  const paymentRecords: IPaymentRecord[] = payments.map((p: any) => ({
    paymentNumber: p.payment_number,
    method: p.method_display ?? p.method ?? "—",
    reference: p.reference_number ?? "—",
    amount: Number(p.amount),
    status: p.status,
    date: p.completed_at ?? p.created_at,
  }));

  // ── Supplier info ───────────────────────────────────────────────────────────
  const supplierName = supplier.business_name ?? "";
  const supplierHub = supplier.hub?.name ?? "";

  const paymentMethod =
    typeof invoice.payment_method === "object" && invoice.payment_method !== null
      ? (invoice.payment_method as any).method ?? invoice.payment_method
      : invoice.payment_method;

  return {
    invoiceType: "supplier",
    invoiceNumber: invoice.invoice_number,
    invoiceStatus: invoice.status,
    date: invoice.issued_at,
    dueDate: invoice.due_date,
    tradeType: order?.trade_type ?? "direct",
    tradeId: order?.order_number ?? "",
    poNumber: order?.order_number ?? "",
    grnNumber: (order as any)?.grn_number ?? "",

    billedToName: supplierName || "Supplier",
    billedToReg: "",
    billedToAddress: supplier.farm_location ?? "",
    billedToCity: supplier.hub?.name ?? "",
    billedToCountry: "Uganda",

    supplierName,
    supplierHub,

    lines,
    costs: costItems,
    deposit: 0,
    tax: 0,
    currency: "UGX",

    amountPaid: Number(invoice.amount_paid),
    paymentMethod: typeof paymentMethod === "string" ? paymentMethod : undefined,
    paymentReference: invoice.payment_reference,

    bank: BENNU_BANK,
    payments: paymentRecords,
    notes: invoice.notes,
  };
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface SupplierInvoicePDFButtonProps {
  /** ISupplierInvoice from list or detail page */
  invoice: ISupplierInvoice;
  /**
   * Pass true when the invoice already came from the detail endpoint
   * (i.e. it includes payments_list and full supplier/source_order objects).
   * Pass false (default) for list rows — component will fetch full detail first.
   */
  isFullDetail?: boolean;
  size?: "small" | "medium" | "large";
  compact?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
const SupplierInvoicePDFButton: React.FC<SupplierInvoicePDFButtonProps> = ({
  invoice: invoiceProp,
  isFullDetail = false,
  size = "small",
  compact = false,
}) => {
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [fullInvoice, setFullInvoice] = useState<ISupplierInvoice | null>(
    isFullDetail ? invoiceProp : null
  );
  const [ready, setReady] = useState(isFullDetail);

  const handlePrepare = async () => {
    if (ready) return;
    setLoadingDetail(true);
    try {
      const detail = await SourcingService.getSupplierInvoiceDetails(invoiceProp.id);
      setFullInvoice(detail);
      setReady(true);
    } catch {
      toast.error("Failed to load invoice details for PDF");
    } finally {
      setLoadingDetail(false);
    }
  };

  const invoice = fullInvoice ?? invoiceProp;
  const pdfProps = buildSupplierPDFProps(invoice);
  const fileName = `${invoice.invoice_number.replace(/\s/g, "_")}.pdf`;

  // ── Not yet ready ─────────────────────────────────────────────────────────
  if (!ready) {
    return (
      <Tooltip title="Fetch full invoice then download PDF">
        <Button
          size={size}
          variant={compact ? "text" : "outlined"}
          color="primary"
          onClick={handlePrepare}
          disabled={loadingDetail}
          startIcon={
            loadingDetail
              ? <CircularProgress size={14} color="inherit" />
              : <PictureAsPdfIcon />
          }
        >
          {compact ? "" : loadingDetail ? "Preparing…" : "Download PDF"}
        </Button>
      </Tooltip>
    );
  }

  // ── Ready — render PDFDownloadLink ────────────────────────────────────────
  return (
    <PDFDownloadLink
      document={<InvoiceDocument {...pdfProps} />}
      fileName={fileName}
      style={{ textDecoration: "none" }}
    >
      {({ loading: pdfLoading }) => (
        <Tooltip title={`Download ${invoice.invoice_number}`}>
          <Button
            size={size}
            variant={compact ? "text" : "contained"}
            color="success"
            disabled={pdfLoading}
            startIcon={
              pdfLoading
                ? <CircularProgress size={14} color="inherit" />
                : <DownloadIcon />
            }
          >
            {compact ? "" : pdfLoading ? "Building PDF…" : "Download PDF"}
          </Button>
        </Tooltip>
      )}
    </PDFDownloadLink>
  );
};

export default SupplierInvoicePDFButton;