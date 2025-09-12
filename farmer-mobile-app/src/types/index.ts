// Re-export UI types
export * from './ui';

export interface User {
  id: string;
  email?: string;
  phone?: string;
  role: 'farmer' | 'dealer' | 'admin';
  profile: FarmerProfile | DealerProfile;
  language: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Legacy fields for backward compatibility
  name?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
    state: string;
    district: string;
  };
  preferredLanguage?: string;
  farmSize?: number;
}

export interface FarmerProfile {
  name: string;
  farmName?: string;
  farmSize?: number;
  location: Location;
  crops: string[];
  experience: number;
  certifications: string[];
  avatar?: string;
}

export interface DealerProfile {
  name: string;
  businessName: string;
  businessType: string;
  location: Location;
  serviceAreas: string[];
  certifications: string[];
  avatar?: string;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string, email?: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  loadStoredAuth?: () => Promise<void>;
}

export interface RegisterData {
  email?: string;
  phone?: string;
  password: string;
  role: 'farmer' | 'dealer';
  profile: FarmerProfile | DealerProfile;
  language: string;
  // Legacy fields for backward compatibility
  name?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
    state: string;
    district: string;
  };
  preferredLanguage?: string;
  farmSize?: number;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export interface CropAnalysis {
  id: string;
  imageUrl: string;
  analysisResult: {
    healthStatus: 'healthy' | 'diseased' | 'pest_attack' | 'nutrient_deficiency';
    confidence: number;
    detectedIssues: string[];
    recommendations: string[];
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  cropType?: string;
  createdAt: string;
}

export interface CropAnalysisResponse {
  success: boolean;
  data: CropAnalysis;
}

export interface CropHistoryResponse {
  success: boolean;
  data: CropAnalysis[];
}

export interface CropAnalysisState {
  analyses: CropAnalysis[];
  currentAnalysis: CropAnalysis | null;
  isLoading: boolean;
  isUploading: boolean;
  analyzeImage: (imageUri: string, token: string) => Promise<CropAnalysis>;
  getHistory: (token: string) => Promise<void>;
  setCurrentAnalysis: (analysis: CropAnalysis | null) => void;
  setLoading: (loading: boolean) => void;
  loadCachedData?: () => Promise<void>;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection?: number;
  pressure?: number;
  visibility?: number;
  uvIndex?: number;
  feelsLike?: number;
  description: string;
  icon: string;
  date: string;
}

export interface WeatherForecast {
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  current: WeatherData;
  forecast: WeatherForecastDay[];
  farmingRecommendations: string[];
  agriculturalAdvisory: AgriculturalAdvisory;
  cropPlanningAdvice: CropPlanningAdvice[];
}

export interface WeatherForecastDay {
  date: string;
  weather: WeatherData;
  precipitation: {
    probability: number;
    amount: number;
  };
  minTemp: number;
  maxTemp: number;
}

export interface AgriculturalAdvisory {
  irrigation: string;
  pestControl: string;
  harvesting: string;
  planting: string;
  generalAdvice: string;
  soilConditions: string;
  cropProtection: string;
}

export interface CropPlanningAdvice {
  cropType: string;
  recommendation: string;
  timing: string;
  priority: 'low' | 'medium' | 'high';
  weatherFactor: string;
}

export interface FarmingAlert {
  id: string;
  type: 'weather' | 'irrigation' | 'pest' | 'harvest' | 'temperature' | 'wind' | 'rain' | 'humidity';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  expiresAt?: string;
  actionRequired?: boolean;
  recommendations?: string[];
}

export interface WeatherState {
  forecast: WeatherForecast | null;
  alerts: FarmingAlert[];
  isLoading: boolean;
  getForecast: (lat: number, lon: number, token: string) => Promise<void>;
  getAlerts: (token: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  audioUrl?: string;
}

export interface ChatResponse {
  response: string;
  language: string;
  audioUrl?: string;
  relatedTopics: string[];
  confidence: number;
  transcription?: string;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isRecording: boolean;
  sendMessage: (message: string, token: string) => Promise<void>;
  sendVoiceMessage: (audioUri: string, token: string) => Promise<void>;
  setRecording: (recording: boolean) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
  loadCachedMessages?: () => Promise<void>;
}

export interface Product {
  id: string;
  name: string;
  category: 'crops' | 'seeds' | 'tools' | 'fertilizers';
  subcategory?: string;
  price: number;
  pricePerUnit?: number; // Alias for price
  quantity: number;
  unit: string;
  description: string;
  images: string[];
  photos?: string[]; // Alias for images
  location: {
    latitude: number;
    longitude: number;
    address: string;
    state: string;
    district: string;
  };
  sellerId: string;
  sellerName?: string;
  isActive: boolean;
  status?: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListing {
  name: string;
  category: 'crops' | 'seeds' | 'tools' | 'fertilizers';
  subcategory?: string;
  price: number;
  quantity: number;
  unit: string;
  description: string;
  images: string[];
}

export interface SearchFilters {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in km
  };
  sortBy?: 'price' | 'date' | 'distance';
  sortOrder?: 'asc' | 'desc';
}

export interface MarketplaceState {
  products: Product[];
  myListings: Product[];
  isLoading: boolean;
  isCreating: boolean;
  searchProducts: (filters: SearchFilters, token: string) => Promise<void>;
  createListing: (listing: ProductListing, token: string) => Promise<Product>;
  getMyListings: (token: string) => Promise<void>;
  updateListing: (id: string, updates: Partial<ProductListing>, token: string) => Promise<void>;
  deleteListing: (id: string, token: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setCreating: (creating: boolean) => void;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  category: 'sowing' | 'irrigation' | 'fertilizer' | 'pest_control' | 'harvesting';
  priority: 'low' | 'medium' | 'high';
  completedAt?: string;
  notes?: string;
}

export interface FarmingRoadmap {
  id: string;
  cropType: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    state: string;
    district: string;
  };
  milestones: Milestone[];
  currentStage: string;
  estimatedHarvest: string;
  mrlRecommendations: string[];
  progress: number; // percentage
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapGenerationRequest {
  cropType: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    state: string;
    district: string;
  };
  plantingDate?: string;
  farmSize?: number;
}

export interface RoadmapState {
  roadmaps: FarmingRoadmap[];
  activeRoadmap: FarmingRoadmap | null;
  isLoading: boolean;
  isGenerating: boolean;
  generateRoadmap: (request: RoadmapGenerationRequest, token: string) => Promise<FarmingRoadmap>;
  getUserRoadmaps: (token: string) => Promise<void>;
  updateMilestone: (roadmapId: string, milestoneId: string, status: string, notes?: string, token?: string) => Promise<void>;
  setActiveRoadmap: (roadmap: FarmingRoadmap | null) => void;
  setLoading: (loading: boolean) => void;
  setGenerating: (generating: boolean) => void;
}

// Field Management Types
export interface Field {
  id: string;
  farmerId: string;
  name: string;
  size: number;
  location: Location;
  soilType: string;
  crops: Crop[];
  createdAt: Date;
}

export interface Crop {
  id: string;
  fieldId: string;
  name: string;
  variety: string;
  plantingDate: Date;
  expectedHarvestDate: Date;
  currentStage: CropStage;
  pesticidesUsed: PesticideApplication[];
  notes: string[];
  photos: string[];
}

export interface PesticideApplication {
  id: string;
  cropId: string;
  pesticideName: string;
  activeIngredient: string;
  applicationDate: Date;
  quantity: number;
  method: string;
  mrlLimit: number;
  safeHarvestDate: Date;
}

export enum CropStage {
  PLANTED = 'planted',
  GERMINATION = 'germination',
  VEGETATIVE = 'vegetative',
  FLOWERING = 'flowering',
  FRUITING = 'fruiting',
  MATURITY = 'maturity',
  HARVESTED = 'harvested'
}

// Enhanced Marketplace Types
export interface MarketplaceProduct {
  id: string;
  farmerId: string;
  name: string;
  category: string;
  variety: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  description: string;
  photos: string[];
  location: Location;
  harvestDate: Date;
  availableFrom: Date;
  availableUntil: Date;
  qualityCertificates: string[];
  isOrganic: boolean;
  status: ProductStatus;
  createdAt: Date;
}

export enum ProductStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  SOLD = 'sold',
  EXPIRED = 'expired'
}

export interface Order {
  id: string;
  dealerId: string;
  farmerId: string;
  products: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  deliveryAddress: Location;
  orderDate: Date;
  expectedDeliveryDate: Date;
  notes: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

// Community Types
export interface Post {
  id: string;
  authorId: string;
  title: string;
  content: string;
  category: PostCategory;
  tags: string[];
  photos: string[];
  likes: number;
  comments: Comment[];
  isExpertVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum PostCategory {
  QUESTION = 'question',
  TIP = 'tip',
  SUCCESS_STORY = 'success_story',
  PROBLEM = 'problem',
  NEWS = 'news'
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  likes: number;
  replies: Comment[];
  createdAt: Date;
}

// Government Schemes Types
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
}

export interface EligibilityCriteria {
  farmSize?: { min?: number; max?: number };
  cropTypes?: string[];
  location?: string[];
  income?: { min?: number; max?: number };
  age?: { min?: number; max?: number };
  landOwnership: boolean;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  website?: string;
}

export enum SchemeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired'
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
}

export enum ApplicationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// Scan and AI Types
export interface CropScan {
  id: string;
  farmerId: string;
  cropId?: string;
  image: string;
  scanType: ScanType;
  results: ScanResult[];
  confidence: number;
  timestamp: Date;
}

export enum ScanType {
  DISEASE = 'disease',
  PEST = 'pest',
  NUTRIENT_DEFICIENCY = 'nutrient_deficiency',
  CROP_IDENTIFICATION = 'crop_identification'
}

export interface ScanResult {
  type: string;
  name: string;
  confidence: number;
  description: string;
  treatment: Treatment;
  prevention: string[];
}

export interface Treatment {
  immediate: string[];
  longTerm: string[];
  products: RecommendedProduct[];
}

export interface RecommendedProduct {
  name: string;
  type: string;
  dosage: string;
  applicationMethod: string;
  safetyPeriod: number;
}