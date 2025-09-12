"use client"

import { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useFieldStore } from "../../store/fieldStore"

interface CropSafetyTestProps {
  visible?: boolean
  onClose?: () => void
  inline?: boolean // New prop to render without modal wrapper
}

interface SafetyTestResult {
  cropId: string
  cropName: string
  isSafe: boolean
  daysUntilSafe: number
  safeDate: Date
  applications: Array<{
    pesticideName: string
    applicationDate: Date
    safeHarvestDate: Date
    isExpired: boolean
  }>
}

interface SafetyTestHistory {
  id: string
  cropId: string
  cropName: string
  testDate: Date
  result: SafetyTestResult
  notes?: string
}

interface CountdownTimer {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function CropSafetyTest({ visible = true, onClose = () => {}, inline = false }: CropSafetyTestProps) {
  const { crops } = useFieldStore()
  const [selectedCropId, setSelectedCropId] = useState<string | null>(null)
  const [testHistory, setTestHistory] = useState<SafetyTestHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // Mock data for demonstration
  const mockSafetyData = [
    {
      cropId: "1",
      cropName: "Tomato",
      isSafe: true,
      daysUntilSafe: 0,
      safeDate: new Date(),
      applications: [
        {
          pesticideName: "Insecticide A",
          applicationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          safeHarvestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          isExpired: true,
        },
      ],
    },
    {
      cropId: "2",
      cropName: "Wheat",
      isSafe: false,
      daysUntilSafe: 7,
      safeDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      applications: [
        {
          pesticideName: "Fungicide B",
          applicationDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          safeHarvestDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isExpired: false,
        },
      ],
    },
  ]

  const safetyResults = mockSafetyData
  const safeCrops = safetyResults.filter((r) => r.isSafe)
  const unsafeCrops = safetyResults.filter((r) => !r.isSafe)

  const getCountdownTimer = (targetDate: Date): CountdownTimer => {
    const now = new Date()
    const diff = targetDate.getTime() - now.getTime()

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return { days, hours, minutes, seconds }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Crop Safety Test</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={styles.statusIcon}>
                <Ionicons name="shield-checkmark" size={24} color="white" />
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>Crop Safety Status</Text>
                <Text style={styles.statusSubtitle}>
                  {safeCrops.length} of {safetyResults.length} crops safe to harvest
                </Text>
              </View>
            </View>

            <View style={styles.statusStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{safeCrops.length}</Text>
                <Text style={styles.statLabel}>Safe</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: "#FF6B35" }]}>{unsafeCrops.length}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>
          </View>

          {/* Crop list */}
          <View style={styles.cropsList}>
            {safetyResults.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No crops found. Add crops to perform safety tests.</Text>
              </View>
            ) : (
              safetyResults.map((result) => {
                const countdown = getCountdownTimer(result.safeDate)
                return (
                  <TouchableOpacity
                    key={result.cropId}
                    style={[styles.cropCard, !result.isSafe && styles.cropCardUnsafe]}
                    onPress={() => setSelectedCropId(result.cropId)}
                  >
                    <View style={styles.cropHeader}>
                      <View style={styles.cropInfo}>
                        <Text style={styles.cropName}>{result.cropName}</Text>
                        {result.isSafe ? (
                          <Text style={styles.safeText}>✅ Safe to harvest</Text>
                        ) : (
                          <Text style={styles.unsafeText}>⚠️ Safe in {result.daysUntilSafe} days</Text>
                        )}
                      </View>

                      {!result.isSafe && result.daysUntilSafe > 0 && (
                        <View style={styles.countdown}>
                          <Text style={styles.countdownText}>
                            {countdown.days}d {countdown.hours}h
                          </Text>
                        </View>
                      )}
                    </View>

                    {result.applications.length > 0 && (
                      <View style={styles.applicationsInfo}>
                        <Text style={styles.applicationsTitle}>Recent applications:</Text>
                        {result.applications.slice(0, 2).map((app, index) => (
                          <Text key={index} style={styles.applicationItem}>
                            • {app.pesticideName}
                          </Text>
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                )
              })
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#21825C",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 24,
    textAlign: "center",
  },
  statusCard: {
    backgroundColor: "#EBFCE7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#21825C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 14,
    color: "#718096",
  },
  statusStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#21825C",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 14,
    color: "#718096",
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#E2E8F0",
  },
  cropsList: {
    gap: 12,
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
  },
  cropCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cropCardUnsafe: {
    borderColor: "#FF6B35",
    backgroundColor: "#FFF5F5",
  },
  cropHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 4,
  },
  safeText: {
    fontSize: 14,
    color: "#21825C",
    fontWeight: "500",
  },
  unsafeText: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "500",
  },
  countdown: {
    backgroundColor: "#FFF5F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FF6B35",
  },
  countdownText: {
    fontSize: 12,
    color: "#FF6B35",
    fontWeight: "600",
  },
  applicationsInfo: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 12,
  },
  applicationsTitle: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 4,
    fontWeight: "500",
  },
  applicationItem: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 2,
  },
})
