"use client"

import type React from "react"
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useFieldStore } from "../../store/fieldStore"
import { Colors, Spacing } from "../../constants/DesignSystem"
import { useTranslation } from "../../hooks/useTranslation"

interface MyCropsListProps {
  onAddCrop?: () => void
  onCropPress?: (cropId: string) => void
}

export const MyCropsList: React.FC<MyCropsListProps> = ({ onAddCrop, onCropPress }) => {
  const { t } = useTranslation()
  const { crops } = useFieldStore()
  const router = useRouter()

  // Mock crop data to match Figma when no real crops exist
  const mockCrops = [
    {
      id: "1",
      name: "Anthurium",
      stage: "Flowering",
      health: "Healthy",
      image: "🌺",
      statusColor: "#FFD700",
      needsAttention: false,
    },
    {
      id: "2",
      name: "Potato",
      stage: "Need Attention",
      health: "Needs Care",
      image: "🥔",
      statusColor: "#FF6B6B",
      needsAttention: true,
    },
    {
      id: "3",
      name: "Ginger",
      stage: "Good Harvest",
      health: "Healthy",
      image: "🌿",
      statusColor: "#4ECDC4",
      needsAttention: false,
    },
    {
      id: "4",
      name: "Tomato",
      stage: "Sprouting",
      health: "Healthy",
      image: "🍅",
      statusColor: "#95E1D3",
      needsAttention: false,
    },
    {
      id: "5",
      name: "Sunflower",
      stage: "Good Harvest",
      health: "Healthy",
      image: "🌻",
      statusColor: "#FFD93D",
      needsAttention: false,
    },
  ]

  const displayCrops =
    crops.length > 0
      ? crops.map((crop) => ({
          id: crop.id,
          name: crop.name,
          stage: crop.currentStage,
          health: "Healthy",
          image: getCropEmoji(crop.name),
          statusColor: getStatusColor(crop.currentStage),
          needsAttention: crop.currentStage === "germination" || crop.currentStage === "vegetative",
        }))
      : mockCrops

  function getCropEmoji(cropName: string): string {
    const name = cropName.toLowerCase()
    if (name.includes("tomato")) return "🍅"
    if (name.includes("potato")) return "🥔"
    if (name.includes("ginger")) return "🌿"
    if (name.includes("sunflower")) return "🌻"
    if (name.includes("anthurium")) return "🌺"
    return "🌱"
  }

  function getStatusColor(stage: string): string {
    switch (stage) {
      case "flowering":
        return "#FFD700"
      case "fruiting":
        return "#4ECDC4"
      case "germination":
        return "#95E1D3"
      case "vegetative":
        return "#FFD93D"
      case "needs_attention":
        return "#FF6B6B"
      default:
        return "#22c55e"
    }
  }

  const handleCropPress = (cropId: string) => {
    router.push({
      pathname: "/crop-details",
      params: { cropId },
    })
  }

  if (crops.length === 0 && displayCrops.length === 0) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIllustration}>
          <Text style={styles.emptyEmoji}>🌱</Text>
        </View>
        <Text style={styles.emptyTitle}>{t('field.setupYourField')}</Text>
        <TouchableOpacity style={styles.addCropButton} onPress={onAddCrop}>
          <Text style={styles.addCropButtonText}>+ {t('field.addCrops')}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={() => router.push('/farmer/scan')}
        >
          <Text style={styles.scanButtonText}>📱 {t('field.openScan')}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const renderCropItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.cropCard} onPress={() => handleCropPress(item.id)}>
      <View style={styles.cropHeader}>
        <View style={styles.cropImageContainer}>
          <Text style={styles.cropEmoji}>{item.image}</Text>
        </View>
        <View style={styles.cropInfo}>
          <Text style={styles.cropName}>{item.name}</Text>
          <Text style={styles.cropStage}>{item.stage}</Text>
        </View>
        <View style={styles.cropStatus}>
          <View style={[styles.statusDot, { backgroundColor: item.statusColor }]} />
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={displayCrops}
        renderItem={renderCropItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={() => (
          <View style={styles.footerButtons}>
            {/* Add Crops Button */}
            <TouchableOpacity style={styles.addCropCard} onPress={onAddCrop}>
              <Ionicons name="add" size={24} color={Colors.primary} />
              <Text style={styles.addCropText}>{t('field.addCrops')}</Text>
            </TouchableOpacity>

            {/* Open Scan Button */}
            <TouchableOpacity 
              style={styles.scanCard}
              onPress={() => router.push('/farmer/scan')}
            >
              <Ionicons name="camera" size={24} color={Colors.primary} />
              <Text style={styles.scanText}>Open Scan</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    backgroundColor: "#F8F9FA",
  },
  emptyIllustration: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  emptyEmoji: {
    fontSize: 120,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 40,
    textAlign: "center",
  },
  addCropButton: {
    backgroundColor: "#6B8E6B",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 16,
    minWidth: 200,
    alignItems: "center",
  },
  addCropButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  scanButton: {
    backgroundColor: "#6B8E6B",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 200,
    alignItems: "center",
  },
  scanButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  listContainer: {
    padding: Spacing.lg,
  },
  cropCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cropHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cropImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cropEmoji: {
    fontSize: 28,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  cropStage: {
    fontSize: 14,
    color: "#6B7280",
  },
  cropStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  footerButtons: {
    marginTop: 24,
    paddingBottom: 20,
  },
  addCropCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#6B8E6B",
    borderStyle: "dashed",
    flexDirection: "row",
  },
  addCropText: {
    color: "#6B8E6B",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  scanCard: {
    backgroundColor: "#6B8E6B",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  scanText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
})