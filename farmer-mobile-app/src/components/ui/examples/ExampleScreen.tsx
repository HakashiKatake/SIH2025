import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import {
  SafeAreaContainer,
  Header,
  TabNavigation,
  ActionButton,
  SearchBar,
  FarmerIllustration,
  DealerIllustration,
  LeafDecoration,
  CropIllustration,
} from '../index';
import { Colors, Typography, Spacing } from '../../../constants/DesignSystem';

export const ExampleScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('components');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'components', label: 'Components', active: activeTab === 'components' },
    { id: 'illustrations', label: 'Illustrations', active: activeTab === 'illustrations' },
    { id: 'buttons', label: 'Buttons', active: activeTab === 'buttons' },
  ];

  const renderComponents = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Layout Components</Text>
      
      <View style={styles.componentExample}>
        <Text style={styles.componentTitle}>Search Bar</Text>
        <SearchBar
          placeholder="Search for crops, products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          showMicIcon={true}
        />
      </View>

      <View style={styles.componentExample}>
        <Text style={styles.componentTitle}>Tab Navigation</Text>
        <TabNavigation
          tabs={tabs}
          onTabPress={setActiveTab}
        />
      </View>
    </View>
  );

  const renderIllustrations = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Illustration Placeholders</Text>
      
      <View style={styles.illustrationGrid}>
        <View style={styles.illustrationItem}>
          <FarmerIllustration size="large" />
          <Text style={styles.illustrationLabel}>Farmer Character</Text>
        </View>
        
        <View style={styles.illustrationItem}>
          <DealerIllustration size="large" />
          <Text style={styles.illustrationLabel}>Dealer Character</Text>
        </View>
      </View>

      <View style={styles.illustrationGrid}>
        <View style={styles.illustrationItem}>
          <CropIllustration cropName="Tomato" size="medium" />
          <Text style={styles.illustrationLabel}>Crop Icon</Text>
        </View>
        
        <View style={styles.illustrationItem}>
          <LeafDecoration size="medium" />
          <Text style={styles.illustrationLabel}>Leaf Decoration</Text>
        </View>
      </View>
    </View>
  );

  const renderButtons = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Action Buttons</Text>
      
      <View style={styles.buttonExample}>
        <Text style={styles.componentTitle}>Primary Buttons</Text>
        <ActionButton
          title="Large Primary"
          variant="primary"
          size="large"
          onPress={() => console.log('Large primary pressed')}
          icon="checkmark"
        />
        <ActionButton
          title="Medium Primary"
          variant="primary"
          size="medium"
          onPress={() => console.log('Medium primary pressed')}
        />
        <ActionButton
          title="Small Primary"
          variant="primary"
          size="small"
          onPress={() => console.log('Small primary pressed')}
        />
      </View>

      <View style={styles.buttonExample}>
        <Text style={styles.componentTitle}>Secondary & Outline</Text>
        <ActionButton
          title="Secondary Button"
          variant="secondary"
          size="medium"
          onPress={() => console.log('Secondary pressed')}
          icon="heart"
        />
        <ActionButton
          title="Outline Button"
          variant="outline"
          size="medium"
          onPress={() => console.log('Outline pressed')}
          icon="add"
        />
        <ActionButton
          title="Loading Button"
          variant="primary"
          size="medium"
          onPress={() => console.log('Loading pressed')}
          loading={true}
        />
      </View>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'illustrations':
        return renderIllustrations();
      case 'buttons':
        return renderButtons();
      default:
        return renderComponents();
    }
  };

  return (
    <SafeAreaContainer>
      <Header 
        title="UI Components Demo" 
        showBackButton={false}
      />
      
      <TabNavigation
        tabs={tabs}
        onTabPress={setActiveTab}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </SafeAreaContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.headingMedium,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  componentExample: {
    marginBottom: Spacing.xl,
  },
  componentTitle: {
    fontSize: Typography.bodyLarge,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  illustrationGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.xl,
  },
  illustrationItem: {
    alignItems: 'center',
  },
  illustrationLabel: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  buttonExample: {
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
});