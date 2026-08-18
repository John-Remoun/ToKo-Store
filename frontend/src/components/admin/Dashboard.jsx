import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Users,
  DollarSign,
  ShoppingCart,
  Heart,
  Plus,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import api from '../../lib/api';
import { LineSkeleton } from '../ui/Skeletons';
import { Badge } from '../ui/Atoms';

function StatCard({ icon: Icon, label, value, subtext, loading, to, alert, tone = 'primary' }) {
  const tones = {
    primary: 'bg-accent-50 text-accent-600 dark:bg-accent-950/40 dark:text-accent-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400',
  };

  const card = (
    <div
      className={`glass-card p-5 transition-all duration-300 hover:shadow-soft group ${
        alert
          ? 'border-rose-200 bg-rose-50/50 dark:border-rose-900/40 dark:bg-rose-950/20'
          : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-transform group-hover:scale-105 shrink-0 ${
              alert ? tones.rose : tones[tone] || tones.primary
            }`}
          >
            <Icon size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
              {label}
            </p>
            {loading ? (
              <LineSkeleton className="mt-1 h-6 w-16" />
            ) : (
              <p
                className={`font-display text-2xl font-bold tracking-tight text-zinc-900 dark:text-white ${
                  alert ? 'text-rose-600 dark:text-rose-400' : ''
                }`}
              >
                {value ?? 0}
              </p>
            )}
          </div>
        </div>
        {to && (
          <ArrowRight
            size={16}
            className="text-zinc-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all dark:text-zinc-600"
          />
        )}
      </div>
      {subtext && (
        <p className="mt-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/80 pt-2.5">
          {subtext}
        </p>
      )}
    </div>
  );

  return to ? <Link to={to}>{card}</Link> : card;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [bestSellers, setBestSellers] = useState([]);
  const [cartWishlist, setCartWishlist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/dashboard/best-sellers'),
      api.get('/dashboard/cart-wishlist-analytics'),
    ])
      .then(([statsRes, bestRes, cwRes]) => {
        setStats(statsRes.data?.data || statsRes.data);
        setBestSellers(bestRes.data?.data || bestRes.data || []);
        setCartWishlist(cwRes.data?.data || cwRes.data || null);
      })
      .catch((err) => {
        console.error('Failed to load dashboard data:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-accent-600 dark:text-accent-400">
            Store Overview
          </span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mt-0.5">
            {t('admin.dashboard') || 'Dashboard'}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time analytics, user cart activities, customer wishlists, and inventory status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/products"
            className="btn-primary gap-2 text-xs font-bold py-2.5 px-4 shadow-glow"
          >
            <Plus size={15} /> Add Product
          </Link>
          <Link
            to="/admin/users"
            className="btn-outline gap-2 text-xs font-bold py-2.5 px-4 rounded-xl"
          >
            <Users size={15} /> Manage Users
          </Link>
        </div>
      </div>

      {/* Row 1: Core Financial & User Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={stats ? `$${stats.revenue?.toFixed(2)}` : null}
          subtext={`${stats?.totalSales ?? 0} paid transactions`}
          loading={loading}
          tone="emerald"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Orders"
          value={stats?.totalOrders}
          subtext={`${stats?.totalProductsSold ?? 0} items fulfilled`}
          loading={loading}
          to="/admin/orders"
          tone="indigo"
        />
        <StatCard
          icon={ShoppingCart}
          label="Active In-Cart Items"
          value={stats?.totalCartItems}
          subtext={`${stats?.totalActiveCarts ?? 0} active user carts ($${(stats?.totalCartValue ?? 0).toFixed(2)})`}
          loading={loading}
          tone="primary"
        />
        <StatCard
          icon={Heart}
          label="Saved in Wishlists"
          value={stats?.totalWishlistItems}
          subtext={`${stats?.totalUsersWithWishlist ?? 0} customers saving items`}
          loading={loading}
          tone="rose"
        />
      </div>

      {/* Row 2: Inventory Breakdown */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={Package}
          label="Total Inventory"
          value={stats?.currentInventory}
          loading={loading}
          to="/admin/products"
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats?.totalUsers}
          loading={loading}
          to="/admin/users"
          tone="indigo"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock Warning"
          value={stats?.lowStockCount}
          loading={loading}
          alert={stats?.lowStockCount > 0}
          to="/admin/products"
          subtext="Items need restocking"
        />
        <StatCard
          icon={AlertTriangle}
          label="Out of Stock"
          value={stats?.outOfStockCount}
          loading={loading}
          alert={stats?.outOfStockCount > 0}
          to="/admin/products"
          subtext="Sold out items"
        />
      </div>

      {/* Row 3: Live Cart Activity & Customer Wishlists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Most Added to Cart */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center text-accent-600 dark:text-accent-400">
                <ShoppingCart size={16} />
              </div>
              <h3 className="font-display text-base font-bold text-zinc-900 dark:text-white">
                Top Items Currently in User Carts
              </h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-950/40 px-2.5 py-1 rounded-full">
              Live Pipeline
            </span>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="py-3 flex items-center justify-between">
                  <LineSkeleton className="h-4 w-32" />
                  <LineSkeleton className="h-4 w-12" />
                </div>
              ))
            ) : cartWishlist?.topInCarts?.length ? (
              cartWishlist.topInCarts.map((item) => (
                <div
                  key={item._id}
                  className="py-3 flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        item.images?.[0] ||
                        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&q=80'
                      }
                      alt=""
                      className="h-10 w-10 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-white line-clamp-1 max-w-[200px]">
                        {item.title}
                      </p>
                      <p className="text-xs text-zinc-400 font-mono">
                        ${item.price?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-end shrink-0">
                    <span className="font-display font-bold text-accent-600 dark:text-accent-400">
                      {item.totalQuantity} units
                    </span>
                    <p className="text-[10px] text-zinc-400">in {item.cartCount} carts</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-zinc-400">
                No active cart sessions at the moment.
              </p>
            )}
          </div>
        </div>

        {/* Most Wishlisted Products */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Heart size={16} />
              </div>
              <h3 className="font-display text-base font-bold text-zinc-900 dark:text-white">
                Most Desired (Customer Wishlists)
              </h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-full">
              Demand Signal
            </span>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="py-3 flex items-center justify-between">
                  <LineSkeleton className="h-4 w-32" />
                  <LineSkeleton className="h-4 w-12" />
                </div>
              ))
            ) : cartWishlist?.topWishlisted?.length ? (
              cartWishlist.topWishlisted.map((item) => (
                <div
                  key={item._id}
                  className="py-3 flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        item.images?.[0] ||
                        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&q=80'
                      }
                      alt=""
                      className="h-10 w-10 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-white line-clamp-1 max-w-[200px]">
                        {item.title}
                      </p>
                      <p className="text-xs text-zinc-400 font-mono">
                        ${item.price?.toFixed(2)} · {item.stock} in stock
                      </p>
                    </div>
                  </div>
                  <div className="text-end shrink-0">
                    <span className="font-display font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 justify-end">
                      <Heart size={13} className="fill-rose-500 text-rose-500" />
                      {item.count}
                    </span>
                    <p className="text-[10px] text-zinc-400">wishlist saves</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-zinc-400">
                No items saved to customer wishlists yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Row 4: Best Sellers Chart & Active Carts List */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sales Chart */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-base font-bold text-zinc-900 dark:text-white">
              Best Selling Products
            </h3>
            <span className="text-xs text-zinc-400">Volume Sold</span>
          </div>

          <div className="h-64">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <LineSkeleton className="w-full h-full rounded-2xl" />
              </div>
            ) : bestSellers.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bestSellers}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f4625" />
                  <XAxis
                    dataKey="title"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(15, 17, 23, 0.95)',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="totalSold"
                    fill="rgb(99, 102, 241)"
                    radius={[6, 6, 0, 0]}
                    barSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-zinc-400">
                No completed sales recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Live Active Customer Carts */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              Live Active Customer Carts
            </h3>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-accent-600 hover:text-accent-700 transition-colors"
            >
              View Orders →
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <LineSkeleton key={i} className="h-12 w-full rounded-xl" />
              ))
            ) : cartWishlist?.liveCarts?.length ? (
              cartWishlist.liveCarts.map((cart) => (
                <div
                  key={cart._id}
                  className="rounded-2xl border border-zinc-100 dark:border-zinc-800/80 p-3.5 flex items-center justify-between gap-3 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors"
                >
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-white">
                      {cart.user?.firstName
                        ? `${cart.user.firstName} ${cart.user.lastName}`
                        : 'Customer Cart'}
                    </p>
                    <p className="text-[11px] text-zinc-400">{cart.user?.email || 'Active session'}</p>
                  </div>
                  <div className="text-end">
                    <span className="font-display text-sm font-extrabold text-accent-600 dark:text-accent-400">
                      ${(cart.total || cart.subtotal || 0).toFixed(2)}
                    </span>
                    <p className="text-[10px] font-semibold text-zinc-400">
                      {cart.items?.length || 0} item(s)
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-xs text-zinc-400">
                No active carts with items right now.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
