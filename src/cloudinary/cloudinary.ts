// cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

export const configureCloudinary = (config) => {
  cloudinary.config({
    cloud_name: config.CLOUD_NAME,
    api_key: config.API_KEY,
    api_secret: config.API_SECRET,
  });
  return cloudinary;
};
