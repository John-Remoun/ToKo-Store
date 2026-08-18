import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Info, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { apiError, unwrap } from '../../lib/api';
import { Badge, statusTone } from '../ui/Atoms';
import { PageLoader } from '../ui/States';

const STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export default function AdminOrders() {
  const { t } = useTranslation();
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [status, setStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refunding, setRefunding] = useState(false);

  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  const fetchRecentOrders = async () => {
    setLoadingRecent(true);
    try {
      const res = await api.get('/dashboard/recent-orders');
      setRecentOrders(res.data?.data || res.data || []);
    } catch (err) {
      toast.error('Failed to load recent orders');
    } finally {
      setLoadingRecent(false);
    }
  };

  const lookup = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!orderId.trim()) {
      setOrder(null);
      setNotFound(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    try {
      const res = await api.get(`/order/${orderId.trim()}`);
      const o = unwrap(res);
      setOrder(o);
      setStatus(o.status);
    } catch (e2) {
      setOrder(null);
      setNotFound(true);
      toast.error(apiError(e2, 'Order not found'));
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async () => {
    setUpdating(true);
    try {
      const res = await api.patch(`/order/${order._id}/status`, { status });
      setOrder(unwrap(res));
      toast.success(t('common.success'));
      fetchRecentOrders(); // Refresh the list
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setUpdating(false);
    }
  };

  const refund = async () => {
    setRefunding(true);
    try {
      await api.post('/payment/refund', { orderId: order._id, reason: refundReason || undefined });
      toast.success(t('common.success'));
      setRefundReason('');
      lookup();
      fetchRecentOrders();
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setRefunding(false);
    }
  };

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold">{t('admin.orders')}</h1>
      <div className="mb-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/10 dark:text-amber-300">
        <Info size={18} className="mt-0.5 shrink-0" />
        <p>{t('admin.findOrderHint')}</p>
      </div>

      <form onSubmit={lookup} className="mb-8 flex max-w-md gap-2">
        <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder={t('admin.orderId')} className="input" />
        <button type="submit" className="btn-accent gap-2 px-5 text-sm"><Search size={15} /> {t('admin.lookup')}</button>
        {order && (
           <button type="button" onClick={() => { setOrder(null); setOrderId(''); setNotFound(false); }} className="btn-ghost px-5 text-sm">Clear</button>
        )}
      </form>

      {loading && <PageLoader />}

      {!loading && notFound && <p className="text-sm text-zinc-500">{t('admin.noOrderFound')}</p>}

      {!loading && order && (
        <div className="card max-w-2xl p-6 mb-8 border-2 border-accent-500">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="font-semibold">#{order._id.slice(-8).toUpperCase()}</p>
              <p className="text-xs text-zinc-400">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <Badge tone={statusTone(order.status)}>{t(`status.${order.status}`, order.status)}</Badge>
              <Badge tone={statusTone(order.paymentStatus)}>{t(`status.${order.paymentStatus}`, order.paymentStatus)}</Badge>
            </div>
          </div>

          <div className="mb-5 divide-y divide-zinc-100 border-y border-zinc-100 dark:divide-zinc-800 dark:border-zinc-800">
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between py-2.5 text-sm">
                <span>{item.product?.title || item.title} × {item.quantity}</span>
                <span className="font-medium">${(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="mb-6 flex justify-between text-sm font-semibold">
            <span>{t('cart.total')}</span>
            <span>${order.total?.toFixed(2)}</span>
          </div>

          <div className="mb-6">
            <label className="label">{t('admin.updateStatus')}</label>
            <div className="flex gap-2">
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
                {STATUSES.map((s) => <option key={s} value={s}>{t(`status.${s}`, s)}</option>)}
              </select>
              <button onClick={updateStatus} disabled={updating || status === order.status} className="btn-primary shrink-0 px-5 text-sm">{t('common.update')}</button>
            </div>
          </div>

          {order.paymentStatus === 'PAID' && (
            <div className="border-t border-zinc-100 pt-5 dark:border-zinc-800">
              <label className="label">{t('admin.refundReason')}</label>
              <div className="flex gap-2">
                <input value={refundReason} onChange={(e) => setRefundReason(e.target.value)} className="input" />
                <button onClick={refund} disabled={refunding} className="btn-outline shrink-0 border-red-300 px-5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10">
                  {t('admin.refund')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!order && !loading && (
         <div>
            <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
            <div className="card overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-xs uppercase tracking-wider text-zinc-400 dark:border-zinc-800">
                    <th className="px-4 py-3 text-start font-medium">Order ID</th>
                    <th className="px-4 py-3 text-start font-medium">Date</th>
                    <th className="px-4 py-3 text-start font-medium">Items</th>
                    <th className="px-4 py-3 text-start font-medium">Total</th>
                    <th className="px-4 py-3 text-start font-medium">Status</th>
                    <th className="px-4 py-3 text-end font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingRecent ? (
                     <tr><td colSpan={6} className="p-4 text-center text-zinc-500">Loading...</td></tr>
                  ) : recentOrders.length > 0 ? (
                     recentOrders.map(o => (
                        <tr key={o._id} className="border-b border-zinc-50 last:border-0 dark:border-zinc-900">
                           <td className="px-4 py-3 font-mono text-xs">{o._id.slice(-8).toUpperCase()}</td>
                           <td className="px-4 py-3">{new Date(o.createdAt).toLocaleDateString()}</td>
                           <td className="px-4 py-3">{o.items?.length || 0} items</td>
                           <td className="px-4 py-3">${o.total?.toFixed(2)}</td>
                           <td className="px-4 py-3"><Badge tone={statusTone(o.status)}>{t(`status.${o.status}`, o.status)}</Badge></td>
                           <td className="px-4 py-3 text-end">
                              <button onClick={() => { setOrderId(o._id); lookup({ preventDefault: () => {} }); }} className="text-accent-600 hover:underline inline-flex items-center gap-1">
                                 <Eye size={14} /> View
                              </button>
                           </td>
                        </tr>
                     ))
                  ) : (
                     <tr><td colSpan={6} className="p-4 text-center text-zinc-500">No recent orders found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
         </div>
      )}
    </div>
  );
}
