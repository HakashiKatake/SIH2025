import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/DesignSystem';
import { textToSpeechService } from '../../services/textToSpeechService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TTSSettingsProps {
  onToggle?: (enabled: boolean) => void;
}

export const TTSSettings: React.FC<TTSSettingsProps> = ({ onToggle }) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTTSSettings();
  }, []);

  const loadTTSSettings = async () => {
    try {
      const savedSetting = await AsyncStorage.getItem('tts-enabled');
      const enabled = savedSetting !== null ? JSON.parse(savedSetting) : true;
      setIsEnabled(enabled);
      textToSpeechService.setEnabled(enabled);
    } catch (error) {
      console.warn('Failed to load TTS settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (value: boolean) => {
    try {
      setIsEnabled(value);
      textToSpeechService.setEnabled(value);
      await AsyncStorage.setItem('tts-enabled', JSON.stringify(value));
      onToggle?.(value);
      
      // Provide feedback when enabling
      if (value) {
        setTimeout(() => {
          textToSpeechService.speak('Voice feedback enabled');
        }, 500);
      }
    } catch (error) {
      console.warn('Failed to save TTS settings:', error);
    }
  };

  const testTTS = async () => {
    if (isEnabled) {
      await textToSpeechService.speak('This is a test of the voice feedback system');
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name="volume-high" 
            size={24} 
            color={isEnabled ? Colors.primary : Colors.textSecondary} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Voice Feedback</Text>
          <Text style={styles.subtitle}>
            Hear tab names when navigating
          </Text>
        </View>
        <Switch
          value={isEnabled}
          onValueChange={handleToggle}
          trackColor={{ 
            false: Colors.borderLight, 
            true: Colors.primaryLight 
          }}
          thumbColor={isEnabled ? Colors.primary : Colors.textTertiary}
          ios_backgroundColor={Colors.borderLight}
        />
      </View>
      
      {isEnabled && (
        <TouchableOpacity 
          style={styles.testButton}
          onPress={testTTS}
          activeOpacity={0.7}
        >
          <Ionicons name="play" size={16} color={Colors.primary} />
          <Text style={styles.testButtonText}>Test Voice</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginVertical: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: Typography.bodyLarge,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.sm,
  },
  testButtonText: {
    fontSize: Typography.bodyMedium,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: Spacing.sm,
  },
});

export default TTSSettings;