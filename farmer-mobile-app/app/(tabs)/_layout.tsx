import { Tabs, router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import { useAuthStore } from "../../src/store/authStore";

export default function TabLayout() {
  const { isAuthenticated, user } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted before navigation
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle navigation after component is mounted
  useEffect(() => {
    if (!isMounted) return;

    // Add a small delay to ensure the layout is fully rendered
    const navigationTimeout = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (user?.role) {
        // Redirect users to their respective dashboards based on role
        if (user.role === "farmer") {
          router.replace("/farmer/dashboard");
        } else if (user.role === "dealer") {
          router.replace("/dealer/dashboard");
        }
      }
    }, 100); // Small delay to ensure proper mounting

    return () => clearTimeout(navigationTimeout);
  }, [isAuthenticated, user?.role, isMounted]);

  // If not authenticated, don't render tabs
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarStyle: { display: 'none' }, // Hide the default tab bar
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size || 24, color }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="features"
        options={{
          title: "Features",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size || 24, color }}>⚡</Text>
          ),
        }}
      />
      {user?.role === "farmer" && (
        <Tabs.Screen
          name="farmer"
          options={{
            title: "Farmer",
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size || 24, color }}>🌾</Text>
            ),
          }}
        />
      )}
      {user?.role === "dealer" && (
        <Tabs.Screen
          name="dealer"
          options={{
            title: "Dealer",
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size || 24, color }}>🏪</Text>
            ),
          }}
        />
      )}
    </Tabs>
  );
}
