import { Star, X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

export function Rating({ value = 0, count, size = 14 }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={size}
            className={
              i < Math.round(value)
                ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]'
                : 'fill-transparent text-zinc-300 dark:text-zinc-700'
            }
          />
        ))}
      </div>
      {typeof count === 'number' && (
        <span className="text-[11px] font-semibold text-zinc-400">({count})</span>
      )}
    </div>
  );
}

export function Price({ price, discountPrice, size = 'md' }) {
  const sizes = {
    sm: 'text-sm font-semibold',
    md: 'text-base font-bold',
    lg: 'text-2xl sm:text-3xl font-extrabold tracking-tight',
  };
  const hasDiscount = discountPrice != null && discountPrice < price;
  return (
    <div className="flex items-baseline gap-2">
      <span className={`text-zinc-900 dark:text-white ${sizes[size]}`}>
        ${(hasDiscount ? discountPrice : price)?.toFixed(2)}
      </span>
      {hasDiscount && (
        <span className="text-xs sm:text-sm text-zinc-400 line-through font-medium">
          ${price?.toFixed(2)}
        </span>
      )}
    </div>
  );
}

export function Badge({ children, tone = 'default', className = '' }) {
  const tones = {
    default: 'bg-zinc-100/90 text-zinc-700 dark:bg-zinc-800/90 dark:text-zinc-300 border-zinc-200/50 dark:border-zinc-700/50',
    accent: 'bg-accent-500/15 text-accent-700 dark:text-accent-300 border-accent-500/20',
    success: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20',
    danger: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/20',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide backdrop-blur-sm ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function statusTone(status) {
  switch (status) {
    case 'DELIVERED':
    case 'PAID':
    case 'CONFIRMED':
      return 'success';
    case 'CANCELLED':
    case 'FAILED':
      return 'danger';
    case 'SHIPPED':
      return 'accent';
    case 'REFUNDED':
      return 'warning';
    default:
      return 'default';
  }
}

export function Pagination({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;
  const items = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) items.push(i);
    else if (items[items.length - 1] !== '…') items.push('…');
  }
  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="btn-icon bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 disabled:opacity-30 shadow-sm"
      >
        ‹
      </button>
      {items.map((it, i) =>
        it === '…' ? (
          <span key={`e${i}`} className="px-2 text-zinc-400 font-bold">
            …
          </span>
        ) : (
          <button
            key={it}
            onClick={() => onChange(it)}
            className={`h-10 w-10 rounded-full text-xs font-bold transition-all shadow-sm ${
              it === page
                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 scale-105 shadow-premium'
                : 'bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-accent-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            {it}
          </button>
        ),
      )}
      <button
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        className="btn-icon bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 disabled:opacity-30 shadow-sm"
      >
        ›
      </button>
    </div>
  );
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fadeIn" onClick={onClose} />
      <div
        className={`relative z-10 w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-200/80 bg-white/95 p-6 sm:p-8 shadow-premium backdrop-blur-xl animate-scaleIn dark:border-zinc-800/80 dark:bg-zinc-900/95`}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-xl font-bold tracking-tight text-zinc-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="btn-icon bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, body, loading }) {
  const { t } = useTranslation();
  return (
    <Modal open={open} onClose={onClose} title={title || t('common.confirm')} maxWidth="max-w-sm">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{body || t('common.deleteConfirm')}</p>
      <div className="mt-6 flex justify-end gap-2.5">
        <button className="btn-ghost" onClick={onClose}>
          {t('common.cancel')}
        </button>
        <button
          className="btn bg-rose-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-rose-700 shadow-soft active:scale-95"
          onClick={onConfirm}
          disabled={loading}
        >
          {t('common.confirm')}
        </button>
      </div>
    </Modal>
  );
}

