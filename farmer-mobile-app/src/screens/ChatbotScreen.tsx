"use client"

import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Dimensions,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Audio } from "expo-av"
import * as Speech from "expo-speech"
import { useChatStore } from "../store/chatStore"
import { useAuthStore } from "../store/authStore"
import type { ChatMessage } from "../types"
import { Colors, Typography, Spacing, BorderRadius } from "../constants/DesignSystem"

const { width } = Dimensions.get("window")

function ChatbotScreen() {
  const { messages, isLoading, isRecording, sendMessage, sendVoiceMessage, setRecording } = useChatStore()
  const { token } = useAuthStore()
  const [inputText, setInputText] = useState("")
  const [recording, setRecordingState] = useState<Audio.Recording | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputText.trim() || !token) return

    const messageText = inputText.trim()
    setInputText("")

    try {
      await sendMessage(messageText, token)
    } catch (error) {
      console.error("Error sending message:", error)
      Alert.alert("Error", "Failed to send message. Please try again.")
    }
  }

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission Required", "Microphone permission is needed for voice messages.", [{ text: "OK" }])
        return
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      const { recording: newRecording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)

      setRecordingState(newRecording)
      setRecording(true)
    } catch (error) {
      console.error("Failed to start recording:", error)
      Alert.alert("Error", "Failed to start recording. Please try again.")
    }
  }

  const stopRecording = async () => {
    if (!recording || !token) return

    try {
      setRecording(false)
      await recording.stopAndUnloadAsync()

      const uri = recording.getURI()
      if (uri) {
        await sendVoiceMessage(uri, token)
      }

      setRecordingState(null)
    } catch (error) {
      console.error("Failed to stop recording:", error)
      Alert.alert("Error", "Failed to process voice message. Please try again.")
    }
  }

  const speakMessage = async (text: string) => {
    if (isSpeaking) {
      Speech.stop()
      setIsSpeaking(false)
      return
    }

    try {
      setIsSpeaking(true)
      await Speech.speak(text, {
        language: "en-US",
        pitch: 1.0,
        rate: 0.8,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      })
    } catch (error) {
      console.error("Error with text-to-speech:", error)
      setIsSpeaking(false)
    }
  }

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.messageContainerUser : styles.messageContainerBot]}>
      <View style={[styles.messageBubble, item.isUser ? styles.messageBubbleUser : styles.messageBubbleBot]}>
        <Text style={[styles.messageText, item.isUser ? styles.messageTextUser : styles.messageTextBot]}>
          {item.text}
        </Text>
        <Text style={[styles.messageTime, item.isUser ? styles.messageTimeUser : styles.messageTimeBot]}>
          {new Date(item.timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>

      {/* Text-to-Speech button for bot messages */}
      {!item.isUser && (
        <TouchableOpacity onPress={() => speakMessage(item.text)} style={styles.speakButton}>
          <Text style={styles.speakButtonText}>{isSpeaking ? "🔊 Stop" : "🔊 Listen"}</Text>
        </TouchableOpacity>
      )}
    </View>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      {/* Header */}
      <View style={styles.welcomeHeader}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeButton}>
          <Ionicons name="home-outline" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Welcome Content */}
      <View style={styles.welcomeContent}>
        <View style={styles.farmerImageContainer}>
          <View style={styles.farmerPlaceholder}>
            <Text style={styles.placeholderText}>👨‍🌾</Text>
          </View>
        </View>

        <Text style={styles.welcomeTitle}>Welcome to Farm Assistant</Text>
        <Text style={styles.welcomeDescription}>
          I'm here to help you with farming questions, crop advice, weather information, and more. You can ask me
          through text, upload images of your crops, or use voice messages.
        </Text>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setInputText("How can I improve my crop yield?")
            }}
          >
            <View style={styles.actionButtonIcon}>
              <Ionicons name="chatbubble-outline" size={20} color="white" />
            </View>
            <Text style={styles.actionButtonText}>Ask Questions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Alert.alert("Upload Images", "Image upload feature coming soon!")
            }}
          >
            <View style={styles.actionButtonIcon}>
              <Ionicons name="camera-outline" size={20} color="white" />
            </View>
            <Text style={styles.actionButtonText}>Upload Images</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              if (!isRecording) {
                startRecording()
              }
            }}
          >
            <View style={styles.actionButtonIcon}>
              <Ionicons name="mic-outline" size={20} color="white" />
            </View>
            <Text style={styles.actionButtonText}>Voice Messages</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>Thinking...</Text>
        </View>
      )}

      {/* Input Area */}
      <View style={styles.inputArea}>
        <View style={styles.inputRow}>
          {/* Text Input */}
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your farming question here..."
            placeholderTextColor={Colors.textTertiary}
            style={styles.textInput}
            multiline
            maxLength={500}
            editable={!isLoading && !isRecording}
          />

          {/* Send Button */}
          <TouchableOpacity
            onPress={handleSendMessage}
            style={[
              styles.sendButton,
              inputText.trim() && !isLoading && !isRecording ? styles.sendButtonActive : styles.sendButtonInactive,
            ]}
            disabled={!inputText.trim() || isLoading || isRecording}
          >
            <Ionicons name="send" size={20} color={Colors.textInverse} />
          </TouchableOpacity>

          {/* Voice Recording Button */}
          <TouchableOpacity
            onPress={isRecording ? stopRecording : startRecording}
            style={[styles.voiceButton, isRecording ? styles.voiceButtonRecording : styles.voiceButtonIdle]}
            disabled={isLoading}
          >
            <Ionicons name={isRecording ? "stop" : "mic"} size={20} color={Colors.textInverse} />
          </TouchableOpacity>
        </View>

        {/* Recording indicator */}
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <Text style={styles.recordingText}>🔴 Recording... Tap stop when finished</Text>
          </View>
        )}

        {/* Character count */}
        <Text style={styles.characterCount}>{inputText.length}/500</Text>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  messageContainer: {
    marginBottom: Spacing.lg,
  },
  messageContainerUser: {
    alignItems: "flex-end",
  },
  messageContainerBot: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  messageBubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  messageBubbleBot: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTextUser: {
    color: Colors.textInverse,
  },
  messageTextBot: {
    color: Colors.textPrimary,
  },
  messageTime: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  messageTimeUser: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  messageTimeBot: {
    color: Colors.textTertiary,
  },
  speakButton: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.primary + "20",
    borderRadius: BorderRadius.full,
  },
  speakButtonText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: Typography.medium,
  },
  emptyState: {
    flex: 1,
  },
  welcomeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#21825C",
    alignItems: "center",
    justifyContent: "center",
  },
  homeButton: {
    padding: Spacing.sm,
  },
  welcomeContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  welcomeDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  farmerImageContainer: {
    marginBottom: Spacing.xl,
  },
  farmerPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
  },
  placeholderText: {
    fontSize: 40,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    width: "100%",
    gap: Spacing.md,
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    backgroundColor: "white",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: "center",
    gap: Spacing.sm,
  },
  actionButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#21825C",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: Typography.medium,
    color: Colors.textPrimary,
    textAlign: "center",
  },
  loadingContainer: {
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  loadingText: {
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    fontSize: 14,
  },
  inputArea: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    color: Colors.textPrimary,
    maxHeight: 100,
    minHeight: 44,
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  voiceButtonRecording: {
    backgroundColor: Colors.error,
  },
  voiceButtonIdle: {
    backgroundColor: "#21825C",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonActive: {
    backgroundColor: "#21825C",
  },
  sendButtonInactive: {
    backgroundColor: Colors.textTertiary,
  },
  buttonText: {
    color: Colors.textInverse,
    fontSize: 18,
  },
  recordingIndicator: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: "#fef2f2",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: "#fca5a5",
  },
  recordingText: {
    color: "#b91c1c",
    textAlign: "center",
    fontSize: 14,
  },
  characterCount: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
    textAlign: "right",
  },
})

export { ChatbotScreen }
export default ChatbotScreen
