import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout } from '../../constants/DesignSystem';
import { IllustrationPlaceholder } from '../ui/IllustrationPlaceholder';

interface CartItemProps {
  item: {
    productId: string;
    quantity: number;
    pricePerUnit: number;
    totalPrice: number;
    product: {
      id: string;
      name: string;
      description: string;
      sellerId: string;
      category?: string;
      unit?: string;
      images?: string[];
    };
  };
  onRemove: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

export function CartItem({ item, onRemove, onUpdateQuantity }: CartItemProps) {
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      // Show confirmation before removing item
      Alert.alert(
        "Remove Item",
        "Are you sure you want to remove this item from your cart?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => onRemove(item.productId),
          },
        ]
      );
    } else {
      onUpdateQuantity(item.productId, newQuantity);
    }
  };

  const handleRemovePress = () => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => onRemove(item.productId),
        },
      ]
    );
  };

  return (
    <View style={styles.cartItem}>
      <View style={styles.itemHeader}>
        {/* Product Image Placeholder */}
        <View style={styles.productImageContainer}>
          {item.product.images && item.product.images.length > 0 ? (
            <IllustrationPlaceholder
              width={56}
              height={56}
              borderRadius={BorderRadius.md}
              backgroundColor={Colors.cropBg}
              alt={`${item.product.name} image`}
            />
          ) : (
            <View style={styles.itemIcon}>
              <Ionicons name="leaf" size={24} color={Colors.primary} />
            </View>
          )}
        </View>
        
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.product.name}
          </Text>
          <Text style={styles.itemDescription} numberOfLines={2}>
            {item.product.description}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.itemPrice}>
              ₹{item.pricePerUnit.toLocaleString()}
            </Text>
            {item.product.unit && (
              <Text style={styles.itemUnit}>per {item.product.unit}</Text>
            )}
          </View>
          {item.product.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.product.category}</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={handleRemovePress}
          accessibilityLabel="Remove item from cart"
          accessibilityRole="button"
        >
          <Ionicons name="trash-outline" size={18} color={Colors.error} />
        </TouchableOpacity>
      </View>
      
      {/* Quantity Controls */}
      <View style={styles.quantityContainer}>
        <Text style={styles.quantityLabel}>Quantity:</Text>
        <View style={styles.quantityControls}>
          <TouchableOpacity 
            style={[
              styles.quantityButton,
              item.quantity <= 1 && styles.quantityButtonDisabled
            ]}
            onPress={() => handleQuantityChange(item.quantity - 1)}
            disabled={item.quantity <= 1}
            accessibilityLabel="Decrease quantity"
            accessibilityRole="button"
          >
            <Ionicons 
              name="remove" 
              size={16} 
              color={item.quantity <= 1 ? Colors.textTertiary : Colors.textSecondary} 
            />
          </TouchableOpacity>
          
          <View style={styles.quantityValueContainer}>
            <Text style={styles.quantityValue}>{item.quantity}</Text>
            {item.product.unit && (
              <Text style={styles.quantityUnit}>{item.product.unit}</Text>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.quantity + 1)}
            accessibilityLabel="Increase quantity"
            accessibilityRole="button"
          >
            <Ionicons name="add" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Item Total */}
      <View style={styles.itemFooter}>
        <View style={styles.itemTotal}>
          <Text style={styles.itemTotalLabel}>Subtotal:</Text>
          <Text style={styles.itemTotalText}>
            ₹{item.totalPrice.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cartItem: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Layout.cardPadding,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.md,
  },
  
  // Header Section
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  productImageContainer: {
    marginRight: Spacing.md,
  },
  itemIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  itemName: {
    fontSize: Typography.bodyLarge,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    lineHeight: 22,
  },
  itemDescription: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.xs,
  },
  itemPrice: {
    fontSize: Typography.bodyMedium,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  itemUnit: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.sm,
  },
  categoryText: {
    fontSize: Typography.bodySmall,
    color: Colors.primary,
    fontWeight: Typography.medium,
    textTransform: 'capitalize',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  
  // Quantity Controls
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  quantityLabel: {
    fontSize: Typography.bodyMedium,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  quantityButtonDisabled: {
    backgroundColor: Colors.surfaceSecondary,
    opacity: 0.5,
  },
  quantityValueContainer: {
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    minWidth: 40,
  },
  quantityValue: {
    fontSize: Typography.bodyLarge,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  quantityUnit: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  
  // Footer Section
  itemFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
  },
  itemTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTotalLabel: {
    fontSize: Typography.bodyMedium,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
  itemTotalText: {
    fontSize: Typography.headingSmall,
    fontWeight: Typography.bold,
    color: Colors.primary,
  },
});