import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Price, Rating, Badge } from './ui/Atoms';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { ids, toggle } = useWishlist();
  const { addItem, busy } = useCart();
  const navigate = useNavigate();
  const isWished = ids.has(product._id);
  const outOfStock = product.stock <= 0;

  const onWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return navigate('/login');
    toggle(product._id);
  };

  const onAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error(t('cart.loginRequired') || 'Please login first');
      return navigate('/login');
    }
    if (!outOfStock) addItem(product._id, 1);
  };

  return (
    <Link
      to={`/product/${product._id}`}
      className="group relative flex flex-col rounded-3xl bg-white/70 dark:bg-zinc-900/70 p-3 sm:p-3.5 border border-zinc-200/70 dark:border-zinc-800/70 backdrop-blur-md shadow-card hover:shadow-premium hover:border-accent-500/30 transition-all duration-300 animate-fadeUp"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800/80">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {product.images?.[1] && (
          <img
            src={product.images[1]}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        {/* Gradient shadow overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges (Discount / Stock) */}
        <div className="absolute start-2.5 top-2.5 flex flex-col gap-1 z-10">
          {product.discountPrice != null && product.discountPrice < product.price && (
            <Badge tone="danger" className="shadow-sm">
              -{Math.round((1 - product.discountPrice / product.price) * 100)}%
            </Badge>
          )}
          {outOfStock && (
            <Badge tone="default" className="bg-zinc-900/80 text-white dark:bg-zinc-800/90 shadow-sm">
              {t('product.outOfStock') || 'Sold Out'}
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={onWishlist}
          className={`absolute end-2.5 top-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md shadow-sm transition-all duration-200 active:scale-90 ${
            isWished
              ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/80 dark:text-rose-400 opacity-100'
              : 'bg-white/85 dark:bg-zinc-900/85 text-zinc-600 dark:text-zinc-300 opacity-0 group-hover:opacity-100 hover:text-rose-500 hover:scale-110'
          }`}
          aria-label="Wishlist"
        >
          <Heart size={16} className={isWished ? 'fill-rose-500 text-rose-500' : ''} />
        </button>

        {/* Quick Add Action Overlay */}
        <div className="absolute inset-x-2.5 bottom-2.5 z-10 translate-y-12 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <button
            onClick={onAdd}
            disabled={outOfStock || busy}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950/90 dark:bg-white/95 text-white dark:text-zinc-950 py-2.5 text-xs font-bold shadow-premium backdrop-blur-md hover:bg-accent-600 dark:hover:bg-accent-500 dark:hover:text-white transition-all disabled:opacity-40"
          >
            <ShoppingBag size={14} />
            <span>{outOfStock ? t('product.outOfStock') || 'Out of Stock' : t('product.addToCart') || 'Quick Add'}</span>
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="mt-3 flex flex-1 flex-col justify-between px-1">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent-600 dark:text-accent-400 mb-0.5">
            {typeof product.brand === 'object' ? product.brand?.name : typeof product.category === 'object' ? product.category?.name : 'Collection'}
          </p>
          <h3 className="line-clamp-1 font-sans text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-accent-600 transition-colors">
            {product.title}
          </h3>
        </div>

        <div className="mt-2.5 flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
          <Price price={product.price} discountPrice={product.discountPrice} size="sm" />
          <Rating value={product.ratingsAverage} size={12} />
        </div>
      </div>
    </Link>
  );
}

