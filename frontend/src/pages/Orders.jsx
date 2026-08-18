import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { EmptyState, ErrorState } from '../components/ui/States';
import { LineSkeleton } from '../components/ui/Skeletons';
import { Badge, Pagination, statusTone } from '../components/ui/Atoms';

export default function Orders() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useFetch(`/order?page=${page}&limit=10`, { deps: [page] });

  return (
    <div className="container-app py-10">
      <h1 className="section-title mb-8">{t('orders.title')}</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <LineSkeleton key={i} className="h-24 w-full rounded-2xl" />)}
        </div>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : !data?.docs?.length ? (
        <EmptyState icon={Package} title={t('orders.empty')} body={t('orders.emptyBody')} action={<Link to="/shop" className="btn-primary">{t('cart.continueShopping')}</Link>} />
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {data.docs.map((o) => (
              <Link key={o._id} to={`/orders/${o._id}`} className="card flex flex-col gap-3 p-5 transition-shadow hover:shadow-soft sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">{t('orders.orderNumber')} #{o._id.slice(-8).toUpperCase()}</p>
                  <p className="mt-1 text-xs text-zinc-400">{t('orders.placedOn')} {new Date(o.createdAt).toLocaleDateString()}</p>
                  <p className="mt-1 text-xs text-zinc-400">{o.items?.length} {t('orders.items').toLowerCase()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={statusTone(o.status)}>{t(`status.${o.status}`, o.status)}</Badge>
                  <span className="font-semibold">${o.total?.toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
          <Pagination page={data.currentPage} pages={data.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
