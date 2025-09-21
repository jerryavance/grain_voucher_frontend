import instance from "../../api";

export const UserService = {
  async getUsers(filters: Object) {
    return instance
      .get("auth/users/", {
        params: filters,
      })
      .then((response) => response.data);
  },

  // User.service.ts
  async getAvailableFarmers(filters: Record<string, any>) {
    return instance
      .get("vouchers/deposits/available_farmers", { params: filters })
      .then((response) => response.data);
  },

  
  async createUser(payload: Object) {
    return instance.post("auth/users/", payload).then((response) => response.data);
  },
  async getUserDetails(id: string) {
    return instance.get(`auth/users/${id}/`).then((response) => response.data);
  },
  async updateUser(payload: Object, id: string) {
    return instance
      .patch(`auth/users/${id}/`, payload)
      .then((response) => response.data);
  },
  async deactivateUser(id: string) {
    return instance.delete(`auth/users/${id}/`).then((response) => response.data);
  },
};
