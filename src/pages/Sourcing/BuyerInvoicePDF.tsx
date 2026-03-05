/**
 * BuyerInvoicePDF.tsx
 *
 * Drop-in "Download Invoice" button for:
 *   1. BuyerInvoices list  → receives IBuyerInvoice (list row)
 *   2. BuyerOrderDetails   → receives IBuyerOrder (full detail)
 *
 * Usage (list row — minimal data):
 *   <BuyerInvoicePDFButton invoice={row} />
 *
 * Usage (order detail page — rich data with line items):
 *   <BuyerInvoicePDFButton invoice={invoice} order={order} />
 *
 * The component fetches the full buyer order when `order` is not provided
 * so that line items are always present in the PDF.
 */

import React, { useState } from "react";
import { PDFDownloadLink, BlobProvider } from "@react-pdf/renderer";
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
import { IBuyerInvoice, IBuyerOrder } from "./Sourcing.interface";

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
function buildBuyerPDFProps(
  invoice: IBuyerInvoice,
  order?: IBuyerOrder | null
): IInvoiceDocumentProps {
  // ── Line items ──────────────────────────────────────────────────────────────
  const lines: IInvoiceLineItem[] = (order?.lines ?? []).map((line) => ({
    description: `${(line as any).grain_type_name ?? "Grain"} — Lot ${line.lot_number}`,
    qty: Number(line.quantity_kg),
    unit: "MT",
    unitPrice: Number(line.sale_price_per_kg),
    lineTotal: Number(line.line_total),
  }));

  // If no order lines available, show a single summary line from invoice total
  const fallbackLines: IInvoiceLineItem[] = lines.length === 0
    ? [{
        description: `Grain Sale — Order ${invoice.order_number}`,
        qty: 1,
        unit: "—",
        unitPrice: Number(invoice.amount_due),
        lineTotal: Number(invoice.amount_due),
      }]
    : lines;

  // ── Costs ───────────────────────────────────────────────────────────────────
  const costItems: ICostItem[] = [];
  if (order?.sale_expenses?.length) {
    order.sale_expenses.forEach((exp) => {
      costItems.push({
        label: exp.description || exp.category,
        amount: Number(exp.amount),
      });
    });
  } else {
    // Always show cost slots even when empty so the PDF layout is consistent
    [
      "Logistics", "Loading", "Offloading", "Weighbridge", "Others",
    ].forEach((label) => costItems.push({ label, amount: 0 }));
  }

  // ── Buyer info ──────────────────────────────────────────────────────────────
  // IBuyerProfileMinimal only has: id, business_name, buyer_type_display, phone,
  // email, default_credit_terms_days, outstanding_balance, credit_available.
  // Address / registration / country live on the flat IBuyerOrder fields.
  const billedToAddress = order?.buyer_address ?? "";

  return {
    invoiceType: "buyer",
    invoiceNumber: invoice.invoice_number,
    invoiceStatus: invoice.status,
    date: invoice.issued_at,
    dueDate: invoice.due_date,
    tradeType: "Buy",
    tradeId: (order as any)?.trade_id ?? "",
    poNumber: invoice.order_number,
    grnNumber: (order as any)?.grn_number ?? "",
    creditTermsDays: invoice.payment_terms_days,

    billedToName: invoice.buyer_name,
    billedToReg: (order as any)?.buyer_reg ?? "",
    billedToAddress,
    billedToCity: (order as any)?.buyer_city ?? "",
    billedToCountry: (order as any)?.buyer_country ?? "",
    shipTo: order?.buyer_address ?? "",

    lines: fallbackLines,
    costs: costItems,
    deposit: 0,
    tax: 0,
    currency: "USD",

    amountPaid: Number(invoice.amount_paid),
    bank: BENNU_BANK,

    payments: [],  // buyer payments not shown inline; they live in BuyerPayments page

    notes: order?.notes ?? invoice.notes ?? "",
  };
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface BuyerInvoicePDFButtonProps {
  /** IBuyerInvoice from list or detail page */
  invoice: IBuyerInvoice;
  /** Pre-loaded IBuyerOrder (pass from detail page to avoid extra fetch) */
  order?: IBuyerOrder | null;
  /** Button size */
  size?: "small" | "medium" | "large";
  /** Show icon-only compact variant (for table rows) */
  compact?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
const BuyerInvoicePDFButton: React.FC<BuyerInvoicePDFButtonProps> = ({
  invoice,
  order: orderProp = null,
  size = "small",
  compact = false,
}) => {
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [resolvedOrder, setResolvedOrder] = useState<IBuyerOrder | null>(orderProp);
  const [ready, setReady] = useState(orderProp != null);

  /**
   * On first click, fetch the buyer order if we don't already have it.
   * After that, the PDFDownloadLink renders and the browser download begins.
   */
  const handlePrepare = async () => {
    if (ready) return;
    setLoadingOrder(true);
    try {
      const o = await SourcingService.getBuyerOrderDetails(invoice.buyer_order);
      setResolvedOrder(o);
      setReady(true);
    } catch {
      toast.error("Failed to load order details for PDF");
    } finally {
      setLoadingOrder(false);
    }
  };

  const pdfProps = buildBuyerPDFProps(invoice, resolvedOrder);
  const fileName = `${invoice.invoice_number.replace(/\s/g, "_")}.pdf`;

  // ── Not yet ready — show "Prepare PDF" button ────────────────────────────
  if (!ready) {
    return (
      <Tooltip title="Fetch order details then download PDF">
        <Button
          size={size}
          variant={compact ? "text" : "outlined"}
          color="primary"
          onClick={handlePrepare}
          disabled={loadingOrder}
          startIcon={
            loadingOrder
              ? <CircularProgress size={14} color="inherit" />
              : <PictureAsPdfIcon />
          }
        >
          {compact ? "" : loadingOrder ? "Preparing…" : "Download PDF"}
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

export default BuyerInvoicePDFButton;