import { create } from 'zustand';
import { api } from '../services/apiClient';
import { cacheStorage } from '../services/storageService';
import { RoadmapState, FarmingRoadmap, RoadmapGenerationRequest } from '../types';

export const useRoadmapStore = create<RoadmapState>((set, get) => ({
  roadmaps: [],
  activeRoadmap: null,
  isLoading: false,
  isGenerating: false,

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setGenerating: (generating: boolean) => set({ isGenerating: generating }),
  setActiveRoadmap: (roadmap: FarmingRoadmap | null) => set({ activeRoadmap: roadmap }),

  generateRoadmap: async (request: RoadmapGenerationRequest, token: string) => {
    try {
      set({ isGenerating: true });
      
      const response = await api.post<FarmingRoadmap>('/roadmap/generate', request);
      
      const updatedRoadmaps = [response, ...get().roadmaps];
      set({
        roadmaps: updatedRoadmaps,
        activeRoadmap: response,
        isGenerating: false,
      });
      
      // Cache the updated roadmaps
      await cacheStorage.setRoadmapCache(updatedRoadmaps);
      
      return response;
    } catch (error) {
      set({ isGenerating: false });
      throw error;
    }
  },

  getUserRoadmaps: async (token: string) => {
    try {
      set({ isLoading: true });
      
      // Try to get cached data first
      const cachedRoadmaps = await cacheStorage.getRoadmapCache();
      if (cachedRoadmaps && cachedRoadmaps.length > 0) {
        set({ roadmaps: cachedRoadmaps, isLoading: false });
      }
      
      // Fetch fresh data from API
      const response = await api.get<FarmingRoadmap[]>('/roadmap/user');
      
      set({ roadmaps: response, isLoading: false });
      
      // Cache the response
      await cacheStorage.setRoadmapCache(response);
    } catch (error) {
      set({ isLoading: false });
      
      // If API fails but we have cached data, use that
      const cachedRoadmaps = await cacheStorage.getRoadmapCache();
      if (cachedRoadmaps && cachedRoadmaps.length > 0) {
        set({ roadmaps: cachedRoadmaps });
      } else {
        throw error;
      }
    }
  },

  updateMilestone: async (roadmapId: string, milestoneId: string, status: string, notes?: string, token?: string) => {
    try {
      if (token) {
        await api.put(`/roadmap/${roadmapId}/progress`, { milestoneId, status, notes });
      }

      // Update local state
      set(state => {
        const updatedRoadmaps = state.roadmaps.map(roadmap => {
          if (roadmap.id === roadmapId) {
            const updatedMilestones = roadmap.milestones.map(milestone => {
              if (milestone.id === milestoneId) {
                return {
                  ...milestone,
                  status: status as any,
                  notes,
                  completedAt: status === 'completed' ? new Date().toISOString() : milestone.completedAt,
                };
              }
              return milestone;
            });

            // Calculate progress
            const completedMilestones = updatedMilestones.filter(m => m.status === 'completed').length;
            const progress = Math.round((completedMilestones / updatedMilestones.length) * 100);

            const updatedRoadmap = {
              ...roadmap,
              milestones: updatedMilestones,
              progress,
            };

            return updatedRoadmap;
          }
          return roadmap;
        });

        const updatedActiveRoadmap = state.activeRoadmap?.id === roadmapId 
          ? updatedRoadmaps.find(r => r.id === roadmapId) || null
          : state.activeRoadmap;

        return {
          roadmaps: updatedRoadmaps,
          activeRoadmap: updatedActiveRoadmap,
        };
      });
    } catch (error) {
      throw error;
    }
  },
}));