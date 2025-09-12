"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Dimensions, Image } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { LoadingSpinner } from "../src/components/LoadingSpinner"
import { ErrorMessage } from "../src/components/ErrorMessage"
import { useGovernmentStore } from "../src/store/governmentStore"
import { useAuthStore } from "../src/store/authStore"
import { Colors, Typography, Spacing, BorderRadius } from "../src/constants/DesignSystem"

const { width } = Dimensions.get("window")

export default function GovernmentSchemesScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const { token } = useAuthStore()
  const { schemes, isLoading: loading, error, getSchemes, clearError } = useGovernmentStore()

  useEffect(() => {
    // Load schemes with token if available
    getSchemes(token || "")
  }, [getSchemes, token])

  const filteredSchemes = (schemes || []).filter((scheme) => {
    if (!scheme) return false
    const name = scheme.name || ""
    const description = scheme.description || ""
    const category = scheme.category || ""
    const searchLower = searchQuery.toLowerCase()

    return (
      name.toLowerCase().includes(searchLower) ||
      description.toLowerCase().includes(searchLower) ||
      category.toLowerCase().includes(searchLower)
    )
  })

  const handleSchemePress = (schemeId: string) => {
    router.push(`/scheme-eligibility?schemeId=${schemeId}`)
  }

  const handleSearch = () => {
    // Search functionality is handled by the filter above
    console.log("Searching for:", searchQuery)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "#22c55e"
      case "pending":
        return "#f59e0b"
      case "expired":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "#22c55e"
    if (progress >= 50) return "#f59e0b"
    return "#ef4444"
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {error && <ErrorMessage message={error} />}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading || false} onRefresh={() => getSchemes(token || "")} />}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.illustrationContainer}>
            <Image 
              source={require('../assets/images/government-schemes-placeholder.png')}
              style={styles.heroIllustration}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.heroTitle}>Government Schemes</Text>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <Text style={styles.searchPlaceholder}>Search Schemes</Text>
          </View>
        </View>

        {loading && (!schemes || schemes.length === 0) ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Available Schemes Section */}
            <View style={styles.schemesSection}>
              <Text style={styles.sectionTitle}>Available Schemes</Text>

              <View style={styles.schemeCard}>
                <View style={styles.schemeHeader}>
                  <View style={styles.schemeIconContainer}>
                    <Ionicons name="umbrella" size={24} color="white" />
                  </View>
                  <View style={styles.schemeDetails}>
                    <Text style={styles.schemeTitle}>Crop Insurance</Text>
                    <Text style={styles.schemeDescription}>Protect against crop loss</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.checkEligibilityButton}
                  onPress={() => router.push("/scheme-eligibility?schemeId=crop-insurance")}
                >
                  <Text style={styles.checkButtonText}>Check Eligibility</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.schemeCard}>
                <View style={styles.schemeHeader}>
                  <View style={styles.schemeIconContainer}>
                    <Ionicons name="leaf" size={24} color="white" />
                  </View>
                  <View style={styles.schemeDetails}>
                    <Text style={styles.schemeTitle}>Subsidiarity for seeds</Text>
                    <Text style={styles.schemeDescription}>Get financial assistance for seeds</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.checkEligibilityButton}
                  onPress={() => router.push("/scheme-eligibility?schemeId=seed-subsidy")}
                >
                  <Text style={styles.checkButtonText}>Check Eligibility</Text>
                </TouchableOpacity>
              </View>

              {/* Add existing schemes if available */}
              {filteredSchemes.map((scheme) => (
                <TouchableOpacity
                  key={scheme.id}
                  style={styles.schemeCard}
                  onPress={() => handleSchemePress(scheme.id)}
                >
                  <View style={styles.schemeHeader}>
                    <View style={styles.schemeIconContainer}>
                      <Ionicons name="document-text" size={24} color="white" />
                    </View>
                    <View style={styles.schemeDetails}>
                      <Text style={styles.schemeTitle}>{scheme.name || "Scheme"}</Text>
                      <Text style={styles.schemeDescription}>
                        {scheme.description || "Government scheme for farmers"}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.checkEligibilityButton}>
                    <Text style={styles.checkButtonText}>Check Eligibility</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}

              {filteredSchemes.length === 0 && !loading && searchQuery && (
                <View style={styles.emptyState}>
                  <Ionicons name="document-outline" size={64} color="#d1d5db" />
                  <Text style={styles.emptyStateText}>No schemes found matching your search</Text>
                  <TouchableOpacity style={styles.clearSearchButton} onPress={() => setSearchQuery("")}>
                    <Text style={styles.clearSearchText}>Clear Search</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
  },
  backButton: {
    padding: Spacing.sm,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
    backgroundColor: Colors.surface,
  },
  illustrationContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  heroIllustration: {
    width: 200,
    height: 150,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: Typography.bold,
    color: "#21825C",
    textAlign: "center",
  },
  searchSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 25,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: "#9CA3AF",
    marginLeft: Spacing.sm,
  },
  schemesSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing["4xl"],
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: Typography.bold,
    color: "#21825C",
    marginBottom: Spacing.xl,
  },
  schemeCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  schemeHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  schemeIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#21825C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.lg,
  },
  schemeDetails: {
    flex: 1,
  },
  schemeTitle: {
    fontSize: 18,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  schemeDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  checkEligibilityButton: {
    backgroundColor: "#E5E7EB",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  checkButtonText: {
    fontSize: 16,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["4xl"],
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  clearSearchButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  clearSearchText: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: Typography.medium,
  },
})
