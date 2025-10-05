import instance from "../../../api";

export const InvoiceService = {
  async getInvoices(filters: Object) {
    return instance
      .get("accounting/invoices/", { params: filters })
      .then((response) => response.data);
  },
  async getInvoiceDetails(id: string) {
    return instance.get(`accounting/invoices/${id}/`).then((response) => response.data);
  },
  async createInvoice(payload: Object) {
    return instance.post("accounting/invoices/", payload).then((response) => response.data);
  },
  async updateInvoice(payload: Object, id: string) {
    return instance.patch(`accounting/invoices/${id}/`, payload).then((response) => response.data);
  },
  async deleteInvoice(id: string) {
    return instance.delete(`accounting/invoices/${id}/`).then((response) => response.data);
  },
  async getAging() {
    return instance.get("accounting/invoices/aging/").then((response) => response.data);
  },
  async getSummary() {
    return instance.get("accounting/invoices/summary/").then((response) => response.data);
  },
  async sendInvoice(id: string) {
    return instance.post(`accounting/invoices/${id}/send_invoice/`).then((response) => response.data);
  },
};