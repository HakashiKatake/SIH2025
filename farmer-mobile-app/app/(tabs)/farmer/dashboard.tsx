"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Image,
} from "react-native";
import { useAuthStore } from "../../../src/store/authStore";
import { useWeatherStore } from "../../../src/store/weatherStore";
import { router } from "expo-router";
import type { FarmerProfile } from "../../../src/types";
import * as Location from "expo-location";
import { SafeAreaContainer } from "../../../src/components/ui/SafeAreaContainer";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "../../../src/hooks/useTranslation";

const { width } = Dimensions.get("window");

export default function FarmerDashboard() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const {
    forecast,
    alerts,
    isLoading: weatherLoading,
    getForecast,
    getAlerts,
  } = useWeatherStore();
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Type guard to check if profile is FarmerProfile
  const isFarmerProfile = (profile: any): profile is FarmerProfile => {
    return profile && "farmSize" in profile;
  };

  const farmerProfile = isFarmerProfile(user?.profile) ? user.profile : null;

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Load initial data
    loadDashboardData();

    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get location and fetch weather
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        await getForecast(
          location.coords.latitude,
          location.coords.longitude,
          ""
        );
      }

      // Get alerts
      await getAlerts("");
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return t("dashboard.goodMorning");
    if (hour < 17) return t("dashboard.goodAfternoon");
    return t("dashboard.goodEvening");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <SafeAreaContainer backgroundColor="#f8fafc">
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={() => router.push("/profile")}
              activeOpacity={0.7}
            >
              <Image
                source={require("../../../assets/images/profile.png")}
                style={styles.profileImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>
                {getGreeting()}, {user?.name || "Farmer"} 👋
              </Text>
              <Text style={styles.date}>Today, {formatDate(currentTime)}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push("/(tabs)/farmer/notifications")}
          >
            <Ionicons name="notifications" size={24} color="#21825C" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        <View style={styles.weatherCard}>
          <View style={styles.weatherContent}>
            <View style={styles.weatherInfo}>
              <Text style={styles.temperature}>23°C</Text>
              <Text style={styles.weatherCondition}>Light Rain ⛅</Text>
              <Text style={styles.location}>Gurugram</Text>
              <View style={styles.weatherDetails}>
                <Text style={styles.weatherDetail}>
                  🌊 Humidity: 76%% 💨 12km/h
                </Text>
              </View>
            </View>
            <View style={styles.weatherIcon}>
              <Text style={styles.weatherEmoji}>🌧️</Text>
            </View>
          </View>
        </View>

        {/* Government Schemes Card */}
        <View style={styles.schemeCard}>
          <ImageBackground
            source={require("../../../assets/images/banner.png")}
            style={styles.schemeBackground}
            imageStyle={styles.schemeBackgroundImage}
          >
            <View style={styles.schemeOverlay}>
              <Text style={styles.schemeTitle}>From Policy to Progress</Text>
              <Text style={styles.schemeSubtitle}>
                Government Schemes Made Simple for Farmers
              </Text>
              <Text style={styles.schemeDescription}>
                Explore support programs that help you grow, earn, and succeed.
              </Text>
              <TouchableOpacity
                style={styles.schemeButton}
                onPress={() => router.push("/government-schemes")}
              >
                <Text style={styles.schemeButtonText}>Check now →</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

        {/* Categories Section */}
        <View style={styles.categoriesSection}>
          <Text style={styles.categoriesTitle}>
            {t("dashboard.categories")}
          </Text>
          <View style={styles.categoriesGrid}>
            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => router.push("/farmers-roadmap")}
            >
              <View
                style={[styles.categoryIcon, { backgroundColor: "#FFE5F1" }]}
              >
                <Ionicons name="location" size={24} color="#E91E63" />
              </View>
              <Text style={styles.categoryText}>{t("dashboard.roadMap")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => router.push("/(tabs)/farmer/weather")}
            >
              <View
                style={[styles.categoryIcon, { backgroundColor: "#E3F2FD" }]}
              >
                <Ionicons name="cloud" size={24} color="#2196F3" />
              </View>
              <Text style={styles.categoryText}>{t("dashboard.weather")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => router.push("/field-management")}
            >
              <View
                style={[styles.categoryIcon, { backgroundColor: "#FFF3E0" }]}
              >
                <Ionicons name="calendar" size={24} color="#FF9800" />
              </View>
              <Text style={styles.categoryText}>{t("dashboard.calendar")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => router.push("/(tabs)/farmer/scan")}
            >
              <View
                style={[styles.categoryIcon, { backgroundColor: "#E8F5E8" }]}
              >
                <Ionicons name="hand-left" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.categoryText}>
                {t("dashboard.cropSafetyTest")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => router.push("/farmer/add-product")}
            >
              <View
                style={[styles.categoryIcon, { backgroundColor: "#FFEBEE" }]}
              >
                <Ionicons name="add-circle" size={24} color="#F44336" />
              </View>
              <Text style={styles.categoryText}>
                {t("dashboard.addYourCrop")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => router.push("/farmer/marketplace")}
            >
              <View
                style={[styles.categoryIcon, { backgroundColor: "#F3E8FF" }]}
              >
                <Ionicons name="storefront" size={24} color="#6750A4" />
              </View>
              <Text style={styles.categoryText}>
                {t("dashboard.marketplace")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Instructions Card */}
        <View style={styles.instructionsCard}>
          <Image
            source={require("../../../assets/images/intro.png")}
            style={styles.instructionsImage}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.takePictureButton}
            onPress={() => router.push("/(tabs)/farmer/scan")}
          >
            <Text style={styles.takePictureButtonText}>Take a picture</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F5E8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    fontSize: 20,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  date: {
    fontSize: 14,
    color: "#6B7280",
  },
  notificationButton: {
    position: "relative",
    padding: 8,
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  weatherCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#7DD3FC",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  weatherContent: {
    flexDirection: "row",
    padding: 24,
    alignItems: "center",
    backgroundColor: "transparent",
    backgroundImage: "linear-gradient(135deg, #7DD3FC 0%, #1E40AF 100%)",
  },
  weatherInfo: {
    flex: 1,
  },
  temperature: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  weatherCondition: {
    fontSize: 16,
    color: "white",
    marginBottom: 4,
    opacity: 0.95,
  },
  location: {
    fontSize: 14,
    color: "white",
    opacity: 0.9,
    marginBottom: 12,
  },
  weatherDetails: {
    flexDirection: "row",
  },
  weatherDetail: {
    fontSize: 13,
    color: "white",
    opacity: 0.85,
  },
  weatherIcon: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
  },
  weatherEmoji: {
    fontSize: 52,
  },
  schemeCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    height: 180,
  },
  schemeBackground: {
    flex: 1,
    justifyContent: "center",
  },
  schemeBackgroundImage: {
    borderRadius: 20,
  },
  schemeOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    padding: 24,
    justifyContent: "center",
  },
  schemeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 6,
  },
  schemeSubtitle: {
    fontSize: 15,
    color: "white",
    marginBottom: 10,
    opacity: 0.95,
  },
  schemeDescription: {
    fontSize: 13,
    color: "white",
    opacity: 0.9,
    marginBottom: 18,
    lineHeight: 18,
  },
  schemeButton: {
    alignSelf: "flex-start",
  },
  schemeButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
    textDecorationLine: "underline",
  },
  categoriesSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  categoriesTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 20,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: (width - 60) / 2.2,
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 8,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    lineHeight: 16,
  },
  instructionsCard: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 20,
    backgroundColor: "#C8E6C9",
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsImage: {
    width: width - 80,
    height: 120,
    marginBottom: 20,
  },
  takePictureButton: {
    backgroundColor: "#21825C",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 25,
    shadowColor: "#21825C",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  takePictureButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
  },
});
