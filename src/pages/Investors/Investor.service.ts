import instance from "../../api";
import {
  IInvestorDashboard,
  IInvestorAccountsResults,
  IInvestorDepositsResults,
  IInvestorWithdrawalsResults,
  IProfitAgreementsResults,
  IMarginPayoutsResults,
  IInvestorAccount,
  IInvestorDeposit,
  IInvestorWithdrawal,
  IProfitSharingAgreement,
  IMarginPayout,
} from "./Investor.interface";

export const InvestorService = {
  // ─── Investor Accounts ──────────────────────────────────────────────────────
  async getInvestorAccounts(filters: Record<string, any>): Promise<IInvestorAccountsResults> {
    return instance
      .get("investors/accounts/", { params: filters })
      .then((r) => r.data);
  },

  async createInvestorAccount(payload: any): Promise<IInvestorAccount> {
    return instance.post("investors/accounts/", payload).then((r) => r.data);
  },

  async getInvestorAccountDetails(id: string): Promise<IInvestorAccount> {
    return instance.get(`investors/accounts/${id}/`).then((r) => r.data);
  },

  async updateInvestorAccount(payload: any, id: string): Promise<IInvestorAccount> {
    return instance.patch(`investors/accounts/${id}/`, payload).then((r) => r.data);
  },

  async deleteInvestorAccount(id: string): Promise<void> {
    return instance.delete(`investors/accounts/${id}/`).then((r) => r.data);
  },

  async getInvestorDashboard(): Promise<IInvestorDashboard> {
    return instance.get("investors/accounts/dashboard/").then((r) => r.data);
  },

  // ─── Deposits ───────────────────────────────────────────────────────────────
  async getInvestorDeposits(filters: Record<string, any>): Promise<IInvestorDepositsResults> {
    return instance
      .get("investors/deposits/", { params: filters })
      .then((r) => r.data);
  },

  async createInvestorDeposit(payload: any): Promise<IInvestorDeposit> {
    return instance.post("investors/deposits/", payload).then((r) => r.data);
  },

  async getInvestorDepositDetails(id: string): Promise<IInvestorDeposit> {
    return instance.get(`investors/deposits/${id}/`).then((r) => r.data);
  },

  async deleteInvestorDeposit(id: string): Promise<void> {
    return instance.delete(`investors/deposits/${id}/`).then((r) => r.data);
  },

  // ─── Withdrawals ────────────────────────────────────────────────────────────
  async getInvestorWithdrawals(filters: Record<string, any>): Promise<IInvestorWithdrawalsResults> {
    return instance
      .get("investors/withdrawals/", { params: filters })
      .then((r) => r.data);
  },

  async createInvestorWithdrawal(payload: any): Promise<IInvestorWithdrawal> {
    return instance.post("investors/withdrawals/", payload).then((r) => r.data);
  },

  async getInvestorWithdrawalDetails(id: string): Promise<IInvestorWithdrawal> {
    return instance.get(`investors/withdrawals/${id}/`).then((r) => r.data);
  },

  async approveWithdrawal(id: string): Promise<{ message: string }> {
    return instance.post(`investors/withdrawals/${id}/approve/`).then((r) => r.data);
  },

  async rejectWithdrawal(id: string, notes: string): Promise<{ message: string }> {
    return instance.post(`investors/withdrawals/${id}/reject/`, { notes }).then((r) => r.data);
  },

  // ─── Profit Sharing Agreements ──────────────────────────────────────────────
  async getProfitAgreements(filters: Record<string, any>): Promise<IProfitAgreementsResults> {
    return instance
      .get("investors/profit-agreements/", { params: filters })
      .then((r) => r.data);
  },

  async createProfitAgreement(payload: any): Promise<IProfitSharingAgreement> {
    return instance.post("investors/profit-agreements/", payload).then((r) => r.data);
  },

  async getProfitAgreementDetails(id: string): Promise<IProfitSharingAgreement> {
    return instance.get(`investors/profit-agreements/${id}/`).then((r) => r.data);
  },

  async updateProfitAgreement(payload: any, id: string): Promise<IProfitSharingAgreement> {
    return instance.patch(`investors/profit-agreements/${id}/`, payload).then((r) => r.data);
  },

  async deleteProfitAgreement(id: string): Promise<void> {
    return instance.delete(`investors/profit-agreements/${id}/`).then((r) => r.data);
  },

  // ─── Margin Payouts (new – backend change #2) ───────────────────────────────
  // Full lifecycle: pending → approved → paid / cancelled
  async getMarginPayouts(filters: Record<string, any>): Promise<IMarginPayoutsResults> {
    return instance
      .get("investors/margin-payouts/", { params: filters })
      .then((r) => r.data);
  },

  async createMarginPayout(payload: any): Promise<IMarginPayout> {
    return instance.post("investors/margin-payouts/", payload).then((r) => r.data);
  },

  async getMarginPayoutDetails(id: string): Promise<IMarginPayout> {
    return instance.get(`investors/margin-payouts/${id}/`).then((r) => r.data);
  },

  /**
   * Approve a pending margin payout.
   * Calls investor_account.pay_out_margin() atomically on the backend,
   * deducting from total_margin_paid and emd_balance.
   */
  async approveMarginPayout(id: string): Promise<{ message: string }> {
    return instance.post(`investors/margin-payouts/${id}/approve/`).then((r) => r.data);
  },

  /**
   * Mark an approved payout as actually paid (physical disbursement confirmed).
   */
  async markMarginPayoutPaid(id: string): Promise<{ message: string }> {
    return instance.post(`investors/margin-payouts/${id}/mark_paid/`).then((r) => r.data);
  },

  /**
   * Cancel a payout (pending or approved).
   */
  async cancelMarginPayout(id: string, notes?: string): Promise<{ message: string }> {
    return instance
      .post(`investors/margin-payouts/${id}/cancel/`, notes ? { notes } : {})
      .then((r) => r.data);
  },
};