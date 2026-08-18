import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { EmptyState } from '../components/ui/States';
import { ProductGridSkeleton } from '../components/ui/Skeletons';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const { t } = useTranslation();
  const { items, loading } = useWishlist();

  return (
    <div className="container-app py-8 sm:py-12">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-accent-600 dark:text-accent-400">
          Your Collection
        </span>
        <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
          {t('wishlist.title') || 'Wishlist'}
          {items.length > 0 && (
            <span className="text-zinc-400 font-sans text-xl font-normal ml-3">({items.length} items)</span>
          )}
        </h1>
      </div>

      {loading ? (
        <ProductGridSkeleton />
      ) : !items.length ? (
        <EmptyState
          icon={Heart}
          title={t('wishlist.empty') || 'Your wishlist is empty'}
          body={t('wishlist.emptyBody') || 'Save your favorite items here to find them easily later.'}
          action={
            <Link to="/shop" className="btn-primary gap-2">
              {t('cart.continueShopping') || 'Browse Collections'}
              <ArrowRight size={16} />
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}

