import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Palette, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme, PALETTES } from '../context/ThemeContext';

export default function ThemeSwitcher() {
  const { t } = useTranslation();
  const { mode, toggleMode, palette, setPalette } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="flex items-center gap-1.5">
      {/* Dark / Light Toggle */}
      <button
        onClick={toggleMode}
        className="btn-icon bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 shadow-sm"
        aria-label="Toggle dark mode"
        title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {mode === 'dark' ? (
          <Sun size={18} className="text-amber-400 animate-spin-slow" />
        ) : (
          <Moon size={18} className="text-indigo-500" />
        )}
      </button>

      {/* Palette Dropdown */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="btn-icon bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 shadow-sm"
          aria-label="Theme color"
          title="Color Palettes"
        >
          <Palette size={18} className="text-accent-500" />
        </button>

        {open && (
          <div className="absolute end-0 z-50 mt-2.5 w-52 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/95 p-2 shadow-premium backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/95 animate-scaleIn">
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-100 dark:border-zinc-800/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                {t('common.theme') || 'Accent Theme'}
              </span>
              <span className="text-[10px] font-medium text-accent-600 dark:text-accent-400 capitalize bg-accent-500/10 px-2 py-0.5 rounded-full">
                {palette}
              </span>
            </div>
            <div className="mt-1.5 space-y-1">
              {PALETTES.map((p) => {
                const isActive = palette === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPalette(p.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-accent-500/15 text-accent-700 dark:text-accent-300 font-bold'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={`h-4 w-4 rounded-full shadow-sm ring-2 ${
                          isActive ? 'ring-accent-500 ring-offset-2 dark:ring-offset-zinc-900' : 'ring-transparent'
                        }`}
                        style={{ backgroundColor: p.swatch }}
                      />
                      {p.label}
                    </span>
                    {isActive && <Check size={14} className="text-accent-600 dark:text-accent-400 stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

