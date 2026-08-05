import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as CloudinaryClient } from 'cloudinary';

export const CLOUDINARY_CLIENT = 'CLOUDINARY_CLIENT';

/**
 * Configures and provides the Cloudinary SDK instance under the
 * CLOUDINARY_CLIENT token. Configuration is entirely driven by env vars —
 * nothing is hard-coded. CloudinaryService checks isConfigured() before use,
 * so it is safe for these vars to be empty in environments that don't use
 * Cloudinary (e.g. if S3 is used instead).
 */
export const CloudinaryProvider: Provider = {
  provide: CLOUDINARY_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    CloudinaryClient.config({
      cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });
    return CloudinaryClient;
  },
};
