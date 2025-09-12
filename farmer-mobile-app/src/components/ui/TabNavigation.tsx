import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from "react-native";
import {
  Colors,
  Typography,
  Spacing,
  ComponentSizes,
  Shadows,
} from "../../constants/DesignSystem";

interface Tab {
  id: string;
  label: string;
  active?: boolean;
  badge?: number;
}

interface TabNavigationProps {
  tabs: Tab[];
  onTabPress: (tabId: string) => void;
  scrollable?: boolean;
  variant?: "default" | "pills" | "underline";
  backgroundColor?: string;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  onTabPress,
  scrollable = false,
  variant = "underline",
  backgroundColor = Colors.surface,
}) => {
  const getContainerStyle = () => [
    styles.container,
    { backgroundColor },
    variant === "underline" && styles.underlineContainer,
    variant === "pills" && styles.pillsContainer,
  ];

  const TabContent = () => (
    <View style={getContainerStyle()}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            variant === "pills" && styles.pillTab,
            tab.active && variant === "pills" && styles.activePillTab,
            !scrollable && styles.flexTab,
          ]}
          onPress={() => onTabPress(tab.id)}
          activeOpacity={0.8}
        >
          <View style={styles.tabContent}>
            <Text
              style={[
                styles.tabText,
                tab.active && styles.activeTabText,
                variant === "pills" && tab.active && styles.activePillTabText,
              ]}
            >
              {tab.label}
            </Text>
            {tab.badge && tab.badge > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {tab.badge > 99 ? "99+" : tab.badge}
                </Text>
              </View>
            )}
          </View>
          {tab.active && variant === "underline" && (
            <Animated.View style={styles.activeIndicator} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.scrollContainer, { backgroundColor }]}
        contentContainerStyle={styles.scrollContent}
      >
        <TabContent />
      </ScrollView>
    );
  }

  return <TabContent />;
};

const styles = StyleSheet.create({
  scrollContainer: {
    backgroundColor: Colors.surface,
  },
  scrollContent: {
    paddingHorizontal: Spacing.sm,
  },
  container: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
  },
  underlineContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pillsContainer: {
    paddingHorizontal: Spacing.lg,
  },
  tab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
    position: "relative",
    minHeight: ComponentSizes.tab.height,
  },
  flexTab: {
    flex: 1,
  },
  pillTab: {
    borderRadius: 20,
    marginHorizontal: Spacing.xs,
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    minHeight: 36,
  },
  activePillTab: {
    backgroundColor: Colors.primary,
    ...Shadows.sm,
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: Typography.bodyMedium,
    fontWeight: Typography.medium,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: Typography.semibold,
  },
  activePillTabText: {
    color: Colors.textInverse,
    fontWeight: Typography.semibold,
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    left: Spacing.sm,
    right: Spacing.sm,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  badge: {
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  badgeText: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.semibold,
    color: Colors.textInverse,
  },
});
