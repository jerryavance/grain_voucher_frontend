import instance from "../../../api";
import { HEADER_MULTIPART } from "../../../api/constants";

export const UserService = {
  async getUser() {
    return instance.get("users/").then((response) => response.data);
  },

  async getUsers(filters: Object) {
    console.log(filters);
    return instance
      .get("users/", { params: filters })
      .then((response) => response.data);
  },

  async getUserDetails(id: string) {
    return instance.get(`users/${id}/`).then((response) => response.data);
  },

  async createUser(payload: Object) {
    return instance.post(`users/`, payload).then((response) => response.data);
  },

  async updateUser(id: string, payload: Object) {
    return instance
      .patch(`users/${id}/`, payload, { headers: {'Content-Type': HEADER_MULTIPART}})
      .then((response) => response.data);
  },

  async verifyUserPhone(payload: any) {
    console.log(payload);
    return instance
      .post("users/verify-phone/", payload)
      .then((response) => response.data);
  },

  async verifyUserEmail(payload: any) {
    console.log(payload);
    return instance
      .post("users/verify-email/", payload)
      .then((response) => response.data);
  },

  async resetUserPassword(payload: any) {
    console.log(payload);
    return instance
      .post("users/update-password/", payload)
      .then((response) => response.data);
  },
};
