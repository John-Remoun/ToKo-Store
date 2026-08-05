import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { OrderStatusEnum, PaymentStatusEnum } from 'src/common/enum/order.enum';
import { IUser } from 'src/common/interface/user.interface';
import { MetaPixelService } from '../meta-pixel/meta-pixel.service';
import { OrderService } from '../order/order.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { RefundPaymentDto } from './dto/refund.dto';
import {
  PAYMENT_PROVIDER,
  type PaymentProvider,
} from './providers/payment-provider.interface';

/**
 * Gateway-agnostic payment orchestration. All gateway-specific logic
 * (Stripe/Paymob/PayPal SDK calls, signature verification, request/response
 * shapes) lives behind the injected PaymentProvider (see
 * providers/payment-provider.interface.ts) — swap PAYMENT_PROVIDER in
 * payment.module.ts (driven by the PAYMENT_PROVIDER env var) to change
 * gateways without touching this file, the controller, or the API surface.
 */
@Injectable()
export class PaymentService {
  constructor(
    @Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProvider,
    private readonly orderService: OrderService,
    private readonly metaPixelService: MetaPixelService,
  ) {}

  async createPaymentIntent(user: IUser, dto: CreatePaymentIntentDto) {
    const { data: order } = await this.orderService.findOne(user, dto.orderId);

    if (order.paymentStatus === PaymentStatusEnum.PAID) {
      throw new BadRequestException('Order is already paid');
    }

    if (order.status === OrderStatusEnum.CANCELLED) {
      throw new BadRequestException('Cannot pay for a cancelled order');
    }

    const amountInSmallestUnit = Math.round(order.total * 100);

    const result = await this.provider.createPaymentIntent({
      orderId: String(order._id),
      userId: String(user._id ?? ''),
      amountInSmallestUnit,
      currency: 'usd',
    });

    await this.orderService.updatePaymentStatus({
      orderId: dto.orderId,
      paymentStatus: PaymentStatusEnum.PENDING,
      stripePaymentIntentId: result.providerReference,
    });

    return {
      message: 'Payment intent created',
      data: {
        provider: this.provider.name,
        paymentIntentId: result.providerReference,
        ...result.clientPayload,
      },
    };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const event = await this.provider.parseWebhookEvent(rawBody, signature);

    switch (event.type) {
      case 'payment_succeeded': {
        if (event.orderId) {
          await this.orderService.updatePaymentStatus({
            orderId: event.orderId,
            paymentStatus: PaymentStatusEnum.PAID,
            stripePaymentIntentId: event.providerReference,
            status: OrderStatusEnum.CONFIRMED,
          });

          // Server-side Purchase event (Meta Conversions API). Safe no-op
          // if META_PIXEL_ID / META_CONVERSIONS_API_ACCESS_TOKEN aren't set.
          void this.metaPixelService.sendEvent({
            eventName: 'Purchase',
            eventId: event.providerReference ?? event.orderId,
            customData: { currency: 'usd', contentIds: [event.orderId] },
          });
        }
        break;
      }
      case 'payment_failed': {
        if (event.orderId) {
          await this.orderService.updatePaymentStatus({
            orderId: event.orderId,
            paymentStatus: PaymentStatusEnum.FAILED,
            stripePaymentIntentId: event.providerReference,
          });
        }
        break;
      }
      default:
        break;
    }

    return { message: 'Webhook processed', data: { received: true } };
  }

  async refund(dto: RefundPaymentDto): Promise<{
    message: string;
    data: { refundId: string; status: string };
  }> {
    const order = await this.orderService.findById(dto.orderId);

    if (!order.stripePaymentIntentId) {
      throw new BadRequestException('Order has no associated payment');
    }

    if (order.paymentStatus !== PaymentStatusEnum.PAID) {
      throw new BadRequestException('Order is not paid');
    }

    const refund = await this.provider.refund({
      providerReference: order.stripePaymentIntentId,
      reason: dto.reason,
    });

    await this.orderService.updatePaymentStatus({
      orderId: dto.orderId,
      paymentStatus: PaymentStatusEnum.REFUNDED,
      status: OrderStatusEnum.REFUNDED,
    });

    return {
      message: 'Refund processed',
      data: { refundId: refund.refundId, status: refund.status },
    };
  }
}
