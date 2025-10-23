import instance from "../../api";
import { IInvestorDashboard, IInvestorAccountsResults, IInvestorDepositsResults, IInvestorWithdrawalsResults, IProfitAgreementsResults, IInvestorAccount, IInvestorDeposit, IInvestorWithdrawal, IProfitSharingAgreement } from "./Investor.interface";

export const InvestorService = {
  // Investor Accounts
  async getInvestorAccounts(filters: Record<string, any>): Promise<IInvestorAccountsResults> {
    return instance
      .get("investors/accounts/", { params: filters })
      .then((response) => response.data);
  },

  async createInvestorAccount(payload: any): Promise<IInvestorAccount> {
    return instance
      .post("investors/accounts/", payload)
      .then((response) => response.data);
  },

  async getInvestorAccountDetails(id: string): Promise<IInvestorAccount> {
    return instance
      .get(`investors/accounts/${id}/`)
      .then((response) => response.data);
  },

  async updateInvestorAccount(payload: any, id: string): Promise<IInvestorAccount> {
    return instance
      .patch(`investors/accounts/${id}/`, payload)
      .then((response) => response.data);
  },

  async deleteInvestorAccount(id: string): Promise<void> {
    return instance
      .delete(`investors/accounts/${id}/`)
      .then((response) => response.data);
  },

  async getInvestorDashboard(): Promise<IInvestorDashboard> {
    return instance
      .get("investors/accounts/dashboard/")
      .then((response) => response.data);
  },

  // Deposits
  async getInvestorDeposits(filters: Record<string, any>): Promise<IInvestorDepositsResults> {
    return instance
      .get("investors/deposits/", { params: filters })
      .then((response) => response.data);
  },

  async createInvestorDeposit(payload: any): Promise<IInvestorDeposit> {
    return instance
      .post("investors/deposits/", payload)
      .then((response) => response.data);
  },

  async getInvestorDepositDetails(id: string): Promise<IInvestorDeposit> {
    return instance
      .get(`investors/deposits/${id}/`)
      .then((response) => response.data);
  },

  async deleteInvestorDeposit(id: string): Promise<void> {
    return instance
      .delete(`investors/deposits/${id}/`)
      .then((response) => response.data);
  },

  // Withdrawals
  async getInvestorWithdrawals(filters: Record<string, any>): Promise<IInvestorWithdrawalsResults> {
    return instance
      .get("investors/withdrawals/", { params: filters })
      .then((response) => response.data);
  },

  async createInvestorWithdrawal(payload: any): Promise<IInvestorWithdrawal> {
    return instance
      .post("investors/withdrawals/", payload)
      .then((response) => response.data);
  },

  async getInvestorWithdrawalDetails(id: string): Promise<IInvestorWithdrawal> {
    return instance
      .get(`investors/withdrawals/${id}/`)
      .then((response) => response.data);
  },

  async approveWithdrawal(id: string): Promise<{ message: string }> {
    return instance
      .post(`investors/withdrawals/${id}/approve/`)
      .then((response) => response.data);
  },

  async rejectWithdrawal(id: string, notes: string): Promise<{ message: string }> {
    return instance
      .post(`investors/withdrawals/${id}/reject/`, { notes })
      .then((response) => response.data);
  },

  // Profit Sharing Agreements
  async getProfitAgreements(filters: Record<string, any>): Promise<IProfitAgreementsResults> {
    return instance
      .get("investors/profit-agreements/", { params: filters })
      .then((response) => response.data);
  },

  async createProfitAgreement(payload: any): Promise<IProfitSharingAgreement> {
    return instance
      .post("investors/profit-agreements/", payload)
      .then((response) => response.data);
  },

  async getProfitAgreementDetails(id: string): Promise<IProfitSharingAgreement> {
    return instance
      .get(`investors/profit-agreements/${id}/`)
      .then((response) => response.data);
  },

  async updateProfitAgreement(payload: any, id: string): Promise<IProfitSharingAgreement> {
    return instance
      .patch(`investors/profit-agreements/${id}/`, payload)
      .then((response) => response.data);
  },

  async deleteProfitAgreement(id: string): Promise<void> {
    return instance
      .delete(`investors/profit-agreements/${id}/`)
      .then((response) => response.data);
  },
};


// import instance from "../../api";

// export const InvestorService = {
//   // Investor Accounts
//   async getInvestorAccounts(filters: Record<string, any>) {
//     return instance
//       .get("investors/accounts/", { params: filters })
//       .then((response) => response.data);
//   },

//   async createInvestorAccount(payload: any) {
//     return instance
//       .post("investors/accounts/", payload)
//       .then((response) => response.data);
//   },

//   async getInvestorAccountDetails(id: string) {
//     return instance
//       .get(`investors/accounts/${id}/`)
//       .then((response) => response.data);
//   },

//   async updateInvestorAccount(payload: any, id: string) {
//     return instance
//       .patch(`investors/accounts/${id}/`, payload)
//       .then((response) => response.data);
//   },

//   async deleteInvestorAccount(id: string) {
//     return instance
//       .delete(`investors/accounts/${id}/`)
//       .then((response) => response.data);
//   },

//   async getInvestorDashboard() {
//     return instance
//       .get("investors/accounts/dashboard/")
//       .then((response) => response.data);
//   },

//   // Deposits
//   async getInvestorDeposits(filters: Record<string, any>) {
//     return instance
//       .get("investors/deposits/", { params: filters })
//       .then((response) => response.data);
//   },

//   async createInvestorDeposit(payload: any) {
//     return instance
//       .post("investors/deposits/", payload)
//       .then((response) => response.data);
//   },

//   async getInvestorDepositDetails(id: string) {
//     return instance
//       .get(`investors/deposits/${id}/`)
//       .then((response) => response.data);
//   },

//   async deleteInvestorDeposit(id: string) {
//     return instance
//       .delete(`investors/deposits/${id}/`)
//       .then((response) => response.data);
//   },

//   // Withdrawals
//   async getInvestorWithdrawals(filters: Record<string, any>) {
//     return instance
//       .get("investors/withdrawals/", { params: filters })
//       .then((response) => response.data);
//   },

//   async createInvestorWithdrawal(payload: any) {
//     return instance
//       .post("investors/withdrawals/", payload)
//       .then((response) => response.data);
//   },

//   async getInvestorWithdrawalDetails(id: string) {
//     return instance
//       .get(`investors/withdrawals/${id}/`)
//       .then((response) => response.data);
//   },

//   async approveWithdrawal(id: string) {
//     return instance
//       .post(`investors/withdrawals/${id}/approve/`)
//       .then((response) => response.data);
//   },

//   async rejectWithdrawal(id: string, notes: string) {
//     return instance
//       .post(`investors/withdrawals/${id}/reject/`, { notes })
//       .then((response) => response.data);
//   },

//   // Profit Sharing Agreements
//   async getProfitAgreements(filters: Record<string, any>) {
//     return instance
//       .get("investors/profit-agreements/", { params: filters })
//       .then((response) => response.data);
//   },

//   async createProfitAgreement(payload: any) {
//     return instance
//       .post("investors/profit-agreements/", payload)
//       .then((response) => response.data);
//   },

//   async getProfitAgreementDetails(id: string) {
//     return instance
//       .get(`investors/profit-agreements/${id}/`)
//       .then((response) => response.data);
//   },

//   async updateProfitAgreement(payload: any, id: string) {
//     return instance
//       .patch(`investors/profit-agreements/${id}/`, payload)
//       .then((response) => response.data);
//   },

//   async deleteProfitAgreement(id: string) {
//     return instance
//       .delete(`investors/profit-agreements/${id}/`)
//       .then((response) => response.data);
//   },
// };