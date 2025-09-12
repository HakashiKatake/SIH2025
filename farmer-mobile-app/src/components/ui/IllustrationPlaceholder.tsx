import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface IllustrationPlaceholderProps {
  width: number;
  height: number;
  borderRadius?: number;
  backgroundColor?: string;
  showBrokenIcon?: boolean;
  alt?: string;
  style?: ViewStyle;
}

export const IllustrationPlaceholder: React.FC<IllustrationPlaceholderProps> = ({
  width,
  height,
  borderRadius = 8,
  backgroundColor = '#f3f4f6',
  showBrokenIcon = true,
  alt = 'Illustration',
  style,
}) => {
  const containerStyle = [
    styles.container,
    {
      width,
      height,
      borderRadius,
      backgroundColor,
    },
    style,
  ];

  return (
    <View style={containerStyle}>
      {showBrokenIcon && (
        <Ionicons 
          name="image-outline" 
          size={Math.min(width, height) * 0.3} 
          color="#9ca3af" 
        />
      )}
      {alt && (
        <Text style={[
          styles.altText,
          { fontSize: Math.min(width, height) * 0.08 }
        ]}>
          {alt}
        </Text>
      )}
    </View>
  );
};

// Predefined illustration placeholders for common use cases
export const FarmerIllustration: React.FC<{ size?: 'small' | 'medium' | 'large' }> = ({ 
  size = 'medium' 
}) => {
  const dimensions = {
    small: { width: 80, height: 80 },
    medium: { width: 120, height: 120 },
    large: { width: 200, height: 200 },
  };

  return (
    <IllustrationPlaceholder
      {...dimensions[size]}
      alt="Farmer Character"
      backgroundColor="#dcfce7"
    />
  );
};

export const DealerIllustration: React.FC<{ size?: 'small' | 'medium' | 'large' }> = ({ 
  size = 'medium' 
}) => {
  const dimensions = {
    small: { width: 80, height: 80 },
    medium: { width: 120, height: 120 },
    large: { width: 200, height: 200 },
  };

  return (
    <IllustrationPlaceholder
      {...dimensions[size]}
      alt="Dealer Character"
      backgroundColor="#dbeafe"
    />
  );
};

export const LeafDecoration: React.FC<{ size?: 'small' | 'medium' | 'large' }> = ({ 
  size = 'small' 
}) => {
  const dimensions = {
    small: { width: 40, height: 40 },
    medium: { width: 60, height: 60 },
    large: { width: 80, height: 80 },
  };

  return (
    <IllustrationPlaceholder
      {...dimensions[size]}
      alt="Leaf"
      backgroundColor="#f0fdf4"
      borderRadius={20}
    />
  );
};

export const CropIllustration: React.FC<{ 
  cropName?: string;
  size?: 'small' | 'medium' | 'large';
}> = ({ 
  cropName = 'Crop',
  size = 'medium' 
}) => {
  const dimensions = {
    small: { width: 60, height: 60 },
    medium: { width: 80, height: 80 },
    large: { width: 120, height: 120 },
  };

  return (
    <IllustrationPlaceholder
      {...dimensions[size]}
      alt={cropName}
      backgroundColor="#fef3c7"
      borderRadius={8}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  altText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
});