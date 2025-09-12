import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { useDealerProtection } from '../../../src/hooks/useRoleProtection';
import { useTabTTS } from '../../../src/hooks/useTabTTS';
import { usePathname } from 'expo-router';

export default function DealerTabLayout() {
  const { hasAccess } = useDealerProtection();
  const { speakTabName } = useTabTTS();
  const pathname = usePathname();

  if (!hasAccess) {
    return null;
  }

  // Handle tab navigation with TTS
  useEffect(() => {
    // Extract tab name from pathname
    const pathParts = pathname.split('/');
    const currentTab = pathParts[pathParts.length - 1];
    
    // Map pathname to tab names for TTS
    const tabMapping: { [key: string]: string } = {
      'dashboard': 'dashboard',
      'marketplace': 'marketplace',
      'inventory': 'inventory',
      'orders': 'orders',
      'customers': 'customers',
      'community': 'community',
      'chat': 'chat'
    };

    const tabName = tabMapping[currentTab];
    if (tabName) {
      // Add a small delay to ensure the navigation is complete
      const ttsTimeout = setTimeout(() => {
        speakTabName(tabName);
      }, 300);

      return () => clearTimeout(ttsTimeout);
    }
  }, [pathname, speakTabName]);
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb', // Blue color for dealer theme
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
        },
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: 'Buy Crops',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>🛒</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>📦</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>📋</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Customers',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>👥</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>🌐</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>💬</Text>
          ),
        }}
      />
    </Tabs>
  );
}