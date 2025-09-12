"use client"

import { useEffect } from "react"
import { View, Text, StyleSheet, Dimensions, Image } from "react-native"
import { router } from "expo-router"
import { SafeAreaContainer } from "../src/components/ui/SafeAreaContainer"

const { width, height } = Dimensions.get("window")

export default function SplashScreen() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Wait for splash screen duration
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Simple navigation to language selection for now
        // This avoids complex authentication logic that might cause issues
        router.replace("/language-selection")
      } catch (error) {
        console.error("Error during app initialization:", error)
        // Fallback to language selection on error
        router.replace("/language-selection")
      }
    }

    initializeApp()
  }, [])

  return (
    <SafeAreaContainer backgroundColor="#f0fdf4" statusBarStyle="dark-content">
      <View style={styles.container}>
        {/* Background leaf decorations */}
        <View style={styles.backgroundDecorations}>
          {/* Top area leaves */}
          <View style={styles.leafTopRight}>
            <Image 
              source={require("../assets/images/leaf-top.png")} 
              style={styles.leafLarge}
              resizeMode="contain"
            />
          </View>

          <View style={styles.leafTopLeft}>
            <Image 
              source={require("../assets/images/leaf-top.png")} 
              style={styles.leafMedium}
              resizeMode="contain"
            />
          </View>

          <View style={styles.leafTopCenter}>
            <Image 
              source={require("../assets/images/leaf-top.png")} 
              style={styles.leafSmall}
              resizeMode="contain"
            />
          </View>

          {/* Middle area leaves */}
          <View style={styles.leafMidLeft}>
            <Image 
              source={require("../assets/images/leaf-top.png")} 
              style={styles.leafMedium}
              resizeMode="contain"
            />
          </View>

          <View style={styles.leafMidRight}>
            <Image 
              source={require("../assets/images/leaf-top.png")} 
              style={styles.leafSmall}
              resizeMode="contain"
            />
          </View>

          {/* Bottom area leaves */}
          <View style={styles.leafBottomLeft}>
            <Image 
              source={require("../assets/images/leaf-bottom.png")} 
              style={styles.leafLarge}
              resizeMode="contain"
            />
          </View>

          <View style={styles.leafBottomRight}>
            <Image 
              source={require("../assets/images/leaf-bottom.png")} 
              style={styles.leafMedium}
              resizeMode="contain"
            />
          </View>

          <View style={styles.leafBottomCenter}>
            <Image 
              source={require("../assets/images/leaf-bottom.png")} 
              style={styles.leafSmall}
              resizeMode="contain"
            />
          </View>

          {/* Additional scattered leaves for natural pattern */}
          <View style={styles.leafScattered1}>
            <Image 
              source={require("../assets/images/leaf-top.png")} 
              style={styles.leafSmall}
              resizeMode="contain"
            />
          </View>

          <View style={styles.leafScattered2}>
            <Image 
              source={require("../assets/images/leaf-bottom.png")} 
              style={styles.leafSmall}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Main logo container */}
        <View style={styles.logoContainer}>
          <View style={styles.farmerContainer}>
            <Image 
              source={require("../assets/images/splash.png")} 
              style={styles.splashImage}
              resizeMode="contain"
            />
          </View>  

          <Text style={styles.logoText}>KHETIVETI</Text>
        </View> 
      </View>
    </SafeAreaContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backgroundDecorations: {
    position: "absolute",
    width: width,
    height: height,
  },
  leafTopRight: {
    position: "absolute",
    top: height * 0.06,
    right: width * 0.08,
    transform: [{ rotate: "15deg" }],
    opacity: 0.4,
  },
  leafTopLeft: {
    position: "absolute",
    top: height * 0.12,
    left: width * 0.1,
    transform: [{ rotate: "-25deg" }],
    opacity: 0.35,
  },
  leafTopCenter: {
    position: "absolute",
    top: height * 0.08,
    left: width * 0.45,
    transform: [{ rotate: "45deg" }],
    opacity: 0.25,
  },
  leafMidLeft: {
    position: "absolute",
    top: height * 0.4,
    left: width * 0.05,
    transform: [{ rotate: "30deg" }],
    opacity: 0.3,
  },
  leafMidRight: {
    position: "absolute",
    top: height * 0.45,
    right: width * 0.12,
    transform: [{ rotate: "-40deg" }],
    opacity: 0.25,
  },
  leafBottomLeft: {
    position: "absolute",
    bottom: height * 0.15,
    left: width * 0.08,
    transform: [{ rotate: "-15deg" }],
    opacity: 0.4,
  },
  leafBottomRight: {
    position: "absolute",
    bottom: height * 0.2,
    right: width * 0.1,
    transform: [{ rotate: "25deg" }],
    opacity: 0.35,
  },
  leafBottomCenter: {
    position: "absolute",
    bottom: height * 0.1,
    left: width * 0.4,
    transform: [{ rotate: "-35deg" }],
    opacity: 0.25,
  },
  leafScattered1: {
    position: "absolute",
    top: height * 0.25,
    right: width * 0.3,
    transform: [{ rotate: "60deg" }],
    opacity: 0.2,
  },
  leafScattered2: {
    position: "absolute",
    bottom: height * 0.35,
    left: width * 0.25,
    transform: [{ rotate: "-50deg" }],
    opacity: 0.2,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10, // Ensure logo stays above leaf decorations
  },
  farmerContainer: {
    marginBottom: 24, // Adjusted spacing to match Figma
    alignItems: "center",
    justifyContent: "center",
  },
  splashImage: {
    width: 200,
    height: 200,
  },
  leafLarge: {
    width: 60,
    height: 60,
  },
  leafMedium: {
    width: 45,
    height: 45,
  },
  leafSmall: {
    width: 30,
    height: 30,
  },
  logoText: {
    fontSize: 36, // Adjusted font size to match Figma proportions
    fontWeight: "900", // Made text bolder to match design
    color: "#1a5d1a", // Updated to deeper green matching Figma
    letterSpacing: 3, // Adjusted letter spacing
    textAlign: "center",
    fontFamily: "System",
    textShadowColor: "rgba(0, 0, 0, 0.1)", // Added subtle shadow for depth
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
})

