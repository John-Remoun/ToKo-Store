import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { DeleteFileDto } from './dto/delete-file.dto';
import { UpdateCloudinaryImageDto } from './dto/update-cloudinary-image.dto';
import { S3Service } from './s3.service';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

@Controller({ path: 'upload', version: '1' })
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(
    private readonly s3Service: S3Service,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Only image files (jpeg, png, webp, gif) are allowed',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async upload(
    @UploadedFile()
    file?: {
      buffer: Buffer;
      mimetype: string;
      size: number;
      originalname: string;
    },
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size must not exceed 5MB');
    }

    const result = await this.s3Service.uploadFile({
      buffer: file.buffer,
      mimetype: file.mimetype,
      filename: file.originalname,
    });

    return {
      message: 'File uploaded successfully',
      data: result,
    };
  }

  @Delete()
  async deleteFromS3(@Body() body: DeleteFileDto) {
    // Reuses the same { publicId } shaped DTO — for S3 this is the object key.
    await this.s3Service.deleteFile(body.publicId);
    return {
      message: 'File deleted successfully',
      data: null,
    };
  }

  // ---------------------------------------------------------------------
  // Cloudinary endpoints. Independent of the S3 endpoint above so either
  // (or both) providers can be used, selected by whichever the frontend
  // calls. Requires CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET to be set.
  // ---------------------------------------------------------------------

  @Post('cloudinary')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Only image files (jpeg, png, webp, gif) are allowed',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadToCloudinary(
    @UploadedFile()
    file?: { buffer: Buffer; mimetype: string; size: number },
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size must not exceed 5MB');
    }

    const result = await this.cloudinaryService.uploadImage({
      buffer: file.buffer,
    });

    return {
      message: 'Image uploaded successfully',
      data: result,
    };
  }

  @Patch('cloudinary')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Only image files (jpeg, png, webp, gif) are allowed',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async updateCloudinaryImage(
    @Body() body: UpdateCloudinaryImageDto,
    @UploadedFile()
    file?: { buffer: Buffer; mimetype: string; size: number },
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size must not exceed 5MB');
    }

    const result = await this.cloudinaryService.updateImage(
      body.publicId,
      file.buffer,
    );

    return {
      message: 'Image updated successfully',
      data: result,
    };
  }

  @Delete('cloudinary')
  async deleteCloudinaryImage(@Body() body: DeleteFileDto) {
    await this.cloudinaryService.deleteImage(body.publicId);
    return {
      message: 'Image deleted successfully',
      data: null,
    };
  }
}
