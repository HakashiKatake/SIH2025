import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaContainer } from "../../../src/components/ui/SafeAreaContainer";
import { Header } from "../../../src/components/ui/Header";
import { ActionButton } from "../../../src/components/ui/ActionButton";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
} from "../../../src/constants/DesignSystem";
import { useFieldStore } from "../../../src/store/fieldStore";
import { useAuthStore } from "../../../src/store/authStore";
import FieldDashboard from "../../../src/components/field/FieldDashboard";
import AddField from "../../../src/components/field/AddField";
import CropManagement from "../../../src/components/field/CropManagement";
import { MyCropsList } from "../../../src/components/field/MyCropsList";
import CropCalendar from "../../../src/components/field/CropCalendar";
import CropSafetyTest from "../../../src/components/field/CropSafetyTest";
import MRLCalculator from "../../../src/components/field/MRLCalculator";
import PrecisionResourceOptimizer from "../../../src/components/field/PrecisionResourceOptimizer";

export default function FarmerField() {
  const { loadCachedData, loadFields, loadCrops, fields, crops } =
    useFieldStore();
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddField, setShowAddField] = useState(false);
  const [showCropManagement, setShowCropManagement] = useState(false);
  const [showMRLCalculator, setShowMRLCalculator] = useState(false);
  const [showResourceOptimizer, setShowResourceOptimizer] = useState(false);
  const [selectedCropId, setSelectedCropId] = useState<string | undefined>();

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Load cached data first
        await loadCachedData();

        // If we have a token, try to load fresh data from API
        if (token) {
          await loadFields(token);
          await loadCrops(token);
        }
      } catch (error) {
        console.error("Error loading field data:", error);
        // Fallback to cached data is handled in the store
      }
    };

    initializeData();
  }, [loadCachedData, loadFields, loadCrops, token]);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "grid-outline" },
    { id: "my-crops", label: "My Crops", icon: "leaf-outline" },
    { id: "calendar", label: "Calendar", icon: "calendar-outline" },
    { id: "safety", label: "Safety", icon: "shield-checkmark-outline" },
  ];

  const handleCropPress = (cropId: string) => {
    router.push(`/crop-details?cropId=${cropId}`);
  };

  const handleAddField = () => {
    setShowAddField(true);
  };

  const handleManageCrop = (cropId: string) => {
    setSelectedCropId(cropId);
    setShowCropManagement(true);
  };

  const handleAddCrop = () => {
    setSelectedCropId(undefined);
    setShowCropManagement(true);
  };

  const handleMRLCalculator = () => {
    setShowMRLCalculator(true);
  };

  const handleResourceOptimizer = () => {
    setShowResourceOptimizer(true);
  };

  const handleViewCalendar = () => {
    setActiveTab("calendar");
  };

  const handleSafetyTest = () => {
    setActiveTab("safety");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <FieldDashboard
            onAddField={handleAddField}
            onManageCrop={handleManageCrop}
            onViewCalendar={handleViewCalendar}
            onMRLCalculator={handleMRLCalculator}
            onResourceOptimizer={handleResourceOptimizer}
            onSafetyTest={handleSafetyTest}
          />
        );
      case "my-crops":
        return (
          <MyCropsList
            onAddCrop={handleAddCrop}
            onCropPress={handleCropPress}
          />
        );
      case "calendar":
        return <CropCalendar inline={true} />;
      case "safety":
        return <CropSafetyTest inline={true} />;
      default:
        return (
          <FieldDashboard
            onAddField={handleAddField}
            onManageCrop={handleManageCrop}
            onViewCalendar={handleViewCalendar}
            onMRLCalculator={handleMRLCalculator}
            onResourceOptimizer={handleResourceOptimizer}
            onSafetyTest={handleSafetyTest}
          />
        );
    }
  };

  return (
    <SafeAreaContainer backgroundColor={Colors.background}>
      <Header
        title="My Field"
        showBackButton={false}
        backgroundColor={Colors.surface}
        // rightComponent={
        //   <TouchableOpacity
        //     onPress={handleAddField}
        //     style={styles.headerButton}
        //   >
        //     <Ionicons name="add" size={24} color={Colors.primary} />
        //   </TouchableOpacity>
        // }
      />

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon as any}
                size={20}
                color={
                  activeTab === tab.id
                    ? Colors.textInverse
                    : Colors.textSecondary
                }
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View style={styles.contentContainer}>{renderTabContent()}</View>

      {/* Add Field Modal */}
      <AddField visible={showAddField} onClose={() => setShowAddField(false)} />

      {/* Crop Management Modal */}
      <CropManagement
        visible={showCropManagement}
        onClose={() => {
          setShowCropManagement(false);
          setSelectedCropId(undefined);
        }}
        cropId={selectedCropId}
      />

      {/* MRL Calculator Modal */}
      <MRLCalculator
        visible={showMRLCalculator}
        onClose={() => setShowMRLCalculator(false)}
      />

      {/* Precision Resource Optimizer Modal */}
      <PrecisionResourceOptimizer
        visible={showResourceOptimizer}
        onClose={() => setShowResourceOptimizer(false)}
      />
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSecondary,
  },
  tabContainer: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabScrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    minWidth: 100,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabIcon: {
    marginRight: Spacing.xs,
  },
  tabText: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  activeTabText: {
    color: Colors.textInverse,
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
  },
});
