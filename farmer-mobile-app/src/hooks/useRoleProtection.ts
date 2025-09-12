import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { NavigationService } from '../services/navigationService';

/**
 * Hook to protect routes based on user role and authentication
 */
export function useRoleProtection(requiredRole?: string, redirectPath?: string) {
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }

    // Check if specific role is required
    if (requiredRole && user.role !== requiredRole) {
      // Redirect to appropriate dashboard for user's role
      if (redirectPath) {
        router.replace(redirectPath);
      } else {
        NavigationService.navigateToRoleDashboard(user);
      }
      return;
    }
  }, [isAuthenticated, user, requiredRole, redirectPath]);

  return {
    user,
    isAuthenticated,
    hasAccess: isAuthenticated && user && (!requiredRole || user.role === requiredRole)
  };
}

/**
 * Hook specifically for farmer-only routes
 */
export function useFarmerProtection() {
  return useRoleProtection('farmer');
}

/**
 * Hook specifically for dealer-only routes
 */
export function useDealerProtection() {
  return useRoleProtection('dealer');
}

/**
 * Hook for routes that require authentication but no specific role
 */
export function useAuthProtection() {
  return useRoleProtection();
}