import jwtDecode from "jwt-decode";
import {
  createContext,
  ReactNode,
  useEffect,
  useReducer,
  useState,
} from "react";
import LoadingScreen from "../components/LoadingScreen";
import axiosInstance from "../api";
import axios from "axios";
import { API_BASE_URL } from "../api/constants";

export type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export type AuthUser = null | Record<string, any>;

export type AuthState = {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: AuthUser;
};

enum Types {
  Init = "INIT",
  Login = "LOGIN",
  Logout = "LOGOUT",
}

type JWTAuthPayload = {
  [Types.Init]: {
    isAuthenticated: boolean;
    user: AuthUser;
  };
  [Types.Logout]: undefined;
  [Types.Login]: { user: AuthUser };
};

type JWTActions = ActionMap<JWTAuthPayload>[keyof ActionMap<JWTAuthPayload>];

type TAuthContext = {
  user?: AuthUser | null;
  isInitialized?: boolean;
  isAuthenticated?: boolean;
  method?: string;
  requestOtp?: (phone_number: string, purpose: string) => Promise<void>;
  loginWithOtp?: (phone_number: string, otp_code: string) => Promise<void>;
  logout?: () => void;
};

const initialState: AuthState = {
  user: null,
  isInitialized: false,
  isAuthenticated: false,
};

const isValidToken = (accessToken: string) => {
  if (!accessToken) return false;
  try {
    const decodedToken = jwtDecode<{ exp: number }>(accessToken);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp > currentTime;
  } catch (error) {
    console.error("Invalid token:", error);
    return false;
  }
};

const setSession = (accessToken: string | null, refreshToken: string | null = null) => {
  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
  } else {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    delete axiosInstance.defaults.headers.common.Authorization;
  }
};

const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }
    const response = await axios.post(`${API_BASE_URL}auth/token/refresh/`, {
      refresh: refreshToken,
    });
    const { access, refresh } = response.data;
    setSession(access, refresh);
    return access;
  } catch (error) {
    console.error("Token refresh failed:", error);
    setSession(null);
    return null;
  }
};

const reducer = (state: AuthState, action: JWTActions) => {
  switch (action.type) {
    case "INIT": {
      return {
        isInitialized: true,
        user: action.payload.user,
        isAuthenticated: action.payload.isAuthenticated,
      };
    }
    case "LOGIN": {
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };
    }
    case "LOGOUT": {
      return {
        ...state,
        user: null,
        isAuthenticated: false,
      };
    }
    default: {
      return state;
    }
  }
};

const AuthContext = createContext<TAuthContext>({
  user: null,
  isInitialized: false,
  isAuthenticated: false,
  method: "JWT",
  requestOtp: () => Promise.resolve(),
  loginWithOtp: () => Promise.resolve(),
  logout: () => {},
});

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [, setGetUserDetails] = useState(false);

  const requestOtp = async (phone_number: string, purpose: string) => {
    try {
      await axios.post(`${API_BASE_URL}auth/request-otp/`, {
        phone_number,
        purpose,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to request OTP");
    }
  };

  const loginWithOtp = async (phone_number: string, otp_code: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}auth/login/`, {
        phone_number,
        otp_code,
      });

      const { access, refresh } = response.data;
      setSession(access, refresh);

      const user = await getUser(access);

      dispatch({
        type: Types.Login,
        payload: { user },
      });
      setGetUserDetails(true);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const logout = () => {
    setSession(null);
    setGetUserDetails(false);
    dispatch({ type: Types.Logout });
  };

  const getUser = async (accessToken: string): Promise<any> => {
    try {
      const decodedToken: any = jwtDecode<{ user_id: string }>(accessToken);
      const userId = decodedToken.user_id;

      const response = await axiosInstance.get(`/auth/users/${userId}/`);
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch user:", error);
      return {};
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const accessToken = window.localStorage.getItem("accessToken");

        if (accessToken && isValidToken(accessToken)) {
          const user = await getUser(accessToken);
          dispatch({
            type: Types.Init,
            payload: {
              user,
              isAuthenticated: true,
            },
          });
        } else if (localStorage.getItem("refreshToken")) {
          // Attempt to refresh the access token
          const newAccessToken = await refreshToken();
          if (newAccessToken) {
            const user = await getUser(newAccessToken);
            dispatch({
              type: Types.Init,
              payload: {
                user,
                isAuthenticated: true,
              },
            });
          } else {
            dispatch({
              type: Types.Init,
              payload: {
                user: null,
                isAuthenticated: false,
              },
            });
          }
        } else {
          dispatch({
            type: Types.Init,
            payload: {
              user: null,
              isAuthenticated: false,
            },
          });
        }
      } catch (err) {
        console.error("Initialization error:", err);
        setSession(null);
        dispatch({
          type: Types.Init,
          payload: {
            user: null,
            isAuthenticated: false,
          },
        });
      }
    })();
  }, []);

  // Token refresh interceptor
  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          localStorage.getItem("refreshToken")
        ) {
          originalRequest._retry = true;
          try {
            const newAccessToken = await refreshToken();
            if (newAccessToken) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            console.error("Token refresh failed in interceptor:", refreshError);
            logout();
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, []);

  if (!state.isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: "JWT",
        requestOtp,
        loginWithOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;