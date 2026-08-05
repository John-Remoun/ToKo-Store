import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MetaPixelController } from './meta-pixel.controller';
import { MetaPixelService } from './meta-pixel.service';

@Module({
  imports: [ConfigModule],
  controllers: [MetaPixelController],
  providers: [MetaPixelService],
  exports: [MetaPixelService],
})
export class MetaPixelModule {}
