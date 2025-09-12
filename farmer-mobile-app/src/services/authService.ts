import { api } from "./apiClient";
import { authStorage } from "./storageService";
import { User, RegisterData, LoginResponse } from "../types";

export interface LoginRequest {
  phone?: string;
  email?: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export class AuthService {
  /**
   * Login user with phone/email and password
   */
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/login", credentials);

      if (!response.user || !response.token) {
        throw new Error("Invalid response from server");
      }

      // Store authentication data
      await authStorage.setToken(response.token);
      await authStorage.setUserData(response.user);

      return response;
    } catch (error: any) {
      console.error("Login error:", error);

      // Provide specific error messages based on status codes
      if (error.status === 401) {
        throw new Error("Invalid phone number or password");
      } else if (error.status === 404) {
        throw new Error(
          "Account not found. Please check your phone number or register a new account."
        );
      } else if (error.status === 429) {
        throw new Error("Too many login attempts. Please try again later.");
      } else if (error.type === "NETWORK_ERROR") {
        throw new Error(
          "Network error. Please check your internet connection."
        );
      } else {
        throw new Error(error.message || "Login failed. Please try again.");
      }
    }
  }

  /**
   * Register new user
   */
  static async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/register", userData);

      if (!response.user || !response.token) {
        throw new Error("Invalid response from server");
      }

      // Store authentication data
      await authStorage.setToken(response.token);
      await authStorage.setUserData(response.user);

      return response;
    } catch (error: any) {
      console.error("Registration error:", error);

      // Provide specific error messages based on status codes
      if (error.status === 409) {
        throw new Error(
          "An account with this phone number already exists. Please use a different phone number or try logging in."
        );
      } else if (error.status === 400) {
        const errorData = error.originalError?.response?.data;
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors
            .map((err: any) => err.message)
            .join(", ");
          throw new Error(`Registration failed: ${errorMessages}`);
        } else {
          throw new Error(
            "Invalid registration data. Please check all fields and try again."
          );
        }
      } else if (error.status === 422) {
        throw new Error(
          "Invalid data format. Please check all fields and try again."
        );
      } else if (error.type === "NETWORK_ERROR") {
        if (__DEV__) {
          throw new Error(
            "Cannot connect to API server. Please check if the backend is running and your network configuration is correct. See NETWORK_SETUP.md for help."
          );
        } else {
          throw new Error(
            "Network error. Please check your internet connection."
          );
        }
      } else {
        throw new Error(
          error.message || "Registration failed. Please try again."
        );
      }
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(): Promise<User> {
    try {
      const response = await api.get<User>("/auth/profile");

      // Update stored user data
      await authStorage.setUserData(response);

      return response;
    } catch (error: any) {
      console.error("Get profile error:", error);

      if (error.status === 401) {
        // Token expired, clear auth data
        await AuthService.clearAuthData();
        throw new Error("Session expired. Please login again.");
      } else if (error.type === "NETWORK_ERROR") {
        throw new Error(
          "Network error. Please check your internet connection."
        );
      } else {
        throw new Error(error.message || "Failed to load profile.");
      }
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await api.put<User>("/auth/profile", updates);

      // Update stored user data
      await authStorage.setUserData(response);

      return response;
    } catch (error: any) {
      console.error("Update profile error:", error);

      if (error.status === 401) {
        await AuthService.clearAuthData();
        throw new Error("Session expired. Please login again.");
      } else if (error.status === 400) {
        throw new Error(
          "Invalid profile data. Please check all fields and try again."
        );
      } else if (error.type === "NETWORK_ERROR") {
        throw new Error(
          "Network error. Please check your internet connection."
        );
      } else {
        throw new Error(error.message || "Failed to update profile.");
      }
    }
  }

  /**
   * Logout user and clear all auth data
   */
  static async logout(): Promise<void> {
    try {
      // Optionally call logout endpoint to invalidate token on server
      // await api.post('/auth/logout');
    } catch (error) {
      console.warn(
        "Logout endpoint error (continuing with local logout):",
        error
      );
    } finally {
      await AuthService.clearAuthData();
    }
  }

  /**
   * Clear all authentication data
   */
  static async clearAuthData(): Promise<void> {
    try {
      await authStorage.removeToken();
      await authStorage.removeUserData();
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await authStorage.getToken();
      return !!token;
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  }

  /**
   * Get stored authentication data
   */
  static async getStoredAuthData(): Promise<{
    user: User | null;
    token: string | null;
  }> {
    try {
      const [user, token] = await Promise.all([
        authStorage.getUserData(),
        authStorage.getToken(),
      ]);

      return { user, token };
    } catch (error) {
      console.error("Error getting stored auth data:", error);
      return { user: null, token: null };
    }
  }

  /**
   * Validate token by making a profile request
   */
  static async validateToken(): Promise<boolean> {
    try {
      await AuthService.getProfile();
      return true;
    } catch (error) {
      console.warn("Token validation failed:", error);
      return false;
    }
  }

  /**
   * Refresh authentication state (simplified - no token validation)
   */
  static async refreshAuth(): Promise<{
    user: User | null;
    token: string | null;
    isValid: boolean;
  }> {
    try {
      const { user, token } = await AuthService.getStoredAuthData();

      if (!token || !user) {
        return { user: null, token: null, isValid: false };
      }

      // Don't validate token on startup to avoid 401 errors
      // Token validation will happen when making actual API calls
      return { user, token, isValid: true };
    } catch (error) {
      console.error("Error refreshing auth:", error);
      await AuthService.clearAuthData();
      return { user: null, token: null, isValid: false };
    }
  }
}
