import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useFieldStore } from "../../store/fieldStore"
import { Colors, Typography, Spacing } from "../../constants/DesignSystem"

interface CropCalendarProps {
  visible?: boolean
  onClose?: () => void
  inline?: boolean // New prop to render without modal wrapper
}

interface CalendarEvent {
  id: string
  title: string
  date: Date
  type: "planting" | "harvest" | "pesticide" | "stage_change"
  cropName: string
  description: string
  priority: "low" | "medium" | "high"
}

export default function CropCalendar({ visible = true, onClose = () => {}, inline = false }: CropCalendarProps) {
  const { crops, fields } = useFieldStore()

  const mockActivities = [
    {
      id: "1",
      title: "Watering plants",
      time: "07.50 A.M.",
      image: require("../../../assets/images/crop1.png"),
    },
    {
      id: "2",
      title: "Fertilizing plants",
      time: "09.10 A.M.",
      image: require("../../../assets/images/crop2.png"),
    },
    {
      id: "3",
      title: "Misting plants",
      time: "11.30 A.M.",
      image: require("../../../assets/images/crop3.png"),
    },
  ]

  const weekDays = [
    { day: "Mon", date: 5 },
    { day: "Tue", date: 6 },
    { day: "Wed", date: 7, selected: true },
    { day: "Thu", date: 8 },
    { day: "Fri", date: 9 },
    { day: "Sat", date: 10 },
    { day: "Sun", date: 11 },
  ]

  return (
    <ScrollView style={styles.container}>
      <View style={styles.calendarContainer}>
        <Text style={styles.calendarTitle}>Calendar</Text>

        <View style={styles.weekCalendar}>
          {weekDays.map((item, index) => (
            <View key={index} style={[styles.dayContainer, item.selected && styles.selectedDay]}>
              <Text style={[styles.dayText, item.selected && styles.selectedDayText]}>{item.day}</Text>
              <Text style={[styles.dateText, item.selected && styles.selectedDateText]}>{item.date}</Text>
            </View>
          ))}
        </View>

        <View style={styles.activitiesContainer}>
          {mockActivities.map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <Image
                source={activity.image}
                alt={activity.title}
                style={styles.activityImage}
                resizeMode="cover"
              />
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
              <View style={styles.activityActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="pencil-outline" size={18} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="trash-outline" size={18} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.floatingButton}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    position: "relative",
  },
  calendarContainer: {
    padding: 20,
  },
  weekCalendar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#A8D5A8",
    justifyContent: "space-between",
  },
  dayContainer: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  selectedDay: {
    backgroundColor: "#6B8E6B",
  },
  dayText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
    fontWeight: "500",
  },
  selectedDayText: {
    color: "#FFFFFF",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  selectedDateText: {
    color: "#FFFFFF",
  },
  activitiesContainer: {
    gap: 16,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#A8D5A8",
  },
  activityImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 14,
    color: "#666",
  },
  activityActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  calendarTitle: {
    fontSize: Typography.headingLarge,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#6B8E6B",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 1000,
  },
})