import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, ComponentSizes, BorderRadius } from '../../constants/DesignSystem';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  onBackPress?: () => void;
  backgroundColor?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  rightComponent,
  onBackPress,
  backgroundColor = Colors.primary,
}) => {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackPress}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color={Colors.textInverse} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.centerSection}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>
      
      <View style={styles.rightSection}>
        {rightComponent}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ComponentSizes.header.paddingHorizontal,
    height: ComponentSizes.header.height,
    backgroundColor: Colors.primary,
  },
  leftSection: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  rightSection: {
    width: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: Typography.headingSmall,
    fontWeight: Typography.semibold,
    color: Colors.textInverse,
    textAlign: 'center',
  },
});