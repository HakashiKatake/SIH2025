import express, { Request, Response } from 'express';
import { CropAnalysis } from '../models/CropAnalysis';
import { MockAIAnalysisService } from '../services/cropAnalysisService';
import { authenticateToken } from '../middleware/auth';
import { uploadSingleImage, handleUploadError, validateImageUpload } from '../middleware/upload';
import { ImageService } from '../services/imageService';
import { createSuccessResponse, createErrorResponse } from '../utils/response';

const router = express.Router();

/**
 * POST /api/crops/analyze
 * Upload crop image and get AI analysis
 */
router.post('/analyze', 
  authenticateToken,
  uploadSingleImage,
  handleUploadError,
  validateImageUpload,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { cropType, location } = req.body;

      if (!req.file) {
        return res.status(400).json(
          createErrorResponse('IMAGE_REQUIRED', 'Image file is required for analysis')
        );
      }

      // Upload image to Cloudinary
      const uploadResult = await ImageService.uploadImage(req.file.buffer, {
        folder: 'crop-analysis',
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto' }
        ],
        tags: ['crop-analysis', 'user-upload'],
        context: { userId: userId || 'unknown' }
      });

      // Simulate AI processing delay
      await MockAIAnalysisService.simulateProcessingDelay();

      // Generate mock AI analysis
      const analysisResult = MockAIAnalysisService.generateMockAnalysis(
        uploadResult.secureUrl,
        cropType
      );

      // Save analysis to database
      const cropAnalysis = new CropAnalysis({
        userId,
        imageUrl: uploadResult.secureUrl,
        cloudinaryId: uploadResult.publicId,
        analysisResult,
        location,
        cropType
      });

      await cropAnalysis.save();

      // Return analysis result
      res.status(201).json(
        createSuccessResponse({
          id: cropAnalysis.id,
          imageUrl: cropAnalysis.imageUrl,
          analysisResult: cropAnalysis.analysisResult,
          cropType: cropAnalysis.cropType,
          location: cropAnalysis.location,
          createdAt: cropAnalysis.createdAt
        }, 'Crop analysis completed successfully')
      );

    } catch (error) {
      console.error('Crop analysis error:', error);
      res.status(500).json(
        createErrorResponse('ANALYSIS_FAILED', 'Failed to analyze crop image')
      );
    }
  }
);

/**
 * GET /api/crops/history
 * Get user's crop analysis history
 */
router.get('/history', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 10, healthStatus, cropType } = req.query;

    // Build query filters
    const query: any = { userId };
    
    if (healthStatus && typeof healthStatus === 'string') {
      query['analysisResult.healthStatus'] = healthStatus;
    }
    
    if (cropType && typeof cropType === 'string') {
      query.cropType = new RegExp(cropType, 'i'); // Case-insensitive search
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const totalCount = await CropAnalysis.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limitNum);

    // Fetch analysis history
    const analyses = await CropAnalysis.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-cloudinaryId -__v')
      .lean();

    // Format response
    const formattedAnalyses = analyses.map(analysis => ({
      id: analysis._id,
      imageUrl: analysis.imageUrl,
      analysisResult: analysis.analysisResult,
      cropType: analysis.cropType,
      location: analysis.location,
      createdAt: analysis.createdAt
    }));

    res.json(
      createSuccessResponse({
        analyses: formattedAnalyses,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }, 'Analysis history retrieved successfully')
    );

  } catch (error) {
    console.error('Get analysis history error:', error);
    res.status(500).json(
      createErrorResponse('HISTORY_FETCH_FAILED', 'Failed to retrieve analysis history')
    );
  }
});

/**
 * GET /api/crops/analysis/:id
 * Get specific analysis details
 */
router.get('/analysis/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const analysis = await CropAnalysis.findOne({ 
      _id: id, 
      userId 
    }).select('-cloudinaryId -__v').lean();

    if (!analysis) {
      return res.status(404).json(
        createErrorResponse('ANALYSIS_NOT_FOUND', 'Analysis not found')
      );
    }

    res.json(
      createSuccessResponse({
        id: analysis._id,
        imageUrl: analysis.imageUrl,
        analysisResult: analysis.analysisResult,
        cropType: analysis.cropType,
        location: analysis.location,
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt
      }, 'Analysis details retrieved successfully')
    );

  } catch (error) {
    console.error('Get analysis details error:', error);
    res.status(500).json(
      createErrorResponse('ANALYSIS_FETCH_FAILED', 'Failed to retrieve analysis details')
    );
  }
});

/**
 * GET /api/crops/recommendations/:analysisId
 * Get detailed recommendations for a specific analysis
 */
router.get('/recommendations/:analysisId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { analysisId } = req.params;

    const analysis = await CropAnalysis.findOne({ 
      _id: analysisId, 
      userId 
    }).lean();

    if (!analysis) {
      return res.status(404).json(
        createErrorResponse('ANALYSIS_NOT_FOUND', 'Analysis not found')
      );
    }

    // Generate structured recommendations based on analysis
    const structuredRecommendations = generateStructuredRecommendations(
      analysis.analysisResult,
      analysis.cropType
    );

    res.json(
      createSuccessResponse({
        analysisId: analysis._id,
        healthStatus: analysis.analysisResult.healthStatus,
        confidence: analysis.analysisResult.confidence,
        recommendations: structuredRecommendations,
        detectedIssues: analysis.analysisResult.detectedIssues,
        cropType: analysis.cropType,
        generatedAt: new Date().toISOString()
      }, 'Detailed recommendations retrieved successfully')
    );

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json(
      createErrorResponse('RECOMMENDATIONS_FETCH_FAILED', 'Failed to retrieve recommendations')
    );
  }
});

/**
 * Generate structured recommendations based on analysis result
 */
function generateStructuredRecommendations(
  analysisResult: any,
  cropType?: string
) {
  const { healthStatus, detectedIssues } = analysisResult;
  
  const recommendations = {
    immediate: [] as Array<{step: number, action: string, priority: 'high' | 'medium' | 'low'}>,
    shortTerm: [] as Array<{step: number, action: string, timeframe: string}>,
    longTerm: [] as Array<{step: number, action: string, timeframe: string}>,
    prevention: [] as Array<{step: number, action: string, frequency: string}>
  };

  // Generate recommendations based on health status
  switch (healthStatus) {
    case 'diseased':
      recommendations.immediate = [
        { step: 1, action: 'Isolate affected plants to prevent spread', priority: 'high' },
        { step: 2, action: 'Remove and dispose of infected plant parts', priority: 'high' },
        { step: 3, action: 'Apply appropriate fungicide treatment', priority: 'medium' }
      ];
      recommendations.shortTerm = [
        { step: 1, action: 'Monitor daily for disease progression', timeframe: '1-2 weeks' },
        { step: 2, action: 'Improve air circulation around plants', timeframe: '1 week' }
      ];
      recommendations.longTerm = [
        { step: 1, action: 'Consider disease-resistant varieties for next season', timeframe: 'Next planting season' }
      ];
      break;

    case 'pest_attack':
      recommendations.immediate = [
        { step: 1, action: 'Apply organic neem oil spray', priority: 'high' },
        { step: 2, action: 'Remove heavily infested plant parts', priority: 'medium' },
        { step: 3, action: 'Check neighboring plants for infestation', priority: 'medium' }
      ];
      recommendations.shortTerm = [
        { step: 1, action: 'Monitor pest population daily', timeframe: '1-2 weeks' },
        { step: 2, action: 'Consider introducing beneficial insects', timeframe: '2-3 weeks' }
      ];
      break;

    case 'nutrient_deficiency':
      recommendations.immediate = [
        { step: 1, action: 'Apply balanced fertilizer as recommended', priority: 'high' },
        { step: 2, action: 'Test soil pH levels', priority: 'medium' }
      ];
      recommendations.shortTerm = [
        { step: 1, action: 'Monitor plant response to fertilization', timeframe: '2-3 weeks' },
        { step: 2, action: 'Adjust soil pH if needed', timeframe: '1-2 weeks' }
      ];
      recommendations.longTerm = [
        { step: 1, action: 'Implement regular soil testing schedule', timeframe: 'Every 3-6 months' }
      ];
      break;

    case 'healthy':
      recommendations.immediate = [
        { step: 1, action: 'Continue current care routine', priority: 'low' }
      ];
      recommendations.shortTerm = [
        { step: 1, action: 'Monitor for any changes', timeframe: '1 week' }
      ];
      break;
  }

  // Add general prevention recommendations
  recommendations.prevention = [
    { step: 1, action: 'Regular inspection of plants', frequency: 'Daily' },
    { step: 2, action: 'Maintain proper watering schedule', frequency: 'As needed' },
    { step: 3, action: 'Keep growing area clean', frequency: 'Weekly' }
  ];

  // Add crop-specific recommendations if crop type is available
  if (cropType) {
    recommendations.longTerm.push({
      step: recommendations.longTerm.length + 1,
      action: `Research best practices specific to ${cropType} cultivation`,
      timeframe: 'Ongoing'
    });
  }

  return recommendations;
}

export default router;