import instance from "../../../api";

export const InvoiceService = {
  // Basic CRUD
  async getInvoices(filters: Object) {
    return instance
      .get("accounting/invoices/", { params: filters })
      .then((response) => response.data);
  },
  
  async getInvoiceDetails(id: string) {
    return instance
      .get(`accounting/invoices/${id}/`)
      .then((response) => response.data);
  },
  
  async createInvoice(payload: Object) {
    return instance
      .post("accounting/invoices/", payload)
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

  // Manual invoice creation with GRNs
  async createManualInvoice(payload: {
    account_id: string;
    grn_ids: string[];
    payment_terms?: string;
    notes?: string;
    beneficiary_bank?: string;
    beneficiary_name?: string;
    beneficiary_account?: string;
    beneficiary_branch?: string;
  }) {
    return instance
      .post("accounting/invoices/create_manual_invoice/", payload)
      .then((response) => response.data);
  },

  // GRN management
  async addGRNToInvoice(invoiceId: string, grnId: string) {
    return instance
      .post(`accounting/invoices/${invoiceId}/add_grn/`, { grn_id: grnId })
      .then((response) => response.data);
  },

  async removeGRNFromInvoice(invoiceId: string, grnId: string) {
    return instance
      .delete(`accounting/invoices/${invoiceId}/remove_grn/`, {
        params: { grn_id: grnId }
      })
      .then((response) => response.data);
  },

  async getUninvoicedGRNs(accountId?: string) {
    const params = accountId ? { account_id: accountId } : {};
    return instance
      .get("accounting/invoices/uninvoiced_grns/", { params })
      .then((response) => response.data);
  },

  // Invoice actions
  async finalizeInvoice(id: string) {
    return instance
      .post(`accounting/invoices/${id}/finalize/`)
      .then((response) => response.data);
  },

  async sendInvoice(id: string) {
    return instance
      .post(`accounting/invoices/${id}/send_invoice/`)
      .then((response) => response.data);
  },

  async sendReminder(id: string) {
    return instance
      .post(`accounting/invoices/${id}/send_reminder/`)
      .then((response) => response.data);
  },

  async cancelInvoice(id: string, reason: string) {
    return instance
      .post(`accounting/invoices/${id}/cancel_invoice/`, { reason })
      .then((response) => response.data);
  },

  // Reports and analytics
  async getSummary() {
    return instance
      .get("accounting/invoices/summary/")
      .then((response) => response.data);
  },

  async getAging() {
    return instance
      .get("accounting/invoices/aging/")
      .then((response) => response.data);
  },

  // Admin actions
  async generateScheduledNow() {
    return instance
      .post("accounting/invoices/generate_scheduled_now/")
      .then((response) => response.data);
  }
};











// import instance from "../../../api";

// export const InvoiceService = {
//   async getInvoices(filters: Object) {
//     return instance
//       .get("accounting/invoices/", { params: filters })
//       .then((response) => response.data);
//   },
//   async getInvoiceDetails(id: string) {
//     return instance.get(`accounting/invoices/${id}/`).then((response) => response.data);
//   },
//   async createInvoice(payload: Object) {
//     return instance.post("accounting/invoices/", payload).then((response) => response.data);
//   },
//   async updateInvoice(payload: Object, id: string) {
//     return instance.patch(`accounting/invoices/${id}/`, payload).then((response) => response.data);
//   },
//   async deleteInvoice(id: string) {
//     return instance.delete(`accounting/invoices/${id}/`).then((response) => response.data);
//   },
//   async getAging() {
//     return instance.get("accounting/invoices/aging/").then((response) => response.data);
//   },
//   async getSummary() {
//     return instance.get("accounting/invoices/summary/").then((response) => response.data);
//   },
//   async sendInvoice(id: string) {
//     return instance.post(`accounting/invoices/${id}/send_invoice/`).then((response) => response.data);
//   },
// };