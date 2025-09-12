import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCropStore } from '../store/cropStore';
import { useAuthStore } from '../store/authStore';
import { CropAnalysis } from '../types';

interface CropHistoryScreenProps {
  onAnalysisSelect: (analysis: CropAnalysis) => void;
}

export default function CropHistoryScreen({ onAnalysisSelect }: CropHistoryScreenProps) {
  const { analyses, isLoading, getHistory } = useCropStore();
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      loadHistory();
    }
  }, [token]);

  const loadHistory = async () => {
    if (!token) return;
    
    try {
      await getHistory(token);
    } catch (error) {
      Alert.alert('Error', 'Failed to load analysis history');
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'diseased':
        return 'text-red-600';
      case 'pest_attack':
        return 'text-orange-600';
      case 'nutrient_deficiency':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'checkmark-circle';
      case 'diseased':
        return 'warning';
      case 'pest_attack':
        return 'bug';
      case 'nutrient_deficiency':
        return 'leaf';
      default:
        return 'help-circle';
    }
  };

  const formatHealthStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderAnalysisItem = ({ item }: { item: CropAnalysis }) => (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100"
      onPress={() => onAnalysisSelect(item)}
    >
      <View className="flex-row">
        <Image
          source={{ uri: item.imageUrl }}
          className="w-20 h-20 rounded-lg"
          resizeMode="cover"
        />
        <View className="flex-1 ml-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Ionicons 
                name={getHealthStatusIcon(item.analysisResult.healthStatus) as any} 
                size={16} 
                color={item.analysisResult.healthStatus === 'healthy' ? '#059669' : 
                       item.analysisResult.healthStatus === 'diseased' ? '#DC2626' :
                       item.analysisResult.healthStatus === 'pest_attack' ? '#EA580C' : '#D97706'} 
              />
              <Text className={`ml-2 font-medium ${getHealthStatusColor(item.analysisResult.healthStatus)}`}>
                {formatHealthStatus(item.analysisResult.healthStatus)}
              </Text>
            </View>
            <Text className="text-gray-500 text-sm">
              {Math.round(item.analysisResult.confidence * 100)}%
            </Text>
          </View>
          
          <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
            {item.analysisResult.recommendations[0] || 'No recommendations available'}
          </Text>
          
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-500 text-xs">
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-blue-600 text-sm font-medium">View Details</Text>
              <Ionicons name="chevron-forward" size={16} color="#2563EB" />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-8">
      <Ionicons name="leaf-outline" size={64} color="#9CA3AF" />
      <Text className="text-gray-500 text-lg font-medium mt-4 text-center">
        No Analysis History
      </Text>
      <Text className="text-gray-400 text-center mt-2">
        Upload your first crop image to get started with AI-powered analysis
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-green-600 px-6 py-8">
        <Text className="text-white text-3xl font-bold">Analysis History</Text>
        <Text className="text-green-100 text-lg mt-2">
          View your previous crop analyses
        </Text>
      </View>

      <View className="flex-1 px-4 pt-4">
        {analyses.length === 0 && !isLoading ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={analyses}
            renderItem={renderAnalysisItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={loadHistory}
                colors={['#059669']}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}