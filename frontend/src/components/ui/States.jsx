import { AlertTriangle, Inbox } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function EmptyState({ icon: Icon = Inbox, title, body, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        <Icon className="h-7 w-7 text-zinc-400" />
      </div>
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      {body && <p className="mt-1.5 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ title, body, onRetry }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
        <AlertTriangle className="h-7 w-7 text-red-500" />
      </div>
      <h3 className="font-display text-xl font-semibold">{title || t('common.error')}</h3>
      {body && <p className="mt-1.5 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">{body}</p>}
      {onRetry && (
        <button onClick={onRetry} className="btn-outline mt-6">
          {t('common.retry')}
        </button>
      )}
    </div>
  );
}

export function Spinner({ className = 'h-5 w-5' }) {
  return (
    <svg className={`animate-spin text-current ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
    </svg>
  );
}

export function PageLoader() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-zinc-400">
      <Spinner className="h-8 w-8 text-accent-500" />
      <span className="text-sm">{t('common.loading')}</span>
    </div>
  );
}
