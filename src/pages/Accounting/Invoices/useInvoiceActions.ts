import { useState } from "react";
import { toast } from "react-hot-toast";
// @ts-ignore-next-line
import { InvoiceService } from "../Invoices.service";
// @ts-ignore-next-line
import { IInvoice } from "../Invoices.interface";

/**
 * Custom hook for invoice actions with loading states and error handling
 * Centralizes common invoice operations
 */
export const useInvoiceActions = (onSuccess?: () => void) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (
    action: () => Promise<any>,
    successMessage: string,
    errorMessage: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      await action();
      toast.success(successMessage);
      onSuccess && onSuccess();
    } catch (err: any) {
      const message = err.response?.data?.error || errorMessage;
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const finalizeInvoice = async (invoice: IInvoice) => {
    if (invoice.status !== "draft") {
      toast.error("Only draft invoices can be finalized");
      return;
    }

    if (!invoice.line_items || invoice.line_items.length === 0) {
      toast.error("Cannot finalize invoice with no line items");
      return;
    }

    return handleAction(
      () => InvoiceService.finalizeInvoice(invoice.id),
      `Invoice ${invoice.invoice_number} finalized successfully`,
      "Failed to finalize invoice"
    );
  };

  const sendInvoice = async (invoice: IInvoice) => {
    if (!["draft", "issued"].includes(invoice.status)) {
      toast.error("Cannot send invoice in current status");
      return;
    }

    return handleAction(
      () => InvoiceService.sendInvoice(invoice.id),
      `Invoice ${invoice.invoice_number} sent successfully`,
      "Failed to send invoice"
    );
  };

  const sendReminder = async (invoice: IInvoice) => {
    if (invoice.payment_status === "paid") {
      toast.error("Invoice is already paid");
      return;
    }

    return handleAction(
      () => InvoiceService.sendReminder(invoice.id),
      "Payment reminder sent successfully",
      "Failed to send payment reminder"
    );
  };

  const cancelInvoice = async (invoice: IInvoice, reason?: string) => {
    if (["paid", "cancelled", "written_off"].includes(invoice.status)) {
      toast.error(`Cannot cancel invoice in ${invoice.status} status`);
      return;
    }

    const cancelReason =
      reason ||
      window.prompt(`Cancelling invoice ${invoice.invoice_number}. Please provide a reason:`);

    if (!cancelReason) {
      return;
    }

    return handleAction(
      () => InvoiceService.cancelInvoice(invoice.id, cancelReason),
      `Invoice ${invoice.invoice_number} cancelled successfully`,
      "Failed to cancel invoice"
    );
  };

  const deleteInvoice = async (invoice: IInvoice) => {
    if (invoice.status !== "draft") {
      toast.error("Only draft invoices can be deleted");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete invoice ${invoice.invoice_number}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    return handleAction(
      () => InvoiceService.deleteInvoice(invoice.id),
      `Invoice ${invoice.invoice_number} deleted successfully`,
      "Failed to delete invoice"
    );
  };

  const addGRNToInvoice = async (invoiceId: string, grnId: string) => {
    return handleAction(
      () => InvoiceService.addGRNToInvoice(invoiceId, grnId),
      "GRN added to invoice successfully",
      "Failed to add GRN to invoice"
    );
  };

  const removeGRNFromInvoice = async (invoiceId: string, grnId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this GRN from the invoice?"
    );

    if (!confirmed) {
      return;
    }

    return handleAction(
      () => InvoiceService.removeGRNFromInvoice(invoiceId, grnId),
      "GRN removed from invoice successfully",
      "Failed to remove GRN from invoice"
    );
  };

  const generateScheduledInvoices = async () => {
    const confirmed = window.confirm(
      "This will generate all scheduled invoices now. Continue?"
    );

    if (!confirmed) {
      return;
    }

    return handleAction(
      () => InvoiceService.generateScheduledNow(),
      "Scheduled invoices generated successfully",
      "Failed to generate scheduled invoices"
    );
  };

  return {
    loading,
    error,
    finalizeInvoice,
    sendInvoice,
    sendReminder,
    cancelInvoice,
    deleteInvoice,
    addGRNToInvoice,
    removeGRNFromInvoice,
    generateScheduledInvoices,
  };
};

/**
 * Hook for fetching invoice-related data
 */
export const useInvoiceData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWithErrorHandling = async <T,>(
    fetchFn: () => Promise<T>,
    errorMessage: string
  ): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      return await fetchFn();
    } catch (err: any) {
      const message = err.response?.data?.error || errorMessage;
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getInvoiceDetails = (id: string) => {
    return fetchWithErrorHandling(
      () => InvoiceService.getInvoiceDetails(id),
      "Failed to fetch invoice details"
    );
  };

  const getUninvoicedGRNs = (accountId?: string) => {
    return fetchWithErrorHandling(
      () => InvoiceService.getUninvoicedGRNs(accountId),
      "Failed to fetch uninvoiced GRNs"
    );
  };

  const getSummary = () => {
    return fetchWithErrorHandling(
      () => InvoiceService.getSummary(),
      "Failed to fetch invoice summary"
    );
  };

  const getAging = () => {
    return fetchWithErrorHandling(
      () => InvoiceService.getAging(),
      "Failed to fetch aging report"
    );
  };

  return {
    loading,
    error,
    getInvoiceDetails,
    getUninvoicedGRNs,
    getSummary,
    getAging,
  };
};

/**
 * Example usage:
 * 
 * const InvoiceActionButton = ({ invoice }) => {
 *   const { finalizeInvoice, loading } = useInvoiceActions(refreshInvoices);
 *   
 *   return (
 *     <Button 
 *       onClick={() => finalizeInvoice(invoice)}
 *       disabled={loading}
 *     >
 *       Finalize
 *     </Button>
 *   );
 * };
 * 
 * const InvoiceDetails = ({ id }) => {
 *   const { getInvoiceDetails, loading } = useInvoiceData();
 *   const [invoice, setInvoice] = useState(null);
 *   
 *   useEffect(() => {
 *     getInvoiceDetails(id).then(setInvoice);
 *   }, [id]);
 *   
 *   if (loading) return <Spinner />;
 *   return <div>{invoice?.invoice_number}</div>;
 * };
 */