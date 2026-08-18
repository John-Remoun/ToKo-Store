import { Link } from 'react-router-dom';
import Logo from './Logo';

const IMG = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2 bg-[#FAFAFC] dark:bg-[#07080D]">
      {/* Visual Brand Side */}
      <div className="relative hidden overflow-hidden bg-zinc-950 lg:block">
        <img src={IMG} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60 scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B10] via-[#0A0B10]/40 to-transparent" />
        
        {/* Glow Spheres */}
        <div className="absolute top-1/4 start-1/4 h-80 w-80 rounded-full bg-accent-500/25 blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex h-full flex-col justify-between p-12 lg:p-16 text-white">
          <Logo withWordmark className="h-10 w-10" />
          <div className="max-w-md">
            <h2 className="font-display text-4xl sm:text-5xl font-bold leading-[1.1] tracking-tight">
              Curated Luxury,<br />Delivered Elegantly.
            </h2>
            <p className="mt-4 text-base text-zinc-300 font-sans leading-relaxed">
              Experience handpicked collections, verified designer brands, and a bespoke shopping experience.
            </p>
          </div>
          <p className="text-xs text-zinc-400 font-medium">© {new Date().getFullYear()} ToKo Store Inc. All rights reserved.</p>
        </div>
      </div>

      {/* Form Side */}
      <div className="relative flex flex-col items-center justify-center px-6 py-16 sm:px-10">
        {/* Subtle Ambient Light */}
        <div className="absolute top-1/3 end-1/4 h-64 w-64 rounded-full bg-accent-500/10 blur-[80px] pointer-events-none" />

        <div className="glass-card w-full max-w-md p-8 sm:p-10 shadow-premium">
          <Link to="/" className="mb-8 flex justify-center lg:hidden">
            <Logo withWordmark className="h-10 w-10" />
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {subtitle}
            </p>
          )}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

