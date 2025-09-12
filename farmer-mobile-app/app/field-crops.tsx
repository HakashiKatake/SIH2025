import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';

export default function FieldCropsScreen() {
  const crops = [
    {
      id: 1,
      name: 'Anthurium',
      status: 'Healthy',
      icon: '🌺',
      statusColor: '#22c55e',
    },
    {
      id: 2,
      name: 'Potato',
      status: 'Needs Attention',
      icon: '🥔',
      statusColor: '#f59e0b',
    },
    {
      id: 3,
      name: 'Ginger',
      status: 'Good',
      icon: '🫚',
      statusColor: '#22c55e',
    },
    {
      id: 4,
      name: 'Tomato',
      status: 'Excellent',
      icon: '🍅',
      statusColor: '#22c55e',
    },
    {
      id: 5,
      name: 'Sunflower',
      status: 'Good',
      icon: '🌻',
      statusColor: '#22c55e',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Field</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>My Crops</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Crop Safety Test</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Crops List */}
        {crops.map((crop) => (
          <TouchableOpacity key={crop.id} style={styles.cropCard}>
            <View style={styles.cropHeader}>
              <View style={styles.cropIcon}>
                <Text style={styles.cropEmoji}>{crop.icon}</Text>
              </View>
              <View style={styles.cropInfo}>
                <Text style={styles.cropName}>{crop.name}</Text>
                <Text style={[styles.cropStatus, { color: crop.statusColor }]}>
                  {crop.status}
                </Text>
              </View>
              <TouchableOpacity style={styles.moreButton}>
                <Text style={styles.moreIcon}>→</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 18,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: '#dcfce7',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#22c55e',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  cropCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cropHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cropIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cropEmoji: {
    fontSize: 24,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  cropStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreIcon: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: 'bold',
  },
});