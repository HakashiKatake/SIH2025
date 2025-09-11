import { ChatMessage, IChatMessage } from "../models/ChatMessage";
import { DatabaseError } from "../utils/errors";

export interface ChatResponse {
  response: string;
  language: string;
  audioUrl?: string;
  relatedTopics: string[];
  confidence: number;
}

export interface ChatQuery {
  message: string;
  userId: string;
  language: string;
  messageType: "text" | "voice";
  audioUrl?: string;
}

class ChatbotService {
  private farmingAdviceDatabase = {
    en: {
      crop_diseases: [
        "For leaf spot diseases, remove affected leaves and spray neem oil solution every 3 days.",
        "Fungal infections can be treated with copper sulfate spray. Apply early morning or evening.",
        "Bacterial wilt requires immediate removal of infected plants to prevent spread.",
      ],
      pest_control: [
        "Use yellow sticky traps to monitor and control aphids and whiteflies.",
        "Neem oil is effective against most soft-bodied insects. Spray during cooler hours.",
        "Companion planting with marigolds helps repel many common pests.",
      ],
      fertilizers: [
        "Apply organic compost 2-3 weeks before sowing for better soil health.",
        "Use balanced NPK fertilizer (10:26:26) during flowering stage.",
        "Foliar feeding with micronutrients improves crop quality and yield.",
      ],
      irrigation: [
        "Water early morning to reduce evaporation and disease risk.",
        "Drip irrigation saves 30-50% water compared to flood irrigation.",
        "Check soil moisture at 6-inch depth before watering.",
      ],
      weather: [
        "Avoid spraying pesticides before expected rain within 24 hours.",
        "Cover young plants during unexpected frost or hailstorm.",
        "Harvest mature crops before heavy monsoon to prevent damage.",
      ],
      general: [
        "Crop rotation helps break pest and disease cycles naturally.",
        "Regular soil testing helps optimize fertilizer application.",
        "Keep farm records to track what works best for your land.",
      ],
    },
    hi: {
      crop_diseases: [
        "पत्ती के धब्बे की बीमारी के लिए, प्रभावित पत्तियों को हटाएं और हर 3 दिन में नीम का तेल छिड़कें।",
        "फंगल संक्रमण का इलाज कॉपर सल्फेट स्प्रे से करें। सुबह जल्दी या शाम को लगाएं।",
        "बैक्टीरियल विल्ट के लिए संक्रमित पौधों को तुरंत हटाना जरूरी है।",
      ],
      pest_control: [
        "एफिड्स और व्हाइटफ्लाई को नियंत्रित करने के लिए पीले चिपचिपे जाल का उपयोग करें।",
        "नीम का तेल अधिकांश कोमल कीड़ों के खिलाफ प्रभावी है। ठंडे समय में छिड़कें।",
        "गेंदे के साथ साथी रोपण कई सामान्य कीटों को भगाने में मदद करता है।",
      ],
      fertilizers: [
        "मिट्टी के स्वास्थ्य के लिए बुवाई से 2-3 सप्ताह पहले जैविक खाद डालें।",
        "फूल आने के समय संतुलित NPK उर्वरक (10:26:26) का उपयोग करें।",
        "सूक्ष्म पोषक तत्वों के पत्तियों पर छिड़काव से फसल की गुणवत्ता बढ़ती है।",
      ],
      irrigation: [
        "वाष्पीकरण और बीमारी के जोखिम को कम करने के लिए सुबह जल्दी पानी दें।",
        "ड्रिप सिंचाई बाढ़ सिंचाई की तुलना में 30-50% पानी बचाती है।",
        "पानी देने से पहले 6 इंच की गहराई पर मिट्टी की नमी जांचें।",
      ],
      weather: [
        "24 घंटे के भीतर बारिश की उम्मीद से पहले कीटनाशक का छिड़काव न करें।",
        "अप्रत्याशित पाला या ओलावृष्टि के दौरान युवा पौधों को ढकें।",
        "नुकसान से बचने के लिए भारी मानसून से पहले परिपक्व फसलों की कटाई करें।",
      ],
      general: [
        "फसल चक्र प्राकृतिक रूप से कीट और रोग चक्र को तोड़ने में मदद करता है।",
        "नियमित मिट्टी परीक्षण उर्वरक के उपयोग को अनुकूलित करने में मदद करता है।",
        "अपनी भूमि के लिए सबसे अच्छा क्या काम करता है, इसे ट्रैक करने के लिए खेत के रिकॉर्ड रखें।",
      ],
    },
  };

  private relatedTopicsDatabase = {
    en: {
      crop_diseases: [
        "pest control",
        "organic farming",
        "plant health",
        "fungicides",
      ],
      pest_control: [
        "crop diseases",
        "organic pesticides",
        "beneficial insects",
        "IPM",
      ],
      fertilizers: [
        "soil health",
        "organic farming",
        "nutrient management",
        "composting",
      ],
      irrigation: [
        "water management",
        "soil moisture",
        "drought management",
        "water conservation",
      ],
      weather: [
        "crop protection",
        "seasonal farming",
        "climate adaptation",
        "harvest timing",
      ],
      general: [
        "sustainable farming",
        "crop planning",
        "farm management",
        "agricultural practices",
      ],
    },
    hi: {
      crop_diseases: [
        "कीट नियंत्रण",
        "जैविक खेती",
        "पौधों का स्वास्थ्य",
        "फफूंदनाशी",
      ],
      pest_control: [
        "फसल रोग",
        "जैविक कीटनाशक",
        "लाभकारी कीड़े",
        "एकीकृत कीट प्रबंधन",
      ],
      fertilizers: [
        "मिट्टी का स्वास्थ्य",
        "जैविक खेती",
        "पोषक तत्व प्रबंधन",
        "कंपोस्टिंग",
      ],
      irrigation: ["जल प्रबंधन", "मिट्टी की नमी", "सूखा प्रबंधन", "जल संरक्षण"],
      weather: ["फसल सुरक्षा", "मौसमी खेती", "जलवायु अनुकूलन", "कटाई का समय"],
      general: ["टिकाऊ खेती", "फसल योजना", "खेत प्रबंधन", "कृषि प्रथाएं"],
    },
  };

  /**
   * Process text query and generate farming advice
   */
  async processTextQuery(query: ChatQuery): Promise<ChatResponse> {
    try {
      const { message, userId, language, messageType } = query;

      // Generate mock response based on query content
      const response = this.generateMockResponse(message, language);

      // Save to database
      const chatMessage = new ChatMessage({
        userId,
        message,
        response: response.response,
        language,
        messageType,
        confidence: response.confidence,
        relatedTopics: response.relatedTopics,
      });

      await chatMessage.save();

      return response;
    } catch (error) {
      throw new DatabaseError(
        "Failed to process chat query",
        500,
        "CHAT_QUERY_ERROR"
      );
    }
  }

  /**
   * Process voice query (mock implementation)
   */
  async processVoiceQuery(query: ChatQuery): Promise<ChatResponse> {
    try {
      // For now, treat voice queries similar to text queries
      // In real implementation, this would involve speech-to-text conversion
      const response = await this.processTextQuery({
        ...query,
        messageType: "voice",
      });

      // Mock audio URL for text-to-speech response
      response.audioUrl = `https://mock-tts-service.com/audio/${Date.now()}.mp3`;

      return response;
    } catch (error) {
      throw new DatabaseError(
        "Failed to process voice query",
        500,
        "VOICE_QUERY_ERROR"
      );
    }
  }

  /**
   * Get chat history for a user
   */
  async getChatHistory(
    userId: string,
    limit: number = 20,
    page: number = 1
  ): Promise<IChatMessage[]> {
    try {
      const skip = (page - 1) * limit;

      const chatHistory = await ChatMessage.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      return chatHistory;
    } catch (error) {
      throw new DatabaseError(
        "Failed to retrieve chat history",
        500,
        "CHAT_HISTORY_ERROR"
      );
    }
  }

  /**
   * Generate mock farming advice response
   */
  private generateMockResponse(
    message: string,
    language: string
  ): ChatResponse {
    const lang = language in this.farmingAdviceDatabase ? language : "en";
    const advice =
      this.farmingAdviceDatabase[
        lang as keyof typeof this.farmingAdviceDatabase
      ];
    const topics =
      this.relatedTopicsDatabase[
        lang as keyof typeof this.relatedTopicsDatabase
      ];

    // Simple keyword matching for response generation
    const lowerMessage = message.toLowerCase();
    let category = "general";
    let confidence = 0.7;

    if (
      lowerMessage.includes("disease") ||
      lowerMessage.includes("रोग") ||
      lowerMessage.includes("बीमारी")
    ) {
      category = "crop_diseases";
      confidence = 0.9;
    } else if (
      lowerMessage.includes("pest") ||
      lowerMessage.includes("insect") ||
      lowerMessage.includes("कीट")
    ) {
      category = "pest_control";
      confidence = 0.9;
    } else if (
      lowerMessage.includes("fertilizer") ||
      lowerMessage.includes("उर्वरक") ||
      lowerMessage.includes("खाद")
    ) {
      category = "fertilizers";
      confidence = 0.85;
    } else if (
      lowerMessage.includes("water") ||
      lowerMessage.includes("irrigation") ||
      lowerMessage.includes("पानी") ||
      lowerMessage.includes("सिंचाई")
    ) {
      category = "irrigation";
      confidence = 0.85;
    } else if (
      lowerMessage.includes("weather") ||
      lowerMessage.includes("rain") ||
      lowerMessage.includes("मौसम") ||
      lowerMessage.includes("बारिश")
    ) {
      category = "weather";
      confidence = 0.8;
    }

    // Get random advice from the selected category
    const categoryAdvice = advice[category as keyof typeof advice];
    const randomAdvice =
      categoryAdvice[Math.floor(Math.random() * categoryAdvice.length)];

    // Get related topics
    const relatedTopics =
      topics[category as keyof typeof topics] || topics.general;

    return {
      response: randomAdvice,
      language: lang,
      relatedTopics: relatedTopics.slice(0, 3), // Return top 3 related topics
      confidence,
    };
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): string[] {
    return ["en", "hi", "ta", "te", "kn", "ml", "gu", "mr", "bn", "pa"];
  }
}

export const chatbotService = new ChatbotService();
