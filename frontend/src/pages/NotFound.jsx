import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '../components/Logo';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <Logo className="h-12 w-12 opacity-40" />
      <h1 className="mt-6 font-display text-6xl font-semibold text-zinc-200 dark:text-zinc-800">404</h1>
      <h2 className="mt-2 font-display text-2xl font-semibold">{t('common.pageNotFound')}</h2>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">{t('common.pageNotFoundBody')}</p>
      <Link to="/" className="btn-primary mt-8">{t('common.goHome')}</Link>
    </div>
  );
}
