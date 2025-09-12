"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDatabaseFailure = exports.handleImageUploadFailure = exports.getChatbotFallbackResponse = exports.getCropAnalysisFallbackData = exports.getWeatherFallbackData = exports.CircuitBreaker = void 0;
exports.retryWithBackoff = retryWithBackoff;
exports.withTimeout = withTimeout;
const errorHandler_1 = require("../middleware/errorHandler");
/**
 * Simple circuit breaker implementation
 */
class CircuitBreaker {
    constructor(failureThreshold = 5, recoveryTimeout = 60000) {
        this.failureThreshold = failureThreshold;
        this.recoveryTimeout = recoveryTimeout;
        this.state = {
            failures: 0,
            lastFailureTime: 0,
            state: 'CLOSED'
        };
    }
    async execute(operation, fallback) {
        if (this.state.state === 'OPEN') {
            if (Date.now() - this.state.lastFailureTime > this.recoveryTimeout) {
                this.state.state = 'HALF_OPEN';
            }
            else {
                if (fallback) {
                    return await fallback();
                }
                throw new errorHandler_1.ExternalServiceError('Circuit Breaker', 'Service temporarily unavailable');
            }
        }
        try {
            const result = await operation();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure();
            if (fallback) {
                return await fallback();
            }
            throw error;
        }
    }
    onSuccess() {
        this.state.failures = 0;
        this.state.state = 'CLOSED';
    }
    onFailure() {
        this.state.failures++;
        this.state.lastFailureTime = Date.now();
        if (this.state.failures >= this.failureThreshold) {
            this.state.state = 'OPEN';
        }
    }
    getState() {
        return { ...this.state };
    }
}
exports.CircuitBreaker = CircuitBreaker;
/**
 * Retry mechanism with exponential backoff
 */
async function retryWithBackoff(operation, maxRetries = 3, baseDelay = 1000, maxDelay = 10000) {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error;
            if (attempt === maxRetries) {
                break;
            }
            const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw lastError;
}
/**
 * Timeout wrapper for operations
 */
function withTimeout(operation, timeoutMs, timeoutMessage = 'Operation timed out') {
    return Promise.race([
        operation(),
        new Promise((_, reject) => {
            setTimeout(() => {
                reject(new errorHandler_1.ExternalServiceError('Timeout', timeoutMessage, 408));
            }, timeoutMs);
        })
    ]);
}
/**
 * Weather service fallback data
 */
const getWeatherFallbackData = (lat, lon) => {
    return {
        location: { latitude: lat, longitude: lon },
        current: {
            temperature: 25,
            humidity: 60,
            pressure: 1013,
            windSpeed: 10,
            windDirection: 180,
            description: 'Data temporarily unavailable',
            icon: 'unknown',
            visibility: 10,
            feelsLike: 25
        },
        forecast: Array.from({ length: 3 }, (_, i) => ({
            date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
            weather: {
                temperature: 25,
                humidity: 65,
                pressure: 1013,
                windSpeed: 8,
                windDirection: 180,
                description: 'Forecast temporarily unavailable',
                icon: 'unknown',
                visibility: 10,
                feelsLike: 25
            },
            precipitation: {
                probability: 0,
                amount: 0
            },
            minTemp: 20,
            maxTemp: 30
        })),
        farmingRecommendations: [
            'Weather data is temporarily unavailable',
            'Please check local weather conditions',
            'Consult local agricultural experts for current advice'
        ],
        isFallback: true,
        timestamp: new Date().toISOString()
    };
};
exports.getWeatherFallbackData = getWeatherFallbackData;
/**
 * Crop analysis fallback data
 */
const getCropAnalysisFallbackData = () => {
    return {
        healthStatus: 'unknown',
        confidence: 0,
        detectedIssues: ['Analysis service temporarily unavailable'],
        recommendations: [
            'AI analysis is temporarily unavailable',
            'Please consult with local agricultural experts',
            'Check for visible signs of disease or pest damage',
            'Ensure proper watering and fertilization'
        ],
        isFallback: true,
        timestamp: new Date().toISOString()
    };
};
exports.getCropAnalysisFallbackData = getCropAnalysisFallbackData;
/**
 * Chatbot fallback responses
 */
const getChatbotFallbackResponse = (language = 'en') => {
    const responses = {
        en: [
            'I apologize, but I\'m temporarily unable to process your query. Please try again later.',
            'Our AI service is currently unavailable. For immediate assistance, please consult local agricultural experts.',
            'I\'m experiencing technical difficulties. In the meantime, consider checking with your local agricultural extension office.'
        ],
        hi: [
            'मुझे खुशी है कि आपने पूछा, लेकिन अभी मैं आपकी क्वेरी को प्रोसेस नहीं कर सकता। कृपया बाद में कोशिश करें।',
            'हमारी AI सेवा अभी उपलब्ध नहीं है। तत्काल सहायता के लिए, कृपया स्थानीय कृषि विशेषज्ञों से सलाह लें।'
        ]
    };
    const languageResponses = responses[language] || responses.en;
    const randomResponse = languageResponses[Math.floor(Math.random() * languageResponses.length)];
    return {
        response: randomResponse,
        language,
        relatedTopics: ['farming tips', 'crop care', 'agricultural practices'],
        confidence: 0,
        isFallback: true,
        timestamp: new Date().toISOString()
    };
};
exports.getChatbotFallbackResponse = getChatbotFallbackResponse;
/**
 * Image upload fallback handling
 */
const handleImageUploadFailure = (error) => {
    console.error('Image upload failed:', error);
    // Return a structured error response
    return {
        success: false,
        error: {
            code: 'IMAGE_UPLOAD_FAILED',
            message: 'Image upload service is temporarily unavailable',
            details: {
                suggestion: 'Please try uploading the image again later',
                fallbackAction: 'You can still use other app features'
            }
        },
        isFallback: true,
        timestamp: new Date().toISOString()
    };
};
exports.handleImageUploadFailure = handleImageUploadFailure;
/**
 * Database connection fallback
 */
const handleDatabaseFailure = (operation) => {
    return {
        success: false,
        error: {
            code: 'DATABASE_UNAVAILABLE',
            message: `Database is temporarily unavailable for ${operation}`,
            details: {
                suggestion: 'Please try again in a few moments',
                fallbackAction: 'Some features may be limited until connection is restored'
            }
        },
        isFallback: true,
        timestamp: new Date().toISOString()
    };
};
exports.handleDatabaseFailure = handleDatabaseFailure;
//# sourceMappingURL=gracefulDegradation.js.map