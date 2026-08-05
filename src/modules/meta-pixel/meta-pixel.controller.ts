import { Controller, Get } from '@nestjs/common';
import { MetaPixelService } from './meta-pixel.service';

/**
 * Lets the frontend fetch the active Meta Pixel ID at runtime instead of
 * hard-coding it into the client bundle. Only the public pixel ID is
 * exposed here — the Conversions API access token never leaves the server.
 */
@Controller({ path: 'config/meta-pixel', version: '1' })
export class MetaPixelController {
  constructor(private readonly metaPixelService: MetaPixelService) {}

  @Get()
  getConfig() {
    return {
      message: 'Meta Pixel config',
      data: {
        enabled: this.metaPixelService.isConfigured(),
        pixelId: this.metaPixelService.getPixelId() ?? null,
      },
    };
  }
}
