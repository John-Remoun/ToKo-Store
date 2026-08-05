import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('EMAIL_SMTP_HOST', 'smtp.gmail.com'),
          port: configService.get<number>('EMAIL_SMTP_PORT', 587),
          secure: configService.get<boolean>('EMAIL_SMTP_SECURE', false),
          auth: {
            user: configService.get<string>('EMAIL_APP'),
            pass: configService.get<string>('EMAIL_APP_PASSWORD'),
          },
        },
        defaults: {
          from: `"${configService.get<string>('APPLICATION_NAME', 'Ecommerce')}" <${configService.get<string>('EMAIL_APP')}>`,
        },
        template: {
          // Compiled templates live next to this file at runtime (dist/…)
          // as well as in src during ts-node/watch mode, so this resolves
          // correctly in both dev and the built `dist` output.
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
