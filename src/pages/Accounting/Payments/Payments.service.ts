import instance from "../../../api";

export const PaymentService = {
  async getPayments(filters: Object) {
    return instance
      .get("accounting/payments/", { params: filters })
      .then((response) => response.data);
  },
  async getPaymentDetails(id: string) {
    return instance.get(`accounting/payments/${id}/`).then((response) => response.data);
  },
  async createPayment(payload: Object) {
    return instance.post("accounting/payments/", payload).then((response) => response.data);
  },
  async updatePayment(payload: Object, id: string) {
    return instance.patch(`accounting/payments/${id}/`, payload).then((response) => response.data);
  },
  async deletePayment(id: string) {
    return instance.delete(`accounting/payments/${id}/`).then((response) => response.data);
  },
  async reconcilePayment(id: string) {
    return instance.post(`accounting/payments/${id}/reconcile/`).then((response) => response.data);
  },
};