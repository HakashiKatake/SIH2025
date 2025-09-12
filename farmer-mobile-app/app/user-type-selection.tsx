"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from "react-native"
import { router } from "expo-router"
import { UserTypeService, type UserType } from "../src/services/userTypeService"
import { SafeAreaContainer } from "../src/components/ui/SafeAreaContainer"
import { useTranslation } from "../src/hooks/useTranslation"

const { width, height } = Dimensions.get("window")

export default function UserTypeSelectionScreen() {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<UserType | null>(null)

  const handleUserTypeSelect = (userType: UserType) => {
    setSelectedType(userType)
  }

  const handleContinue = async () => {
    if (!selectedType) return

    try {
      setIsLoading(true)

      // Store user type selection
      await UserTypeService.setUserType(selectedType)

      // Navigate to welcome screen with user type
      router.push(`/welcome?userType=${selectedType}`)
    } catch (error) {
      console.error("Error selecting user type:", error)
      // Continue navigation even if storage fails
      router.push(`/welcome?userType=${selectedType}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaContainer backgroundColor="#ffffff" statusBarStyle="dark-content">
      <View style={styles.container}>
        {/* Background leaf decorations */}
        <View style={styles.backgroundDecorations}>
          {/* Top right leaf */}
          <View style={styles.leafTopRight}>
            <Image 
              source={require("../assets/images/leaf-top.png")} 
              style={styles.leafImage}
              resizeMode="contain"
            />
          </View>

          {/* Bottom left leaf */}
          <View style={styles.leafBottomLeft}>
            <Image 
              source={require("../assets/images/leaf-bottom.png")} 
              style={styles.leafImage}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.content}>
          {/* User type selection */}
          <View style={styles.userTypeContainer}>
            {/* Farmer Option */}
            <TouchableOpacity
              style={[styles.userTypeCard, selectedType === "farmer" && styles.selectedCard]}
              onPress={() => handleUserTypeSelect("farmer")}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <View style={[styles.illustrationContainer, selectedType === "farmer" && styles.selectedIllustration]}>
                <Image 
                  source={require("../assets/images/farmer.png")} 
                  style={styles.userTypeImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={[styles.userTypeTitle, selectedType === "farmer" && styles.selectedTitle]}>{t('userType.farmer')}</Text>
            </TouchableOpacity>

            {/* Horizontal divider line between options */}
            <View style={styles.dividerLine} />

            {/* Dealer Option */}
            <TouchableOpacity
              style={[styles.userTypeCard, selectedType === "dealer" && styles.selectedCard]}
              onPress={() => handleUserTypeSelect("dealer")}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <View style={[styles.illustrationContainer, selectedType === "dealer" && styles.selectedIllustration]}>
                <Image 
                  source={require("../assets/images/dealer.png")} 
                  style={styles.userTypeImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={[styles.userTypeTitle, selectedType === "dealer" && styles.selectedTitle]}>{t('userType.dealer')}</Text>
            </TouchableOpacity>
          </View>

          {/* Continue button */}
          {selectedType && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleContinue}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.continueButtonText}>{isLoading ? t('common.loading') : t('common.continue')}</Text>
              </TouchableOpacity>
            </View>
          )}
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
    opacity: 0.7,
  },
  leafBottomLeft: {
    position: "absolute",
    bottom: height * 0.05,
    left: -width * 0.1,
    transform: [{ rotate: "-15deg" }],
    opacity: 0.7,
  },
  leafImage: {
    width: 80,
    height: 80,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 40,
  },
  userTypeContainer: {
    alignItems: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  userTypeCard: {
    alignItems: "center",
    width: "100%",
    maxWidth: 280,
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: "transparent",
    borderWidth: 0,
    marginBottom: 60,
  },
  selectedCard: {
    backgroundColor: "transparent",
  },
  illustrationContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#c8e6c9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedIllustration: {
    backgroundColor: "#a5d6a7",
    shadowOpacity: 0.2,
  },
  userTypeImage: {
    width: 80,
    height: 80,
  },
  userTypeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2e7d32",
    textAlign: "center",
  },
  selectedTitle: {
    color: "#1b5e20",
  },
  dividerLine: {
    width: width * 0.8,
    height: 4,
    backgroundColor: "#4caf50",
    borderRadius: 2,
    marginVertical: 20,
  },
  buttonContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  continueButton: {
    backgroundColor: "#4caf50",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#4caf50",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
})