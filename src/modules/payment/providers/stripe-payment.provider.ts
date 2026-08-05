import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  CreateIntentInput,
  CreateIntentResult,
  NormalizedWebhookEvent,
  PaymentProvider,
  RefundInput,
  RefundResult,
} from './payment-provider.interface';

@Injectable()
export class StripePaymentProvider implements PaymentProvider {
  readonly name = 'stripe';
  private stripe: Stripe | null = null;

  constructor(private readonly configService: ConfigService) {}

  private getStripe(): Stripe {
    if (!this.stripe) {
      const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
      if (!secretKey) {
        throw new BadRequestException('STRIPE_SECRET_KEY is not configured');
      }
      this.stripe = new Stripe(secretKey);
    }
    return this.stripe;
  }

  async createPaymentIntent(
    input: CreateIntentInput,
  ): Promise<CreateIntentResult> {
    const paymentIntent = await this.getStripe().paymentIntents.create({
      amount: input.amountInSmallestUnit,
      currency: input.currency,
      metadata: { orderId: input.orderId, userId: input.userId },
    });

    return {
      providerReference: paymentIntent.id,
      clientPayload: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    };
  }

  parseWebhookEvent(
    rawBody: Buffer,
    signature: string,
  ): Promise<NormalizedWebhookEvent> {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    if (!webhookSecret) {
      throw new BadRequestException('Stripe webhook secret is not configured');
    }

    let event: Stripe.Event;
    try {
      event = this.getStripe().webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (error) {
      throw new BadRequestException(
        `Webhook signature verification failed: ${error}`,
      );
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        return Promise.resolve({
          type: 'payment_succeeded',
          orderId: pi.metadata.orderId,
          providerReference: pi.id,
        });
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object;
        return Promise.resolve({
          type: 'payment_failed',
          orderId: pi.metadata.orderId,
          providerReference: pi.id,
        });
      }
      default:
        return Promise.resolve({ type: 'unhandled' });
    }
  }

  async refund(input: RefundInput): Promise<RefundResult> {
    const refund = await this.getStripe().refunds.create({
      payment_intent: input.providerReference,
      reason: input.reason as Stripe.RefundCreateParams.Reason | undefined,
    });

    return { refundId: refund.id, status: refund.status ?? 'unknown' };
  }
}
