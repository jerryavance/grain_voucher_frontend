// src/pages/Trade/Trade.service.ts - COMPLETE VERSION
import instance from "../../api";
import {
  IVoucherAllocationRequest,
  IProgressStatusRequest,
  IApproveRejectRequest,
  ICreateDeliveryBatchRequest,
} from "./Trade.interface";

export const TradeService = {
  // ========== TRADE CRUD ==========
  async getTrades(filters: Record<string, any>) {
    return instance
      .get("trade/trades/", { params: filters })
      .then((response) => response.data);
  },

  async getTradeDetails(id: string) {
    return instance
      .get(`trade/trades/${id}/`)
      .then((response) => response.data);
  },

  async createTrade(payload: any) {
    return instance
      .post("trade/trades/", payload)
      .then((response) => response.data);
  },

  async updateTrade(payload: any, id: string) {
    return instance
      .patch(`trade/trades/${id}/`, payload)
      .then((response) => response.data);
  },

  async deleteTrade(id: string) {
    return instance
      .delete(`trade/trades/${id}/`)
      .then((response) => response.data);
  },

  // ========== TRADE WORKFLOW ACTIONS ==========
  async progressStatus(id: string, payload: IProgressStatusRequest) {
    return instance
      .post(`trade/trades/${id}/progress_status/`, payload)
      .then((response) => response.data);
  },

  async quickApprove(id: string, payload: IApproveRejectRequest) {
    return instance
      .post(`trade/trades/${id}/quick_approve/`, payload)
      .then((response) => response.data);
  },

  async quickReject(id: string, payload: IApproveRejectRequest) {
    return instance
      .post(`trade/trades/${id}/quick_reject/`, payload)
      .then((response) => response.data);
  },

  // ✅ CRITICAL: This method was missing!
  async allocateVouchers(id: string, payload: IVoucherAllocationRequest) {
    return instance
      .post(`trade/trades/${id}/allocate_vouchers/`, payload)
      .then((response) => response.data);
  },

  // ========== MULTI-DELIVERY ENDPOINTS ==========
  async createDeliveryBatch(id: string, payload: ICreateDeliveryBatchRequest) {
    return instance
      .post(`trade/trades/${id}/create_delivery_batch/`, payload)
      .then((response) => response.data);
  },

  async getDeliveryProgress(id: string) {
    return instance
      .get(`trade/trades/${id}/delivery_progress/`)
      .then((response) => response.data);
  },

  async markCompleted(id: string) {
    return instance
      .post(`trade/trades/${id}/mark_completed/`)
      .then((response) => response.data);
  },

  // ========== INVOICE & PAYMENT ENDPOINTS ==========
  async getInvoicesAndPayments(id: string) {
    return instance
      .get(`trade/trades/${id}/invoices_and_payments/`)
      .then((response) => response.data);
  },

  async getPaymentInfo(id: string) {
    return instance
      .get(`trade/trades/${id}/payment_info/`)
      .then((response) => response.data);
  },

  // ========== COST BREAKDOWN ==========
  async getCostBreakdown(id: string) {
    return instance
      .get(`trade/trades/${id}/cost_breakdown/`)
      .then((response) => response.data);
  },

  async getDeliveryStatusCheck(id: string) {
    return instance
      .get(`trade/trades/${id}/delivery_status_check/`)
      .then((response) => response.data);
  },

  // ========== DASHBOARD ==========
  async getDashboardStats(filters?: Record<string, any>) {
    return instance
      .get("trade/trades/dashboard_stats/", { params: filters })
      .then((response) => response.data);
  },

  // ========== TRADE FINANCING ==========
  async getFinancingAllocations(filters: Record<string, any>) {
    return instance
      .get("trade/financing/", { params: filters })
      .then((response) => response.data);
  },

  async createFinancingAllocation(payload: any) {
    return instance
      .post("trade/financing/", payload)
      .then((response) => response.data);
  },

  async updateFinancingAllocation(payload: any, id: string) {
    return instance
      .patch(`trade/financing/${id}/`, payload)
      .then((response) => response.data);
  },

  async deleteFinancingAllocation(id: string) {
    return instance
      .delete(`trade/financing/${id}/`)
      .then((response) => response.data);
  },

  // ========== TRADE LOANS ==========
  async getLoans(filters: Record<string, any>) {
    return instance
      .get("trade/loans/", { params: filters })
      .then((response) => response.data);
  },

  async createLoan(payload: any) {
    return instance
      .post("trade/loans/", payload)
      .then((response) => response.data);
  },

  async updateLoan(payload: any, id: string) {
    return instance
      .patch(`trade/loans/${id}/`, payload)
      .then((response) => response.data);
  },

  async repayLoan(id: string, payload: { amount: number }) {
    return instance
      .post(`trade/loans/${id}/repay/`, payload)
      .then((response) => response.data);
  },

  // ========== TRADE COSTS ==========
  async getTradeCosts(filters: Record<string, any>) {
    return instance
      .get("trade/costs/", { params: filters })
      .then((response) => response.data);
  },

  async createTradeCost(payload: any) {
    return instance
      .post("trade/costs/", payload)
      .then((response) => response.data);
  },

  async updateTradeCost(payload: any, id: string) {
    return instance
      .patch(`trade/costs/${id}/`, payload)
      .then((response) => response.data);
  },

  async deleteTradeCost(id: string) {
    return instance
      .delete(`trade/costs/${id}/`)
      .then((response) => response.data);
  },

  // ========== BROKERAGES ==========
  async getBrokerages(filters: Record<string, any>) {
    return instance
      .get("trade/brokerages/", { params: filters })
      .then((response) => response.data);
  },

  async createBrokerage(payload: any) {
    return instance
      .post("trade/brokerages/", payload)
      .then((response) => response.data);
  },

  async updateBrokerage(payload: any, id: string) {
    return instance
      .patch(`trade/brokerages/${id}/`, payload)
      .then((response) => response.data);
  },

  async deleteBrokerage(id: string) {
    return instance
      .delete(`trade/brokerages/${id}/`)
      .then((response) => response.data);
  },

  async getMyCommissions() {
    return instance
      .get("trade/brokerages/my_commissions/")
      .then((response) => response.data);
  },

  // ========== GOODS RECEIVED NOTES (GRNs) ==========
  async getGRNs(filters: Record<string, any>) {
    return instance
      .get("trade/grns/", { params: filters })
      .then((response) => response.data);
  },

  async getGRNDetails(id: string) {
    return instance
      .get(`trade/grns/${id}/`)
      .then((response) => response.data);
  },

  async createGRN(payload: any) {
    return instance
      .post("trade/grns/", payload)
      .then((response) => response.data);
  },

  async updateGRN(payload: any, id: string) {
    return instance
      .patch(`trade/grns/${id}/`, payload)
      .then((response) => response.data);
  },

  async getGRNInvoiceStatus(id: string) {
    return instance
      .get(`trade/grns/${id}/invoice_status/`)
      .then((response) => response.data);
  },

  async getGRNsByTrade(tradeId: string) {
    return instance
      .get(`trade/grns/by_trade/`, { params: { trade_id: tradeId } })
      .then((response) => response.data);
  },

  // ========== LOOKUPS ==========
  async getBuyers(search?: string) {
    return instance
      .get("crm/accounts/", {
        params: { type: "customer", search, page_size: 50 },
      })
      .then((response) => response.data);
  },

  async getSuppliers(search?: string) {
    return instance
      .get("auth/users/", {
        params: { role: "farmer", search, page_size: 50 },
      })
      .then((response) => response.data);
  },

  async getGrainTypes(search?: string) {
    return instance
      .get("vouchers/grain-types/", {
        params: { search, page_size: 50 },
      })
      .then((response) => response.data);
  },

  async getQualityGrades(search?: string) {
    return instance
      .get("vouchers/quality-grades/", {
        params: { search, page_size: 50 },
      })
      .then((response) => response.data);
  },

  async getHubs(search?: string) {
    return instance
      .get("hubs/", {
        params: { search, page_size: 50 },
      })
      .then((response) => response.data);
  },

  async getAgents(search?: string) {
    return instance
      .get("auth/users/", {
        params: { role__in: "bdm,agent", search, page_size: 50 },
      })
      .then((response) => response.data);
  },

  async getInvestorAccounts(search?: string) {
    return instance
      .get("investors/accounts/", {
        params: { search, page_size: 50 },
      })
      .then((response) => response.data);
  },
};