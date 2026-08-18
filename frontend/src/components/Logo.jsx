/**
 * ToKo Store — Fashion Clothing Brand Mark
 * Clothing hanger icon with luxury gradient + wordmark
 */
export default function Logo({ className = 'h-10 w-10', withWordmark = false, wordmarkClassName = '' }) {
  return (
    <span className="inline-flex items-center gap-3 select-none group">
      <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-2xl bg-accent-500/20 blur-md group-hover:bg-accent-500/35 transition-all duration-300" />

        {/* Clothing Hanger Mark */}
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 w-full h-full drop-shadow-sm">
          <defs>
            <linearGradient id="tokoAccent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(var(--accent-300))" />
              <stop offset="100%" stopColor="rgb(var(--accent-600))" />
            </linearGradient>
            <linearGradient id="tokoBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e1e24" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>
          </defs>

          {/* Rounded square base */}
          <rect x="1" y="1" width="46" height="46" rx="13" fill="url(#tokoBg)" />
          <rect x="1" y="1" width="46" height="46" rx="13" stroke="url(#tokoAccent)" strokeWidth="1" opacity="0.4" />

          {/* Hook at top */}
          <path
            d="M24 9 C24 9 24 6.5 26.5 6.5 C29 6.5 29 9 29 9"
            stroke="url(#tokoAccent)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Hanger shoulder arc */}
          <path
            d="M24 9 C17 14 11 17.5 10 20.5 C9.2 22.5 10.8 24 13 24 L35 24 C37.2 24 38.8 22.5 38 20.5 C37 17.5 31 14 24 9Z"
            stroke="url(#tokoAccent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="url(#tokoAccent)"
            fillOpacity="0.08"
          />

          {/* Bottom crossbar of hanger */}
          <line x1="13" y1="24" x2="35" y2="24" stroke="url(#tokoAccent)" strokeWidth="2" strokeLinecap="round" />

          {/* Store wordmark below */}
          <text
            x="24"
            y="37"
            textAnchor="middle"
            dominantBaseline="central"
            fill="url(#tokoAccent)"
            style={{ font: '700 7px Inter, sans-serif', letterSpacing: '2.5px' }}
          >
            TOKO
          </text>

          {/* Thin line under text */}
          <line x1="12" y1="41" x2="36" y2="41" stroke="url(#tokoAccent)" strokeWidth="0.8" opacity="0.4" strokeLinecap="round" />
        </svg>
      </div>

      {withWordmark && (
        <div className={`flex flex-col tracking-tight ${wordmarkClassName}`}>
          <span className="font-display text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            ToKo
            <span className="text-accent-500 font-sans text-[10px] font-black uppercase tracking-[3px] px-1.5 py-0.5 rounded-md bg-accent-500/10 border border-accent-500/20">
              Fashion
            </span>
          </span>
          <span className="text-[10px] font-medium tracking-[2px] uppercase text-zinc-400 dark:text-zinc-500 -mt-0.5">
            Clothing Store
          </span>
        </div>
      )}
    </span>
  );
}
