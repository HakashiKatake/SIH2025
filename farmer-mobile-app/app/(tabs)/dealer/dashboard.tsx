import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useAuthStore } from "../../../src/store/authStore";
import { useMarketplaceStore } from "../../../src/store/marketplaceStore";
import { DealerProfile } from "../../../src/types";
import { router } from "expo-router";
import { SafeAreaContainer } from "../../../src/components/ui/SafeAreaContainer";
import { DealerIllustration } from "../../../src/components/ui/IllustrationPlaceholder";
import { ActionButton } from "../../../src/components/ui/ActionButton";
import { Colors, Typography, Spacing, BorderRadius, Shadows } from "../../../src/constants/DesignSystem";

export default function DealerDashboard() {
  const { user, token } = useAuthStore();
  const { orders, getMyOrders, isLoading } = useMarketplaceStore();
  const [stats, setStats] = useState({
    totalPurchases: 0,
    activeOrders: 0,
    suppliers: 0
  });

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  const loadDashboardData = async () => {
    try {
      await getMyOrders(token!);
      
      // Calculate stats from orders
      const activeOrdersCount = orders.filter(order => 
        order.status === 'pending' || order.status === 'confirmed'
      ).length;
      
      const totalPurchasesAmount = orders.reduce((sum, order) => 
        sum + order.totalAmount, 0
      );
      
      const uniqueSuppliers = new Set(orders.map(order => order.farmerId)).size;
      
      setStats({
        totalPurchases: totalPurchasesAmount,
        activeOrders: activeOrdersCount,
        suppliers: uniqueSuppliers
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const recentOrders = orders.slice(0, 3);

  return (
    <SafeAreaContainer backgroundColor={Colors.background}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>
                Welcome back!
              </Text>
              <Text style={styles.businessName}>
                {user?.role === 'dealer' && user.profile ? 
                  (user.profile as DealerProfile).businessName || "Your Business" : 
                  user?.name || "Dealer"}
              </Text>
            </View>
            <DealerIllustration size="medium" />
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Business Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: Colors.primary }]}>
                ₹{stats.totalPurchases.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Total Purchases</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: Colors.info }]}>
                {stats.activeOrders}
              </Text>
              <Text style={styles.statLabel}>Active Orders</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: Colors.warning }]}>
                {stats.suppliers}
              </Text>
              <Text style={styles.statLabel}>Suppliers</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors.primaryLight }]}
              onPress={() => router.push("/(tabs)/dealer/marketplace")}
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>🛒</Text>
              </View>
              <Text style={styles.actionText}>Browse Marketplace</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors.dealerBg }]}
              onPress={() => router.push("/(tabs)/dealer/orders")}
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>📋</Text>
              </View>
              <Text style={styles.actionText}>My Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors.cropBg }]}
              onPress={() => router.push("/(tabs)/dealer/inventory")}
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>📦</Text>
              </View>
              <Text style={styles.actionText}>Inventory</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors.leafBg }]}
              onPress={() => router.push("/(tabs)/dealer/customers")}
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>👥</Text>
              </View>
              <Text style={styles.actionText}>Customers</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.recentOrdersContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/dealer/orders")}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentOrders.length > 0 ? (
            <View style={styles.ordersList}>
              {recentOrders.map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderTitle}>Order #{order.id}</Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(order.status as string) }
                    ]}>
                      <Text style={styles.statusText}>
                        {(order.status as string).toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.orderAmount}>₹{order.totalAmount}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.orderDate).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No recent orders</Text>
              <ActionButton
                title="Browse Products"
                variant="primary"
                size="medium"
                onPress={() => router.push("/(tabs)/dealer/marketplace")}
              />
            </View>
          )}
        </View>

        {/* Market Insights */}
        <View style={styles.marketInsightsContainer}>
          <Text style={styles.sectionTitle}>Market Insights</Text>
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Today's Best Deals</Text>
            <Text style={styles.insightDescription}>
              Fresh produce available at competitive prices
            </Text>
            <ActionButton
              title="Explore Deals"
              variant="outline"
              size="small"
              onPress={() => router.push("/(tabs)/dealer/marketplace")}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaContainer>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return Colors.warning;
    case 'confirmed':
      return Colors.info;
    case 'delivered':
      return Colors.success;
    case 'cancelled':
      return Colors.error;
    default:
      return Colors.textSecondary;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    ...Shadows.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: Typography.bodyLarge,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  businessName: {
    fontSize: Typography.headingMedium,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  statsContainer: {
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  sectionTitle: {
    fontSize: Typography.headingSmall,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: Typography.headingMedium,
    fontWeight: Typography.bold,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  quickActionsContainer: {
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    marginTop: 0,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  actionIcon: {
    marginBottom: Spacing.sm,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionText: {
    fontSize: Typography.bodyMedium,
    fontWeight: Typography.medium,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  recentOrdersContainer: {
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    marginTop: 0,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  viewAllText: {
    fontSize: Typography.bodyMedium,
    color: Colors.primary,
    fontWeight: Typography.medium,
  },
  ordersList: {
    gap: Spacing.md,
  },
  orderCard: {
    padding: Spacing.md,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  orderTitle: {
    fontSize: Typography.bodyMedium,
    fontWeight: Typography.medium,
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: Typography.bodySmall,
    color: Colors.textInverse,
    fontWeight: Typography.medium,
  },
  orderAmount: {
    fontSize: Typography.bodyLarge,
    fontWeight: Typography.semibold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  orderDate: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
  },
  emptyStateText: {
    fontSize: Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  marketInsightsContainer: {
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    marginTop: 0,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  insightCard: {
    padding: Spacing.lg,
    backgroundColor: Colors.primaryLighter,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  insightTitle: {
    fontSize: Typography.bodyLarge,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  insightDescription: {
    fontSize: Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
});
