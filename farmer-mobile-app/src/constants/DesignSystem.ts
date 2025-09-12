// Design System Constants for Figma Alignment

export const Colors = {
  // Primary Colors
  primary: '#22c55e',
  primaryDark: '#21825C', // New darker green for text elements to match Figma
  primaryLight: '#dcfce7',
  primaryLighter: '#f0fdf4',
  
  // Background Colors
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceSecondary: '#f9fafb',
  
  // Text Colors
  textPrimary: '#1f2937',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  textInverse: '#ffffff',
  textBrand: '#21825C', // Brand text color matching Figma designs
  
  // Status Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#dc2626',
  info: '#3b82f6',
  
  // Border Colors
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  
  // Illustration Backgrounds
  farmerBg: '#dcfce7',
  dealerBg: '#dbeafe',
  cropBg: '#fef3c7',
  leafBg: '#f0fdf4',
} as const;

export const Typography = {
  // Font Sizes
  headingLarge: 24,
  headingMedium: 20,
  headingSmall: 18,
  bodyLarge: 16,
  bodyMedium: 14,
  bodySmall: 12,
  
  // Font Weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

// Component-specific constants
export const ComponentSizes = {
  button: {
    small: { height: 32, paddingHorizontal: 12 },
    medium: { height: 44, paddingHorizontal: 16 },
    large: { height: 52, paddingHorizontal: 20 },
  },
  input: {
    height: 44,
    paddingHorizontal: 12,
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
  },
  tab: {
    height: 48,
    paddingHorizontal: 16,
  },
} as const;

// Layout constants
export const Layout = {
  screenPadding: 16,
  sectionSpacing: 24,
  cardPadding: 16,
  gridGap: 12,
} as const;