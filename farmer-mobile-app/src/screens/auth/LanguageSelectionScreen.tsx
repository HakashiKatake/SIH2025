import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  StatusBar,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { LanguageService } from "../../services/languageService";
import { UserTypeService } from "../../services/userTypeService";

const { width, height } = Dimensions.get("window");

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
];

export default function LanguageSelectionScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");

  const handleLanguageSelect = async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    try {
      await LanguageService.setLanguage(languageCode);
      await UserTypeService.setLanguageSelected();
      router.push("/user-type-selection");
    } catch (error) {
      console.error("Error setting language:", error);
      router.push("/user-type-selection");
    }
  };

  return (
    <View style={styles.screen}>
      
      {/* Top right leaf */}
      <Image
        source={require("../../../assets/images/leaf-top.png")}
        style={styles.leafTopRight}
        resizeMode="contain"
      />
      {/* Bottom left leaf */}
      <Image
        source={require("../../../assets/images/leaf-bottom.png")}
        style={styles.leafBottomLeft}
        resizeMode="contain"
        
      />
    
  
      {/* Main content */}
      <View style={styles.content}>
        <Text style={styles.title}>Select Your Language</Text>
        <View style={styles.languageGrid}>
          {languages.map((language, idx) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageButton,
                selectedLanguage === language.code && styles.selectedButton,
              ]}
              activeOpacity={0.8}
              onPress={() => handleLanguageSelect(language.code)}
            >
              <Text
                style={[
                  styles.languageText,
                  selectedLanguage === language.code && styles.selectedLanguageText,
                ]}
              >
                {language.nativeName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const BUTTON_HEIGHT = 46;
const BUTTON_WIDTH = (width - 60) / 2;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "stretch",
    justifyContent: "flex-start",
    position: "relative",
  },
  // Simulated status bar (time + icons)
  statusBarSim: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight ?? 24 : 18,
    paddingHorizontal: 20,
    height: 32,
    backgroundColor: "transparent",
    zIndex: 10,
  },
  statusBarTime: {
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    color: "#222",
    letterSpacing: 0.3,
  },
  statusBarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  signalBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginRight: 4,
    gap: 1,
  },
  bar: {
    width: 3.5,
    backgroundColor: "#222",
    borderRadius: 1,
    marginLeft: 1,
  },
  statusIcon: {
    width: 18,
    height: 12,
    marginHorizontal: 1,
    tintColor: "#222",
  },
  leafTopRight: {
    position: "absolute",
    top: 44,
    right: -10,
    width: 140,
    height: 90,
    opacity: 0.7,
    zIndex: 1,
  },
  leafBottomLeft: {
    position: "absolute",
    bottom: -40,
    left: -20,
    width: 170,
    height: 110,
    opacity: 0.8,
    zIndex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    marginTop: 34,
    paddingTop: 18,
    zIndex: 2,
  },
  title: {
    fontSize: 28,
    fontFamily: "Montserrat-Bold",
    color: "#43835C",
    marginBottom: 36,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  languageGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 0,
  },
  languageButton: {
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    backgroundColor: "#fff",
    borderColor: "#97C995",
    borderWidth: 2,
    borderRadius: 24,
    marginHorizontal: 5,
    marginVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#97C995",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  selectedButton: {
    borderColor: "#43835C",
    backgroundColor: "#f0fdf4",
    shadowOpacity: 0.08,
  },
  languageText: {
    fontSize: 18,
    color: "#43835C",
    fontFamily: "Poppins-Bold",
    textAlign: "center",
    letterSpacing: 0.1,
    includeFontPadding: false,
    paddingVertical: 0,
    paddingHorizontal: 4,
  },
  selectedLanguageText: {
    color: "#21825C",
    fontFamily: "Poppins-Bold",
  },
});