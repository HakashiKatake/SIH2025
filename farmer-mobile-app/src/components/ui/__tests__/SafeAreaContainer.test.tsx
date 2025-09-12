import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SafeAreaContainer } from '../SafeAreaContainer';

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, style }: any) => (
    <div style={style} testID="safe-area-view">
      {children}
    </div>
  ),
}));

describe('SafeAreaContainer', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <SafeAreaContainer>
        <Text>Test Content</Text>
      </SafeAreaContainer>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('applies custom background color', () => {
    const { getByTestId } = render(
      <SafeAreaContainer backgroundColor="#ff0000">
        <Text>Test Content</Text>
      </SafeAreaContainer>
    );

    const container = getByTestId('safe-area-view');
    expect(container.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: '#ff0000',
      })
    );
  });

  it('uses default background color when not specified', () => {
    const { getByTestId } = render(
      <SafeAreaContainer>
        <Text>Test Content</Text>
      </SafeAreaContainer>
    );

    const container = getByTestId('safe-area-view');
    expect(container.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: '#f8fafc',
      })
    );
  });
});