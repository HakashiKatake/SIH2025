import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, ComponentSizes, BorderRadius, Shadows } from '../../constants/DesignSystem';

interface ActionButtonProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  onPress,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}) => {
  const getIconColor = () => {
    if (disabled) return Colors.textTertiary;
    
    switch (variant) {
      case 'primary':
      case 'danger':
        return Colors.textInverse;
      case 'secondary':
        return Colors.primary;
      case 'outline':
        return Colors.primary;
      case 'ghost':
        return Colors.textSecondary;
      default:
        return Colors.primary;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 18;
      case 'large':
        return 20;
      default:
        return 18;
    }
  };

  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    loading && styles.loading,
    style,
  ];

  const textStyles = [
    styles.baseText,
    styles[`${variant}Text`] as TextStyle,
    styles[`${size}Text`] as TextStyle,
    disabled && styles.disabledText,
    textStyle,
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="small" 
            color={getIconColor()} 
          />
          <Text style={[textStyles, styles.loadingText]}>{title}</Text>
        </View>
      );
    }

    const iconElement = icon && (
      <Ionicons 
        name={icon} 
        size={getIconSize()} 
        color={getIconColor()}
        style={[
          iconPosition === 'left' ? styles.iconLeft : styles.iconRight
        ]}
      />
    );

    return (
      <>
        {iconPosition === 'left' && iconElement}
        <Text style={textStyles}>{title}</Text>
        {iconPosition === 'right' && iconElement}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    ...Shadows.sm,
  },
  primary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.primaryLighter,
    borderColor: Colors.primaryLight,
  },
  outline: {
    backgroundColor: Colors.surface,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  danger: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  small: {
    paddingHorizontal: ComponentSizes.button.small.paddingHorizontal,
    minHeight: ComponentSizes.button.small.height,
    paddingVertical: Spacing.sm,
  },
  medium: {
    paddingHorizontal: ComponentSizes.button.medium.paddingHorizontal,
    minHeight: ComponentSizes.button.medium.height,
    paddingVertical: Spacing.md,
  },
  large: {
    paddingHorizontal: ComponentSizes.button.large.paddingHorizontal,
    minHeight: ComponentSizes.button.large.height,
    paddingVertical: Spacing.lg,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    backgroundColor: Colors.surfaceSecondary,
    borderColor: Colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  loading: {
    opacity: 0.8,
  },
  baseText: {
    fontWeight: Typography.semibold,
    textAlign: 'center',
    includeFontPadding: false,
  },
  primaryText: {
    color: Colors.textInverse,
  },
  secondaryText: {
    color: Colors.primary,
  },
  outlineText: {
    color: Colors.primary,
  },
  ghostText: {
    color: Colors.textSecondary,
  },
  dangerText: {
    color: Colors.textInverse,
  },
  smallText: {
    fontSize: Typography.bodyMedium,
  },
  mediumText: {
    fontSize: Typography.bodyLarge,
  },
  largeText: {
    fontSize: Typography.headingSmall,
  },
  disabledText: {
    color: Colors.textTertiary,
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: Spacing.sm,
  },
});