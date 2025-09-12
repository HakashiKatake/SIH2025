import React from 'react';
import { render } from '@testing-library/react-native';
import { WeatherWidget } from '../WeatherWidget';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

describe('WeatherWidget', () => {
  const mockProps = {
    temperature: 25,
    location: 'Test City',
    condition: 'Sunny',
    forecast: [
      { day: 'Today', icon: '☀️', temp: 25 },
      { day: 'Tomorrow', icon: '⛅', temp: 23 },
      { day: 'Day 3', icon: '🌧️', temp: 20 },
    ],
    isLoading: false,
  };

  it('renders weather information correctly', () => {
    const { getByText } = render(<WeatherWidget {...mockProps} />);
    
    expect(getByText("Today's Weather")).toBeTruthy();
    expect(getByText('25°C')).toBeTruthy();
    expect(getByText('Sunny')).toBeTruthy();
    expect(getByText('Test City')).toBeTruthy();
  });

  it('shows loading state when isLoading is true', () => {
    const { getByText } = render(<WeatherWidget {...mockProps} isLoading={true} />);
    
    expect(getByText('Loading weather...')).toBeTruthy();
  });

  it('renders forecast when provided', () => {
    const { getByText } = render(<WeatherWidget {...mockProps} />);
    
    expect(getByText('3-Day Forecast')).toBeTruthy();
    expect(getByText('Today')).toBeTruthy();
    expect(getByText('Tomorrow')).toBeTruthy();
    expect(getByText('Day 3')).toBeTruthy();
  });
});