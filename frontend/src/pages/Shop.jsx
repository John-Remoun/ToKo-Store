import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, X, Check, Filter } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/ui/Skeletons';
import { EmptyState, ErrorState } from '../components/ui/States';
import { Pagination } from '../components/ui/Atoms';

export default function Shop() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const page = Number(params.get('page') || 1);
  const category = params.get('category') || '';
  const brand = params.get('brand') || '';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const search = params.get('search') || '';
  const sort = params.get('sort') || 'createdAt';
  const order = params.get('order') || 'desc';

  const [priceDraft, setPriceDraft] = useState({ min: minPrice, max: maxPrice });

  const { data: categories } = useFetch('/category?limit=100');
  const { data: brands } = useFetch('/brand?limit=100');

  const query = useMemo(() => {
    const qs = new URLSearchParams();
    qs.set('page', page);
    qs.set('limit', 12);
    if (category) qs.set('category', category);
    if (brand) qs.set('brand', brand);
    if (minPrice) qs.set('minPrice', minPrice);
    if (maxPrice) qs.set('maxPrice', maxPrice);
    if (search) qs.set('search', search);
    qs.set('sort', sort);
    qs.set('order', order);
    return qs.toString();
  }, [page, category, brand, minPrice, maxPrice, search, sort, order]);

  const { data, loading, error, refetch } = useFetch(`/product?${query}`, { deps: [query] });

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setParams(next);
  };

  const clearFilters = () => setParams({});

  const setPage = (p) => {
    const next = new URLSearchParams(params);
    next.set('page', p);
    setParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFilterCount = [category, brand, minPrice, maxPrice].filter(Boolean).length;

  return (
    <div className="container-app py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-accent-600 dark:text-accent-400">
          Catalog
        </span>
        <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {t('shop.title') || 'All Collections'}
        </h1>
        {data && (
          <p className="text-xs sm:text-sm font-medium text-zinc-500">
            {t('shop.results', { count: data.total ?? 0 }) || `Showing ${data.total ?? 0} premium items`}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        {/* Filters Sidebar */}
        <aside
          className={`lg:block ${
            filtersOpen
              ? 'fixed inset-0 z-[100] bg-white p-6 dark:bg-[#0A0B10] overflow-y-auto'
              : 'hidden'
          }`}
        >
          <div className="glass-card p-5 sm:p-6 sticky top-24 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-accent-500" />
                <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                  {t('shop.filters') || 'Filters'}
                </h3>
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-accent-600 dark:text-accent-400 hover:underline"
                >
                  Reset ({activeFilterCount})
                </button>
              )}
              <button onClick={() => setFiltersOpen(false)} className="btn-icon lg:hidden">
                <X size={18} />
              </button>
            </div>

            {/* Categories */}
            <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-5">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
                {t('nav.categories') || 'Categories'}
              </h4>
              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pe-1">
                <button
                  onClick={() => updateParam('category', '')}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    !category
                      ? 'bg-accent-500/15 text-accent-700 dark:text-accent-300 font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>{t('home.viewAll') || 'All Categories'}</span>
                  {!category && <Check size={14} className="text-accent-500" />}
                </button>
                {(categories?.docs || []).map((c) => {
                  const isSel = category === c._id;
                  return (
                    <button
                      key={c._id}
                      onClick={() => updateParam('category', c._id)}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                        isSel
                          ? 'bg-accent-500/15 text-accent-700 dark:text-accent-300 font-bold'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <span>{c.name}</span>
                      {isSel && <Check size={14} className="text-accent-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brands */}
            <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-5">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
                {t('nav.brands') || 'Brands'}
              </h4>
              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pe-1">
                {(brands?.docs || []).map((b) => {
                  const isSel = brand === b._id;
                  return (
                    <button
                      key={b._id}
                      onClick={() => updateParam('brand', isSel ? '' : b._id)}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                        isSel
                          ? 'bg-accent-500/15 text-accent-700 dark:text-accent-300 font-bold'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <span>{b.name}</span>
                      {isSel && <Check size={14} className="text-accent-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-5">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
                {t('shop.priceRange') || 'Price Range ($)'}
              </h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder={t('shop.min') || 'Min'}
                  value={priceDraft.min}
                  onChange={(e) => setPriceDraft((d) => ({ ...d, min: e.target.value }))}
                  className="input py-2 text-xs rounded-xl"
                />
                <span className="text-zinc-400 font-bold">–</span>
                <input
                  type="number"
                  min="0"
                  placeholder={t('shop.max') || 'Max'}
                  value={priceDraft.max}
                  onChange={(e) => setPriceDraft((d) => ({ ...d, max: e.target.value }))}
                  className="input py-2 text-xs rounded-xl"
                />
              </div>
              <button
                onClick={() => {
                  const next = new URLSearchParams(params);
                  if (priceDraft.min) next.set('minPrice', priceDraft.min);
                  else next.delete('minPrice');
                  if (priceDraft.max) next.set('maxPrice', priceDraft.max);
                  else next.delete('maxPrice');
                  next.set('page', '1');
                  setParams(next);
                }}
                className="btn-outline mt-3 w-full py-2 text-xs font-bold rounded-xl"
              >
                {t('shop.apply') || 'Apply Range'}
              </button>
            </div>
          </div>
        </aside>

        {/* Results Area */}
        <div>
          {/* Top Filter and Sort Controls */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setFiltersOpen(true)}
              className="btn-outline gap-2 py-2 px-4 text-xs font-bold lg:hidden rounded-full shadow-sm"
            >
              <SlidersHorizontal size={14} />
              <span>
                {t('shop.filters') || 'Filters'} {activeFilterCount > 0 && `(${activeFilterCount})`}
              </span>
            </button>

            <div className="ms-auto flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-400 hidden sm:inline">Sort:</span>
              <select
                value={`${sort}:${order}`}
                onChange={(e) => {
                  const [s, o] = e.target.value.split(':');
                  const next = new URLSearchParams(params);
                  next.set('sort', s);
                  next.set('order', o);
                  setParams(next);
                }}
                className="input py-2 px-3 text-xs font-semibold w-auto rounded-full cursor-pointer shadow-sm"
              >
                <option value="createdAt:desc">{t('shop.sortNewest') || 'Newest Arrivals'}</option>
                <option value="price:asc">{t('shop.sortPriceAsc') || 'Price: Low to High'}</option>
                <option value="price:desc">{t('shop.sortPriceDesc') || 'Price: High to Low'}</option>
                <option value="ratingsAverage:desc">{t('shop.sortRating') || 'Highest Rated'}</option>
              </select>
            </div>
          </div>

          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : error ? (
            <ErrorState onRetry={refetch} />
          ) : !data?.docs?.length ? (
            <EmptyState title={t('shop.noResults') || 'No items found'} body={t('shop.noResultsBody') || 'Try adjusting your filters or search keywords.'} />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
                {data.docs.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
              <Pagination page={data.currentPage || page} pages={data.pages} onChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

