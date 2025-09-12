import React, { useState, useEffect } from 'react';
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
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { RegisterData, FarmerProfile, DealerProfile } from '../src/types';
import { UserTypeService, UserType } from '../src/services/userTypeService';
import { SafeAreaContainer } from '../src/components/ui/SafeAreaContainer';
import { LeafDecoration } from '../src/components/ui/IllustrationPlaceholder';
import { ActionButton } from '../src/components/ui/ActionButton';
import { t } from 'i18next';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const { userType: paramUserType } = useLocalSearchParams<{ userType?: UserType }>();
  const [userType, setUserType] = useState<UserType | null>(paramUserType || null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    state: '',
    district: '',
    preferredLanguage: 'en',
    farmSize: '',
    businessName: '', // For dealers
    businessType: '', // For dealers
    companyName: '', // Added company name field
  });

  const { register, isLoading } = useAuthStore();

  useEffect(() => {
    // If no userType in params, try to get from storage
    if (!paramUserType) {
      loadUserType();
    }
  }, [paramUserType]);

  const loadUserType = async () => {
    try {
      const storedUserType = await UserTypeService.getStoredUserType();
      if (storedUserType) {
        setUserType(storedUserType);
      } else {
        // No user type found, redirect to user type selection
        router.replace('/user-type-selection');
      }
    } catch (error) {
      console.error('Error loading user type:', error);
      router.replace('/user-type-selection');
    }
  };

  const handleRegister = async () => {
    // Validation
    if (!formData.name?.trim()) {
      Alert.alert(t('common.error'), 'Please enter your full name');
      return;
    }

    if (!formData.phone?.trim()) {
      Alert.alert(t('common.error'), 'Please enter your phone number');
      return;
    }

    if (!formData.password?.trim()) {
      Alert.alert(t('common.error'), 'Please enter a password');
      return;
    }

    if (!formData.confirmPassword?.trim()) {
      Alert.alert(t('common.error'), 'Please confirm your password');
      return;
    }

    if (!formData.address?.trim()) {
      Alert.alert(t('common.error'), 'Please enter your address');
      return;
    }

    // Phone number validation
    const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
    const cleanPhone = formData.phone.replace(/\s+/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      Alert.alert(t('common.error'), 'Please enter a valid Indian phone number');
      return;
    }

    // Password validation
    if (formData.password.length < 6) {
      Alert.alert(t('common.error'), 'Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert(t('common.error'), 'Passwords do not match');
      return;
    }

    // Additional validation for dealers
    if (userType === 'dealer' && !formData.companyName?.trim()) {
      Alert.alert(t('common.error'), 'Company name is required for dealers');
      return;
    }

    // Farm size validation for farmers
    if (userType === 'farmer' && formData.farmSize && isNaN(parseFloat(formData.farmSize))) {
      Alert.alert(t('common.error'), 'Please enter a valid farm size');
      return;
    }

    try {
      // Create profile based on user type
      const location = {
        address: formData.address,
        city: formData.district || 'Unknown',
        state: formData.state || 'Unknown',
        country: 'India',
        coordinates: {
          latitude: 28.6139, // Default to Delhi coordinates
          longitude: 77.2090,
        }
      };

      let profile: FarmerProfile | DealerProfile;
      
      if (userType === 'farmer') {
        profile = {
          name: formData.name,
          farmSize: formData.farmSize ? parseFloat(formData.farmSize) : undefined,
          location,
          crops: [],
          experience: 0,
          certifications: [],
        } as FarmerProfile;
      } else {
        profile = {
          name: formData.name,
          businessName: formData.companyName || formData.name,
          businessType: 'retailer',
          location,
          serviceAreas: [],
          certifications: [],
        } as DealerProfile;
      }

      const userData: RegisterData = {
        phone: cleanPhone,
        password: formData.password,
        role: userType!,
        profile,
        language: formData.preferredLanguage,
        // Legacy fields for backward compatibility
        name: formData.name,
        location: {
          latitude: 28.6139,
          longitude: 77.2090,
          address: formData.address,
          state: formData.state || 'Unknown',
          district: formData.district || 'Unknown',
        },
        preferredLanguage: formData.preferredLanguage,
        farmSize: formData.farmSize ? parseFloat(formData.farmSize) : undefined,
      };

      await register(userData);
      console.log('Registration successful, navigating to tabs');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Registration failed:', error);
      Alert.alert('Registration Failed', error.message || 'Please try again');
    }
  };

  const handleLogin = () => {
    if (userType) {
      router.push(`/login?userType=${userType}`);
    } else {
      router.push('/login');
    }
  };

  if (!userType) {
    return (
      <SafeAreaContainer backgroundColor="#f0fdf4" statusBarStyle="dark-content">
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaContainer>
    );
  }

  const isFarmer = userType === 'farmer';

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaContainer backgroundColor="#f0fdf4" statusBarStyle="dark-content">
      <View style={styles.container}>
        {/* Background leaf decorations */}
        <View style={styles.backgroundDecorations}>
          <View style={styles.leafTopLeft}>
            <LeafDecoration size="medium" />
          </View>
          
          <View style={styles.leafTopRight}>
            <LeafDecoration size="small" />
          </View>
          
          <View style={styles.leafBottomLeft}>
            <LeafDecoration size="large" />
          </View>
          
          <View style={styles.leafBottomRight}>
            <LeafDecoration size="medium" />
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.brandTitle}>FARMICO</Text>
              <Text style={styles.subtitle}>Create your account</Text>
            </View>

            {/* Form Container */}
            <View style={styles.formContainer}>
              <Text style={styles.title}>Sign Up</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>FULL NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChangeText={(value) => updateFormData('name', value)}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>PHONE NUMBER</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChangeText={(value) => updateFormData('phone', value)}
                  keyboardType="phone-pad"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              {isFarmer && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>FARM SIZE (ACRES)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter farm size"
                    value={formData.farmSize}
                    onChangeText={(value) => updateFormData('farmSize', value)}
                    keyboardType="numeric"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              )}

              {!isFarmer && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>COMPANY NAME</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter company name"
                    value={formData.companyName}
                    onChangeText={(value) => updateFormData('companyName', value)}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>ADDRESS</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your address"
                  value={formData.address}
                  onChangeText={(value) => updateFormData('address', value)}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>PASSWORD</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChangeText={(value) => updateFormData('password', value)}
                    secureTextEntry
                    placeholderTextColor="#9ca3af"
                  />
                  <TouchableOpacity style={styles.eyeIcon}>
                    <Text style={styles.eyeText}>👁</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateFormData('confirmPassword', value)}
                  secureTextEntry
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.buttonContainer}>
                <ActionButton
                  title={isLoading ? 'Creating Account...' : 'Sign Up'}
                  variant="primary"
                  size="large"
                  fullWidth
                  onPress={handleRegister}
                  disabled={isLoading}
                  loading={isLoading}
                />
              </View>

              <TouchableOpacity onPress={handleLogin} style={styles.linkContainer}>
                <Text style={styles.loginLink}>Already have an account? Login</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backgroundDecorations: {
    position: 'absolute',
    width: width,
    height: height,
  },
  leafTopLeft: {
    position: 'absolute',
    top: height * 0.05,
    left: width * 0.02,
    transform: [{ rotate: '15deg' }],
    opacity: 0.4,
  },
  leafTopRight: {
    position: 'absolute',
    top: height * 0.1,
    right: width * 0.05,
    transform: [{ rotate: '-25deg' }],
    opacity: 0.3,
  },
  leafBottomLeft: {
    position: 'absolute',
    bottom: height * 0.05,
    left: width * 0.02,
    transform: [{ rotate: '35deg' }],
    opacity: 0.5,
  },
  leafBottomRight: {
    position: 'absolute',
    bottom: height * 0.1,
    right: width * 0.05,
    transform: [{ rotate: '-15deg' }],
    opacity: 0.3,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#21825C',
    fontWeight: '500',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#21825C',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#21825C',
    textAlign: 'center',
    opacity: 0.8,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#22c55e',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#21825C',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
  },
  eyeIcon: {
    paddingHorizontal: 16,
  },
  eyeText: {
    fontSize: 18,
    color: '#6b7280',
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 20,
  },
  linkContainer: {
    alignItems: 'center',
  },
  loginLink: {
    color: '#22c55e',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});