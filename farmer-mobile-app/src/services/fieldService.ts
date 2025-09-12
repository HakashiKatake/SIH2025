import { api } from './apiClient';
import { Field, Crop, CropStage, PesticideApplication } from '../types';

export interface CreateFieldRequest {
  name: string;
  size: number;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  soilType: string;
}

export interface CreateCropRequest {
  fieldId: string;
  name: string;
  variety: string;
  plantingDate: string;
  expectedHarvestDate: string;
  currentStage: CropStage;
  notes?: string[];
  photos?: string[];
}

export interface MRLCalculationRequest {
  cropType: string;
  pesticide: string;
  applicationDate: string;
  harvestDate: string;
  quantity?: number;
  location?: {
    latitude: number;
    longitude: number;
    state: string;
    district: string;
  };
}

export interface MRLCalculationResult {
  id: string;
  cropType: string;
  pesticide: string;
  applicationDate: string;
  harvestDate: string;
  safeHarvestDate: string;
  mrlLimit: number;
  estimatedResidue: number;
  safetyStatus: 'safe' | 'warning' | 'unsafe';
  daysUntilSafe: number;
  recommendations: string[];
  regulatoryInfo: {
    mrlStandard: string;
    authority: string;
    lastUpdated: string;
  };
  createdAt: string;
}

export interface PesticideApplicationRequest {
  cropId: string;
  pesticideName: string;
  activeIngredient: string;
  applicationDate: string;
  quantity: number;
  method: string;
  notes?: string;
}

export class FieldService {
  /**
   * Get all fields for the current farmer
   */
  static async getFields(): Promise<Field[]> {
    try {
      const response = await api.get<{ fields: Field[] }>('/fields');
      return response.fields;
    } catch (error: any) {
      console.error('Get fields error:', error);
      
      if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to load fields.');
      }
    }
  }

  /**
   * Create a new field
   */
  static async createField(fieldData: CreateFieldRequest): Promise<Field> {
    try {
      const response = await api.post<{ field: Field }>('/fields', fieldData);
      return response.field;
    } catch (error: any) {
      console.error('Create field error:', error);
      
      if (error.status === 400) {
        throw new Error('Invalid field data. Please check all fields and try again.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to create field.');
      }
    }
  }

  /**
   * Update field information
   */
  static async updateField(fieldId: string, updates: Partial<CreateFieldRequest>): Promise<Field> {
    try {
      const response = await api.put<{ field: Field }>(`/fields/${fieldId}`, updates);
      return response.field;
    } catch (error: any) {
      console.error('Update field error:', error);
      
      if (error.status === 404) {
        throw new Error('Field not found.');
      } else if (error.status === 403) {
        throw new Error('You can only update your own fields.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to update field.');
      }
    }
  }

  /**
   * Delete a field
   */
  static async deleteField(fieldId: string): Promise<void> {
    try {
      await api.delete(`/fields/${fieldId}`);
    } catch (error: any) {
      console.error('Delete field error:', error);
      
      if (error.status === 404) {
        throw new Error('Field not found.');
      } else if (error.status === 403) {
        throw new Error('You can only delete your own fields.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to delete field.');
      }
    }
  }
}

export class CropService {
  /**
   * Get all crops for the current farmer
   */
  static async getCrops(): Promise<Crop[]> {
    try {
      const response = await api.get<{ crops: Crop[] }>('/crops/my-crops');
      return response.crops;
    } catch (error: any) {
      console.error('Get crops error:', error);
      
      if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to load crops.');
      }
    }
  }

  /**
   * Get crops for a specific field
   */
  static async getCropsByField(fieldId: string): Promise<Crop[]> {
    try {
      const response = await api.get<{ crops: Crop[] }>(`/fields/${fieldId}/crops`);
      return response.crops;
    } catch (error: any) {
      console.error('Get crops by field error:', error);
      
      if (error.status === 404) {
        throw new Error('Field not found.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to load crops for this field.');
      }
    }
  }

  /**
   * Create a new crop
   */
  static async createCrop(cropData: CreateCropRequest): Promise<Crop> {
    try {
      const response = await api.post<{ crop: Crop }>('/crops', cropData);
      return response.crop;
    } catch (error: any) {
      console.error('Create crop error:', error);
      
      if (error.status === 400) {
        throw new Error('Invalid crop data. Please check all fields and try again.');
      } else if (error.status === 404) {
        throw new Error('Field not found.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to create crop.');
      }
    }
  }

  /**
   * Update crop information
   */
  static async updateCrop(cropId: string, updates: Partial<CreateCropRequest>): Promise<Crop> {
    try {
      const response = await api.put<{ crop: Crop }>(`/crops/${cropId}`, updates);
      return response.crop;
    } catch (error: any) {
      console.error('Update crop error:', error);
      
      if (error.status === 404) {
        throw new Error('Crop not found.');
      } else if (error.status === 403) {
        throw new Error('You can only update your own crops.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to update crop.');
      }
    }
  }

  /**
   * Update crop stage
   */
  static async updateCropStage(cropId: string, stage: CropStage, notes?: string): Promise<Crop> {
    try {
      const response = await api.patch<{ crop: Crop }>(`/crops/${cropId}/stage`, { 
        stage, 
        notes 
      });
      return response.crop;
    } catch (error: any) {
      console.error('Update crop stage error:', error);
      
      if (error.status === 404) {
        throw new Error('Crop not found.');
      } else if (error.status === 403) {
        throw new Error('You can only update your own crops.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to update crop stage.');
      }
    }
  }

  /**
   * Delete a crop
   */
  static async deleteCrop(cropId: string): Promise<void> {
    try {
      await api.delete(`/crops/${cropId}`);
    } catch (error: any) {
      console.error('Delete crop error:', error);
      
      if (error.status === 404) {
        throw new Error('Crop not found.');
      } else if (error.status === 403) {
        throw new Error('You can only delete your own crops.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to delete crop.');
      }
    }
  }
}

export class MRLService {
  /**
   * Calculate MRL safety for pesticide application
   */
  static async calculateMRL(calculationData: MRLCalculationRequest): Promise<MRLCalculationResult> {
    try {
      const response = await api.post<{ calculation: MRLCalculationResult }>('/mrl/calculate', calculationData);
      return response.calculation;
    } catch (error: any) {
      console.error('MRL calculation error:', error);
      
      if (error.status === 400) {
        throw new Error('Invalid calculation data. Please check all fields and try again.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to calculate MRL.');
      }
    }
  }

  /**
   * Get MRL calculation history
   */
  static async getMRLHistory(): Promise<MRLCalculationResult[]> {
    try {
      const response = await api.get<{ calculations: MRLCalculationResult[] }>('/mrl/history');
      return response.calculations;
    } catch (error: any) {
      console.error('Get MRL history error:', error);
      
      if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to load MRL history.');
      }
    }
  }

  /**
   * Get MRL calculation by ID
   */
  static async getMRLCalculation(calculationId: string): Promise<MRLCalculationResult> {
    try {
      const response = await api.get<{ calculation: MRLCalculationResult }>(`/mrl/calculations/${calculationId}`);
      return response.calculation;
    } catch (error: any) {
      console.error('Get MRL calculation error:', error);
      
      if (error.status === 404) {
        throw new Error('MRL calculation not found.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to load MRL calculation.');
      }
    }
  }
}

export class PesticideService {
  /**
   * Record pesticide application
   */
  static async recordApplication(applicationData: PesticideApplicationRequest): Promise<PesticideApplication> {
    try {
      const response = await api.post<{ application: PesticideApplication }>('/pesticides/applications', applicationData);
      return response.application;
    } catch (error: any) {
      console.error('Record pesticide application error:', error);
      
      if (error.status === 400) {
        throw new Error('Invalid application data. Please check all fields and try again.');
      } else if (error.status === 404) {
        throw new Error('Crop not found.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to record pesticide application.');
      }
    }
  }

  /**
   * Get pesticide applications for a crop
   */
  static async getApplicationsByCrop(cropId: string): Promise<PesticideApplication[]> {
    try {
      const response = await api.get<{ applications: PesticideApplication[] }>(`/crops/${cropId}/pesticide-applications`);
      return response.applications;
    } catch (error: any) {
      console.error('Get pesticide applications error:', error);
      
      if (error.status === 404) {
        throw new Error('Crop not found.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to load pesticide applications.');
      }
    }
  }

  /**
   * Get all pesticide applications for the farmer
   */
  static async getAllApplications(): Promise<PesticideApplication[]> {
    try {
      const response = await api.get<{ applications: PesticideApplication[] }>('/pesticides/my-applications');
      return response.applications;
    } catch (error: any) {
      console.error('Get all pesticide applications error:', error);
      
      if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to load pesticide applications.');
      }
    }
  }
}