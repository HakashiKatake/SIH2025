import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useMarketplaceStore } from '../../../src/store/marketplaceStore';
import { useAuthStore } from '../../../src/store/authStore';
import { ProductListing, Product } from '../../../src/types';
import { LoadingSpinner } from '../../../src/components/LoadingSpinner';

export default function EditProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [formData, setFormData] = useState<ProductListing>({
    name: '',
    category: 'crops',
    price: 0,
    quantity: 0,
    unit: 'kg',
    description: '',
    images: [],
  });
  
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  
  const { myListings, updateListing, isCreating } = useMarketplaceStore();
  const { token } = useAuthStore();

  const categories = [
    { value: 'crops', label: 'Crops', icon: '🌾' },
    { value: 'seeds', label: 'Seeds', icon: '🌱' },
    { value: 'tools', label: 'Tools', icon: '🔧' },
    { value: 'fertilizers', label: 'Fertilizers', icon: '🧪' },
  ];

  const units = ['kg', 'quintal', 'ton', 'piece', 'bag', 'liter'];

  useEffect(() => {
    if (id && myListings.length > 0) {
      const product = myListings.find(p => p.id === id);
      if (product) {
        setFormData({
          name: product.name,
          category: product.category as any,
          price: product.pricePerUnit || product.price,
          quantity: product.quantity,
          unit: product.unit,
          description: product.description,
          images: product.photos || product.images,
        });
      }
      setLoading(false);
    }
  }, [id, myListings]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    
    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    
    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to add photos.');
        return;
      }

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
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors and try again.');
      return;
    }

    if (!token || !id) {
      Alert.alert('Error', 'Missing required information.');
      return;
    }

    try {
      await updateListing(id, formData, token);
      Alert.alert('Success', 'Product listing updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update listing. Please try again.');
    }
  };

  const selectedCategory = categories.find(cat => cat.value === formData.category);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isCreating) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-green-600 px-6 py-8">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Text className="text-white text-lg">←</Text>
          </TouchableOpacity>
          <View>
            <Text className="text-white text-2xl font-bold">Edit Product</Text>
            <Text className="text-green-100">Update your listing</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Product Images */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-3">Product Photos</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-3">
              {/* Add Photo Button */}
              <TouchableOpacity 
                className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center"
                onPress={pickImage}
              >
                <Text className="text-gray-400 text-2xl">+</Text>
                <Text className="text-gray-400 text-xs text-center">Add Photo</Text>
              </TouchableOpacity>
              
              {/* Existing Photos */}
              {formData.images.map((uri, index) => (
                <View key={index} className="relative">
                  <Image 
                    source={{ uri }} 
                    className="w-24 h-24 rounded-lg"
                    resizeMode="cover"
                  />
                  <TouchableOpacity 
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                    onPress={() => removeImage(index)}
                  >
                    <Text className="text-white text-xs">×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Product Name */}
        <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-2">Product Name *</Text>
          <TextInput
            className={`border rounded-lg px-3 py-3 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter product name (e.g., Fresh Tomatoes)"
            value={formData.name}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, name: text }));
              if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
            }}
          />
          {errors.name && <Text className="text-red-500 text-sm mt-1">{errors.name}</Text>}
        </View>

        {/* Category */}
        <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-2">Category *</Text>
          <TouchableOpacity 
            className="border border-gray-300 rounded-lg px-3 py-3 flex-row items-center justify-between"
            onPress={() => setShowCategoryModal(true)}
          >
            <View className="flex-row items-center">
              <Text className="text-lg mr-2">{selectedCategory?.icon}</Text>
              <Text className="text-gray-800">{selectedCategory?.label}</Text>
            </View>
            <Text className="text-gray-400">▼</Text>
          </TouchableOpacity>
        </View>

        {/* Price and Quantity */}
        <View className="flex-row space-x-4 mb-4">
          <View className="flex-1">
            <Text className="text-gray-700 font-semibold mb-2">Price per Unit *</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg">
              <Text className="px-3 text-gray-600">₹</Text>
              <TextInput
                className={`flex-1 py-3 ${errors.price ? 'border-red-500' : ''}`}
                placeholder="0"
                keyboardType="numeric"
                value={formData.price > 0 ? formData.price.toString() : ''}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, price: parseFloat(text) || 0 }));
                  if (errors.price) setErrors(prev => ({ ...prev, price: '' }));
                }}
              />
            </View>
            {errors.price && <Text className="text-red-500 text-sm mt-1">{errors.price}</Text>}
          </View>
          
          <View className="flex-1">
            <Text className="text-gray-700 font-semibold mb-2">Quantity *</Text>
            <TextInput
              className={`border rounded-lg px-3 py-3 ${errors.quantity ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="0"
              keyboardType="numeric"
              value={formData.quantity > 0 ? formData.quantity.toString() : ''}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, quantity: parseFloat(text) || 0 }));
                if (errors.quantity) setErrors(prev => ({ ...prev, quantity: '' }));
              }}
            />
            {errors.quantity && <Text className="text-red-500 text-sm mt-1">{errors.quantity}</Text>}
          </View>
        </View>

        {/* Unit */}
        <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-2">Unit *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-2">
              {units.map((unit) => (
                <TouchableOpacity
                  key={unit}
                  className={`px-4 py-2 rounded-full border ${
                    formData.unit === unit
                      ? 'bg-green-600 border-green-600'
                      : 'bg-white border-gray-300'
                  }`}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, unit }));
                    if (errors.unit) setErrors(prev => ({ ...prev, unit: '' }));
                  }}
                >
                  <Text className={`${
                    formData.unit === unit ? 'text-white' : 'text-gray-700'
                  }`}>
                    {unit}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          {errors.unit && <Text className="text-red-500 text-sm mt-1">{errors.unit}</Text>}
        </View>

        {/* Description */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-2">Description *</Text>
          <TextInput
            className={`border rounded-lg px-3 py-3 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Describe your product (quality, harvest date, etc.)"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={formData.description}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, description: text }));
              if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
            }}
          />
          {errors.description && <Text className="text-red-500 text-sm mt-1">{errors.description}</Text>}
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          className="bg-green-600 rounded-lg py-4 mb-8"
          onPress={handleSubmit}
          disabled={isCreating}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {isCreating ? 'Updating Listing...' : 'Update Listing'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Category Selection Modal */}
      <Modal visible={showCategoryModal} animationType="slide" transparent>
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-xl font-bold text-center mb-4">Select Category</Text>
            
            {categories.map((category) => (
              <TouchableOpacity
                key={category.value}
                className="flex-row items-center py-4 border-b border-gray-100"
                onPress={() => {
                  setFormData(prev => ({ ...prev, category: category.value as any }));
                  setShowCategoryModal(false);
                }}
              >
                <Text className="text-2xl mr-3">{category.icon}</Text>
                <Text className="text-lg text-gray-800">{category.label}</Text>
                {formData.category === category.value && (
                  <Text className="ml-auto text-green-600">✓</Text>
                )}
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              className="mt-4 py-3"
              onPress={() => setShowCategoryModal(false)}
            >
              <Text className="text-center text-gray-600">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}