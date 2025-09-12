import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaContainer } from '../../src/components/ui/SafeAreaContainer';
import { Header } from '../../src/components/ui/Header';
import { IllustrationPlaceholder } from '../../src/components/ui/IllustrationPlaceholder';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout } from '../../src/constants/DesignSystem';

export default function ProductDetails() {
  const [quantity, setQuantity] = useState(1);

  const product = {
    id: '1',
    name: 'Premium Wheat',
    price: 25000,
    seller: {
      name: 'Prasad Singh',
      description: 'A simple hardworking farmer, grows grains, clean and well-dried.',
      verified: true,
      avatar: 'farmer',
    },
    images: [
      { id: 1, alt: 'Wheat grain close-up' },
      { id: 2, alt: 'Wheat field view' },
      { id: 3, alt: 'Harvested wheat' },
      { id: 4, alt: 'Wheat quality check' },
    ],
    features: [
      { id: 1, name: 'Quality', icon: 'checkmark-circle' },
      { id: 2, name: 'Organic', icon: 'leaf' },
      { id: 3, name: 'Fresh', icon: 'heart' },
      { id: 4, name: 'Fast Delivery', icon: 'flash' },
    ],
    quantityOptions: ['1 tonne', '2 tonnes', '5 tonnes', '10 tonnes'],
  };

  const reviews = [
    {
      id: 1,
      author: 'Mahindra Sinha',
      rating: 5,
      comment: 'The wheat is freshly harvested, great grains, clean and well dried. Good quality for making flour.',
      verified: true,
    },
    {
      id: 2,
      author: 'Saraswati Gomti',
      rating: 4,
      comment: 'This wheat is first rate! Has been the best I have got when properly, will buy again and would recommend.',
      verified: true,
    },
  ];

  const handleAddToCart = () => {
    // TODO: Connect to cart API
    router.push('/dealer/cart');
  };

  const handleQuantityChange = (newQuantity: string) => {
    // TODO: Update quantity state
    console.log('Quantity changed to:', newQuantity);
  };

  return (
    <SafeAreaContainer backgroundColor={Colors.background}>
      <Header 
        title="Market Place" 
        showBackButton 
        backgroundColor={Colors.surface}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Seller Profile */}
        <View style={styles.sellerCard}>
          <View style={styles.sellerHeader}>
            <IllustrationPlaceholder
              width={48}
              height={48}
              borderRadius={24}
              backgroundColor={Colors.farmerBg}
              alt="Farmer"
              showBrokenIcon={false}
            />
            <View style={styles.sellerInfo}>
              <View style={styles.sellerNameRow}>
                <Text style={styles.sellerName}>{product.seller.name}</Text>
                {product.seller.verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                  </View>
                )}
              </View>
              <Text style={styles.sellerDescription}>
                {product.seller.description}
              </Text>
            </View>
          </View>
        </View>

        {/* Product Images Grid (2x2) */}
        <View style={styles.imageGrid}>
          <View style={styles.imageRow}>
            {product.images.slice(0, 2).map((image) => (
              <IllustrationPlaceholder
                key={image.id}
                width={(Layout.screenPadding * 2 + Layout.gridGap) / 2}
                height={120}
                borderRadius={BorderRadius.lg}
                backgroundColor={Colors.cropBg}
                alt={image.alt}
                style={styles.productImage}
              />
            ))}
          </View>
          <View style={styles.imageRow}>
            {product.images.slice(2, 4).map((image) => (
              <IllustrationPlaceholder
                key={image.id}
                width={(Layout.screenPadding * 2 + Layout.gridGap) / 2}
                height={120}
                borderRadius={BorderRadius.lg}
                backgroundColor={Colors.cropBg}
                alt={image.alt}
                style={styles.productImage}
              />
            ))}
          </View>
        </View>

        {/* Price Display */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{product.price.toLocaleString()}</Text>
        </View>

        {/* Quantity Selector */}
        <View style={styles.quantityCard}>
          <Text style={styles.quantityLabel}>Quantity: {product.quantityOptions[0]}</Text>
          <TouchableOpacity 
            style={styles.quantityDropdown}
            onPress={() => handleQuantityChange(product.quantityOptions[1])}
          >
            <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}>Add to cart</Text>
        </TouchableOpacity>

        {/* Feature Badges */}
        <View style={styles.featuresContainer}>
          {product.features.map((feature) => (
            <View key={feature.id} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons 
                  name={feature.icon as any} 
                  size={20} 
                  color={Colors.primary} 
                />
              </View>
              <Text style={styles.featureText}>{feature.name}</Text>
            </View>
          ))}
        </View>

        {/* Customer Reviews */}
        <View style={styles.reviewsContainer}>
          <Text style={styles.reviewsTitle}>Customer Reviews</Text>
          
          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>
                    {review.author.charAt(0)}
                  </Text>
                </View>
                <View style={styles.reviewInfo}>
                  <View style={styles.reviewNameRow}>
                    <Text style={styles.reviewAuthor}>{review.author}</Text>
                    {review.verified && (
                      <Ionicons 
                        name="checkmark-circle" 
                        size={12} 
                        color={Colors.primary} 
                        style={styles.reviewVerified}
                      />
                    )}
                  </View>
                  <View style={styles.reviewRating}>
                    {[...Array(5)].map((_, i) => (
                      <Ionicons
                        key={i}
                        name={i < review.rating ? "star" : "star-outline"}
                        size={12}
                        color={i < review.rating ? Colors.warning : Colors.textTertiary}
                        style={styles.star}
                      />
                    ))}
                  </View>
                </View>
              </View>
              <Text style={styles.reviewText}>{review.comment}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: Layout.screenPadding,
  },
  sellerCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Layout.cardPadding,
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sellerInfo: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  sellerName: {
    fontSize: Typography.bodyLarge,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginRight: Spacing.sm,
  },
  verifiedBadge: {
    marginLeft: Spacing.xs,
  },
  sellerDescription: {
    fontSize: Typography.bodyMedium,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  imageGrid: {
    marginBottom: Spacing.xl,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.gridGap,
  },
  productImage: {
    flex: 1,
    marginHorizontal: Layout.gridGap / 2,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  price: {
    fontSize: 32,
    fontWeight: Typography.bold,
    color: Colors.primary,
  },
  quantityCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Layout.cardPadding,
    marginBottom: Spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Shadows.md,
  },
  quantityLabel: {
    fontSize: Typography.bodyLarge,
    color: Colors.textPrimary,
    fontWeight: Typography.medium,
  },
  quantityDropdown: {
    padding: Spacing.sm,
  },
  addToCartButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Layout.cardPadding,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  addToCartText: {
    color: Colors.textInverse,
    fontSize: Typography.headingSmall,
    fontWeight: Typography.semibold,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.cropBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  featureText: {
    fontSize: Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: Typography.medium,
  },
  reviewsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Layout.cardPadding,
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  reviewsTitle: {
    fontSize: Typography.headingSmall,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginBottom: Layout.cardPadding,
  },
  reviewCard: {
    marginBottom: Layout.cardPadding,
    paddingBottom: Layout.cardPadding,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  reviewAvatarText: {
    color: Colors.textInverse,
    fontSize: Typography.bodyMedium,
    fontWeight: Typography.semibold,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  reviewAuthor: {
    fontSize: Typography.bodyMedium,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginRight: Spacing.xs,
  },
  reviewVerified: {
    marginLeft: Spacing.xs,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  star: {
    marginRight: 2,
  },
  reviewText: {
    fontSize: Typography.bodyMedium,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});