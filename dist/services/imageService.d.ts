export interface ImageUploadResult {
    publicId: string;
    secureUrl: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
    createdAt: string;
}
export interface ImageUploadOptions {
    folder?: string;
    transformation?: any;
    tags?: string[];
    context?: Record<string, string>;
}
export declare class ImageService {
    /**
     * Upload image to Cloudinary with metadata
     */
    static uploadImage(buffer: Buffer, options?: ImageUploadOptions): Promise<ImageUploadResult>;
    /**
     * Delete image from Cloudinary
     */
    static deleteImage(publicId: string): Promise<boolean>;
    /**
     * Get image details from Cloudinary
     */
    static getImageDetails(publicId: string): Promise<{
        publicId: any;
        secureUrl: any;
        width: any;
        height: any;
        format: any;
        bytes: any;
        createdAt: any;
        tags: any;
        context: any;
    }>;
    /**
     * Generate transformation URL for different sizes
     */
    static generateTransformationUrl(publicId: string, transformation: any): string;
}
//# sourceMappingURL=imageService.d.ts.map