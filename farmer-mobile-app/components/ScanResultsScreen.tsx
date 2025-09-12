import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../src/constants/DesignSystem';

const { width, height } = Dimensions.get('window');

interface ScanResultsScreenProps {
  visible: boolean;
  onClose: () => void;
  result: {
    cropName: string;
    confidence: number;
    condition: string;
    alert: string;
    solution: {
      fertilizers: {
        nitrogen: string;
        phosphorus: string;
        potassium: string;
        micronutrients: string;
      };
      moisture: {
        mulching: string;
        intercropping: string;
      };
    };
    image: string;
  } | null;
}

export default function ScanResultsScreen({ visible, onClose, result }: ScanResultsScreenProps) {
  if (!result) return null;

  const isDryCondition = result.condition === 'dry_crop_detected';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Results</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Crop Image */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: result.image }} style={styles.cropImage} />
          </View>

          {/* Crop Name */}
          <Text style={styles.cropName}>{result.cropName.toUpperCase()}</Text>

          {/* Alert Section */}
          <View style={styles.alertContainer}>
            <View style={styles.alertHeader}>
              <Ionicons 
                name={isDryCondition ? "warning" : "checkmark-circle"} 
                size={20} 
                color={isDryCondition ? "#EF4444" : "#22C55E"} 
              />
              <Text style={[
                styles.alertText,
                { color: isDryCondition ? "#EF4444" : "#22C55E" }
              ]}>
                {isDryCondition ? "ALERT: Dry crop detected" : "Healthy crop detected"}
              </Text>
            </View>
          </View>

          {/* Solution Section */}
          <View style={styles.solutionContainer}>
            <Text style={styles.solutionTitle}>Solution:</Text>
            
            {/* Fertilizers Card */}
            <View style={styles.fertilizersCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="leaf" size={20} color="#4B5563" />
                <Text style={styles.cardTitle}>Fertilizers to Use</Text>
              </View>
              
              <View style={styles.fertilizersContent}>
                <Text style={styles.fertilizersText}>
                  <Text style={styles.nutrientLabel}>Nitrogen (N):</Text> {result.solution.fertilizers.nitrogen}
                </Text>
                <Text style={styles.fertilizersText}>
                  <Text style={styles.nutrientLabel}>Phosphorus (P):</Text> {result.solution.fertilizers.phosphorus}
                </Text>
                <Text style={styles.fertilizersText}>
                  <Text style={styles.nutrientLabel}>Potassium (K):</Text> {result.solution.fertilizers.potassium}
                </Text>
                <Text style={styles.fertilizersText}>
                  <Text style={styles.nutrientLabel}>Micronutrients:</Text> {result.solution.fertilizers.micronutrients}
                </Text>
              </View>

              {/* Conserve Moisture Section */}
              <View style={styles.moistureSection}>
                <Text style={styles.moistureTitle}>Conserve Moisture</Text>
                <View style={styles.moistureTip}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.moistureText}>{result.solution.moisture.mulching}</Text>
                </View>
                <View style={styles.moistureTip}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.moistureText}>{result.solution.moisture.intercropping}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.saveButton} onPress={onClose}>
              <Text style={styles.saveButtonText}>Save to My Crops</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.shareButton} onPress={onClose}>
              <Ionicons name="share-outline" size={20} color="#6750A4" />
              <Text style={styles.shareButtonText}>Share Results</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  imageContainer: {
    marginTop: 20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cropImage: {
    width: '100%',
    height: 280,
    resizeMode: 'cover',
  },
  cropName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 2,
  },
  alertContainer: {
    marginBottom: 24,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  alertText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  solutionContainer: {
    marginBottom: 32,
  },
  solutionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 16,
  },
  fertilizersCard: {
    backgroundColor: '#DCFCE7',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  fertilizersContent: {
    marginBottom: 20,
  },
  fertilizersText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 24,
  },
  nutrientLabel: {
    fontWeight: '600',
    color: '#1F2937',
  },
  moistureSection: {
    borderTopWidth: 1,
    borderTopColor: '#BBF7D0',
    paddingTop: 16,
  },
  moistureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  moistureTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#059669',
    fontWeight: 'bold',
    marginRight: 8,
    marginTop: 2,
  },
  moistureText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  actionButtons: {
    paddingBottom: 32,
  },
  saveButton: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#059669',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#6750A4',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6750A4',
    marginLeft: 8,
  },
});
