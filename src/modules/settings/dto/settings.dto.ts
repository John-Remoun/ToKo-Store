import { IsEnum, IsHexColor, IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  storeName?: string;

  @IsOptional()
  @IsString() // Can be hex or tailwind class name if user wants, but let's just stick to string since they might use tailwind colors
  primaryColor?: string;

  @IsOptional()
  @IsEnum(['light', 'dark', 'system'])
  themeMode?: 'light' | 'dark' | 'system';

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  heroText?: string;
}
