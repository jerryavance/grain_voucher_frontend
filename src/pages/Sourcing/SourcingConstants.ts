import { TOption } from "../../@types/common";

// ============ Status Color Mappings ============
export const ORDER_STATUS_COLORS: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
  draft: "default",
  open: "info",
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

// ============ Select Options ============
export const ORDER_STATUS_OPTIONS: TOption[] = [
  { value: "draft", label: "Draft" },
  { value: "open", label: "Open" },
  { value: "accepted", label: "Accepted" },
  { value: "in_transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "rejected", label: "Rejected" },
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

// ============ Helper Functions ============
export const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatWeight = (kg: number | string): string => {
  const num = typeof kg === 'string' ? parseFloat(kg) : kg;
  return `${num.toLocaleString('en-UG', { maximumFractionDigits: 2 })} kg`;
};

export const formatPercentage = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `${num.toFixed(2)}%`;
};

export const calculateTotalCost = (values: any): number => {
  const grain_cost = (values.quantity_kg || 0) * (values.offered_price_per_kg || 0);
  const weighbridge_cost = values.weighbridge_cost || 0;
  const logistics_cost = values.logistics_cost || 0;
  const handling_cost = values.handling_cost || 0;
  const other_costs = values.other_costs || 0;
  
  return grain_cost + weighbridge_cost + logistics_cost + handling_cost + other_costs;
};

export const getOrderStatusBadgeProps = (status: string) => {
  return {
    color: ORDER_STATUS_COLORS[status] || "default",
    label: status.replace(/_/g, ' ').toUpperCase(),
  };
};

export const getInvoiceStatusBadgeProps = (status: string) => {
  return {
    color: INVOICE_STATUS_COLORS[status] || "default",
    label: status.replace(/_/g, ' ').toUpperCase(),
  };
};

export const getPaymentStatusBadgeProps = (status: string) => {
  return {
    color: PAYMENT_STATUS_COLORS[status] || "default",
    label: status.replace(/_/g, ' ').toUpperCase(),
  };
};

// ============ Permission Helpers ============
export const canManageOrders = (userRole: string): boolean => {
  return ['hub_admin', 'bdm', 'finance'].includes(userRole);
};

export const canVerifySuppliers = (userRole: string): boolean => {
  return ['hub_admin', 'bdm'].includes(userRole);
};

export const canProcessPayments = (userRole: string): boolean => {
  return ['hub_admin', 'finance'].includes(userRole);
};

export const isSupplier = (userRole: string): boolean => {
  return userRole === 'farmer';
};