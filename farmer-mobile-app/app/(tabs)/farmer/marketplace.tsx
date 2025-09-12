import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image } from "react-native"
import { router } from "expo-router"
import { SafeAreaContainer } from "../../../src/components/ui/SafeAreaContainer"
import { Colors, Spacing } from "../../../src/constants/DesignSystem"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "../../../src/hooks/useTranslation"

export default function FarmerMarketplace() {
  const { t } = useTranslation()
  
  const handleAddCrop = () => {
    router.push("/farmer/add-product")
  }

  const cropCategories = [
    { id: 1, name: t('marketplace.grainsAndCereals'), icon: "🌾" },
    { id: 2, name: t('marketplace.fruits'), icon: "🍎" },
    { id: 3, name: t('marketplace.spicesHerbs'), icon: "🌿" },
    { id: 4, name: t('marketplace.vegetables'), icon: "🥬" },
    { id: 5, name: t('marketplace.nuts'), icon: "🥜" },
  ]

  const myCrops = [
    {
      id: 1,
      name: "Avocado",
      seller: "Chirag Agrawal",
      price: "₹17000",
      unit: "per quintal",
      image: require("../../../assets/images/avocado.png"),
      badge: "Avocado",
    },
    {
      id: 2,
      name: "Corn",
      seller: "Rohan Kumar",
      price: "₹8000",
      unit: t('marketplace.perQuintal'),
      date: "05/09/2025",
      image: require("../../../assets/images/corn.png"),
      priceAlert: t('marketplace.highestPriceIn15Days'),
    },
  ]

  return (
    <SafeAreaContainer backgroundColor={Colors.background}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('marketplace.mandi')}</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={16} color="#21825C" />
            <Text style={styles.locationText}>Kharghar</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Select Crop Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('marketplace.selectCrop')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropCategoriesContainer}>
            {cropCategories.map((category) => (
              <TouchableOpacity key={category.id} style={styles.cropCategory}>
                <View style={styles.cropIcon}>
                  <Text style={styles.cropEmoji}>{category.icon}</Text>
                </View>
                <Text style={styles.cropName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput style={styles.searchInput} placeholder={t('marketplace.search')} placeholderTextColor="#999" />
            <TouchableOpacity>
              <Ionicons name="mic" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Options */}
        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>{t('marketplace.sortByPrice')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButtonActive}>
            <Text style={styles.filterTextActive}>{t('marketplace.within500km')}</Text>
            <Ionicons name="chevron-down" size={16} color="white" />
          </TouchableOpacity>
        </View>

        {/* My Crops Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('marketplace.myCrops')}</Text>
          {myCrops.map((crop) => (
            <TouchableOpacity key={crop.id} style={styles.cropCard}>
              <Image source={crop.image} style={styles.cropImage} />
              <View style={styles.cropInfo}>
                <View style={styles.cropHeader}>
                  <Text style={styles.cropSeller}>{crop.seller}</Text>
                  {crop.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{crop.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cropPrice}>{crop.price}</Text>
                <Text style={styles.cropUnit}>{crop.unit}</Text>
                {crop.date && <Text style={styles.cropDate}>{t('marketplace.date')}: {crop.date}</Text>}
                {crop.priceAlert && (
                  <View style={styles.priceAlert}>
                    <Ionicons name="trending-up" size={12} color="#FF4444" />
                    <Text style={styles.priceAlertText}>{crop.priceAlert}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Price Summary */}
        <View style={styles.priceSummary}>
          <View style={styles.priceColumn}>
            <Text style={styles.priceLabel}>{t('marketplace.maxPrice')}</Text>
            <Text style={styles.priceValue}>₹10000/{t('marketplace.quintal')}</Text>
          </View>
          <View style={styles.priceColumn}>
            <Text style={styles.priceLabel}>{t('marketplace.minPrice')}</Text>
            <Text style={styles.priceValue}>₹8000/{t('marketplace.quintal')}</Text>
          </View>
          <View style={styles.priceColumn}>
            <Text style={styles.priceLabel}>{t('marketplace.avgPrice')}</Text>
            <Text style={styles.priceValue}>₹9000/{t('marketplace.quintal')}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddCrop} activeOpacity={0.8}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </SafeAreaContainer>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#21825C",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingTop: Spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  locationText: {
    fontSize: 14,
    color: "#21825C",
    marginLeft: 4,
    fontWeight: "500",
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#21825C",
    marginBottom: Spacing.md,
  },
  cropCategoriesContainer: {
    flexDirection: "row",
  },
  cropCategory: {
    alignItems: "center",
    marginRight: Spacing.lg,
    width: 70,
  },
  cropIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#EBFCE7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  cropEmoji: {
    fontSize: 24,
  },
  cropName: {
    fontSize: 12,
    textAlign: "center",
    color: Colors.textPrimary,
    lineHeight: 14,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "white",
  },
  filterButtonActive: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#21825C",
    gap: 4,
  },
  filterText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  filterTextActive: {
    fontSize: 14,
    color: "white",
    fontWeight: "500",
  },
  cropCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cropImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
  },
  cropInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  cropHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cropSeller: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  badge: {
    backgroundColor: "#EBFCE7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: "#21825C",
    fontWeight: "500",
  },
  cropPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  cropUnit: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  cropDate: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  priceAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priceAlertText: {
    fontSize: 12,
    color: "#FF4444",
    fontWeight: "500",
  },
  priceSummary: {
    flexDirection: "row",
    backgroundColor: "#F8F8F8",
    marginHorizontal: Spacing.lg,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  priceColumn: {
    flex: 1,
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#21825C",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#21825C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 24,
  },
})
