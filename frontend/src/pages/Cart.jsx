import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { EmptyState, PageLoader } from '../components/ui/States';
import { Price } from '../components/ui/Atoms';

export default function Cart() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { cart, loading, busy, updateItem, removeItem, applyCoupon } = useCart();
  const [coupon, setCoupon] = useState('');

  if (authLoading) return <PageLoader />;

  if (!isAuthenticated) {
    return (
      <div className="container-app py-24">
        <EmptyState
          icon={ShoppingBag}
          title={t('cart.loginRequired') || 'Sign In to View Your Cart'}
          action={<Link to="/login" className="btn-primary">{t('nav.login') || 'Sign In'}</Link>}
        />
      </div>
    );
  }

  if (loading && !cart) return <PageLoader />;

  const items = cart?.items || [];

  if (!items.length) {
    return (
      <div className="container-app py-24">
        <EmptyState
          icon={ShoppingBag}
          title={t('cart.empty') || 'Your shopping bag is empty'}
          body={t('cart.emptyBody') || 'Explore our latest arrivals and luxury collections to find your favorite items.'}
          action={<Link to="/shop" className="btn-primary gap-2">{t('cart.continueShopping') || 'Start Shopping'} <ArrowRight size={16} /></Link>}
        />
      </div>
    );
  }

  const onApplyCoupon = async (e) => {
    e.preventDefault();
    if (coupon.trim()) await applyCoupon(coupon.trim());
  };

  return (
    <div className="container-app py-8 sm:py-12">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-accent-600 dark:text-accent-400">
          Shopping Bag
        </span>
        <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
          {t('cart.title') || 'Your Bag'} <span className="text-zinc-400 font-sans text-xl font-normal">({items.length} items)</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        {/* Cart Items List */}
        <div className="space-y-4">
          {items.map((item) => {
            const product = item.product;
            return (
              <div
                key={product?._id || item._id}
                className="glass-card flex gap-4 sm:gap-6 p-4 sm:p-5 items-center"
              >
                <Link
                  to={`/product/${product?._id}`}
                  className="h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800"
                >
                  <img
                    src={product?.images?.[0] || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&q=80'}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </Link>

                <div className="flex flex-1 flex-col justify-between self-stretch">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        to={`/product/${product?._id}`}
                        className="line-clamp-1 font-sans text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 hover:text-accent-600 transition-colors"
                      >
                        {product?.title}
                      </Link>
                      <p className="mt-1 text-xs font-semibold text-zinc-400">
                        ${item.priceAtAdd?.toFixed(2)} / item
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(product?._id)}
                      className="btn-icon h-8 w-8 min-h-[32px] min-w-[32px] text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Stepper */}
                    <div className="flex items-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/80 p-1">
                      <button
                        disabled={busy}
                        onClick={() => updateItem(product?._id, Math.max(1, item.quantity - 1))}
                        className="btn-icon h-7 w-7 min-h-[28px] min-w-[28px]"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-zinc-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        disabled={busy}
                        onClick={() => updateItem(product?._id, item.quantity + 1)}
                        className="btn-icon h-7 w-7 min-h-[28px] min-w-[28px]"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <span className="font-display text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                      ${(item.priceAtAdd * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Aside */}
        <aside className="glass-card h-fit p-6 sm:p-7 space-y-6">
          <h2 className="font-display text-xl font-bold text-zinc-900 dark:text-white">
            {t('cart.orderSummary') || 'Order Summary'}
          </h2>

          <form onSubmit={onApplyCoupon} className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={14} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder={t('cart.couponCode') || 'Coupon Code'}
                className="input ps-9 py-2.5 text-xs rounded-xl"
              />
            </div>
            <button className="btn-outline py-2.5 px-4 text-xs font-bold rounded-xl shrink-0">
              {t('cart.applyCoupon') || 'Apply'}
            </button>
          </form>

          <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800/80 pt-5 text-sm">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>{t('cart.subtotal') || 'Subtotal'}</span>
              <span className="font-bold text-zinc-900 dark:text-white">${cart.subtotal?.toFixed(2)}</span>
            </div>
            {cart.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>{t('cart.discount') || 'Discount'}</span>
                <span>-${cart.discount?.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>{t('cart.tax') || 'Estimated Tax'}</span>
              <span className="font-bold text-zinc-900 dark:text-white">${cart.tax?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-4 text-lg font-bold text-zinc-900 dark:text-white">
              <span>{t('cart.total') || 'Total'}</span>
              <span className="text-accent-600 dark:text-accent-400 font-display text-2xl font-extrabold">
                ${cart.total?.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn-primary w-full py-4 text-sm font-bold shadow-glow"
          >
            {t('cart.checkout') || 'Proceed to Checkout'}
          </button>
        </aside>
      </div>
    </div>
  );
}

