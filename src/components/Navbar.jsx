import { Link, NavLink, useLocation } from 'react-router-dom';
import { useLang } from '../context/LangContext';

// Mobile bottom nav items
const BOTTOM_NAV = [
  { icon: 'home', labelKey: 'home', to: '/' },
  { icon: 'assignment', labelKey: 'complaintsMenu', to: '/complaints' },
  { icon: 'document_scanner', labelKey: 'scanMenu', to: '/scan' },
];

export default function Navbar() {
  const { lang, setLang, t, LANGUAGES } = useLang();
  const location = useLocation();

  return (
    <>
      {/* ── Top App Bar ───────────────────────────────────────────────────── */}
      <header className="bg-surface shadow-sm fixed top-0 w-full z-50 border-b border-outline-variant">
        <div className="flex justify-between items-center w-full px-gutter py-base max-w-container-max mx-auto h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="material-symbols-outlined text-primary-container text-2xl">
              shield_person
            </span>
            <span className="font-bold text-headline-md text-primary group-hover:text-primary/80 transition-colors leading-none">
              {t.appName}
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { to: '/', label: t.home, end: true },
              { to: '/scan', label: t.scanMenu },
              { to: '/complaints', label: t.complaintsMenu },
            ].map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `text-label-md font-label-md px-3 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-fixed text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Language toggle */}
          <div className="flex items-center border border-outline-variant rounded-full overflow-hidden bg-surface-container-low">
            {Object.values(LANGUAGES).map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`px-3 py-1 text-label-sm font-label-sm transition-colors ${
                  lang === l.code
                    ? 'bg-primary-container text-white font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Spacer for fixed header ───────────────────────────────────────── */}
      <div className="h-14" />

      {/* ── Mobile Bottom Nav ─────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 bg-surface border-t border-outline-variant shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.06)] md:hidden">
        {BOTTOM_NAV.map(({ icon, labelKey, to }) => {
          const isActive =
            to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center gap-0.5 px-4 py-1 rounded-full transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'bg-primary-fixed text-primary'
                  : 'text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{icon}</span>
              <span className="text-[10px] font-semibold">{t[labelKey]}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Spacer for mobile bottom nav ─────────────────────────────────── */}
      <div className="h-14 md:hidden" />
    </>
  );
}
