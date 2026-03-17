// shared/utils/formatters.ts
/**
 * Shared formatting utilities used across the Grain Voucher frontend.
 */

/**
 * Format a number as UGX currency.
 * e.g. 4665000 → "USh 4,665,000"
 */
export const formatCurrency = (
    value: number | string | null | undefined,
    prefix = "USh"
  ): string => {
    if (value === null || value === undefined || value === "" || value === "—")
      return "—";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "—";
    const formatted = Math.round(num).toLocaleString("en-UG");
    return `${prefix} ${formatted}`;
  };
  
  /**
   * Format kg values.
   * e.g. 9600 → "9,600 kg"
   */
  export const formatKg = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined || value === "") return "—";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "—";
    return `${Math.round(num).toLocaleString("en-UG")} kg`;
  };
  
  /**
   * Format a date string or Date object.
   * e.g. "2026-03-08" → "08/03/2026"
   */
  export const formatDate = (
    value: string | Date | null | undefined
  ): string => {
    if (!value) return "—";
    const d = typeof value === "string" ? new Date(value) : value;
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  
  /**
   * Format percentage.
   * e.g. 2.13 → "2.13%"
   */
  export const formatPct = (
    value: number | string | null | undefined
  ): string => {
    if (value === null || value === undefined || value === "") return "—";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "—";
    return `${num.toFixed(2)}%`;
  };
  
  /**
   * Status badge color mapping.
   */
  export const getStatusColor = (status: string): string => {
    const map: Record<string, string> = {
      // Source orders
      draft: "#9e9e9e",
      sent: "#2196f3",
      accepted: "#1565c0",
      in_transit: "#ff9800",
      delivered: "#7c4dff",
      completed: "#4caf50",
      cancelled: "#f44336",
      // Invoices
      pending: "#ff9800",
      partial: "#ff9800",
      paid: "#4caf50",
      issued: "#2196f3",
      overdue: "#f44336",
      // Payments
      confirmed: "#4caf50",
      processing: "#ff9800",
      failed: "#f44336",
      reversed: "#f44336",
      // Sale lots
      available: "#4caf50",
      partially_sold: "#ff9800",
      sold: "#1565c0",
      rejected: "#f44336",
      // Allocations
      active: "#2196f3",
      settled: "#4caf50",
    };
    return map[status] || "#9e9e9e";
  };
  
  /**
   * Pretty-print a status slug.
   * e.g. "in_transit" → "In Transit", "partially_sold" → "Partially Sold"
   */
  export const formatStatus = (status: string): string => {
    if (!status) return "—";
    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };