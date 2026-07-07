import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';

// ── Bento feature card ────────────────────────────────────────────────────────
function BentoCard({ icon, title, desc, to, imageSrc, imageAlt, iconBg = 'bg-primary-fixed' }) {
  return (
    <Link to={to} className="bento-card group">
      <div className={`w-14 h-14 flex items-center justify-center rounded-xl mb-base ${iconBg}`}>
        <span className="material-symbols-outlined text-primary text-3xl">{icon}</span>
      </div>
      <h3 className="font-headline-md text-headline-md text-secondary mb-xs">{title}</h3>
      <p className="font-body-md text-body-md text-on-surface-variant mb-md leading-relaxed">{desc}</p>
      {/* Decorative image */}
      <div className="w-full h-48 rounded-lg overflow-hidden relative mt-auto">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
    </Link>
  );
}

// ── How it Works step ─────────────────────────────────────────────────────────
function HowStep({ num, icon, title, desc }) {
  return (
    <div className="flex flex-col items-center text-center px-4">
      <div className="relative mb-md">
        <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center shadow-md">
          <span className="material-symbols-outlined text-primary text-3xl">{icon}</span>
        </div>
        <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary-container text-white text-xs font-bold rounded-full flex items-center justify-center">
          {num}
        </span>
      </div>
      <h3 className="font-headline-md text-headline-md text-secondary mb-xs">{title}</h3>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">{desc}</p>
    </div>
  );
}

// ── Atmospheric background parallax glow ──────────────────────────────────────
function HeroGlow() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        id="glow-1"
        className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bento-glow rounded-full"
      />
      <div
        id="glow-2"
        className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bento-glow rounded-full opacity-50"
      />
    </div>
  );
}

export default function Landing() {
  const { t } = useLang();

  // Subtle mouse parallax on the background glows
  function handleMouseMove(e) {
    const glows = document.querySelectorAll('#glow-1, #glow-2');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    glows.forEach((glow, i) => {
      const speed = (i + 1) * 18;
      glow.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
    });
  }

  // Attach mouse parallax on mount
  if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', handleMouseMove);
  }

  return (
    <main className="overflow-x-hidden">
      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-gutter py-xl hero-gradient overflow-hidden">
        <HeroGlow />

        <div className="relative z-10 max-w-container-max w-full flex flex-col items-center text-center animate-fadeIn">

          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-low border border-outline-variant rounded-full mb-base">
            <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
            <span className="font-label-md text-label-md text-on-surface-variant">
              Your Digital Citizen Companion
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-secondary max-w-4xl mb-md leading-tight">
            Government paperwork,{' '}
            <span className="text-primary italic">explained</span>{' '}
            in plain language
          </h1>

          {/* Subheadline */}
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-lg leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-md mb-xl">
            <Link
              to="/scan"
              className="bg-primary-container hover:brightness-110 text-white font-label-md text-label-md px-lg py-4 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-1 active:scale-95 flex items-center gap-2"
            >
              {t.scanCardCta}
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
            <Link
              to="/complaints"
              className="bg-surface-container-highest hover:bg-surface-variant text-secondary font-label-md text-label-md px-lg py-4 rounded-xl border border-outline-variant transition-all duration-300 flex items-center gap-2"
            >
              {t.complaintCardCta}
            </Link>
          </div>

          {/* Bento feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md w-full max-w-5xl">
            <BentoCard
              icon="photo_camera"
              title={t.scanCardTitle}
              desc={t.scanCardDesc}
              to="/scan"
              imageSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuCVi_Fz2G4L8ckNOkbzs59CMEk-CySsXu-PC7XlG27QZGsf-sjrWOSuQ6m9enjLH9cr3XvovdErjpkXL6tMbH9IBuJfeXuUD5ij5sC4d9sHYHe9ojzTN_g5TwvzlEkXTnJyWV6E5e90kGkcCoXFatU5Qmuu39z1oWHtAjbnPcop7f9zcY5nRxeCOC5S5RPuSU16CkHMYfeS6psE6zvOE6tBdAZhAMVU9EUm6pgsLNfF91Kh6ou8zzKQykdD8rrWtVK7X7HHRLIJqd-Z"
              imageAlt="A smartphone scanning a government document"
              iconBg="bg-primary-fixed"
            />
            <BentoCard
              icon="assignment_late"
              title={t.complaintCardTitle}
              desc={t.complaintCardDesc}
              to="/complaints"
              imageSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuB35FJvcoGYNeMeN0wJ8ZkhW2S2N7Q4Ww8kSdOP_fw6j4rJVRezomzE0ihKAPtqMZST007C55l2lqR8ivHqFx7oz4F7Q34JHUY5nRXzKKt1yk_VK7-4o7OF_AcZ9pQksc52wnByGa6FPjkUja7evJHPxlontbwvblAf1zuAo9n9C5grNI4TM4jEWaec9cDOsk0RFK9B73R-dy7zKQ3BA-GebaJfwmPKCWfj1lRgtDg5a4DuG97N_7z-CVojbMIeCeeDStk39kMtrA4Q"
              imageAlt="A dashboard showing complaint status tracking"
              iconBg="bg-secondary-fixed"
            />
          </div>

          {/* Multilingual support strip */}
          <div className="mt-xl flex flex-wrap justify-center items-center gap-lg opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest w-full mb-xs">
              Multilingual Support Available
            </span>
            {['हिन्दी', 'தமிழ்', 'বাংলা', 'ಕನ್ನಡ', 'English'].map(l => (
              <span key={l} className="font-bold text-secondary text-lg">{l}</span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-base left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center">
          <span className="font-label-sm text-label-sm text-on-surface-variant mb-xs">Learn more</span>
          <span className="material-symbols-outlined text-primary">expand_more</span>
        </div>
      </section>

      {/* ── How it Works Section ─────────────────────────────────────────── */}
      <section className="bg-surface-container-low py-xl px-gutter">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-lg">
            <h2 className="font-headline-lg text-headline-lg text-secondary mb-sm">How It Works</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto">
              Three simple steps to understand any government document or file a civic complaint.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-8 left-[calc(16.67%+32px)] right-[calc(16.67%+32px)] h-0.5 bg-outline-variant" />

            <HowStep
              num={1}
              icon="upload"
              title="Upload or Describe"
              desc="Take a photo of your document or describe your civic problem in plain words."
            />
            <HowStep
              num={2}
              icon="psychology"
              title="AI Analyses It"
              desc="Our AI reads the document or complaint and extracts the key information instantly."
            />
            <HowStep
              num={3}
              icon="task_alt"
              title="Take Action"
              desc="Get clear next steps, or submit a formal complaint that gets tracked in real time."
            />
          </div>

          {/* Trust strip */}
          <div className="mt-xl pt-lg border-t border-outline-variant text-center">
            <p className="text-label-sm text-on-surface-variant uppercase tracking-widest mb-md font-medium">
              Works with documents from
            </p>
            <div className="flex flex-wrap justify-center gap-md text-on-surface-variant text-label-md font-label-md">
              {['Municipal Corporations', 'Water Boards', 'Electricity Boards', 'Courts', 'Ration Offices', 'Revenue Dept.'].map(d => (
                <span key={d} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
