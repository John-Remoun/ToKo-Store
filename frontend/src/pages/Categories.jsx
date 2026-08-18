import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useFetch from '../hooks/useFetch';
import { SkeletonBlock } from '../components/ui/Skeletons';
import { ErrorState, EmptyState } from '../components/ui/States';

export default function Categories() {
  const { t } = useTranslation();
  const { data, loading, error, refetch } = useFetch('/category/tree');

  return (
    <div className="container-app py-10">
      <h1 className="section-title mb-10">{t('nav.categories')}</h1>
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonBlock key={i} className="aspect-square rounded-2xl" />)}
        </div>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : !data?.length ? (
        <EmptyState title={t('shop.noResults')} />
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {data.map((c) => (
            <Link key={c._id} to={`/shop?category=${c._id}`} className="group relative aspect-square overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-fadeUp">
              <img
                src={c.image || 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80'}
                alt={c.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="font-display text-lg font-semibold text-white">{c.name}</h3>
                {c.children?.length > 0 && <p className="mt-1 text-xs text-zinc-200">{c.children.length} subcategories</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
