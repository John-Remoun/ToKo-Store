import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendConfirmEmail(email: string, otp: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Confirm your email',
        template: 'confirm-email',
        context: { otp },
      });
    } catch (error) {
      this.logger.warn(`Failed to send confirm email to ${email}: ${error}`);
    }
  }

  async sendForgotPassword(email: string, token: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Reset your password',
        template: 'forgot-password',
        context: { token },
      });
    } catch (error) {
      this.logger.warn(`Failed to send reset email to ${email}: ${error}`);
    }
  }

  async sendOrderConfirmation(email: string, orderId: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Order confirmation',
        template: 'order-confirmation',
        context: { orderId },
      });
    } catch (error) {
      this.logger.warn(
        `Failed to send order confirmation to ${email}: ${error}`,
      );
    }
  }
}
