import { create } from 'zustand';
import { FieldService, CropService, PesticideService } from '../services/fieldService';
import { Field, Crop, CropStage, PesticideApplication } from '../types';
import { cacheStorage } from '../services/storageService';

interface FieldState {
  fields: Field[];
  crops: Crop[];
  isLoading: boolean;
  selectedField: Field | null;
  selectedCrop: Crop | null;
  
  // Actions
  setLoading: (loading: boolean) => void;
  setSelectedField: (field: Field | null) => void;
  setSelectedCrop: (crop: Crop | null) => void;
  
  // Field management (API integrated)
  loadFields: (token: string) => Promise<void>;
  createField: (fieldData: any, token: string) => Promise<Field>;
  updateField: (fieldId: string, updates: any, token: string) => Promise<void>;
  deleteField: (fieldId: string, token: string) => Promise<void>;
  
  // Crop management (API integrated)
  loadCrops: (token: string) => Promise<void>;
  loadCropsByField: (fieldId: string, token: string) => Promise<void>;
  createCrop: (cropData: any, token: string) => Promise<Crop>;
  updateCrop: (cropId: string, updates: any, token: string) => Promise<void>;
  deleteCrop: (cropId: string, token: string) => Promise<void>;
  updateCropStage: (cropId: string, stage: CropStage, notes?: string, token?: string) => Promise<void>;
  
  // Pesticide management (API integrated)
  recordPesticideApplication: (applicationData: any, token: string) => Promise<void>;
  loadPesticideApplications: (cropId: string, token: string) => Promise<void>;
  
  // Local field management (fallback)
  addField: (field: Omit<Field, 'id' | 'createdAt'>) => void;
  addCrop: (crop: Omit<Crop, 'id'>) => void;
  addPesticideApplication: (application: Omit<PesticideApplication, 'id'>) => void;
  
  // Data persistence
  loadCachedData: () => Promise<void>;
  saveCachedData: () => Promise<void>;
  
  // Utility functions
  getCropsByField: (fieldId: string) => Crop[];
  getActiveCrops: () => Crop[];
  getCropsNeedingAttention: () => Crop[];
}

export const useFieldStore = create<FieldState>((set, get) => ({
  fields: [],
  crops: [],
  isLoading: false,
  selectedField: null,
  selectedCrop: null,

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setSelectedField: (field: Field | null) => set({ selectedField: field }),
  setSelectedCrop: (crop: Crop | null) => set({ selectedCrop: crop }),

  // API-integrated field management
  loadFields: async (token: string) => {
    try {
      set({ isLoading: true });
      const fields = await FieldService.getFields();
      set({ fields, isLoading: false });
      get().saveCachedData();
    } catch (error: any) {
      console.error('Load fields failed:', error);
      set({ isLoading: false });
      
      // Load cached data on error
      await get().loadCachedData();
      throw error;
    }
  },

  createField: async (fieldData: any, token: string) => {
    try {
      const newField = await FieldService.createField(fieldData);
      set(state => ({ fields: [...state.fields, newField] }));
      get().saveCachedData();
      return newField;
    } catch (error: any) {
      console.error('Create field failed:', error);
      
      // Fallback to local creation
      const localField: Field = {
        ...fieldData,
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      set(state => ({ fields: [...state.fields, localField] }));
      get().saveCachedData();
      return localField;
    }
  },

  updateField: async (fieldId: string, updates: any, token: string) => {
    try {
      const updatedField = await FieldService.updateField(fieldId, updates);
      set(state => ({
        fields: state.fields.map(field => 
          field.id === fieldId ? updatedField : field
        )
      }));
      get().saveCachedData();
    } catch (error: any) {
      console.error('Update field failed:', error);
      
      // Fallback to local update
      set(state => ({
        fields: state.fields.map(field => 
          field.id === fieldId ? { ...field, ...updates } : field
        )
      }));
      get().saveCachedData();
      throw error;
    }
  },

  deleteField: async (fieldId: string, token: string) => {
    try {
      await FieldService.deleteField(fieldId);
      set(state => ({
        fields: state.fields.filter(field => field.id !== fieldId),
        crops: state.crops.filter(crop => crop.fieldId !== fieldId),
      }));
      get().saveCachedData();
    } catch (error: any) {
      console.error('Delete field failed:', error);
      
      // Fallback to local delete
      set(state => ({
        fields: state.fields.filter(field => field.id !== fieldId),
        crops: state.crops.filter(crop => crop.fieldId !== fieldId),
      }));
      get().saveCachedData();
      throw error;
    }
  },

  // API-integrated crop management
  loadCrops: async (token: string) => {
    try {
      set({ isLoading: true });
      const crops = await CropService.getCrops();
      set({ crops, isLoading: false });
      get().saveCachedData();
    } catch (error: any) {
      console.error('Load crops failed:', error);
      set({ isLoading: false });
      
      // Load cached data on error
      await get().loadCachedData();
      throw error;
    }
  },

  loadCropsByField: async (fieldId: string, token: string) => {
    try {
      set({ isLoading: true });
      const fieldCrops = await CropService.getCropsByField(fieldId);
      
      // Update only crops for this field
      set(state => ({
        crops: [
          ...state.crops.filter(crop => crop.fieldId !== fieldId),
          ...fieldCrops
        ],
        isLoading: false
      }));
      get().saveCachedData();
    } catch (error: any) {
      console.error('Load crops by field failed:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  createCrop: async (cropData: any, token: string) => {
    try {
      const newCrop = await CropService.createCrop(cropData);
      set(state => ({ crops: [...state.crops, newCrop] }));
      get().saveCachedData();
      return newCrop;
    } catch (error: any) {
      console.error('Create crop failed:', error);
      
      // Fallback to local creation
      const localCrop: Crop = {
        ...cropData,
        id: Date.now().toString(),
      };
      set(state => ({ crops: [...state.crops, localCrop] }));
      get().saveCachedData();
      return localCrop;
    }
  },

  updateCrop: async (cropId: string, updates: any, token: string) => {
    try {
      const updatedCrop = await CropService.updateCrop(cropId, updates);
      set(state => ({
        crops: state.crops.map(crop => 
          crop.id === cropId ? updatedCrop : crop
        )
      }));
      get().saveCachedData();
    } catch (error: any) {
      console.error('Update crop failed:', error);
      
      // Fallback to local update
      set(state => ({
        crops: state.crops.map(crop => 
          crop.id === cropId ? { ...crop, ...updates } : crop
        )
      }));
      get().saveCachedData();
      throw error;
    }
  },

  deleteCrop: async (cropId: string, token: string) => {
    try {
      await CropService.deleteCrop(cropId);
      set(state => ({
        crops: state.crops.filter(crop => crop.id !== cropId)
      }));
      get().saveCachedData();
    } catch (error: any) {
      console.error('Delete crop failed:', error);
      
      // Fallback to local delete
      set(state => ({
        crops: state.crops.filter(crop => crop.id !== cropId)
      }));
      get().saveCachedData();
      throw error;
    }
  },

  updateCropStage: async (cropId: string, stage: CropStage, notes?: string, token?: string) => {
    try {
      if (token) {
        const updatedCrop = await CropService.updateCropStage(cropId, stage, notes);
        set(state => ({
          crops: state.crops.map(crop => 
            crop.id === cropId ? updatedCrop : crop
          )
        }));
      } else {
        // Local update
        set(state => ({
          crops: state.crops.map(crop => 
            crop.id === cropId ? { ...crop, currentStage: stage } : crop
          )
        }));
      }
      get().saveCachedData();
    } catch (error: any) {
      console.error('Update crop stage failed:', error);
      
      // Fallback to local update
      set(state => ({
        crops: state.crops.map(crop => 
          crop.id === cropId ? { ...crop, currentStage: stage } : crop
        )
      }));
      get().saveCachedData();
      throw error;
    }
  },

  // API-integrated pesticide management
  recordPesticideApplication: async (applicationData: any, token: string) => {
    try {
      const application = await PesticideService.recordApplication(applicationData);
      
      // Update the crop with the new application
      const crop = get().crops.find(c => c.id === applicationData.cropId);
      if (crop) {
        get().updateCrop(crop.id, {
          pesticidesUsed: [...crop.pesticidesUsed, application]
        }, token);
      }
    } catch (error: any) {
      console.error('Record pesticide application failed:', error);
      
      // Fallback to local addition
      get().addPesticideApplication(applicationData);
      throw error;
    }
  },

  loadPesticideApplications: async (cropId: string, token: string) => {
    try {
      const applications = await PesticideService.getApplicationsByCrop(cropId);
      
      // Update the crop with loaded applications
      set(state => ({
        crops: state.crops.map(crop => 
          crop.id === cropId ? { ...crop, pesticidesUsed: applications } : crop
        )
      }));
      get().saveCachedData();
    } catch (error: any) {
      console.error('Load pesticide applications failed:', error);
      throw error;
    }
  },

  // Local field management (fallback)

  addField: (fieldData) => {
    const newField: Field = {
      ...fieldData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    set((state) => ({
      fields: [...state.fields, newField],
    }));
    
    get().saveCachedData();
  },

  updateField: (fieldId: string, updates: Partial<Field>) => {
    set((state) => ({
      fields: state.fields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    }));
    
    get().saveCachedData();
  },

  deleteField: (fieldId: string) => {
    set((state) => ({
      fields: state.fields.filter((field) => field.id !== fieldId),
      crops: state.crops.filter((crop) => crop.fieldId !== fieldId),
    }));
    
    get().saveCachedData();
  },

  addCrop: (cropData) => {
    const newCrop: Crop = {
      ...cropData,
      id: Date.now().toString(),
    };
    
    set((state) => ({
      crops: [...state.crops, newCrop],
    }));
    
    get().saveCachedData();
  },

  updateCrop: (cropId: string, updates: Partial<Crop>) => {
    set((state) => ({
      crops: state.crops.map((crop) =>
        crop.id === cropId ? { ...crop, ...updates } : crop
      ),
    }));
    
    get().saveCachedData();
  },

  deleteCrop: (cropId: string) => {
    set((state) => ({
      crops: state.crops.filter((crop) => crop.id !== cropId),
    }));
    
    get().saveCachedData();
  },

  updateCropStage: (cropId: string, stage: CropStage) => {
    get().updateCrop(cropId, { currentStage: stage });
  },

  addPesticideApplication: (applicationData) => {
    const newApplication: PesticideApplication = {
      ...applicationData,
      id: Date.now().toString(),
    };
    
    const crop = get().crops.find((c) => c.id === applicationData.cropId);
    if (crop) {
      get().updateCrop(crop.id, {
        pesticidesUsed: [...crop.pesticidesUsed, newApplication],
      });
    }
  },

  loadCachedData: async () => {
    try {
      const cachedFields = await cacheStorage.getItem<Field[]>('fields');
      const cachedCrops = await cacheStorage.getItem<Crop[]>('crops');
      
      if (cachedFields) {
        set({ fields: cachedFields });
      }
      
      if (cachedCrops) {
        set({ crops: cachedCrops });
      }
    } catch (error) {
      console.error('Error loading cached field data:', error);
    }
  },

  saveCachedData: async () => {
    try {
      const { fields, crops } = get();
      await cacheStorage.setItem('fields', fields);
      await cacheStorage.setItem('crops', crops);
    } catch (error) {
      console.error('Error saving field data to cache:', error);
    }
  },

  getCropsByField: (fieldId: string) => {
    return get().crops.filter((crop) => crop.fieldId === fieldId);
  },

  getActiveCrops: () => {
    return get().crops.filter((crop) => crop.currentStage !== CropStage.HARVESTED);
  },

  getCropsNeedingAttention: () => {
    const now = new Date();
    return get().crops.filter((crop) => {
      // Check if harvest date is approaching (within 7 days)
      const harvestDate = new Date(crop.expectedHarvestDate);
      const daysUntilHarvest = Math.ceil((harvestDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check if any pesticide applications have safety periods ending soon
      const hasPendingSafetyPeriod = crop.pesticidesUsed.some((app) => {
        const safeDate = new Date(app.safeHarvestDate);
        const daysUntilSafe = Math.ceil((safeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilSafe > 0 && daysUntilSafe <= 7;
      });
      
      return (daysUntilHarvest <= 7 && daysUntilHarvest > 0) || hasPendingSafetyPeriod;
    });
  },
}));