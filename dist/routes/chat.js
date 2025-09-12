"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatbotService_1 = require("../services/chatbotService");
const auth_1 = require("../middleware/auth");
const errors_1 = require("../utils/errors");
const response_1 = require("../utils/response");
const router = express_1.default.Router();
/**
 * @route POST /api/chat/query
 * @desc Process text query and get farming advice
 * @access Private
 */
router.post('/query', auth_1.authenticateToken, async (req, res) => {
    try {
        const { message, language = 'en' } = req.body;
        // Basic validation
        if (!message || typeof message !== 'string') {
            return (0, response_1.sendError)(res, 'VALIDATION_ERROR', 'Message is required', 400);
        }
        if (message.length < 1 || message.length > 1000) {
            return (0, response_1.sendError)(res, 'VALIDATION_ERROR', 'Message must be between 1 and 1000 characters', 400);
        }
        const supportedLanguages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'gu', 'mr', 'bn', 'pa'];
        if (language && !supportedLanguages.includes(language)) {
            return (0, response_1.sendError)(res, 'VALIDATION_ERROR', 'Invalid language code', 400);
        }
        const userId = req.userId;
        const response = await chatbotService_1.chatbotService.processTextQuery({
            message,
            userId,
            language,
            messageType: 'text'
        });
        return (0, response_1.sendSuccess)(res, response);
    }
    catch (error) {
        console.error('Chat query error:', error);
        if (error instanceof errors_1.DatabaseError) {
            return (0, response_1.sendError)(res, error.code, error.message, error.statusCode);
        }
        return (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to process chat query', 500);
    }
});
/**
 * @route POST /api/chat/voice
 * @desc Process voice query and get farming advice
 * @access Private
 */
router.post('/voice', auth_1.authenticateToken, async (req, res) => {
    try {
        const { message, language = 'en', audioUrl } = req.body;
        // Basic validation
        if (!message || typeof message !== 'string') {
            return (0, response_1.sendError)(res, 'VALIDATION_ERROR', 'Transcribed message is required', 400);
        }
        if (message.length < 1 || message.length > 1000) {
            return (0, response_1.sendError)(res, 'VALIDATION_ERROR', 'Message must be between 1 and 1000 characters', 400);
        }
        const supportedLanguages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'gu', 'mr', 'bn', 'pa'];
        if (language && !supportedLanguages.includes(language)) {
            return (0, response_1.sendError)(res, 'VALIDATION_ERROR', 'Invalid language code', 400);
        }
        const userId = req.userId;
        const response = await chatbotService_1.chatbotService.processVoiceQuery({
            message,
            userId,
            language,
            messageType: 'voice',
            audioUrl
        });
        return (0, response_1.sendSuccess)(res, response);
    }
    catch (error) {
        console.error('Voice query error:', error);
        if (error instanceof errors_1.DatabaseError) {
            return (0, response_1.sendError)(res, error.code, error.message, error.statusCode);
        }
        return (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to process voice query', 500);
    }
});
/**
 * @route GET /api/chat/history
 * @desc Get chat history for authenticated user
 * @access Private
 */
router.get('/history', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const chatHistory = await chatbotService_1.chatbotService.getChatHistory(userId, limit, page);
        return (0, response_1.sendSuccess)(res, {
            messages: chatHistory,
            pagination: {
                page,
                limit,
                total: chatHistory.length
            }
        });
    }
    catch (error) {
        console.error('Chat history error:', error);
        if (error instanceof errors_1.DatabaseError) {
            return (0, response_1.sendError)(res, error.code, error.message, error.statusCode);
        }
        return (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to retrieve chat history', 500);
    }
});
/**
 * @route GET /api/chat/languages
 * @desc Get supported languages
 * @access Public
 */
router.get('/languages', (req, res) => {
    try {
        const languages = chatbotService_1.chatbotService.getSupportedLanguages();
        const languageMap = {
            en: 'English',
            hi: 'Hindi',
            ta: 'Tamil',
            te: 'Telugu',
            kn: 'Kannada',
            ml: 'Malayalam',
            gu: 'Gujarati',
            mr: 'Marathi',
            bn: 'Bengali',
            pa: 'Punjabi'
        };
        const supportedLanguages = languages.map(code => ({
            code,
            name: languageMap[code] || code
        }));
        return (0, response_1.sendSuccess)(res, supportedLanguages);
    }
    catch (error) {
        console.error('Languages error:', error);
        return (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to retrieve supported languages', 500);
    }
});
exports.default = router;
//# sourceMappingURL=chat.js.map