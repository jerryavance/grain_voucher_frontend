// src/pages/Reports/Reports.service.ts
import instance from "../../api";

export const ReportsService = {
  // Report Exports
  async getReportExports(filters: Record<string, any>) {
    return instance
      .get("reports/exports/", { params: filters })
      .then((response) => response.data);
  },

  async getReportExportDetails(id: string) {
    return instance
      .get(`reports/exports/${id}/`)
      .then((response) => response.data);
  },

  async downloadReport(id: string) {
    return instance
      .get(`reports/exports/${id}/download/`, { 
        responseType: 'blob' 
      })
      .then((response) => response.data);
  },

  async cleanupExpiredReports() {
    return instance
      .get("reports/exports/cleanup_expired/")
      .then((response) => response.data);
  },

  // Report Schedules
  async getReportSchedules(filters: Record<string, any>) {
    return instance
      .get("reports/schedules/", { params: filters })
      .then((response) => response.data);
  },

  async getReportScheduleDetails(id: string) {
    return instance
      .get(`reports/schedules/${id}/`)
      .then((response) => response.data);
  },

  async createReportSchedule(payload: any) {
    return instance
      .post("reports/schedules/", payload)
      .then((response) => response.data);
  },

  async updateReportSchedule(id: string, payload: any) {
    return instance
      .patch(`reports/schedules/${id}/`, payload)
      .then((response) => response.data);
  },

  async deleteReportSchedule(id: string) {
    return instance
      .delete(`reports/schedules/${id}/`)
      .then((response) => response.data);
  },

  async runScheduleNow(id: string) {
    return instance
      .post(`reports/schedules/${id}/run_now/`)
      .then((response) => response.data);
  },

  async toggleScheduleActive(id: string) {
    return instance
      .post(`reports/schedules/${id}/toggle_active/`)
      .then((response) => response.data);
  },

  // Report Generation
  async generateSupplierReport(payload: any) {
    return instance
      .post("reports/generate/supplier/", payload)
      .then((response) => response.data);
  },

  async generateTradeReport(payload: any) {
    return instance
      .post("reports/generate/trade/", payload)
      .then((response) => response.data);
  },

  async generateInvoiceReport(payload: any) {
    return instance
      .post("reports/generate/invoice/", payload)
      .then((response) => response.data);
  },

  async generatePaymentReport(payload: any) {
    return instance
      .post("reports/generate/payment/", payload)
      .then((response) => response.data);
  },

  async generateDepositorReport(payload: any) {
    return instance
      .post("reports/generate/depositor/", payload)
      .then((response) => response.data);
  },

  async generateVoucherReport(payload: any) {
    return instance
      .post("reports/generate/voucher/", payload)
      .then((response) => response.data);
  },

  async generateInventoryReport(payload: any) {
    return instance
      .post("reports/generate/inventory/", payload)
      .then((response) => response.data);
  },

  async generateInvestorReport(payload: any) {
    return instance
      .post("reports/generate/investor/", payload)
      .then((response) => response.data);
  },

  // Dashboard Stats
  async getDashboardStats() {
    return instance
      .get("reports/dashboard/stats/")
      .then((response) => response.data);
  },
};