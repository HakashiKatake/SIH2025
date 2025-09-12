import { useEffect } from "react";
import { router } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

export default function Index() {
  useEffect(() => {
    // Start with splash screen
    const timer = setTimeout(() => {
      router.replace("/splash");
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show a simple loading screen while redirecting
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
  },
  text: {
    fontSize: 18,
    color: '#22c55e',
    fontWeight: '500',
  },
});
