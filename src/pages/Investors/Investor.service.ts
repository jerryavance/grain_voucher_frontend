import instance from "../../api";
import {
  IInvestorDashboard,
  IInvestorAccountsResults,
  IInvestorDepositsResults,
  IInvestorWithdrawalsResults,
  IProfitAgreementsResults,
  IMarginPayoutsResults,
  IInvestorPeriodReturnsResults,
  IInvestorAccount,
  IInvestorDeposit,
  IInvestorWithdrawal,
  IProfitSharingAgreement,
  IMarginPayout,
  IInvestorPeriodReturn,
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
   * ✅ FIX: Now sends payment_reference in request body (required by backend).
   */
  async markMarginPayoutPaid(id: string, paymentReference: string): Promise<{ message: string }> {
    return instance.post(`investors/margin-payouts/${id}/mark_paid/`, {
      payment_reference: paymentReference,
    }).then((r) => r.data);
  },

  /**
   * Cancel a payout (pending or approved).
   */
  async cancelMarginPayout(id: string, notes?: string): Promise<{ message: string }> {
    return instance
      .post(`investors/margin-payouts/${id}/cancel/`, notes ? { notes } : {})
      .then((r) => r.data);
  },

  // ─── Period Returns (fixed-period interest investors) ────────────────────────
  async getPeriodReturns(filters: Record<string, any>): Promise<IInvestorPeriodReturnsResults> {
    return instance.get("investors/period-returns/", { params: filters }).then((r) => r.data);
  },

  async createPeriodReturn(payload: {
    investor_account_id: string;
    profit_sharing_agreement_id: string;
    capital_committed: string;
    capital_deployed?: string;
    interest_earned: string;
    period_start: string;
    period_end: string;
    days_deployed?: number;
    payout_source?: string;
    notes?: string;
  }): Promise<IInvestorPeriodReturn> {
    return instance.post("investors/period-returns/", payload).then((r) => r.data);
  },

  async getPeriodReturnDetails(id: string): Promise<IInvestorPeriodReturn> {
    return instance.get(`investors/period-returns/${id}/`).then((r) => r.data);
  },

  /**
   * Approve a pending period return.
   * payout_source='platform_advance' marks all linked allocations as force_settled.
   */
  async approvePeriodReturn(
    id: string,
    payout_source: 'buyer_payment' | 'platform_advance' = 'buyer_payment',
  ): Promise<{ message: string }> {
    return instance
      .post(`investors/period-returns/${id}/approve/`, { payout_source })
      .then((r) => r.data);
  },

  async markPeriodReturnPaid(id: string, payment_reference: string): Promise<{ message: string }> {
    return instance
      .post(`investors/period-returns/${id}/mark_paid/`, { payment_reference })
      .then((r) => r.data);
  },

  async cancelPeriodReturn(id: string, notes?: string): Promise<{ message: string }> {
    return instance
      .post(`investors/period-returns/${id}/cancel/`, notes ? { notes } : {})
      .then((r) => r.data);
  },
};