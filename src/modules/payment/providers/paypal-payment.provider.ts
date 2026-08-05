import { Injectable, NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateIntentInput,
  CreateIntentResult,
  NormalizedWebhookEvent,
  PaymentProvider,
  RefundInput,
  RefundResult,
} from './payment-provider.interface';

/**
 * PayPal Orders v2 integration scaffold.
 *
 * To finish this integration (install `@paypal/checkout-server-sdk` or call
 * the REST API directly):
 *  1. Auth: POST {PAYPAL_BASE_URL}/v1/oauth2/token with client-credentials
 *     grant using PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET (Basic auth).
 *  2. Create order: POST /v2/checkout/orders with intent=CAPTURE and the
 *     order amount; return the approval `links[].href` (rel=approve) as
 *     clientPayload.approvalUrl for the frontend to redirect to.
 *  3. Capture: after the buyer approves, POST
 *     /v2/checkout/orders/{id}/capture — do this from a dedicated
 *     "capture" endpoint the frontend calls on return, or from the webhook.
 *  4. Webhooks: verify via POST /v1/notifications/verify-webhook-signature
 *     with the request headers + PAYPAL_WEBHOOK_ID, per PayPal's docs.
 *  5. Refunds: POST /v2/payments/captures/{capture_id}/refund.
 *
 * Required env vars: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET,
 * PAYPAL_WEBHOOK_ID, PAYPAL_BASE_URL (sandbox vs live).
 */
@Injectable()
export class PaypalPaymentProvider implements PaymentProvider {
  readonly name = 'paypal';

  constructor(private readonly configService: ConfigService) {}

  createPaymentIntent(_input: CreateIntentInput): Promise<CreateIntentResult> {
    throw new NotImplementedException(
      'PayPal provider is a scaffold — implement the Orders v2 calls ' +
        'documented in paypal-payment.provider.ts, then wire ' +
        'PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_WEBHOOK_ID and ' +
        'PAYPAL_BASE_URL in your environment.',
    );
  }

  parseWebhookEvent(
    _rawBody: Buffer,
    _signature: string,
  ): Promise<NormalizedWebhookEvent> {
    throw new NotImplementedException('PayPal webhook parsing not implemented yet');
  }

  refund(_input: RefundInput): Promise<RefundResult> {
    throw new NotImplementedException('PayPal refunds not implemented yet');
  }
}
