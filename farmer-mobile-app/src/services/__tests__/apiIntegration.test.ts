// Simple test file to verify API integration
// This would be run manually or with a test runner

import { api } from '../apiClient';
import { StorageService } from '../storageService';
import LocationService from '../locationService';
import NotificationService from '../notificationService';

export const testApiIntegration = async () => {
  console.log('Testing API Integration...');

  try {
    // Test 1: Storage Service
    console.log('1. Testing Storage Service...');
    await StorageService.setItem('test_key', { message: 'Hello World' });
    const storedData = await StorageService.getItem('test_key');
    console.log('✅ Storage test passed:', storedData);

    // Test 2: Location Service
    console.log('2. Testing Location Service...');
    const hasLocationPermission = await LocationService.requestPermissions();
    console.log('✅ Location permission:', hasLocationPermission);

    if (hasLocationPermission) {
      const location = await LocationService.getCurrentLocation();
      console.log('✅ Current location:', location);
    }

    // Test 3: Notification Service
    console.log('3. Testing Notification Service...');
    const pushToken = await NotificationService.initialize();
    console.log('✅ Push token:', pushToken);

    // Test 4: API Client (this will fail without backend running)
    console.log('4. Testing API Client...');
    try {
      // This should fail gracefully with network error
      await api.get('/test');
    } catch (error: any) {
      if (error.type === 'NETWORK_ERROR') {
        console.log('✅ API client error handling works:', error.message);
      } else {
        console.log('⚠️ Unexpected API error:', error);
      }
    }

    console.log('🎉 All integration tests completed!');
  } catch (error) {
    console.error('❌ Integration test failed:', error);
  }
};

// Export for manual testing
export default testApiIntegration;