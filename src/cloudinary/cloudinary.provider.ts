import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { configureCloudinary } from './cloudinary';
import { CLOUDINARY } from './constants';

export const CloudinaryProvider: Provider = {
  provide: 'Cloudinary',
  useFactory: (configService: ConfigService) => {
    const cloudinaryConfig = {
      CLOUD_NAME: configService.get<string>(CLOUDINARY.CLOUDINARY_NAME),
      API_KEY: configService.get<string>(CLOUDINARY.API_KEY),
      API_SECRET: configService.get<string>(CLOUDINARY.API_SECRET),
    };

    return configureCloudinary(cloudinaryConfig);
  },
  inject: [ConfigService],
};
