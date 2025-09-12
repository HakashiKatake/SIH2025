/**
 * Circuit breaker state
 */
interface CircuitBreakerState {
    failures: number;
    lastFailureTime: number;
    state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}
/**
 * Simple circuit breaker implementation
 */
export declare class CircuitBreaker {
    private state;
    private readonly failureThreshold;
    private readonly recoveryTimeout;
    constructor(failureThreshold?: number, recoveryTimeout?: number);
    execute<T>(operation: () => Promise<T>, fallback?: () => Promise<T>): Promise<T>;
    private onSuccess;
    private onFailure;
    getState(): CircuitBreakerState;
}
/**
 * Retry mechanism with exponential backoff
 */
export declare function retryWithBackoff<T>(operation: () => Promise<T>, maxRetries?: number, baseDelay?: number, maxDelay?: number): Promise<T>;
/**
 * Timeout wrapper for operations
 */
export declare function withTimeout<T>(operation: () => Promise<T>, timeoutMs: number, timeoutMessage?: string): Promise<T>;
/**
 * Weather service fallback data
 */
export declare const getWeatherFallbackData: (lat: number, lon: number) => {
    location: {
        latitude: number;
        longitude: number;
    };
    current: {
        temperature: number;
        humidity: number;
        pressure: number;
        windSpeed: number;
        windDirection: number;
        description: string;
        icon: string;
        visibility: number;
        feelsLike: number;
    };
    forecast: {
        date: Date;
        weather: {
            temperature: number;
            humidity: number;
            pressure: number;
            windSpeed: number;
            windDirection: number;
            description: string;
            icon: string;
            visibility: number;
            feelsLike: number;
        };
        precipitation: {
            probability: number;
            amount: number;
        };
        minTemp: number;
        maxTemp: number;
    }[];
    farmingRecommendations: string[];
    isFallback: boolean;
    timestamp: string;
};
/**
 * Crop analysis fallback data
 */
export declare const getCropAnalysisFallbackData: () => {
    healthStatus: "unknown";
    confidence: number;
    detectedIssues: string[];
    recommendations: string[];
    isFallback: boolean;
    timestamp: string;
};
/**
 * Chatbot fallback responses
 */
export declare const getChatbotFallbackResponse: (language?: string) => {
    response: string;
    language: string;
    relatedTopics: string[];
    confidence: number;
    isFallback: boolean;
    timestamp: string;
};
/**
 * Image upload fallback handling
 */
export declare const handleImageUploadFailure: (error: any) => {
    success: boolean;
    error: {
        code: string;
        message: string;
        details: {
            suggestion: string;
            fallbackAction: string;
        };
    };
    isFallback: boolean;
    timestamp: string;
};
/**
 * Database connection fallback
 */
export declare const handleDatabaseFailure: (operation: string) => {
    success: boolean;
    error: {
        code: string;
        message: string;
        details: {
            suggestion: string;
            fallbackAction: string;
        };
    };
    isFallback: boolean;
    timestamp: string;
};
export {};
//# sourceMappingURL=gracefulDegradation.d.ts.map