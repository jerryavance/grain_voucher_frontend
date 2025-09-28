import instance from "../../api";

export const AccountingService = {
  // Invoice Services
  async getInvoices(filters: Record<string, any>) {
    return instance
      .get("accounting/invoices/", { params: filters })
      .then((response) => response.data);
  },

  async createInvoice(payload: Object) {
    return instance
      .post("accounting/invoices/", payload)
      .then((response) => response.data);
  },

  async getInvoiceDetails(id: string) {
    return instance
      .get(`accounting/invoices/${id}/`)
      .then((response) => response.data);
  },

  async updateInvoice(payload: Object, id: string) {
    return instance
      .patch(`accounting/invoices/${id}/`, payload)
      .then((response) => response.data);
  },

  async deleteInvoice(id: string) {
    return instance
      .delete(`accounting/invoices/${id}/`)
      .then((response) => response.data);
  },

  async getInvoiceAging() {
    return instance
      .get("accounting/invoices/aging/")
      .then((response) => response.data);
  },

  // Journal Entry Services
  async getJournalEntries(filters: Record<string, any>) {
    return instance
      .get("accounting/journal-entries/", { params: filters })
      .then((response) => response.data);
  },

  async createJournalEntry(payload: Object) {
    return instance
      .post("accounting/journal-entries/", payload)
      .then((response) => response.data);
  },

  async getJournalEntryDetails(id: string) {
    return instance
      .get(`accounting/journal-entries/${id}/`)
      .then((response) => response.data);
  },

  async updateJournalEntry(payload: Object, id: string) {
    return instance
      .patch(`accounting/journal-entries/${id}/`, payload)
      .then((response) => response.data);
  },

  async deleteJournalEntry(id: string) {
    return instance
      .delete(`accounting/journal-entries/${id}/`)
      .then((response) => response.data);
  },

  // Budget Services
  async getBudgets(filters: Record<string, any>) {
    return instance
      .get("accounting/budgets/", { params: filters })
      .then((response) => response.data);
  },

  async createBudget(payload: Object) {
    return instance
      .post("accounting/budgets/", payload)
      .then((response) => response.data);
  },

  async getBudgetDetails(id: string) {
    return instance
      .get(`accounting/budgets/${id}/`)
      .then((response) => response.data);
  },

  async updateBudget(payload: Object, id: string) {
    return instance
      .patch(`accounting/budgets/${id}/`, payload)
      .then((response) => response.data);
  },

  async deleteBudget(id: string) {
    return instance
      .delete(`accounting/budgets/${id}/`)
      .then((response) => response.data);
  },
};