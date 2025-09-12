import React from 'react';
import { View, StatusBar, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SafeAreaContainerProps {
  children: React.ReactNode;
  backgroundColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
  style?: ViewStyle;
}

export const SafeAreaContainer: React.FC<SafeAreaContainerProps> = ({
  children,
  backgroundColor = '#f8fafc',
  statusBarStyle = 'dark-content',
  style,
}) => {
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor }, style]}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} />
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </SafeAreaView>
  );
};