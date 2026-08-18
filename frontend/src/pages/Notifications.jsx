import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, BellRing } from 'lucide-react';
import toast from 'react-hot-toast';
import useFetch from '../hooks/useFetch';
import api, { apiError } from '../lib/api';
import { EmptyState, ErrorState } from '../components/ui/States';
import { LineSkeleton } from '../components/ui/Skeletons';
import { Pagination } from '../components/ui/Atoms';

export default function Notifications() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useFetch(`/notifications?page=${page}&limit=15`, { deps: [page] });

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      refetch();
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  return (
    <div className="container-app max-w-2xl py-10">
      <h1 className="section-title mb-8">{t('notifications.title')}</h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <LineSkeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : !data?.docs?.length ? (
        <EmptyState icon={Bell} title={t('notifications.empty')} body={t('notifications.emptyBody')} />
      ) : (
        <>
          <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
            {data.docs.map((n) => (
              <div key={n._id} className={`flex items-start gap-3 py-4 ${!n.read ? 'bg-accent-50/40 dark:bg-accent-900/10' : ''}`}>
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${!n.read ? 'bg-accent-100 text-accent-600 dark:bg-accent-900/30' : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800'}`}>
                  {!n.read ? <BellRing size={14} /> : <Bell size={14} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  {n.message && <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{n.message}</p>}
                  <p className="mt-1 text-xs text-zinc-400">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.read && (
                  <button onClick={() => markRead(n._id)} className="shrink-0 text-xs font-medium text-accent-600 hover:underline">
                    {t('notifications.markRead')}
                  </button>
                )}
              </div>
            ))}
          </div>
          <Pagination page={data.currentPage} pages={data.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
