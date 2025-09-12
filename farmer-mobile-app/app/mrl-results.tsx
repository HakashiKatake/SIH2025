import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaContainer } from '../src/components/ui/SafeAreaContainer';
import { Header } from '../src/components/ui/Header';
import { Colors, Typography, Spacing, BorderRadius } from '../src/constants/DesignSystem';

export default function MRLResultsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  // Extract parameters from navigation
  const cropType = params.cropType as string || "Wheat";
  const pesticide = params.pesticide as string || "Chlorpyrifos";
  const applicationDate = params.applicationDate as string || "";
  const harvestDate = params.harvestDate as string || "";
  const quantity = params.quantity as string || "";

  // Mock calculation results
  const calculateResults = () => {
    const appDate = new Date(applicationDate);
    const harvestDateObj = new Date(harvestDate);
    const daysDifference = Math.ceil((harvestDateObj.getTime() - appDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Mock safe period (typically 14-21 days for most pesticides)
    const safePeriod = 15;
    const isSafe = daysDifference >= safePeriod;
    const daysRemaining = Math.max(0, safePeriod - daysDifference);
    
    return {
      isSafe,
      daysDifference,
      safePeriod,
      daysRemaining,
      residueLevel: 2.5,
      maxLimit: 3.0,
      percentageOfLimit: Math.round((2.5 / 3.0) * 100)
    };
  };

  const results = calculateResults();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `MRL Test Results\nCrop: ${cropType}\nPesticide: ${pesticide}\nStatus: ${results.isSafe ? 'Safe to Harvest' : 'Unsafe to Harvest'}\nDays remaining: ${results.daysRemaining}`,
        title: 'MRL Test Results'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <SafeAreaContainer backgroundColor="#f8fafc">
      <Header 
        title="MRL Results" 
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      <ScrollView style={styles.container}>
        {/* Header Illustration */}
        <View style={styles.headerCard}>
          <View style={styles.illustrationContainer}>
            <Text style={styles.illustrationEmoji}>🔬</Text>
          </View>
          <Text style={styles.headerTitle}>Results</Text>
        </View>

        {/* Results Card */}
        <View style={styles.resultsCard}>
          {/* Crop Information */}
          <View style={styles.infoSection}>
            <Text style={styles.infoText}>Crop: {cropType}</Text>
            <Text style={styles.infoText}>Pesticide: {pesticide}XYZ</Text>
            <Text style={styles.infoText}>Safe Harvesting Gap: {results.safePeriod} days</Text>
            <Text style={styles.infoText}>Your Harvest Date Gap: {results.daysDifference} days</Text>
          </View>

          {/* Safety Status */}
          <View style={[styles.statusSection, results.isSafe ? styles.safeStatus : styles.unsafeStatus]}>
            <Ionicons 
              name={results.isSafe ? "checkmark" : "close"} 
              size={24} 
              color="white" 
            />
            <Text style={styles.statusText}>
              {results.isSafe ? 'Safe to Harvest!' : 'Unsafe to Harvest!'}
            </Text>
          </View>

          {/* Residue Level Bar */}
          <View style={styles.residueSection}>
            <Text style={styles.residueLabel}>
              Residue Level: {results.residueLevel} mg/kg (within limit of {results.maxLimit} mg/kg)
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${results.percentageOfLimit}%` }]} />
            </View>
            <Text style={styles.percentageText}>
              Your crop residue is {results.percentageOfLimit}% of the allowed limit.
            </Text>
          </View>

          {/* Warning/Success Message */}
          {!results.isSafe ? (
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={20} color={Colors.warning} />
              <Text style={styles.warningText}>
                Wait {results.daysRemaining} days before cutting your crop. Then it will be safe to sell.
              </Text>
            </View>
          ) : (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.successText}>
                Your crop is safe to harvest and sell now!
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareButtonText}>Save/Share Result</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Educational Section */}
        <View style={styles.educationCard}>
          <View style={styles.educationHeader}>
            <View style={styles.farmerIconContainer}>
              <Text style={styles.farmerEmoji}>👨‍🌾</Text>
            </View>
            <Text style={styles.educationTitle}>WHAT IS MRL?</Text>
          </View>
          
          <Text style={styles.educationText}>
            MRL means Maximum Residue Level. It is the highest amount of pesticide that can stay on food. 
            If the crop has more than this amount, it is not safe to eat. If it is within the limit, 
            the crop is safe and healthy for people.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  headerCard: {
    backgroundColor: '#e0f2fe',
    borderRadius: BorderRadius.lg,
    padding: Spacing['2xl'],
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  illustrationContainer: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.full,
    padding: Spacing['2xl'],
    marginBottom: Spacing.lg,
  },
  illustrationEmoji: {
    fontSize: 48,
  },
  headerTitle: {
    fontSize: Typography.headingLarge,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  resultsCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  infoSection: {
    marginBottom: Spacing.lg,
  },
  infoText: {
    fontSize: Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  safeStatus: {
    backgroundColor: Colors.success,
  },
  unsafeStatus: {
    backgroundColor: Colors.error,
  },
  statusText: {
    fontSize: Typography.bodyLarge,
    fontWeight: '600',
    color: 'white',
    marginLeft: Spacing.sm,
  },
  residueSection: {
    marginBottom: Spacing.lg,
  },
  residueLabel: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.error,
    borderRadius: 4,
  },
  percentageText: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  warningText: {
    fontSize: Typography.bodyMedium,
    color: Colors.warning,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  successText: {
    fontSize: Typography.bodyMedium,
    color: Colors.success,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  shareButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.success,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: Typography.bodyMedium,
    color: Colors.success,
    fontWeight: '500',
  },
  backButton: {
    flex: 1,
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: Typography.bodyMedium,
    color: 'white',
    fontWeight: '500',
  },
  educationCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  educationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  farmerIconContainer: {
    backgroundColor: '#fef3c7',
    borderRadius: BorderRadius.full,
    padding: Spacing.sm,
    marginRight: Spacing.md,
  },
  farmerEmoji: {
    fontSize: 24,
  },
  educationTitle: {
    fontSize: Typography.bodyLarge,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  educationText: {
    fontSize: Typography.bodyMedium,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});

