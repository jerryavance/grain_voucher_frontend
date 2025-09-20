import instance from "../../../api";

export const RegisterService = {
  async requestOtp(phone_number: string, purpose: string) {
    return instance
      .post("auth/request-otp/", { phone_number, purpose })
      .then((response) => response.data)
      .catch((error) => {
        throw new Error(error.response?.data?.message || "Failed to request OTP");
      });
  },

  async Register(payload: Object) {
    return instance
      .post("auth/register/", payload)
      .then((response) => response.data)
      .catch((error) => {
        throw new Error(error.response?.data?.message || "Registration failed");
      });
  },
};