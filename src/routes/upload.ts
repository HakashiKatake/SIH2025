import { Router, Request, Response, NextFunction } from 'express';
import { uploadSingleImage, handleUploadError, validateImageUpload } from '../middleware/upload';
import { ImageService } from '../services/imageService';
import { ImageUrlGenerator } from '../utils/imageUtils';
import { authenticateToken } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { DatabaseError } from '../utils/errors';

const router = Router();

// Apply authentication to all upload routes
router.use(authenticateToken);

/**
 * Upload crop image for analysis
 * POST /api/upload/crop-image
 */
router.post('/crop-image', 
  uploadSingleImage,
  handleUploadError,
  validateImageUpload,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const file = req.file!;

      // Upload to Cloudinary with metadata
      const uploadResult = await ImageService.uploadImage(file.buffer, {
        folder: 'farmer-app/crops',
        tags: ['crop-analysis', `user-${userId}`],
        context: {
          user_id: userId,
          original_name: file.originalname,
          upload_type: 'crop_analysis'
        }
      });

      // Generate different URL sizes for the mobile app
      const imageUrls = ImageUrlGenerator.getResponsiveSizes(uploadResult.publicId);

      const response = {
        success: true,
        data: {
          imageId: uploadResult.publicId,
          originalUrl: uploadResult.secureUrl,
          urls: imageUrls,
          metadata: {
            width: uploadResult.width,
            height: uploadResult.height,
            format: uploadResult.format,
            size: uploadResult.bytes,
            uploadedAt: uploadResult.createdAt
          }
        }
      };

      return sendSuccess(res, response.data, 201);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Upload product image for marketplace
 * POST /api/upload/product-image
 */
router.post('/product-image', 
  uploadSingleImage,
  handleUploadError,
  validateImageUpload,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const file = req.file!;

      // Upload to Cloudinary with metadata
      const uploadResult = await ImageService.uploadImage(file.buffer, {
        folder: 'farmer-app/marketplace/products',
        tags: ['marketplace', 'product', `user-${userId}`],
        context: {
          user_id: userId,
          original_name: file.originalname,
          upload_type: 'product_image'
        }
      });

      // Generate different URL sizes for the mobile app
      const imageUrls = ImageUrlGenerator.getResponsiveSizes(uploadResult.publicId);

      const response = {
        success: true,
        data: {
          imageId: uploadResult.publicId,
          originalUrl: uploadResult.secureUrl,
          urls: imageUrls,
          metadata: {
            width: uploadResult.width,
            height: uploadResult.height,
            format: uploadResult.format,
            size: uploadResult.bytes,
            uploadedAt: uploadResult.createdAt
          }
        }
      };

      return sendSuccess(res, response.data, 201);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get image details and URLs
 * GET /api/upload/image/:publicId
 */
router.get('/image/:publicId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { publicId } = req.params;
    
    // Decode the public ID (it might be URL encoded)
    const decodedPublicId = decodeURIComponent(publicId);
    
    // Get image details from Cloudinary
    const imageDetails = await ImageService.getImageDetails(decodedPublicId);
    
    // Generate responsive URLs
    const urls = ImageUrlGenerator.getResponsiveSizes(decodedPublicId);
    
    const response = {
      imageId: imageDetails.publicId,
      urls,
      metadata: {
        width: imageDetails.width,
        height: imageDetails.height,
        format: imageDetails.format,
        size: imageDetails.bytes,
        uploadedAt: imageDetails.createdAt,
        tags: imageDetails.tags,
        context: imageDetails.context
      }
    };

    return sendSuccess(res, response);
  } catch (error) {
    next(error);
  }
});

/**
 * Delete uploaded image
 * DELETE /api/upload/image/:publicId
 */
router.delete('/image/:publicId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { publicId } = req.params;
    const userId = req.user?.id;
    
    // Decode the public ID
    const decodedPublicId = decodeURIComponent(publicId);
    
    // Get image details first to verify ownership
    const imageDetails = await ImageService.getImageDetails(decodedPublicId);
    
    // Check if user owns this image (basic security check)
    if (imageDetails.context?.user_id !== userId) {
      throw new DatabaseError('Unauthorized to delete this image', 403, 'UNAUTHORIZED');
    }
    
    // Delete from Cloudinary
    const deleted = await ImageService.deleteImage(decodedPublicId);
    
    if (!deleted) {
      throw new DatabaseError('Failed to delete image', 500, 'DELETE_FAILED');
    }

    return sendSuccess(res, null);
  } catch (error) {
    next(error);
  }
});

/**
 * Generate custom transformation URL
 * POST /api/upload/transform/:publicId
 */
router.post('/transform/:publicId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { publicId } = req.params;
    const { width, height, crop, quality, format } = req.body;
    
    const decodedPublicId = decodeURIComponent(publicId);
    
    // Generate custom transformation URL
    const transformedUrl = ImageUrlGenerator.getCustomTransformation(decodedPublicId, {
      width,
      height,
      crop,
      quality,
      format
    });

    return sendSuccess(res, { transformedUrl });
  } catch (error) {
    next(error);
  }
});

export default router;