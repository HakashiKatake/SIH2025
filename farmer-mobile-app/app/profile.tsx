import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAuthStore } from "../src/store/authStore"
import { SafeAreaView } from "react-native-safe-area-context"
import { Colors, Typography, Spacing, BorderRadius } from "../src/constants/DesignSystem"

const { width } = Dimensions.get("window")

export default function ProfileScreen() {
  const { user, logout } = useAuthStore()

  const menuItems = [
    {
      icon: "person-outline",
      title: "About me",
      hasArrow: true,
      route: "/profile/about",
    },
    {
      icon: "bag-outline",
      title: "My Orders",
      hasArrow: true,
      route: "/profile/orders",
    },
    {
      icon: "heart-outline",
      title: "My Favourites",
      hasArrow: true,
      route: "/profile/favourites",
    },
    {
      icon: "location-outline",
      title: "My Address",
      hasArrow: true,
      route: "/profile/address",
    },
    {
      icon: "card-outline",
      title: "Credit Cards",
      hasArrow: true,
      route: "/profile/cards",
    },
    {
      icon: "receipt-outline",
      title: "Transactions",
      hasArrow: true,
      route: "/profile/transactions",
    },
    {
      icon: "notifications-outline",
      title: "Notifications",
      hasArrow: true,
      route: "/notifications",
    },
    {
      icon: "log-out-outline",
      title: "Sign out",
      hasArrow: false,
      isDestructive: true,
    },
  ]

  const handleMenuPress = (item: (typeof menuItems)[0]) => {
    if (item.title === "Sign out") {
      logout()
      router.replace("/login")
    } else if (item.route) {
      router.push(item.route as any)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face",
              }}
              style={styles.profileImage}
            />
          </View>
          <Text style={styles.profileName}>{user?.name || user?.profile?.name || "Rupesh Mahajan"}</Text>
          <Text style={styles.profileEmail}>{user?.email || "Rupesh1M@gmail.com"}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconContainer, item.isDestructive && styles.destructiveIconContainer]}>
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={item.isDestructive ? Colors.error : Colors.textSecondary}
                  />
                </View>
                <Text style={[styles.menuTitle, item.isDestructive && styles.destructiveMenuTitle]}>{item.title}</Text>
              </View>
              {item.hasArrow && <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6B7280",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
    backgroundColor: Colors.surface, // White background
    marginBottom: 0,
    paddingBottom: 60,
  },
  profileImageContainer: {
    marginBottom: Spacing.lg,
    position: "relative",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  profileName: {
    fontSize: 22,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  profileEmail: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  menuContainer: {
    backgroundColor: "#A4D79226", // 15% opacity green background
    marginTop: 0,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: "transparent",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  destructiveIconContainer: {
    backgroundColor: "transparent",
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: Typography.medium,
    color: Colors.textPrimary,
  },
  destructiveMenuTitle: {
    color: Colors.textSecondary,
  },
})
