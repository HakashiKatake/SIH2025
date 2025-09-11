import { cloudinary } from './cloudinary';

export interface ImageTransformation {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb' | 'pad';
  quality?: 'auto' | number;
  format?: 'auto' | 'jpg' | 'png' | 'webp';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
}

export class ImageUrlGenerator {
  /**
   * Generate optimized image URL for mobile app
   */
  static getMobileOptimized(publicId: string): string {
    return cloudinary.url(publicId, {
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
  static getThumbnail(publicId: string, size: number = 150): string {
    return cloudinary.url(publicId, {
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
  static getCustomTransformation(
    publicId: string,
    transformation: ImageTransformation
  ): string {
    const cloudinaryTransformation: any = {
      quality: transformation.quality || 'auto',
      fetch_format: transformation.format || 'auto'
    };

    if (transformation.width) cloudinaryTransformation.width = transformation.width;
    if (transformation.height) cloudinaryTransformation.height = transformation.height;
    if (transformation.crop) cloudinaryTransformation.crop = transformation.crop;
    if (transformation.gravity) cloudinaryTransformation.gravity = transformation.gravity;

    return cloudinary.url(publicId, {
      transformation: cloudinaryTransformation,
      secure: true
    });
  }

  /**
   * Generate multiple sizes for responsive images
   */
  static getResponsiveSizes(publicId: string): Record<string, string> {
    return {
      thumbnail: this.getThumbnail(publicId, 150),
      small: cloudinary.url(publicId, {
        transformation: [
          { width: 400, height: 300, crop: 'fill' },
          { quality: 'auto', fetch_format: 'auto' }
        ],
        secure: true
      }),
      medium: cloudinary.url(publicId, {
        transformation: [
          { width: 800, height: 600, crop: 'fill' },
          { quality: 'auto', fetch_format: 'auto' }
        ],
        secure: true
      }),
      large: cloudinary.url(publicId, {
        transformation: [
          { width: 1200, height: 900, crop: 'fill' },
          { quality: 'auto', fetch_format: 'auto' }
        ],
        secure: true
      }),
      original: cloudinary.url(publicId, {
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
  static getSignedUrl(
    publicId: string,
    transformation?: ImageTransformation,
    expiresAt?: Date
  ): string {
    const options: any = {
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

    return cloudinary.url(publicId, options);
  }

  /**
   * Extract public ID from Cloudinary URL
   */
  static extractPublicId(cloudinaryUrl: string): string | null {
    try {
      const regex = /\/v\d+\/(.+)\.[a-zA-Z]+$/;
      const match = cloudinaryUrl.match(regex);
      return match ? match[1] : null;
    } catch (error) {
      console.error('Error extracting public ID:', error);
      return null;
    }
  }

  /**
   * Validate if URL is a Cloudinary URL
   */
  static isCloudinaryUrl(url: string): boolean {
    return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
  }
}