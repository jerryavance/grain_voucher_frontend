import axios from "axios";
import { API_BASE_URL } from "./constants";
import toast from "react-hot-toast";

const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
});

instance.interceptors.request.use(
  (config: any) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// intercept request body and if any field with empty string is found, set it to null
instance.interceptors.request.use(
  (config: any) => {
    if (config.data) {
      const data = config.data;
      Object.keys(data).forEach((key) => {
        if (data[key] === "" || data[key] === undefined) {
          data[key] = null;
        }
      });
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// interceptor response and if error is 401, redirect to login else log error using toast
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response.status === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }

    // if status is in range of internal server error, log error using toast
    if (error.response.status >= 500) {
      toast.error(error.response.statusText);
    }

    // if action is forbidden with code 403, log error using toast
    if (error.response.status === 403) {
      toast.error(error.response.statusText);
      window.location.href = "/forbidden";
    }
    return Promise.reject(error);
  }
);

export default instance;
