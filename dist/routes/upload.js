"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = require("../middleware/upload");
const imageService_1 = require("../services/imageService");
const imageUtils_1 = require("../utils/imageUtils");
const auth_1 = require("../middleware/auth");
const response_1 = require("../utils/response");
const errors_1 = require("../utils/errors");
const router = (0, express_1.Router)();
// Apply authentication to all upload routes
router.use(auth_1.authenticateToken);
/**
 * Upload crop image for analysis
 * POST /api/upload/crop-image
 */
router.post('/crop-image', upload_1.uploadSingleImage, upload_1.handleUploadError, upload_1.validateImageUpload, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const file = req.file;
        // Upload to Cloudinary with metadata
        const uploadResult = await imageService_1.ImageService.uploadImage(file.buffer, {
            folder: 'farmer-app/crops',
            tags: ['crop-analysis', `user-${userId}`],
            context: {
                user_id: userId,
                original_name: file.originalname,
                upload_type: 'crop_analysis'
            }
        });
        // Generate different URL sizes for the mobile app
        const imageUrls = imageUtils_1.ImageUrlGenerator.getResponsiveSizes(uploadResult.publicId);
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
        return (0, response_1.sendSuccess)(res, response.data, 201);
    }
    catch (error) {
        next(error);
    }
});
/**
 * Upload product image for marketplace
 * POST /api/upload/product-image
 */
router.post('/product-image', upload_1.uploadSingleImage, upload_1.handleUploadError, upload_1.validateImageUpload, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const file = req.file;
        // Upload to Cloudinary with metadata
        const uploadResult = await imageService_1.ImageService.uploadImage(file.buffer, {
            folder: 'farmer-app/marketplace/products',
            tags: ['marketplace', 'product', `user-${userId}`],
            context: {
                user_id: userId,
                original_name: file.originalname,
                upload_type: 'product_image'
            }
        });
        // Generate different URL sizes for the mobile app
        const imageUrls = imageUtils_1.ImageUrlGenerator.getResponsiveSizes(uploadResult.publicId);
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
        return (0, response_1.sendSuccess)(res, response.data, 201);
    }
    catch (error) {
        next(error);
    }
});
/**
 * Get image details and URLs
 * GET /api/upload/image/:publicId
 */
router.get('/image/:publicId', async (req, res, next) => {
    try {
        const { publicId } = req.params;
        // Decode the public ID (it might be URL encoded)
        const decodedPublicId = decodeURIComponent(publicId);
        // Get image details from Cloudinary
        const imageDetails = await imageService_1.ImageService.getImageDetails(decodedPublicId);
        // Generate responsive URLs
        const urls = imageUtils_1.ImageUrlGenerator.getResponsiveSizes(decodedPublicId);
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
        return (0, response_1.sendSuccess)(res, response);
    }
    catch (error) {
        next(error);
    }
});
/**
 * Delete uploaded image
 * DELETE /api/upload/image/:publicId
 */
router.delete('/image/:publicId', async (req, res, next) => {
    try {
        const { publicId } = req.params;
        const userId = req.user?.id;
        // Decode the public ID
        const decodedPublicId = decodeURIComponent(publicId);
        // Get image details first to verify ownership
        const imageDetails = await imageService_1.ImageService.getImageDetails(decodedPublicId);
        // Check if user owns this image (basic security check)
        if (imageDetails.context?.user_id !== userId) {
            throw new errors_1.DatabaseError('Unauthorized to delete this image', 403, 'UNAUTHORIZED');
        }
        // Delete from Cloudinary
        const deleted = await imageService_1.ImageService.deleteImage(decodedPublicId);
        if (!deleted) {
            throw new errors_1.DatabaseError('Failed to delete image', 500, 'DELETE_FAILED');
        }
        return (0, response_1.sendSuccess)(res, null);
    }
    catch (error) {
        next(error);
    }
});
/**
 * Generate custom transformation URL
 * POST /api/upload/transform/:publicId
 */
router.post('/transform/:publicId', async (req, res, next) => {
    try {
        const { publicId } = req.params;
        const { width, height, crop, quality, format } = req.body;
        const decodedPublicId = decodeURIComponent(publicId);
        // Generate custom transformation URL
        const transformedUrl = imageUtils_1.ImageUrlGenerator.getCustomTransformation(decodedPublicId, {
            width,
            height,
            crop,
            quality,
            format
        });
        return (0, response_1.sendSuccess)(res, { transformedUrl });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=upload.js.map