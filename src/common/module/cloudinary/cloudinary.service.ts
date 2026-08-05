import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  UploadApiErrorResponse,
  UploadApiOptions,
  UploadApiResponse,
  v2 as CloudinaryClientType,
} from 'cloudinary';
import { Readable } from 'stream';
import { CLOUDINARY_CLIENT } from './cloudinary.provider';

export interface CloudinaryUploadOptions {
  buffer: Buffer;
  folder?: string;
  /** Cloudinary public_id (without folder prefix). Random if omitted. */
  publicId?: string;
  /** Overwrite an existing asset that has the same public_id. */
  overwrite?: boolean;
}

export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  /** Ready-to-use auto-optimized delivery URL (f_auto,q_auto). */
  optimizedUrl: string;
}

/**
 * Reusable Cloudinary integration: upload, update (re-upload to the same
 * public_id), delete, and automatic image optimization.
 *
 * All behaviour is driven by env vars (CLOUDINARY_CLOUD_NAME,
 * CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_UPLOAD_FOLDER).
 * If those are not set, isConfigured() returns false and callers get a
 * clear 400 instead of an opaque SDK failure.
 */
@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly defaultFolder: string;

  constructor(
    @Inject(CLOUDINARY_CLIENT)
    private readonly cloudinary: typeof CloudinaryClientType,
    private readonly configService: ConfigService,
  ) {
    this.defaultFolder = this.configService.get<string>(
      'CLOUDINARY_UPLOAD_FOLDER',
      'ecommerce',
    );
  }

  isConfigured(): boolean {
    return Boolean(
      this.configService.get<string>('CLOUDINARY_CLOUD_NAME') &&
        this.configService.get<string>('CLOUDINARY_API_KEY') &&
        this.configService.get<string>('CLOUDINARY_API_SECRET'),
    );
  }

  private assertConfigured(): void {
    if (!this.isConfigured()) {
      throw new BadRequestException(
        'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, ' +
          'CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.',
      );
    }
  }

  private toResult(res: UploadApiResponse): CloudinaryUploadResult {
    return {
      publicId: res.public_id,
      url: res.url,
      secureUrl: res.secure_url,
      format: res.format,
      width: res.width,
      height: res.height,
      bytes: res.bytes,
      optimizedUrl: this.getOptimizedUrl(res.public_id),
    };
  }

  /** Upload a new image. Organizes assets under `folder` (default: env CLOUDINARY_UPLOAD_FOLDER). */
  async uploadImage({
    buffer,
    folder,
    publicId,
    overwrite = false,
  }: CloudinaryUploadOptions): Promise<CloudinaryUploadResult> {
    this.assertConfigured();

    const options: UploadApiOptions = {
      folder: folder ?? this.defaultFolder,
      public_id: publicId,
      overwrite,
      resource_type: 'image',
      // Auto quality/format so delivered assets are optimized by default.
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    };

    try {
      const result = await new Promise<UploadApiResponse>(
        (resolve, reject) => {
          const uploadStream = this.cloudinary.uploader.upload_stream(
            options,
            (error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
              if (error || !result) {
                return reject(
                  error instanceof Error
                    ? error
                    : new Error(error?.message ?? 'Cloudinary upload failed'),
                );
              }
              resolve(result);
            },
          );
          Readable.from(buffer).pipe(uploadStream);
        },
      );

      return this.toResult(result);
    } catch (error) {
      this.logger.error(`Cloudinary upload failed: ${error}`);
      throw new InternalServerErrorException('Failed to upload image');
    }
  }

  /**
   * Update (replace) an existing image in place by re-uploading to the same
   * public_id, so every place that referenced the old URL keeps working.
   */
  async updateImage(
    publicId: string,
    buffer: Buffer,
    folder?: string,
  ): Promise<CloudinaryUploadResult> {
    this.assertConfigured();
    return this.uploadImage({ buffer, folder, publicId, overwrite: true });
  }

  /** Delete an image by its Cloudinary public_id. */
  async deleteImage(publicId: string): Promise<void> {
    this.assertConfigured();

    if (!publicId) {
      throw new BadRequestException('publicId is required to delete image');
    }

    try {
      const result = await this.cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
      });

      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new InternalServerErrorException(
          `Cloudinary deletion failed: ${result.result}`,
        );
      }
    } catch (error) {
      this.logger.error(`Cloudinary delete failed: ${error}`);
      throw new InternalServerErrorException('Failed to delete image');
    }
  }

  /**
   * Build an auto-optimized (auto quality + auto format, e.g. WebP/AVIF
   * where supported) delivery URL for a stored asset, optionally resized.
   */
  getOptimizedUrl(
    publicId: string,
    opts?: { width?: number; height?: number },
  ): string {
    this.assertConfigured();
    return this.cloudinary.url(publicId, {
      secure: true,
      quality: 'auto',
      fetch_format: 'auto',
      width: opts?.width,
      height: opts?.height,
      crop: opts?.width || opts?.height ? 'limit' : undefined,
    });
  }
}
