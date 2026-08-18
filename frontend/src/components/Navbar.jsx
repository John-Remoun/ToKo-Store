import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  LayoutDashboard,
  Package,
  LogOut,
  Bell,
  Sparkles,
  Compass,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { items: wishItems } = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState('');
  const accRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e) => accRef.current && !accRef.current.contains(e.target) && setAccountOpen(false);
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const onSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const navLinks = [
    { to: '/', label: t('nav.home') || 'Home', icon: Compass },
    { to: '/shop', label: t('nav.shop') || 'Shop', icon: Sparkles },
    { to: '/categories', label: t('nav.categories') || 'Categories', icon: Layers },
    { to: '/brands', label: t('nav.brands') || 'Brands', icon: ShieldCheck },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 shadow-premium backdrop-blur-xl dark:bg-[#090A0F]/85 border-b border-zinc-200/60 dark:border-zinc-800/60'
          : 'bg-white/95 backdrop-blur-md dark:bg-[#090A0F]/95 border-b border-zinc-100 dark:border-zinc-900'
      }`}
    >
      {/* Top Accent Ribbon */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-accent-500 to-transparent opacity-80" />

      <div className="container-app flex h-16 items-center justify-between gap-3 lg:h-20 sm:gap-6">
        {/* Mobile Menu Button & Brand */}
        <div className="flex items-center gap-3">
          <button
            className="btn-icon bg-zinc-100/80 dark:bg-zinc-800/80 lg:hidden text-zinc-800 dark:text-zinc-200"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <Link to="/" className="shrink-0 transition-transform active:scale-95">
            <Logo withWordmark className="h-9 w-9 sm:h-10 sm:w-10" />
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1.5 lg:flex">
          {navLinks.map((l) => {
            const isActive = location.pathname === l.to;
            return (
              <NavLink
                key={l.to}
                to={l.to}
                className={`relative px-4 py-2 text-sm font-semibold tracking-wide transition-all rounded-full ${
                  isActive
                    ? 'text-accent-600 dark:text-accent-400 bg-accent-500/10'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white hover:bg-zinc-100/70 dark:hover:bg-zinc-800/70'
                }`}
              >
                {l.label}
              </NavLink>
            );
          })}

          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold tracking-wide rounded-full bg-gradient-to-r from-accent-600 to-indigo-600 text-white shadow-glow hover:opacity-95 transition-all"
            >
              <LayoutDashboard size={14} />
              <span>Admin Dashboard</span>
            </Link>
          )}
        </nav>

        {/* Search Bar */}
        <form onSubmit={onSearch} className="hidden max-w-xs xl:max-w-sm flex-1 items-center md:flex">
          <div className="relative w-full">
            <Search size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('nav.search') || 'Search products, brands...'}
              className="input ps-10 pe-9 py-2 text-xs rounded-full bg-zinc-100/80 dark:bg-zinc-800/70 border-transparent focus:border-accent-500 focus:bg-white dark:focus:bg-zinc-900 transition-all shadow-inner"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </form>

        {/* Actions (Theme, Language, Notifications, Wishlist, Cart, Profile) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeSwitcher />
          <LanguageSwitcher compact />

          {/* Notifications */}
          {isAuthenticated && (
            <Link
              to="/notifications"
              className="btn-icon bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 hidden sm:inline-flex text-zinc-700 dark:text-zinc-200"
              aria-label={t('nav.notifications') || 'Notifications'}
              title="Notifications"
            >
              <Bell size={18} />
            </Link>
          )}

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="btn-icon bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 relative hidden sm:inline-flex text-zinc-700 dark:text-zinc-200"
            aria-label={t('nav.wishlist') || 'Wishlist'}
            title="Wishlist"
          >
            <Heart size={18} className={wishItems.length > 0 ? 'text-rose-500 fill-rose-500/20' : ''} />
            {wishItems.length > 0 && (
              <span className="absolute -top-1 -end-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white shadow-sm ring-2 ring-white dark:ring-zinc-950 animate-scaleIn">
                {wishItems.length}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="btn-icon bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 relative text-zinc-700 dark:text-zinc-200"
            aria-label={t('nav.cart') || 'Cart'}
            title="Shopping Cart"
          >
            <ShoppingBag size={18} className={itemCount > 0 ? 'text-accent-500' : ''} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -end-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-accent-600 text-[9px] font-extrabold text-white shadow-sm ring-2 ring-white dark:ring-zinc-950 animate-scaleIn">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Account Menu */}
          <div className="relative ms-1" ref={accRef}>
            <button
              onClick={() => setAccountOpen((o) => !o)}
              className="btn-icon overflow-hidden ring-2 ring-transparent hover:ring-accent-500/40 transition-all"
              aria-label="Account"
            >
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="" className="h-full w-full object-cover" />
              ) : isAuthenticated ? (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-accent-600 to-accent-400 text-xs font-bold text-white uppercase">
                  {user?.firstName?.[0] || 'U'}
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  <User size={18} />
                </div>
              )}
            </button>

            {accountOpen && (
              <div className="absolute end-0 z-50 mt-2.5 w-60 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/95 p-1.5 shadow-premium backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/95 animate-scaleIn">
                {isAuthenticated ? (
                  <>
                    <div className="border-b border-zinc-100 px-3.5 py-3 dark:border-zinc-800/80">
                      <p className="truncate text-sm font-bold text-zinc-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="truncate text-xs text-zinc-400">{user.email}</p>
                      {isAdmin && (
                        <span className="mt-1.5 inline-block text-[10px] font-bold uppercase tracking-wider bg-accent-500/15 text-accent-700 dark:text-accent-300 px-2 py-0.5 rounded-md">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="py-1 space-y-0.5">
                      <Link
                        to="/profile"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
                      >
                        <User size={15} className="text-zinc-400" /> {t('nav.profile') || 'My Profile'}
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
                      >
                        <Package size={15} className="text-zinc-400" /> {t('nav.orders') || 'My Orders'}
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-accent-600 hover:bg-accent-500/10 dark:text-accent-400"
                        >
                          <LayoutDashboard size={15} /> {t('nav.admin') || 'Admin Dashboard'}
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-zinc-100 pt-1 dark:border-zinc-800/80">
                      <button
                        onClick={() => {
                          setAccountOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <LogOut size={15} /> {t('nav.logout') || 'Sign Out'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 p-2">
                    <Link
                      to="/login"
                      onClick={() => setAccountOpen(false)}
                      className="btn-primary w-full py-2.5 text-xs font-bold"
                    >
                      {t('nav.login') || 'Sign In'}
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setAccountOpen(false)}
                      className="btn-outline w-full py-2.5 text-xs font-bold"
                    >
                      {t('nav.register') || 'Create Account'}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 start-0 flex w-80 max-w-[85vw] flex-col bg-white dark:bg-[#0D0E15] p-6 shadow-premium animate-scaleIn border-e border-zinc-200/80 dark:border-zinc-800/80">
            <div className="mb-6 flex items-center justify-between">
              <Logo withWordmark className="h-9 w-9" />
              <button
                onClick={() => setMobileOpen(false)}
                className="btn-icon bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mobile Search */}
            <form
              onSubmit={(e) => {
                onSearch(e);
                setMobileOpen(false);
              }}
              className="mb-6"
            >
              <div className="relative">
                <Search size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('nav.search') || 'Search...'}
                  className="input ps-10 py-2.5 text-sm rounded-full bg-zinc-100/80 dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800"
                />
              </div>
            </form>

            {/* Mobile Nav Links */}
            <nav className="flex flex-col gap-1.5">
              {navLinks.map((l) => {
                const isActive = location.pathname === l.to;
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-accent-500/15 text-accent-700 dark:text-accent-300 font-bold'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <l.icon size={18} className={isActive ? 'text-accent-600 dark:text-accent-400' : 'text-zinc-400'} />
                      {l.label}
                    </span>
                    <ChevronRight size={16} className="text-zinc-400 opacity-60" />
                  </Link>
                );
              })}

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold bg-accent-500/10 text-accent-600 dark:text-accent-400"
                >
                  <span className="flex items-center gap-3">
                    <LayoutDashboard size={18} className="text-accent-600 dark:text-accent-400" />
                    Admin Dashboard
                  </span>
                  <ChevronRight size={16} className="text-accent-500" />
                </Link>
              )}
            </nav>

            {/* Mobile Footer Area */}
            <div className="mt-auto border-t border-zinc-100 dark:border-zinc-800/80 pt-6">
              {!isAuthenticated ? (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="btn-primary w-full py-3 text-sm font-bold"
                  >
                    {t('nav.login') || 'Sign In'}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="btn-outline w-full py-3 text-sm font-bold"
                  >
                    {t('nav.register') || 'Create Account'}
                  </Link>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-500/20 text-accent-600 font-bold">
                      {user.firstName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-zinc-400">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                    }}
                    className="btn-icon text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

