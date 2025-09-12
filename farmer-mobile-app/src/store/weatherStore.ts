import { create } from 'zustand';
import { api } from '../services/apiClient';
import { cacheStorage } from '../services/storageService';
import LocationService from '../services/locationService';
import { WeatherState, WeatherForecast, FarmingAlert, AgriculturalAdvisory, CropPlanningAdvice, WeatherForecastDay } from '../types';

interface EnhancedWeatherState extends WeatherState {
  currentLocation: { latitude: number; longitude: number } | null;
  locationAddress: string | null;
  lastUpdated: Date | null;
  autoRefreshEnabled: boolean;
  getForecastByLocation: (token: string) => Promise<void>;
  generateAlerts: (token: string) => Promise<void>;
  setAutoRefresh: (enabled: boolean) => void;
  refreshWeatherData: (token: string) => Promise<void>;
}

export const useWeatherStore = create<EnhancedWeatherState>((set, get) => ({
  forecast: null,
  alerts: [],
  isLoading: false,
  currentLocation: null,
  locationAddress: null,
  lastUpdated: null,
  autoRefreshEnabled: true,

  getForecast: async (lat: number, lon: number, token: string) => {
    set({ isLoading: true });
    const locationKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
    
    try {
      // Try to get cached data first
      const cachedForecast = await cacheStorage.getWeatherCache(locationKey);
      if (cachedForecast && get().isDataFresh(cachedForecast.lastUpdated)) {
        set({ 
          forecast: cachedForecast, 
          isLoading: false,
          currentLocation: { latitude: lat, longitude: lon },
          lastUpdated: new Date(cachedForecast.lastUpdated)
        });
        return;
      }

      // Fetch fresh data from API
      const response = await api.get<WeatherForecast>(`/weather/forecast/${lat}/${lon}`);
      
      // Get location address
      const address = await LocationService.getAddressFromCoordinates(lat, lon);
      const locationAddress = address ? 
        `${address.city || ''}, ${address.region || ''}, ${address.country || ''}`.replace(/^,\s*|,\s*$/g, '') :
        'Current Location';

      const enhancedForecast = {
        ...response,
        location: {
          ...response.location,
          address: locationAddress
        }
      };
      
      set({ 
        forecast: enhancedForecast, 
        isLoading: false,
        currentLocation: { latitude: lat, longitude: lon },
        locationAddress,
        lastUpdated: new Date()
      });
      
      // Cache the response with timestamp
      await cacheStorage.setWeatherCache({
        ...enhancedForecast,
        lastUpdated: new Date().toISOString()
      }, locationKey);
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      
      // Try to use cached data if API fails
      const cachedForecast = await cacheStorage.getWeatherCache(locationKey);
      if (cachedForecast) {
        set({ 
          forecast: cachedForecast, 
          isLoading: false,
          currentLocation: { latitude: lat, longitude: lon },
          lastUpdated: cachedForecast.lastUpdated ? new Date(cachedForecast.lastUpdated) : null
        });
        return;
      }
      
      // Fallback to enhanced mock data for development
      const mockForecast: WeatherForecast = {
        location: {
          latitude: lat,
          longitude: lon,
          address: 'Current Location',
        },
        current: {
          temperature: 28,
          humidity: 65,
          windSpeed: 12,
          windDirection: 180,
          pressure: 1013,
          visibility: 10,
          uvIndex: 6,
          feelsLike: 31,
          description: 'Partly Cloudy',
          icon: '⛅',
          date: new Date().toISOString(),
        },
        forecast: [
          {
            date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            weather: {
              temperature: 30,
              humidity: 60,
              windSpeed: 15,
              windDirection: 200,
              pressure: 1015,
              visibility: 12,
              uvIndex: 8,
              feelsLike: 33,
              description: 'Sunny',
              icon: '☀️',
              date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            },
            precipitation: { probability: 10, amount: 0 },
            minTemp: 22,
            maxTemp: 32
          },
          {
            date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
            weather: {
              temperature: 26,
              humidity: 75,
              windSpeed: 8,
              windDirection: 150,
              pressure: 1008,
              visibility: 8,
              uvIndex: 4,
              feelsLike: 29,
              description: 'Light Rain',
              icon: '🌦️',
              date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
            },
            precipitation: { probability: 70, amount: 5 },
            minTemp: 20,
            maxTemp: 28
          },
          {
            date: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
            weather: {
              temperature: 29,
              humidity: 55,
              windSpeed: 18,
              windDirection: 220,
              pressure: 1018,
              visibility: 15,
              uvIndex: 7,
              feelsLike: 32,
              description: 'Clear Sky',
              icon: '☀️',
              date: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
            },
            precipitation: { probability: 5, amount: 0 },
            minTemp: 23,
            maxTemp: 31
          },
        ],
        farmingRecommendations: [
          'Good weather for irrigation today - soil moisture optimal',
          'Consider harvesting before expected rain tomorrow',
          'Apply fertilizer during sunny periods for better absorption',
          'Monitor crops for heat stress during peak afternoon hours'
        ],
        agriculturalAdvisory: {
          irrigation: 'Moderate irrigation needed. Soil moisture at 65%. Water early morning or evening.',
          pestControl: 'Good conditions for pest control activities. Low wind speed favorable for spraying.',
          harvesting: 'Excellent harvesting conditions today. Avoid harvesting during rain tomorrow.',
          planting: 'Suitable for planting heat-resistant crops. Avoid planting before rain.',
          generalAdvice: 'Monitor weather closely for next 3 days. Prepare for rain on day 2.',
          soilConditions: 'Soil temperature optimal for root development. Good drainage recommended.',
          cropProtection: 'Provide shade during peak sun hours. Secure tall crops before wind.'
        },
        cropPlanningAdvice: [
          {
            cropType: 'Rice',
            recommendation: 'Ideal time for transplanting rice seedlings',
            timing: 'Next 2 days before rain',
            priority: 'high',
            weatherFactor: 'Upcoming rain will provide natural irrigation'
          },
          {
            cropType: 'Wheat',
            recommendation: 'Good conditions for wheat sowing',
            timing: 'This week',
            priority: 'medium',
            weatherFactor: 'Moderate temperatures and humidity'
          },
          {
            cropType: 'Tomato',
            recommendation: 'Protect from direct sun and prepare drainage',
            timing: 'Immediate',
            priority: 'high',
            weatherFactor: 'High UV index and expected rain'
          }
        ]
      };
      set({ 
        forecast: mockForecast, 
        isLoading: false,
        currentLocation: { latitude: lat, longitude: lon },
        lastUpdated: new Date()
      });
    }
  },

  getForecastByLocation: async (token: string) => {
    try {
      const location = await LocationService.getCurrentLocation(true);
      if (location) {
        await get().getForecast(location.latitude, location.longitude, token);
      } else {
        throw new Error('Unable to get current location');
      }
    } catch (error) {
      console.error('Error getting forecast by location:', error);
      // Try to use cached location
      const cachedLocation = await LocationService.getCachedLocation();
      if (cachedLocation) {
        await get().getForecast(cachedLocation.latitude, cachedLocation.longitude, token);
      }
    }
  },

  getAlerts: async (token: string) => {
    try {
      const response = await api.get<FarmingAlert[]>('/weather/alerts');
      set({ alerts: response });
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      
      // Enhanced mock alerts for development
      const mockAlerts: FarmingAlert[] = [
        {
          id: '1',
          type: 'rain',
          title: 'Heavy Rain Alert',
          message: 'Heavy rain expected tomorrow (15mm). Ensure proper drainage and postpone field activities.',
          priority: 'high',
          severity: 'high',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          actionRequired: true,
          recommendations: [
            'Check and clear drainage channels',
            'Postpone pesticide application',
            'Secure loose farming equipment',
            'Harvest ready crops if possible'
          ]
        },
        {
          id: '2',
          type: 'temperature',
          title: 'High Temperature Warning',
          message: 'Temperature expected to reach 35°C. Increase irrigation frequency and provide crop protection.',
          priority: 'medium',
          severity: 'medium',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
          actionRequired: true,
          recommendations: [
            'Increase irrigation frequency',
            'Provide shade for sensitive crops',
            'Monitor for heat stress symptoms',
            'Avoid midday field work'
          ]
        },
        {
          id: '3',
          type: 'wind',
          title: 'Strong Wind Advisory',
          message: 'Wind speeds up to 25 km/h expected. Secure tall crops and avoid spraying activities.',
          priority: 'medium',
          severity: 'medium',
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          actionRequired: false,
          recommendations: [
            'Secure tall and climbing crops',
            'Postpone pesticide spraying',
            'Check greenhouse structures'
          ]
        },
        {
          id: '4',
          type: 'irrigation',
          title: 'Irrigation Reminder',
          message: 'Soil moisture levels are low. Consider irrigation for optimal crop growth.',
          priority: 'low',
          severity: 'low',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          actionRequired: false,
          recommendations: [
            'Check soil moisture levels',
            'Water during early morning or evening',
            'Focus on newly planted crops'
          ]
        },
      ];
      set({ alerts: mockAlerts });
    }
  },

  generateAlerts: async (token: string) => {
    try {
      const response = await api.post<FarmingAlert[]>('/weather/alerts/generate');
      set({ alerts: response });
    } catch (error) {
      console.error('Error generating weather alerts:', error);
      // Fallback to getAlerts
      await get().getAlerts(token);
    }
  },

  refreshWeatherData: async (token: string) => {
    const { currentLocation } = get();
    if (currentLocation) {
      await get().getForecast(currentLocation.latitude, currentLocation.longitude, token);
      await get().generateAlerts(token);
    } else {
      await get().getForecastByLocation(token);
      await get().generateAlerts(token);
    }
  },

  setAutoRefresh: (enabled: boolean) => set({ autoRefreshEnabled: enabled }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  // Helper method to check if data is fresh (within 30 minutes)
  isDataFresh: (lastUpdated: string | Date | null): boolean => {
    if (!lastUpdated) return false;
    const updateTime = new Date(lastUpdated);
    const now = new Date();
    const diffMinutes = (now.getTime() - updateTime.getTime()) / (1000 * 60);
    return diffMinutes < 30;
  }
}));