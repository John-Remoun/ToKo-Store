/**
 * Provider-agnostic payment abstraction. Every concrete gateway (Stripe,
 * Paymob, PayPal, ...) implements this interface, and PaymentService only
 * ever talks to PAYMENT_PROVIDER — it never imports a specific SDK. Adding
 * a new gateway means writing one class here and registering it in
 * payment.module.ts; nothing in the controller or service layer changes.
 */

export interface CreateIntentInput {
  orderId: string;
  userId: string;
  /** Amount in the currency's smallest unit (e.g. cents for USD). */
  amountInSmallestUnit: number;
  currency: string;
}

export interface CreateIntentResult {
  /** Opaque reference the provider needs to look this payment up later
   *  (Stripe: PaymentIntent id. Paymob: order id. PayPal: order id). */
  providerReference: string;
  /** Whatever the client SDK on the frontend needs to complete payment
   *  (Stripe: client_secret. Paymob: iframe/payment token. PayPal: approval URL). */
  clientPayload: Record<string, unknown>;
}

export type NormalizedWebhookEventType =
  | 'payment_succeeded'
  | 'payment_failed'
  | 'unhandled';

export interface NormalizedWebhookEvent {
  type: NormalizedWebhookEventType;
  orderId?: string;
  providerReference?: string;
}

export interface RefundInput {
  providerReference: string;
  reason?: string;
}

export interface RefundResult {
  refundId: string;
  status: string;
}

export interface PaymentProvider {
  readonly name: string;

  createPaymentIntent(input: CreateIntentInput): Promise<CreateIntentResult>;

  /**
   * Verifies the webhook signature and returns a normalized event.
   * Must throw on invalid/unverifiable signatures — never trust an
   * unverified payload.
   */
  parseWebhookEvent(
    rawBody: Buffer,
    signature: string,
  ): Promise<NormalizedWebhookEvent>;

  refund(input: RefundInput): Promise<RefundResult>;
}

export const PAYMENT_PROVIDER = 'PAYMENT_PROVIDER';
