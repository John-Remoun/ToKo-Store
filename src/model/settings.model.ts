import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SettingsDocument = HydratedDocument<Settings>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  collection: 'Ecommerce_APP_SETTINGS',
})
export class Settings {
  @Prop({ type: String, required: true, default: 'TokoStore' })
  storeName!: string;

  @Prop({ type: String, required: true, default: '#3b82f6' }) // e.g. blue-500
  primaryColor!: string;

  @Prop({ type: String, enum: ['light', 'dark', 'system'], default: 'system' })
  themeMode!: 'light' | 'dark' | 'system';

  @Prop({ type: String })
  logoUrl?: string;

  @Prop({ type: String, default: 'Welcome to TokoStore' })
  heroText?: string;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);

export const SettingsModel = MongooseModule.forFeature([
  { name: Settings.name, schema: SettingsSchema },
]);
