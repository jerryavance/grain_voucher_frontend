// CRM.service.ts
import instance from "../../api";

export const CRMService = {
  // Lead Services
  async getLeads(filters: Record<string, any>) {
    return instance
      .get("crm/leads/", { params: filters })
      .then((response) => response.data);
  },

  async createLead(payload: any) {
    return instance
      .post("crm/leads/", payload)
      .then((response) => response.data);
  },

  async getLeadDetails(id: string) {
    return instance
      .get(`crm/leads/${id}/`)
      .then((response) => response.data);
  },

  async updateLead(payload: any, id: string) {
    return instance
      .patch(`crm/leads/${id}/`, payload)
      .then((response) => response.data);
  },

  async deleteLead(id: string) {
    return instance
      .delete(`crm/leads/${id}/`)
      .then((response) => response.data);
  },

  async qualifyLead(id: string) {
    return instance
      .post(`crm/leads/${id}/qualify/`)
      .then((response) => response.data);
  },

  // Account Services
  async getAccounts(filters: Record<string, any>) {
    return instance
      .get("crm/accounts/", { params: filters })
      .then((response) => response.data);
  },

  async createAccount(payload: any) {
    return instance
      .post("crm/accounts/", payload)
      .then((response) => response.data);
  },

  async getAccountDetails(id: string) {
    return instance
      .get(`crm/accounts/${id}/`)
      .then((response) => response.data);
  },

  async updateAccount(payload: any, id: string) {
    return instance
      .patch(`crm/accounts/${id}/`, payload)
      .then((response) => response.data);
  },

  async deleteAccount(id: string) {
    return instance
      .delete(`crm/accounts/${id}/`)
      .then((response) => response.data);
  },

  // Contact Services
  async getContacts(filters: Record<string, any>) {
    return instance
      .get("crm/contacts/", { params: filters })
      .then((response) => response.data);
  },

  async createContact(payload: any) {
    return instance
      .post("crm/contacts/", payload)
      .then((response) => response.data);
  },

  async getContactDetails(id: string) {
    return instance
      .get(`crm/contacts/${id}/`)
      .then((response) => response.data);
  },

  async updateContact(payload: any, id: string) {
    return instance
      .patch(`crm/contacts/${id}/`, payload)
      .then((response) => response.data);
  },

  async deleteContact(id: string) {
    return instance
      .delete(`crm/contacts/${id}/`)
      .then((response) => response.data);
  },

  // Opportunity Services
  async getOpportunities(filters: Record<string, any>) {
    return instance
      .get("crm/opportunities/", { params: filters })
      .then((response) => response.data);
  },

  async createOpportunity(payload: any) {
    return instance
      .post("crm/opportunities/", payload)
      .then((response) => response.data);
  },

  async getOpportunityDetails(id: string) {
    return instance
      .get(`crm/opportunities/${id}/`)
      .then((response) => response.data);
  },

  async updateOpportunity(payload: any, id: string) {
    return instance
      .patch(`crm/opportunities/${id}/`, payload)
      .then((response) => response.data);
  },

  async deleteOpportunity(id: string) {
    return instance
      .delete(`crm/opportunities/${id}/`)
      .then((response) => response.data);
  },

  // Contract Services
  async getContracts(filters: Record<string, any>) {
    return instance
      .get("crm/contracts/", { params: filters })
      .then((response) => response.data);
  },

  async createContract(payload: any) {
    return instance
      .post("crm/contracts/", payload)
      .then((response) => response.data);
  },

  async getContractDetails(id: string) {
    return instance
      .get(`crm/contracts/${id}/`)
      .then((response) => response.data);
  },

  async updateContract(payload: any, id: string) {
    return instance
      .patch(`crm/contracts/${id}/`, payload)
      .then((response) => response.data);
  },

  async deleteContract(id: string) {
    return instance
      .delete(`crm/contracts/${id}/`)
      .then((response) => response.data);
  },

  async executeContract(id: string) {
    return instance
      .post(`crm/contracts/${id}/execute/`)
      .then((response) => response.data);
  },

  // Utility Services
  async getBDMUsers() {
    return instance
      .get("auth/users/", { params: { role: 'bdm' } })
      .then((response) => response.data);
  },

  async getHubs() {
    return instance
      .get("hubs/")
      .then((response) => response.data);
  },
};