import { v2 as cloudinary } from 'cloudinary';
import { config } from './config';

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true
});

export { cloudinary };

// Test connection function
export const testCloudinaryConnection = async (): Promise<boolean> => {
  try {
    const result = await cloudinary.api.ping();
    console.log('Cloudinary connection successful:', result);
    return true;
  } catch (error) {
    console.error('Cloudinary connection failed:', error);
    return false;
  }
};

// Generate secure upload URL
export const generateUploadUrl = (publicId?: string) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const params: any = {
    timestamp,
    folder: 'farmer-app/crops'
  };
  
  if (publicId) {
    params.public_id = publicId;
  }
  
  return cloudinary.utils.api_sign_request(params, config.cloudinary.apiSecret);
};