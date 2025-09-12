import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// API Configuration
const API_BASE_URL = __DEV__
  ? "http://localhost:3000/api"
  : "https://your-production-api.com/api";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting auth token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config;

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && originalRequest) {
      try {
        await AsyncStorage.removeItem("authToken");
        await AsyncStorage.removeItem("userData");
        // You might want to redirect to login screen here
        // NavigationService.navigate('Login');
      } catch (storageError) {
        console.error("Error clearing auth data:", storageError);
      }
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: "Network error. Please check your internet connection.",
        type: "NETWORK_ERROR",
        originalError: error,
      });
    }

    // Handle server errors
    const errorMessage =
      error.response.data?.error?.message ||
      error.response.data?.message ||
      "An unexpected error occurred";

    return Promise.reject({
      message: errorMessage,
      status: error.response.status,
      type: "API_ERROR",
      originalError: error,
    });
  }
);

// API response wrapper
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Generic API methods
export const api = {
  get: <T = any>(url: string, params?: any): Promise<T> =>
    apiClient.get<ApiResponse<T>>(url, { params }).then((res) => {
      if (res.data.success && res.data.data !== undefined) {
        return res.data.data;
      }
      throw new Error(res.data.error?.message || 'API request failed');
    }),

  post: <T = any>(url: string, data?: any): Promise<T> =>
    apiClient.post<ApiResponse<T>>(url, data).then((res) => {
      if (res.data.success && res.data.data !== undefined) {
        return res.data.data;
      }
      throw new Error(res.data.error?.message || 'API request failed');
    }),

  put: <T = any>(url: string, data?: any): Promise<T> =>
    apiClient.put<ApiResponse<T>>(url, data).then((res) => {
      if (res.data.success && res.data.data !== undefined) {
        return res.data.data;
      }
      throw new Error(res.data.error?.message || 'API request failed');
    }),

  patch: <T = any>(url: string, data?: any): Promise<T> =>
    apiClient.patch<ApiResponse<T>>(url, data).then((res) => {
      if (res.data.success && res.data.data !== undefined) {
        return res.data.data;
      }
      throw new Error(res.data.error?.message || 'API request failed');
    }),

  delete: <T = any>(url: string): Promise<T> =>
    apiClient.delete<ApiResponse<T>>(url).then((res) => {
      if (res.data.success && res.data.data !== undefined) {
        return res.data.data;
      }
      throw new Error(res.data.error?.message || 'API request failed');
    }),

  // For file uploads
  postFormData: <T = any>(url: string, formData: FormData): Promise<T> =>
    apiClient
      .post<ApiResponse<T>>(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        if (res.data.success && res.data.data !== undefined) {
          return res.data.data;
        }
        throw new Error(res.data.error?.message || 'API request failed');
      }),
};

export default apiClient;
