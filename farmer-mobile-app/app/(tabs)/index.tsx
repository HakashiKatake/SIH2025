import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useAuthStore } from '../../src/store/authStore';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { user, logout } = useAuthStore();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <Text style={styles.greeting}>Hello Rupesh 👋</Text>
            <Text style={styles.subtitle}>Today, Aug 1</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Weather Card */}
      <View style={styles.weatherCard}>
        <View style={styles.weatherContent}>
          <View style={styles.weatherLeft}>
            <Text style={styles.temperature}>23°C</Text>
            <Text style={styles.location}>Gampaha, Sri Lanka</Text>
            <Text style={styles.weatherDesc}>Partly Cloudy</Text>
          </View>
          <View style={styles.weatherRight}>
            <Text style={styles.weatherIcon}>⛅</Text>
          </View>
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoriesGrid}>
          <TouchableOpacity style={[styles.categoryCard, { backgroundColor: '#fce7f3' }]}>
            <Text style={styles.categoryIcon}>🌾</Text>
            <Text style={styles.categoryTitle}>Pest Mgt</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.categoryCard, { backgroundColor: '#dbeafe' }]}>
            <Text style={styles.categoryIcon}>📊</Text>
            <Text style={styles.categoryTitle}>Calendar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.categoryCard, { backgroundColor: '#fef3c7' }]}>
            <Text style={styles.categoryIcon}>🌤️</Text>
            <Text style={styles.categoryTitle}>Weather</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.categoryCard, { backgroundColor: '#f0fdf4' }]}>
            <Text style={styles.categoryIcon}>🧪</Text>
            <Text style={styles.categoryTitle}>Crop Safety Test</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Roadmap Card */}
      <View style={styles.roadmapCard}>
        <View style={styles.roadmapHeader}>
          <Text style={styles.roadmapTitle}>Crop Safety Test</Text>
          <TouchableOpacity>
            <Text style={styles.addButton}>Add New Crop</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.roadmapSubtitle}>
          Stay Registered Manage the Crops we're looking forward to your safety and growth.
        </Text>
        <TouchableOpacity style={styles.viewRoadmapButton}>
          <Text style={styles.viewRoadmapText}>View Roadmap</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: 20,
  },
  weatherCard: {
    backgroundColor: '#22c55e',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
  },
  weatherContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherLeft: {
    flex: 1,
  },
  temperature: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  weatherDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  weatherRight: {
    alignItems: 'center',
  },
  weatherIcon: {
    fontSize: 48,
  },
  categoriesSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    textAlign: 'center',
  },
  roadmapCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 32,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roadmapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roadmapTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  addButton: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '500',
  },
  roadmapSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  viewRoadmapButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  viewRoadmapText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});
