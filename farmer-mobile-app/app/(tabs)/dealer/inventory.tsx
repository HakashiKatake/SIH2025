import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

export default function DealerInventory() {
  return (
    <ScrollView className="flex-1 bg-blue-50">
      <View className="p-6">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-blue-800 mb-2">
            Inventory Management
          </Text>
          <Text className="text-blue-600">
            Track and manage your crop inventory
          </Text>
        </View>

        {/* Inventory Overview */}
        <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Inventory Overview
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">0</Text>
              <Text className="text-gray-600">Total Items</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-600">₹0</Text>
              <Text className="text-gray-600">Total Value</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-orange-600">0</Text>
              <Text className="text-gray-600">Low Stock</Text>
            </View>
          </View>
        </View>

        {/* Add New Item */}
        <TouchableOpacity className="bg-blue-600 p-4 rounded-lg mb-6">
          <Text className="text-white text-center font-semibold text-lg">
            + Add New Item
          </Text>
        </TouchableOpacity>

        {/* Current Inventory */}
        <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Current Inventory
          </Text>
          <Text className="text-gray-600 text-center py-8">
            No items in inventory. Add your first item to get started!
          </Text>
        </View>

        {/* Low Stock Alerts */}
        <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Low Stock Alerts
          </Text>
          <Text className="text-gray-600 text-center py-8">
            No low stock alerts
          </Text>
        </View>

        {/* Inventory Categories */}
        <View className="bg-white rounded-lg p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Categories
          </Text>
          <View className="flex-row flex-wrap">
            {['Grains', 'Vegetables', 'Fruits', 'Pulses', 'Spices', 'Others'].map((category, index) => (
              <TouchableOpacity 
                key={index}
                className="bg-blue-100 px-4 py-2 rounded-full mr-2 mb-2"
              >
                <Text className="text-blue-800">{category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}