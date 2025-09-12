import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaContainer } from '../../../src/components/ui/SafeAreaContainer';
import { Header } from '../../../src/components/ui/Header';
import { DealerIllustration } from '../../../src/components/ui/IllustrationPlaceholder';
import { ActionButton } from '../../../src/components/ui/ActionButton';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../src/constants/DesignSystem';
import { useChatStore } from '../../../src/store/chatStore';
import { useAuthStore } from '../../../src/store/authStore';
import { ChatMessage } from '../../../src/types';

export default function DealerChat() {
  const [message, setMessage] = useState('');
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    loadCachedMessages 
  } = useChatStore();
  const { token } = useAuthStore();

  useEffect(() => {
    // Load cached messages when component mounts
    loadCachedMessages?.();
  }, []);

  const handleSendMessage = async () => {
    if (message.trim() && token) {
      await sendMessage(message.trim(), token);
      setMessage('');
    }
  };

  const handleQuickAction = async (actionType: string) => {
    if (!token) return;

    const quickMessages = {
      'business-insights': 'Can you provide me with business insights and market trends for agricultural products?',
      'inventory-management': 'I need help with inventory management and stock optimization. What are your recommendations?',
      'customer-support': 'I need assistance with customer support and order management. Can you help?',
    };

    const quickMessage = quickMessages[actionType as keyof typeof quickMessages];
    if (quickMessage) {
      await sendMessage(quickMessage, token);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessage : styles.botMessage
    ]}>
      <Text style={[
        styles.messageText,
        item.isUser ? styles.userMessageText : styles.botMessageText
      ]}>
        {item.text}
      </Text>
      <Text style={styles.messageTime}>
        {new Date(item.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      {/* Dealer Character Illustration */}
      <View style={styles.characterContainer}>
        <DealerIllustration size="large" />
      </View>

      {/* Welcome Message Bubble */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>
          Hello! I'm your business assistant. I can help you with market insights, inventory management, customer support, and business optimization. How can I assist you today?
        </Text>
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.quickActionsContainer}>
        <ActionButton
          title="Business Insights"
          variant="outline"
          size="medium"
          icon="analytics-outline"
          onPress={() => handleQuickAction('business-insights')}
          style={styles.quickActionButton}
        />
        
        <ActionButton
          title="Inventory Help"
          variant="outline"
          size="medium"
          icon="cube-outline"
          onPress={() => handleQuickAction('inventory-management')}
          style={styles.quickActionButton}
        />
        
        <ActionButton
          title="Customer Support"
          variant="outline"
          size="medium"
          icon="headset-outline"
          onPress={() => handleQuickAction('customer-support')}
          style={styles.quickActionButton}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaContainer>
      <Header 
        title="Business Assistant" 
        showBackButton={true}
        backgroundColor={Colors.info}
      />
      
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Chat Messages */}
        <View style={styles.messagesContainer}>
          {messages.length === 0 ? (
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {renderEmptyState()}
            </ScrollView>
          ) : (
            <FlatList
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              inverted={false}
            />
          )}
        </View>

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your message here..."
              placeholderTextColor={Colors.textTertiary}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity 
              style={[
                styles.sendButton,
                (!message.trim() || isLoading) && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={!message.trim() || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <Ionicons name="hourglass-outline" size={20} color={Colors.textInverse} />
              ) : (
                <Ionicons name="send" size={20} color={Colors.textInverse} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  messagesContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing['2xl'],
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  characterContainer: {
    marginBottom: Spacing['3xl'],
    alignItems: 'center',
  },
  welcomeContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing['3xl'],
    maxWidth: 320,
    ...Shadows.md,
  },
  welcomeText: {
    fontSize: Typography.bodyLarge,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: Typography.medium,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.md,
    maxWidth: 320,
  },
  quickActionButton: {
    minWidth: 100,
    flex: 0,
  },
  messagesList: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  messageContainer: {
    marginVertical: Spacing.sm,
    maxWidth: '80%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.info,
    borderBottomRightRadius: Spacing.sm,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: Spacing.sm,
  },
  messageText: {
    fontSize: Typography.bodyMedium,
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  userMessageText: {
    color: Colors.textInverse,
  },
  botMessageText: {
    color: Colors.textPrimary,
  },
  messageTime: {
    fontSize: Typography.bodySmall,
    opacity: 0.7,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius['2xl'],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 44,
  },
  textInput: {
    flex: 1,
    fontSize: Typography.bodyLarge,
    color: Colors.textPrimary,
    maxHeight: 100,
    paddingVertical: Spacing.sm,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.info,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
    ...Shadows.sm,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.textTertiary,
    opacity: 0.6,
  },
});