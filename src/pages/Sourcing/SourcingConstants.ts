/**
 * SourcingConstants.tsx
 * 
 * All constants, formatters, color maps, and dropdown option arrays
 * used across the sourcing module.
 */

// ─── Currency / Weight / Percentage formatters ──────────────────────────────

export const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined || amount === "") return "USh 0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "USh 0";
  return `USh ${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export const formatWeight = (kg: number | string | null | undefined): string => {
  if (kg === null || kg === undefined || kg === "") return "0 kg";
  const num = typeof kg === "string" ? parseFloat(kg) : kg;
  if (isNaN(num)) return "0 kg";
  return `${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kg`;
};

export const formatPercentage = (pct: number | string | null | undefined): string => {
  if (pct === null || pct === undefined || pct === "") return "0%";
  const num = typeof pct === "string" ? parseFloat(pct) : pct;
  if (isNaN(num)) return "0%";
  return `${num.toFixed(2)}%`;
};

/** Parse form value to number (handles string from inputs). */
const toNum = (v: number | string | null | undefined): number => {
  if (v === null || v === undefined || v === "") return 0;
  const n = typeof v === "string" ? parseFloat(v) : v;
  return isNaN(n) ? 0 : n;
};

/**
 * Total cost for a source order: (quantity × price per kg) + all cost fields.
 * Accepts form values (numbers or strings).
 */
export const calculateTotalCost = (values: Record<string, unknown>): number => {
  const qty = toNum(values.quantity_kg as number | string);
  const price = toNum(values.offered_price_per_kg as number | string);
  const lineTotal = qty * price;
  const costs =
    toNum(values.weighbridge_cost as number | string) +
    toNum(values.logistics_cost as number | string) +
    toNum(values.loading_cost as number | string) +
    toNum(values.offloading_cost as number | string) +
    toNum(values.handling_cost as number | string) +
    toNum(values.other_costs as number | string);
  return lineTotal + costs;
};

// ─── Status color maps (for MUI Chip color prop) ───────────────────────────

export const ORDER_STATUS_COLORS: Record<string, any> = {
  draft: "default",
  open: "default",
  sent: "info",
  accepted: "primary",
  in_transit: "warning",
  delivered: "info",
  completed: "success",
  cancelled: "error",
  rejected: "error",
};

export const INVOICE_STATUS_COLORS: Record<string, any> = {
  draft: "default",
  pending: "warning",
  partial: "warning",
  issued: "primary",
  paid: "success",
  overdue: "error",
  cancelled: "error",
};

export const PAYMENT_STATUS_COLORS: Record<string, any> = {
  pending: "warning",
  processing: "info",
  completed: "success",
  confirmed: "success",
  failed: "error",
  reversed: "default",
};

export const LOT_STATUS_COLORS: Record<string, any> = {
  available: "success",
  partially_sold: "warning",
  sold: "primary",
  rejected: "error",
};

export const CONDITION_COLORS: Record<string, any> = {
  good: "success",
  fair: "warning",
  poor: "error",
  damaged: "error",
};

export const REJECTION_STATUS_COLORS: Record<string, any> = {
  pending: "warning",
  replacement_sourced: "info",
  resolved: "success",
  written_off: "error",
};

export const SETTLEMENT_STATUS_COLORS: Record<string, any> = {
  pending: "warning",
  processing: "info",
  completed: "success",
  failed: "error",
};

// ─── Dropdown option arrays ─────────────────────────────────────────────────

export const ORDER_STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "open", label: "Open" },
  { value: "sent", label: "Sent" },
  { value: "accepted", label: "Accepted" },
  { value: "in_transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "rejected", label: "Rejected" },
];

export const INVOICE_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "partial", label: "Partially Paid" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
];

export const PAYMENT_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
];

export const PAYMENT_METHOD_OPTIONS = [
  { value: "mobile_money", label: "Mobile Money" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
];

export const REJECTION_STATUS_OPTIONS = [
  { value: "pending", label: "Pending Resolution" },
  { value: "replacement_sourced", label: "Replacement Being Sourced" },
  { value: "resolved", label: "Resolved" },
  { value: "written_off", label: "Written Off" },
];

export const REJECTION_REASON_OPTIONS = [
  { value: "quality_below_standard", label: "Quality Below Standard" },
  { value: "moisture_content", label: "High Moisture Content" },
  { value: "foreign_matter", label: "Foreign Matter" },
  { value: "pest_damage", label: "Pest/Insect Damage" },
  { value: "mold", label: "Mold/Fungal Growth" },
  { value: "color_discoloration", label: "Color/Discoloration" },
  { value: "wrong_grain_type", label: "Wrong Grain Type" },
  { value: "mixed_varieties", label: "Mixed Varieties" },
  { value: "buyer_rejection", label: "Buyer Rejection" },
  { value: "other", label: "Other" },
];

export const CONDITION_OPTIONS = [
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
  { value: "damaged", label: "Damaged" },
];

export const TRADE_TYPE_OPTIONS = [
  { value: "direct", label: "Direct Purchase" },
  { value: "aggregator", label: "Aggregator Trade" },
];

export const LOGISTICS_TYPE_OPTIONS = [
  { value: "supplier", label: "Supplier Arranged" },
  { value: "supplier_driver", label: "Supplier Driver" },
  { value: "bennu_truck", label: "Bennu Truck" },
  { value: "third_party", label: "Third Party" },
  { value: "company", label: "Company Arranged" },
];

export const BUYER_TYPE_OPTIONS = [
  { value: "grain_company", label: "Grain Company" },
  { value: "trader", label: "Trader" },
  { value: "processor", label: "Processor" },
  { value: "exporter", label: "Exporter" },
  { value: "retailer", label: "Retailer" },
  { value: "other", label: "Other" },
];

export const SALE_EXPENSE_CATEGORIES = [
  { value: "transport", label: "Transport/Logistics" },
  { value: "handling", label: "Handling/Loading" },
  { value: "weighbridge", label: "Weighbridge" },
  { value: "commission", label: "Commission/Brokerage" },
  { value: "insurance", label: "Insurance" },
  { value: "fumigation", label: "Fumigation/Treatment" },
  { value: "packaging", label: "Packaging/Bagging" },
  { value: "storage", label: "Storage" },
  { value: "other", label: "Other" },
];