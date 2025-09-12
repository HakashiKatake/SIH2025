import { create } from 'zustand';
import { api } from '../services/apiClient';
import { cacheStorage } from '../services/storageService';
import { CropAnalysisState, CropAnalysis } from '../types';

export const useCropStore = create<CropAnalysisState>((set, get) => ({
  analyses: [],
  currentAnalysis: null,
  isLoading: false,
  isUploading: false,

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setCurrentAnalysis: (analysis: CropAnalysis | null) => set({ currentAnalysis: analysis }),

  analyzeImage: async (imageUri: string, token: string): Promise<CropAnalysis> => {
    try {
      set({ isUploading: true });

      // Create FormData for image upload
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'crop-image.jpg',
      } as any);

      const response = await api.postFormData<CropAnalysis>('/crops/analyze', formData);

      // Add to analyses list and cache
      set(state => {
        const updatedAnalyses = [response, ...state.analyses];
        // Cache the updated analyses
        cacheStorage.setCropAnalysisCache(updatedAnalyses);
        
        return {
          analyses: updatedAnalyses,
          currentAnalysis: response,
          isUploading: false,
        };
      });
      
      return response;
    } catch (error) {
      set({ isUploading: false });
      throw error;
    }
  },

  getHistory: async (token: string) => {
    try {
      set({ isLoading: true });

      // Try to get cached data first
      const cachedAnalyses = await cacheStorage.getCropAnalysisCache();
      if (cachedAnalyses && cachedAnalyses.length > 0) {
        set({
          analyses: cachedAnalyses,
          isLoading: false,
        });
      }

      // Fetch fresh data from API
      const response = await api.get<CropAnalysis[]>('/crops/history');

      // Update state and cache
      set({
        analyses: response,
        isLoading: false,
      });
      
      await cacheStorage.setCropAnalysisCache(response);
    } catch (error) {
      set({ isLoading: false });
      
      // If API fails but we have cached data, use that
      const cachedAnalyses = await cacheStorage.getCropAnalysisCache();
      if (cachedAnalyses && cachedAnalyses.length > 0) {
        set({ analyses: cachedAnalyses });
      } else {
        throw error;
      }
    }
  },

  // Load cached data on app start
  loadCachedData: async () => {
    try {
      const cachedAnalyses = await cacheStorage.getCropAnalysisCache();
      if (cachedAnalyses && cachedAnalyses.length > 0) {
        set({ analyses: cachedAnalyses });
      }
    } catch (error) {
      console.error('Error loading cached crop analyses:', error);
    }
  },
}));