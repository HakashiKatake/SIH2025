import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { useFieldStore } from "../../store/fieldStore";
import { useAuthStore } from "../../store/authStore";
import { CropStage } from "../../types";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
} from "../../constants/DesignSystem";
import { useTranslation } from "../../hooks/useTranslation";

interface FieldDashboardProps {
  onAddField: () => void;
  onManageCrop: (cropId: string) => void;
  onViewCalendar: () => void;
  onMRLCalculator: () => void;
  onSafetyTest: () => void;
  onResourceOptimizer: () => void;
}

export default function FieldDashboard({
  onAddField,
  onManageCrop,
  onViewCalendar,
  onMRLCalculator,
  onSafetyTest,
  onResourceOptimizer,
}: FieldDashboardProps) {
  const { t } = useTranslation();
  const { user, token } = useAuthStore();
  const {
    fields,
    crops,
    getActiveCrops,
    getCropsNeedingAttention,
    deleteField,
  } = useFieldStore();

  const activeCrops = getActiveCrops();
  const cropsNeedingAttention = getCropsNeedingAttention();

  const handleDeleteField = (fieldId: string, fieldName: string) => {
    Alert.alert(
      "Delete Field",
      `Are you sure you want to delete "${fieldName}"? This will also remove all crops in this field.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteField(fieldId, token || ""),
        },
      ]
    );
  };

  const getCropStageColor = (stage: CropStage) => {
    switch (stage) {
      case CropStage.PLANTED:
        return { backgroundColor: "#FEF3C7", color: "#92400E" };
      case CropStage.GERMINATION:
        return { backgroundColor: "#D1FAE5", color: "#065F46" };
      case CropStage.VEGETATIVE:
        return { backgroundColor: "#DBEAFE", color: "#1E40AF" };
      case CropStage.FLOWERING:
        return { backgroundColor: "#E9D5FF", color: "#7C2D12" };
      case CropStage.FRUITING:
        return { backgroundColor: "#FED7AA", color: "#9A3412" };
      case CropStage.MATURITY:
        return { backgroundColor: "#FECACA", color: "#991B1B" };
      case CropStage.HARVESTED:
        return { backgroundColor: "#F3F4F6", color: "#374151" };
      default:
        return { backgroundColor: "#F3F4F6", color: "#374151" };
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Farm Overview */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{t('field.farmOverview')}</Text>
          <TouchableOpacity onPress={onAddField} style={styles.addButton}>
            <Text style={styles.addButtonText}>{t('field.addField')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>{t('field.totalFields')}</Text>
            <Text style={[styles.statValue, { color: Colors.success }]}>
              {fields.length}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>{t('field.activeCrops')}</Text>
            <Text style={[styles.statValue, { color: Colors.info }]}>
              {activeCrops.length}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>{t('field.farmSize')}</Text>
            <Text style={[styles.statValue, { color: Colors.warning }]}>
              {(user?.profile as any)?.farmSize || 0} acres
            </Text>
          </View>
        </View>
      </View>

      {/* Attention Required */}
      {cropsNeedingAttention.length > 0 && (
        <View style={styles.attentionCard}>
          <Text style={styles.attentionTitle}>⚠️ Attention Required</Text>
          {cropsNeedingAttention.map((crop) => (
            <TouchableOpacity
              key={crop.id}
              onPress={() => onManageCrop(crop.id)}
              style={styles.attentionItem}
            >
              <Text style={styles.attentionItemTitle}>{crop.name}</Text>
              <Text style={styles.attentionItemSubtitle}>
                Harvest approaching or safety period ending soon
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Fields List */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>My Fields</Text>
        </View>

        {fields.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No fields added yet. Add your first field to get started!
            </Text>
            <TouchableOpacity onPress={onAddField} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Add First Field</Text>
            </TouchableOpacity>
          </View>
        ) : (
          fields.map((field) => {
            const fieldCrops = crops.filter(
              (crop) => crop.fieldId === field.id
            );
            return (
              <View key={field.id} style={styles.fieldItem}>
                <View style={styles.fieldHeader}>
                  <View style={styles.fieldInfo}>
                    <Text style={styles.fieldName}>{field.name}</Text>
                    <Text style={styles.fieldDetails}>
                      {field.size} acres • {field.soilType}
                    </Text>
                    <Text style={styles.fieldLocation}>
                      {field.location.address}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteField(field.id, field.name)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>

                {fieldCrops.length > 0 ? (
                  <View style={styles.cropsSection}>
                    <Text style={styles.cropsSectionTitle}>
                      Crops ({fieldCrops.length}):
                    </Text>
                    {fieldCrops.map((crop) => {
                      const stageColors = getCropStageColor(crop.currentStage);
                      return (
                        <TouchableOpacity
                          key={crop.id}
                          onPress={() => onManageCrop(crop.id)}
                          style={styles.cropItem}
                        >
                          <View style={styles.cropInfo}>
                            <Text style={styles.cropName}>
                              {crop.name} ({crop.variety})
                            </Text>
                            <Text style={styles.cropDate}>
                              Planted: {formatDate(crop.plantingDate)}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.stageBadge,
                              { backgroundColor: stageColors.backgroundColor },
                            ]}
                          >
                            <Text
                              style={[
                                styles.stageBadgeText,
                                { color: stageColors.color },
                              ]}
                            >
                              {crop.currentStage.replace("_", " ")}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={styles.noCropsText}>
                    No crops planted in this field yet
                  </Text>
                )}
              </View>
            );
          })
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Field Management Tools</Text>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={onViewCalendar}
            style={[styles.actionButton, { backgroundColor: "#DBEAFE" }]}
          >
            <Text style={[styles.actionTitle, { color: "#1E40AF" }]}>
              📅 Field Calendar
            </Text>
            <Text style={[styles.actionSubtitle, { color: "#3B82F6" }]}>
              View and manage farming activities timeline
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onMRLCalculator}
            style={[styles.actionButton, { backgroundColor: "#FED7AA" }]}
          >
            <Text style={[styles.actionTitle, { color: "#9A3412" }]}>
              🧪 MRL Calculator
            </Text>
            <Text style={[styles.actionSubtitle, { color: "#EA580C" }]}>
              Calculate safe harvesting periods for your crops
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onResourceOptimizer}
            style={[styles.actionButton, { backgroundColor: "#DBEAFE" }]}
          >
            <Text style={[styles.actionTitle, { color: "#1E40AF" }]}>
              🚀 Precision Resource Optimizer
            </Text>
            <Text style={[styles.actionSubtitle, { color: "#3B82F6" }]}>
              AI-powered optimization for water, fertilizer, and pesticide usage
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onSafetyTest}
            style={[styles.actionButton, { backgroundColor: "#FECACA" }]}
          >
            <Text style={[styles.actionTitle, { color: "#991B1B" }]}>
              🔍 Crop Safety Test
            </Text>
            <Text style={[styles.actionSubtitle, { color: "#DC2626" }]}>
              Check if your crops are safe to harvest
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontSize: Typography.headingSmall,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  addButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  addButtonText: {
    color: Colors.textInverse,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: Typography.headingMedium,
    fontWeight: "bold",
  },
  attentionCard: {
    backgroundColor: "#FEF3C7",
    borderColor: "#F59E0B",
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  attentionTitle: {
    fontSize: Typography.headingSmall,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: Spacing.sm,
  },
  attentionItem: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderColor: "#F59E0B",
    borderWidth: 1,
  },
  attentionItemTitle: {
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  attentionItemSubtitle: {
    fontSize: Typography.bodySmall,
    color: "#D97706",
  },
  emptyState: {
    paddingVertical: Spacing.xl * 2,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  primaryButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  primaryButtonText: {
    color: Colors.textInverse,
    fontWeight: "500",
  },
  fieldItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  fieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  fieldInfo: {
    flex: 1,
  },
  fieldName: {
    fontSize: Typography.headingSmall,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  fieldDetails: {
    fontSize: Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  fieldLocation: {
    fontSize: Typography.bodySmall,
    color: Colors.textTertiary,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
  deleteButtonText: {
    fontSize: 18,
  },
  cropsSection: {
    marginTop: Spacing.sm,
  },
  cropsSectionTitle: {
    fontSize: Typography.bodySmall,
    fontWeight: "500",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  cropItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  cropDate: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
  },
  stageBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  stageBadgeText: {
    fontSize: Typography.bodySmall,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  noCropsText: {
    fontSize: Typography.bodySmall,
    color: Colors.textTertiary,
    fontStyle: "italic",
  },
  actionsContainer: {
    marginTop: Spacing.lg,
  },
  actionButton: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  actionTitle: {
    fontSize: Typography.headingSmall,
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  actionSubtitle: {
    fontSize: Typography.bodyMedium,
  },
});
