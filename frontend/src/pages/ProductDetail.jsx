import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Minus, Plus, ShoppingBag, Star, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useFetch from '../hooks/useFetch';
import api, { apiError } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Price, Rating, Badge, Pagination } from '../components/ui/Atoms';
import { SkeletonBlock } from '../components/ui/Skeletons';
import { ErrorState, PageLoader } from '../components/ui/States';
import ProductCard from '../components/ProductCard';
import { useNavigate } from 'react-router-dom';

function ReviewForm({ productId, existing, onDone }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(existing?.rating || 5);
  const [comment, setComment] = useState(existing?.comment || '');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (existing) {
        await api.patch(`/reviews/${existing._id}`, { rating, comment });
      } else {
        await api.post('/reviews', { productId, rating, comment });
      }
      toast.success(t('common.success'));
      onDone();
    } catch (e2) {
      toast.error(apiError(e2, t('product.reviewFormHint')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="card p-5">
      <p className="label">{t('product.yourRating')}</p>
      <div className="mb-4 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} onClick={() => setRating(n)}>
            <Star size={22} className={n <= rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-600'} />
          </button>
        ))}
      </div>
      <p className="label">{t('product.comment')}</p>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="input" maxLength={2000} />
      <button disabled={submitting} className="btn-primary mt-4 py-2.5 text-sm">{t('product.submit')}</button>
    </form>
  );
}

function Reviews({ productId }) {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const { data, loading, refetch } = useFetch(`/reviews/product/${productId}?page=${page}&limit=5`, { deps: [productId, page] });

  const myReview = data?.docs?.find((r) => r.user?._id === user?._id);

  const remove = async (id) => {
    try {
      await api.delete(`/reviews/${id}`);
      toast.success(t('common.success'));
      refetch();
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold">{t('product.reviews')} {data && `(${data.total})`}</h2>
        {isAuthenticated && !myReview && (
          <button onClick={() => setShowForm((s) => !s)} className="btn-outline py-2 text-sm">{t('product.writeReview')}</button>
        )}
      </div>

      {isAuthenticated && !myReview && showForm && (
        <div className="mb-6">
          <p className="mb-2 text-xs text-zinc-400">{t('product.reviewFormHint')}</p>
          <ReviewForm productId={productId} onDone={() => { setShowForm(false); refetch(); }} />
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <SkeletonBlock key={i} className="h-24 w-full" />)}
        </div>
      ) : !data?.docs?.length ? (
        <p className="text-sm text-zinc-500">{t('product.noReviews')}</p>
      ) : (
        <div className="space-y-5">
          {data.docs.map((r) => (
            <div key={r._id} className="border-b border-zinc-100 pb-5 dark:border-zinc-800">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {r.user?.profilePicture ? (
                    <img src={r.user.profilePicture} className="h-9 w-9 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold dark:bg-zinc-700">
                      {r.user?.firstName?.[0]}{r.user?.lastName?.[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">{r.user?.firstName} {r.user?.lastName}</p>
                    <Rating value={r.rating} size={12} />
                  </div>
                </div>
                {r.user?._id === user?._id && (
                  <div className="flex gap-2">
                    <button onClick={() => setShowForm(true)} className="text-zinc-400 hover:text-accent-600"><Pencil size={14} /></button>
                    <button onClick={() => remove(r._id)} className="text-zinc-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
              {r.comment && <p className="mt-2.5 text-sm text-zinc-600 dark:text-zinc-300">{r.comment}</p>}
            </div>
          ))}
          {myReview && showForm && (
            <ReviewForm productId={productId} existing={myReview} onDone={() => { setShowForm(false); refetch(); }} />
          )}
          <Pagination page={data.currentPage} pages={data.pages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}

export default function ProductDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, loading, error, refetch } = useFetch(`/product/${id}`, { deps: [id] });
  const { isAuthenticated } = useAuth();
  const { addItem, busy } = useCart();
  const { ids, toggle } = useWishlist();
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);

  const categoryId = typeof product?.category === 'object' ? product?.category?._id : product?.category;
  const { data: related } = useFetch(categoryId ? `/product?category=${categoryId}&limit=4` : null, { deps: [categoryId], skip: !categoryId });

  if (loading) return <PageLoader />;
  if (error || !product) return <ErrorState onRetry={refetch} />;

  const images = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=80'];
  const isWished = ids.has(product._id);
  const outOfStock = product.stock <= 0;
  const categoryName = typeof product.category === 'object' ? product.category?.name : null;
  const brandName = typeof product.brand === 'object' ? product.brand?.name : null;

  const onAdd = () => {
    if (!isAuthenticated) {
      toast.error(t('cart.loginRequired'));
      return navigate('/login');
    }
    addItem(product._id, qty);
  };

  const onWishlist = () => {
    if (!isAuthenticated) return navigate('/login');
    toggle(product._id);
  };

  return (
    <div className="container-app py-10 sm:py-14">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="glass-card aspect-square w-full overflow-hidden rounded-3xl p-2 sm:p-3 bg-zinc-100/80 dark:bg-zinc-900/80">
            <img
              src={images[activeImg]}
              alt={product.title}
              className="h-full w-full object-cover rounded-2xl transition-all duration-500"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all cursor-pointer ${
                    activeImg === i
                      ? 'border-accent-500 ring-4 ring-accent-500/20 scale-105'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between space-y-6">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent-600 dark:text-accent-400">
              {brandName && <span>{brandName}</span>}
              {categoryName && <span>· {categoryName}</span>}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight">
              {product.title}
            </h1>

            <div className="mt-4 flex items-center gap-4">
              <Rating value={product.ratingsAverage} count={product.ratingsCount} size={16} />
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <div>
                {outOfStock ? (
                  <Badge tone="danger">{t('product.outOfStock') || 'Out of Stock'}</Badge>
                ) : product.lowStockThreshold && product.stock <= product.lowStockThreshold ? (
                  <Badge tone="warning">{t('product.lowStock', { count: product.stock }) || `Only ${product.stock} left`}</Badge>
                ) : (
                  <Badge tone="success">{t('product.inStock') || 'In Stock & Ready'}</Badge>
                )}
              </div>
            </div>

            <div className="mt-6 border-y border-zinc-100 dark:border-zinc-800/80 py-5">
              <Price price={product.price} discountPrice={product.discountPrice} size="lg" />
            </div>

            <p className="mt-6 whitespace-pre-line text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-300 font-sans">
              {product.description}
            </p>
          </div>

          {/* Action Row */}
          <div className="space-y-4 pt-6">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Stepper */}
              <div className="flex items-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-1 shadow-sm">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="btn-icon h-9 w-9 min-h-[36px] min-w-[36px]"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-sm font-bold text-zinc-900 dark:text-white">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="btn-icon h-9 w-9 min-h-[36px] min-w-[36px]"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={onAdd}
                disabled={outOfStock || busy}
                className="btn-primary flex-1 gap-2 py-4 text-sm font-bold shadow-glow"
              >
                <ShoppingBag size={18} />
                <span>{t('product.addToCart') || 'Add to Bag'}</span>
              </button>

              {/* Wishlist Button */}
              <button
                onClick={onWishlist}
                className={`btn-icon h-12 w-12 min-h-[48px] min-w-[48px] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm ${
                  isWished ? 'text-rose-500' : 'text-zinc-600 dark:text-zinc-300'
                }`}
                aria-label="Wishlist"
              >
                <Heart size={20} className={isWished ? 'fill-rose-500' : ''} />
              </button>
            </div>

            <div className="flex items-center gap-6 text-xs text-zinc-400 pt-2 font-medium">
              <div>
                <span className="text-zinc-500 uppercase font-bold tracking-wider">{t('product.sku') || 'SKU'}:</span> {product.sku || 'N/A'}
              </div>
              <div>
                <span className="text-zinc-500 uppercase font-bold tracking-wider">Fast Shipping:</span> 2-4 business days
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-20 max-w-3xl border-t border-zinc-100 dark:border-zinc-800/80 pt-12">
        <Reviews productId={product._id} />
      </div>

      {/* Related Products */}
      {related?.docs?.length > 1 && (
        <div className="mt-20 border-t border-zinc-100 dark:border-zinc-800/80 pt-12">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-accent-600 dark:text-accent-400">
              Recommendations
            </span>
            <h2 className="section-title mt-1">{t('product.relatedProducts') || 'You May Also Like'}</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            {related.docs
              .filter((p) => p._id !== product._id)
              .slice(0, 4)
              .map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

