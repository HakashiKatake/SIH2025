import { IChatMessage } from "../models/ChatMessage";
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
declare class ChatbotService {
    private farmingAdviceDatabase;
    private relatedTopicsDatabase;
    /**
     * Process text query and generate farming advice
     */
    processTextQuery(query: ChatQuery): Promise<ChatResponse>;
    /**
     * Process voice query (mock implementation)
     */
    processVoiceQuery(query: ChatQuery): Promise<ChatResponse>;
    /**
     * Get chat history for a user
     */
    getChatHistory(userId: string, limit?: number, page?: number): Promise<IChatMessage[]>;
    /**
     * Generate mock farming advice response
     */
    private generateMockResponse;
    /**
     * Get supported languages
     */
    getSupportedLanguages(): string[];
}
export declare const chatbotService: ChatbotService;
export {};
//# sourceMappingURL=chatbotService.d.ts.map