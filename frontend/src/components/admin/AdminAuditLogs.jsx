import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useFetch from '../../hooks/useFetch';
import { TableRowSkeleton } from '../ui/Skeletons';
import { EmptyState, ErrorState } from '../ui/States';
import { Pagination, Badge } from '../ui/Atoms';

export default function AdminAuditLogs() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useFetch(`/audit-logs?page=${page}&limit=15`, { deps: [page] });

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold">{t('admin.auditLogs')}</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-start text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-xs uppercase tracking-wider text-zinc-400 dark:border-zinc-800">
              <th className="px-4 py-3 text-start font-medium">{t('common.date')}</th>
              <th className="px-4 py-3 text-start font-medium">Actor</th>
              <th className="px-4 py-3 text-start font-medium">Action</th>
              <th className="px-4 py-3 text-start font-medium">Target</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
            ) : data?.docs?.length ? (
              data.docs.map((log) => (
                <tr key={log._id} className="border-b border-zinc-50 last:border-0 dark:border-zinc-900">
                  <td className="px-4 py-3 text-xs text-zinc-500">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">{log.actor?.email || log.actorEmail || log.userId || '—'}</td>
                  <td className="px-4 py-3"><Badge>{log.action}</Badge></td>
                  <td className="px-4 py-3 text-xs text-zinc-500">{log.entity || log.resource} {log.entityId || log.resourceId ? `#${String(log.entityId || log.resourceId).slice(-6)}` : ''}</td>
                </tr>
              ))
            ) : null}
          </tbody>
        </table>
        {!loading && error && <div className="p-6"><ErrorState onRetry={refetch} /></div>}
        {!loading && !error && !data?.docs?.length && <div className="p-6"><EmptyState title={t('shop.noResults')} /></div>}
      </div>
      <Pagination page={data?.currentPage || page} pages={data?.pages} onChange={setPage} />
    </div>
  );
}
