import React, { useState, useEffect } from "react";
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
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "../src/store/authStore";
import { UserTypeService, UserType } from "../src/services/userTypeService";
import { SafeAreaContainer } from "../src/components/ui/SafeAreaContainer";
import { LeafDecoration } from "../src/components/ui/IllustrationPlaceholder";
import { ActionButton } from "../src/components/ui/ActionButton";
import { useTranslation } from "../src/hooks/useTranslation";

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { t } = useTranslation();
  const { userType: paramUserType } = useLocalSearchParams<{ userType?: UserType }>();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<UserType | null>(paramUserType || null);
  const { login, isLoading } = useAuthStore();

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

  const handleLogin = async () => {
    // Validation
    if (!phone?.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }

    if (!password?.trim()) {
      Alert.alert("Error", "Please enter your password");
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      Alert.alert("Error", "Please enter a valid Indian phone number");
      return;
    }

    try {
      await login(cleanPhone, password);
      console.log('Login successful, navigating to tabs');
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error('Login failed:', error);
      Alert.alert("Login Failed", error.message || "Invalid phone number or password");
    }
  };

  const handleSignUp = () => {
    if (userType) {
      router.push(`/register?userType=${userType}`);
    } else {
      router.push('/register');
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
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.brandTitle}>FARMICO</Text>
              <Text style={styles.subtitle}>{t('auth.loginTitle')}</Text>
            </View>

            {/* Form Container */}
            <View style={styles.formContainer}>
              <Text style={styles.title}>{t('auth.login')}</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('auth.phone').toUpperCase()}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.enterPhone')}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('auth.password').toUpperCase()}</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder={t('auth.enterPassword')}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholderTextColor="#9ca3af"
                  />
                  <TouchableOpacity style={styles.eyeIcon}>
                    <Text style={styles.eyeText}>👁</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <ActionButton
                  title={isLoading ? t('common.loading') : t('auth.loginButton')}
                  variant="primary"
                  size="large"
                  fullWidth
                  onPress={handleLogin}
                  disabled={isLoading}
                  loading={isLoading}
                />
              </View>

              <TouchableOpacity onPress={handleSignUp} style={styles.linkContainer}>
                <Text style={styles.continueText}>{t('dashboard.continueAsConsumer')} →</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSignUp} style={styles.linkContainer}>
                <Text style={styles.registerLink}>{t('auth.dontHaveAccount')} {t('auth.register')}</Text>
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
    justifyContent: 'center',
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
    marginBottom: 12,
  },
  continueText: {
    color: '#6b7280',
    fontSize: 16,
    textAlign: 'center',
  },
  registerLink: {
    color: '#22c55e',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});
