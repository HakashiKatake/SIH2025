import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useRoadmapStore } from '../store/roadmapStore';
import { useAuthStore } from '../store/authStore';
import { FarmingRoadmap, Milestone, RoadmapGenerationRequest } from '../types';

export default function FarmingRoadmapScreen() {
  const [activeTab, setActiveTab] = useState<'roadmaps' | 'create'>('roadmaps');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRoadmap, setSelectedRoadmap] = useState<FarmingRoadmap | null>(null);
  
  const { 
    roadmaps, 
    activeRoadmap, 
    isLoading, 
    isGenerating,
    generateRoadmap, 
    getUserRoadmaps,
    updateMilestone,
    setActiveRoadmap,
  } = useRoadmapStore();
  
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (token) {
      getUserRoadmaps(token);
    }
  }, [token]);

  const handleMilestoneUpdate = async (roadmapId: string, milestoneId: string, newStatus: string) => {
    try {
      await updateMilestone(roadmapId, milestoneId, newStatus, undefined, token || undefined);
      Alert.alert('Success', 'Milestone updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update milestone. Please try again.');
    }
  };

  const renderRoadmapCard = ({ item }: { item: FarmingRoadmap }) => (
    <TouchableOpacity 
      className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-100"
      onPress={() => setSelectedRoadmap(item)}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800 capitalize">
            {item.cropType} Farming
          </Text>
          <Text className="text-gray-600 text-sm mt-1">
            {item.location.district}, {item.location.state}
          </Text>
        </View>
        <View className="bg-green-100 px-3 py-1 rounded-full">
          <Text className="text-green-600 text-sm font-medium">
            {item.progress}% Complete
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="bg-gray-200 rounded-full h-2 mb-3">
        <View 
          className="bg-green-600 h-2 rounded-full"
          style={{ width: `${item.progress}%` }}
        />
      </View>

      <View className="flex-row justify-between items-center">
        <Text className="text-gray-600 text-sm">
          Current: {item.currentStage}
        </Text>
        <Text className="text-gray-600 text-sm">
          Harvest: {new Date(item.estimatedHarvest).toLocaleDateString()}
        </Text>
      </View>

      <View className="flex-row justify-between mt-3">
        <View className="flex-row space-x-4">
          <Text className="text-xs text-gray-500">
            ✅ {item.milestones.filter(m => m.status === 'completed').length} completed
          </Text>
          <Text className="text-xs text-gray-500">
            🔄 {item.milestones.filter(m => m.status === 'in_progress').length} in progress
          </Text>
          <Text className="text-xs text-gray-500">
            ⏳ {item.milestones.filter(m => m.status === 'pending').length} pending
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderRoadmapsTab = () => (
    <View className="flex-1">
      <View className="bg-white p-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-semibold">My Roadmaps</Text>
          <TouchableOpacity 
            className="bg-green-600 rounded-lg px-4 py-2"
            onPress={() => setShowCreateModal(true)}
          >
            <Text className="text-white font-semibold">+ New Roadmap</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={roadmaps}
        renderItem={renderRoadmapCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshing={isLoading}
        onRefresh={() => token && getUserRoadmaps(token)}
        ListEmptyComponent={
          <View className="items-center py-8">
            <Text className="text-gray-500 text-lg">No roadmaps yet</Text>
            <Text className="text-gray-400 text-center mt-2">
              Create your first farming roadmap to get started
            </Text>
            <TouchableOpacity 
              className="bg-green-600 rounded-lg px-6 py-3 mt-4"
              onPress={() => setShowCreateModal(true)}
            >
              <Text className="text-white font-semibold">Create Roadmap</Text>
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
        <Text className="text-white text-3xl font-bold">Farming Roadmap</Text>
        <Text className="text-green-100 text-lg mt-2">
          Plan and track your farming journey
        </Text>
      </View>

      {renderRoadmapsTab()}

      {/* Create Roadmap Modal */}
      <CreateRoadmapModal 
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Roadmap Detail Modal */}
      <RoadmapDetailModal 
        roadmap={selectedRoadmap}
        visible={!!selectedRoadmap}
        onClose={() => setSelectedRoadmap(null)}
        onMilestoneUpdate={handleMilestoneUpdate}
      />
    </View>
  );
}

function CreateRoadmapModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState<RoadmapGenerationRequest>({
    cropType: '',
    location: {
      latitude: 0,
      longitude: 0,
      address: '',
      state: '',
      district: '',
    },
  });
  
  const { generateRoadmap, isGenerating } = useRoadmapStore();
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (user?.location) {
      setFormData(prev => ({
        ...prev,
        location: user.location,
      }));
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!token) return;
    
    if (!formData.cropType) {
      Alert.alert('Error', 'Please select a crop type');
      return;
    }

    try {
      await generateRoadmap(formData, token);
      Alert.alert('Success', 'Farming roadmap generated successfully!');
      onClose();
      setFormData(prev => ({ ...prev, cropType: '' }));
    } catch (error) {
      Alert.alert('Error', 'Failed to generate roadmap. Please try again.');
    }
  };

  const cropTypes = [
    'Rice', 'Wheat', 'Maize', 'Sugarcane', 'Cotton', 'Soybean', 
    'Groundnut', 'Sunflower', 'Mustard', 'Potato', 'Onion', 'Tomato'
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-white">
        <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
          <TouchableOpacity onPress={onClose}>
            <Text className="text-blue-600 font-semibold">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold">Create Roadmap</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={isGenerating}>
            <Text className={`font-semibold ${isGenerating ? 'text-gray-400' : 'text-blue-600'}`}>
              {isGenerating ? 'Generating...' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          <View className="space-y-6">
            <View>
              <Text className="text-gray-700 font-medium mb-3">Select Crop Type *</Text>
              <View className="flex-row flex-wrap gap-2">
                {cropTypes.map((crop) => (
                  <TouchableOpacity
                    key={crop}
                    className={`px-4 py-2 rounded-full border ${
                      formData.cropType === crop
                        ? 'bg-green-600 border-green-600'
                        : 'bg-white border-gray-300'
                    }`}
                    onPress={() => setFormData(prev => ({ ...prev, cropType: crop }))}
                  >
                    <Text className={`${
                      formData.cropType === crop ? 'text-white' : 'text-gray-700'
                    }`}>
                      {crop}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-gray-700 font-medium mb-2">Location</Text>
              <View className="bg-gray-50 rounded-lg p-3">
                <Text className="text-gray-600">
                  {formData.location.address || 'Using your profile location'}
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  {formData.location.district}, {formData.location.state}
                </Text>
              </View>
            </View>

            <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Text className="text-blue-800 font-semibold mb-2">🌱 What you'll get:</Text>
              <Text className="text-blue-700 text-sm mb-1">• Customized farming timeline</Text>
              <Text className="text-blue-700 text-sm mb-1">• Sowing and harvesting schedules</Text>
              <Text className="text-blue-700 text-sm mb-1">• Irrigation and fertilizer reminders</Text>
              <Text className="text-blue-700 text-sm mb-1">• Weather-based recommendations</Text>
              <Text className="text-blue-700 text-sm">• MRL compliance guidelines</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function RoadmapDetailModal({ 
  roadmap, 
  visible, 
  onClose, 
  onMilestoneUpdate 
}: { 
  roadmap: FarmingRoadmap | null; 
  visible: boolean; 
  onClose: () => void;
  onMilestoneUpdate: (roadmapId: string, milestoneId: string, status: string) => void;
}) {
  if (!roadmap) return null;

  const getMilestoneIcon = (category: string) => {
    switch (category) {
      case 'sowing': return '🌱';
      case 'irrigation': return '💧';
      case 'fertilizer': return '🧪';
      case 'pest_control': return '🐛';
      case 'harvesting': return '🌾';
      default: return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderMilestone = ({ item }: { item: Milestone }) => (
    <View className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row items-start">
        <Text className="text-2xl mr-3">{getMilestoneIcon(item.category)}</Text>
        <View className="flex-1">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-lg font-semibold text-gray-800 flex-1">
              {item.title}
            </Text>
            <View className={`px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
              <Text className={`text-xs font-medium capitalize ${getStatusColor(item.status).split(' ')[0]}`}>
                {item.status.replace('_', ' ')}
              </Text>
            </View>
          </View>
          
          <Text className="text-gray-600 mb-2">{item.description}</Text>
          
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm text-gray-500">
              Due: {new Date(item.dueDate).toLocaleDateString()}
            </Text>
            <View className={`px-2 py-1 rounded-full ${
              item.priority === 'high' ? 'bg-red-100' :
              item.priority === 'medium' ? 'bg-yellow-100' : 'bg-gray-100'
            }`}>
              <Text className={`text-xs font-medium ${
                item.priority === 'high' ? 'text-red-600' :
                item.priority === 'medium' ? 'text-yellow-600' : 'text-gray-600'
              }`}>
                {item.priority} priority
              </Text>
            </View>
          </View>

          {item.status !== 'completed' && (
            <View className="flex-row space-x-2">
              <TouchableOpacity 
                className="bg-blue-600 rounded-lg px-3 py-2 flex-1"
                onPress={() => onMilestoneUpdate(roadmap.id, item.id, 'in_progress')}
              >
                <Text className="text-white text-center font-medium">Start</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-green-600 rounded-lg px-3 py-2 flex-1"
                onPress={() => onMilestoneUpdate(roadmap.id, item.id, 'completed')}
              >
                <Text className="text-white text-center font-medium">Complete</Text>
              </TouchableOpacity>
            </View>
          )}

          {item.completedAt && (
            <Text className="text-green-600 text-sm mt-2">
              ✅ Completed on {new Date(item.completedAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-gray-50">
        <View className="flex-row justify-between items-center p-4 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={onClose}>
            <Text className="text-blue-600 font-semibold">← Back</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold capitalize">{roadmap.cropType} Roadmap</Text>
          <View />
        </View>

        {/* Roadmap Header */}
        <View className="bg-white p-4 border-b border-gray-200">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xl font-bold text-gray-800 capitalize">
              {roadmap.cropType} Farming Plan
            </Text>
            <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-green-600 font-semibold">
                {roadmap.progress}% Complete
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="bg-gray-200 rounded-full h-3 mb-3">
            <View 
              className="bg-green-600 h-3 rounded-full"
              style={{ width: `${roadmap.progress}%` }}
            />
          </View>

          <View className="flex-row justify-between">
            <Text className="text-gray-600">
              📍 {roadmap.location.district}, {roadmap.location.state}
            </Text>
            <Text className="text-gray-600">
              🌾 Harvest: {new Date(roadmap.estimatedHarvest).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Milestones Timeline */}
        <FlatList
          data={roadmap.milestones}
          renderItem={renderMilestone}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Farming Timeline ({roadmap.milestones.length} milestones)
            </Text>
          }
        />
      </View>
    </Modal>
  );
}