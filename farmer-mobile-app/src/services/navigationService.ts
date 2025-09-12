import { router } from "expo-router";
import { User } from "../types";

export class NavigationService {
  /**
   * Navigate to the appropriate dashboard based on user role
   */
  static navigateToRoleDashboard(user: User | null) {
    if (!user) {
      router.replace("/login");
      return;
    }

    switch (user.role) {
      case "farmer":
        router.replace("/(tabs)/farmer/dashboard");
        break;
      case "dealer":
        router.replace("/(tabs)/dealer/dashboard");
        break;
      case "admin":
        // For now, admin users go to farmer dashboard
        // In the future, this could be a separate admin interface
        router.replace("/(tabs)/farmer/dashboard");
        break;
      default:
        // Default to farmer dashboard
        router.replace("/(tabs)/farmer/dashboard");
        break;
    }
  }

  /**
   * Check if user has access to a specific route
   */
  static hasRouteAccess(user: User | null, route: string): boolean {
    if (!user) {
      return false;
    }

    // Define role-based route access
    const farmerRoutes = [
      "/(tabs)/farmer",
      "/(tabs)/farmer/dashboard",
      "/(tabs)/farmer/field",
      "/(tabs)/farmer/scan",
      "/(tabs)/farmer/weather",
      "/(tabs)/farmer/chat",
      "/(tabs)/farmer/marketplace",
    ];

    const dealerRoutes = [
      "/(tabs)/dealer",
      "/(tabs)/dealer/dashboard",
      "/(tabs)/dealer/marketplace",
      "/(tabs)/dealer/inventory",
      "/(tabs)/dealer/orders",
      "/(tabs)/dealer/customers",
      "/(tabs)/dealer/chat",
    ];

    const commonRoutes = ["/profile", "/settings", "/notifications"];

    // Check if route is accessible for user role
    switch (user.role) {
      case "farmer":
        return (
          farmerRoutes.some((r) => route.includes(r)) ||
          commonRoutes.some((r) => route.includes(r))
        );
      case "dealer":
        return (
          dealerRoutes.some((r) => route.includes(r)) ||
          commonRoutes.some((r) => route.includes(r))
        );
      case "admin":
        // Admin has access to all routes
        return true;
      default:
        return false;
    }
  }

  /**
   * Get the appropriate home route for a user role
   */
  static getHomeRoute(role: string): string {
    switch (role) {
      case "farmer":
        return "/(tabs)/farmer/dashboard";
      case "dealer":
        return "/(tabs)/dealer/dashboard";
      case "admin":
        return "/(tabs)/farmer/dashboard"; // Default for now
      default:
        return "/(tabs)/farmer/dashboard";
    }
  }

  /**
   * Navigate to login if user is not authenticated
   */
  static requireAuth(user: User | null) {
    if (!user) {
      router.replace("/login");
      return false;
    }
    return true;
  }

  /**
   * Navigate to appropriate route after login
   */
  static handlePostLogin(user: User) {
    this.navigateToRoleDashboard(user);
  }

  /**
   * Handle logout navigation
   */
  static handleLogout() {
    router.replace("/login");
  }

  /**
   * Get role-specific tab configuration
   */
  static getRoleTabConfig(role: string) {
    switch (role) {
      case "farmer":
        return {
          theme: "#16a34a", // Green
          tabs: [
            { name: "dashboard", title: "Dashboard", icon: "🏠" },
            { name: "field", title: "My Field", icon: "🌾" },
            { name: "marketplace", title: "Sell Crops", icon: "🛒" },
            { name: "weather", title: "Weather", icon: "🌤️" },
            { name: "scan", title: "Scan", icon: "📷" },
            { name: "chat", title: "Assistant", icon: "🤖" },
          ],
        };
      case "dealer":
        return {
          theme: "#2563eb", // Blue
          tabs: [
            { name: "dashboard", title: "Dashboard", icon: "🏠" },
            { name: "marketplace", title: "Buy Crops", icon: "🛒" },
            { name: "inventory", title: "Inventory", icon: "📦" },
            { name: "orders", title: "Orders", icon: "📋" },
            { name: "customers", title: "Customers", icon: "👥" },
            { name: "chat", title: "Messages", icon: "💬" },
          ],
        };
      default:
        return {
          theme: "#16a34a",
          tabs: [],
        };
    }
  }
}
