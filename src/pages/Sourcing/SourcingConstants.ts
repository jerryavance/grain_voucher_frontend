// SOURCING CONSTANTS — updated
import { TOption } from "../../@types/common";

// ============ Status Color Mappings ============
export const ORDER_STATUS_COLORS: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
  draft: "default",
  open: "info",
  sent: "info",       // NEW
  accepted: "primary",
  in_transit: "warning",
  delivered: "secondary",
  completed: "success",
  cancelled: "error",
  rejected: "error",
};

export const INVOICE_STATUS_COLORS: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
  pending: "warning",
  partial: "info",
  paid: "success",
  cancelled: "error",
};

export const PAYMENT_STATUS_COLORS: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
  pending: "warning",
  processing: "info",
  completed: "success",
  failed: "error",
  refunded: "secondary",
};

export const CONDITION_COLORS: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
  good: "success",
  fair: "warning",
  poor: "error",
};

// NEW: Lot status colors — includes 'rejected'
export const LOT_STATUS_COLORS: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
  available: "success",
  partially_sold: "warning",
  sold: "default",
  rejected: "error",
};

// NEW: Rejection status colors
export const REJECTION_STATUS_COLORS: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
  pending: "warning",
  replacement_sourced: "info",
  resolved: "success",
  written_off: "default",
};

// ============ Select Options ============
export const ORDER_STATUS_OPTIONS: TOption[] = [
  { value: "draft", label: "Draft" },
  { value: "open", label: "Open" },
  { value: "sent", label: "Sent to Supplier" },
  { value: "accepted", label: "Accepted" },
  { value: "in_transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "rejected", label: "Rejected" },
];

// NEW: Trade type options
export const TRADE_TYPE_OPTIONS: TOption[] = [
  { value: "direct", label: "Direct Purchase" },
  { value: "aggregator", label: "Aggregator Trade" },
];

export const LOGISTICS_TYPE_OPTIONS: TOption[] = [
  { value: "bennu_truck", label: "Bennu Truck" },
  { value: "supplier_driver", label: "Supplier Driver" },
  { value: "third_party", label: "Third Party Logistics" },
];

export const PAYMENT_METHOD_OPTIONS: TOption[] = [
  { value: "mobile_money", label: "Mobile Money" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash Pickup" },
  { value: "check", label: "Bank Check" },
];

export const INVOICE_STATUS_OPTIONS: TOption[] = [
  { value: "pending", label: "Pending" },
  { value: "partial", label: "Partially Paid" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
];

export const PAYMENT_STATUS_OPTIONS: TOption[] = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

export const CONDITION_OPTIONS: TOption[] = [
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

// NEW: Rejection reason options
export const REJECTION_REASON_OPTIONS: TOption[] = [
  { value: "quality", label: "Quality Issues" },
  { value: "moisture", label: "High Moisture" },
  { value: "contamination", label: "Contamination" },
  { value: "weight_short", label: "Weight Shortage" },
  { value: "pest_damage", label: "Pest Damage" },
  { value: "wrong_variety", label: "Wrong Variety" },
  { value: "other", label: "Other" },
];

// NEW: Rejection status options
export const REJECTION_STATUS_OPTIONS: TOption[] = [
  { value: "pending", label: "Pending" },
  { value: "replacement_sourced", label: "Replacement Sourced" },
  { value: "resolved", label: "Resolved" },
  { value: "written_off", label: "Written Off" },
];

// ============ Helper Functions ============
export const formatCurrency = (amount: number | string | undefined | null): string => {
  if (amount == null || amount === "") return "UGX 0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "UGX 0";
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatWeight = (kg: number | string | undefined | null): string => {
  if (kg == null || kg === "") return "0 kg";
  const num = typeof kg === "string" ? parseFloat(kg) : kg;
  if (isNaN(num)) return "0 kg";
  return `${num.toLocaleString("en-UG", { maximumFractionDigits: 2 })} kg`;
};

export const formatPercentage = (value: number | string | undefined | null): string => {
  if (value == null || value === "") return "0.00%";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0.00%";
  return `${num.toFixed(2)}%`;
};

// UPDATED: now includes loading_cost + offloading_cost
export const calculateTotalCost = (values: any): number => {
  const quantity = parseFloat(values.quantity_kg) || 0;
  const price = parseFloat(values.offered_price_per_kg) || 0;
  const weighbridge = parseFloat(values.weighbridge_cost) || 0;
  const logistics = parseFloat(values.logistics_cost) || 0;
  const loading = parseFloat(values.loading_cost) || 0;
  const offloading = parseFloat(values.offloading_cost) || 0;
  const handling = parseFloat(values.handling_cost) || 0;
  const other = parseFloat(values.other_costs) || 0;

  const grain_cost = quantity * price;
  return grain_cost + weighbridge + logistics + loading + offloading + handling + other;
};

export const getOrderStatusBadgeProps = (status: string) => {
  return {
    color: ORDER_STATUS_COLORS[status] || "default",
    label: status.replace(/_/g, " ").toUpperCase(),
  };
};

export const getInvoiceStatusBadgeProps = (status: string) => {
  return {
    color: INVOICE_STATUS_COLORS[status] || "default",
    label: status.replace(/_/g, " ").toUpperCase(),
  };
};

export const getPaymentStatusBadgeProps = (status: string) => {
  return {
    color: PAYMENT_STATUS_COLORS[status] || "default",
    label: status.replace(/_/g, " ").toUpperCase(),
  };
};

// ============ Permission Helpers ============
export const canManageOrders = (userRole: string): boolean => {
  return ["hub_admin", "bdm", "finance"].includes(userRole);
};

export const canVerifySuppliers = (userRole: string): boolean => {
  return ["hub_admin", "bdm"].includes(userRole);
};

export const canProcessPayments = (userRole: string): boolean => {
  return ["hub_admin", "finance"].includes(userRole);
};

export const isSupplier = (userRole: string): boolean => {
  return userRole === "farmer";
};