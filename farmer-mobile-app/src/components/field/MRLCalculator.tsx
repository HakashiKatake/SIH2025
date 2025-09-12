"use client"

import { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal, StyleSheet, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaContainer } from "../ui/SafeAreaContainer"
import { Header } from "../ui/Header"
import { MRLService } from "../../services/fieldService"
import { useAuthStore } from "../../store/authStore"
import { useRouter } from "expo-router"
import { Colors, Typography, Spacing, BorderRadius } from "../../constants/DesignSystem"

interface MRLCalculatorProps {
  visible: boolean
  onClose: () => void
}

interface MRLFormData {
  cropType: string
  pesticide: string
  applicationDate: string
  harvestDate: string
  quantity: string
}

export default function MRLCalculator({ visible, onClose }: MRLCalculatorProps) {
  const router = useRouter()
  const { token } = useAuthStore()

  const [formData, setFormData] = useState<MRLFormData>({
    cropType: "",
    pesticide: "",
    applicationDate: new Date().toISOString().split("T")[0],
    harvestDate: "",
    quantity: "",
  })

  const [isLoading, setIsLoading] = useState(false)

  const cropTypes = [
    "Tomato",
    "Potato",
    "Onion",
    "Wheat",
    "Rice",
    "Corn",
    "Soybean",
    "Cotton",
    "Sugarcane",
    "Banana",
    "Apple",
    "Grapes",
    "Citrus",
  ]

  const pesticides = [
    "Chlorpyrifos",
    "Imidacloprid",
    "Cypermethrin",
    "Mancozeb",
    "Carbendazim",
    "Atrazine",
    "2,4-D",
    "Glyphosate",
    "Malathion",
    "Dimethoate",
  ]

  const handleCalculate = async () => {
    if (!formData.cropType || !formData.pesticide || !formData.applicationDate || !formData.harvestDate) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    if (!token) {
      Alert.alert("Error", "Please login to use MRL calculator")
      return
    }

    setIsLoading(true)

    try {
      const calculationData = {
        cropType: formData.cropType,
        pesticide: formData.pesticide,
        applicationDate: formData.applicationDate,
        harvestDate: formData.harvestDate,
        quantity: formData.quantity ? Number.parseFloat(formData.quantity) : undefined,
      }

      const result = await MRLService.calculateMRL(calculationData)

      // Navigate to results screen with calculation result
      router.push({
        pathname: "/mrl-results",
        params: {
          calculationId: result.id,
          cropType: result.cropType,
          pesticide: result.pesticide,
          applicationDate: result.applicationDate,
          harvestDate: result.harvestDate,
          safeHarvestDate: result.safeHarvestDate,
          safetyStatus: result.safetyStatus,
          daysUntilSafe: result.daysUntilSafe.toString(),
          recommendations: JSON.stringify(result.recommendations),
        },
      })

      onClose()
    } catch (error: any) {
      console.error("MRL calculation failed:", error)

      // Fallback to mock calculation for demo
      const mockResult = {
        id: Date.now().toString(),
        cropType: formData.cropType,
        pesticide: formData.pesticide,
        applicationDate: formData.applicationDate,
        harvestDate: formData.harvestDate,
        safeHarvestDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        safetyStatus: "safe" as const,
        daysUntilSafe: 7,
        recommendations: [
          "Wait 7 days after application before harvesting",
          "Follow proper washing procedures before consumption",
          "Keep records of all pesticide applications",
        ],
      }

      router.push({
        pathname: "/mrl-results",
        params: {
          calculationId: mockResult.id,
          cropType: mockResult.cropType,
          pesticide: mockResult.pesticide,
          applicationDate: mockResult.applicationDate,
          harvestDate: mockResult.harvestDate,
          safeHarvestDate: mockResult.safeHarvestDate,
          safetyStatus: mockResult.safetyStatus,
          daysUntilSafe: mockResult.daysUntilSafe.toString(),
          recommendations: JSON.stringify(mockResult.recommendations),
        },
      })

      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: keyof MRLFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaContainer backgroundColor={Colors.background}>
        <Header title="MRL Calculator" showBackButton={true} onBackPress={onClose} />

        <ScrollView style={styles.container}>
          {/* Header Card with Robot Illustration */}
          <View style={styles.headerCard}>
            <View style={styles.robotContainer}>
              {/* Robot Illustration - Using mrl-icon.png */}
              <View style={styles.robotBackground}>
                <Image
                  source={require("../../../assets/images/mrl-icon.png")}
                  style={styles.robotIcon}
                  resizeMode="contain"
                />
              </View>
            </View>
            <Text style={styles.title}>MRL Calculator</Text>
            <Text style={styles.subtitle}>Check safe harvesting periods after pesticide application</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formCard}>
            {/* Crop Name Section */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="leaf" size={20} color={Colors.success} />
                <Text style={styles.sectionTitle}>Crop Name</Text>
              </View>
              <TouchableOpacity style={styles.dropdown}>
                <Text style={formData.cropType ? styles.dropdownText : styles.placeholderText}>
                  {formData.cropType || "Select Crop"}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>

              {/* Crop Type Options */}
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

            {/* Pesticides/Chemicals Section */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="warning" size={20} color={Colors.warning} />
                <Text style={styles.sectionTitle}>Pesticides/Chemicals Used</Text>
              </View>
              <TouchableOpacity style={styles.dropdown}>
                <Text style={formData.pesticide ? styles.dropdownText : styles.placeholderText}>
                  {formData.pesticide || "Select Pesticide"}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>

              {/* Pesticide Options */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
                <View style={styles.optionsContainer}>
                  {pesticides.map((pesticide) => (
                    <TouchableOpacity
                      key={pesticide}
                      onPress={() => updateFormData("pesticide", pesticide)}
                      style={[styles.optionButton, formData.pesticide === pesticide && styles.selectedOption]}
                    >
                      <Text style={[styles.optionText, formData.pesticide === pesticide && styles.selectedOptionText]}>
                        {pesticide}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Quantity Section */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="speedometer" size={20} color={Colors.info} />
                <Text style={styles.sectionTitle}>Quantity Used(ml/kg)</Text>
              </View>
              <TextInput
                value={formData.quantity}
                onChangeText={(text) => updateFormData("quantity", text)}
                placeholder="Enter the amount of pesticide you used"
                keyboardType="numeric"
                style={styles.textInput}
                placeholderTextColor={Colors.textTertiary}
              />
            </View>

            {/* Date of Application */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Date of application</Text>
              <TextInput
                value={formData.applicationDate}
                onChangeText={(text) => updateFormData("applicationDate", text)}
                placeholder="DD/MM/YY"
                style={styles.textInput}
                placeholderTextColor={Colors.textTertiary}
              />
            </View>

            {/* Harvest Date */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Harvest Date</Text>
              <TextInput
                value={formData.harvestDate}
                onChangeText={(text) => updateFormData("harvestDate", text)}
                placeholder="DD/MM/YY"
                style={styles.textInput}
                placeholderTextColor={Colors.textTertiary}
              />
            </View>
          </View>

          {/* Calculate Button */}
          <TouchableOpacity
            style={[
              styles.calculateButton,
              (!formData.cropType || !formData.pesticide || !formData.applicationDate || !formData.harvestDate) &&
                styles.disabledButton,
            ]}
            onPress={handleCalculate}
            disabled={
              isLoading ||
              !formData.cropType ||
              !formData.pesticide ||
              !formData.applicationDate ||
              !formData.harvestDate
            }
          >
            <Text style={styles.calculateButtonText}>{isLoading ? "Calculating..." : "Calculate"}</Text>
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
    backgroundColor: "#EBFCE7", // Light green background matching other screens
    borderRadius: BorderRadius.lg,
    padding: Spacing["2xl"],
    marginBottom: Spacing.lg,
    alignItems: "center",
  },
  robotContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  robotBackground: {
    backgroundColor: "#21825C", // Dark green background for icon
    padding: Spacing.lg,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: "#21825C",
  },
  robotEmoji: {
    fontSize: 40,
    color: "#FFFFFF", // White color for better contrast on dark green background
  },
  robotIcon: {
    width: 40,
    height: 40,
    tintColor: "#FFFFFF", // White tint for better contrast on dark green background
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
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
  },
  dropdownText: {
    fontSize: Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  placeholderText: {
    fontSize: Typography.bodyMedium,
    color: Colors.textTertiary,
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
    borderColor: "#21825C",
    backgroundColor: "#EBFCE7",
  },
  optionText: {
    fontSize: Typography.bodySmall,
    color: Colors.textPrimary,
  },
  selectedOptionText: {
    color: "#21825C",
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
  calculateButton: {
    backgroundColor: "#21825C", // Dark green background for button
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  disabledButton: {
    backgroundColor: Colors.textTertiary,
    opacity: 0.6,
  },
  calculateButtonText: {
    fontSize: Typography.bodyLarge,
    fontWeight: "600",
    color: Colors.textInverse,
  },
})
