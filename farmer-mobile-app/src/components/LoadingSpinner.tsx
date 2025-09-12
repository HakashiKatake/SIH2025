import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  overlay?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = '#4CAF50',
  message,
  overlay = false,
}) => {
  const containerStyle = overlay
    ? 'absolute inset-0 bg-black/50 justify-center items-center z-50'
    : 'justify-center items-center py-8';

  return (
    <View className={containerStyle}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text className="text-gray-600 mt-4 text-center px-4">
          {message}
        </Text>
      )}
    </View>
  );
};

export default LoadingSpinner;