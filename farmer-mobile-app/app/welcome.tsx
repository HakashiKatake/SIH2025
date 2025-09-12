"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, Dimensions, Image } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { UserTypeService, type UserType } from "../src/services/userTypeService"
import { SafeAreaContainer } from "../src/components/ui/SafeAreaContainer"
import { ActionButton } from "../src/components/ui/ActionButton"
import { useTranslation } from "../src/hooks/useTranslation"

const { width, height } = Dimensions.get("window")

export default function WelcomeScreen() {
  const { t } = useTranslation()
  const { userType: paramUserType } = useLocalSearchParams<{ userType?: UserType }>()
  const [userType, setUserType] = useState<UserType | null>(paramUserType || null)

  useEffect(() => {
    // If no userType in params, try to get from storage
    if (!paramUserType) {
      loadUserType()
    }
  }, [paramUserType])

  const loadUserType = async () => {
    try {
      const storedUserType = await UserTypeService.getStoredUserType()
      if (storedUserType) {
        setUserType(storedUserType)
      } else {
        // No user type found, redirect to user type selection
        router.replace("/user-type-selection")
      }
    } catch (error) {
      console.error("Error loading user type:", error)
      router.replace("/user-type-selection")
    }
  }

  const handleGetStarted = () => {
    if (userType) {
      router.push(`/register?userType=${userType}`)
    }
  }

  if (!userType) {
    return (
      <SafeAreaContainer backgroundColor="#f0fdf4" statusBarStyle="dark-content">
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaContainer>
    )
  }

  const isFarmer = userType === "farmer"

  return (
    <SafeAreaContainer backgroundColor="#ffffff" statusBarStyle="dark-content">
      <View style={styles.container}>
        {/* Background leaf decorations */}
        <View style={styles.backgroundDecorations}>
          {/* Top decorative leaves */}
          <View style={styles.leafTopRight}>
            <Image 
              source={require("../assets/images/leaf-top.png")} 
              style={styles.leafImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.leafBottomLeft}>
            <Image 
              source={require("../assets/images/leaf-bottom.png")} 
              style={styles.leafImage}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.content}>
          {/* Header with welcome message */}
          <View style={styles.header}>
            <Text style={styles.welcomeText}>{isFarmer ? t('welcome.farmerTitle') : t('welcome.dealerTitle')} 🌱</Text>
          </View>

          {/* Character illustration */}
          <View style={styles.illustrationContainer}>
            <View style={styles.circularBackground}>
              <Image 
                source={isFarmer ? require("../assets/images/farmer.png") : require("../assets/images/dealer.png")} 
                style={styles.userTypeImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Get Started button */}
          <View style={styles.buttonContainer}>
            <ActionButton
              title={t('welcome.getStarted')}
              variant="primary"
              size="large"
              fullWidth
              onPress={handleGetStarted}
              icon="arrow-forward"
              iconPosition="right"
            />
          </View>
        </View>
      </View>
    </SafeAreaContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backgroundDecorations: {
    position: "absolute",
    width: width,
    height: height,
  },
  leafTopRight: {
    position: "absolute",
    top: height * 0.05,
    right: -width * 0.1,
    transform: [{ rotate: "15deg" }],
    opacity: 0.6,
  },
  leafBottomLeft: {
    position: "absolute",
    bottom: height * 0.05,
    left: -width * 0.1,
    transform: [{ rotate: "-15deg" }],
    opacity: 0.6,
  },
  leafImage: {
    width: 80,
    height: 80,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#21825C",
    fontWeight: "500",
  },
  content: {
    flex: 1,
    justifyContent: "space-around",
    paddingVertical: 60,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#21825C",
    textAlign: "center",
    lineHeight: 36,
  },
  illustrationContainer: {
    alignItems: "center",
  },
  circularBackground: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#C8E6C9",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userTypeImage: {
    width: 140,
    height: 140,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
})