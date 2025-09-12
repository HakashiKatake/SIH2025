import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Text, View, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFarmerProtection } from '../../../src/hooks/useRoleProtection';
import { useTabTTS } from '../../../src/hooks/useTabTTS';
import { usePathname } from 'expo-router';

export default function FarmerTabLayout() {
  const { hasAccess } = useFarmerProtection();
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
      'community': 'community', 
      'chat': 'chat',
      'field': 'field',
      'marketplace': 'marketplace',
      'weather': 'weather',
      'scan': 'scan'
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
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 85,
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
          paddingBottom: 10,
          paddingTop: 0,
        },
        tabBarItemStyle: {
          flex: 1,
          paddingBottom: 0,
          paddingTop: 15,
          height: 75,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#fff',
        tabBarBackground: () => (
          <Image 
            source={require('../../../assets/images/app-bar.png')} 
            style={styles.tabBarBackground}
            resizeMode="stretch"
          />
        ),
      }}>
      
      {/* Home/Dashboard Tab */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconWrapper}>
              <Ionicons 
                name={focused ? "home" : "home-outline"} 
                size={26} 
                color={focused ? '#16a34a' : '#7a7a7a'} 
              />
            </View>
          ),
        }}
      />
      
      {/* Community Tab */}
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconWrapper}>
              <Image 
                source={require('../../../assets/images/bar-2.png')} 
                style={[styles.tabIcon, { opacity: focused ? 1 : 0.7 }]}
              />
            </View>
          ),
        }}
      />
      
      {/* Chat Tab (Center) */}
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Assistant',
          tabBarIcon: ({ focused }) => (
            <View style={styles.centerIconContainer}>
              <Image 
                source={require('../../../assets/images/center-icon-bg.png')} 
                style={styles.centerIconBg}
              />
              <Image 
                source={require('../../../assets/images/center-icon.png')} 
                style={styles.centerIcon}
              />
            </View>
          ),
        }}
      />
      
      {/* Field Tab */}
      <Tabs.Screen
        name="field"
        options={{
          title: 'My Field',
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconWrapper}>
              <Image 
                source={require('../../../assets/images/bar-3.png')} 
                style={[styles.tabIcon, { opacity: focused ? 1 : 0.7 }]}
              />
            </View>
          ),
        }}
      />
      
      {/* Marketplace Tab */}
      <Tabs.Screen
        name="marketplace"
        options={{
          title: 'Sell Crops',
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconWrapper}>
              <Image 
                source={require('../../../assets/images/bar-4.png')} 
                style={[styles.tabIcon, { opacity: focused ? 1 : 0.7 }]}
              />
            </View>
          ),
        }}
      />
      
      {/* Hidden tabs that were in the original layout */}
      <Tabs.Screen
        name="weather"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarBackground: {
    width: '100%',
    height: '100%',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    marginBottom: 5,
  },
  tabIcon: {
    width: 26,
    height: 26,
    marginLeft: 60,
    marginTop: 10,
    resizeMode: 'contain',
  },
  centerIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    marginTop: -5,
    marginBottom: 5,
    marginLeft: 60,
  },
  centerIconBg: {
    width: 50,
    height: 50,
    position: 'absolute',
    resizeMode: 'contain',
  },
  centerIcon: {
    width: 24,
    height: 24,
    zIndex: 1,
    resizeMode: 'contain',
  },
});