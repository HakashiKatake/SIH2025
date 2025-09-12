import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CropAnalysis } from '../types';

interface AnalysisResultProps {
  analysis: CropAnalysis;
  onClose?: () => void;
}

export default function AnalysisResult({ analysis, onClose }: AnalysisResultProps) {
  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'diseased':
        return 'bg-red-100 text-red-800';
      case 'pest_attack':
        return 'bg-orange-100 text-orange-800';
      case 'nutrient_deficiency':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {onClose && (
        <View className="flex-row justify-between items-center p-4 bg-white border-b border-gray-200">
          <Text className="text-lg font-semibold text-gray-800">Analysis Result</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}

      <View className="p-4">
        {/* Image */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Image
            source={{ uri: analysis.imageUrl }}
            className="w-full h-64 rounded-lg"
            resizeMode="cover"
          />
        </View>

        {/* Health Status */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Health Status</Text>
          <View className="flex-row items-center mb-2">
            <View className={`px-3 py-2 rounded-full flex-row items-center ${getHealthStatusColor(analysis.analysisResult.healthStatus)}`}>
              <Ionicons 
                name={getHealthStatusIcon(analysis.analysisResult.healthStatus) as any} 
                size={16} 
                color={analysis.analysisResult.healthStatus === 'healthy' ? '#065F46' : 
                       analysis.analysisResult.healthStatus === 'diseased' ? '#991B1B' :
                       analysis.analysisResult.healthStatus === 'pest_attack' ? '#9A3412' : '#92400E'} 
              />
              <Text className={`ml-2 font-medium ${getHealthStatusColor(analysis.analysisResult.healthStatus)}`}>
                {formatHealthStatus(analysis.analysisResult.healthStatus)}
              </Text>
            </View>
          </View>
          <Text className="text-gray-600">
            Confidence: {Math.round(analysis.analysisResult.confidence * 100)}%
          </Text>
        </View>

        {/* Detected Issues */}
        {analysis.analysisResult.detectedIssues.length > 0 && (
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Detected Issues</Text>
            {analysis.analysisResult.detectedIssues.map((issue, index) => (
              <View key={index} className="flex-row items-start mb-2">
                <Ionicons name="alert-circle" size={16} color="#EF4444" className="mt-1" />
                <Text className="text-gray-700 ml-2 flex-1">{issue}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Recommendations */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Recommendations</Text>
          {analysis.analysisResult.recommendations.map((recommendation, index) => (
            <View key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <View className="flex-row items-start">
                <View className="bg-blue-500 rounded-full w-6 h-6 items-center justify-center mr-3 mt-0.5">
                  <Text className="text-white text-xs font-bold">{index + 1}</Text>
                </View>
                <Text className="text-gray-800 flex-1 leading-5">{recommendation}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Analysis Info */}
        <View className="bg-white rounded-lg p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Analysis Details</Text>
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Date:</Text>
              <Text className="text-gray-800">
                {new Date(analysis.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Time:</Text>
              <Text className="text-gray-800">
                {new Date(analysis.createdAt).toLocaleTimeString()}
              </Text>
            </View>
            {analysis.cropType && (
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Crop Type:</Text>
                <Text className="text-gray-800">{analysis.cropType}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}