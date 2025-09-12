import React from 'react';
import { StyleSheet, View } from 'react-native';
import WeatherScreen from '../../../src/screens/WeatherScreen';

export default function WeatherTab() {
  return (
    <View style={styles.container}>
      <WeatherScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});