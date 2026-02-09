import instance from "../../api";
import {
  ISupplierProfile,
  ISuppliersResults,
  ISourceOrder,
  ISourceOrdersResults,
  ISupplierInvoice,
  ISupplierInvoicesResults,
  IDeliveryRecord,
  IDeliveryRecordsResults,
  IWeighbridgeRecord,
  IWeighbridgeRecordsResults,
  ISupplierPayment,
  ISupplierPaymentsResults,
  INotification,
  INotificationsResults,
  ISupplierDashboard,
  IPaymentPreference,
} from "./Sourcing.interface";

export const SourcingService = {
  // ============ Supplier Profiles ============
  async getSuppliers(filters: Record<string, any>): Promise<ISuppliersResults> {
    return instance
      .get("sourcing/suppliers/", { params: filters })
      .then((response) => response.data);
  },

  async getSupplierDetails(id: string): Promise<ISupplierProfile> {
    return instance
      .get(`sourcing/suppliers/${id}/`)
      .then((response) => response.data);
  },

  async createSupplier(payload: Partial<ISupplierProfile>): Promise<ISupplierProfile> {
    return instance
      .post("sourcing/suppliers/", payload)
      .then((response) => response.data);
  },

  async updateSupplier(id: string, payload: Partial<ISupplierProfile>): Promise<ISupplierProfile> {
    return instance
      .patch(`sourcing/suppliers/${id}/`, payload)
      .then((response) => response.data);
  },

  async deleteSupplier(id: string): Promise<void> {
    return instance
      .delete(`sourcing/suppliers/${id}/`)
      .then((response) => response.data);
  },

  async verifySupplier(id: string): Promise<ISupplierProfile> {
    return instance
      .post(`sourcing/suppliers/${id}/verify/`)
      .then((response) => response.data);
  },

  async getMySupplierProfile(): Promise<ISupplierProfile> {
    return instance
      .get("sourcing/suppliers/me/")
      .then((response) => response.data);
  },

  // ============ Payment Preferences ============
  async getPaymentPreferences(filters: Record<string, any>): Promise<{ results: IPaymentPreference[], count: number }> {
    return instance
      .get("sourcing/payment-preferences/", { params: filters })
      .then((response) => response.data);
  },

  async createPaymentPreference(payload: Partial<IPaymentPreference>): Promise<IPaymentPreference> {
    return instance
      .post("sourcing/payment-preferences/", payload)
      .then((response) => response.data);
  },

  async updatePaymentPreference(id: string, payload: Partial<IPaymentPreference>): Promise<IPaymentPreference> {
    return instance
      .patch(`sourcing/payment-preferences/${id}/`, payload)
      .then((response) => response.data);
  },

  async deletePaymentPreference(id: string): Promise<void> {
    return instance
      .delete(`sourcing/payment-preferences/${id}/`)
      .then((response) => response.data);
  },

  // ============ Source Orders ============
  async getSourceOrders(filters: Record<string, any>): Promise<ISourceOrdersResults> {
    return instance
      .get("sourcing/source-orders/", { params: filters })
      .then((response) => response.data);
  },

  async getSourceOrderDetails(id: string): Promise<ISourceOrder> {
    return instance
      .get(`sourcing/source-orders/${id}/`)
      .then((response) => response.data);
  },

  async createSourceOrder(payload: Partial<ISourceOrder>): Promise<ISourceOrder> {
    return instance
      .post("sourcing/source-orders/", payload)
      .then((response) => response.data);
  },

  async updateSourceOrder(id: string, payload: Partial<ISourceOrder>): Promise<ISourceOrder> {
    return instance
      .patch(`sourcing/source-orders/${id}/`, payload)
      .then((response) => response.data);
  },

  async deleteSourceOrder(id: string): Promise<void> {
    return instance
      .delete(`sourcing/source-orders/${id}/`)
      .then((response) => response.data);
  },

  async sendToSupplier(id: string): Promise<ISourceOrder> {
    return instance
      .post(`sourcing/source-orders/${id}/send_to_supplier/`)
      .then((response) => response.data);
  },

  async acceptOrder(id: string): Promise<ISourceOrder> {
    return instance
      .post(`sourcing/source-orders/${id}/accept/`)
      .then((response) => response.data);
  },

  async rejectOrder(id: string, reason?: string): Promise<ISourceOrder> {
    return instance
      .post(`sourcing/source-orders/${id}/reject/`, { reason })
      .then((response) => response.data);
  },

  async markInTransit(id: string): Promise<ISourceOrder> {
    return instance
      .post(`sourcing/source-orders/${id}/mark_in_transit/`)
      .then((response) => response.data);
  },

  async cancelOrder(id: string, reason?: string): Promise<ISourceOrder> {
    return instance
      .post(`sourcing/source-orders/${id}/cancel/`, { reason })
      .then((response) => response.data);
  },

  // ============ Supplier Invoices ============
  async getSupplierInvoices(filters: Record<string, any>): Promise<ISupplierInvoicesResults> {
    return instance
      .get("sourcing/supplier-invoices/", { params: filters })
      .then((response) => response.data);
  },

  async getSupplierInvoiceDetails(id: string): Promise<ISupplierInvoice> {
    return instance
      .get(`sourcing/supplier-invoices/${id}/`)
      .then((response) => response.data);
  },

  async getMyInvoices(filters?: Record<string, any>): Promise<ISupplierInvoice[]> {
    return instance
      .get("sourcing/supplier-invoices/my_invoices/", { params: filters })
      .then((response) => response.data);
  },

  // ============ Delivery Records ============
  async getDeliveryRecords(filters: Record<string, any>): Promise<IDeliveryRecordsResults> {
    return instance
      .get("sourcing/deliveries/", { params: filters })
      .then((response) => response.data);
  },

  async getDeliveryRecordDetails(id: string): Promise<IDeliveryRecord> {
    return instance
      .get(`sourcing/deliveries/${id}/`)
      .then((response) => response.data);
  },

  async createDeliveryRecord(payload: Partial<IDeliveryRecord>): Promise<IDeliveryRecord> {
    return instance
      .post("sourcing/deliveries/", payload)
      .then((response) => response.data);
  },

  async updateDeliveryRecord(id: string, payload: Partial<IDeliveryRecord>): Promise<IDeliveryRecord> {
    return instance
      .patch(`sourcing/deliveries/${id}/`, payload)
      .then((response) => response.data);
  },

  // ============ Weighbridge Records ============
  async getWeighbridgeRecords(filters: Record<string, any>): Promise<IWeighbridgeRecordsResults> {
    return instance
      .get("sourcing/weighbridge/", { params: filters })
      .then((response) => response.data);
  },

  async getWeighbridgeRecordDetails(id: string): Promise<IWeighbridgeRecord> {
    return instance
      .get(`sourcing/weighbridge/${id}/`)
      .then((response) => response.data);
  },

  async createWeighbridgeRecord(payload: Partial<IWeighbridgeRecord>): Promise<IWeighbridgeRecord> {
    return instance
      .post("sourcing/weighbridge/", payload)
      .then((response) => response.data);
  },

  async updateWeighbridgeRecord(id: string, payload: Partial<IWeighbridgeRecord>): Promise<IWeighbridgeRecord> {
    return instance
      .patch(`sourcing/weighbridge/${id}/`, payload)
      .then((response) => response.data);
  },

  // ============ Supplier Payments ============
  async getSupplierPayments(filters: Record<string, any>): Promise<ISupplierPaymentsResults> {
    return instance
      .get("sourcing/supplier-payments/", { params: filters })
      .then((response) => response.data);
  },

  async getSupplierPaymentDetails(id: string): Promise<ISupplierPayment> {
    return instance
      .get(`sourcing/supplier-payments/${id}/`)
      .then((response) => response.data);
  },

  async createSupplierPayment(payload: Partial<ISupplierPayment>): Promise<ISupplierPayment> {
    return instance
      .post("sourcing/supplier-payments/", payload)
      .then((response) => response.data);
  },

  async markPaymentCompleted(id: string): Promise<ISupplierPayment> {
    return instance
      .post(`sourcing/supplier-payments/${id}/mark_completed/`)
      .then((response) => response.data);
  },

  // ============ Notifications ============
  async getNotifications(filters: Record<string, any>): Promise<INotificationsResults> {
    return instance
      .get("sourcing/notifications/", { params: filters })
      .then((response) => response.data);
  },

  async markNotificationRead(id: string): Promise<INotification> {
    return instance
      .post(`sourcing/notifications/${id}/mark_read/`)
      .then((response) => response.data);
  },

  async markAllNotificationsRead(): Promise<{ detail: string }> {
    return instance
      .post("sourcing/notifications/mark_all_read/")
      .then((response) => response.data);
  },

  async getUnreadCount(): Promise<{ unread_count: number }> {
    return instance
      .get("sourcing/notifications/unread_count/")
      .then((response) => response.data);
  },

  // ============ Supplier Dashboard ============
  async getSupplierDashboard(): Promise<ISupplierDashboard> {
    return instance
      .get("sourcing/supplier-dashboard/")
      .then((response) => response.data);
  },
};