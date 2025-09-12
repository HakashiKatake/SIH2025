import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import AppInitService from '../services/appInitService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading, user } = useAuthStore();

  const handleLogin = async () => {
    const credential = loginMethod === 'phone' ? phone : email;
    
    if (!credential || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError(null);
      await login(loginMethod === 'phone' ? phone : '', password, loginMethod === 'email' ? email : '');
      
      // Register push token after successful login
      if (user?.id) {
        await AppInitService.registerPushToken(user.id);
        await AppInitService.scheduleFarmingReminders();
      }
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.');
    }
  };

  const handleRetry = () => {
    setError(null);
    handleLogin();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-green-50"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-6">
          <View className="bg-white rounded-lg p-6 shadow-lg">
            <Text className="text-3xl font-bold text-green-800 text-center mb-8">
              Farmer App
            </Text>
            
            {error && (
              <ErrorMessage 
                message={error} 
                onRetry={handleRetry}
                type="error"
              />
            )}
            
            {/* Login Method Selection */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Login Method</Text>
              <View className="flex-row bg-gray-100 rounded-lg p-1">
                <TouchableOpacity
                  className={`flex-1 py-2 px-4 rounded-md ${
                    loginMethod === 'phone' ? 'bg-green-600' : 'bg-transparent'
                  }`}
                  onPress={() => setLoginMethod('phone')}
                  disabled={isLoading}
                >
                  <Text className={`text-center font-medium ${
                    loginMethod === 'phone' ? 'text-white' : 'text-gray-600'
                  }`}>
                    Phone
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-2 px-4 rounded-md ${
                    loginMethod === 'email' ? 'bg-green-600' : 'bg-transparent'
                  }`}
                  onPress={() => setLoginMethod('email')}
                  disabled={isLoading}
                >
                  <Text className={`text-center font-medium ${
                    loginMethod === 'email' ? 'text-white' : 'text-gray-600'
                  }`}>
                    Email
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Dynamic Input Field */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">
                {loginMethod === 'phone' ? 'Phone Number' : 'Email Address'}
              </Text>
              {loginMethod === 'phone' ? (
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              ) : (
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                  placeholder="Enter your email address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              )}
            </View>

            <View className="mb-6">
              <Text className="text-gray-700 mb-2 font-medium">Password</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              className={`rounded-lg py-4 ${
                isLoading ? 'bg-gray-400' : 'bg-green-600'
              }`}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text className="text-white text-center font-semibold text-lg">
                {isLoading ? 'Logging in...' : 'Login'}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600">Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text className="text-green-600 font-semibold">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {isLoading && (
            <LoadingSpinner 
              message="Logging you in..." 
              overlay={true}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}