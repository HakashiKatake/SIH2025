import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { StorageService } from './storageService';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface AddressData {
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  district?: string;
  subregion?: string;
}

export class LocationService {
  private static currentLocation: LocationData | null = null;
  private static watchSubscription: Location.LocationSubscription | null = null;

  // Request location permissions
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'This app needs location access to provide weather updates and location-based services.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Location.requestForegroundPermissionsAsync() },
          ]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  // Get current location
  static async getCurrentLocation(highAccuracy: boolean = false): Promise<LocationData | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: highAccuracy 
          ? Location.Accuracy.BestForNavigation 
          : Location.Accuracy.Balanced,
        maximumAge: 60000, // 1 minute
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        heading: location.coords.heading,
        speed: location.coords.speed,
        timestamp: location.timestamp,
      };

      this.currentLocation = locationData;
      
      // Cache location
      await StorageService.setItem('lastKnownLocation', locationData);

      return locationData;
    } catch (error) {
      console.error('Error getting current location:', error);
      
      // Try to return cached location
      const cachedLocation = await StorageService.getItem<LocationData>('lastKnownLocation');
      if (cachedLocation) {
        console.log('Using cached location');
        return cachedLocation;
      }
      
      return null;
    }
  }

  // Get cached location
  static async getCachedLocation(): Promise<LocationData | null> {
    if (this.currentLocation) {
      return this.currentLocation;
    }

    return await StorageService.getItem<LocationData>('lastKnownLocation');
  }

  // Reverse geocoding - get address from coordinates
  static async getAddressFromCoordinates(
    latitude: number,
    longitude: number
  ): Promise<AddressData | null> {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses.length > 0) {
        const address = addresses[0];
        return {
          street: address.street,
          city: address.city,
          region: address.region,
          country: address.country,
          postalCode: address.postalCode,
          district: address.district,
          subregion: address.subregion,
        };
      }

      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  // Forward geocoding - get coordinates from address
  static async getCoordinatesFromAddress(address: string): Promise<LocationData | null> {
    try {
      const locations = await Location.geocodeAsync(address);

      if (locations.length > 0) {
        const location = locations[0];
        return {
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: Date.now(),
        };
      }

      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }

  // Start watching location changes
  static async startWatchingLocation(
    callback: (location: LocationData) => void,
    options?: {
      accuracy?: Location.Accuracy;
      timeInterval?: number;
      distanceInterval?: number;
    }
  ): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return false;
      }

      this.watchSubscription = await Location.watchPositionAsync(
        {
          accuracy: options?.accuracy || Location.Accuracy.Balanced,
          timeInterval: options?.timeInterval || 30000, // 30 seconds
          distanceInterval: options?.distanceInterval || 100, // 100 meters
        },
        (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            altitude: location.coords.altitude,
            heading: location.coords.heading,
            speed: location.coords.speed,
            timestamp: location.timestamp,
          };

          this.currentLocation = locationData;
          callback(locationData);
        }
      );

      return true;
    } catch (error) {
      console.error('Error starting location watch:', error);
      return false;
    }
  }

  // Stop watching location changes
  static stopWatchingLocation(): void {
    if (this.watchSubscription) {
      this.watchSubscription.remove();
      this.watchSubscription = null;
    }
  }

  // Calculate distance between two points (in kilometers)
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Check if location services are enabled
  static async isLocationEnabled(): Promise<boolean> {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      console.error('Error checking location services:', error);
      return false;
    }
  }

  // Get location string for display
  static async getLocationString(location?: LocationData): Promise<string> {
    try {
      const loc = location || await this.getCurrentLocation();
      if (!loc) {
        return 'Location unavailable';
      }

      const address = await this.getAddressFromCoordinates(loc.latitude, loc.longitude);
      if (address) {
        return `${address.city || ''}, ${address.region || ''}, ${address.country || ''}`.replace(/^,\s*|,\s*$/g, '');
      }

      return `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`;
    } catch (error) {
      console.error('Error getting location string:', error);
      return 'Location unavailable';
    }
  }
}

export default LocationService;