import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChatbotScreen from '../src/screens/ChatbotScreen';

export default function ChatTab() {
  return (
    <SafeAreaView style={styles.container}>
      <ChatbotScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});