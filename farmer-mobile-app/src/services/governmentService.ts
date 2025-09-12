import { api } from './apiClient';

export interface GovernmentScheme {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  eligibilityCriteria: EligibilityCriteria;
  applicationProcess: string[];
  requiredDocuments: string[];
  applicationDeadline: Date;
  contactInfo: ContactInfo;
  status: SchemeStatus;
  category: string;
  targetBeneficiaries: string[];
  budgetAllocation?: number;
  beneficiariesCount?: number;
}

export interface EligibilityCriteria {
  farmSize?: { min?: number; max?: number };
  cropTypes?: string[];
  location?: string[];
  income?: { min?: number; max?: number };
  age?: { min?: number; max?: number };
  landOwnership: boolean;
  gender?: 'male' | 'female' | 'any';
  category?: string[]; // SC/ST/OBC/General
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  website?: string;
  helplineHours?: string;
}

export enum SchemeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  UPCOMING = 'upcoming'
}

export interface SchemeApplication {
  id: string;
  schemeId: string;
  farmerId: string;
  applicationData: any;
  documents: string[];
  status: ApplicationStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  feedback?: string;
  trackingNumber?: string;
  estimatedProcessingTime?: number; // in days
}

export enum ApplicationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DOCUMENTS_REQUIRED = 'documents_required'
}

export interface EligibilityCheckRequest {
  schemeId: string;
  farmerData: {
    farmSize?: number;
    age?: number;
    income?: number;
    location: {
      state: string;
      district: string;
    };
    landOwnership: boolean;
    cropTypes?: string[];
    gender?: 'male' | 'female';
    category?: string;
  };
}

export interface EligibilityCheckResult {
  eligible: boolean;
  score: number; // 0-100
  missingCriteria: string[];
  recommendations: string[];
  alternativeSchemes?: string[];
}

export interface ApplicationSubmissionRequest {
  schemeId: string;
  applicationData: {
    personalInfo: {
      name: string;
      fatherName: string;
      dateOfBirth: string;
      gender: 'male' | 'female';
      category: string;
      aadhaarNumber: string;
      phoneNumber: string;
      email?: string;
    };
    addressInfo: {
      address: string;
      village: string;
      district: string;
      state: string;
      pincode: string;
    };
    farmInfo: {
      farmSize: number;
      landOwnership: boolean;
      cropTypes: string[];
      irrigationSource?: string;
      soilType?: string;
    };
    bankInfo: {
      accountNumber: string;
      ifscCode: string;
      bankName: string;
      branchName: string;
    };
    additionalInfo?: any;
  };
  documents: Array<{
    type: string;
    url: string;
    name: string;
  }>;
}

export class GovernmentService {
  /**
   * Get all available government schemes
   */
  static async getSchemes(
    page: number = 1,
    limit: number = 10,
    category?: string,
    status?: SchemeStatus,
    state?: string
  ): Promise<{ schemes: GovernmentScheme[]; totalCount: number; hasMore: boolean }> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      if (category) queryParams.append('category', category);
      if (status) queryParams.append('status', status);
      if (state) queryParams.append('state', state);

      const response = await api.get<{ schemes: GovernmentScheme[]; totalCount: number; hasMore: boolean }>(`/government/schemes?${queryParams}`);
      return response;
    } catch (error: any) {
      console.error('Get schemes error:', error);
      
      if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to load government schemes.');
      }
    }
  }

  /**
   * Get a specific scheme by ID
   */
  static async getScheme(schemeId: string): Promise<GovernmentScheme> {
    try {
      const response = await api.get<{ scheme: GovernmentScheme }>(`/government/schemes/${schemeId}`);
      return response.scheme;
    } catch (error: any) {
      console.error('Get scheme error:', error);
      
      if (error.status === 404) {
        throw new Error('Scheme not found.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to load scheme details.');
      }
    }
  }

  /**
   * Check eligibility for a scheme
   */
  static async checkEligibility(eligibilityData: EligibilityCheckRequest): Promise<EligibilityCheckResult> {
    try {
      const response = await api.post<{ result: EligibilityCheckResult }>('/government/check-eligibility', eligibilityData);
      return response.result;
    } catch (error: any) {
      console.error('Check eligibility error:', error);
      
      if (error.status === 400) {
        throw new Error('Invalid eligibility data. Please check all fields and try again.');
      } else if (error.status === 404) {
        throw new Error('Scheme not found.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to check eligibility.');
      }
    }
  }

  /**
   * Submit application for a scheme
   */
  static async submitApplication(applicationData: ApplicationSubmissionRequest): Promise<SchemeApplication> {
    try {
      const response = await api.post<{ application: SchemeApplication }>('/government/applications', applicationData);
      return response.application;
    } catch (error: any) {
      console.error('Submit application error:', error);
      
      if (error.status === 400) {
        throw new Error('Invalid application data. Please check all fields and try again.');
      } else if (error.status === 404) {
        throw new Error('Scheme not found.');
      } else if (error.status === 409) {
        throw new Error('You have already applied for this scheme.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to submit application.');
      }
    }
  }

  /**
   * Get farmer's applications
   */
  static async getMyApplications(): Promise<SchemeApplication[]> {
    try {
      const response = await api.get<{ applications: SchemeApplication[] }>('/government/my-applications');
      return response.applications;
    } catch (error: any) {
      console.error('Get my applications error:', error);
      
      if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to load your applications.');
      }
    }
  }

  /**
   * Get application by ID
   */
  static async getApplication(applicationId: string): Promise<SchemeApplication> {
    try {
      const response = await api.get<{ application: SchemeApplication }>(`/government/applications/${applicationId}`);
      return response.application;
    } catch (error: any) {
      console.error('Get application error:', error);
      
      if (error.status === 404) {
        throw new Error('Application not found.');
      } else if (error.status === 403) {
        throw new Error('You can only view your own applications.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to load application details.');
      }
    }
  }

  /**
   * Update application (for draft applications)
   */
  static async updateApplication(applicationId: string, updates: Partial<ApplicationSubmissionRequest>): Promise<SchemeApplication> {
    try {
      const response = await api.put<{ application: SchemeApplication }>(`/government/applications/${applicationId}`, updates);
      return response.application;
    } catch (error: any) {
      console.error('Update application error:', error);
      
      if (error.status === 404) {
        throw new Error('Application not found.');
      } else if (error.status === 403) {
        throw new Error('You can only update your own draft applications.');
      } else if (error.status === 400) {
        throw new Error('Application cannot be updated at this stage.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to update application.');
      }
    }
  }

  /**
   * Cancel application (for submitted applications)
   */
  static async cancelApplication(applicationId: string, reason?: string): Promise<void> {
    try {
      await api.patch(`/government/applications/${applicationId}/cancel`, { reason });
    } catch (error: any) {
      console.error('Cancel application error:', error);
      
      if (error.status === 404) {
        throw new Error('Application not found.');
      } else if (error.status === 403) {
        throw new Error('You can only cancel your own applications.');
      } else if (error.status === 400) {
        throw new Error('Application cannot be cancelled at this stage.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to cancel application.');
      }
    }
  }

  /**
   * Track application status
   */
  static async trackApplication(trackingNumber: string): Promise<SchemeApplication> {
    try {
      const response = await api.get<{ application: SchemeApplication }>(`/government/track/${trackingNumber}`);
      return response.application;
    } catch (error: any) {
      console.error('Track application error:', error);
      
      if (error.status === 404) {
        throw new Error('Application not found with this tracking number.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to track application.');
      }
    }
  }

  /**
   * Get scheme categories
   */
  static async getSchemeCategories(): Promise<string[]> {
    try {
      const response = await api.get<{ categories: string[] }>('/government/categories');
      return response.categories;
    } catch (error: any) {
      console.error('Get scheme categories error:', error);
      
      if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to load scheme categories.');
      }
    }
  }

  /**
   * Search schemes
   */
  static async searchSchemes(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ schemes: GovernmentScheme[]; totalCount: number; hasMore: boolean }> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('q', query);
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());

      const response = await api.get<{ schemes: GovernmentScheme[]; totalCount: number; hasMore: boolean }>(`/government/search?${queryParams}`);
      return response;
    } catch (error: any) {
      console.error('Search schemes error:', error);
      
      if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to search schemes.');
      }
    }
  }

  /**
   * Get recommended schemes based on farmer profile
   */
  static async getRecommendedSchemes(): Promise<GovernmentScheme[]> {
    try {
      const response = await api.get<{ schemes: GovernmentScheme[] }>('/government/recommended');
      return response.schemes;
    } catch (error: any) {
      console.error('Get recommended schemes error:', error);
      
      if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to load recommended schemes.');
      }
    }
  }
}