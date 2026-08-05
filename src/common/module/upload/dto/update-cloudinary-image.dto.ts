import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCloudinaryImageDto {
  @IsString()
  @IsNotEmpty()
  publicId: string;
}
