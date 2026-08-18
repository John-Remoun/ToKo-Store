import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

export default function StripePaymentForm({ orderId, onPaid }) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });
    if (error) {
      toast.error(error.message || 'Payment failed');
      setSubmitting(false);
      return;
    }
    if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
      toast.success(t('common.success'));
      onPaid();
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <PaymentElement />
      <button disabled={!stripe || submitting} className="btn-primary w-full py-3.5">
        {t('checkout.payNow')}
      </button>
    </form>
  );
}
