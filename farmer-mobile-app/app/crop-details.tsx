"use client"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaContainer } from "../src/components/ui/SafeAreaContainer"
import { Header } from "../src/components/ui/Header"
import { Colors, Typography, Spacing } from "../src/constants/DesignSystem"
import { useFieldStore } from "../src/store/fieldStore"

export default function CropDetailsScreen() {
  const params = useLocalSearchParams()
  const router = useRouter()
  const { crops } = useFieldStore()

  const cropId = params.cropId as string
  const crop = crops.find((c) => c.id === cropId)

  // Mock data to match Figma
  const mockCrop = crop || {
    id: "1",
    name: "Tomato",
    variety: "Cherry Tomato",
    currentStage: "flowering",
    plantingDate: "2024-01-15",
    description:
      "Tomato is a visually appealing and not only adds a touch of elegance to indoor spaces but also offers the health benefits, making it an ideal choice for both beginners and expert gardeners of all preferences and skill-being.",
    image: "🍅",
    conditions: {
      light: "250 ml",
      fertilizer: "70 ml",
      humidity: "54%",
      watering: "250 ml",
    },
  }

  const renderTomatoDetails = () => (
    <ScrollView style={styles.container}>
      {/* Crop Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require("../assets/images/tomato.png")}
          style={styles.cropImage}
          resizeMode="cover"
        />
      </View>

      {/* Crop Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.cropName}>{mockCrop.name}</Text>

        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>
            Health: <Text style={styles.healthGood}>Good (keep it up!)</Text>
          </Text>
          <Text style={styles.statusLabel}>
            Irrigation Type: <Text style={styles.irrigationType}>Rainfed</Text>
          </Text>
        </View>
      </View>

      {/* Favored Conditions */}
      <View style={styles.conditionsContainer}>
        <Text style={styles.conditionsTitle}>Favoured Conditions</Text>

        <View style={styles.conditionsGrid}>
          <View style={styles.conditionItem}>
            <View style={[styles.conditionIcon, { backgroundColor: "#EBFCE7" }]}>
              <Ionicons name="water" size={24} color="#21825C" />
            </View>
            <Text style={styles.conditionLabel}>Water</Text>
            <Text style={styles.conditionValue}>250 ml</Text>
          </View>

          <View style={styles.conditionItem}>
            <View style={[styles.conditionIcon, { backgroundColor: "#EBFCE7" }]}>
              <Ionicons name="sunny" size={24} color="#21825C" />
            </View>
            <Text style={styles.conditionLabel}>Sunlight</Text>
            <Text style={styles.conditionValue}>Normal</Text>
          </View>

          <View style={styles.conditionItem}>
            <View style={[styles.conditionIcon, { backgroundColor: "#EBFCE7" }]}>
              <Ionicons name="leaf" size={24} color="#21825C" />
            </View>
            <Text style={styles.conditionLabel}>Fertilizer</Text>
            <Text style={styles.conditionValue}>70 ml</Text>
          </View>

          <View style={styles.conditionItem}>
            <View style={[styles.conditionIcon, { backgroundColor: "#EBFCE7" }]}>
              <Ionicons name="cloud" size={24} color="#21825C" />
            </View>
            <Text style={styles.conditionLabel}>Humidity</Text>
            <Text style={styles.conditionValue}>54%</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )

  return (
    <SafeAreaContainer backgroundColor={Colors.background}>
      <Header
        title={mockCrop.name}
        showBackButton={true}
        onBackPress={() => router.back()}
        backgroundColor="#21825C"
        rightElement={
          <TouchableOpacity style={styles.reviewButton}>
            <Text style={styles.reviewButtonText}>Write Review</Text>
          </TouchableOpacity>
        }
      />

      {/* Content */}
      {renderTomatoDetails()}
    </SafeAreaContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  imageContainer: {
    padding: Spacing.lg,
    alignItems: "center",
  },
  cropImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  infoContainer: {
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 12,
  },
  cropName: {
    fontSize: Typography.headingLarge,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  description: {
    fontSize: Typography.bodyMedium,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  conditionsContainer: {
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    marginTop: 0,
    padding: Spacing.lg,
    borderRadius: 12,
  },
  conditionsTitle: {
    fontSize: Typography.headingMedium,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  conditionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  conditionItem: {
    width: "48%",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  conditionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  conditionLabel: {
    fontSize: Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: Typography.semibold,
  },
  conditionValue: {
    fontSize: Typography.bodyMedium,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  reviewButton: {
    backgroundColor: "#EBFCE7",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  reviewButtonText: {
    color: "#21825C",
    fontSize: Typography.bodySmall,
    fontWeight: Typography.semibold,
  },
  statusContainer: {
    marginTop: Spacing.sm,
  },
  statusLabel: {
    fontSize: Typography.bodyMedium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  healthGood: {
    color: "#21825C",
    fontWeight: Typography.semibold,
  },
  irrigationType: {
    color: "#4A90E2",
    fontWeight: Typography.semibold,
  },
})
