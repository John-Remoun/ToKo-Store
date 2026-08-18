import { NavLink, Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  TicketPercent,
  ClipboardList,
  Users,
  ArrowLeft,
  Settings,
  ShieldAlert,
} from 'lucide-react';
import Logo from '../Logo';
import ThemeSwitcher from '../ThemeSwitcher';
import LanguageSwitcher from '../LanguageSwitcher';

export default function AdminLayout() {
  const { t } = useTranslation();

  const links = [
    { to: '/admin', end: true, icon: LayoutDashboard, label: t('admin.overview') || 'Overview' },
    { to: '/admin/products', icon: Package, label: t('admin.products') || 'Products' },
    { to: '/admin/categories', icon: FolderTree, label: t('admin.categories') || 'Categories' },
    { to: '/admin/brands', icon: Tag, label: t('admin.brands') || 'Brands' },
    { to: '/admin/coupons', icon: TicketPercent, label: t('admin.coupons') || 'Coupons' },
    { to: '/admin/orders', icon: ClipboardList, label: t('admin.orders') || 'Orders' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/audit-logs', icon: ShieldAlert, label: t('admin.auditLogs') || 'Audit Logs' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] dark:bg-[#07080D]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-e border-zinc-200/80 bg-white/90 p-5 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-[#0D0E15]/90 lg:flex">
        <Link to="/" className="mb-8 flex items-center justify-between">
          <Logo withWordmark className="h-9 w-9" />
        </Link>

        <div className="mb-3 px-3">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
            Control Center
          </span>
        </div>

        <nav className="flex flex-col gap-1.5">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-accent-500/15 text-accent-700 dark:text-accent-300 shadow-sm'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-white'
                }`
              }
            >
              <l.icon size={17} />
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-3 pt-6 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center justify-between px-2">
            <ThemeSwitcher />
            <LanguageSwitcher compact />
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-white transition-all"
          >
            <ArrowLeft size={16} />
            <span>{t('admin.backToSite') || 'Back to Store'}</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Horizontal Top Navigation */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center gap-1.5 overflow-x-auto border-b border-zinc-200/80 bg-white/95 px-3 py-2.5 shadow-sm backdrop-blur-lg dark:border-zinc-800/80 dark:bg-[#0D0E15]/95 lg:hidden">
        <Link to="/" className="shrink-0 me-2">
          <Logo className="h-8 w-8" />
        </Link>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                isActive
                  ? 'bg-accent-500 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
              }`
            }
          >
            <l.icon size={13} />
            <span>{l.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-5 sm:p-8 pt-16 lg:pt-8 max-w-7xl overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}

