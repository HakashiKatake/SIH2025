import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CameraCapture from '../components/CameraCapture';
import AnalysisResult from '../components/AnalysisResult';
import CropHistoryScreen from './CropHistoryScreen';
import { useCropStore } from '../store/cropStore';
import { useAuthStore } from '../store/authStore';
import { CropAnalysis } from '../types';

type ViewMode = 'capture' | 'result' | 'history';

export default function CropAnalysisScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('capture');
  const [selectedAnalysis, setSelectedAnalysis] = useState<CropAnalysis | null>(null);
  
  const { analyzeImage, isUploading, currentAnalysis } = useCropStore();
  const { token } = useAuthStore();

  const handleImageSelected = async (imageUri: string) => {
    if (!token) {
      Alert.alert('Error', 'Please login to analyze images');
      return;
    }

    try {
      const analysis = await analyzeImage(imageUri, token);
      setSelectedAnalysis(analysis);
      setViewMode('result');
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze image. Please try again.');
    }
  };

  const handleAnalysisSelect = (analysis: CropAnalysis) => {
    setSelectedAnalysis(analysis);
    setViewMode('result');
  };

  const renderTabBar = () => (
    <View className="bg-white border-b border-gray-200">
      <View className="flex-row">
        <TouchableOpacity
          className={`flex-1 py-4 items-center ${viewMode === 'capture' ? 'border-b-2 border-green-600' : ''}`}
          onPress={() => setViewMode('capture')}
        >
          <Ionicons 
            name="camera" 
            size={20} 
            color={viewMode === 'capture' ? '#059669' : '#6B7280'} 
          />
          <Text className={`mt-1 text-sm font-medium ${viewMode === 'capture' ? 'text-green-600' : 'text-gray-500'}`}>
            Analyze
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className={`flex-1 py-4 items-center ${viewMode === 'history' ? 'border-b-2 border-green-600' : ''}`}
          onPress={() => setViewMode('history')}
        >
          <Ionicons 
            name="time" 
            size={20} 
            color={viewMode === 'history' ? '#059669' : '#6B7280'} 
          />
          <Text className={`mt-1 text-sm font-medium ${viewMode === 'history' ? 'text-green-600' : 'text-gray-500'}`}>
            History
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCaptureView = () => (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-green-600 px-6 py-8">
        <Text className="text-white text-3xl font-bold">Crop Analysis</Text>
        <Text className="text-green-100 text-lg mt-2">
          Get AI-powered insights about your crops
        </Text>
      </View>

      <View className="py-6">
        <CameraCapture 
          onImageSelected={handleImageSelected}
          isUploading={isUploading}
        />

        <View className="mx-4 mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#2563EB" />
            <View className="ml-3 flex-1">
              <Text className="text-blue-800 font-semibold mb-1">How it works</Text>
              <Text className="text-blue-700 text-sm leading-5">
                1. Take a clear photo of your crop{'\n'}
                2. Our AI analyzes the image for health issues{'\n'}
                3. Get instant recommendations and treatment advice
              </Text>
            </View>
          </View>
        </View>

        <View className="mx-4 mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <View className="flex-row items-start">
            <Ionicons name="bulb" size={20} color="#D97706" />
            <View className="ml-3 flex-1">
              <Text className="text-yellow-800 font-semibold mb-1">Tips for best results</Text>
              <Text className="text-yellow-700 text-sm leading-5">
                • Take photos in good lighting{'\n'}
                • Focus on affected areas{'\n'}
                • Avoid blurry or dark images{'\n'}
                • Include leaves and stems when possible
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  if (viewMode === 'result' && selectedAnalysis) {
    return (
      <View className="flex-1">
        <AnalysisResult 
          analysis={selectedAnalysis}
          onClose={() => {
            setSelectedAnalysis(null);
            setViewMode('capture');
          }}
        />
      </View>
    );
  }

  return (
    <View className="flex-1">
      {renderTabBar()}
      {viewMode === 'capture' && renderCaptureView()}
      {viewMode === 'history' && (
        <CropHistoryScreen onAnalysisSelect={handleAnalysisSelect} />
      )}
    </View>
  );
}