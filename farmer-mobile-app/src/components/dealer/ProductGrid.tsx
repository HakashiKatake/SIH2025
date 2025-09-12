import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { Product } from '../../types';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/DesignSystem';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  isLoading?: boolean;
  numColumns?: number;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onAddToCart,
  isLoading = false,
  numColumns = 2,
}) => {
  const getProductIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'crops': '🌾',
      'vegetables': '🥕',
      'fruits': '🍎',
      'grains': '🌾',
      'pulses': '🫘',
      'spices': '🌶️',
      'default': '🌱'
    };
    return icons[category] || icons.default;
  };

  const renderProductCard = ({ item: product }: { item: Product }) => (
    <TouchableOpacity 
      style={[
        styles.productCard,
        { width: numColumns === 2 ? '48%' : '100%' }
      ]}
      onPress={() => router.push(`/dealer/product-details?id=${product.id}`)}
    >
      <View style={styles.productHeader}>
        <View style={styles.productIcon}>
          <Text style={styles.productEmoji}>
            {getProductIcon(product.category)}
          </Text>
        </View>
        <View style={styles.sellerInfo}>
          <View style={styles.sellerRow}>
            <Text style={styles.sellerName} numberOfLines={1}>
              {product.sellerName}
            </Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedIcon}>✓</Text>
            </View>
          </View>
          <Text style={styles.sellerLocation} numberOfLines={1}>
            {product.location?.state || 'Location'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.productName} numberOfLines={1}>
        {product.name}
      </Text>
      <Text style={styles.productDescription} numberOfLines={2}>
        {product.description}
      </Text>
      
      <View style={styles.productFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            ₹{product.price || product.pricePerUnit}
          </Text>
          <Text style={styles.unit}>/{product.unit}</Text>
        </View>
        <Text style={styles.quantity}>
          {product.quantity} {product.unit} available
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.addToCartButton}
        onPress={(e) => {
          e.stopPropagation();
          onAddToCart(product);
        }}
      >
        <Text style={styles.addToCartText}>Add to cart</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>🛒</Text>
      <Text style={styles.emptyStateTitle}>No products available</Text>
      <Text style={styles.emptyStateDescription}>
        Check back later for new products from farmers
      </Text>
    </View>
  );

  if (products.length === 0 && !isLoading) {
    return renderEmptyState();
  }

  return (
    <FlatList
      data={products}
      renderItem={renderProductCard}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      columnWrapperStyle={numColumns === 2 ? styles.row : undefined}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing['2xl'],
  },
  row: {
    justifyContent: 'space-between',
  },
  separator: {
    height: Spacing.lg,
  },
  productCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  productIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  productEmoji: {
    fontSize: 20,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  sellerName: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.medium,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.xs,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedIcon: {
    fontSize: 10,
    color: Colors.textInverse,
    fontWeight: Typography.bold,
  },
  sellerLocation: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
  },
  productName: {
    fontSize: Typography.bodyLarge,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  productDescription: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: Spacing.md,
  },
  productFooter: {
    marginBottom: Spacing.md,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.xs,
  },
  price: {
    fontSize: Typography.bodyLarge,
    fontWeight: Typography.bold,
    color: Colors.primary,
  },
  unit: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  quantity: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
  },
  addToCartButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  addToCartText: {
    color: Colors.textInverse,
    fontSize: Typography.bodyMedium,
    fontWeight: Typography.medium,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
    paddingHorizontal: Spacing.lg,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  emptyStateTitle: {
    fontSize: Typography.headingSmall,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});