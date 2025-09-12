"use client"

import { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal, StyleSheet } from "react-native"
import { useFieldStore } from "../../store/fieldStore"
import { useAuthStore } from "../../store/authStore"
import { Colors, Typography, Spacing, BorderRadius } from "../../constants/DesignSystem"

interface AddFieldProps {
  visible: boolean
  onClose: () => void
}

export default function AddField({ visible, onClose }: AddFieldProps) {
  const { addField } = useFieldStore()
  const { user } = useAuthStore()

  const [formData, setFormData] = useState({
    name: "",
    size: "",
    soilType: "",
    address: "",
    city: "",
    state: "",
  })

  const soilTypes = ["Clay", "Sandy", "Loamy", "Silty", "Peaty", "Chalky", "Mixed"]

  const handleSave = () => {
    if (!formData.name.trim() || !formData.size.trim() || !formData.soilType) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    const sizeNumber = Number.parseFloat(formData.size)
    if (isNaN(sizeNumber) || sizeNumber <= 0) {
      Alert.alert("Error", "Please enter a valid field size")
      return
    }

    const fieldData = {
      farmerId: user?.id || "",
      name: formData.name.trim(),
      size: sizeNumber,
      soilType: formData.soilType,
      location: {
        address: formData.address.trim() || "Not specified",
        city: formData.city.trim() || user?.profile?.location?.city || "",
        state: formData.state.trim() || user?.profile?.location?.state || "",
        country: user?.profile?.location?.country || "India",
        coordinates: user?.profile?.location?.coordinates || {
          latitude: 0,
          longitude: 0,
        },
      },
      crops: [],
    }

    addField(fieldData)

    // Reset form
    setFormData({
      name: "",
      size: "",
      soilType: "",
      address: "",
      city: "",
      state: "",
    })

    onClose()
  }

  const handleCancel = () => {
    // Reset form
    setFormData({
      name: "",
      size: "",
      soilType: "",
      address: "",
      city: "",
      state: "",
    })
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add New Field</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Field Information
            </Text>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Field Name *</Text>
              <TextInput
                value={formData.name}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
                placeholder="e.g., North Field, Main Plot, Field A"
                style={styles.textInput}
                placeholderTextColor={Colors.textTertiary}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Field Size (acres) *</Text>
              <TextInput
                value={formData.size}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, size: text }))}
                placeholder="e.g., 2.5"
                keyboardType="numeric"
                style={styles.textInput}
                placeholderTextColor={Colors.textTertiary}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Soil Type *</Text>
              <View style={styles.soilTypeContainer}>
                {soilTypes.map((soil) => (
                  <TouchableOpacity
                    key={soil}
                    onPress={() => setFormData((prev) => ({ ...prev, soilType: soil }))}
                    style={[
                      styles.soilTypeOption,
                      formData.soilType === soil ? styles.soilTypeSelected : null
                    ]}
                  >
                    <View style={styles.soilTypeContent}>
                      <Text style={styles.soilTypeText}>{soil}</Text>
                      {formData.soilType === soil && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Location Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Location (Optional)
            </Text>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Address</Text>
              <TextInput
                value={formData.address}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, address: text }))}
                placeholder="Field address or landmark"
                style={styles.textInput}
                placeholderTextColor={Colors.textTertiary}
              />
            </View>

            <View style={styles.rowContainer}>
              <View style={[styles.halfField, { marginRight: Spacing.sm }]}>
                <Text style={styles.fieldLabel}>City</Text>
                <TextInput
                  value={formData.city}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, city: text }))}
                  placeholder="City"
                  style={styles.textInput}
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>
              <View style={[styles.halfField, { marginLeft: Spacing.sm }]}>
                <Text style={styles.fieldLabel}>State</Text>
                <TextInput
                  value={formData.state}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, state: text }))}
                  placeholder="State"
                  style={styles.textInput}
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>
            </View>

            <View style={styles.tipContainer}>
              <Text style={styles.tipText}>
                💡 Tip: Adding location information helps with weather forecasts and local agricultural recommendations.
              </Text>
            </View>
          </View>

          {/* Field Guidelines */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Field Management Tips
            </Text>

            <View style={styles.tipsContainer}>
              <View style={styles.tipRow}>
                <Text style={styles.tipEmoji}>🌱</Text>
                <Text style={styles.tipDescription}>
                  Choose appropriate crops based on your soil type and local climate
                </Text>
              </View>
              <View style={styles.tipRow}>
                <Text style={styles.tipEmoji}>💧</Text>
                <Text style={styles.tipDescription}>
                  Consider water availability and irrigation requirements
                </Text>
              </View>
              <View style={styles.tipRow}>
                <Text style={styles.tipEmoji}>📊</Text>
                <Text style={styles.tipDescription}>
                  Track crop rotation to maintain soil health
                </Text>
              </View>
              <View style={styles.tipRow}>
                <Text style={styles.tipEmoji}>🧪</Text>
                <Text style={styles.tipDescription}>
                  Regular soil testing helps optimize fertilizer use
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: "#21825C",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cancelText: {
    color: Colors.textInverse,
    fontSize: Typography.bodyLarge,
  },
  headerTitle: {
    fontSize: Typography.bodyLarge,
    fontWeight: Typography.semibold,
    color: Colors.textInverse,
  },
  saveText: {
    color: Colors.textInverse,
    fontSize: Typography.bodyLarge,
    fontWeight: Typography.medium,
  },
  scrollView: {
    flex: 1,
    padding: Spacing.lg,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: Typography.headingSmall,
    fontWeight: Typography.semibold,
    color: "#21825C",
    marginBottom: Spacing.lg,
  },
  fieldContainer: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
    marginBottom: Spacing.sm,
    fontSize: Typography.bodyMedium,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    fontSize: Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  soilTypeContainer: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
  },
  soilTypeOption: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  soilTypeSelected: {
    backgroundColor: "#EBFCE7",
  },
  soilTypeContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  soilTypeText: {
    color: Colors.textPrimary,
    fontSize: Typography.bodyMedium,
  },
  checkmark: {
    color: "#21825C",
    fontSize: Typography.bodyMedium,
    fontWeight: Typography.semibold,
  },
  rowContainer: {
    flexDirection: "row",
    marginBottom: Spacing.lg,
  },
  halfField: {
    flex: 1,
  },
  tipContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: "#EBFCE7",
  },
  tipText: {
    color: "#21825C",
    fontSize: Typography.bodySmall,
  },
  tipsContainer: {
    gap: Spacing.md,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  tipEmoji: {
    marginRight: Spacing.sm,
    color: "#21825C",
    fontSize: Typography.bodyMedium,
  },
  tipDescription: {
    color: Colors.textSecondary,
    flex: 1,
    fontSize: Typography.bodyMedium,
    lineHeight: 20,
  },
})
