import { create } from 'zustand';
import { api } from '../services/apiClient';
import { cacheStorage } from '../services/storageService';
import { ChatState, ChatMessage, ChatResponse } from '../types';

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  isRecording: false,

  sendMessage: async (message: string, token: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    set({ 
      messages: [...get().messages, userMessage],
      isLoading: true 
    });

    try {
      const response = await api.post<ChatResponse>('/chat/query', {
        query: message,
        language: 'en',
      });

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isUser: false,
        timestamp: new Date().toISOString(),
        audioUrl: response.audioUrl,
      };

      const updatedMessages = [...get().messages, botMessage];
      set({ messages: updatedMessages });
      
      // Cache chat history
      await cacheStorage.setChatHistory(updatedMessages);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Mock response for development
      const mockResponses = [
        "Based on your query, I recommend checking soil moisture levels and ensuring proper drainage.",
        "For pest control, consider using neem oil spray early in the morning or evening.",
        "The best time for sowing depends on your location and crop type. Generally, monsoon season is ideal for most crops.",
        "Regular monitoring of your crops is essential. Look for signs of yellowing leaves or pest damage.",
        "Organic fertilizers like compost and vermicompost are excellent for soil health and crop nutrition.",
      ];

      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        isUser: false,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...get().messages, botMessage];
      set({ messages: updatedMessages });
      
      // Cache even mock responses
      await cacheStorage.setChatHistory(updatedMessages);
    } finally {
      set({ isLoading: false });
    }
  },

  sendVoiceMessage: async (audioUri: string, token: string) => {
    set({ isLoading: true });

    try {
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'voice_message.m4a',
      } as any);
      formData.append('language', 'en');

      const response = await api.postFormData<ChatResponse>('/chat/voice', formData);

      // Add transcribed user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        text: response.transcription || 'Voice message sent',
        isUser: true,
        timestamp: new Date().toISOString(),
      };

      // Add bot response
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isUser: false,
        timestamp: new Date().toISOString(),
        audioUrl: response.audioUrl,
      };

      const updatedMessages = [...get().messages, userMessage, botMessage];
      set({ messages: updatedMessages });
      
      // Cache chat history
      await cacheStorage.setChatHistory(updatedMessages);
    } catch (error) {
      console.error('Error sending voice message:', error);
      
      // Mock voice response for development
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        text: 'Voice message: How can I improve my crop yield?',
        isUser: true,
        timestamp: new Date().toISOString(),
      };

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'To improve crop yield, focus on soil health, proper irrigation, timely fertilization, and pest management. Regular monitoring is also crucial.',
        isUser: false,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...get().messages, userMessage, botMessage];
      set({ messages: updatedMessages });
      
      // Cache mock responses too
      await cacheStorage.setChatHistory(updatedMessages);
    } finally {
      set({ isLoading: false });
    }
  },

  setRecording: (recording: boolean) => set({ isRecording: recording }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  clearMessages: () => set({ messages: [] }),

  // Load cached chat history
  loadCachedMessages: async () => {
    try {
      const cachedMessages = await cacheStorage.getChatHistory();
      if (cachedMessages && cachedMessages.length > 0) {
        set({ messages: cachedMessages });
      }
    } catch (error) {
      console.error('Error loading cached chat messages:', error);
    }
  },
}));