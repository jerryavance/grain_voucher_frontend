// Trade.service.ts - COMPLETE SERVICE WITH ALL ENDPOINTS
import instance from "../../api";
import { 
  ITradesResults, 
  ITrade, 
  IInventoryAvailability, 
  ICostBreakdown,
  IDashboardStats,
  ITradeStatusUpdate,
  ITradeApproval,
  IVoucherAllocation,
  ITradeCost,
  IBrokerage,
  IGoodsReceivedNote,
  ITradeFinancing,
  ITradeLoan,
  IPaymentRecord,
  IAvailableVouchers
} from "./Trade.interface";

export const TradeService = {
  // ============================================
  // TRADE CRUD OPERATIONS
  // ============================================
  
  /**
   * Get all trades with optional filters
   * @param filters - Optional query parameters (status, hub_id, buyer_id, search, page, page_size, etc.)
   */
  async getTrades(filters?: Record<string, any>): Promise<ITradesResults> {
    return instance
      .get("trade/trades/", { params: filters })
      .then((response) => response.data);
  },

  /**
   * Get detailed information for a specific trade
   * @param id - Trade UUID
   */
  async getTradeDetails(id: string): Promise<ITrade> {
    return instance
      .get(`trade/trades/${id}/`)
      .then((response) => response.data);
  },

  /**
   * Create a new trade
   * @param payload - Trade data
   */
  async createTrade(payload: Partial<ITrade>): Promise<ITrade> {
    return instance
      .post("trade/trades/", payload)
      .then((response) => response.data);
  },

  /**
   * Update an existing trade
   * @param id - Trade UUID
   * @param payload - Updated trade data
   */
  async updateTrade(id: string, payload: Partial<ITrade>): Promise<ITrade> {
    return instance
      .patch(`trade/trades/${id}/`, payload)
      .then((response) => response.data);
  },

  /**
   * Delete a trade (only allowed for draft status)
   * @param id - Trade UUID
   */
  async deleteTrade(id: string): Promise<void> {
    return instance
      .delete(`trade/trades/${id}/`)
      .then((response) => response.data);
  },

  // ============================================
  // TRADE APPROVAL WORKFLOW
  // ============================================
  
  /**
   * Approve a pending trade
   * @param id - Trade UUID
   * @param payload - Approval notes
   */
  async approveTrade(id: string, payload: ITradeApproval): Promise<ITrade> {
    return instance
      .post(`trade/trades/${id}/approve/`, payload)
      .then((response) => response.data);
  },

  /**
   * Reject a pending trade
   * @param id - Trade UUID
   * @param payload - Rejection reason (required)
   */
  async rejectTrade(id: string, payload: ITradeApproval): Promise<ITrade> {
    return instance
      .post(`trade/trades/${id}/reject/`, payload)
      .then((response) => response.data);
  },

  // ============================================
  // TRADE STATUS MANAGEMENT
  // ============================================
  
  /**
   * Update trade status with optional details
   * @param id - Trade UUID
   * @param payload - New status and related information
   */
  async updateTradeStatus(id: string, payload: ITradeStatusUpdate): Promise<ITrade> {
    return instance
      .post(`trade/trades/${id}/update_status/`, payload)
      .then((response) => response.data);
  },

  // ============================================
  // PAYMENT OPERATIONS
  // ============================================
  
  /**
   * Record a payment received from buyer
   * @param id - Trade UUID
   * @param payload - Payment details
   */
  async recordPayment(id: string, payload: IPaymentRecord): Promise<any> {
    return instance
      .post(`trade/trades/${id}/record_payment/`, payload)
      .then((response) => response.data);
  },

  // ============================================
  // VOUCHER ALLOCATION
  // ============================================
  
  /**
   * Get available vouchers for manual allocation
   * @param filters - Hub, grain type, and quality grade filters
   */
  async getAvailableVouchers(filters: {
    hub_id: string;
    grain_type_id: string;
    quality_grade_id: string;
  }): Promise<IAvailableVouchers> {
    return instance
      .get("trade/trades/available_vouchers/", { params: filters })
      .then((response) => response.data);
  },

  /**
   * Allocate vouchers to a trade (auto FIFO or manual selection)
   * @param id - Trade UUID
   * @param payload - Allocation type and voucher IDs (for manual)
   */
  async allocateVouchers(id: string, payload: IVoucherAllocation): Promise<ITrade> {
    return instance
      .post(`trade/trades/${id}/allocate_vouchers/`, payload)
      .then((response) => response.data);
  },

  /**
   * Deallocate vouchers from a trade
   * @param id - Trade UUID
   */
  async deallocateVouchers(id: string): Promise<void> {
    return instance
      .post(`trade/trades/${id}/deallocate_vouchers/`)
      .then((response) => response.data);
  },

  // ============================================
  // ANALYTICS & REPORTING
  // ============================================
  
  /**
   * Get detailed cost breakdown for a trade
   * @param id - Trade UUID
   */
  async getCostBreakdown(id: string): Promise<ICostBreakdown> {
    return instance
      .get(`trade/trades/${id}/cost_breakdown/`)
      .then((response) => response.data);
  },

  /**
   * Get dashboard statistics with optional filters
   * @param filters - Date range and other filters
   */
  async getDashboardStats(filters?: Record<string, any>): Promise<IDashboardStats> {
    return instance
      .get("trade/trades/dashboard_stats/", { params: filters })
      .then((response) => response.data);
  },

  /**
   * Get inventory availability for a specific hub and grain type
   * @param filters - Hub, grain type, and quality grade filters
   */
  async getInventoryAvailability(filters?: Record<string, any>): Promise<IInventoryAvailability[]> {
    return instance
      .get("trade/trades/inventory_availability/", { params: filters })
      .then((response) => response.data);
  },

  // ============================================
  // TRADE COSTS
  // ============================================
  
  /**
   * Get all additional costs for a trade
   * @param tradeId - Optional trade UUID filter
   */
  async getTradeCosts(tradeId?: string): Promise<ITradeCost[]> {
    return instance
      .get("trade/costs/", { params: { trade: tradeId } })
      .then((response) => response.data.results || response.data);
  },

  /**
   * Add a new cost to a trade
   * @param payload - Cost details
   */
  async createTradeCost(payload: Partial<ITradeCost>): Promise<ITradeCost> {
    return instance
      .post("trade/costs/", payload)
      .then((response) => response.data);
  },

  /**
   * Update an existing trade cost
   * @param id - Cost UUID
   * @param payload - Updated cost data
   */
  async updateTradeCost(id: string, payload: Partial<ITradeCost>): Promise<ITradeCost> {
    return instance
      .patch(`trade/costs/${id}/`, payload)
      .then((response) => response.data);
  },

  /**
   * Delete a trade cost
   * @param id - Cost UUID
   */
  async deleteTradeCost(id: string): Promise<void> {
    return instance
      .delete(`trade/costs/${id}/`)
      .then((response) => response.data);
  },

  // ============================================
  // BROKERAGE / COMMISSIONS
  // ============================================
  
  /**
   * Get all brokerage records with optional filters
   * @param filters - Trade or agent filters
   */
  async getBrokerages(filters?: Record<string, any>): Promise<IBrokerage[]> {
    return instance
      .get("trade/brokerages/", { params: filters })
      .then((response) => response.data.results || response.data);
  },

  /**
   * Get current user's commission summary
   */
  async getMyCommissions(): Promise<any> {
    return instance
      .get("trade/brokerages/my_commissions/")
      .then((response) => response.data);
  },

  /**
   * Create a new brokerage commission record
   * @param payload - Brokerage details
   */
  async createBrokerage(payload: Partial<IBrokerage>): Promise<IBrokerage> {
    return instance
      .post("trade/brokerages/", payload)
      .then((response) => response.data);
  },

  /**
   * Update an existing brokerage record
   * @param id - Brokerage UUID
   * @param payload - Updated brokerage data
   */
  async updateBrokerage(id: string, payload: Partial<IBrokerage>): Promise<IBrokerage> {
    return instance
      .patch(`trade/brokerages/${id}/`, payload)
      .then((response) => response.data);
  },

  /**
   * Delete a brokerage record
   * @param id - Brokerage UUID
   */
  async deleteBrokerage(id: string): Promise<void> {
    return instance
      .delete(`trade/brokerages/${id}/`)
      .then((response) => response.data);
  },

  // ============================================
  // TRADE FINANCING (INVESTOR EQUITY)
  // ============================================
  
  /**
   * Get all trade financing records with optional filters
   * @param filters - Trade or investor filters
   */
  async getTradeFinancing(filters?: Record<string, any>): Promise<ITradeFinancing[]> {
    return instance
      .get("trade/financing/", { params: filters })
      .then((response) => response.data.results || response.data);
  },

  /**
   * Allocate investor equity to a trade
   * @param payload - Financing allocation details
   */
  async createTradeFinancing(payload: Partial<ITradeFinancing>): Promise<ITradeFinancing> {
    return instance
      .post("trade/financing/", payload)
      .then((response) => response.data);
  },

  /**
   * Update an existing financing allocation
   * @param id - Financing UUID
   * @param payload - Updated financing data
   */
  async updateTradeFinancing(id: string, payload: Partial<ITradeFinancing>): Promise<ITradeFinancing> {
    return instance
      .patch(`trade/financing/${id}/`, payload)
      .then((response) => response.data);
  },

  /**
   * Delete a financing allocation
   * @param id - Financing UUID
   */
  async deleteTradeFinancing(id: string): Promise<void> {
    return instance
      .delete(`trade/financing/${id}/`)
      .then((response) => response.data);
  },

  // ============================================
  // TRADE LOANS (INVESTOR DEBT)
  // ============================================
  
  /**
   * Get all trade loans with optional filters
   * @param filters - Trade, investor, or status filters
   */
  async getTradeLoans(filters?: Record<string, any>): Promise<ITradeLoan[]> {
    return instance
      .get("trade/loans/", { params: filters })
      .then((response) => response.data.results || response.data);
  },

  /**
   * Create a new trade loan
   * @param payload - Loan details
   */
  async createTradeLoan(payload: Partial<ITradeLoan>): Promise<ITradeLoan> {
    return instance
      .post("trade/loans/", payload)
      .then((response) => response.data);
  },

  /**
   * Record a loan repayment
   * @param id - Loan UUID
   * @param amount - Repayment amount
   */
  async repayLoan(id: string, amount: number): Promise<any> {
    return instance
      .post(`trade/loans/${id}/repay/`, { amount })
      .then((response) => response.data);
  },

  // ============================================
  // GOODS RECEIVED NOTES (GRN)
  // ============================================
  
  /**
   * Get all GRNs with optional filters
   * @param filters - Trade or date filters
   */
  async getGRNs(filters?: Record<string, any>): Promise<IGoodsReceivedNote[]> {
    return instance
      .get("trade/grns/", { params: filters })
      .then((response) => response.data.results || response.data);
  },

  /**
   * Get detailed information for a specific GRN
   * @param id - GRN UUID
   */
  async getGRNDetails(id: string): Promise<IGoodsReceivedNote> {
    return instance
      .get(`trade/grns/${id}/`)
      .then((response) => response.data);
  },

  /**
   * Create a new Goods Received Note
   * @param payload - GRN details
   */
  async createGRN(payload: Partial<IGoodsReceivedNote>): Promise<IGoodsReceivedNote> {
    return instance
      .post("trade/grns/", payload)
      .then((response) => response.data);
  },

  /**
   * Update an existing GRN
   * @param id - GRN UUID
   * @param payload - Updated GRN data
   */
  async updateGRN(id: string, payload: Partial<IGoodsReceivedNote>): Promise<IGoodsReceivedNote> {
    return instance
      .patch(`trade/grns/${id}/`, payload)
      .then((response) => response.data);
  },

  /**
   * Download GRN as PDF
   * @param id - GRN UUID
   */
  async downloadGRNPDF(id: string): Promise<Blob> {
    return instance
      .get(`trade/grns/${id}/download_pdf/`, { responseType: 'blob' })
      .then((response) => response.data);
  },

  // ============================================
  // HELPER METHODS - FETCH RELATED ENTITIES
  // ============================================
  
  /**
   * Get all hubs
   */
  async getHubs(): Promise<any[]> {
    return instance
      .get("hubs/")
      .then((response) => response.data.results || response.data);
  },

  /**
   * Get all grain types
   */
  async getGrainTypes(): Promise<any[]> {
    return instance
      .get("vouchers/grain-types/")
      .then((response) => response.data.results || response.data);
  },

  /**
   * Get all quality grades
   */
  async getQualityGrades(): Promise<any[]> {
    return instance
      .get("vouchers/quality-grades/")
      .then((response) => response.data.results || response.data);
  },

  /**
   * Get all buyers (customer accounts)
   */
  async getBuyers(): Promise<any[]> {
    return instance
      .get("crm/accounts/", { params: { type: 'customer' } })
      .then((response) => response.data.results || response.data);
  },

  /**
   * Get all suppliers (farmers)
   */
  async getSuppliers(): Promise<any[]> {
    return instance
      .get("auth/users/", { params: { role: 'farmer' } })
      .then((response) => response.data.results || response.data);
  },

  /**
   * Get all agents and BDMs
   */
  async getAgents(): Promise<any[]> {
    return instance
      .get("auth/users/", { params: { role: 'bdm,agent' } })
      .then((response) => response.data.results || response.data);
  },

  /**
   * Get all investor accounts
   */
  async getInvestors(): Promise<any[]> {
    return instance
      .get("investors/accounts/")
      .then((response) => response.data.results || response.data);
  },

  // ============================================
  // BATCH OPERATIONS (Optional/Future)
  // ============================================
  
  /**
   * Approve multiple trades at once
   * @param tradeIds - Array of trade UUIDs
   * @param notes - Approval notes
   */
  async bulkApproveTrades(tradeIds: string[], notes?: string): Promise<any> {
    return instance
      .post("trade/trades/bulk_approve/", { trade_ids: tradeIds, notes })
      .then((response) => response.data);
  },

  /**
   * Export trades to CSV/Excel
   * @param filters - Export filters
   */
  async exportTrades(filters?: Record<string, any>): Promise<Blob> {
    return instance
      .get("trade/trades/export/", { params: filters, responseType: 'blob' })
      .then((response) => response.data);
  },
};