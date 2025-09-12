"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  SafeAreaView,
} from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaContainer } from "../src/components/ui/SafeAreaContainer"
import { IllustrationPlaceholder } from "../src/components/ui/IllustrationPlaceholder"
import { LoadingSpinner } from "../src/components/LoadingSpinner"
import { useGovernmentStore } from "../src/store/governmentStore"
import { Colors, Typography, Spacing, BorderRadius, Shadows } from "../src/constants/DesignSystem"

const cropTypes = [
  "Rice",
  "Wheat",
  "Maize",
  "Sugarcane",
  "Cotton",
  "Soybean",
  "Groundnut",
  "Sunflower",
  "Mustard",
  "Barley",
  "Gram",
  "Tur",
  "Moong",
  "Urad",
  "Other",
]

const locations = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
]

const identificationTypes = [
  "Aadhaar Card",
  "Voter ID",
  "PAN Card",
  "Driving License",
  "Passport",
  "Ration Card",
  "Kisan Credit Card",
]

export default function SchemeEligibilityScreen() {
  const { schemeId } = useLocalSearchParams()
  const { schemes } = useGovernmentStore()

  // Mock schemes for UI display (when not found in store)
  const mockSchemes = {
    "crop-insurance": {
      id: "crop-insurance",
      name: "Crop Insurance",
      description: "Protect against crop loss due to natural calamities",
      category: "Insurance",
    },
    "seed-subsidy": {
      id: "seed-subsidy",
      name: "Subsidy for Seeds",
      description: "Get financial assistance for seeds",
      category: "Subsidy",
    },
  }

  const [showCropDropdown, setShowCropDropdown] = useState(false)
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [showIdTypeDropdown, setShowIdTypeDropdown] = useState(false)
  const [eligibilityResult, setEligibilityResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Simplified form state
  const [formValues, setFormValues] = useState({
    cropType: "",
    landSize: "",
    location: "",
    identificationType: "",
    identificationNumber: "",
    annualIncome: "",
    farmingExperience: "",
  })

  const [errors, setErrors] = useState<any>({})
  const [touched, setTouched] = useState<any>({})

  const currentScheme =
    schemes.find((s) => s.id === schemeId) || (schemeId && mockSchemes[schemeId as keyof typeof mockSchemes])

  useEffect(() => {
    if (!currentScheme && schemeId) {
      router.back()
    }
  }, [currentScheme, schemeId])

  const handleChange = (field: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: "" }))
    }
  }

  const handleBlur = (field: string) => {
    setTouched((prev: any) => ({ ...prev, [field]: true }))
  }

  const validateForm = () => {
    const newErrors: any = {}

    if (!formValues.cropType) newErrors.cropType = "Crop type is required"
    if (!formValues.landSize) newErrors.landSize = "Land size is required"
    if (!formValues.location) newErrors.location = "Location is required"
    if (!formValues.identificationType) newErrors.identificationType = "ID type is required"
    if (!formValues.identificationNumber) newErrors.identificationNumber = "ID number is required"
    if (!formValues.annualIncome) newErrors.annualIncome = "Annual income is required"
    if (!formValues.farmingExperience) newErrors.farmingExperience = "Farming experience is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fill in all required fields correctly.")
      return
    }

    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockResult = {
        eligible: Math.random() > 0.5,
        message: "Based on your information, here is your eligibility status.",
        score: Math.floor(Math.random() * 100),
      }

      setEligibilityResult(mockResult)
    } catch (error) {
      Alert.alert("Error", "Failed to check eligibility. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormValues({
      cropType: "",
      landSize: "",
      location: "",
      identificationType: "",
      identificationNumber: "",
      annualIncome: "",
      farmingExperience: "",
    })
    setErrors({})
    setTouched({})
    setEligibilityResult(null)
  }

  const renderDropdown = (
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void,
    placeholder: string,
    showDropdown: boolean,
    setShowDropdown: (show: boolean) => void,
  ) => (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity 
        style={styles.dropdown} 
        onPress={() => {
          // Close other dropdowns first
          setShowCropDropdown(false)
          setShowLocationDropdown(false)
          setShowIdTypeDropdown(false)
          // Then toggle this one
          setShowDropdown(!showDropdown)
        }}
      >
        <Text style={[styles.dropdownText, !selectedValue && styles.placeholderText]}>
          {selectedValue || placeholder}
        </Text>
        <Ionicons name={showDropdown ? "chevron-up" : "chevron-down"} size={20} color="#6b7280" />
      </TouchableOpacity>

      {showDropdown && (
        <View style={styles.dropdownOptions}>
          <ScrollView style={styles.optionsScrollView} nestedScrollEnabled>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dropdownOption}
                onPress={() => {
                  onSelect(option)
                  setShowDropdown(false)
                }}
              >
                <Text style={styles.dropdownOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )

  if (!currentScheme) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Scheme not found</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.placeholder} />
      </View>

     
      <View style={styles.heroSection}>
        {/* <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Check Your Eligibility</Text>
          <Text style={styles.heroSubtitle}>
            Fill out the form below to see if you qualify for {currentScheme?.name || "this scheme"}
          </Text>
        </View>
        <View style={styles.heroIllustration}>
          <IllustrationPlaceholder
            width={120}
            height={120}
            borderRadius={60}
            backgroundColor={Colors.farmerBg}
            alt="Eligibility check illustration"
          />
        </View> */}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formSection}>
          {/* Icon and Title */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <Ionicons name="umbrella" size={32} color="white" />
              <View style={styles.leafIcon}>
                <Ionicons name="leaf" size={16} color="white" />
              </View>
            </View>
          </View>

          <Text style={styles.formTitle}>Check Eligibility</Text>

          {/* Crop Type */}
          <View style={[styles.formGroup, { zIndex: 1000 }]}>
            <Text style={styles.formLabel}>Crop Type</Text>
            {renderDropdown(
              cropTypes,
              formValues.cropType,
              (value) => handleChange("cropType", value),
              "Select Crop Type",
              showCropDropdown,
              setShowCropDropdown,
            )}
            {errors.cropType && touched.cropType && <Text style={styles.errorText}>{errors.cropType}</Text>}
          </View>

          {/* Land Size */}
          <View style={[styles.formGroup, { zIndex: 900 }]}>
            <Text style={styles.formLabel}>Land Size (Ha)</Text>
            <TextInput
              style={[styles.textInput, errors.landSize && touched.landSize && styles.inputError]}
              placeholder="Enter land size in hectares"
              value={formValues.landSize}
              onChangeText={(text) => handleChange("landSize", text)}
              onBlur={() => handleBlur("landSize")}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
            {errors.landSize && touched.landSize && <Text style={styles.errorText}>{errors.landSize}</Text>}
          </View>

          {/* Location */}
          <View style={[styles.formGroup, { zIndex: 800 }]}>
            <Text style={styles.formLabel}>Location</Text>
            {renderDropdown(
              locations,
              formValues.location,
              (value) => handleChange("location", value),
              "Select Location",
              showLocationDropdown,
              setShowLocationDropdown,
            )}
            {errors.location && touched.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>

          {/* Identification Type */}
          <View style={[styles.formGroup, { zIndex: 700 }]}>
            <Text style={styles.formLabel}>Identification Type</Text>
            {renderDropdown(
              identificationTypes,
              formValues.identificationType,
              (value) => handleChange("identificationType", value),
              "Select ID Type",
              showIdTypeDropdown,
              setShowIdTypeDropdown,
            )}
            {errors.identificationType && touched.identificationType && (
              <Text style={styles.errorText}>{errors.identificationType}</Text>
            )}
          </View>

          {/* Identification Number */}
          <View style={[styles.formGroup, { zIndex: 600 }]}>
            <Text style={styles.formLabel}>Identification Number</Text>
            <TextInput
              style={[
                styles.textInput,
                errors.identificationNumber && touched.identificationNumber && styles.inputError,
              ]}
              placeholder="Enter ID number"
              value={formValues.identificationNumber}
              onChangeText={(text) => handleChange("identificationNumber", text)}
              onBlur={() => handleBlur("identificationNumber")}
              placeholderTextColor="#9CA3AF"
            />
            {errors.identificationNumber && touched.identificationNumber && (
              <Text style={styles.errorText}>{errors.identificationNumber}</Text>
            )}
          </View>

          {/* Annual Income */}
          <View style={[styles.formGroup, { zIndex: 500 }]}>
            <Text style={styles.formLabel}>Annual Income (₹)</Text>
            <TextInput
              style={[styles.textInput, errors.annualIncome && touched.annualIncome && styles.inputError]}
              placeholder="Enter annual income"
              value={formValues.annualIncome}
              onChangeText={(text) => handleChange("annualIncome", text)}
              onBlur={() => handleBlur("annualIncome")}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
            {errors.annualIncome && touched.annualIncome && <Text style={styles.errorText}>{errors.annualIncome}</Text>}
          </View>

          {/* Farming Experience */}
          <View style={[styles.formGroup, { zIndex: 400 }]}>
            <Text style={styles.formLabel}>Farming Experience (Years)</Text>
            <TextInput
              style={[styles.textInput, errors.farmingExperience && touched.farmingExperience && styles.inputError]}
              placeholder="Enter years of farming experience"
              value={formValues.farmingExperience}
              onChangeText={(text) => handleChange("farmingExperience", text)}
              onBlur={() => handleBlur("farmingExperience")}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
            {errors.farmingExperience && touched.farmingExperience && (
              <Text style={styles.errorText}>{errors.farmingExperience}</Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner size="small" color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Eligibility Result Modal */}
      <Modal visible={eligibilityResult !== null} animationType="slide" presentationStyle="pageSheet">
        {eligibilityResult && (
          <SafeAreaContainer>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Eligibility Result</Text>
                <TouchableOpacity onPress={() => setEligibilityResult(null)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                {/* Result Summary */}
                <View style={styles.resultSummary}>
                  <View style={[styles.resultIcon, { backgroundColor: eligibilityResult.eligible ? '#22C55E' : '#EF4444' }]}>
                    <Ionicons 
                      name={eligibilityResult.eligible ? "checkmark" : "close"} 
                      size={40} 
                      color="white" 
                    />
                  </View>
                  <Text style={styles.resultTitle}>
                    {eligibilityResult.eligible ? 'Congratulations!' : 'Not Eligible'}
                  </Text>
                  <Text style={styles.resultSubtitle}>
                    {eligibilityResult.eligible 
                      ? 'You are eligible for this scheme' 
                      : 'You do not meet the eligibility criteria'
                    }
                  </Text>
                  <Text style={styles.eligibilityScore}>
                    Eligibility Score: {eligibilityResult.score}%
                  </Text>
                </View>

                {/* Detailed Information */}
                <View style={styles.detailsSection}>
                  <Text style={styles.sectionTitle}>Your Application Details</Text>
                  
                  <View style={styles.detailCard}>
                    <Text style={styles.detailLabel}>Crop Type</Text>
                    <Text style={styles.detailValue}>{formValues.cropType}</Text>
                  </View>
                  
                  <View style={styles.detailCard}>
                    <Text style={styles.detailLabel}>Land Size</Text>
                    <Text style={styles.detailValue}>{formValues.landSize} Ha</Text>
                  </View>
                  
                  <View style={styles.detailCard}>
                    <Text style={styles.detailLabel}>Location</Text>
                    <Text style={styles.detailValue}>{formValues.location}</Text>
                  </View>
                  
                  <View style={styles.detailCard}>
                    <Text style={styles.detailLabel}>Annual Income</Text>
                    <Text style={styles.detailValue}>₹{formValues.annualIncome}</Text>
                  </View>
                  
                  <View style={styles.detailCard}>
                    <Text style={styles.detailLabel}>Farming Experience</Text>
                    <Text style={styles.detailValue}>{formValues.farmingExperience} years</Text>
                  </View>
                </View>

                {eligibilityResult.eligible ? (
                  /* Next Steps for Eligible Users */
                  <View style={styles.nextStepsSection}>
                    <Text style={styles.sectionTitle}>Next Steps</Text>
                    <View style={styles.stepCard}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>1</Text>
                      </View>
                      <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Prepare Documents</Text>
                        <Text style={styles.stepDescription}>
                          Gather required documents: Aadhaar Card, Land Records, Bank Passbook, Income Certificate
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.stepCard}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>2</Text>
                      </View>
                      <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Visit Government Office</Text>
                        <Text style={styles.stepDescription}>
                          Submit application at your nearest agricultural office or apply online
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.stepCard}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>3</Text>
                      </View>
                      <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Track Application</Text>
                        <Text style={styles.stepDescription}>
                          Monitor your application status and respond to any queries
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  /* Improvement Suggestions for Non-eligible Users */
                  <View style={styles.improvementSection}>
                    <Text style={styles.sectionTitle}>How to Improve Eligibility</Text>
                    <View style={styles.suggestionCard}>
                      <Ionicons name="bulb" size={20} color="#F59E0B" />
                      <Text style={styles.suggestionText}>
                        Consider expanding your farming operation to meet minimum land requirements
                      </Text>
                    </View>
                    <View style={styles.suggestionCard}>
                      <Ionicons name="school" size={20} color="#F59E0B" />
                      <Text style={styles.suggestionText}>
                        Attend agricultural training programs to gain additional experience
                      </Text>
                    </View>
                    <View style={styles.suggestionCard}>
                      <Ionicons name="people" size={20} color="#F59E0B" />
                      <Text style={styles.suggestionText}>
                        Join farmer producer organizations to access group benefits
                      </Text>
                    </View>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  {eligibilityResult.eligible ? (
                    <TouchableOpacity style={styles.primaryButton} onPress={() => setEligibilityResult(null)}>
                      <Text style={styles.primaryButtonText}>Start Application</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.secondaryButton} onPress={handleReset}>
                      <Text style={styles.secondaryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity 
                    style={styles.outlineButton} 
                    onPress={() => router.push('/government-schemes')}
                  >
                    <Text style={styles.outlineButtonText}>View Other Schemes</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </SafeAreaContainer>
        )}
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: "white",
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#21825C",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: {
    width: 48,
  },

  // Hero Section
  heroSection: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    alignItems: "center",
  },
  heroContent: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  heroTitle: {
    fontSize: Typography.headingLarge,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    fontSize: Typography.bodyLarge,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  heroIllustration: {
    alignItems: "center",
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },

  formSection: {
    backgroundColor: "#EBFCE7",
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
  },

  iconContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#21825C",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  leafIcon: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#21825C",
    alignItems: "center",
    justifyContent: "center",
  },

  formTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#374151",
    marginBottom: Spacing.xl,
    textAlign: "center",
  },

  formGroup: {
    width: "100%",
    marginBottom: Spacing.xl,
    zIndex: 1,
  },
  formLabel: {
    fontSize: Typography.bodyLarge,
    fontWeight: Typography.medium,
    color: "#374151",
    marginBottom: Spacing.sm,
  },

  dropdownContainer: {
    position: "relative",
    zIndex: 1000,
    marginBottom: Spacing.sm,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dropdownText: {
    fontSize: Typography.bodyLarge,
    color: "#374151",
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  dropdownOptions: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    maxHeight: 150,
    zIndex: 1001,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  optionsScrollView: {
    maxHeight: 150,
  },
  dropdownOption: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownOptionText: {
    fontSize: Typography.bodyLarge,
    color: "#374151",
  },

  textInput: {
    backgroundColor: "white",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: Typography.bodyLarge,
    color: "#374151",
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: Typography.bodyMedium,
    color: Colors.error,
    marginTop: Spacing.xs,
  },

  submitButton: {
    backgroundColor: "#21825C",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    marginTop: Spacing.xl,
    width: "100%",
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    fontSize: Typography.bodyLarge,
    fontWeight: Typography.semibold,
    color: "white",
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Typography.headingMedium,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.xl,
  },
  
  // Result Summary Styles
  resultSummary: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  resultIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  resultSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  eligibilityScore: {
    fontSize: 18,
    fontWeight: Typography.semibold,
    color: Colors.primary,
    textAlign: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  
  // Details Section Styles
  detailsSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  detailCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  detailLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
  detailValue: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: Typography.semibold,
  },
  
  // Next Steps Styles
  nextStepsSection: {
    marginBottom: Spacing.xl,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  stepNumberText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: Typography.bold,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  
  // Improvement Section Styles
  improvementSection: {
    marginBottom: Spacing.xl,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  suggestionText: {
    fontSize: 14,
    color: '#92400E',
    marginLeft: Spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  
  // Action Buttons Styles
  actionButtons: {
    paddingTop: Spacing.lg,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  primaryButtonText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: Typography.semibold,
  },
  secondaryButton: {
    backgroundColor: '#6B7280',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  secondaryButtonText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: Typography.semibold,
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: Colors.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: Typography.semibold,
  },
})
