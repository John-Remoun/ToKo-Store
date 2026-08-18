import { Module } from '@nestjs/common';
import { AuthenticationModule } from 'src/modules/authentication/authentication.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { UploadController } from './upload.controller';

@Module({
  imports: [CloudinaryModule, AuthenticationModule],
  controllers: [UploadController],
})
export class UploadModule {}
