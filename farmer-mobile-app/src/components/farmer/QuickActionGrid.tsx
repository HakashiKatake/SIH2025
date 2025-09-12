import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { IllustrationPlaceholder } from '../ui/IllustrationPlaceholder';

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  route: string;
  iconColor: string;
  backgroundColor: string;
  gradientFrom: string;
  gradientTo: string;
}

interface QuickActionGridProps {
  actions?: QuickAction[];
}

const defaultActions: QuickAction[] = [
  {
    id: 'field-map',
    title: 'Field Map',
    subtitle: 'View your fields',
    route: '/(tabs)/farmer/field',
    iconColor: '#22c55e',
    backgroundColor: '#22c55e',
    gradientFrom: '#dcfce7',
    gradientTo: '#bbf7d0',
  },
  {
    id: 'weather',
    title: 'Weather',
    subtitle: 'Forecast & alerts',
    route: '/(tabs)/farmer/weather',
    iconColor: '#3b82f6',
    backgroundColor: '#3b82f6',
    gradientFrom: '#dbeafe',
    gradientTo: '#bfdbfe',
  },
  {
    id: 'calendar',
    title: 'Calendar',
    subtitle: 'Crop activities',
    route: '/(tabs)/farmer/field',
    iconColor: '#f59e0b',
    backgroundColor: '#f59e0b',
    gradientFrom: '#fef3c7',
    gradientTo: '#fde68a',
  },
  {
    id: 'crop-safety-test',
    title: 'Crop Safety Test',
    subtitle: 'MRL Calculator',
    route: '/(tabs)/farmer/field',
    iconColor: '#8b5cf6',
    backgroundColor: '#8b5cf6',
    gradientFrom: '#ede9fe',
    gradientTo: '#ddd6fe',
  },
];

export const QuickActionGrid: React.FC<QuickActionGridProps> = ({
  actions = defaultActions,
}) => {
  const handleActionPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
      <Text className="text-lg font-semibold text-gray-800 mb-4">
        Quick Actions
      </Text>
      <View className="flex-row flex-wrap justify-between">
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            className="w-[48%] mb-3"
            onPress={() => handleActionPress(action.route)}
            style={{
              backgroundColor: action.gradientFrom,
              borderRadius: 12,
              padding: 16,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <View className="items-center">
              <View 
                className="w-12 h-12 rounded-full items-center justify-center mb-3"
                style={{ backgroundColor: action.backgroundColor }}
              >
                <IllustrationPlaceholder 
                  width={24} 
                  height={24} 
                  borderRadius={4}
                  backgroundColor="rgba(255,255,255,0.3)"
                  alt={`${action.title} icon`}
                />
              </View>
              <Text 
                className="font-semibold text-center text-sm"
                style={{ color: action.backgroundColor }}
              >
                {action.title}
              </Text>
              <Text 
                className="text-xs text-center mt-1"
                style={{ color: action.iconColor, opacity: 0.7 }}
              >
                {action.subtitle}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};