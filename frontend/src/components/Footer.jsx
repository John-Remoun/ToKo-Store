import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Heart } from 'lucide-react';
import Logo from './Logo';

const Instagram = ({ size = 18, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const Facebook = ({ size = 18, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="M15 3h-2a4 4 0 0 0-4 4v3H6v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Twitter = ({ size = 18, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="M4 4l16 16M20 4L4 20" />
  </svg>
);

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="mt-24 border-t border-zinc-200/70 bg-white dark:border-zinc-850 dark:bg-[#08090E]">
      <div className="container-app grid grid-cols-2 gap-10 py-16 md:grid-cols-5">
        {/* Brand Story */}
        <div className="col-span-2">
          <Logo withWordmark className="h-10 w-10" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            {t('footer.about') ||
              'ToKo Store is your premier destination for curated luxury fashion, lifestyle aesthetics, and timeless apparel.'}
          </p>

          <div className="mt-6 flex items-center gap-2.5">
            {[
              { icon: Instagram, label: 'Instagram' },
              { icon: Facebook, label: 'Facebook' },
              { icon: Twitter, label: 'Twitter' },
            ].map(({ icon: Icon, label }, i) => (
              <a
                key={i}
                href="#"
                aria-label={label}
                className="btn-icon bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 hover:bg-accent-500 hover:text-white dark:hover:bg-accent-500 dark:hover:text-white hover:scale-105 transition-all shadow-sm"
              >
                <Icon size={17} />
              </a>
            ))}
          </div>
        </div>

        {/* Shop Links */}
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
            {t('footer.shop') || 'Shop'}
          </h4>
          <ul className="space-y-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <li>
              <Link to="/shop" className="hover:text-accent-600 dark:hover:text-accent-400 transition-colors">
                {t('nav.shop') || 'All Products'}
              </Link>
            </li>
            <li>
              <Link to="/categories" className="hover:text-accent-600 dark:hover:text-accent-400 transition-colors">
                {t('nav.categories') || 'Categories'}
              </Link>
            </li>
            <li>
              <Link to="/brands" className="hover:text-accent-600 dark:hover:text-accent-400 transition-colors">
                {t('nav.brands') || 'Brands'}
              </Link>
            </li>
          </ul>
        </div>

        {/* Company Links */}
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
            {t('footer.company') || 'Company'}
          </h4>
          <ul className="space-y-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <li>
              <a href="#" className="hover:text-accent-600 dark:hover:text-accent-400 transition-colors">
                {t('footer.aboutUs') || 'About Us'}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-accent-600 dark:hover:text-accent-400 transition-colors">
                {t('footer.careers') || 'Careers'}
              </a>
            </li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
            {t('footer.help') || 'Customer Care'}
          </h4>
          <ul className="space-y-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <li>
              <a href="#" className="hover:text-accent-600 dark:hover:text-accent-400 transition-colors">
                {t('footer.contact') || 'Contact & Help'}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-accent-600 dark:hover:text-accent-400 transition-colors">
                {t('footer.shipping') || 'Shipping Info'}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-accent-600 dark:hover:text-accent-400 transition-colors">
                {t('footer.returns') || 'Easy Returns'}
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-200/70 dark:border-zinc-850/80 py-6">
        <div className="container-app flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>All systems live & operational</span>
          </div>

          <p>© {new Date().getFullYear()} ToKo Store Inc. {t('footer.rights') || 'All rights reserved.'}</p>
        </div>
      </div>
    </footer>
  );
}
