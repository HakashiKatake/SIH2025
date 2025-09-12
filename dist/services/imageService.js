"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageService = void 0;
const cloudinary_1 = require("../utils/cloudinary");
const errors_1 = require("../utils/errors");
class ImageService {
    /**
     * Upload image to Cloudinary with metadata
     */
    static async uploadImage(buffer, options = {}) {
        try {
            const { folder = 'farmer-app/crops', transformation, tags = [], context = {} } = options;
            // Create upload promise
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary_1.cloudinary.uploader.upload_stream({
                    folder,
                    resource_type: 'image',
                    transformation,
                    tags: [...tags, 'farmer-app'],
                    context: {
                        ...context,
                        uploaded_at: new Date().toISOString(),
                        app_version: '1.0.0'
                    },
                    // Generate unique filename
                    public_id: `crop_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                    // Optimize for web
                    quality: 'auto',
                    fetch_format: 'auto'
                }, (error, result) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                });
                uploadStream.end(buffer);
            });
            const result = uploadResult;
            return {
                publicId: result.public_id,
                secureUrl: result.secure_url,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
                createdAt: result.created_at
            };
        }
        catch (error) {
            console.error('Image upload error:', error);
            throw new errors_1.DatabaseError('Failed to upload image', 500, 'UPLOAD_FAILED');
        }
    }
    /**
     * Delete image from Cloudinary
     */
    static async deleteImage(publicId) {
        try {
            const result = await cloudinary_1.cloudinary.uploader.destroy(publicId);
            return result.result === 'ok';
        }
        catch (error) {
            console.error('Image deletion error:', error);
            throw new errors_1.DatabaseError('Failed to delete image', 500, 'DELETE_FAILED');
        }
    }
    /**
     * Get image details from Cloudinary
     */
    static async getImageDetails(publicId) {
        try {
            const result = await cloudinary_1.cloudinary.api.resource(publicId);
            return {
                publicId: result.public_id,
                secureUrl: result.secure_url,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
                createdAt: result.created_at,
                tags: result.tags,
                context: result.context
            };
        }
        catch (error) {
            console.error('Get image details error:', error);
            throw new errors_1.DatabaseError('Failed to get image details', 404, 'IMAGE_NOT_FOUND');
        }
    }
    /**
     * Generate transformation URL for different sizes
     */
    static generateTransformationUrl(publicId, transformation) {
        return cloudinary_1.cloudinary.url(publicId, {
            transformation,
            secure: true
        });
    }
}
exports.ImageService = ImageService;
//# sourceMappingURL=imageService.js.map