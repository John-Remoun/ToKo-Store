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

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const fileInterceptorOptions = {
  storage: memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req: any, file: Express.Multer.File, callback: Function) => {
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
};

@Controller({ path: 'upload', version: '1' })
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  // -----------------------------------------------------------------------
  // POST /upload  — upload a file (Cloudinary primary, local disk fallback)
  // -----------------------------------------------------------------------
  @Post()
  @UseInterceptors(FileInterceptor('file', fileInterceptorOptions))
  async upload(
    @UploadedFile()
    file?: {
      buffer: Buffer;
      mimetype: string;
      size: number;
      originalname: string;
    },
  ) {
    if (!file) throw new BadRequestException('File is required');
    if (file.size > MAX_FILE_SIZE)
      throw new BadRequestException('File size must not exceed 5MB');

    return this.uploadFile(file);
  }

  // -----------------------------------------------------------------------
  // POST /upload/cloudinary  — explicit Cloudinary endpoint (same logic)
  // -----------------------------------------------------------------------
  @Post('cloudinary')
  @UseInterceptors(FileInterceptor('file', fileInterceptorOptions))
  async uploadToCloudinary(
    @UploadedFile()
    file?: {
      buffer: Buffer;
      mimetype: string;
      size: number;
      originalname: string;
    },
  ) {
    if (!file) throw new BadRequestException('File is required');
    if (file.size > MAX_FILE_SIZE)
      throw new BadRequestException('File size must not exceed 5MB');

    return this.uploadFile(file);
  }

  // -----------------------------------------------------------------------
  // PATCH /upload/cloudinary  — replace an existing Cloudinary image
  // -----------------------------------------------------------------------
  @Patch('cloudinary')
  @UseInterceptors(FileInterceptor('file', fileInterceptorOptions))
  async updateCloudinaryImage(
    @Body() body: UpdateCloudinaryImageDto,
    @UploadedFile()
    file?: { buffer: Buffer; mimetype: string; size: number; originalname: string },
  ) {
    if (!file) throw new BadRequestException('File is required');
    if (file.size > MAX_FILE_SIZE)
      throw new BadRequestException('File size must not exceed 5MB');

    const result = await this.cloudinaryService.updateImage(
      body.publicId,
      file.buffer,
    );

    return { message: 'Image updated successfully', data: result };
  }

  // -----------------------------------------------------------------------
  // DELETE /upload/cloudinary  — delete a Cloudinary image by publicId
  // -----------------------------------------------------------------------
  @Delete('cloudinary')
  async deleteCloudinaryImage(@Body() body: DeleteFileDto) {
    await this.cloudinaryService.deleteImage(body.publicId);
    return { message: 'Image deleted successfully', data: null };
  }

  // -----------------------------------------------------------------------
  // DELETE /upload  — generic delete (also delegates to Cloudinary)
  // -----------------------------------------------------------------------
  @Delete()
  async deleteFile(@Body() body: DeleteFileDto) {
    await this.cloudinaryService.deleteImage(body.publicId);
    return { message: 'File deleted successfully', data: null };
  }

  // -----------------------------------------------------------------------
  // Private helper: try Cloudinary first, fall back to local disk
  // -----------------------------------------------------------------------
  private async uploadFile(file: {
    buffer: Buffer;
    mimetype: string;
    size: number;
    originalname: string;
  }) {
    try {
      const result = await this.cloudinaryService.uploadImage({
        buffer: file.buffer,
      });
      return { message: 'File uploaded successfully', data: result };
    } catch {
      // Local disk fallback — used when Cloudinary credentials are not configured
      const fs = await import('fs');
      const path = await import('path');
      const ext = path.extname(file.originalname) || '.jpg';
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
      const uploadDir = path.join(process.cwd(), 'uploads');

      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      fs.writeFileSync(path.join(uploadDir, filename), file.buffer);

      const url = `http://localhost:${process.env.PORT || 3000}/uploads/${filename}`;
      return {
        message: 'File uploaded successfully (local fallback)',
        data: { url, publicId: filename },
      };
    }
  }
}
