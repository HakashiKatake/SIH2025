import express from 'express';
import { chatbotService } from '../services/chatbotService';
import { authenticateToken } from '../middleware/auth';
import { DatabaseError } from '../utils/errors';
import { sendSuccess, sendError } from '../utils/response';

const router = express.Router();

/**
 * @route POST /api/chat/query
 * @desc Process text query and get farming advice
 * @access Private
 */
router.post('/query',
  authenticateToken,
  async (req: express.Request, res: express.Response) => {
    try {
      const { message, language = 'en' } = req.body;
      
      // Basic validation
      if (!message || typeof message !== 'string') {
        return sendError(res, 'VALIDATION_ERROR', 'Message is required', 400);
      }
      
      if (message.length < 1 || message.length > 1000) {
        return sendError(res, 'VALIDATION_ERROR', 'Message must be between 1 and 1000 characters', 400);
      }
      
      const supportedLanguages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'gu', 'mr', 'bn', 'pa'];
      if (language && !supportedLanguages.includes(language)) {
        return sendError(res, 'VALIDATION_ERROR', 'Invalid language code', 400);
      }

      const userId = req.userId!;

      const response = await chatbotService.processTextQuery({
        message,
        userId,
        language,
        messageType: 'text'
      });

      return sendSuccess(res, response);
    } catch (error) {
      console.error('Chat query error:', error);
      if (error instanceof DatabaseError) {
        return sendError(res, error.code, error.message, error.statusCode);
      }
      return sendError(res, 'INTERNAL_ERROR', 'Failed to process chat query', 500);
    }
  }
);

/**
 * @route POST /api/chat/voice
 * @desc Process voice query and get farming advice
 * @access Private
 */
router.post('/voice',
  authenticateToken,
  async (req: express.Request, res: express.Response) => {
    try {
      const { message, language = 'en', audioUrl } = req.body;
      
      // Basic validation
      if (!message || typeof message !== 'string') {
        return sendError(res, 'VALIDATION_ERROR', 'Transcribed message is required', 400);
      }
      
      if (message.length < 1 || message.length > 1000) {
        return sendError(res, 'VALIDATION_ERROR', 'Message must be between 1 and 1000 characters', 400);
      }
      
      const supportedLanguages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'gu', 'mr', 'bn', 'pa'];
      if (language && !supportedLanguages.includes(language)) {
        return sendError(res, 'VALIDATION_ERROR', 'Invalid language code', 400);
      }

      const userId = req.userId!;

      const response = await chatbotService.processVoiceQuery({
        message,
        userId,
        language,
        messageType: 'voice',
        audioUrl
      });

      return sendSuccess(res, response);
    } catch (error) {
      console.error('Voice query error:', error);
      if (error instanceof DatabaseError) {
        return sendError(res, error.code, error.message, error.statusCode);
      }
      return sendError(res, 'INTERNAL_ERROR', 'Failed to process voice query', 500);
    }
  }
);

/**
 * @route GET /api/chat/history
 * @desc Get chat history for authenticated user
 * @access Private
 */
router.get('/history',
  authenticateToken,
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = req.userId!;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const page = Math.max(parseInt(req.query.page as string) || 1, 1);

      const chatHistory = await chatbotService.getChatHistory(userId, limit, page);

      return sendSuccess(res, {
        messages: chatHistory,
        pagination: {
          page,
          limit,
          total: chatHistory.length
        }
      });
    } catch (error) {
      console.error('Chat history error:', error);
      if (error instanceof DatabaseError) {
        return sendError(res, error.code, error.message, error.statusCode);
      }
      return sendError(res, 'INTERNAL_ERROR', 'Failed to retrieve chat history', 500);
    }
  }
);

/**
 * @route GET /api/chat/languages
 * @desc Get supported languages
 * @access Public
 */
router.get('/languages', (req: express.Request, res: express.Response) => {
  try {
    const languages = chatbotService.getSupportedLanguages();
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
      name: languageMap[code as keyof typeof languageMap] || code
    }));

    return sendSuccess(res, supportedLanguages);
  } catch (error) {
    console.error('Languages error:', error);
    return sendError(res, 'INTERNAL_ERROR', 'Failed to retrieve supported languages', 500);
  }
});

export default router;