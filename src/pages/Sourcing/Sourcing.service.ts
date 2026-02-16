import instance from "../../api";
import {
  ISupplierProfile, ISuppliersResults, ISourceOrder, ISourceOrdersResults,
  ISupplierInvoice, ISupplierInvoicesResults, IDeliveryRecord, IDeliveryRecordsResults,
  IWeighbridgeRecord, IWeighbridgeRecordsResults, ISupplierPayment, ISupplierPaymentsResults,
  INotification, INotificationsResults, ISupplierDashboard, IPaymentPreference,
  IInvestorAllocation, IInvestorAllocationsResults, IInvestorAccount,
  ISaleLot, ISaleLotsResults,
  IBuyerOrder, IBuyerOrdersResults, IBuyerOrderLine, ISaleExpense,
  IBuyerInvoice, IBuyerInvoicesResults,
  IBuyerPayment, IBuyerPaymentsResults,
  ITradeSettlement, ITradeSettlementsResults, IHubPLSummary,
} from "./Sourcing.interface";

export const SourcingService = {

  // ── Supplier Profiles ─────────────────────────────────────────────────────
  async getSuppliers(filters: Record<string, any>): Promise<ISuppliersResults> {
    return instance.get("sourcing/suppliers/", { params: filters }).then(r => r.data);
  },
  async getSupplierDetails(id: string): Promise<ISupplierProfile> {
    return instance.get(`sourcing/suppliers/${id}/`).then(r => r.data);
  },
  async createSupplier(payload: Partial<ISupplierProfile>): Promise<ISupplierProfile> {
    return instance.post("sourcing/suppliers/", payload).then(r => r.data);
  },
  async updateSupplier(id: string, payload: Partial<ISupplierProfile>): Promise<ISupplierProfile> {
    return instance.patch(`sourcing/suppliers/${id}/`, payload).then(r => r.data);
  },
  async deleteSupplier(id: string): Promise<void> {
    return instance.delete(`sourcing/suppliers/${id}/`).then(r => r.data);
  },
  async verifySupplier(id: string): Promise<ISupplierProfile> {
    return instance.post(`sourcing/suppliers/${id}/verify/`).then(r => r.data);
  },
//   async getMySupplierProfile(): Promise<ISupplierProfile> {
//     return instance.get("sourcing/suppliers/me/").then(r => r.data);
//   },

  // ============================================================================
  // SUPPLIER-SPECIFIC METHODS (for farmer users)
  // ============================================================================
  async getMySupplierProfile() {
    return instance
      .get("sourcing/supplier-profiles/")
      .then((response) => {
        const data = response.data;
        
        // Handle paginated response
        if (data.results && Array.isArray(data.results)) {
          if (data.results.length === 0) {
            throw new Error("No supplier profile found");
          }
          return data.results[0]; // Get first (only) result
        }
        
        return data;
      });
  },

  /**
   * Get the authenticated supplier's orders
   * Backend automatically filters to show only current supplier's orders
   */
  async getMySupplierOrders(filters?: any) {
    return instance
      .get("sourcing/source-orders/", { params: filters })
      .then((response) => response.data);
  },

  /**
   * Get the authenticated supplier's payment preferences
   * Backend automatically filters to show only current supplier's preferences
   */
  async getMyPaymentPreferences(filters?: any) {
    return instance
      .get("sourcing/payment-preferences/", { params: filters })
      .then((response) => response.data);
  },

  /**
   * Get the authenticated supplier's invoices
   * Backend automatically filters to show only current supplier's invoices
   */
  async getMySupplierInvoices(filters?: any) {
    return instance
      .get("sourcing/supplier-invoices/", { params: filters })
      .then((response) => response.data);
  },

  /**
   * Accept a source order (supplier action)
   */
  async acceptOrder(orderId: string) {
    return instance
      .post(`sourcing/source-orders/${orderId}/accept/`)
      .then((response) => response.data);
  },

  /**
   * Reject a source order (supplier action)
   */
  async rejectOrder(orderId: string, reason: string) {
    return instance
      .post(`sourcing/source-orders/${orderId}/reject/`, { reason })
      .then((response) => response.data);
  },


  // ── Payment Preferences ───────────────────────────────────────────────────
  async getPaymentPreferences(filters: Record<string, any>): Promise<{ results: IPaymentPreference[]; count: number }> {
    return instance.get("sourcing/payment-preferences/", { params: filters }).then(r => r.data);
  },
  async getPaymentPreferenceDetails(id: string): Promise<IPaymentPreference> {
    return instance.get(`sourcing/payment-preferences/${id}/`).then(r => r.data);
  },
  async createPaymentPreference(payload: Partial<IPaymentPreference>): Promise<IPaymentPreference> {
    return instance.post("sourcing/payment-preferences/", payload).then(r => r.data);
  },
  async updatePaymentPreference(id: string, payload: Partial<IPaymentPreference>): Promise<IPaymentPreference> {
    return instance.patch(`sourcing/payment-preferences/${id}/`, payload).then(r => r.data);
  },
  async deletePaymentPreference(id: string): Promise<void> {
    return instance.delete(`sourcing/payment-preferences/${id}/`).then(r => r.data);
  },

  // ── Source Orders ─────────────────────────────────────────────────────────
  async getSourceOrders(filters: Record<string, any>): Promise<ISourceOrdersResults> {
    return instance.get("sourcing/source-orders/", { params: filters }).then(r => r.data);
  },
  async getSourceOrderDetails(id: string): Promise<ISourceOrder> {
    return instance.get(`sourcing/source-orders/${id}/`).then(r => r.data);
  },
  async createSourceOrder(payload: Partial<ISourceOrder>): Promise<ISourceOrder> {
    return instance.post("sourcing/source-orders/", payload).then(r => r.data);
  },
  async updateSourceOrder(id: string, payload: Partial<ISourceOrder>): Promise<ISourceOrder> {
    return instance.patch(`sourcing/source-orders/${id}/`, payload).then(r => r.data);
  },
  async deleteSourceOrder(id: string): Promise<void> {
    return instance.delete(`sourcing/source-orders/${id}/`).then(r => r.data);
  },
  async sendToSupplier(id: string): Promise<ISourceOrder> {
    return instance.post(`sourcing/source-orders/${id}/send_to_supplier/`).then(r => r.data);
  },
//   async acceptOrder(id: string): Promise<ISourceOrder> {
//     return instance.post(`sourcing/source-orders/${id}/accept/`).then(r => r.data);
//   },
//   async rejectOrder(id: string, reason?: string): Promise<ISourceOrder> {
//     return instance
//       .post(`sourcing/source-orders/${id}/reject/`, { reason })
//       .then((response) => response.data);
//   },
  async markInTransit(id: string): Promise<ISourceOrder> {
    return instance.post(`sourcing/source-orders/${id}/mark_in_transit/`).then(r => r.data);
  },
  async cancelOrder(id: string, reason?: string): Promise<ISourceOrder> {
    return instance.post(`sourcing/source-orders/${id}/cancel/`, { reason }).then(r => r.data);
  },

  // ── Supplier Invoices ─────────────────────────────────────────────────────
  async getSupplierInvoices(filters: Record<string, any>): Promise<ISupplierInvoicesResults> {
    return instance.get("sourcing/supplier-invoices/", { params: filters }).then(r => r.data);
  },
  async getSupplierInvoiceDetails(id: string): Promise<ISupplierInvoice> {
    return instance.get(`sourcing/supplier-invoices/${id}/`).then(r => r.data);
  },
  async getMyInvoices(filters?: Record<string, any>): Promise<ISupplierInvoice[]> {
    return instance.get("sourcing/supplier-invoices/my_invoices/", { params: filters }).then(r => r.data);
  },

  // ── Deliveries ────────────────────────────────────────────────────────────
  async getDeliveryRecords(filters: Record<string, any>): Promise<IDeliveryRecordsResults> {
    return instance.get("sourcing/deliveries/", { params: filters }).then(r => r.data);
  },
  async getDeliveryRecordDetails(id: string): Promise<IDeliveryRecord> {
    return instance.get(`sourcing/deliveries/${id}/`).then(r => r.data);
  },
  async createDeliveryRecord(payload: Partial<IDeliveryRecord>): Promise<IDeliveryRecord> {
    return instance.post("sourcing/deliveries/", payload).then(r => r.data);
  },
  async updateDeliveryRecord(id: string, payload: Partial<IDeliveryRecord>): Promise<IDeliveryRecord> {
    return instance.patch(`sourcing/deliveries/${id}/`, payload).then(r => r.data);
  },

  // ── Weighbridge ───────────────────────────────────────────────────────────
  async getWeighbridgeRecords(filters: Record<string, any>): Promise<IWeighbridgeRecordsResults> {
    return instance.get("sourcing/weighbridge/", { params: filters }).then(r => r.data);
  },
  async getWeighbridgeRecordDetails(id: string): Promise<IWeighbridgeRecord> {
    return instance.get(`sourcing/weighbridge/${id}/`).then(r => r.data);
  },
  async createWeighbridgeRecord(payload: Partial<IWeighbridgeRecord>): Promise<IWeighbridgeRecord> {
    return instance.post("sourcing/weighbridge/", payload).then(r => r.data);
  },
  async updateWeighbridgeRecord(id: string, payload: Partial<IWeighbridgeRecord>): Promise<IWeighbridgeRecord> {
    return instance.patch(`sourcing/weighbridge/${id}/`, payload).then(r => r.data);
  },

  // ── Supplier Payments ─────────────────────────────────────────────────────
  async getSupplierPayments(filters: Record<string, any>): Promise<ISupplierPaymentsResults> {
    return instance.get("sourcing/supplier-payments/", { params: filters }).then(r => r.data);
  },
  async getSupplierPaymentDetails(id: string): Promise<ISupplierPayment> {
    return instance.get(`sourcing/supplier-payments/${id}/`).then(r => r.data);
  },
  async createSupplierPayment(payload: Partial<ISupplierPayment>): Promise<ISupplierPayment> {
    return instance.post("sourcing/supplier-payments/", payload).then(r => r.data);
  },
  async confirmSupplierPayment(id: string): Promise<ISupplierPayment> {
    return instance.post(`sourcing/supplier-payments/${id}/confirm/`).then(r => r.data);
  },
  // kept for backwards compat – calls the new confirm endpoint
  async markPaymentCompleted(id: string): Promise<ISupplierPayment> {
    return instance.post(`sourcing/supplier-payments/${id}/confirm/`).then(r => r.data);
  },

  // ── NEW: Investor Accounts (lookup) ──────────────────────────────────────
  async getInvestorAccounts(search?: string): Promise<{ results: IInvestorAccount[]; count: number }> {
    return instance.get("investors/accounts/", { params: { search, page_size: 50 } }).then(r => r.data);
  },

  // ── NEW: Investor Allocations ─────────────────────────────────────────────
  async getInvestorAllocations(filters: Record<string, any>): Promise<IInvestorAllocationsResults> {
    return instance.get("sourcing/investor-allocations/", { params: filters }).then(r => r.data);
  },
  async getInvestorAllocationDetails(id: string): Promise<IInvestorAllocation> {
    return instance.get(`sourcing/investor-allocations/${id}/`).then(r => r.data);
  },
  async createInvestorAllocation(payload: {
    investor_account: string;
    source_order: string;
    amount_allocated: number;
    notes?: string;
  }): Promise<IInvestorAllocation> {
    return instance.post("sourcing/investor-allocations/", payload).then(r => r.data);
  },

  // ── NEW: Sale Lots ────────────────────────────────────────────────────────
  async getSaleLots(filters: Record<string, any>): Promise<ISaleLotsResults> {
    return instance.get("sourcing/sale-lots/", { params: filters }).then(r => r.data);
  },
  async getSaleLotDetails(id: string): Promise<ISaleLot> {
    return instance.get(`sourcing/sale-lots/${id}/`).then(r => r.data);
  },
  async getAvailableSaleLots(filters?: Record<string, any>): Promise<ISaleLot[]> {
    return instance.get("sourcing/sale-lots/available/", { params: filters }).then(r => r.data);
  },

  // ── NEW: Buyer Orders ─────────────────────────────────────────────────────
  async getBuyerOrders(filters: Record<string, any>): Promise<IBuyerOrdersResults> {
    return instance.get("sourcing/buyer-orders/", { params: filters }).then(r => r.data);
  },
  async getBuyerOrderDetails(id: string): Promise<IBuyerOrder> {
    return instance.get(`sourcing/buyer-orders/${id}/`).then(r => r.data);
  },
  async createBuyerOrder(payload: Partial<IBuyerOrder>): Promise<IBuyerOrder> {
    return instance.post("sourcing/buyer-orders/", payload).then(r => r.data);
  },
  async updateBuyerOrder(id: string, payload: Partial<IBuyerOrder>): Promise<IBuyerOrder> {
    return instance.patch(`sourcing/buyer-orders/${id}/`, payload).then(r => r.data);
  },
  async addBuyerOrderLine(orderId: string, payload: Partial<IBuyerOrderLine>): Promise<IBuyerOrderLine> {
    return instance.post(`sourcing/buyer-orders/${orderId}/add_line/`, payload).then(r => r.data);
  },
  async removeBuyerOrderLine(orderId: string, lineId: string): Promise<void> {
    return instance.delete(`sourcing/buyer-orders/${orderId}/lines/${lineId}/`).then(r => r.data);
  },
  async addSaleExpense(orderId: string, payload: Partial<ISaleExpense>): Promise<ISaleExpense> {
    return instance.post(`sourcing/buyer-orders/${orderId}/add_expense/`, payload).then(r => r.data);
  },
  async confirmBuyerOrder(id: string): Promise<IBuyerOrder> {
    return instance.post(`sourcing/buyer-orders/${id}/confirm/`).then(r => r.data);
  },
  async dispatchBuyerOrder(id: string): Promise<IBuyerOrder> {
    return instance.post(`sourcing/buyer-orders/${id}/dispatch_order/`).then(r => r.data);
  },
  async deliverBuyerOrder(id: string): Promise<IBuyerOrder> {
    return instance.post(`sourcing/buyer-orders/${id}/deliver/`).then(r => r.data);
  },
  async issueBuyerInvoice(id: string, payload: { payment_terms_days?: number; notes?: string }): Promise<IBuyerInvoice> {
    return instance.post(`sourcing/buyer-orders/${id}/issue_invoice/`, payload).then(r => r.data);
  },
  async cancelBuyerOrder(id: string): Promise<IBuyerOrder> {
    return instance.post(`sourcing/buyer-orders/${id}/cancel/`).then(r => r.data);
  },
  async getBuyerOrderPLSummary(id: string): Promise<any> {
    return instance.get(`sourcing/buyer-orders/${id}/pl_summary/`).then(r => r.data);
  },

  // ── NEW: Buyer Invoices ───────────────────────────────────────────────────
  async getBuyerInvoices(filters: Record<string, any>): Promise<IBuyerInvoicesResults> {
    return instance.get("sourcing/buyer-invoices/", { params: filters }).then(r => r.data);
  },
  async getBuyerInvoiceDetails(id: string): Promise<IBuyerInvoice> {
    return instance.get(`sourcing/buyer-invoices/${id}/`).then(r => r.data);
  },
  async markBuyerInvoiceOverdue(id: string): Promise<IBuyerInvoice> {
    return instance.post(`sourcing/buyer-invoices/${id}/mark_overdue/`).then(r => r.data);
  },

  // ── NEW: Buyer Payments ───────────────────────────────────────────────────
  async getBuyerPayments(filters: Record<string, any>): Promise<IBuyerPaymentsResults> {
    return instance.get("sourcing/buyer-payments/", { params: filters }).then(r => r.data);
  },
  async createBuyerPayment(payload: Partial<IBuyerPayment>): Promise<IBuyerPayment> {
    return instance.post("sourcing/buyer-payments/", payload).then(r => r.data);
  },
  async confirmBuyerPayment(id: string): Promise<IBuyerPayment> {
    return instance.post(`sourcing/buyer-payments/${id}/confirm/`).then(r => r.data);
  },
  async reverseBuyerPayment(id: string): Promise<IBuyerPayment> {
    return instance.post(`sourcing/buyer-payments/${id}/reverse/`).then(r => r.data);
  },

  // ── NEW: Sale Expenses ────────────────────────────────────────────────────
  async getSaleExpenses(filters: Record<string, any>): Promise<{ results: ISaleExpense[]; count: number }> {
    return instance.get("sourcing/sale-expenses/", { params: filters }).then(r => r.data);
  },
  async deleteSaleExpense(id: string): Promise<void> {
    return instance.delete(`sourcing/sale-expenses/${id}/`).then(r => r.data);
  },

  // ── NEW: Trade Settlements ────────────────────────────────────────────────
  async getTradeSettlements(filters: Record<string, any>): Promise<ITradeSettlementsResults> {
    return instance.get("sourcing/trade-settlements/", { params: filters }).then(r => r.data);
  },
  async getTradeSettlementDetails(id: string): Promise<ITradeSettlement> {
    return instance.get(`sourcing/trade-settlements/${id}/`).then(r => r.data);
  },
  async getHubPLSummary(hubId?: string): Promise<IHubPLSummary> {
    return instance.get("sourcing/trade-settlements/hub_summary/", {
      params: hubId ? { hub: hubId } : {},
    }).then(r => r.data);
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  async getNotifications(filters: Record<string, any>): Promise<INotificationsResults> {
    return instance.get("sourcing/notifications/", { params: filters }).then(r => r.data);
  },
  async markNotificationRead(id: string): Promise<INotification> {
    return instance.post(`sourcing/notifications/${id}/mark_read/`).then(r => r.data);
  },
  async markAllNotificationsRead(): Promise<{ detail: string }> {
    return instance.post("sourcing/notifications/mark_all_read/").then(r => r.data);
  },
  async getUnreadCount(): Promise<{ unread_count: number }> {
    return instance.get("sourcing/notifications/unread_count/").then(r => r.data);
  },

  // ── Supplier Dashboard ────────────────────────────────────────────────────
  async getSupplierDashboard(): Promise<ISupplierDashboard> {
    return instance.get("sourcing/supplier-dashboard/").then(r => r.data);
  },

  // ── Lookups ───────────────────────────────────────────────────────────────
  async getUsers(search?: string): Promise<any> {
    return instance.get("auth/users/", { params: { role: "farmer", search, page_size: 50 } }).then(r => r.data);
  },
  async getHubs(search?: string): Promise<any> {
    return instance.get("hubs/", { params: { search, page_size: 50 } }).then(r => r.data);
  },
  async getGrainTypes(search?: string): Promise<any> {
    return instance.get("vouchers/grain-types/", { params: { search, page_size: 50 } }).then(r => r.data);
  },
  async getQualityGrades(search?: string): Promise<any> {
    return instance.get("vouchers/quality-grades/", { params: { search, page_size: 50 } }).then(r => r.data);
  },
};