import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings } from 'src/model/settings.model';
import { UpdateSettingsDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name)
    private settingsModel: Model<Settings>,
  ) {}

  async getSettings(): Promise<Settings> {
    let settings = await this.settingsModel.findOne();
    if (!settings) {
      settings = await this.settingsModel.create({});
    }
    return settings;
  }

  async updateSettings(dto: UpdateSettingsDto): Promise<Settings> {
    let settings = await this.settingsModel.findOne();
    if (!settings) {
      settings = await this.settingsModel.create(dto);
    } else {
      Object.assign(settings, dto);
      await settings.save();
    }
    return settings;
  }
}
