import React from 'react';
import { render } from '@testing-library/react-native';
import { QuickActionGrid } from '../QuickActionGrid';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

describe('QuickActionGrid', () => {
  it('renders default actions correctly', () => {
    const { getByText } = render(<QuickActionGrid />);
    
    expect(getByText('Quick Actions')).toBeTruthy();
    expect(getByText('Field Map')).toBeTruthy();
    expect(getByText('Weather')).toBeTruthy();
    expect(getByText('Calendar')).toBeTruthy();
    expect(getByText('Crop Safety Test')).toBeTruthy();
  });

  it('renders custom actions when provided', () => {
    const customActions = [
      {
        id: 'custom-action',
        title: 'Custom Action',
        subtitle: 'Custom subtitle',
        route: '/custom',
        iconColor: '#000000',
        backgroundColor: '#ffffff',
        gradientFrom: '#f0f0f0',
        gradientTo: '#e0e0e0',
      },
    ];

    const { getByText } = render(<QuickActionGrid actions={customActions} />);
    
    expect(getByText('Custom Action')).toBeTruthy();
    expect(getByText('Custom subtitle')).toBeTruthy();
  });
});