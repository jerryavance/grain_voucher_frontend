import instance from "../../api";

export const PayrollService = {
  // Employee endpoints
  async getEmployees(filters: Record<string, any>) {
    return instance
      .get("payroll/employees/", {
        params: filters,
      })
      .then((response) => response.data);
  },

  async createEmployee(payload: Object) {
    return instance.post("payroll/employees/", payload).then((response) => response.data);
  },

  async getEmployeeDetails(id: string) {
    return instance.get(`payroll/employees/${id}/`).then((response) => response.data);
  },

  async updateEmployee(payload: Object, id: string) {
    return instance
      .patch(`payroll/employees/${id}/`, payload)
      .then((response) => response.data);
  },

  async deleteEmployee(id: string) {
    return instance.delete(`payroll/employees/${id}/`).then((response) => response.data);
  },

  // Payslip endpoints
  async getPayslips(filters: Record<string, any>) {
    return instance
      .get("payroll/payslips/", {
        params: filters,
      })
      .then((response) => response.data);
  },

  async createPayslip(payload: Object) {
    return instance.post("payroll/payslips/", payload).then((response) => response.data);
  },

  async getPayslipDetails(id: string) {
    return instance.get(`payroll/payslips/${id}/`).then((response) => response.data);
  },

  async updatePayslip(payload: Object, id: string) {
    return instance
      .patch(`payroll/payslips/${id}/`, payload)
      .then((response) => response.data);
  },

  async deletePayslip(id: string) {
    return instance.delete(`payroll/payslips/${id}/`).then((response) => response.data);
  },

  // Generate monthly payslips
  async generateMonthlyPayslips(period: string) {
    return instance
      .post("payroll/payslips/generate_monthly/", { period })
      .then((response) => response.data);
  },
};