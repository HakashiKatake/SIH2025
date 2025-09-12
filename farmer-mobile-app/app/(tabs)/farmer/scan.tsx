import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaContainer } from '../../../src/components/ui/SafeAreaContainer';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../../src/hooks/useTranslation';
import { useFieldStore } from '../../../src/store/fieldStore';
import { Colors, Typography, Spacing, BorderRadius } from '../../../src/constants/DesignSystem';
import { CropStage } from '../../../src/types';

const { width, height } = Dimensions.get('window');

export default function FarmerScan() {
  const { t } = useTranslation();
  const { addCrop } = useFieldStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('scan.permissionRequired'), t('scan.grantGalleryPermission'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        // Auto-analyze when image is selected
        setTimeout(() => analyzeImage(result.assets[0].uri), 500);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('scan.failedToPickImage'));
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('scan.permissionRequired'), t('scan.grantCameraPermission'));
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        // Auto-analyze when photo is taken
        setTimeout(() => analyzeImage(result.assets[0].uri), 500);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('scan.failedToTakePhoto'));
    }
  };

  const analyzeImage = async (imageUri?: string) => {
    const uri = imageUri || selectedImage;
    if (!uri) return;
    
    setIsAnalyzing(true);
    
    // Mock analysis with realistic delay
    setTimeout(() => {
      // Generate mock analysis result for Brinjal
      const mockResult = {
        cropName: 'Brinjal',
        confidence: 95,
        condition: 'healthy_crop_detected',
        alert: 'Healthy Brinjal detected!',
        solution: {
          fertilizers: {
            nitrogen: t('scan.nitrogen'),
            phosphorus: t('scan.phosphorus'),
            potassium: t('scan.potassium'),
            micronutrients: t('scan.micronutrients'),
          },
          moisture: {
            mulching: t('scan.doMulching'),
            intercropping: t('scan.useIntercropping'),
          }
        },
        image: uri
      };
      
      // Add Brinjal crop to field store
      addCrop({
        name: 'Brinjal',
        variety: 'Purple Long',
        plantingDate: new Date(),
        expectedHarvestDate: new Date(Date.now() + (90 * 24 * 60 * 60 * 1000)), // 90 days from now
        currentStage: CropStage.VEGETATIVE,
        fieldId: 'default-field',
        pesticidesUsed: [],
        notes: ['Added via crop scanning'],
        photos: [uri],
      });
      
      setAnalysisResult(mockResult);
      setIsAnalyzing(false);
      setShowResults(true);
      
      // Show success message
      Alert.alert(
        'Crop Added Successfully!',
        'Brinjal has been added to your crops list.',
        [
          {
            text: 'View Crops',
            onPress: () => router.push('/farmer/field')
          },
          { text: 'OK' }
        ]
      );
    }, 2500);
  };

  return (
    <SafeAreaContainer backgroundColor="#000" statusBarStyle="light-content">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('scan.title')}</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <Ionicons name="cloud-upload-outline" size={20} color="white" />
          <Text style={styles.uploadText}>{t('scan.uploadPhotos')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Camera Preview Area */}
        <View style={styles.cameraContainer}>
          {selectedImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              
              {/* Scanning Frame Overlay */}
              <View style={styles.scanningOverlay}>
                <View style={styles.scanningFrame}>
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />
                </View>
              </View>
              
              {/* Crop Name Result */}
              {!isAnalyzing && (
                <View style={styles.cropResult}>
                  <View style={styles.cropIcon}>
                    <Ionicons name="leaf" size={20} color="#22C55E" />
                  </View>
                  <Text style={styles.cropName}>{t('scan.cropName')}</Text>
                  <TouchableOpacity style={styles.nextButton} onPress={() => setShowResults(true)}>
                    <Ionicons name="chevron-forward" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              )}
              
              {/* Analyzing Indicator */}
              {isAnalyzing && (
                <View style={styles.analyzingContainer}>
                  <View style={styles.loadingIndicator} />
                  <Text style={styles.analyzingText}>{t('scan.analyzing')}</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.cameraPlaceholder}>
              <View style={styles.scanningFrame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
                
                {/* Scanning lines animation placeholder */}
                <View style={styles.scanningLines} />
              </View>
              <Text style={styles.instructionText}>
                Position the crop within the frame to scan
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Action Buttons */}
        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
            <Ionicons name="images" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.captureButton} 
            onPress={selectedImage ? () => analyzeImage() : takePhoto}
            disabled={isAnalyzing}
          >
            <View style={styles.captureInner}>
              {isAnalyzing ? (
                <View style={styles.loadingIndicator} />
              ) : (
                <Ionicons name="camera" size={32} color="white" />
              )}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.flashButton}>
            <Ionicons name="flash" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  uploadText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1f2937',
    position: 'relative',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningFrame: {
    width: width * 0.7,
    height: width * 0.7,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'white',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#22C55E',
    borderWidth: 3,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: -2,
    right: -2,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scanningLines: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: '#22C55E',
    opacity: 0.7,
  },
  instructionText: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 40,
  },
  cropResult: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cropIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cropName: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  analyzingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 30,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
    borderTopColor: 'transparent',
    // Add animation later
  },
});