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

export default function FarmersRoadmapScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Character Illustration */}
        <View style={styles.characterContainer}>
          <View style={styles.character}>
            <Text style={styles.characterEmoji}>👨‍🌾</Text>
            <View style={styles.tractor}>
              <Text style={styles.tractorEmoji}>🚜</Text>
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Farmer's Roadmap</Text>

        {/* Pie Chart Container */}
        <View style={styles.chartContainer}>
          <View style={styles.pieChart}>
            {/* Step 1 - Crop Selection (Green) */}
            <View style={[styles.pieSlice, styles.step1]} />
            
            {/* Step 2 - Soil Preparation (Light Green) */}
            <View style={[styles.pieSlice, styles.step2]} />
            
            {/* Step 3 - Planting (Blue) */}
            <View style={[styles.pieSlice, styles.step3]} />
            
            {/* Step 4 - Growth Monitoring (Yellow) */}
            <View style={[styles.pieSlice, styles.step4]} />
            
            {/* Step 5 - Harvesting (Orange) */}
            <View style={[styles.pieSlice, styles.step5]} />
            
            {/* Step 6 - Post Harvest (Pink) */}
            <View style={[styles.pieSlice, styles.step6]} />

            {/* Labels */}
            <View style={[styles.stepLabel, styles.step1Label]}>
              <Text style={styles.stepText}>Step-2</Text>
              <Text style={styles.stepSubtext}>Crop Selection</Text>
            </View>
            
            <View style={[styles.stepLabel, styles.step2Label]}>
              <Text style={styles.stepText}>Step-3</Text>
              <Text style={styles.stepSubtext}>Soil Preparation</Text>
            </View>
            
            <View style={[styles.stepLabel, styles.step3Label]}>
              <Text style={styles.stepText}>Step-4</Text>
            </View>
            
            <View style={[styles.stepLabel, styles.step4Label]}>
              <Text style={styles.stepText}>Step-5</Text>
            </View>
            
            <View style={[styles.stepLabel, styles.step5Label]}>
              <Text style={styles.stepText}>Step-6</Text>
            </View>
            
            <View style={[styles.stepLabel, styles.step6Label]}>
              <Text style={styles.stepText}>Step-1</Text>
              <Text style={styles.stepSubtext}>Soil Preparation</Text>
            </View>
          </View>
        </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  content: {
    flex: 1,
    alignItems: 'center',
  },
  characterContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  character: {
    position: 'relative',
    alignItems: 'center',
  },
  characterEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  tractor: {
    position: 'absolute',
    bottom: -20,
    right: -30,
  },
  tractorEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 40,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  pieChart: {
    width: 300,
    height: 300,
    borderRadius: 150,
    position: 'relative',
    overflow: 'hidden',
  },
  pieSlice: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  step1: {
    backgroundColor: '#22c55e',
    transform: [{ rotate: '0deg' }],
    clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)',
  },
  step2: {
    backgroundColor: '#86efac',
    transform: [{ rotate: '60deg' }],
    clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)',
  },
  step3: {
    backgroundColor: '#3b82f6',
    transform: [{ rotate: '120deg' }],
    clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)',
  },
  step4: {
    backgroundColor: '#fbbf24',
    transform: [{ rotate: '180deg' }],
    clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)',
  },
  step5: {
    backgroundColor: '#f97316',
    transform: [{ rotate: '240deg' }],
    clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)',
  },
  step6: {
    backgroundColor: '#ec4899',
    transform: [{ rotate: '300deg' }],
    clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)',
  },
  stepLabel: {
    position: 'absolute',
    alignItems: 'center',
  },
  step1Label: {
    top: 20,
    right: 20,
  },
  step2Label: {
    top: 80,
    right: -20,
  },
  step3Label: {
    bottom: 80,
    right: -20,
  },
  step4Label: {
    bottom: 20,
    right: 20,
  },
  step5Label: {
    bottom: 20,
    left: 20,
  },
  step6Label: {
    top: 80,
    left: -20,
  },
  stepText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  stepSubtext: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 2,
  },
});