import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useAuthStore } from "../store/authStore";

export default function DashboardScreen() {
  const { user, logout } = useAuthStore();

  const features = [
    {
      title: "Crop Analysis",
      description: "Analyze crop health with AI",
      color: "bg-blue-500",
    },
    {
      title: "Weather Forecast",
      description: "Get weather updates",
      color: "bg-yellow-500",
    },
    {
      title: "Chatbot",
      description: "Ask farming questions",
      color: "bg-purple-500",
    },
    {
      title: "Marketplace",
      description: "Buy and sell products",
      color: "bg-red-500",
    },
    {
      title: "Farming Roadmap",
      description: "Get personalized guidance",
      color: "bg-green-500",
    },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-green-600 px-6 py-8 pb-12">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-2xl font-bold">Welcome back!</Text>
            <Text className="text-green-100 text-lg">{user?.name}</Text>
          </View>
          <TouchableOpacity
            onPress={logout}
            className="bg-green-700 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-6 -mt-6">
        <View className="bg-white rounded-lg p-4 shadow-lg mb-6">
          <Text className="text-gray-800 text-lg font-semibold mb-2">
            Farm Details
          </Text>
          <Text className="text-gray-600">
            Location: {user?.location.address}
          </Text>
          {user?.farmSize && (
            <Text className="text-gray-600">
              Farm Size: {user.farmSize} acres
            </Text>
          )}
          <Text className="text-gray-600">
            Language: {user?.preferredLanguage}
          </Text>
        </View>

        <Text className="text-xl font-bold text-gray-800 mb-4">Features</Text>

        <View className="space-y-4">
          {features.map((feature, index) => (
            <TouchableOpacity
              key={index}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
            >
              <View className="flex-row items-center">
                <View
                  className={`w-12 h-12 ${feature.color} rounded-lg mr-4 justify-center items-center`}
                >
                  <Text className="text-white font-bold text-lg">
                    {feature.title.charAt(0)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-semibold text-lg">
                    {feature.title}
                  </Text>
                  <Text className="text-gray-600">{feature.description}</Text>
                </View>
                <Text className="text-gray-400 text-2xl">›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6 mb-8">
          <Text className="text-yellow-800 font-semibold mb-2">
            🚧 Development Mode
          </Text>
          <Text className="text-yellow-700">
            This app is currently in development. Features will be connected to
            the backend API for testing.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
