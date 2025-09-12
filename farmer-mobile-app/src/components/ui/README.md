# UI Components Library

This directory contains the shared UI components library for the Farmer Mobile App, designed to match the Figma designs pixel-perfectly.

## Components Overview

### Layout Components

#### SafeAreaContainer
A wrapper component that handles safe area insets and status bar styling.

```tsx
import { SafeAreaContainer } from '../components/ui';

<SafeAreaContainer backgroundColor="#f8fafc" statusBarStyle="dark-content">
  {/* Your content */}
</SafeAreaContainer>
```

#### Header
A standardized header component with back button and title.

```tsx
import { Header } from '../components/ui';

<Header 
  title="Dashboard" 
  showBackButton={true}
  onBackPress={() => navigation.goBack()}
/>
```

#### TabNavigation
A tab navigation component for switching between different views.

```tsx
import { TabNavigation } from '../components/ui';

<TabNavigation
  tabs={[
    { id: 'all', label: 'All', active: true },
    { id: 'questions', label: 'Questions' },
    { id: 'tips', label: 'Tips' },
  ]}
  onTabPress={(tabId) => setActiveTab(tabId)}
/>
```

### Interactive Components

#### ActionButton
A versatile button component with multiple variants and sizes.

```tsx
import { ActionButton } from '../components/ui';

<ActionButton
  title="Get Started"
  variant="primary"
  size="large"
  onPress={handlePress}
  icon="arrow-forward"
/>
```

#### SearchBar
A search input component with optional microphone icon.

```tsx
import { SearchBar } from '../components/ui';

<SearchBar
  placeholder="Search products..."
  value={searchQuery}
  onChangeText={setSearchQuery}
  showMicIcon={true}
/>
```

### Illustration System

#### IllustrationPlaceholder
A flexible placeholder component for future image integration.

```tsx
import { IllustrationPlaceholder } from '../components/ui';

<IllustrationPlaceholder
  width={120}
  height={120}
  alt="Farmer Character"
  backgroundColor="#dcfce7"
/>
```

#### Predefined Illustrations
Ready-to-use illustration placeholders for common use cases.

```tsx
import { 
  FarmerIllustration, 
  DealerIllustration, 
  LeafDecoration,
  CropIllustration 
} from '../components/ui';

<FarmerIllustration size="large" />
<DealerIllustration size="medium" />
<LeafDecoration size="small" />
<CropIllustration cropName="Tomato" size="medium" />
```

## Design System

### Colors
All components use the standardized color palette from `src/constants/DesignSystem.ts`:

- **Primary**: `#22c55e` (Green)
- **Background**: `#f8fafc` (Light Gray)
- **Text Primary**: `#1f2937` (Dark Gray)
- **Text Secondary**: `#6b7280` (Medium Gray)

### Typography
Consistent font sizes and weights:

- **Heading Large**: 24px, bold
- **Heading Medium**: 20px, semibold
- **Body Large**: 16px, medium
- **Body Medium**: 14px, regular

### Spacing
Standardized spacing system:

- **xs**: 4px
- **sm**: 8px
- **md**: 12px
- **lg**: 16px
- **xl**: 20px
- **2xl**: 24px
- **3xl**: 32px

## Usage Guidelines

### 1. Import Components
Always import from the main UI index file:

```tsx
import { SafeAreaContainer, Header, ActionButton } from '../components/ui';
```

### 2. Use Design System Constants
Import and use design system constants for consistency:

```tsx
import { Colors, Typography, Spacing } from '../constants/DesignSystem';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  title: {
    fontSize: Typography.headingMedium,
    color: Colors.textPrimary,
  },
});
```

### 3. Illustration Placeholders
Use illustration placeholders instead of emojis or temporary images:

```tsx
// ❌ Don't use emojis
<Text>👨‍🌾</Text>

// ✅ Use illustration placeholders
<FarmerIllustration size="medium" />
```

### 4. Consistent Styling
Follow the established patterns for consistent styling:

```tsx
// ❌ Inconsistent styling
<TouchableOpacity style={{ backgroundColor: 'green', padding: 10 }}>

// ✅ Use design system
<ActionButton variant="primary" size="medium" />
```

## TypeScript Support

All components are fully typed with TypeScript interfaces. Import types from the UI types file:

```tsx
import { ActionButtonProps, HeaderProps } from '../types/ui';
```

## Testing

Components include proper test IDs for automated testing:

```tsx
<ActionButton
  title="Submit"
  variant="primary"
  size="medium"
  onPress={handleSubmit}
  testID="submit-button"
/>
```

## Accessibility

All components follow accessibility best practices:

- Proper semantic markup
- Descriptive labels for screen readers
- Adequate touch target sizes (minimum 44px)
- Sufficient color contrast ratios

## Future Enhancements

The illustration placeholder system is designed to be easily replaceable with actual images:

1. Replace `IllustrationPlaceholder` components with `Image` components
2. Update the `src` prop to point to actual image assets
3. Maintain the same dimensions and layout properties

This approach ensures that the layout remains consistent when real illustrations are added later.