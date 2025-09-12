"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useWeatherStore } from "../store/weatherStore"
import { useAuthStore } from "../store/authStore"
import LocationService from "../services/locationService"
import { Colors, Typography, Spacing, BorderRadius, Shadows } from "../constants/DesignSystem"

const { width } = Dimensions.get("window")

export default function WeatherScreen() {
  const {
    forecast,
    alerts,
    isLoading,
    currentLocation,
    locationAddress,
    lastUpdated,
    getForecast,
    getForecastByLocation,
    getAlerts,
    generateAlerts,
    refreshWeatherData,
  } = useWeatherStore()
  const { token } = useAuthStore()
  const [refreshing, setRefreshing] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)

  useEffect(() => {
    initializeWeatherData()
  }, [token])

  const initializeWeatherData = async () => {
    if (!token) return

    try {
      setLocationLoading(true)
      await getForecastByLocation(token)
      await generateAlerts(token)
    } catch (error) {
      console.error("Error initializing weather data:", error)
      Alert.alert("Error", "Failed to get weather data. Please check your location settings.")
    } finally {
      setLocationLoading(false)
    }
  }

  const onRefresh = async () => {
    if (!token) return

    setRefreshing(true)
    try {
      await refreshWeatherData(token)
    } catch (error) {
      console.error("Error refreshing weather data:", error)
      Alert.alert("Error", "Failed to refresh weather data. Please try again.")
    } finally {
      setRefreshing(false)
    }
  }

  const requestNewLocation = async () => {
    try {
      setLocationLoading(true)
      const hasPermission = await LocationService.requestPermissions()
      if (!hasPermission) {
        Alert.alert(
          "Permission Required",
          "Location permission is needed to get accurate weather forecasts for your area.",
          [{ text: "OK" }],
        )
        return
      }

      await getForecastByLocation(token!)
      await generateAlerts(token!)
    } catch (error) {
      console.error("Error getting new location:", error)
      Alert.alert("Error", "Failed to get your location. Please try again.")
    } finally {
      setLocationLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getAlertStyle = (priority: string) => {
    switch (priority) {
      case "critical":
        return { backgroundColor: "#fef2f2", borderColor: "#dc2626", borderWidth: 2 }
      case "high":
        return { backgroundColor: "#fef2f2", borderColor: "#fca5a5" }
      case "medium":
        return { backgroundColor: "#fefce8", borderColor: "#fde047" }
      case "low":
        return { backgroundColor: "#eff6ff", borderColor: "#93c5fd" }
      default:
        return { backgroundColor: "#f9fafb", borderColor: "#d1d5db" }
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "weather":
        return "🌦️"
      case "rain":
        return "🌧️"
      case "temperature":
        return "🌡️"
      case "wind":
        return "💨"
      case "humidity":
        return "💧"
      case "irrigation":
        return "💧"
      case "pest":
        return "🐛"
      case "harvest":
        return "🌾"
      default:
        return "📢"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "#dc2626"
      case "high":
        return "#ea580c"
      case "medium":
        return "#ca8a04"
      case "low":
        return "#2563eb"
      default:
        return "#6b7280"
    }
  }

  const getWindDirection = (degrees?: number) => {
    if (!degrees) return "N/A"
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    const index = Math.round(degrees / 45) % 8
    return directions[index]
  }

  if ((isLoading || locationLoading) && !forecast) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>
              {locationLoading ? "Getting your location..." : "Loading weather data..."}
            </Text>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Weather</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color={Colors.textSecondary} />
                <Text style={styles.locationText}>
                  {locationAddress || forecast?.location.address || "Current Location"}
                </Text>
              </View>
              {lastUpdated && (
                <Text style={styles.lastUpdated}>Last updated: {formatTime(lastUpdated.toISOString())}</Text>
              )}
            </View>
            <TouchableOpacity onPress={requestNewLocation} style={styles.locationButton} disabled={locationLoading}>
              <Ionicons name={locationLoading ? "sync" : "refresh"} size={20} color={Colors.textInverse} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.content}>
            {/* Current Weather Card */}
            {forecast?.current && (
              <View style={styles.currentWeatherCard}>
                <Text style={styles.cardTitle}>Current Weather</Text>
                <View style={styles.currentWeatherRow}>
                  <View style={styles.currentWeatherLeft}>
                    <Text style={styles.temperature}>{forecast.current.temperature}°C</Text>
                    {forecast.current.feelsLike && (
                      <Text style={styles.feelsLike}>Feels like {forecast.current.feelsLike}°C</Text>
                    )}
                    <Text style={styles.description}>{forecast.current.description}</Text>
                  </View>
                  <View style={styles.currentWeatherRight}>
                    <Text style={styles.weatherIcon}>{forecast.current.icon}</Text>
                  </View>
                </View>

                {/* Weather Details Grid */}
                <View style={styles.weatherDetailsGrid}>
                  <View style={styles.weatherDetailItem}>
                    <Text style={styles.detailLabel}>Humidity</Text>
                    <Text style={styles.detailValue}>{forecast.current.humidity}%</Text>
                  </View>
                  <View style={styles.weatherDetailItem}>
                    <Text style={styles.detailLabel}>Wind</Text>
                    <Text style={styles.detailValue}>
                      {forecast.current.windSpeed} km/h {getWindDirection(forecast.current.windDirection)}
                    </Text>
                  </View>
                  {forecast.current.pressure && (
                    <View style={styles.weatherDetailItem}>
                      <Text style={styles.detailLabel}>Pressure</Text>
                      <Text style={styles.detailValue}>{forecast.current.pressure} hPa</Text>
                    </View>
                  )}
                  {forecast.current.visibility && (
                    <View style={styles.weatherDetailItem}>
                      <Text style={styles.detailLabel}>Visibility</Text>
                      <Text style={styles.detailValue}>{forecast.current.visibility} km</Text>
                    </View>
                  )}
                  {forecast.current.uvIndex && (
                    <View style={styles.weatherDetailItem}>
                      <Text style={styles.detailLabel}>UV Index</Text>
                      <Text
                        style={[
                          styles.detailValue,
                          { color: forecast.current.uvIndex > 6 ? Colors.warning : Colors.success },
                        ]}
                      >
                        {forecast.current.uvIndex}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* 3-Day Forecast */}
            {forecast?.forecast && (
              <View style={styles.forecastCard}>
                <Text style={styles.cardTitle}>3-Day Forecast</Text>
                {forecast.forecast.map((day, index) => (
                  <View
                    key={index}
                    style={[styles.forecastItem, index < forecast.forecast.length - 1 && styles.forecastItemBorder]}
                  >
                    <View style={styles.forecastLeft}>
                      <Text style={styles.forecastDate}>{formatDate(day.date)}</Text>
                      <Text style={styles.forecastDescription}>{day.weather.description}</Text>
                      <View style={styles.forecastDetails}>
                        <Text style={styles.forecastDetailText}>
                          💧 {day.precipitation.probability}% • {day.precipitation.amount}mm
                        </Text>
                        <Text style={styles.forecastDetailText}>💨 {day.weather.windSpeed} km/h</Text>
                      </View>
                    </View>
                    <View style={styles.forecastRight}>
                      <Text style={styles.forecastIcon}>{day.weather.icon}</Text>
                      <View style={styles.forecastTemps}>
                        <Text style={styles.forecastTempHigh}>{day.maxTemp}°</Text>
                        <Text style={styles.forecastTempLow}>{day.minTemp}°</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Agricultural Advisory */}
            {forecast?.agriculturalAdvisory && (
              <View style={styles.advisoryCard}>
                <Text style={styles.advisoryTitle}>🌾 Agricultural Advisory</Text>

                <View style={styles.advisorySection}>
                  <Text style={styles.advisoryLabel}>💧 Irrigation</Text>
                  <Text style={styles.advisoryText}>{forecast.agriculturalAdvisory.irrigation}</Text>
                </View>

                <View style={styles.advisorySection}>
                  <Text style={styles.advisoryLabel}>🌾 Harvesting</Text>
                  <Text style={styles.advisoryText}>{forecast.agriculturalAdvisory.harvesting}</Text>
                </View>

                <View style={styles.advisorySection}>
                  <Text style={styles.advisoryLabel}>🌱 Planting</Text>
                  <Text style={styles.advisoryText}>{forecast.agriculturalAdvisory.planting}</Text>
                </View>

                <View style={styles.advisorySection}>
                  <Text style={styles.advisoryLabel}>🐛 Pest Control</Text>
                  <Text style={styles.advisoryText}>{forecast.agriculturalAdvisory.pestControl}</Text>
                </View>

                <View style={styles.advisorySection}>
                  <Text style={styles.advisoryLabel}>🛡️ Crop Protection</Text>
                  <Text style={styles.advisoryText}>{forecast.agriculturalAdvisory.cropProtection}</Text>
                </View>

                <View style={styles.advisorySection}>
                  <Text style={styles.advisoryLabel}>📋 General Advice</Text>
                  <Text style={styles.advisoryText}>{forecast.agriculturalAdvisory.generalAdvice}</Text>
                </View>
              </View>
            )}

            {/* Crop Planning Advice */}
            {forecast?.cropPlanningAdvice && forecast.cropPlanningAdvice.length > 0 && (
              <View style={styles.cropPlanningCard}>
                <Text style={styles.cropPlanningTitle}>📅 Crop Planning Advice</Text>
                {forecast.cropPlanningAdvice.map((advice, index) => (
                  <View
                    key={index}
                    style={[
                      styles.cropPlanningItem,
                      index < forecast.cropPlanningAdvice.length - 1 && styles.cropPlanningItemBorder,
                    ]}
                  >
                    <View style={styles.cropPlanningHeader}>
                      <Text style={styles.cropType}>{advice.cropType}</Text>
                      <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(advice.priority) }]}>
                        <Text style={styles.priorityText}>{advice.priority.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={styles.cropRecommendation}>{advice.recommendation}</Text>
                    <View style={styles.cropPlanningDetails}>
                      <Text style={styles.cropTiming}>⏰ {advice.timing}</Text>
                      <Text style={styles.cropWeatherFactor}>🌤️ {advice.weatherFactor}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Farming Recommendations */}
            {forecast?.farmingRecommendations && forecast.farmingRecommendations.length > 0 && (
              <View style={styles.recommendationsCard}>
                <Text style={styles.recommendationsTitle}>💡 Quick Tips</Text>
                {forecast.farmingRecommendations.map((recommendation, index) => (
                  <View
                    key={index}
                    style={[
                      styles.recommendationItem,
                      index < forecast.farmingRecommendations.length - 1 && styles.recommendationItemMargin,
                    ]}
                  >
                    <Text style={styles.recommendationBullet}>•</Text>
                    <Text style={styles.recommendationText}>{recommendation}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Weather Alerts */}
            {alerts.length > 0 && (
              <View style={styles.alertsContainer}>
                <Text style={styles.alertsTitle}>⚠️ Weather Alerts</Text>
                {alerts.map((alert) => (
                  <View key={alert.id} style={[styles.alertCard, getAlertStyle(alert.priority)]}>
                    <View style={styles.alertHeader}>
                      <View style={styles.alertHeaderLeft}>
                        <Text style={styles.alertIcon}>{getAlertIcon(alert.type)}</Text>
                        <View style={styles.alertTitleContainer}>
                          <Text style={styles.alertTitle}>{alert.title}</Text>
                          <View style={styles.alertMeta}>
                            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(alert.priority) }]}>
                              <Text style={styles.priorityText}>{alert.priority.toUpperCase()}</Text>
                            </View>
                            {alert.actionRequired && (
                              <View style={styles.actionBadge}>
                                <Text style={styles.actionText}>ACTION REQUIRED</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                      <Text style={styles.alertTime}>{formatTime(alert.createdAt)}</Text>
                    </View>

                    <Text style={styles.alertMessage}>{alert.message}</Text>

                    {alert.recommendations && alert.recommendations.length > 0 && (
                      <View style={styles.alertRecommendations}>
                        <Text style={styles.recommendationsLabel}>Recommendations:</Text>
                        {alert.recommendations.map((rec, index) => (
                          <View key={index} style={styles.alertRecommendationItem}>
                            <Text style={styles.alertRecommendationBullet}>•</Text>
                            <Text style={styles.alertRecommendationText}>{rec}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {alert.expiresAt && <Text style={styles.alertExpiry}>Expires: {formatTime(alert.expiresAt)}</Text>}
                  </View>
                ))}
              </View>
            )}

            {/* Refresh Button */}
            <TouchableOpacity
              onPress={onRefresh}
              style={[styles.refreshButton, refreshing && styles.refreshButtonDisabled]}
              disabled={refreshing}
            >
              <Text style={styles.refreshButtonText}>{refreshing ? "Refreshing..." : "Refresh Weather Data"}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.lg,
    color: Colors.textSecondary,
    fontSize: Typography.bodyLarge,
  },

  // Header
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "#21825C",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.headingLarge,
    fontWeight: Typography.bold,
    color: "#21825C",
    marginBottom: Spacing.xs,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  locationText: {
    fontSize: Typography.bodyMedium,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  lastUpdated: {
    fontSize: Typography.bodySmall,
    color: Colors.textTertiary,
  },
  locationButton: {
    backgroundColor: "#21825C",
    borderRadius: BorderRadius.full,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },

  // Cards
  currentWeatherCard: {
    backgroundColor: "#EBFCE7",
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: "#21825C20",
  },
  forecastCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  cardTitle: {
    fontSize: Typography.headingSmall,
    fontWeight: Typography.semibold,
    color: "#21825C",
    marginBottom: Spacing.lg,
  },

  // Current Weather
  currentWeatherRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  currentWeatherLeft: {
    flex: 1,
  },
  currentWeatherRight: {
    alignItems: "center",
  },
  temperature: {
    fontSize: 48,
    fontWeight: Typography.bold,
    color: "#21825C",
  },
  feelsLike: {
    fontSize: Typography.bodyMedium,
    color: "#21825C",
    marginTop: Spacing.xs,
    opacity: 0.8,
  },
  description: {
    fontSize: Typography.bodyLarge,
    color: "#21825C",
    marginTop: Spacing.sm,
    textTransform: "capitalize",
    opacity: 0.9,
  },
  weatherIcon: {
    fontSize: 80,
  },

  // Weather Details Grid
  weatherDetailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  weatherDetailItem: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: "#21825C30",
  },
  detailLabel: {
    fontSize: Typography.bodySmall,
    color: "#21825C",
    marginBottom: Spacing.xs,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: Typography.bodyMedium,
    fontWeight: Typography.semibold,
    color: "#21825C",
  },

  // Forecast
  forecastItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.lg,
  },
  forecastItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  forecastLeft: {
    flex: 1,
  },
  forecastRight: {
    alignItems: "center",
  },
  forecastDate: {
    fontSize: Typography.bodyLarge,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  forecastDescription: {
    fontSize: Typography.bodyMedium,
    color: Colors.textSecondary,
    textTransform: "capitalize",
    marginBottom: Spacing.sm,
  },
  forecastDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  forecastDetailText: {
    fontSize: Typography.bodySmall,
    color: Colors.textTertiary,
  },
  forecastIcon: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  forecastTemps: {
    alignItems: "center",
  },
  forecastTempHigh: {
    fontSize: Typography.headingSmall,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  forecastTempLow: {
    fontSize: Typography.bodyMedium,
    color: Colors.textSecondary,
  },

  // Agricultural Advisory
  advisoryCard: {
    backgroundColor: "#EBFCE7",
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: "#21825C",
  },
  advisoryTitle: {
    fontSize: Typography.headingSmall,
    fontWeight: Typography.semibold,
    color: "#21825C",
    marginBottom: Spacing.lg,
  },
  advisorySection: {
    marginBottom: Spacing.lg,
  },
  advisoryLabel: {
    fontSize: Typography.bodyMedium,
    fontWeight: Typography.semibold,
    color: "#21825C",
    marginBottom: Spacing.xs,
  },
  advisoryText: {
    fontSize: Typography.bodyMedium,
    color: "#21825C",
    lineHeight: 20,
    opacity: 0.9,
  },

  // Crop Planning
  cropPlanningCard: {
    backgroundColor: "#EBFCE7",
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: "#21825C",
  },
  cropPlanningTitle: {
    fontSize: Typography.headingSmall,
    fontWeight: Typography.semibold,
    color: "#21825C",
    marginBottom: Spacing.lg,
  },
  cropPlanningItem: {
    paddingVertical: Spacing.lg,
  },
  cropPlanningItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#21825C30",
  },
  cropPlanningHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  cropType: {
    fontSize: Typography.bodyLarge,
    fontWeight: Typography.semibold,
    color: "#21825C",
  },
  cropRecommendation: {
    fontSize: Typography.bodyMedium,
    color: "#21825C",
    marginBottom: Spacing.md,
    lineHeight: 20,
    opacity: 0.9,
  },
  cropPlanningDetails: {
    flexDirection: "column",
    gap: Spacing.xs,
  },
  cropTiming: {
    fontSize: Typography.bodySmall,
    color: "#21825C",
    marginBottom: 2,
    opacity: 0.8,
  },
  cropWeatherFactor: {
    fontSize: Typography.bodySmall,
    color: "#21825C",
    opacity: 0.8,
  },

  // Recommendations
  recommendationsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: "#21825C30",
  },
  recommendationsTitle: {
    fontSize: Typography.headingSmall,
    fontWeight: Typography.semibold,
    color: "#21825C",
    marginBottom: Spacing.lg,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  recommendationItemMargin: {
    marginBottom: Spacing.sm,
  },
  recommendationBullet: {
    color: "#21825C",
    marginRight: Spacing.sm,
    fontWeight: Typography.bold,
  },
  recommendationText: {
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },

  // Priority Badge
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.md,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: Typography.semibold,
    color: Colors.textInverse,
  },

  // Alerts
  alertsContainer: {
    marginBottom: Spacing.lg,
  },
  alertsTitle: {
    fontSize: Typography.headingSmall,
    fontWeight: Typography.semibold,
    color: "#21825C",
    marginBottom: Spacing.lg,
  },
  alertCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    backgroundColor: Colors.surface,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  alertHeaderLeft: {
    flexDirection: "row",
    flex: 1,
  },
  alertIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  alertTitleContainer: {
    flex: 1,
  },
  alertTitle: {
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    fontSize: Typography.bodyLarge,
    marginBottom: Spacing.sm,
  },
  alertMeta: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionBadge: {
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.md,
  },
  actionText: {
    fontSize: 10,
    fontWeight: Typography.semibold,
    color: Colors.textInverse,
  },
  alertMessage: {
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 20,
    fontSize: Typography.bodyMedium,
  },
  alertRecommendations: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  recommendationsLabel: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  alertRecommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.xs,
  },
  alertRecommendationBullet: {
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
    fontSize: Typography.bodySmall,
  },
  alertRecommendationText: {
    color: Colors.textSecondary,
    flex: 1,
    fontSize: Typography.bodySmall,
    lineHeight: 16,
  },
  alertTime: {
    fontSize: Typography.bodySmall,
    color: Colors.textTertiary,
  },
  alertExpiry: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontStyle: "italic",
  },

  // Refresh Button
  refreshButton: {
    backgroundColor: "#21825C",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  refreshButtonDisabled: {
    backgroundColor: Colors.textTertiary,
  },
  refreshButtonText: {
    color: Colors.textInverse,
    fontWeight: Typography.semibold,
    fontSize: Typography.bodyLarge,
  },
})
