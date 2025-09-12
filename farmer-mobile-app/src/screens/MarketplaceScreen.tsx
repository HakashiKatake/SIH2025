import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  FlatList,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useMarketplaceStore } from '../store/marketplaceStore';
import { useAuthStore } from '../store/authStore';
import { Product, ProductListing, SearchFilters } from '../types';

export default function MarketplaceScreen() {
  const [activeTab, setActiveTab] = useState<'browse' | 'sell' | 'my-listings'>('browse');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const { 
    products, 
    myListings, 
    isLoading, 
    isCreating,
    searchProducts, 
    createListing, 
    getMyListings 
  } = useMarketplaceStore();
  
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (token) {
      // Load initial data
      searchProducts({}, token);
      getMyListings(token);
    }
  }, [token]);

  const handleSearch = () => {
    if (!token) return;
    
    const filters: SearchFilters = {};
    if (selectedCategory) filters.category = selectedCategory as any;
    if (user?.location) {
      filters.location = {
        latitude: user.location.latitude,
        longitude: user.location.longitude,
        radius: 50, // 50km radius
      };
    }
    
    searchProducts(filters, token);
  };

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'crops', label: 'Crops' },
    { value: 'seeds', label: 'Seeds' },
    { value: 'tools', label: 'Tools' },
    { value: 'fertilizers', label: 'Fertilizers' },
  ];

  const renderProduct = ({ item }: { item: Product }) => (
    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-100">
      {item.images.length > 0 && (
        <Image 
          source={{ uri: item.images[0] }} 
          className="w-full h-40 rounded-lg mb-3"
          resizeMode="cover"
        />
      )}
      <Text className="text-lg font-semibold text-gray-800 mb-1">{item.name}</Text>
      <Text className="text-green-600 font-bold text-xl mb-2">
        ₹{item.price}/{item.unit}
      </Text>
      <Text className="text-gray-600 mb-2">{item.description}</Text>
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-sm text-gray-500">Quantity: {item.quantity} {item.unit}</Text>
          <Text className="text-sm text-gray-500">Location: {item.location.district}</Text>
        </View>
        <View className="bg-blue-100 px-3 py-1 rounded-full">
          <Text className="text-blue-600 text-sm font-medium capitalize">
            {item.category}
          </Text>
        </View>
      </View>
      <TouchableOpacity className="bg-green-600 rounded-lg py-3 mt-3">
        <Text className="text-white text-center font-semibold">Contact Seller</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBrowseTab = () => (
    <View className="flex-1">
      {/* Search and Filters */}
      <View className="bg-white p-4 border-b border-gray-200">
        <View className="flex-row mb-3">
          <TextInput
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 mr-2"
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity 
            className="bg-green-600 rounded-lg px-4 py-2"
            onPress={handleSearch}
          >
            <Text className="text-white font-semibold">Search</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-2">
            {categories.map((category) => (
              <TouchableOpacity
                key={category.value}
                className={`px-4 py-2 rounded-full border ${
                  selectedCategory === category.value
                    ? 'bg-green-600 border-green-600'
                    : 'bg-white border-gray-300'
                }`}
                onPress={() => setSelectedCategory(category.value)}
              >
                <Text className={`${
                  selectedCategory === category.value ? 'text-white' : 'text-gray-700'
                } font-medium`}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Products List */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshing={isLoading}
        onRefresh={handleSearch}
        ListEmptyComponent={
          <View className="items-center py-8">
            <Text className="text-gray-500 text-lg">No products found</Text>
            <Text className="text-gray-400 text-center mt-2">
              Try adjusting your search or category filter
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderMyListingsTab = () => (
    <View className="flex-1">
      <View className="bg-white p-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-semibold">My Listings</Text>
          <TouchableOpacity 
            className="bg-green-600 rounded-lg px-4 py-2"
            onPress={() => setShowCreateModal(true)}
          >
            <Text className="text-white font-semibold">+ Add Product</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={myListings}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshing={isLoading}
        onRefresh={() => token && getMyListings(token)}
        ListEmptyComponent={
          <View className="items-center py-8">
            <Text className="text-gray-500 text-lg">No listings yet</Text>
            <Text className="text-gray-400 text-center mt-2">
              Create your first product listing to start selling
            </Text>
            <TouchableOpacity 
              className="bg-green-600 rounded-lg px-6 py-3 mt-4"
              onPress={() => setShowCreateModal(true)}
            >
              <Text className="text-white font-semibold">Create Listing</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-green-600 px-6 py-8">
        <Text className="text-white text-3xl font-bold">Marketplace</Text>
        <Text className="text-green-100 text-lg mt-2">
          Buy and sell farming products
        </Text>
      </View>

      {/* Tab Navigation */}
      <View className="bg-white border-b border-gray-200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row px-4">
            {[
              { key: 'browse', label: 'Browse' },
              { key: 'my-listings', label: 'My Listings' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                className={`py-4 px-6 border-b-2 ${
                  activeTab === tab.key
                    ? 'border-green-600'
                    : 'border-transparent'
                }`}
                onPress={() => setActiveTab(tab.key as any)}
              >
                <Text className={`font-semibold ${
                  activeTab === tab.key ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Tab Content */}
      {activeTab === 'browse' && renderBrowseTab()}
      {activeTab === 'my-listings' && renderMyListingsTab()}

      {/* Create Listing Modal */}
      <CreateListingModal 
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </View>
  );
}

function CreateListingModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState<ProductListing>({
    name: '',
    category: 'crops',
    price: 0,
    quantity: 0,
    unit: 'kg',
    description: '',
    images: [],
  });
  
  const { createListing, isCreating } = useMarketplaceStore();
  const { token } = useAuthStore();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, result.assets[0].uri],
      }));
    }
  };

  const handleSubmit = async () => {
    if (!token) return;
    
    if (!formData.name || !formData.price || !formData.quantity) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await createListing(formData, token);
      Alert.alert('Success', 'Product listing created successfully!');
      onClose();
      // Reset form
      setFormData({
        name: '',
        category: 'crops',
        price: 0,
        quantity: 0,
        unit: 'kg',
        description: '',
        images: [],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to create listing. Please try again.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-white">
        <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
          <TouchableOpacity onPress={onClose}>
            <Text className="text-blue-600 font-semibold">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold">Create Listing</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={isCreating}>
            <Text className={`font-semibold ${isCreating ? 'text-gray-400' : 'text-blue-600'}`}>
              {isCreating ? 'Creating...' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          <View className="space-y-4">
            <View>
              <Text className="text-gray-700 font-medium mb-2">Product Name *</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Enter product name"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              />
            </View>

            <View>
              <Text className="text-gray-700 font-medium mb-2">Category *</Text>
              <View className="flex-row flex-wrap gap-2">
                {['crops', 'seeds', 'tools', 'fertilizers'].map((category) => (
                  <TouchableOpacity
                    key={category}
                    className={`px-4 py-2 rounded-full border ${
                      formData.category === category
                        ? 'bg-green-600 border-green-600'
                        : 'bg-white border-gray-300'
                    }`}
                    onPress={() => setFormData(prev => ({ ...prev, category: category as any }))}
                  >
                    <Text className={`capitalize ${
                      formData.category === category ? 'text-white' : 'text-gray-700'
                    }`}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="flex-row space-x-4">
              <View className="flex-1">
                <Text className="text-gray-700 font-medium mb-2">Price *</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="0"
                  keyboardType="numeric"
                  value={formData.price.toString()}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, price: parseFloat(text) || 0 }))}
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 font-medium mb-2">Quantity *</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="0"
                  keyboardType="numeric"
                  value={formData.quantity.toString()}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, quantity: parseFloat(text) || 0 }))}
                />
              </View>
              <View className="w-20">
                <Text className="text-gray-700 font-medium mb-2">Unit</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="kg"
                  value={formData.unit}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, unit: text }))}
                />
              </View>
            </View>

            <View>
              <Text className="text-gray-700 font-medium mb-2">Description</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Describe your product..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              />
            </View>

            <View>
              <Text className="text-gray-700 font-medium mb-2">Images</Text>
              <TouchableOpacity 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 items-center"
                onPress={pickImage}
              >
                <Text className="text-gray-500 text-lg">📷</Text>
                <Text className="text-gray-500 mt-2">Tap to add photos</Text>
              </TouchableOpacity>
              
              {formData.images.length > 0 && (
                <ScrollView horizontal className="mt-3">
                  <View className="flex-row space-x-2">
                    {formData.images.map((uri, index) => (
                      <Image 
                        key={index}
                        source={{ uri }} 
                        className="w-20 h-20 rounded-lg"
                      />
                    ))}
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}