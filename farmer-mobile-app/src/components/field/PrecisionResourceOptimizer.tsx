"use client"

import { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal, StyleSheet, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaContainer } from "../ui/SafeAreaContainer"
import { Header } from "../ui/Header"
import { useAuthStore } from "../../store/authStore"
import { useRouter } from "expo-router"
import { Colors, Typography, Spacing, BorderRadius } from "../../constants/DesignSystem"

interface PrecisionResourceOptimizerProps {
  visible: boolean
  onClose: () => void
}

interface OptimizationFormData {
  cropType: string
  fieldSize: string
  soilType: string
  currentGrowthStage: string
  weatherCondition: string
  lastFertilizerDate: string
  lastIrrigationDate: string
}

interface ResourceRecommendation {
  resource: string
  currentUsage: number
  optimizedUsage: number
  savings: number
  savingsPercent: number
  applicationMethod: string
  timing: string
  frequency: string
}

export default function PrecisionResourceOptimizer({ visible, onClose }: PrecisionResourceOptimizerProps) {
  const router = useRouter()
  const { token } = useAuthStore()

  const [formData, setFormData] = useState<OptimizationFormData>({
    cropType: "",
    fieldSize: "",
    soilType: "",
    currentGrowthStage: "",
    weatherCondition: "",
    lastFertilizerDate: "",
    lastIrrigationDate: "",
  })

  const [isLoading, setIsLoading] = useState(false)

  const cropTypes = [
    "Tomato", "Potato", "Onion", "Wheat", "Rice", "Corn", "Soybean", 
    "Cotton", "Sugarcane", "Banana", "Apple", "Grapes", "Citrus"
  ]

  const soilTypes = [
    "Clay", "Sandy", "Loamy", "Silty", "Sandy Loam", "Clay Loam"
  ]

  const growthStages = [
    "Seedling", "Vegetative", "Flowering", "Fruiting", "Maturity"
  ]

  const weatherConditions = [
    "Sunny", "Cloudy", "Rainy", "Drought", "Humid", "Windy"
  ]

  // Mock optimization algorithm
  const generateOptimizations = (): ResourceRecommendation[] => {
    const baseWater = parseFloat(formData.fieldSize) * 50 // Base: 50L per sq meter
    const baseFertilizer = parseFloat(formData.fieldSize) * 0.2 // Base: 200g per sq meter
    const basePesticide = parseFloat(formData.fieldSize) * 0.05 // Base: 50ml per sq meter

    // Optimization factors based on conditions
    let waterOptimization = 0.8 // 20% savings
    let fertilizerOptimization = 0.75 // 25% savings
    let pesticideOptimization = 0.7 // 30% savings

    // Adjust based on crop type
    if (formData.cropType === "Rice") {
      waterOptimization = 0.9 // Rice needs more water
    } else if (["Cactus", "Drought-resistant"].includes(formData.cropType)) {
      waterOptimization = 0.6 // Drought-resistant crops
    }

    // Adjust based on growth stage
    if (formData.currentGrowthStage === "Flowering") {
      waterOptimization += 0.1 // More water during flowering
      fertilizerOptimization += 0.1 // More nutrients during flowering
    }

    // Adjust based on weather
    if (formData.weatherCondition === "Rainy") {
      waterOptimization = 0.5 // Reduce irrigation in rainy weather
    } else if (formData.weatherCondition === "Drought") {
      waterOptimization = 1.2 // Increase irrigation in drought
    }

    return [
      {
        resource: "Water",
        currentUsage: baseWater,
        optimizedUsage: baseWater * waterOptimization,
        savings: baseWater * (1 - waterOptimization),
        savingsPercent: (1 - waterOptimization) * 100,
        applicationMethod: formData.weatherCondition === "Rainy" ? "Reduced drip irrigation" : "Smart drip irrigation",
        timing: "Early morning (6-8 AM) and evening (6-8 PM)",
        frequency: formData.currentGrowthStage === "Flowering" ? "Daily" : "Every 2 days"
      },
      {
        resource: "Fertilizer (NPK)",
        currentUsage: baseFertilizer,
        optimizedUsage: baseFertilizer * fertilizerOptimization,
        savings: baseFertilizer * (1 - fertilizerOptimization),
        savingsPercent: (1 - fertilizerOptimization) * 100,
        applicationMethod: "Variable rate application",
        timing: "Early morning with soil moisture",
        frequency: formData.currentGrowthStage === "Vegetative" ? "Weekly" : "Bi-weekly"
      },
      {
        resource: "Pesticide",
        currentUsage: basePesticide,
        optimizedUsage: basePesticide * pesticideOptimization,
        savings: basePesticide * (1 - pesticideOptimization),
        savingsPercent: (1 - pesticideOptimization) * 100,
        applicationMethod: "Targeted spot application",
        timing: "Late evening when beneficial insects are less active",
        frequency: "As per pest monitoring schedule"
      }
    ]
  }

  const handleOptimize = async () => {
    if (!formData.cropType || !formData.fieldSize || !formData.soilType || !formData.currentGrowthStage) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const optimizations = generateOptimizations()
      
      // Navigate to results screen with optimization data
      router.push({
        pathname: "/resource-optimization-results",
        params: {
          cropType: formData.cropType,
          fieldSize: formData.fieldSize,
          soilType: formData.soilType,
          currentGrowthStage: formData.currentGrowthStage,
          recommendations: JSON.stringify(optimizations),
        },
      })

      onClose()
    } catch (error: any) {
      console.error("Optimization failed:", error)
      Alert.alert("Error", "Failed to generate optimizations. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: keyof OptimizationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaContainer backgroundColor={Colors.background}>
        <Header title="Precision Resource Optimizer" showBackButton={true} onBackPress={onClose} />

        <ScrollView style={styles.container}>
          {/* Header Card */}
          <View style={styles.headerCard}>
            <View style={styles.optimizerContainer}>
              <View style={styles.optimizerBackground}>
                <Image
                  source={require("../../../assets/images/mrl-icon.png")}
                  style={styles.optimizerIcon}
                  resizeMode="contain"
                />
              </View>
            </View>
            <Text style={styles.title}>AI Resource Optimizer</Text>
            <Text style={styles.subtitle}>
              Optimize water, fertilizer & pesticide usage with precision agriculture
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formCard}>
            {/* Crop Type */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="leaf" size={20} color={Colors.success} />
                <Text style={styles.sectionTitle}>Crop Information</Text>
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
                <View style={styles.optionsContainer}>
                  {cropTypes.map((crop) => (
                    <TouchableOpacity
                      key={crop}
                      onPress={() => updateFormData("cropType", crop)}
                      style={[styles.optionButton, formData.cropType === crop && styles.selectedOption]}
                    >
                      <Text style={[styles.optionText, formData.cropType === crop && styles.selectedOptionText]}>
                        {crop}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Field Size */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="resize" size={20} color={Colors.info} />
                <Text style={styles.sectionTitle}>Field Size (sq meters)</Text>
              </View>
              <TextInput
                value={formData.fieldSize}
                onChangeText={(text) => updateFormData("fieldSize", text)}
                placeholder="Enter field size in square meters"
                keyboardType="numeric"
                style={styles.textInput}
                placeholderTextColor={Colors.textTertiary}
              />
            </View>

            {/* Soil Type */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="earth" size={20} color="#8B4513" />
                <Text style={styles.sectionTitle}>Soil Type</Text>
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
                <View style={styles.optionsContainer}>
                  {soilTypes.map((soil) => (
                    <TouchableOpacity
                      key={soil}
                      onPress={() => updateFormData("soilType", soil)}
                      style={[styles.optionButton, formData.soilType === soil && styles.selectedOption]}
                    >
                      <Text style={[styles.optionText, formData.soilType === soil && styles.selectedOptionText]}>
                        {soil}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Growth Stage */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="trending-up" size={20} color="#FF6B6B" />
                <Text style={styles.sectionTitle}>Current Growth Stage</Text>
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
                <View style={styles.optionsContainer}>
                  {growthStages.map((stage) => (
                    <TouchableOpacity
                      key={stage}
                      onPress={() => updateFormData("currentGrowthStage", stage)}
                      style={[styles.optionButton, formData.currentGrowthStage === stage && styles.selectedOption]}
                    >
                      <Text style={[styles.optionText, formData.currentGrowthStage === stage && styles.selectedOptionText]}>
                        {stage}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Weather Condition */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="partly-sunny" size={20} color="#FFD700" />
                <Text style={styles.sectionTitle}>Current Weather</Text>
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
                <View style={styles.optionsContainer}>
                  {weatherConditions.map((weather) => (
                    <TouchableOpacity
                      key={weather}
                      onPress={() => updateFormData("weatherCondition", weather)}
                      style={[styles.optionButton, formData.weatherCondition === weather && styles.selectedOption]}
                    >
                      <Text style={[styles.optionText, formData.weatherCondition === weather && styles.selectedOptionText]}>
                        {weather}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Last Application Dates */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Last Fertilizer Application</Text>
              <TextInput
                value={formData.lastFertilizerDate}
                onChangeText={(text) => updateFormData("lastFertilizerDate", text)}
                placeholder="DD/MM/YYYY (Optional)"
                style={styles.textInput}
                placeholderTextColor={Colors.textTertiary}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Last Irrigation Date</Text>
              <TextInput
                value={formData.lastIrrigationDate}
                onChangeText={(text) => updateFormData("lastIrrigationDate", text)}
                placeholder="DD/MM/YYYY (Optional)"
                style={styles.textInput}
                placeholderTextColor={Colors.textTertiary}
              />
            </View>
          </View>

          {/* Optimize Button */}
          <TouchableOpacity
            style={[
              styles.optimizeButton,
              (!formData.cropType || !formData.fieldSize || !formData.soilType || !formData.currentGrowthStage) &&
                styles.disabledButton,
            ]}
            onPress={handleOptimize}
            disabled={
              isLoading ||
              !formData.cropType ||
              !formData.fieldSize ||
              !formData.soilType ||
              !formData.currentGrowthStage
            }
          >
            <Text style={styles.optimizeButtonText}>
              {isLoading ? "Optimizing..." : "🚀 Optimize Resources"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaContainer>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  headerCard: {
    backgroundColor: "#E3F2FD", // Light blue background
    borderRadius: BorderRadius.lg,
    padding: Spacing["2xl"],
    marginBottom: Spacing.lg,
    alignItems: "center",
  },
  optimizerContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  optimizerBackground: {
    backgroundColor: "#1976D2", // Blue background for icon
    padding: Spacing.lg,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: "#1976D2",
  },
  optimizerIcon: {
    width: 40,
    height: 40,
    tintColor: "#FFFFFF",
  },
  title: {
    fontSize: Typography.headingMedium,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  formSection: {
    marginBottom: Spacing["2xl"],
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.bodyLarge,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  optionsScroll: {
    marginTop: Spacing.sm,
  },
  optionsContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.xs,
  },
  optionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginRight: Spacing.sm,
  },
  selectedOption: {
    borderColor: "#1976D2",
    backgroundColor: "#E3F2FD",
  },
  optionText: {
    fontSize: Typography.bodySmall,
    color: Colors.textPrimary,
  },
  selectedOptionText: {
    color: "#1976D2",
    fontWeight: "600",
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  optimizeButton: {
    backgroundColor: "#1976D2",
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  disabledButton: {
    backgroundColor: Colors.textTertiary,
    opacity: 0.6,
  },
  optimizeButtonText: {
    fontSize: Typography.bodyLarge,
    fontWeight: "600",
    color: Colors.textInverse,
  },
})
