import { ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Base component props
export interface BaseComponentProps {
  style?: ViewStyle;
  testID?: string;
}

// Layout component interfaces
export interface SafeAreaContainerProps extends BaseComponentProps {
  children: React.ReactNode;
  backgroundColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
}

export interface HeaderProps extends BaseComponentProps {
  title: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  onBackPress?: () => void;
}

export interface TabNavigationProps extends BaseComponentProps {
  tabs: Tab[];
  onTabPress: (tabId: string) => void;
  scrollable?: boolean;
}

export interface Tab {
  id: string;
  label: string;
  active?: boolean;
}

// Interactive component interfaces
export interface ActionButtonProps extends BaseComponentProps {
  title: string;
  variant: 'primary' | 'secondary' | 'outline';
  size: 'small' | 'medium' | 'large';
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

export interface SearchBarProps extends BaseComponentProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  showMicIcon?: boolean;
}

// Illustration component interfaces
export interface IllustrationPlaceholderProps extends BaseComponentProps {
  width: number;
  height: number;
  borderRadius?: number;
  backgroundColor?: string;
  showBrokenIcon?: boolean;
  alt?: string;
}

export interface CharacterIllustrationProps {
  size?: 'small' | 'medium' | 'large';
}

// Form component interfaces
export interface FormFieldProps extends BaseComponentProps {
  label?: string;
  error?: string;
  required?: boolean;
}

export interface TextInputProps extends FormFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
}

export interface DropdownProps extends FormFieldProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
}

// Screen state interfaces
export interface ScreenState {
  isLoading: boolean;
  error: string | null;
  data: any;
  refreshing: boolean;
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
}

// Navigation interfaces
export interface NavigationState {
  currentTab: string;
  previousScreen?: string;
  params?: Record<string, any>;
}

// API response interfaces
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Common data interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'farmer' | 'dealer';
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  seller: User;
  images: string[];
  verified: boolean;
}

export interface Crop {
  id: string;
  name: string;
  status: 'healthy' | 'attention' | 'excellent';
  icon: string;
  plantingDate: Date;
  harvestDate: Date;
}

export interface WeatherData {
  temperature: number;
  location: string;
  condition: string;
  forecast: Array<{
    day: string;
    icon: string;
    temp: number;
  }>;
}