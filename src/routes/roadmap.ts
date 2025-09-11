import express, { Request, Response } from 'express';
import { 
  RoadmapService, 
  RoadmapGenerationRequest, 
  ProgressUpdate 
} from '../services/roadmapService';
import { authenticateToken } from '../middleware/auth';
import { validateRequest, ValidationResult, ValidationError } from '../utils/validation';

const router = express.Router();

// Validation functions
const validateRoadmapGeneration = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];

  // Crop type validation
  if (!data.cropType || typeof data.cropType !== 'string') {
    errors.push({ field: 'cropType', message: 'Crop type is required and must be a string' });
  } else if (data.cropType.trim().length < 2 || data.cropType.trim().length > 50) {
    errors.push({ field: 'cropType', message: 'Crop type must be between 2 and 50 characters' });
  }

  // Variety validation (optional)
  if (data.variety && (typeof data.variety !== 'string' || data.variety.trim().length > 50)) {
    errors.push({ field: 'variety', message: 'Variety cannot exceed 50 characters' });
  }

  // Location validation
  if (!data.location || typeof data.location !== 'object') {
    errors.push({ field: 'location', message: 'Location is required and must be an object' });
  } else {
    const { latitude, longitude, address, state, district } = data.location;

    if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
      errors.push({ field: 'location.latitude', message: 'Latitude must be between -90 and 90' });
    }

    if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
      errors.push({ field: 'location.longitude', message: 'Longitude must be between -180 and 180' });
    }

    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      errors.push({ field: 'location.address', message: 'Address is required' });
    } else if (address.trim().length > 200) {
      errors.push({ field: 'location.address', message: 'Address cannot exceed 200 characters' });
    }

    if (!state || typeof state !== 'string' || state.trim().length === 0) {
      errors.push({ field: 'location.state', message: 'State is required' });
    } else if (state.trim().length > 50) {
      errors.push({ field: 'location.state', message: 'State cannot exceed 50 characters' });
    }

    if (!district || typeof district !== 'string' || district.trim().length === 0) {
      errors.push({ field: 'location.district', message: 'District is required' });
    } else if (district.trim().length > 50) {
      errors.push({ field: 'location.district', message: 'District cannot exceed 50 characters' });
    }
  }

  // Farm size validation (optional)
  if (data.farmSize !== undefined) {
    if (typeof data.farmSize !== 'number' || data.farmSize < 0.1 || data.farmSize > 10000) {
      errors.push({ field: 'farmSize', message: 'Farm size must be between 0.1 and 10000 acres' });
    }
  }

  // Sowing date validation
  if (!data.sowingDate) {
    errors.push({ field: 'sowingDate', message: 'Sowing date is required' });
  } else {
    const sowingDate = new Date(data.sowingDate);
    if (isNaN(sowingDate.getTime())) {
      errors.push({ field: 'sowingDate', message: 'Invalid sowing date format' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateProgressUpdate = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];

  // Status validation
  const validStatuses = ['pending', 'in_progress', 'completed', 'skipped'];
  if (!data.status || !validStatuses.includes(data.status)) {
    errors.push({ field: 'status', message: 'Status must be one of: pending, in_progress, completed, skipped' });
  }

  // Completed date validation (optional)
  if (data.completedDate) {
    const completedDate = new Date(data.completedDate);
    if (isNaN(completedDate.getTime())) {
      errors.push({ field: 'completedDate', message: 'Invalid completed date format' });
    }
  }

  // Notes validation (optional)
  if (data.notes && (typeof data.notes !== 'string' || data.notes.trim().length > 1000)) {
    errors.push({ field: 'notes', message: 'Notes cannot exceed 1000 characters' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateRoadmapId = (id: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!id || typeof id !== 'string') {
    errors.push({ field: 'id', message: 'Roadmap ID is required' });
  } else if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    errors.push({ field: 'id', message: 'Invalid roadmap ID format' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateMilestoneId = (id: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!id || typeof id !== 'string') {
    errors.push({ field: 'milestoneId', message: 'Milestone ID is required' });
  } else if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    errors.push({ field: 'milestoneId', message: 'Invalid milestone ID format' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * POST /api/roadmap/generate
 * Generate a new farming roadmap
 */
router.post('/generate', 
  authenticateToken, 
  validateRequest(validateRoadmapGeneration), 
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found in request'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }

      const roadmapData: RoadmapGenerationRequest = {
        ...req.body,
        sowingDate: new Date(req.body.sowingDate)
      };
      const userId = (req.user._id as any).toString();

      const roadmap = await RoadmapService.generateRoadmap(roadmapData, userId);

      res.status(201).json({
        success: true,
        data: {
          roadmap
        },
        message: 'Farming roadmap generated successfully'
      });

    } catch (error) {
      console.error('Roadmap generation error:', error);
      
      if (error instanceof Error && error.message === 'User not found or inactive') {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found or inactive'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'ROADMAP_GENERATION_FAILED',
          message: 'Failed to generate farming roadmap'
        },
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }
);

/**
 * GET /api/roadmap
 * Get user's active roadmaps
 */
router.get('/', 
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found in request'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }

      const userId = (req.user._id as any).toString();
      const roadmaps = await RoadmapService.getUserRoadmaps(userId);

      res.json({
        success: true,
        data: {
          roadmaps,
          count: roadmaps.length
        },
        message: 'User roadmaps retrieved successfully'
      });

    } catch (error) {
      console.error('User roadmaps error:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'ROADMAPS_RETRIEVAL_FAILED',
          message: 'Failed to retrieve user roadmaps'
        },
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }
);

/**
 * GET /api/roadmap/:id
 * Get roadmap details by ID
 */
router.get('/:id', 
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found in request'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }

      const roadmapId = req.params.id;
      
      // Validate roadmap ID
      const idValidation = validateRoadmapId(roadmapId);
      if (!idValidation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ROADMAP_ID',
            message: 'Invalid roadmap ID format',
            details: idValidation.errors
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }
      
      const userId = (req.user._id as any).toString();
      const roadmap = await RoadmapService.getRoadmapById(roadmapId, userId);

      if (!roadmap) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ROADMAP_NOT_FOUND',
            message: 'Roadmap not found'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }

      res.json({
        success: true,
        data: {
          roadmap
        },
        message: 'Roadmap details retrieved successfully'
      });

    } catch (error) {
      console.error('Roadmap details error:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'ROADMAP_DETAILS_FAILED',
          message: 'Failed to retrieve roadmap details'
        },
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }
);

/**
 * PUT /api/roadmap/:id/milestones/:milestoneId/progress
 * Update milestone progress
 */
router.put('/:id/milestones/:milestoneId/progress', 
  authenticateToken,
  validateRequest(validateProgressUpdate), 
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found in request'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }

      const roadmapId = req.params.id;
      const milestoneId = req.params.milestoneId;
      
      // Validate IDs
      const roadmapIdValidation = validateRoadmapId(roadmapId);
      if (!roadmapIdValidation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ROADMAP_ID',
            message: 'Invalid roadmap ID format',
            details: roadmapIdValidation.errors
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }

      const milestoneIdValidation = validateMilestoneId(milestoneId);
      if (!milestoneIdValidation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_MILESTONE_ID',
            message: 'Invalid milestone ID format',
            details: milestoneIdValidation.errors
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }
      
      const progressUpdate: ProgressUpdate = {
        milestoneId,
        status: req.body.status,
        completedDate: req.body.completedDate ? new Date(req.body.completedDate) : undefined,
        notes: req.body.notes
      };
      const userId = (req.user._id as any).toString();

      const roadmap = await RoadmapService.updateMilestoneProgress(
        roadmapId, 
        milestoneId, 
        progressUpdate, 
        userId
      );

      if (!roadmap) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ROADMAP_OR_MILESTONE_NOT_FOUND',
            message: 'Roadmap or milestone not found, or you do not have permission to update it'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }

      res.json({
        success: true,
        data: {
          roadmap
        },
        message: 'Milestone progress updated successfully'
      });

    } catch (error) {
      console.error('Milestone progress update error:', error);
      
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: error.message
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'MILESTONE_UPDATE_FAILED',
          message: 'Failed to update milestone progress'
        },
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }
);

/**
 * GET /api/roadmap/milestones/upcoming
 * Get upcoming milestones for the user
 */
router.get('/milestones/upcoming', 
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found in request'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }

      const userId = (req.user._id as any).toString();
      const days = req.query.days ? parseInt(req.query.days as string) : 7;

      if (isNaN(days) || days < 1 || days > 365) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DAYS_PARAMETER',
            message: 'Days parameter must be between 1 and 365'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }

      const upcomingMilestones = await RoadmapService.getUpcomingMilestones(userId, days);

      res.json({
        success: true,
        data: {
          upcomingMilestones,
          days,
          count: upcomingMilestones.reduce((total, item) => total + item.milestones.length, 0)
        },
        message: 'Upcoming milestones retrieved successfully'
      });

    } catch (error) {
      console.error('Upcoming milestones error:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'UPCOMING_MILESTONES_FAILED',
          message: 'Failed to retrieve upcoming milestones'
        },
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }
);

/**
 * GET /api/roadmap/milestones/overdue
 * Get overdue milestones for the user
 */
router.get('/milestones/overdue', 
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found in request'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }

      const userId = (req.user._id as any).toString();
      const overdueMilestones = await RoadmapService.getOverdueMilestones(userId);

      res.json({
        success: true,
        data: {
          overdueMilestones,
          count: overdueMilestones.reduce((total, item) => total + item.milestones.length, 0)
        },
        message: 'Overdue milestones retrieved successfully'
      });

    } catch (error) {
      console.error('Overdue milestones error:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'OVERDUE_MILESTONES_FAILED',
          message: 'Failed to retrieve overdue milestones'
        },
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }
);

/**
 * GET /api/roadmap/recommendations/mrl
 * Get MRL-based recommendations
 */
router.get('/recommendations/mrl', 
  async (req: Request, res: Response): Promise<void> => {
    try {
      const state = req.query.state as string;
      const district = req.query.district as string;
      const cropType = req.query.cropType as string;

      if (!state) {
        res.status(400).json({
          success: false,
          error: {
            code: 'STATE_REQUIRED',
            message: 'State parameter is required'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }

      const location = { state, district };
      const recommendations = await RoadmapService.getMRLRecommendations(location, cropType);

      res.json({
        success: true,
        data: {
          recommendations,
          location,
          cropType: cropType || 'all',
          count: recommendations.length
        },
        message: 'MRL recommendations retrieved successfully'
      });

    } catch (error) {
      console.error('MRL recommendations error:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'MRL_RECOMMENDATIONS_FAILED',
          message: 'Failed to retrieve MRL recommendations'
        },
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }
);

/**
 * PUT /api/roadmap/:id/settings
 * Update roadmap settings
 */
router.put('/:id/settings', 
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found in request'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }

      const roadmapId = req.params.id;
      
      // Validate roadmap ID
      const idValidation = validateRoadmapId(roadmapId);
      if (!idValidation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ROADMAP_ID',
            message: 'Invalid roadmap ID format',
            details: idValidation.errors
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }
      
      const settings = {
        weatherAlerts: req.body.weatherAlerts,
        isActive: req.body.isActive
      };
      const userId = (req.user._id as any).toString();

      const roadmap = await RoadmapService.updateRoadmapSettings(roadmapId, settings, userId);

      if (!roadmap) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ROADMAP_NOT_FOUND',
            message: 'Roadmap not found or you do not have permission to update it'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }

      res.json({
        success: true,
        data: {
          roadmap
        },
        message: 'Roadmap settings updated successfully'
      });

    } catch (error) {
      console.error('Roadmap settings update error:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'ROADMAP_SETTINGS_UPDATE_FAILED',
          message: 'Failed to update roadmap settings'
        },
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }
);

/**
 * DELETE /api/roadmap/:id
 * Delete roadmap (soft delete)
 */
router.delete('/:id', 
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found in request'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }

      const roadmapId = req.params.id;
      
      // Validate roadmap ID
      const idValidation = validateRoadmapId(roadmapId);
      if (!idValidation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ROADMAP_ID',
            message: 'Invalid roadmap ID format',
            details: idValidation.errors
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }
      
      const userId = (req.user._id as any).toString();
      const deleted = await RoadmapService.deleteRoadmap(roadmapId, userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ROADMAP_NOT_FOUND',
            message: 'Roadmap not found or you do not have permission to delete it'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }

      res.json({
        success: true,
        data: null,
        message: 'Roadmap deleted successfully'
      });

    } catch (error) {
      console.error('Roadmap deletion error:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'ROADMAP_DELETION_FAILED',
          message: 'Failed to delete roadmap'
        },
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }
);

/**
 * GET /api/roadmap/statistics
 * Get roadmap statistics for the user
 */
router.get('/statistics', 
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found in request'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }

      const userId = (req.user._id as any).toString();
      const statistics = await RoadmapService.getRoadmapStatistics(userId);

      res.json({
        success: true,
        data: {
          statistics
        },
        message: 'Roadmap statistics retrieved successfully'
      });

    } catch (error) {
      console.error('Roadmap statistics error:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'ROADMAP_STATISTICS_FAILED',
          message: 'Failed to retrieve roadmap statistics'
        },
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  }
);

export default router;