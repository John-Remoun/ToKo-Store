import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { SettingsModel } from 'src/model/settings.model';

@Module({
  imports: [SettingsModel],
  controllers: [SettingsController],
  providers: [SettingsService]
})
export class SettingsModule {}
