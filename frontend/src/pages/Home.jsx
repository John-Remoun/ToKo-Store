import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Truck,
  ShieldCheck,
  RefreshCw,
  Gem,
  ArrowRight,
  Sparkles,
  Star,
  Zap,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import useFetch from '../hooks/useFetch';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/ui/Skeletons';
import { ErrorState } from '../components/ui/States';
import { useState } from 'react';
import toast from 'react-hot-toast';

const HERO_BG = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1800&q=85';

function Perk({ icon: Icon, title, body, tone = 'accent' }) {
  return (
    <div className="glass-card flex flex-col items-center gap-4 p-6 sm:p-7 text-center group hover:-translate-y-1.5 transition-all duration-300">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-600 dark:text-accent-400 group-hover:scale-110 group-hover:bg-accent-500 group-hover:text-white transition-all duration-300 shadow-sm">
        <Icon size={26} strokeWidth={2} />
      </div>
      <div>
        <h4 className="font-sans text-base font-bold text-zinc-900 dark:text-white tracking-tight">{title}</h4>
        <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const { data: featured, loading: loadingFeatured, error: errFeatured, refetch: refetchFeatured } = useFetch(
    '/product?limit=8&sort=ratingsAverage&order=desc',
  );
  const { data: newArrivals, loading: loadingNew } = useFetch('/product?limit=4&sort=createdAt&order=desc');
  const { data: categories } = useFetch('/category/tree');
  const { data: brands } = useFetch('/brand?limit=8');
  const [email, setEmail] = useState('');

  const onSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success((t('home.newsletterCta') || 'Subscribed') + ' ✓');
    setEmail('');
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Dynamic Ambient Hero */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-[#0A0B10] text-white">
        {/* Hero Background with Rich Lighting and Parallax Effect */}
        <img
          src={HERO_BG}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center opacity-40 scale-105 transition-transform duration-1000"
        />

        {/* Ambient Gradient Glow Orbs */}
        <div className="absolute top-1/4 start-1/4 h-96 w-96 rounded-full bg-accent-500/25 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 end-1/4 h-80 w-80 rounded-full bg-indigo-600/20 blur-[100px] pointer-events-none" />

        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B10] via-[#0A0B10]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0B10]/90 via-[#0A0B10]/50 to-transparent" />

        <div className="container-app relative z-10 py-20 lg:py-32">
          <div className="max-w-3xl">
            {/* Floating Live Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-md shadow-lg animate-fadeUp">
              <span className="flex h-2 w-2 rounded-full bg-accent-400 animate-ping" />
              <span className="text-accent-300 font-bold uppercase tracking-widest text-[10px]">
                {t('brand.tagline') || 'New Season Collection 2026'}
              </span>
            </div>

            {/* Main Headline with Gradient Highlights */}
            <h1
              className="mt-6 font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight animate-fadeUp text-white drop-shadow-sm"
              style={{ animationDelay: '100ms' }}
            >
              {t('home.heroTitle') || 'Redefining Luxury & Everyday Style.'}
            </h1>

            <p
              className="mt-6 max-w-xl text-base sm:text-lg text-zinc-300 font-sans leading-relaxed animate-fadeUp"
              style={{ animationDelay: '200ms' }}
            >
              {t('home.heroSubtitle') ||
                'Discover handpicked designer collections crafted with unparalleled quality, sustainable fabrics, and timeless aesthetics.'}
            </p>

            {/* CTAs */}
            <div
              className="mt-10 flex flex-wrap items-center gap-4 animate-fadeUp"
              style={{ animationDelay: '300ms' }}
            >
              <Link
                to="/shop"
                className="btn-accent px-8 py-4 text-sm font-bold tracking-wide shadow-glow hover:scale-105 transition-all"
              >
                <span>{t('home.shopNow') || 'Explore Collection'}</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/categories"
                className="btn border border-white/25 bg-white/10 px-7 py-4 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/20 hover:border-white/40 transition-all"
              >
                <Sparkles size={16} className="text-accent-300" />
                {t('home.exploreCollections') || 'View Categories'}
              </Link>
            </div>

            {/* Trust Stats Bar */}
            <div
              className="mt-14 grid grid-cols-3 gap-6 border-t border-white/15 pt-8 max-w-lg animate-fadeUp"
              style={{ animationDelay: '400ms' }}
            >
              <div>
                <p className="font-display text-2xl sm:text-3xl font-extrabold text-white">50k+</p>
                <p className="text-xs text-zinc-400 font-medium mt-0.5">Satisfied Clients</p>
              </div>
              <div>
                <p className="font-display text-2xl sm:text-3xl font-extrabold text-accent-400">4.9 ★</p>
                <p className="text-xs text-zinc-400 font-medium mt-0.5">Top Rated Store</p>
              </div>
              <div>
                <p className="font-display text-2xl sm:text-3xl font-extrabold text-white">100%</p>
                <p className="text-xs text-zinc-400 font-medium mt-0.5">Authentic Gear</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Perks Grid */}
      <section className="container-app">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          <Perk icon={Truck} title={t('home.perk1Title') || 'Fast Global Delivery'} body={t('home.perk1Body') || 'Free express shipping on orders over $150'} />
          <Perk icon={ShieldCheck} title={t('home.perk2Title') || '100% Authentic'} body={t('home.perk2Body') || 'Directly sourced from verified brands'} />
          <Perk icon={RefreshCw} title={t('home.perk3Title') || 'Hassle-Free Returns'} body={t('home.perk3Body') || '30-day effortless return guarantee'} />
          <Perk icon={Gem} title={t('home.perk4Title') || 'Premium Craftsmanship'} body={t('home.perk4Body') || 'Top-tier materials and fine finishes'} />
        </div>
      </section>

      {/* Categories Showcase */}
      {categories?.length > 0 && (
        <section className="container-app">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-accent-600 dark:text-accent-400">
                Collections
              </span>
              <h2 className="section-title mt-1">{t('home.shopByCategory') || 'Shop by Category'}</h2>
            </div>
            <Link
              to="/categories"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-accent-600 hover:text-accent-700 dark:text-accent-400 transition-colors"
            >
              <span>{t('home.viewAll') || 'View All'}</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.slice(0, 6).map((c) => (
              <Link
                key={c._id}
                to={`/shop?category=${c._id}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-3xl bg-zinc-100 dark:bg-zinc-800 shadow-card hover:shadow-premium transition-all duration-300"
              >
                <img
                  src={c.image || 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&q=80'}
                  alt={c.name}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                  <span className="font-display text-base font-bold text-white group-hover:text-accent-300 transition-colors">
                    {c.name}
                  </span>
                  <span className="text-[11px] font-semibold text-zinc-300/80">Explore →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="container-app">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent-600 dark:text-accent-400">
              Curated Picks
            </span>
            <h2 className="section-title mt-1">{t('home.featured') || 'Featured Products'}</h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-accent-600 hover:text-accent-700 dark:text-accent-400 transition-colors"
          >
            <span>{t('home.viewAll') || 'View All'}</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loadingFeatured ? (
          <ProductGridSkeleton />
        ) : errFeatured ? (
          <ErrorState onRetry={refetchFeatured} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            {(featured?.docs || []).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* New Arrivals Banner Section */}
      <section className="relative overflow-hidden py-16 bg-zinc-100/70 dark:bg-zinc-900/40 border-y border-zinc-200/60 dark:border-zinc-800/60">
        <div className="container-app">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-accent-600 dark:text-accent-400">
                Fresh Drops
              </span>
              <h2 className="section-title mt-1">{t('home.newArrivals') || 'New Arrivals'}</h2>
            </div>
            <Link
              to="/shop?sort=createdAt&order=desc"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-accent-600 hover:text-accent-700 dark:text-accent-400 transition-colors"
            >
              <span>{t('home.viewAll') || 'View All'}</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {loadingNew ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
              {(newArrivals?.docs || []).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Brands Showcase */}
      {brands?.docs?.length > 0 && (
        <section className="container-app">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Trusted Partnerships
            </span>
            <h2 className="section-title mt-1">{t('home.shopByBrand') || 'Curated Brands'}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 items-center justify-center">
            {brands.docs.map((b) => (
              <Link
                key={b._id}
                to={`/shop?brand=${b._id}`}
                className="glass-card flex h-24 items-center justify-center p-4 hover:scale-105 transition-all text-center"
              >
                {b.logo ? (
                  <img src={b.logo} alt={b.name} className="h-8 max-w-full object-contain grayscale hover:grayscale-0 transition-all" />
                ) : (
                  <span className="font-display text-sm font-bold text-zinc-700 dark:text-zinc-300">{b.name}</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Luxury Newsletter Card */}
      <section className="container-app pb-10">
        <div className="relative overflow-hidden rounded-3xl bg-zinc-950 p-8 sm:p-14 text-white shadow-premium">
          {/* Ambient Glows */}
          <div className="absolute top-0 end-0 h-80 w-80 rounded-full bg-accent-500/20 blur-[90px] pointer-events-none" />
          <div className="absolute bottom-0 start-0 h-64 w-64 rounded-full bg-indigo-600/15 blur-[80px] pointer-events-none" />

          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-bold uppercase tracking-wider text-accent-300">
              <Zap size={14} /> VIP Access
            </div>
            <h2 className="mt-4 font-display text-3xl sm:text-5xl font-bold tracking-tight">
              {t('home.newsletterTitle') || 'Unlock 15% Off Your First Order'}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-zinc-300 leading-relaxed font-sans">
              {t('home.newsletterBody') ||
                'Subscribe to get exclusive early access to limited edition drops, secret sales, and seasonal lookbooks.'}
            </p>

            <form onSubmit={onSubscribe} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="input py-3.5 px-5 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-zinc-400 focus:border-accent-400 focus:bg-white/15"
              />
              <button className="btn-accent py-3.5 px-7 rounded-2xl font-bold shrink-0 shadow-glow">
                {t('home.newsletterCta') || 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

