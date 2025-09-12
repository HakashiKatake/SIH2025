import { useAuthStore } from '../store/authStore';
import { router } from 'expo-router';

export type UserRole = 'farmer' | 'dealer' | 'admin';

export class RoleProtection {
  /**
   * Check if user has required role
   */
  static hasRole(requiredRole: UserRole): boolean {
    const { user } = useAuthStore.getState();
    return user?.role === requiredRole;
  }

  /**
   * Check if user has any of the required roles
   */
  static hasAnyRole(requiredRoles: UserRole[]): boolean {
    const { user } = useAuthStore.getState();
    return requiredRoles.includes(user?.role as UserRole);
  }

  /**
   * Redirect user to appropriate dashboard based on role
   */
  static redirectToDashboard(): void {
    const { user, isAuthenticated } = useAuthStore.getState();
    
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    switch (user?.role) {
      case 'farmer':
        router.replace('/(tabs)/farmer/dashboard');
        break;
      case 'dealer':
        router.replace('/(tabs)/dealer/dashboard');
        break;
      default:
        // Default to farmer for backward compatibility
        router.replace('/(tabs)/farmer/dashboard');
        break;
    }
  }

  /**
   * Check if user can access farmer features
   */
  static canAccessFarmerFeatures(): boolean {
    return this.hasRole('farmer');
  }

  /**
   * Check if user can access dealer features
   */
  static canAccessDealerFeatures(): boolean {
    return this.hasRole('dealer');
  }

  /**
   * Get role-specific navigation path
   */
  static getRoleBasedPath(feature: string): string {
    const { user } = useAuthStore.getState();
    const role = user?.role || 'farmer';
    return `/(tabs)/${role}/${feature}`;
  }

  /**
   * Get role-specific theme color
   */
  static getRoleThemeColor(): string {
    const { user } = useAuthStore.getState();
    switch (user?.role) {
      case 'farmer':
        return '#16a34a'; // Green
      case 'dealer':
        return '#2563eb'; // Blue
      default:
        return '#16a34a'; // Default to green
    }
  }

  /**
   * Get role display name
   */
  static getRoleDisplayName(): string {
    const { user } = useAuthStore.getState();
    switch (user?.role) {
      case 'farmer':
        return 'Farmer';
      case 'dealer':
        return 'Dealer';
      case 'admin':
        return 'Administrator';
      default:
        return 'User';
    }
  }
}

/**
 * Hook for role-based access control
 */
export const useRoleAccess = () => {
  const { user, isAuthenticated } = useAuthStore();

  return {
    isAuthenticated,
    userRole: user?.role,
    isFarmer: user?.role === 'farmer',
    isDealer: user?.role === 'dealer',
    isAdmin: user?.role === 'admin',
    hasRole: (role: UserRole) => user?.role === role,
    hasAnyRole: (roles: UserRole[]) => roles.includes(user?.role as UserRole),
    canAccessFarmerFeatures: () => user?.role === 'farmer',
    canAccessDealerFeatures: () => user?.role === 'dealer',
    getRoleBasedPath: (feature: string) => `/(tabs)/${user?.role || 'farmer'}/${feature}`,
    getThemeColor: () => {
      switch (user?.role) {
        case 'farmer': return '#16a34a';
        case 'dealer': return '#2563eb';
        default: return '#16a34a';
      }
    },
    getRoleDisplayName: () => {
      switch (user?.role) {
        case 'farmer': return 'Farmer';
        case 'dealer': return 'Dealer';
        case 'admin': return 'Administrator';
        default: return 'User';
      }
    }
  };
};