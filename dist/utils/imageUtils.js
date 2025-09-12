"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageUrlGenerator = void 0;
const cloudinary_1 = require("./cloudinary");
class ImageUrlGenerator {
    /**
     * Generate optimized image URL for mobile app
     */
    static getMobileOptimized(publicId) {
        return cloudinary_1.cloudinary.url(publicId, {
            transformation: [
                { quality: 'auto', fetch_format: 'auto' },
                { width: 800, height: 600, crop: 'fill' }
            ],
            secure: true
        });
    }
    /**
     * Generate thumbnail URL
     */
    static getThumbnail(publicId, size = 150) {
        return cloudinary_1.cloudinary.url(publicId, {
            transformation: [
                { width: size, height: size, crop: 'thumb', gravity: 'auto' },
                { quality: 'auto', fetch_format: 'auto' }
            ],
            secure: true
        });
    }
    /**
     * Generate custom transformation URL
     */
    static getCustomTransformation(publicId, transformation) {
        const cloudinaryTransformation = {
            quality: transformation.quality || 'auto',
            fetch_format: transformation.format || 'auto'
        };
        if (transformation.width)
            cloudinaryTransformation.width = transformation.width;
        if (transformation.height)
            cloudinaryTransformation.height = transformation.height;
        if (transformation.crop)
            cloudinaryTransformation.crop = transformation.crop;
        if (transformation.gravity)
            cloudinaryTransformation.gravity = transformation.gravity;
        return cloudinary_1.cloudinary.url(publicId, {
            transformation: cloudinaryTransformation,
            secure: true
        });
    }
    /**
     * Generate multiple sizes for responsive images
     */
    static getResponsiveSizes(publicId) {
        return {
            thumbnail: this.getThumbnail(publicId, 150),
            small: cloudinary_1.cloudinary.url(publicId, {
                transformation: [
                    { width: 400, height: 300, crop: 'fill' },
                    { quality: 'auto', fetch_format: 'auto' }
                ],
                secure: true
            }),
            medium: cloudinary_1.cloudinary.url(publicId, {
                transformation: [
                    { width: 800, height: 600, crop: 'fill' },
                    { quality: 'auto', fetch_format: 'auto' }
                ],
                secure: true
            }),
            large: cloudinary_1.cloudinary.url(publicId, {
                transformation: [
                    { width: 1200, height: 900, crop: 'fill' },
                    { quality: 'auto', fetch_format: 'auto' }
                ],
                secure: true
            }),
            original: cloudinary_1.cloudinary.url(publicId, {
                transformation: [
                    { quality: 'auto', fetch_format: 'auto' }
                ],
                secure: true
            })
        };
    }
    /**
     * Generate signed URL for secure access
     */
    static getSignedUrl(publicId, transformation, expiresAt) {
        const options = {
            secure: true,
            sign_url: true,
            type: 'authenticated'
        };
        if (expiresAt) {
            options.expires_at = Math.floor(expiresAt.getTime() / 1000);
        }
        if (transformation) {
            options.transformation = transformation;
        }
        return cloudinary_1.cloudinary.url(publicId, options);
    }
    /**
     * Extract public ID from Cloudinary URL
     */
    static extractPublicId(cloudinaryUrl) {
        try {
            const regex = /\/v\d+\/(.+)\.[a-zA-Z]+$/;
            const match = cloudinaryUrl.match(regex);
            return match ? match[1] : null;
        }
        catch (error) {
            console.error('Error extracting public ID:', error);
            return null;
        }
    }
    /**
     * Validate if URL is a Cloudinary URL
     */
    static isCloudinaryUrl(url) {
        return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
    }
}
exports.ImageUrlGenerator = ImageUrlGenerator;
//# sourceMappingURL=imageUtils.js.map