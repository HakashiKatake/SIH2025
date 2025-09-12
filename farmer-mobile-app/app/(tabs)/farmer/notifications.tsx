"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaContainer } from "../../../src/components/ui/SafeAreaContainer"
import { useTranslation } from "../../../src/hooks/useTranslation"

interface Notification {
  id: string
  title: string
  message: string
  category: "all" | "farming" | "crop" | "weather" | "marketplace" | "system"
  type: "info" | "warning" | "success" | "error"
  timestamp: string
  read: boolean
  actionUrl?: string
}



export default function NotificationsScreen() {
  const { t } = useTranslation()
  const [activeFilter, setActiveFilter] = useState("all")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [refreshing, setRefreshing] = useState(false)

  // Mock notifications with farming-related alerts
  const mockNotifications: Notification[] = [
    {
      id: "1",
      title: `🌧️ ${t('notifications.heavyRainAlert')}`,
      message: t('notifications.heavyRainMessage'),
      category: "weather",
      type: "warning",
      timestamp: `2 ${t('notifications.timeAgo.hoursAgo')}`,
      read: false,
      actionUrl: "/weather"
    },
    {
      id: "2", 
      title: `💧 ${t('notifications.irrigationReminder')}`,
      message: t('notifications.irrigationMessage'),
      category: "farming",
      type: "info",
      timestamp: `4 ${t('notifications.timeAgo.hoursAgo')}`,
      read: false,
      actionUrl: "/field"
    },
    {
      id: "3",
      title: `🌱 ${t('notifications.cropGrowthUpdate')}`,
      message: t('notifications.cropGrowthMessage'),
      category: "crop",
      type: "success",
      timestamp: `6 ${t('notifications.timeAgo.hoursAgo')}`,
      read: true,
      actionUrl: "/field"
    },
    {
      id: "4",
      title: `🐛 ${t('notifications.pestAlert')}`,
      message: t('notifications.pestMessage'),
      category: "crop",
      type: "error",
      timestamp: `8 ${t('notifications.timeAgo.hoursAgo')}`,
      read: false,
      actionUrl: "/field"
    },
    {
      id: "5",
      title: `💰 ${t('notifications.marketPriceUpdate')}`,
      message: t('notifications.marketPriceMessage'),
      category: "marketplace",
      type: "success",
      timestamp: `12 ${t('notifications.timeAgo.hoursAgo')}`,
      read: true,
      actionUrl: "/marketplace"
    },
    {
      id: "6",
      title: `🌡️ ${t('notifications.temperatureWarning')}`,
      message: t('notifications.temperatureMessage'),
      category: "weather",
      type: "warning",
      timestamp: `1 ${t('notifications.timeAgo.dayAgo')}`,
      read: false,
      actionUrl: "/weather"
    },
    {
      id: "7",
      title: `📱 ${t('notifications.appUpdate')}`,
      message: t('notifications.appUpdateMessage'),
      category: "system",
      type: "info",
      timestamp: `2 ${t('notifications.timeAgo.daysAgo')}`,
      read: true
    },
    {
      id: "8",
      title: `🚜 ${t('notifications.equipmentMaintenance')}`,
      message: t('notifications.equipmentMessage'),
      category: "farming",
      type: "warning",
      timestamp: `3 ${t('notifications.timeAgo.daysAgo')}`,
      read: false,
      actionUrl: "/field"
    }
  ]

  const loadNotifications = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setNotifications(mockNotifications)
    } catch (err) {
      console.error("Failed to load notifications:", err)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadNotifications()
    setRefreshing(false)
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  // Filter notifications based on active filter
  const filteredNotifications = activeFilter === 'all' 
    ? notifications 
    : notifications.filter(n => n.category === activeFilter);

  // Helper functions for notification display
  const getNotificationIcon = (category: string) => {
    switch (category) {
      case 'weather': return 'cloud-outline';
      case 'farming': return 'leaf-outline';
      case 'crop': return 'flower-outline';
      case 'marketplace': return 'storefront-outline';
      case 'system': return 'settings-outline';
      default: return 'notifications-outline';
    }
  };

  const getNotificationIconColor = (type: string) => {
    switch (type) {
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'success': return '#22c55e';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getNotificationIconBg = (type: string) => {
    switch (type) {
      case 'error': return '#fef2f2';
      case 'warning': return '#fffbeb';
      case 'success': return '#f0fdf4';
      case 'info': return '#eff6ff';
      default: return '#f9fafb';
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
    
    // Navigate to action URL if available
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Calculate notification counts by category
  const getNotificationCounts = () => {
    const counts = {
      all: notifications.length,
      farming: notifications.filter(n => n.category === 'farming').length,
      crop: notifications.filter(n => n.category === 'crop').length,
      weather: notifications.filter(n => n.category === 'weather').length,
      marketplace: notifications.filter(n => n.category === 'marketplace').length,
      system: notifications.filter(n => n.category === 'system').length,
    };
    return counts;
  };

  const counts = getNotificationCounts();
  
  const categories = [
    { id: "all", label: t('notifications.all'), count: counts.all },
    { id: "farming", label: t('notifications.farming'), count: counts.farming },
    { id: "crop", label: t('notifications.crop'), count: counts.crop },
    { id: "weather", label: t('notifications.weather'), count: counts.weather },
    { id: "marketplace", label: t('notifications.marketplace'), count: counts.marketplace },
    { id: "system", label: t('notifications.system'), count: counts.system },
  ]

  return (
    <SafeAreaContainer backgroundColor="#f8fafc">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterTabs}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.filterTab, activeFilter === category.id && styles.activeTab]}
                onPress={() => setActiveFilter(category.id)}
              >
                <Text style={[styles.filterText, activeFilter === category.id && styles.activeFilterText]}>
                  {category.label} ({category.count})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifications.length > 0 ? (
          <View style={styles.notificationsList}>
            {filteredNotifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  !notification.read && styles.unreadNotification
                ]}
                onPress={() => handleNotificationPress(notification)}
              >
                <View style={[
                  styles.notificationIcon,
                  { backgroundColor: getNotificationIconBg(notification.type) }
                ]}>
                  <Ionicons 
                    name={getNotificationIcon(notification.category)} 
                    size={24} 
                    color={getNotificationIconColor(notification.type)} 
                  />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationMessage} numberOfLines={2}>
                    {notification.message}
                  </Text>
                  <Text style={styles.notificationTime}>{notification.timestamp}</Text>
                </View>
                {!notification.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))}
            
            {/* Clear All Button */}
            {notifications.some(n => !n.read) && (
              <TouchableOpacity style={styles.clearAllButton} onPress={markAllAsRead}>
                <Text style={styles.clearAllText}>{t('notifications.markAllRead')}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          /* Empty State */
          <View style={styles.emptyState}>
            <View style={styles.emptyIllustration}>
              <View style={styles.farmerAvatar}>
                <Text style={styles.farmerEmoji}>👨🏽‍🌾</Text>
              </View>
              <View style={styles.phoneContainer}>
                <View style={styles.phone}>
                  <View style={styles.phoneScreen} />
                </View>
              </View>
            </View>
            <Text style={styles.emptyTitle}>
              {activeFilter === 'all' 
                ? t('notifications.emptyTitle')
                : `${t('common.no')} ${categories.find(c => c.id === activeFilter)?.label.toLowerCase()} ${t('notifications.title').toLowerCase()}`
              }
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaContainer>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#ffffff",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4ade80",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
  },
  placeholder: {
    width: 40,
  },
  filterContainer: {
    backgroundColor: "#ffffff",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  filterTabs: {
    flexDirection: "row",
    backgroundColor: "#dcfce7",
    borderRadius: 25,
    padding: 4,
    minWidth: 600, // Ensure tabs don't get too cramped
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: "transparent",
    alignItems: "center",
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  activeFilterText: {
    color: "#1f2937",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 100,
  },
  emptyIllustration: {
    alignItems: "center",
    marginBottom: 40,
    position: "relative",
  },
  farmerAvatar: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  farmerEmoji: {
    fontSize: 80,
  },
  phoneContainer: {
    position: "absolute",
    bottom: 30,
    right: 20,
  },
  phone: {
    width: 50,
    height: 75,
    backgroundColor: "#1f2937",
    borderRadius: 10,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: "#60a5fa",
    borderRadius: 6,
  },
  emptyTitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "400",
  },
  notificationsList: {
    padding: 20,
  },
  notificationItem: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: "#22c55e",
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "500",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
    marginLeft: 8,
  },
  showAllButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#22c55e",
    borderRadius: 12,
  },
  showAllText: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
  },
  clearAllButton: {
    marginTop: 20,
    paddingVertical: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  clearAllText: {
    fontSize: 14,
    color: "#ef4444",
    fontWeight: "500",
  },
})
