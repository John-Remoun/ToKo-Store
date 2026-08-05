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
 * Paymob (popular in Egypt/MENA) integration scaffold.
 *
 * To finish this integration:
 *  1. Auth: POST https://accounts.paymob.com/api/auth/tokens with
 *     { api_key: PAYMOB_API_KEY } -> { token }.
 *  2. Order registration: POST /api/ecommerce/orders with the auth token,
 *     amount_cents, currency, and merchant_order_id = your orderId.
 *  3. Payment key: POST /api/acceptance/payment_keys with the order id,
 *     amount_cents, billing_data, and PAYMOB_INTEGRATION_ID -> { token }.
 *     Return that token as clientPayload.paymentToken; the frontend embeds
 *     https://accounts.paymob.com/api/acceptance/iframes/{PAYMOB_IFRAME_ID}?payment_token=...
 *  4. Webhooks: Paymob posts a flat, alphabetically-HMAC-signed payload.
 *     Verify by recomputing the HMAC over the documented field order using
 *     PAYMOB_HMAC_SECRET and comparing to the `hmac` query param.
 *  5. Refunds: POST /api/acceptance/void_refund/refund with transaction id
 *     and amount_cents.
 *
 * Required env vars: PAYMOB_API_KEY, PAYMOB_INTEGRATION_ID,
 * PAYMOB_IFRAME_ID, PAYMOB_HMAC_SECRET.
 */
@Injectable()
export class PaymobPaymentProvider implements PaymentProvider {
  readonly name = 'paymob';

  constructor(private readonly configService: ConfigService) {}

  createPaymentIntent(_input: CreateIntentInput): Promise<CreateIntentResult> {
    throw new NotImplementedException(
      'Paymob provider is a scaffold — implement the auth/order/payment-key ' +
        'calls documented in paymob-payment.provider.ts, then wire ' +
        'PAYMOB_API_KEY, PAYMOB_INTEGRATION_ID, PAYMOB_IFRAME_ID and ' +
        'PAYMOB_HMAC_SECRET in your environment.',
    );
  }

  parseWebhookEvent(
    _rawBody: Buffer,
    _signature: string,
  ): Promise<NormalizedWebhookEvent> {
    throw new NotImplementedException('Paymob webhook parsing not implemented yet');
  }

  refund(_input: RefundInput): Promise<RefundResult> {
    throw new NotImplementedException('Paymob refunds not implemented yet');
  }
}
