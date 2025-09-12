import { create } from 'zustand';
import { AuthService } from '../services/authService';
import { NavigationService } from '../services/navigationService';
import { AuthState, RegisterData } from '../types';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  login: async (phone: string, password: string, email?: string) => {
    try {
      set({ isLoading: true });
      
      const loginData: any = { password };
      if (email) {
        loginData.email = email;
        console.log('Attempting login with email:', email);
      } else {
        loginData.phone = phone;
        console.log('Attempting login with phone:', phone);
      }
      
      const response = await AuthService.login(loginData);
      console.log('Login successful, user authenticated');

      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
      
      // Sync user type with backend role if available
      if (response.user.role) {
        const { UserTypeService } = await import('../services/userTypeService');
        await UserTypeService.setUserType(response.user.role as 'farmer' | 'dealer');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      set({ isLoading: false });
      throw error; // Re-throw the error with proper message from AuthService
    }
  },

  register: async (userData: RegisterData) => {
    try {
      set({ isLoading: true });
      
      const response = await AuthService.register(userData);
      console.log('Registration successful, user authenticated');

      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
      
      // Sync user type with backend role if available
      if (response.user.role) {
        const { UserTypeService } = await import('../services/userTypeService');
        await UserTypeService.setUserType(response.user.role as 'farmer' | 'dealer');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      set({ isLoading: false });
      throw error; // Re-throw the error with proper message from AuthService
    }
  },

  logout: async () => {
    await AuthService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    
    // Navigate to login screen
    NavigationService.handleLogout();
  },

  // Load stored authentication data on app start
  loadStoredAuth: async () => {
    try {
      const { user, token } = await AuthService.getStoredAuthData();

      if (user && token) {
        set({ 
          user, 
          token,
          isAuthenticated: true 
        });
        
        // Sync user type with backend role if available
        if (user.role) {
          const { UserTypeService } = await import('../services/userTypeService');
          await UserTypeService.setUserType(user.role as 'farmer' | 'dealer');
        }
      } else {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    }
  },
}));