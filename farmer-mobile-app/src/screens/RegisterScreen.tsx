import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { RegisterData } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/DesignSystem';

interface RegisterScreenProps {
  navigation: any;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { t } = useTranslation();
  const [userRole, setUserRole] = useState<'farmer' | 'dealer'>('farmer');
  const [registrationMethod, setRegistrationMethod] = useState<'phone' | 'email'>('phone');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: '',
    language: 'en',
    // Farmer specific
    farmName: '',
    farmSize: '',
    crops: '',
    experience: '',
    // Dealer specific
    businessName: '',
    businessType: 'retailer',
    serviceAreas: '',
  });

  const { register, isLoading } = useAuthStore();

  const handleRegister = async () => {
    const credential = registrationMethod === 'phone' ? formData.phone : formData.email;
    
    if (!formData.name || !credential || !formData.password || !formData.address) {
      Alert.alert(t('common.error'), t('register.fillAllFields'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert(t('common.error'), t('register.passwordsDoNotMatch'));
      return;
    }

    // Role-specific validation
    if (userRole === 'dealer' && !formData.businessName) {
      Alert.alert(t('common.error'), t('register.businessNameRequired'));
      return;
    }

    try {
      const location = {
        address: formData.address.trim(),
        city: formData.city.trim() || 'Unknown',
        state: formData.state.trim() || 'Unknown',
        country: 'India',
        coordinates: {
          latitude: 0, // Will be updated with actual location later
          longitude: 0,
        }
      };

      let profile: any;
      if (userRole === 'farmer') {
        profile = {
          name: formData.name.trim(),
          farmName: formData.farmName.trim() || undefined,
          farmSize: formData.farmSize ? parseFloat(formData.farmSize) : undefined,
          location,
          crops: formData.crops ? formData.crops.split(',').map(c => c.trim()).filter(Boolean) : [],
          experience: formData.experience ? parseInt(formData.experience) : 0,
          certifications: []
        };
      } else {
        profile = {
          name: formData.name.trim(),
          businessName: formData.businessName.trim(),
          businessType: formData.businessType,
          location,
          serviceAreas: formData.serviceAreas ? formData.serviceAreas.split(',').map(s => s.trim()).filter(Boolean) : [],
          certifications: []
        };
      }

      const userData: RegisterData = {
        password: formData.password,
        role: userRole,
        profile,
        language: formData.language,
      };

      if (registrationMethod === 'phone') {
        userData.phone = formData.phone.trim();
      } else {
        userData.email = formData.email.trim().toLowerCase();
      }

      await register(userData);
      Alert.alert(t('common.success'), t('register.accountCreatedSuccessfully'));
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert(
        t('register.registrationFailed'), 
        error.message || t('register.tryAgainDifferentCredentials')
      );
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.content}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>
              {t('register.createAccount')}
            </Text>
            
            {/* User Role Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('register.iAmA')} *</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    userRole === 'farmer' && styles.toggleButtonActive
                  ]}
                  onPress={() => setUserRole('farmer')}
                  disabled={isLoading}
                >
                  <Text style={[
                    styles.toggleText,
                    userRole === 'farmer' && styles.toggleTextActive
                  ]}>
                    {t('register.farmer')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    userRole === 'dealer' && styles.toggleButtonActive
                  ]}
                  onPress={() => setUserRole('dealer')}
                  disabled={isLoading}
                >
                  <Text style={[
                    styles.toggleText,
                    userRole === 'dealer' && styles.toggleTextActive
                  ]}>
                    {t('register.dealer')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Registration Method Selection */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Register with *</Text>
              <View className="flex-row bg-gray-100 rounded-lg p-1">
                <TouchableOpacity
                  className={`flex-1 py-2 px-4 rounded-md ${
                    registrationMethod === 'phone' ? 'bg-green-600' : 'bg-transparent'
                  }`}
                  onPress={() => setRegistrationMethod('phone')}
                  disabled={isLoading}
                >
                  <Text className={`text-center font-medium ${
                    registrationMethod === 'phone' ? 'text-white' : 'text-gray-600'
                  }`}>
                    Phone
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-2 px-4 rounded-md ${
                    registrationMethod === 'email' ? 'bg-green-600' : 'bg-transparent'
                  }`}
                  onPress={() => setRegistrationMethod('email')}
                  disabled={isLoading}
                >
                  <Text className={`text-center font-medium ${
                    registrationMethod === 'email' ? 'text-white' : 'text-gray-600'
                  }`}>
                    Email
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Full Name *</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(value) => updateFormData('name', value)}
                editable={!isLoading}
              />
            </View>

            {/* Dynamic Contact Field */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">
                {registrationMethod === 'phone' ? 'Phone Number *' : 'Email Address *'}
              </Text>
              {registrationMethod === 'phone' ? (
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChangeText={(value) => updateFormData('phone', value)}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                />
              ) : (
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              )}
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Password *</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                secureTextEntry
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Confirm Password *</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                secureTextEntry
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Address *</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                placeholder="Enter your address"
                value={formData.address}
                onChangeText={(value) => updateFormData('address', value)}
                multiline
                editable={!isLoading}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">City *</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                placeholder="Enter your city"
                value={formData.city}
                onChangeText={(value) => updateFormData('city', value)}
                editable={!isLoading}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">State *</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                placeholder="Enter your state"
                value={formData.state}
                onChangeText={(value) => updateFormData('state', value)}
                editable={!isLoading}
              />
            </View>

            {/* Role-specific fields */}
            {userRole === 'farmer' ? (
              <>
                <View className="mb-4">
                  <Text className="text-gray-700 mb-2 font-medium">Farm Name</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                    placeholder="Enter your farm name (optional)"
                    value={formData.farmName}
                    onChangeText={(value) => updateFormData('farmName', value)}
                    editable={!isLoading}
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-gray-700 mb-2 font-medium">Farm Size (acres)</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                    placeholder="Enter farm size in acres"
                    value={formData.farmSize}
                    onChangeText={(value) => updateFormData('farmSize', value)}
                    keyboardType="numeric"
                    editable={!isLoading}
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-gray-700 mb-2 font-medium">Crops Grown</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                    placeholder="Enter crops (comma separated)"
                    value={formData.crops}
                    onChangeText={(value) => updateFormData('crops', value)}
                    editable={!isLoading}
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-gray-700 mb-2 font-medium">Farming Experience (years)</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                    placeholder="Enter years of experience"
                    value={formData.experience}
                    onChangeText={(value) => updateFormData('experience', value)}
                    keyboardType="numeric"
                    editable={!isLoading}
                  />
                </View>
              </>
            ) : (
              <>
                <View className="mb-4">
                  <Text className="text-gray-700 mb-2 font-medium">Business Name *</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                    placeholder="Enter your business name"
                    value={formData.businessName}
                    onChangeText={(value) => updateFormData('businessName', value)}
                    editable={!isLoading}
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-gray-700 mb-2 font-medium">Business Type *</Text>
                  <View className="border border-gray-300 rounded-lg bg-white">
                    <TouchableOpacity
                      className="px-4 py-3"
                      onPress={() => {
                        // For now, just cycle through options
                        const types = ['retailer', 'wholesaler', 'distributor', 'processor', 'exporter'];
                        const currentIndex = types.indexOf(formData.businessType);
                        const nextIndex = (currentIndex + 1) % types.length;
                        updateFormData('businessType', types[nextIndex]);
                      }}
                      disabled={isLoading}
                    >
                      <Text className="text-gray-700 capitalize">
                        {formData.businessType}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="text-gray-700 mb-2 font-medium">Service Areas</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                    placeholder="Enter service areas (comma separated)"
                    value={formData.serviceAreas}
                    onChangeText={(value) => updateFormData('serviceAreas', value)}
                    editable={!isLoading}
                  />
                </View>
              </>
            )}

            <View className="mb-6">
              <Text className="text-gray-700 mb-2 font-medium">Preferred Language</Text>
              <View className="border border-gray-300 rounded-lg bg-white">
                <TouchableOpacity
                  className="px-4 py-3"
                  onPress={() => {
                    // For now, just cycle through common languages
                    const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml'];
                    const languageNames = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'];
                    const currentIndex = languages.indexOf(formData.language);
                    const nextIndex = (currentIndex + 1) % languages.length;
                    updateFormData('language', languages[nextIndex]);
                  }}
                  disabled={isLoading}
                >
                  <Text className="text-gray-700">
                    {formData.language === 'en' ? 'English' :
                     formData.language === 'hi' ? 'Hindi' :
                     formData.language === 'ta' ? 'Tamil' :
                     formData.language === 'te' ? 'Telugu' :
                     formData.language === 'kn' ? 'Kannada' :
                     formData.language === 'ml' ? 'Malayalam' : 'English'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                isLoading && styles.submitButtonDisabled
              ]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? t('register.creatingAccount') : t('register.createAccount')}
              </Text>
            </TouchableOpacity>

            <View style={styles.loginPrompt}>
              <Text style={styles.loginPromptText}>{t('register.alreadyHaveAccount')} </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>{t('register.signIn')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryLighter,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
  },
  formContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: Typography.headingLarge + 6,
    fontWeight: 'bold',
    color: Colors.primaryDark,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.bodyMedium,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'transparent',
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    textAlign: 'center',
    fontSize: Typography.bodyMedium,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: Colors.textInverse,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    fontSize: Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.textTertiary,
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.textInverse,
    textAlign: 'center',
    fontSize: Typography.bodyLarge,
    fontWeight: '600',
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  loginPromptText: {
    fontSize: Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: Typography.bodyMedium,
    color: Colors.primary,
    fontWeight: '600',
  },
});