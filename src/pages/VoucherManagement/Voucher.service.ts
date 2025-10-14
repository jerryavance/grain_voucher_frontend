import instance from "../../api";

export const VoucherService = {
  // Voucher endpoints
  async getVouchers(filters: Record<string, any>) {
    return instance
      .get("vouchers/vouchers/", {
        params: filters,
      })
      .then((response) => response.data);
  },

  async getMyVouchers(filters: Record<string, any>) {
    return instance
      .get("vouchers/vouchers/my_vouchers/", {
        params: filters,
      })
      .then((response) => response.data);
  },

  async getVoucherDetails(id: string) {
    return instance
      .get(`vouchers/vouchers/${id}/`)
      .then((response) => response.data);
  },

  async verifyVoucher(id: string) {
    return instance
      .post(`vouchers/vouchers/${id}/verify_voucher/`)
      .then((response) => response.data);
  },

  async rejectVoucher(id: string, payload: { reason: string }) {
    return instance
      .post(`vouchers/vouchers/${id}/reject_voucher/`, payload)
      .then((response) => response.data);
  },

  async getPendingVerification(filters: Record<string, any>) {
    return instance
      .get("vouchers/vouchers/pending_verification/", {
        params: filters,
      })
      .then((response) => response.data);
  },

  async updateVoucherValue(id: string) {
    return instance
      .post(`vouchers/vouchers/${id}/update_value/`)
      .then((response) => response.data);
  },

  // Redemption endpoints
  async getRedemptions(filters: Record<string, any>) {
    return instance
      .get("vouchers/redemptions/", {
        params: filters,
      })
      .then((response) => response.data);
  },

  async getRedemptionDetails(id: string) {
    return instance
      .get(`vouchers/redemptions/${id}/`)
      .then((response) => response.data);
  },

  async createRedemption(payload: Object) {
    return instance
      .post("vouchers/redemptions/", payload)
      .then((response) => response.data);
  },

  async approveRedemption(id: string) {
    return instance
      .post(`vouchers/redemptions/${id}/approve/`)
      .then((response) => response.data);
  },

  async rejectRedemption(id: string, payload: { reason: string }) {
    return instance
      .post(`vouchers/redemptions/${id}/reject/`, payload)
      .then((response) => response.data);
  },

  async markRedemptionPaid(id: string, payload?: Object) {
    return instance
      .post(`vouchers/redemptions/${id}/pay/`, payload || {})
      .then((response) => response.data);
  },

  // Deposit endpoints
  async getDeposits(filters: Record<string, any>) {
    return instance
      .get("vouchers/deposits/", {
        params: filters,
      })
      .then((response) => response.data);
  },

  async getDepositDetails(id: string) {
    return instance
      .get(`vouchers/deposits/${id}/`)
      .then((response) => response.data);
  },

  async validateDeposit(id: string) {
    return instance
      .post(`vouchers/deposits/${id}/validate_deposit/`)
      .then((response) => response.data);
  },

  // Ledger endpoints
  async getLedgerEntries(filters: Record<string, any>) {
    return instance
      .get("vouchers/ledger-entries/", {
        params: filters,
      })
      .then((response) => response.data);
  },

  // Inventory endpoints
  async getInventories(filters: Record<string, any>) {
    return instance
      .get("vouchers/inventories/", {
        params: filters,
      })
      .then((response) => response.data);
  },
};