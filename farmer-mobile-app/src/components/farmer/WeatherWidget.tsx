import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { IllustrationPlaceholder } from '../ui/IllustrationPlaceholder';

interface WeatherData {
  temperature: number;
  location: string;
  condition: string;
  humidity?: number;
  windSpeed?: number;
  icon?: string;
}

interface ForecastDay {
  day: string;
  icon: string;
  temp: number;
}

interface WeatherWidgetProps {
  temperature: number;
  location: string;
  condition: string;
  forecast: Array<ForecastDay>;
  isLoading?: boolean;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  temperature,
  location,
  condition,
  forecast,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <View className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl p-4 mb-6">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-white text-lg font-semibold mb-1">
              Today's Weather
            </Text>
            <Text className="text-blue-100">Loading weather...</Text>
          </View>
          <IllustrationPlaceholder 
            width={60} 
            height={60} 
            borderRadius={8}
            backgroundColor="rgba(255,255,255,0.2)"
            alt="Weather icon"
          />
        </View>
      </View>
    );
  }

  return (
    <View className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl p-4 mb-6">
      {/* Current Weather */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-1">
          <Text className="text-white text-lg font-semibold mb-1">
            Today's Weather
          </Text>
          <Text className="text-white text-3xl font-bold">
            {temperature}°C
          </Text>
          <Text className="text-blue-100 text-sm">
            {condition}
          </Text>
          <Text className="text-blue-100 text-xs mt-1">
            {location}
          </Text>
        </View>
        <View className="items-center">
          <IllustrationPlaceholder 
            width={60} 
            height={60} 
            borderRadius={8}
            backgroundColor="rgba(255,255,255,0.2)"
            alt="Weather condition icon"
          />
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/farmer/weather')}
            className="bg-white/20 px-3 py-1 rounded-full mt-2"
          >
            <Text className="text-white text-xs">View Details</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3-Day Forecast */}
      {forecast && forecast.length > 0 && (
        <View>
          <Text className="text-white text-sm font-medium mb-2">3-Day Forecast</Text>
          <View className="flex-row justify-between">
            {forecast.slice(0, 3).map((day, index) => (
              <View key={index} className="items-center flex-1">
                <Text className="text-blue-100 text-xs mb-1">{day.day}</Text>
                <IllustrationPlaceholder 
                  width={24} 
                  height={24} 
                  borderRadius={4}
                  backgroundColor="rgba(255,255,255,0.2)"
                  alt={`${day.day} weather icon`}
                />
                <Text className="text-white text-sm font-medium mt-1">{day.temp}°</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};