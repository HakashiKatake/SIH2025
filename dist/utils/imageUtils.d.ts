export interface ImageTransformation {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb' | 'pad';
    quality?: 'auto' | number;
    format?: 'auto' | 'jpg' | 'png' | 'webp';
    gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
}
export declare class ImageUrlGenerator {
    /**
     * Generate optimized image URL for mobile app
     */
    static getMobileOptimized(publicId: string): string;
    /**
     * Generate thumbnail URL
     */
    static getThumbnail(publicId: string, size?: number): string;
    /**
     * Generate custom transformation URL
     */
    static getCustomTransformation(publicId: string, transformation: ImageTransformation): string;
    /**
     * Generate multiple sizes for responsive images
     */
    static getResponsiveSizes(publicId: string): Record<string, string>;
    /**
     * Generate signed URL for secure access
     */
    static getSignedUrl(publicId: string, transformation?: ImageTransformation, expiresAt?: Date): string;
    /**
     * Extract public ID from Cloudinary URL
     */
    static extractPublicId(cloudinaryUrl: string): string | null;
    /**
     * Validate if URL is a Cloudinary URL
     */
    static isCloudinaryUrl(url: string): boolean;
}
//# sourceMappingURL=imageUtils.d.ts.map