import instance from "../../api";

export const TradeService = {
  async getTrades(filters: Object) {
    return instance
      .get("trade/trades/", {
        params: filters,
      })
      .then((response) => response.data);
  },

  async createTrade(payload: Object) {
    return instance.post("trade/trades/", payload).then((response) => response.data);
  },

  async getTradeDetails(id: string) {
    return instance.get(`trade/trades/${id}/`).then((response) => response.data);
  },

  async updateTrade(payload: Object, id: string) {
    return instance
      .patch(`trade/trades/${id}/`, payload)
      .then((response) => response.data);
  },

  async deleteTrade(id: string) {
    return instance.delete(`trade/trades/${id}/`).then((response) => response.data);
  },

  async approveTrade(id: string) {
    return instance.post(`trade/trades/${id}/approve/`).then((response) => response.data);
  },

  async completeTrade(id: string) {
    return instance.post(`trade/trades/${id}/complete/`).then((response) => response.data);
  },

  async getTradePnl(id: string) {
    return instance.get(`trade/trades/${id}/pnl/`).then((response) => response.data);
  },

  async getBrokerages(filters: Object) {
    return instance
      .get("trade/brokerages/", {
        params: filters,
      })
      .then((response) => response.data);
  },

  async createBrokerage(payload: Object) {
    return instance.post("trade/brokerages/", payload).then((response) => response.data);
  },

  async getBrokerageDetails(id: string) {
    return instance.get(`trade/brokerages/${id}/`).then((response) => response.data);
  },

  async updateBrokerage(payload: Object, id: string) {
    return instance
      .patch(`trade/brokerages/${id}/`, payload)
      .then((response) => response.data);
  },

  async deleteBrokerage(id: string) {
    return instance.delete(`trade/brokerages/${id}/`).then((response) => response.data);
  },
};

export const AccountService = {
  async getAccounts(filters: Object) {
    return instance
      .get("crm/accounts/", {
        params: filters,
      })
      .then((response) => response.data.results || []);
  },
};

export const GrainTypeService = {
  async getGrainTypes() {
    return instance
      .get("vouchers/grain-types/")
      .then((response) => response.data.results || []);
  },
};

export const HubService = {
  async getHubs() {
    return instance
      .get("hubs/")
      .then((response) => response.data.results || []);
  },
};

export const UserService = {
  async getUsers(filters: Object) {
    return instance
      .get("auth/users/", {
        params: { ...filters, role__in: ['bdm', 'agent'] },
      })
      .then((response) => response.data.results || []);
  },
};