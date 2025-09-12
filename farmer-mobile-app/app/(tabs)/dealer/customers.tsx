import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';

export default function DealerCustomers() {
  return (
    <ScrollView className="flex-1 bg-blue-50">
      <View className="p-6">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-blue-800 mb-2">
            Customer Management
          </Text>
          <Text className="text-blue-600">
            Manage your customer relationships
          </Text>
        </View>

        {/* Search Customers */}
        <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3"
            placeholder="Search customers..."
          />
        </View>

        {/* Customer Stats */}
        <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Customer Overview
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">0</Text>
              <Text className="text-gray-600">Total Customers</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-600">0</Text>
              <Text className="text-gray-600">Active</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-orange-600">0</Text>
              <Text className="text-gray-600">New This Month</Text>
            </View>
          </View>
        </View>

        {/* Add Customer */}
        <TouchableOpacity className="bg-blue-600 p-4 rounded-lg mb-6">
          <Text className="text-white text-center font-semibold text-lg">
            + Add New Customer
          </Text>
        </TouchableOpacity>

        {/* Customer List */}
        <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Customer List
          </Text>
          <Text className="text-gray-600 text-center py-8">
            No customers found. Add your first customer to get started!
          </Text>
        </View>

        {/* Customer Categories */}
        <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Customer Types
          </Text>
          <View className="flex-row flex-wrap">
            {['Retailers', 'Restaurants', 'Wholesalers', 'Exporters'].map((type, index) => (
              <TouchableOpacity 
                key={index}
                className="bg-blue-100 px-4 py-2 rounded-full mr-2 mb-2"
              >
                <Text className="text-blue-800">{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View className="bg-white rounded-lg p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Recent Customer Activity
          </Text>
          <Text className="text-gray-600 text-center py-8">
            No recent activity to show
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}