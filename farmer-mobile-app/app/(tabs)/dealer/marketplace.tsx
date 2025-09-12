import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useMarketplaceStore } from '../../../src/store/marketplaceStore';
import { useCartStore } from '../../../src/store/cartStore';
import { useAuthStore } from '../../../src/store/authStore';
import { SafeAreaContainer } from '../../../src/components/ui/SafeAreaContainer';
import { Header } from '../../../src/components/ui/Header';
import { SearchBar } from '../../../src/components/ui/SearchBar';
import { LoadingSpinner } from '../../../src/components/LoadingSpinner';
import { ProductGrid } from '../../../src/components/dealer/ProductGrid';
import { Colors, Typography, Spacing } from '../../../src/constants/DesignSystem';

export default function DealerMarketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const { products, isLoading, searchProducts } = useMarketplaceStore();
  const { addToCart } = useCartStore();
  const { token } = useAuthStore();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    if (!token) return;
    
    try {
      await searchProducts({
        category: '',
        subcategory: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }, token);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    if (!token) return;
    
    try {
      await searchProducts({
        category: searchQuery,
        subcategory: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }, token);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const handleAddToCart = async (product: any) => {
    try {
      await addToCart({
        productId: product.id,
        quantity: 1,
        pricePerUnit: product.price || product.pricePerUnit,
      });
      
      // Navigate to cart or show success message
      router.push('/dealer/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sellerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading && products.length === 0) {
    return (
      <SafeAreaContainer>
        <Header 
          title="Marketplace" 
          showBackButton={false}
          rightComponent={
            <TouchableOpacity 
              style={styles.cartButton}
              onPress={() => router.push('/dealer/cart')}
            >
              <Text style={styles.cartIcon}>🛒</Text>
            </TouchableOpacity>
          }
        />
        <LoadingSpinner />
      </SafeAreaContainer>
    );
  }

  return (
    <SafeAreaContainer backgroundColor={Colors.background}>
      <Header 
        title="Marketplace" 
        showBackButton={false}
        rightComponent={
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => router.push('/dealer/cart')}
          >
            <Text style={styles.cartIcon}>🛒</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            placeholder="Search products or sellers"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmit={handleSearch}
            showMicIcon={true}
          />
        </View>

        {/* Product Grid */}
        <ProductGrid
          products={filteredProducts}
          onAddToCart={handleAddToCart}
          isLoading={isLoading}
          numColumns={2}
        />
      </View>
    </SafeAreaContainer>
  );
}



const styles = StyleSheet.create({
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartIcon: {
    fontSize: 18,
    color: Colors.textInverse,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  searchContainer: {
    paddingVertical: Spacing.lg,
  },
});