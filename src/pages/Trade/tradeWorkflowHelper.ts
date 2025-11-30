// src/utils/tradeWorkflowHelper.ts
import { ITrade, ITradeListItem } from "./Trade.interface";

/**
 * Get user-friendly message about what to do next with this trade
 */
export const getNextActionMessage = (trade: ITrade | ITradeListItem): string => {
  if (trade.status === 'draft') {
    return "Submit trade for approval";
  }
  
  if (trade.status === 'pending_approval') {
    return "Waiting for approval from finance team";
  }
  
  if (trade.status === 'approved') {
    if (trade.requires_financing && !trade.financing_complete) {
      return "Allocate investor financing before delivery";
    }
    if (trade.requires_voucher_allocation && !trade.allocation_complete) {
      return "Allocate vouchers before delivery";
    }
    return "Trade approved! Ready to start delivery";
  }
  
  if (trade.status === 'ready_for_delivery') {
    return "Create first delivery batch to generate invoice";
  }
  
  if (trade.status === 'in_transit') {
    const remaining = (trade as any).remaining_quantity_kg || 0;
    if (remaining > 0) {
      return `Create delivery batch for remaining ${remaining.toLocaleString()} kg`;
    }
    return "All deliveries created - waiting for final delivery confirmation";
  }
  
  if (trade.status === 'delivered') {
    const completion = (trade as any).delivery_completion_percentage || 0;
    if (completion < 100) {
      return "Complete remaining deliveries";
    }
    return "All goods delivered - collect outstanding payments to complete trade";
  }
  
  if (trade.status === 'completed') {
    return "Trade completed successfully!";
  }
  
  if (trade.status === 'cancelled') {
    return "Trade cancelled";
  }
  
  if (trade.status === 'rejected') {
    return "Trade rejected";
  }
  
  return "";
};

/**
 * Check if user can create a new delivery batch
 */
export const canCreateDelivery = (trade: ITrade | ITradeListItem): boolean => {
  const validStatuses = ['ready_for_delivery', 'in_transit', 'delivered'];
  const remaining = (trade as any).remaining_quantity_kg || 0;
  
  return validStatuses.includes(trade.status) && remaining > 0;
};

/**
 * Check if trade can be marked as completed
 */
export const canMarkCompleted = (trade: ITrade): boolean => {
  const deliveryComplete = (trade.delivery_completion_percentage || 0) >= 100;
  const paymentsComplete = (trade as any).payment_summary?.all_paid || false;
  
  return trade.status === 'delivered' && deliveryComplete && paymentsComplete;
};

/**
 * Get delivery status color for chips
 */
export const getDeliveryStatusColor = (
  completionPercentage: number
): "default" | "primary" | "secondary" | "success" | "warning" | "error" => {
  if (completionPercentage === 0) return "default";
  if (completionPercentage < 50) return "warning";
  if (completionPercentage < 100) return "primary";
  return "success";
};

/**
 * Get payment status color for chips
 */
export const getPaymentStatusColor = (
  status?: string
): "default" | "primary" | "secondary" | "success" | "warning" | "error" => {
  const statusColors: Record<string, any> = {
    pending: "warning",
    partial: "info",
    paid: "success",
    overdue: "error",
    unpaid: "error",
  };
  return statusColors[status?.toLowerCase() || "pending"] || "default";
};

/**
 * Get trade status color for chips
 */
export const getTradeStatusColor = (
  status: string
): "default" | "primary" | "secondary" | "success" | "warning" | "error" => {
  const statusColors: Record<string, any> = {
    draft: "default",
    pending_approval: "warning",
    approved: "info",
    ready_for_delivery: "primary",
    in_transit: "secondary",
    delivered: "success",
    completed: "success",
    cancelled: "error",
    rejected: "error",
  };
  return statusColors[status] || "default";
};

/**
 * Format currency for UGX
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format number with locale
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat("en-UG", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Format date to locale string
 */
export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("en-UG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format datetime to locale string
 */
export const formatDateTime = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString("en-UG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Get delivery progress percentage text
 */
export const getDeliveryProgressText = (
  deliveredKg: number,
  totalKg: number
): string => {
  const percentage = totalKg > 0 ? (deliveredKg / totalKg) * 100 : 0;
  return `${formatNumber(deliveredKg, 0)} / ${formatNumber(totalKg, 0)} kg (${percentage.toFixed(1)}%)`;
};

/**
 * Check if trade requires user action
 */
export const requiresUserAction = (trade: ITrade | ITradeListItem): boolean => {
  if (trade.status === 'draft') return true;
  if (trade.status === 'pending_approval') return false; // Waiting on others
  
  if (trade.status === 'approved') {
    if (trade.requires_financing && !trade.financing_complete) return true;
    if (trade.requires_voucher_allocation && !trade.allocation_complete) return true;
    return true; // Can progress to ready_for_delivery
  }
  
  if (trade.status === 'ready_for_delivery') return true; // Can create first delivery
  
  if (trade.status === 'in_transit') {
    const remaining = (trade as any).remaining_quantity_kg || 0;
    return remaining > 0; // More deliveries needed
  }
  
  if (trade.status === 'delivered') {
    const paymentDue = trade.amount_due || 0;
    return paymentDue > 0; // Payment collection needed
  }
  
  return false;
};