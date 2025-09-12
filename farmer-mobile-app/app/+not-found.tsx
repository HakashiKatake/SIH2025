import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaContainer } from '../src/components/ui/SafeAreaContainer';
import { ActionButton } from '../src/components/ui/ActionButton';

export default function NotFoundScreen() {
  const handleGoHome = () => {
    router.replace('/');
  };

  return (
    <SafeAreaContainer backgroundColor="#f0fdf4" statusBarStyle="dark-content">
      <View style={styles.container}>
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.subtitle}>
          The page you're looking for doesn't exist.
        </Text>
        
        <View style={styles.buttonContainer}>
          <ActionButton
            title="Go to Home"
            variant="primary"
            size="large"
            onPress={handleGoHome}
          />
        </View>
      </View>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#21825C',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
});