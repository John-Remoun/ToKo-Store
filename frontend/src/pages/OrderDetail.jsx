import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import useFetch from '../hooks/useFetch';
import api, { apiError } from '../lib/api';
import { PageLoader, ErrorState } from '../components/ui/States';
import { Badge, ConfirmDialog, statusTone } from '../components/ui/Atoms';

export default function OrderDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: order, loading, error, refetch } = useFetch(`/order/${id}`, { deps: [id] });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const cancelOrder = async () => {
    setCancelling(true);
    try {
      await api.post(`/order/${id}/cancel`);
      toast.success(t('common.success'));
      setConfirmOpen(false);
      refetch();
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error || !order) return <ErrorState onRetry={refetch} />;

  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status);

  return (
    <div className="container-app max-w-3xl py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">{t('orders.details')}</h1>
          <p className="mt-1 text-sm text-zinc-400">#{order._id.slice(-8).toUpperCase()} · {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={statusTone(order.status)}>{t(`status.${order.status}`, order.status)}</Badge>
          <Badge tone={statusTone(order.paymentStatus)}>{t(`status.${order.paymentStatus}`, order.paymentStatus)}</Badge>
        </div>
      </div>

      <div className="card mb-6 divide-y divide-zinc-100 dark:divide-zinc-800">
        {order.items?.map((item, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <img src={item.product?.images?.[0] || item.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80'} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="flex-1">
              {item.product?._id ? (
                <Link to={`/product/${item.product._id}`} className="text-sm font-medium hover:text-accent-600">{item.title || item.product?.title}</Link>
              ) : (
                <p className="text-sm font-medium">{item.title}</p>
              )}
              <p className="mt-1 text-xs text-zinc-400">{t('product.quantity')}: {item.quantity} × ${item.price?.toFixed(2)}</p>
            </div>
            <span className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">{t('checkout.shippingAddress')}</h3>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            {order.shippingAddress?.street}<br />
            {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}<br />
            {order.shippingAddress?.country}
          </p>
        </div>
        <div className="card p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">{t('cart.orderSummary')}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-zinc-500"><span>{t('cart.subtotal')}</span><span>${order.subtotal?.toFixed(2)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-emerald-600"><span>{t('cart.discount')}</span><span>-${order.discount?.toFixed(2)}</span></div>}
            <div className="flex justify-between text-zinc-500"><span>{t('cart.tax')}</span><span>${order.tax?.toFixed(2)}</span></div>
            <div className="flex justify-between border-t border-zinc-100 pt-2 font-semibold dark:border-zinc-800"><span>{t('cart.total')}</span><span>${order.total?.toFixed(2)}</span></div>
          </div>
        </div>
      </div>

      {order.paymentStatus !== 'PAID' && order.status !== 'CANCELLED' && (
        <Link to="/checkout" className="btn-primary mt-6 inline-flex">{t('checkout.payNow')}</Link>
      )}

      {canCancel && (
        <button onClick={() => setConfirmOpen(true)} className="btn-outline mt-6 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10">
          {t('orders.cancel')}
        </button>
      )}

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={cancelOrder} loading={cancelling} title={t('orders.cancel')} body={t('orders.cancelConfirm')} />
    </div>
  );
}
