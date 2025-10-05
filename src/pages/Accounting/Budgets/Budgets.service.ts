import instance from "../../../api";

export const BudgetService = {
  async getBudgets(filters: Object) {
    return instance
      .get("accounting/budgets/", { params: filters })
      .then((response) => response.data);
  },
  async getBudgetDetails(id: string) {
    return instance.get(`accounting/budgets/${id}/`).then((response) => response.data);
  },
  async createBudget(payload: Object) {
    return instance.post("accounting/budgets/", payload).then((response) => response.data);
  },
  async updateBudget(payload: Object, id: string) {
    return instance.patch(`accounting/budgets/${id}/`, payload).then((response) => response.data);
  },
  async deleteBudget(id: string) {
    return instance.delete(`accounting/budgets/${id}/`).then((response) => response.data);
  },
  async getPerformance(params: { period?: string }) {
    return instance.get("accounting/budgets/performance/", { params }).then((response) => response.data);
  },
};