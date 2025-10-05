// Trade.service.ts
import instance from "../../api";
import { 
  ITradesResults, 
  ITrade, 
  IInventoryAvailability, 
  ICostBreakdown,
  IDashboardStats,
  ITradeStatusUpdate,
  ITradeApproval,
  ITradeAllocation,
  ITradeCost,
  IBrokerage,
  IGoodsReceivedNote
} from "./Trade.interface";

export const TradeService = {
  // Trade CRUD operations
  async getTrades(filters?: Record<string, any>): Promise<ITradesResults> {
    return instance
      .get("trade/trades/", { params: filters })
      .then((response) => response.data);
  },

  async getTradeDetails(id: string): Promise<ITrade> {
    return instance
      .get(`trade/trades/${id}/`)
      .then((response) => response.data);
  },

  async createTrade(payload: Partial<ITrade>): Promise<ITrade> {
    return instance
      .post("trade/trades/", payload)
      .then((response) => response.data);
  },

  async updateTrade(id: string, payload: Partial<ITrade>): Promise<ITrade> {
    return instance
      .patch(`trade/trades/${id}/`, payload)
      .then((response) => response.data);
  },

  async deleteTrade(id: string): Promise<void> {
    return instance
      .delete(`trade/trades/${id}/`)
      .then((response) => response.data);
  },

  // Trade status management
  async updateTradeStatus(id: string, payload: ITradeStatusUpdate): Promise<ITrade> {
    return instance
      .post(`trade/trades/${id}/update_status/`, payload)
      .then((response) => response.data);
  },

  async approveTrade(id: string, payload: ITradeApproval): Promise<ITrade> {
    return instance
      .post(`trade/trades/${id}/approve_trade/`, payload)
      .then((response) => response.data);
  },

  async rejectTrade(id: string, payload: ITradeApproval): Promise<ITrade> {
    return instance
      .post(`trade/trades/${id}/reject_trade/`, payload)
      .then((response) => response.data);
  },

  // Voucher allocation
  async allocateVouchers(id: string, payload: ITradeAllocation): Promise<ITrade> {
    return instance
      .post(`trade/trades/${id}/allocate_vouchers/`, payload)
      .then((response) => response.data);
  },

  async deallocateVouchers(id: string): Promise<void> {
    return instance
      .post(`trade/trades/${id}/deallocate_vouchers/`)
      .then((response) => response.data);
  },

  // Inventory and analytics
  async getInventoryAvailability(filters?: Record<string, any>): Promise<IInventoryAvailability[]> {
    return instance
      .get("trade/trades/inventory_availability/", { params: filters })
      .then((response) => response.data);
  },

  async getCostBreakdown(id: string): Promise<ICostBreakdown> {
    return instance
      .get(`trade/trades/${id}/cost_breakdown/`)
      .then((response) => response.data);
  },

  async getPnL(id: string): Promise<any> {
    return instance
      .get(`trade/trades/${id}/pnl/`)
      .then((response) => response.data);
  },

  async getDashboardStats(filters?: Record<string, any>): Promise<IDashboardStats> {
    return instance
      .get("trade/trades/dashboard_stats/", { params: filters })
      .then((response) => response.data);
  },

  // Trade Costs
  async getTradeCosts(tradeId?: string): Promise<ITradeCost[]> {
    return instance
      .get("trade/trade-costs/", { params: { trade_id: tradeId } })
      .then((response) => response.data.results || response.data);
  },

  async createTradeCost(payload: Partial<ITradeCost>): Promise<ITradeCost> {
    return instance
      .post("trade/trade-costs/", payload)
      .then((response) => response.data);
  },

  async updateTradeCost(id: string, payload: Partial<ITradeCost>): Promise<ITradeCost> {
    return instance
      .patch(`trade/trade-costs/${id}/`, payload)
      .then((response) => response.data);
  },

  async deleteTradeCost(id: string): Promise<void> {
    return instance
      .delete(`trade/trade-costs/${id}/`)
      .then((response) => response.data);
  },

  // Brokerage
  async getBrokerages(filters?: Record<string, any>): Promise<IBrokerage[]> {
    return instance
      .get("trade/brokerages/", { params: filters })
      .then((response) => response.data.results || response.data);
  },

  async getMyCommissions(): Promise<any> {
    return instance
      .get("trade/brokerages/my_commissions/")
      .then((response) => response.data);
  },

  async createBrokerage(payload: Partial<IBrokerage>): Promise<IBrokerage> {
    return instance
      .post("trade/brokerages/", payload)
      .then((response) => response.data);
  },

  async updateBrokerage(id: string, payload: Partial<IBrokerage>): Promise<IBrokerage> {
    return instance
      .patch(`trade/brokerages/${id}/`, payload)
      .then((response) => response.data);
  },

  async deleteBrokerage(id: string): Promise<void> {
    return instance
      .delete(`trade/brokerages/${id}/`)
      .then((response) => response.data);
  },

  // Goods Received Notes
  async getGRNs(filters?: Record<string, any>): Promise<IGoodsReceivedNote[]> {
    return instance
      .get("trade/grns/", { params: filters })
      .then((response) => response.data.results || response.data);
  },

  async getGRNDetails(id: string): Promise<IGoodsReceivedNote> {
    return instance
      .get(`trade/grns/${id}/`)
      .then((response) => response.data);
  },

  async createGRN(payload: Partial<IGoodsReceivedNote>): Promise<IGoodsReceivedNote> {
    return instance
      .post("trade/grns/", payload)
      .then((response) => response.data);
  },

  async updateGRN(id: string, payload: Partial<IGoodsReceivedNote>): Promise<IGoodsReceivedNote> {
    return instance
      .patch(`trade/grns/${id}/`, payload)
      .then((response) => response.data);
  },

  async downloadGRNPDF(id: string): Promise<Blob> {
    return instance
      .get(`trade/grns/${id}/download_pdf/`, { responseType: 'blob' })
      .then((response) => response.data);
  },

  // Helper methods to fetch related entities
  async getHubs(): Promise<any[]> {
    return instance
      .get("hubs/")
      .then((response) => response.data.results || response.data);
  },

  async getGrainTypes(): Promise<any[]> {
    return instance
      .get("vouchers/grain-types/")
      .then((response) => response.data.results || response.data);
  },

  async getQualityGrades(): Promise<any[]> {
    return instance
      .get("vouchers/quality-grades/")
      .then((response) => response.data.results || response.data);
  },

  async getBuyers(): Promise<any[]> {
    return instance
      .get("crm/accounts/", { params: { type: 'customer' } })
      .then((response) => response.data.results || response.data);
  },

  async getAgents(): Promise<any[]> {
    return instance
      .get("auth/users/", { params: { role: 'bdm,agent' } })
      .then((response) => response.data.results || response.data);
  },
};