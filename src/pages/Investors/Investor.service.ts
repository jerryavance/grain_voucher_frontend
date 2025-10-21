import instance from "../../api";
import { 
  IGoodsReceivedNote
} from "../Trade/Trade.interface";

export const InvestorService = {
  // Investor Accounts
  async getInvestorAccounts(filters: Record<string, any>) {
    return instance
      .get("investors/accounts/", { params: filters })
      .then((response) => response.data);
  },

  async createInvestorAccount(payload: any) {
    return instance
      .post("investors/accounts/", payload)
      .then((response) => response.data);
  },

  async getInvestorAccountDetails(id: string) {
    return instance
      .get(`investors/accounts/${id}/`)
      .then((response) => response.data);
  },

  async updateInvestorAccount(payload: any, id: string) {
    return instance
      .patch(`investors/accounts/${id}/`, payload)
      .then((response) => response.data);
  },

  async deleteInvestorAccount(id: string) {
    return instance
      .delete(`investors/accounts/${id}/`)
      .then((response) => response.data);
  },

  async getInvestorDashboard() {
    return instance
      .get("investors/accounts/dashboard/")
      .then((response) => response.data);
  },

  // Deposits
  async getInvestorDeposits(filters: Record<string, any>) {
    return instance
      .get("investors/deposits/", { params: filters })
      .then((response) => response.data);
  },

  async createInvestorDeposit(payload: any) {
    return instance
      .post("investors/deposits/", payload)
      .then((response) => response.data);
  },

  async getInvestorDepositDetails(id: string) {
    return instance
      .get(`investors/deposits/${id}/`)
      .then((response) => response.data);
  },

  async deleteInvestorDeposit(id: string) {
    return instance
      .delete(`investors/deposits/${id}/`)
      .then((response) => response.data);
  },

  // Withdrawals
  async getInvestorWithdrawals(filters: Record<string, any>) {
    return instance
      .get("investors/withdrawals/", { params: filters })
      .then((response) => response.data);
  },

  async createInvestorWithdrawal(payload: any) {
    return instance
      .post("investors/withdrawals/", payload)
      .then((response) => response.data);
  },

  async getInvestorWithdrawalDetails(id: string) {
    return instance
      .get(`investors/withdrawals/${id}/`)
      .then((response) => response.data);
  },

  async approveWithdrawal(id: string) {
    return instance
      .post(`investors/withdrawals/${id}/approve/`)
      .then((response) => response.data);
  },

  async rejectWithdrawal(id: string, notes: string) {
    return instance
      .post(`investors/withdrawals/${id}/reject/`, { notes })
      .then((response) => response.data);
  },

  // Profit Sharing Agreements
  async getProfitAgreements(filters: Record<string, any>) {
    return instance
      .get("investors/profit-agreements/", { params: filters })
      .then((response) => response.data);
  },

  async createProfitAgreement(payload: any) {
    return instance
      .post("investors/profit-agreements/", payload)
      .then((response) => response.data);
  },

  async updateProfitAgreement(payload: any, id: string) {
    return instance
      .patch(`investors/profit-agreements/${id}/`, payload)
      .then((response) => response.data);
  },

  // Trades
  async getTrades(filters: Record<string, any>) {
    return instance
      .get("investors/trades/", { params: filters })
      .then((response) => response.data);
  },

  async createTrade(payload: any) {
    return instance
      .post("investors/trades/", payload)
      .then((response) => response.data);
  },

  async getTradeDetails(id: string) {
    return instance
      .get(`investors/trades/${id}/`)
      .then((response) => response.data);
  },

  async updateTrade(payload: any, id: string) {
    return instance
      .patch(`investors/trades/${id}/`, payload)
      .then((response) => response.data);
  },

  async deleteTrade(id: string) {
    return instance
      .delete(`investors/trades/${id}/`)
      .then((response) => response.data);
  },

  // NEW SERVICES
  async getGRNs(filters?: Record<string, any>): Promise<IGoodsReceivedNote[]> {
    return instance
      .get("trade/grns/", { params: filters })
      .then((response) => response.data.results || response.data);
  },

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

  async getSuppliers(): Promise<any[]> {
    return instance
      .get("crm/accounts/", { params: { type: 'customer' } })
      .then((response) => response.data.results || response.data);
  },
  // NEW SERVICES



  // Trade Allocations
  async getTradeAllocations(filters: Record<string, any>) {
    return instance
      .get("investors/allocations/", { params: filters })
      .then((response) => response.data);
  },

  async createTradeAllocation(payload: any) {
    return instance
      .post("investors/allocations/", payload)
      .then((response) => response.data);
  },

  async getTradeAllocationDetails(id: string) {
    return instance
      .get(`investors/allocations/${id}/`)
      .then((response) => response.data);
  },

  async deleteTradeAllocation(id: string) {
    return instance
      .delete(`investors/allocations/${id}/`)
      .then((response) => response.data);
  },

  // Loans
  async getLoans(filters: Record<string, any>) {
    return instance
      .get("investors/loans/", { params: filters })
      .then((response) => response.data);
  },

  async createLoan(payload: any) {
    return instance
      .post("investors/loans/", payload)
      .then((response) => response.data);
  },

  async getLoanDetails(id: string) {
    return instance
      .get(`investors/loans/${id}/`)
      .then((response) => response.data);
  },

  async repayLoan(id: string, amount: string) {
    return instance
      .post(`investors/loans/${id}/repay/`, { amount })
      .then((response) => response.data);
  },

  async deleteLoan(id: string) {
    return instance
      .delete(`investors/loans/${id}/`)
      .then((response) => response.data);
  },
};