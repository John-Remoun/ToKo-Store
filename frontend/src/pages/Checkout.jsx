import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CheckCircle2, MapPin, CreditCard, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { apiError, unwrap } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { PageLoader, Spinner } from '../components/ui/States';
import StripePaymentForm from '../components/StripePaymentForm';

const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null;

const FIELDS = ['street', 'city', 'state', 'zipCode', 'country'];

const STEPS = [
  { id: 'address', icon: MapPin, label: 'Address' },
  { id: 'pay',     icon: CreditCard, label: 'Payment' },
  { id: 'done',    icon: Package, label: 'Confirmed' },
];

function StepBar({ current }) {
  const idx = STEPS.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center gap-0 mb-10">
      {STEPS.map((step, i) => {
        const done = i < idx;
        const active = i === idx;
        const Icon = step.icon;
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className={`flex flex-col items-center gap-1.5 ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
              <div className={`h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300 text-sm font-bold
                ${done  ? 'bg-emerald-500 text-white shadow-[0_0_16px_rgba(16,185,129,0.4)]' : ''}
                ${active ? 'bg-accent-600 text-white shadow-glow' : ''}
                ${!done && !active ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400' : ''}
              `}>
                {done ? <CheckCircle2 size={16} /> : <Icon size={15} />}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'text-accent-600 dark:text-accent-400' : 'text-zinc-400'}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px flex-1 mb-5 mx-2 transition-all duration-300 ${done ? 'bg-emerald-400' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Checkout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cart, loading: cartLoading, refresh } = useCart();
  const { mode } = useTheme();
  const [step, setStep] = useState('address');
  const [address, setAddress] = useState({ street: '', city: '', state: '', zipCode: '', country: '' });
  const [placing, setPlacing] = useState(false);
  const [order, setOrder] = useState(null);
  const [paymentPayload, setPaymentPayload] = useState(null);
  const [payLoading, setPayLoading] = useState(false);

  if (cartLoading && !cart) return <PageLoader />;

  if (!cartLoading && (!cart?.items?.length) && step === 'address') {
    return (
      <div className="container-app py-24 text-center">
        <p className="text-zinc-500">{t('cart.empty') || 'Your cart is empty'}</p>
      </div>
    );
  }

  const onChange = (k, v) => setAddress((a) => ({ ...a, [k]: v }));

  const placeOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    try {
      const res = await api.post('/order/checkout', { shippingAddress: address });
      const createdOrder = unwrap(res);
      setOrder(createdOrder);
      await refresh();
      setStep('pay');
      setPayLoading(true);
      try {
        const intentRes = await api.post('/payment/intent', { orderId: createdOrder._id });
        setPaymentPayload(unwrap(intentRes));
      } catch (e2) {
        toast.error(apiError(e2, 'Could not initialize payment'));
      } finally {
        setPayLoading(false);
      }
    } catch (e) {
      toast.error(apiError(e, 'Could not place order'));
    } finally {
      setPlacing(false);
    }
  };

  if (step === 'done') {
    return (
      <div className="container-app flex flex-col items-center justify-center py-28 text-center">
        <StepBar current="done" />
        <div className="glass-card w-full max-w-md p-10 text-center space-y-4">
          <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/20 ring-4 ring-emerald-200/50 dark:ring-emerald-700/30">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <h1 className="font-display text-3xl font-bold text-zinc-900 dark:text-white">
            {t('checkout.orderPlaced') || 'Order Confirmed!'}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
            {t('checkout.orderPlacedBody') || 'Your order has been successfully placed. We\'ll notify you once it ships.'}
          </p>
          <button
            onClick={() => navigate(`/orders/${order._id}`)}
            className="btn-primary mt-4 px-8 py-3 shadow-glow"
          >
            {t('checkout.viewOrder') || 'View Order'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app max-w-2xl py-10 sm:py-14">
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-accent-600 dark:text-accent-400">
          Secure Checkout
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
          {t('checkout.title') || 'Checkout'}
        </h1>
      </div>

      <StepBar current={step} />

      {step === 'address' && (
        <form onSubmit={placeOrder} className="glass-card space-y-5 p-7">
          <h2 className="font-display text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <MapPin size={18} className="text-accent-500" />
            {t('checkout.shippingAddress') || 'Shipping Address'}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <div key={f} className={f === 'street' ? 'sm:col-span-2' : ''}>
                <label className="label mb-1.5 text-xs font-bold uppercase tracking-wider">
                  {t(`checkout.${f}`) || f.charAt(0).toUpperCase() + f.slice(1)}
                </label>
                <input
                  required
                  value={address[f]}
                  onChange={(e) => onChange(f, e.target.value)}
                  placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                  className="input rounded-xl text-sm"
                />
              </div>
            ))}
          </div>
          <button
            disabled={placing}
            className="btn-primary flex w-full items-center justify-center gap-2 py-4 text-sm font-bold shadow-glow"
          >
            {placing && <Spinner className="h-4 w-4" />}
            {t('checkout.placeOrder') || 'Place Order & Pay'}
          </button>
        </form>
      )}

      {step === 'pay' && (
        <div className="glass-card p-7">
          <h2 className="mb-6 font-display text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <CreditCard size={18} className="text-accent-500" />
            {t('checkout.payment') || 'Payment'}
          </h2>
          {payLoading ? (
            <div className="flex justify-center py-10">
              <Spinner className="h-8 w-8" />
            </div>
          ) : paymentPayload?.clientSecret && stripePromise ? (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret: paymentPayload.clientSecret, appearance: { theme: mode === 'dark' ? 'night' : 'stripe' } }}
            >
              <StripePaymentForm orderId={order._id} onPaid={() => setStep('done')} />
            </Elements>
          ) : paymentPayload?.approvalUrl ? (
            <a
              href={paymentPayload.approvalUrl}
              className="btn-primary w-full py-4 text-center block shadow-glow"
              target="_blank"
              rel="noreferrer"
            >
              {t('checkout.payNow') || 'Pay Now'}
            </a>
          ) : paymentPayload ? (
            <div className="space-y-4">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Payment provider &ldquo;{paymentPayload.provider}&rdquo; returned a payload. Wire up that provider&apos;s client SDK to complete payment.
              </p>
              <pre className="overflow-x-auto rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 p-4 text-xs">
                {JSON.stringify(paymentPayload, null, 2)}
              </pre>
              <button onClick={() => setStep('done')} className="btn-outline w-full py-3 rounded-xl">
                Skip (dev only)
              </button>
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Set <code className="rounded bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 font-mono text-xs">VITE_STRIPE_PUBLISHABLE_KEY</code> in your frontend .env to enable the Stripe payment form.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

