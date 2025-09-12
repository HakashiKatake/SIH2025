"use client"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from "react-native"
import { router } from "expo-router"
import { SafeAreaContainer } from "../../src/components/ui/SafeAreaContainer"
import { Header } from "../../src/components/ui/Header"
import { ActionButton } from "../../src/components/ui/ActionButton"
import { useFormState } from "../../src/hooks/useFormState"
import { useMarketplaceStore } from "../../src/store/marketplaceStore"
import { useAuthStore } from "../../src/store/authStore"
import { Colors, Typography, Spacing, BorderRadius } from "../../src/constants/DesignSystem"

interface AddProductForm {
  location: string
  cropType: string
  quantity: string
  unit: string
  price: string
  description: string
  images: string[]
}

export default function AddProductScreen() {
  const { createListing, isCreating } = useMarketplaceStore()
  const { token } = useAuthStore()

  const formState = useFormState<AddProductForm>({
    location: "",
    cropType: "",
    quantity: "",
    unit: "kg",
    price: "",
    description: "",
    images: [],
  })

  const cropCategories = [
    { id: "grains", name: "Grains and\nCereals", icon: "🌾" },
    { id: "fruits", name: "Fruits", icon: "🍎" },
    { id: "spices", name: "Spices/Herbs", icon: "🌿" },
    { id: "vegetables", name: "Vegetables", icon: "🥬" },
    { id: "nuts", name: "Nuts", icon: "🥜" },
  ]

  const validateForm = () => {
    return formState.validateForm({
      location: (value) => (!value ? "Location is required" : null),
      cropType: (value) => (!value ? "Please select a crop category" : null),
      quantity: (value) => {
        if (!value) return "Quantity is required"
        if (isNaN(Number.parseFloat(value)) || Number.parseFloat(value) <= 0) return "Please enter a valid quantity"
        return null
      },
      description: (value) => (!value ? "Description is required" : null),
    })
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    if (!token) {
      Alert.alert("Error", "Please login to add products")
      return
    }

    try {
      const selectedCategory = cropCategories.find((category) => category.id === formState.values.cropType)

      await createListing(
        {
          name: formState.values.cropType,
          category: selectedCategory?.id || "unknown",
          price: Number.parseFloat(formState.values.price),
          quantity: Number.parseFloat(formState.values.quantity),
          unit: formState.values.unit,
          description: formState.values.description,
          images: formState.values.images,
        },
        token,
      )

      Alert.alert("Success", "Product added successfully!", [{ text: "OK", onPress: () => router.back() }])
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add product")
    }
  }

  const handleLocationSelect = () => {
    // TODO: Implement location picker
    Alert.alert("Location Picker", "Location picker will be implemented")
  }

  const handleImageUpload = () => {
    // TODO: Implement image picker
    Alert.alert("Image Upload", "Image upload will be implemented")
  }

  return (
    <SafeAreaContainer backgroundColor={Colors.background}>
      {/* Header */}
      <Header title="Market Place" showBackButton={true} backgroundColor={Colors.surface} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add a new crop</Text>

          {/* Location Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.locationButton, formState.errors.location && styles.inputError]}
              onPress={handleLocationSelect}
            >
              <Text style={[styles.locationText, formState.values.location && styles.locationTextSelected]}>
                Location {formState.values.location ? `- ${formState.values.location}` : ""}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
            {formState.errors.location && <Text style={styles.errorText}>{formState.errors.location}</Text>}
          </View>

          {/* Select Crop Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select crop</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cropScrollContainer}
            >
              {cropCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.cropCard, formState.values.cropType === category.id && styles.selectedCropCard]}
                  onPress={() => formState.setValue("cropType", category.id)}
                >
                  <View style={styles.cropIconContainer}>
                    <Text style={styles.cropIcon}>{category.icon}</Text>
                  </View>
                  <Text style={styles.cropName}>{category.name}</Text>
                </TouchableOpacity>
              ))}
              <View style={styles.scrollIndicator}>
                <Text style={styles.scrollArrow}>→</Text>
              </View>
            </ScrollView>
            {formState.errors.cropType && <Text style={styles.errorText}>{formState.errors.cropType}</Text>}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Crop name :</Text>
            <TextInput
              style={[styles.input, formState.errors.cropType && styles.inputError]}
              placeholder=""
              value={formState.values.cropType}
              onChangeText={(value) => formState.setValue("cropType", value)}
              onBlur={() => formState.setTouched("cropType")}
            />
          </View>

          <View style={styles.section}>
            <TouchableOpacity style={[styles.locationButton, formState.errors.quantity && styles.inputError]}>
              <Text style={styles.locationText}>
                Quantity {formState.values.quantity ? `- ${formState.values.quantity}` : ""}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
            {formState.errors.quantity && <Text style={styles.errorText}>{formState.errors.quantity}</Text>}
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, formState.errors.description && styles.inputError]}
              placeholder="Write about your crop — how fresh it is, how well it has grown, and any special care you took."
              value={formState.values.description}
              onChangeText={(value) => formState.setValue("description", value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              onBlur={() => formState.setTouched("description")}
            />
            {formState.errors.description && <Text style={styles.errorText}>{formState.errors.description}</Text>}
          </View>

          {/* Upload Pictures Section */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.uploadButton} onPress={handleImageUpload}>
              <View style={styles.uploadIconContainer}>
                <Text style={styles.uploadIcon}>📤</Text>
              </View>
              <Text style={styles.uploadText}>Upload pictures</Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <ActionButton
            title={isCreating ? "Adding Product..." : "Submit"}
            variant="primary"
            size="large"
            onPress={handleSubmit}
            loading={isCreating}
            disabled={isCreating}
            fullWidth
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </SafeAreaContainer>
  )
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing["3xl"],
  },
  card: {
    backgroundColor: "#EBFCE7",
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: "#000",
  },
  cardTitle: {
    fontSize: Typography.headingMedium,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.bodyLarge,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  locationButton: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationText: {
    fontSize: Typography.bodyLarge,
    color: Colors.textSecondary,
  },
  locationTextSelected: {
    color: Colors.textPrimary,
  },
  dropdownIcon: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
  },
  cropScrollContainer: {
    paddingRight: Spacing.lg,
  },
  cropCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 80,
    marginRight: Spacing.md,
  },
  selectedCropCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLighter,
  },
  cropIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#21825C",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  cropIcon: {
    fontSize: 20,
  },
  scrollIndicator: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
  },
  scrollArrow: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
  input: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: Typography.bodyLarge,
    color: Colors.textPrimary,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  uploadButton: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  uploadIconContainer: {
    marginRight: Spacing.md,
  },
  uploadIcon: {
    fontSize: 20,
  },
  uploadText: {
    fontSize: Typography.bodyLarge,
    fontWeight: Typography.medium,
    color: Colors.textPrimary,
  },
  submitButton: {
    marginTop: Spacing.lg,
  },
  errorText: {
    fontSize: Typography.bodySmall,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
})
