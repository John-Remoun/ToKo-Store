import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useFetch from '../hooks/useFetch';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/ui/Skeletons';
import { EmptyState, ErrorState } from '../components/ui/States';
import { Pagination } from '../components/ui/Atoms';
import { Search as SearchIcon } from 'lucide-react';

export default function Search() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const page = Number(params.get('page') || 1);

  const query = useMemo(() => {
    const qs = new URLSearchParams();
    if (q) qs.set('q', q);
    qs.set('page', page);
    qs.set('limit', 12);
    return qs.toString();
  }, [q, page]);

  const { data, loading, error, refetch } = useFetch(`/search?${query}`, { deps: [query] });

  const setPage = (p) => {
    const next = new URLSearchParams(params);
    next.set('page', p);
    setParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container-app py-10">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">{t('shop.searchResultsFor', { query: q })}</h1>
      {data && <p className="mt-1 text-sm text-zinc-500">{t('shop.results', { count: data.total ?? 0 })}</p>}

      <div className="mt-8">
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : error ? (
          <ErrorState onRetry={refetch} />
        ) : !data?.docs?.length ? (
          <EmptyState icon={SearchIcon} title={t('shop.noResults')} body={t('shop.noResultsBody')} />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
              {data.docs.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
            <Pagination page={data.currentPage || page} pages={data.pages} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
