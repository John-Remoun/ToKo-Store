import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useFetch from '../hooks/useFetch';
import { SkeletonBlock } from '../components/ui/Skeletons';
import { ErrorState, EmptyState } from '../components/ui/States';

export default function Brands() {
  const { t } = useTranslation();
  const { data, loading, error, refetch } = useFetch('/brand?limit=100');

  return (
    <div className="container-app py-10">
      <h1 className="section-title mb-10">{t('nav.brands')}</h1>
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonBlock key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : !data?.docs?.length ? (
        <EmptyState title={t('shop.noResults')} />
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {data.docs.map((b) => (
            <Link key={b._id} to={`/shop?brand=${b._id}`} className="card flex flex-col items-center justify-center gap-3 p-8 text-center transition-all hover:-translate-y-1 hover:shadow-soft animate-fadeUp">
              {b.logo ? (
                <img src={b.logo} alt={b.name} className="h-10 w-auto object-contain" />
              ) : (
                <span className="font-display text-xl font-semibold">{b.name}</span>
              )}
              <span className="text-sm font-medium">{b.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
