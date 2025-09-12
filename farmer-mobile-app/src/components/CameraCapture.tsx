import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

interface CameraCaptureProps {
  onImageSelected: (imageUri: string) => void;
  isUploading?: boolean;
}

export default function CameraCapture({ onImageSelected, isUploading = false }: CameraCaptureProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      onImageSelected(imageUri);
    }
  };

  const pickFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      onImageSelected(imageUri);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Select Image',
      'Choose how you want to add a crop image',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Gallery', onPress: pickFromGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View className="bg-white rounded-lg p-6 mx-4 shadow-sm border border-gray-100">
      <Text className="text-lg font-semibold text-gray-800 mb-4 text-center">
        Upload Crop Image
      </Text>

      {selectedImage ? (
        <View className="items-center mb-4">
          <Image
            source={{ uri: selectedImage }}
            className="w-64 h-48 rounded-lg"
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={showImageOptions}
            className="mt-3 bg-blue-500 px-4 py-2 rounded-lg"
            disabled={isUploading}
          >
            <Text className="text-white font-medium">Change Image</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={showImageOptions}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 items-center"
          disabled={isUploading}
        >
          <Ionicons name="camera" size={48} color="#9CA3AF" />
          <Text className="text-gray-500 mt-2 text-center">
            Tap to take a photo or select from gallery
          </Text>
        </TouchableOpacity>
      )}

      {isUploading && (
        <View className="mt-4 bg-blue-50 p-3 rounded-lg">
          <Text className="text-blue-700 text-center font-medium">
            🔄 Analyzing your crop image...
          </Text>
        </View>
      )}
    </View>
  );
}