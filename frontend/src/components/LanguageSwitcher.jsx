import { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LANGS = [
  { code: 'en', label: 'English', short: 'EN', flag: '🇺🇸' },
  { code: 'ar', label: 'العربية', short: 'عربي', flag: '🇸🇦' },
];

export default function LanguageSwitcher({ compact = false }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const current = LANGS.find((l) => l.code === i18n.resolvedLanguage) || LANGS[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={
          compact
            ? 'btn-icon bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 shadow-sm'
            : 'inline-flex items-center gap-2 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/80 dark:bg-zinc-800/80 px-3 py-2 text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all'
        }
        aria-label="Language selector"
      >
        <Globe size={17} className="text-zinc-600 dark:text-zinc-300" />
        {!compact && <span>{current.short}</span>}
      </button>

      {open && (
        <div className="absolute end-0 z-50 mt-2.5 w-40 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/95 p-1.5 shadow-premium backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/95 animate-scaleIn">
          {LANGS.map((l) => {
            const isActive = i18n.resolvedLanguage === l.code;
            return (
              <button
                key={l.code}
                onClick={() => {
                  i18n.changeLanguage(l.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-accent-500/15 text-accent-700 dark:text-accent-300 font-bold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </span>
                {isActive && <Check size={14} className="text-accent-600 dark:text-accent-400 stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

