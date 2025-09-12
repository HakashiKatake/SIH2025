import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  type?: 'error' | 'warning' | 'info';
  showIcon?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  type = 'error',
  showIcon = true,
}) => {
  const getIconName = () => {
    switch (type) {
      case 'warning':
        return 'warning-outline';
      case 'info':
        return 'information-circle-outline';
      default:
        return 'alert-circle-outline';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'warning':
        return '#FF9800';
      case 'info':
        return '#2196F3';
      default:
        return '#F44336';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'warning':
        return 'border-orange-200';
      case 'info':
        return 'border-blue-200';
      default:
        return 'border-red-200';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'warning':
        return 'bg-orange-50';
      case 'info':
        return 'bg-blue-50';
      default:
        return 'bg-red-50';
    }
  };

  return (
    <View className={`p-4 m-4 rounded-lg border ${getBorderColor()} ${getBackgroundColor()}`}>
      <View className="flex-row items-center">
        {showIcon && (
          <Ionicons
            name={getIconName() as any}
            size={24}
            color={getIconColor()}
            style={{ marginRight: 12 }}
          />
        )}
        <Text className="flex-1 text-gray-700 text-base">
          {message}
        </Text>
      </View>
      
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          className="mt-3 bg-blue-500 py-2 px-4 rounded-md self-start"
        >
          <Text className="text-white font-medium">Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ErrorMessage;