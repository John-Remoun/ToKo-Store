import { Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthenticationModule } from '../authentication/authentication.module';
import { MetaPixelModule } from '../meta-pixel/meta-pixel.module';
import { OrderModule } from '../order/order.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PAYMENT_PROVIDER } from './providers/payment-provider.interface';
import { StripePaymentProvider } from './providers/stripe-payment.provider';
import { PaymobPaymentProvider } from './providers/paymob-payment.provider';
import { PaypalPaymentProvider } from './providers/paypal-payment.provider';

/**
 * Selects the active PaymentProvider implementation based on the
 * PAYMENT_PROVIDER env var (defaults to 'stripe'). Add a new gateway by
 * implementing PaymentProvider and adding a case here — nothing else in
 * the payment module needs to change.
 */
const paymentProviderFactory: Provider = {
  provide: PAYMENT_PROVIDER,
  inject: [
    ConfigService,
    StripePaymentProvider,
    PaymobPaymentProvider,
    PaypalPaymentProvider,
  ],
  useFactory: (
    configService: ConfigService,
    stripe: StripePaymentProvider,
    paymob: PaymobPaymentProvider,
    paypal: PaypalPaymentProvider,
  ) => {
    const selected = (
      configService.get<string>('PAYMENT_PROVIDER') ?? 'stripe'
    ).toLowerCase();

    switch (selected) {
      case 'paymob':
        return paymob;
      case 'paypal':
        return paypal;
      case 'stripe':
        return stripe;
      default:
        return stripe;
    }
  },
};

@Module({
  imports: [ConfigModule, OrderModule, AuthenticationModule, MetaPixelModule],
  controllers: [PaymentController],
  providers: [
    StripePaymentProvider,
    PaymobPaymentProvider,
    PaypalPaymentProvider,
    paymentProviderFactory,
    PaymentService,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
