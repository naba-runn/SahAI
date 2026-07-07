import { useState, useRef } from 'react';
import { callGeminiText } from '../lib/gemini';
import { useLang } from '../context/LangContext';
import UrgencyBadge from '../components/UrgencyBadge';
import LoadingSpinner from '../components/LoadingSpinner';

// ─── System prompt (exact, as specified) ────────────────────────────────────
const COMPLAINT_SYSTEM_PROMPT = `You are a civic complaint triage AI for an Indian municipal services platform. A citizen will describe a problem in their own words (any language, informal tone, possibly incomplete). Your job is to convert this into a structured, actionable complaint.

Respond ONLY with valid JSON, no markdown fences, no preamble:

{
  "department": "one of: Roads & Infrastructure | Water Supply | Electricity | Sanitation & Waste | Public Health | Traffic & Transport | Other",
  "urgency": "low | medium | high",
  "urgency_reason": "one short sentence justifying the urgency level",
  "formal_complaint_text": "a clear, formal 2-4 sentence complaint rewritten from the citizen's input, suitable for official submission",
  "suggested_title": "a short 5-8 word title for this complaint",
  "clarifying_question": "one question to ask the citizen if key info (location, duration, severity) is missing, else null"
}

Be decisive on department classification even with sparse input — pick the closest match rather than defaulting to "Other". Preserve the original meaning; do not invent details not implied by the input.`;

// ─── Department icon map ─────────────────────────────────────────────────────
const DEPT_ICONS = {
  'Roads & Infrastructure': '🛣️',
  'Water Supply': '💧',
  'Electricity': '⚡',
  'Sanitation & Waste': '🗑️',
  'Public Health': '🏥',
  'Traffic & Transport': '🚦',
  'Other': '📋',
};

// Category tiles matching Stitch design
const CATEGORIES = [
  { id: 'potholes',     icon: 'construction',    label: 'Potholes',     hint: 'Road with potholes' },
  { id: 'streetlights', icon: 'lightbulb',       label: 'Streetlights', hint: 'Broken streetlight' },
  { id: 'garbage',      icon: 'delete',          label: 'Garbage',      hint: 'Garbage not collected' },
  { id: 'water',        icon: 'water_drop',      label: 'Water',        hint: 'Water supply issue' },
  { id: 'others',       icon: 'more_horiz',      label: 'Others',       hint: 'Other civic issue' },
];

const STATUS_CYCLE = ['Pending', 'In Progress', 'Resolved'];

// ─── Progress Stepper ────────────────────────────────────────────────────────
function Stepper({ step }) {
  const steps = ['Details', 'Location', 'Review'];
  return (
    <div className="flex items-center justify-center mb-lg pt-base px-base">
      <div className="flex items-center justify-between max-w-xs w-full relative">
        {/* Background track */}
        <div className="absolute top-5 left-10 right-10 h-1 bg-surface-container-highest z-0">
          <div
            className="h-full bg-primary-container transition-all duration-500"
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
          />
        </div>
        {steps.map((label, i) => {
          const n = i + 1;
          const isActive = n === step;
          const isDone = n < step;
          return (
            <div key={label} className="relative z-10 flex flex-col items-center gap-xs">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  isDone
                    ? 'bg-primary-container text-white'
                    : isActive
                    ? 'bg-primary-container text-white active-step'
                    : 'bg-surface-container-highest text-on-surface-variant'
                }`}
              >
                {isDone
                  ? <span className="material-symbols-outlined text-[18px]">check</span>
                  : n}
              </div>
              <span
                className={`font-label-md text-label-md ${
                  isActive ? 'text-primary font-bold' : 'text-on-surface-variant'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Category grid (Step 1) ──────────────────────────────────────────────────
function CategoryGrid({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-sm mb-md">
      {CATEGORIES.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat)}
          className={`category-card flex flex-col items-center p-sm rounded-xl border transition-all duration-200 hover:shadow-lg focus:ring-2 focus:ring-orange-300 active:scale-95 ${
            selected?.id === cat.id
              ? 'border-primary-container bg-primary-fixed shadow-md'
              : 'border-outline-variant bg-surface-container-lowest hover:border-orange-300'
          }`}
        >
          <div
            className={`w-11 h-11 flex items-center justify-center rounded-full mb-xs transition-colors ${
              selected?.id === cat.id
                ? 'bg-primary-container text-white'
                : 'bg-primary-container/10 text-primary-container'
            }`}
          >
            <span className="material-symbols-outlined text-xl">{cat.icon}</span>
          </div>
          <span
            className={`font-label-sm text-label-sm text-center leading-tight transition-colors ${
              selected?.id === cat.id ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            {cat.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Status badge (clickable) ────────────────────────────────────────────────
function StatusBadge({ status, onClick }) {
  const styles = {
    'Pending':     'bg-amber-100 text-amber-700 border-amber-200',
    'In Progress': 'bg-blue-100  text-blue-700  border-blue-200',
    'Resolved':    'bg-green-100 text-green-700 border-green-200',
  };
  return (
    <button
      onClick={onClick}
      title="Click to advance status"
      className={`text-label-sm font-label-sm px-3 py-1 rounded-full border transition-all hover:opacity-80 active:scale-95 ${styles[status] ?? styles['Pending']}`}
    >
      {status}
    </button>
  );
}

// ─── Past complaints dashboard ───────────────────────────────────────────────
function ComplaintsDashboard({ complaints, setComplaints, t, onFileNew }) {
  function advanceStatus(id) {
    setComplaints(prev => {
      const updated = prev.map(c => {
        if (c.id !== id) return c;
        const idx = STATUS_CYCLE.indexOf(c.status);
        return { ...c, status: STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length] };
      });
      localStorage.setItem('sahAI_complaints', JSON.stringify(updated));
      return updated;
    });
  }

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-gutter py-md">
      <div className="flex items-center justify-between mb-md">
        <h2 className="font-headline-md text-headline-md text-secondary flex items-center gap-2">
          {t.pastComplaints}
          {complaints.length > 0 && (
            <span className="bg-primary-fixed text-primary text-xs font-bold px-2 py-0.5 rounded-full">
              {complaints.length}
            </span>
          )}
        </h2>
        <button onClick={onFileNew} className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">add</span>
          New Complaint
        </button>
      </div>

      {complaints.length === 0 ? (
        <div className="text-center py-16 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl mb-3 block text-outline">inbox</span>
          <p className="font-body-md text-body-md">{t.noComplaints}</p>
          <button onClick={onFileNew} className="btn-primary mt-6">{t.complaintCardCta}</button>
        </div>
      ) : (
        <ul className="space-y-4">
          {complaints.slice().reverse().map(c => (
            <li key={c.id} className="card hover:shadow-card-hover transition-all">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{DEPT_ICONS[c.department] ?? '📋'}</span>
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide mb-0.5">
                      {c.department}
                    </p>
                    <p className="font-semibold text-on-surface text-sm">{c.suggested_title}</p>
                  </div>
                </div>
                <StatusBadge status={c.status} onClick={() => advanceStatus(c.id)} />
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-2 mb-3">
                {c.formal_complaint_text}
              </p>
              {c.location && (
                <p className="text-label-sm text-on-surface-variant mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {c.location}
                </p>
              )}
              <div className="flex items-center gap-3">
                <UrgencyBadge urgency={c.urgency} />
                <span className="text-label-sm text-on-surface-variant">
                  {t.submittedOn}: {new Date(c.submittedAt).toLocaleDateString()}
                </span>
                <span className="text-label-sm text-outline ml-auto">#{c.id.slice(-6)}</span>
              </div>
              <p className="text-[10px] text-outline mt-1">{t.clickToAdvance}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ─── Success screen ──────────────────────────────────────────────────────────
function SuccessScreen({ complaintId, onTrack, onFileNew }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center animate-slideUp">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
        <span className="material-symbols-outlined text-green-600 text-5xl">task_alt</span>
      </div>
      <h2 className="font-headline-lg text-headline-lg text-secondary mb-sm">Complaint Submitted!</h2>
      <p className="font-body-md text-body-md text-on-surface-variant mb-2">
        Your complaint has been recorded and saved.
      </p>
      <p className="font-label-sm text-label-sm text-outline mb-lg">
        Reference ID: <span className="font-bold text-primary">#{complaintId.slice(-8).toUpperCase()}</span>
      </p>
      <div className="flex flex-col sm:flex-row gap-sm justify-center">
        <button onClick={onTrack} className="btn-primary flex items-center gap-2 justify-center">
          <span className="material-symbols-outlined text-[18px]">query_stats</span>
          Track My Complaint
        </button>
        <button onClick={onFileNew} className="btn-secondary">
          File Another
        </button>
      </div>
    </div>
  );
}

// ─── Main ComplaintsPage ──────────────────────────────────────────────────────
export default function ComplaintsPage() {
  const { t } = useLang();
  const photoInputRef = useRef(null);

  // Multi-step wizard state
  const [view, setView] = useState('form'); // 'form' | 'success' | 'dashboard'
  const [step, setStep] = useState(1);      // 1 | 2 | 3

  // Step 1 state
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [description, setDescription]           = useState('');
  const [photo, setPhoto]                       = useState(null); // { url, file }

  // Step 2 state
  const [location, setLocation] = useState('');

  // Step 3 / Gemini state
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [lastId, setLastId]         = useState(null);

  // Complaints in localStorage
  const [complaints, setComplaints] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sahAI_complaints') ?? '[]'); }
    catch { return []; }
  });

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto({ url: URL.createObjectURL(file), file });
  }

  // ── Step 1 → Step 2 ─────────────────────────────────────────────────────
  function handleStep1Next() {
    if (!description.trim()) { setError(t.noComplaint); return; }
    setError(null);
    setStep(2);
  }

  // ── Step 2 → Step 3 (run Gemini analysis) ───────────────────────────────
  async function handleStep2Next() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      setError(t.noKey);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const contextText = [
      selectedCategory ? `Issue category: ${selectedCategory.label}` : '',
      `Description: ${description}`,
      location ? `Location: ${location}` : '',
    ].filter(Boolean).join('\n');

    try {
      const parsed = await callGeminiText(COMPLAINT_SYSTEM_PROMPT, contextText);
      if (parsed.error) { setError(t.complaintError); setLoading(false); return; }
      setResult(parsed);
      setStep(3);
    } catch (err) {
      console.error('Complaint analysis error:', err);
      setError(t.complaintError);
    } finally {
      setLoading(false);
    }
  }

  // ── Step 3 → Submit ──────────────────────────────────────────────────────
  function handleSubmit() {
    if (!result) return;
    setSubmitting(true);
    const newComplaint = {
      id:              crypto.randomUUID(),
      submittedAt:     new Date().toISOString(),
      status:          'Pending',
      originalText:    description,
      location:        location || null,
      category:        selectedCategory?.label || null,
      ...result,
    };
    const updated = [...complaints, newComplaint];
    setComplaints(updated);
    localStorage.setItem('sahAI_complaints', JSON.stringify(updated));
    setLastId(newComplaint.id);
    setSubmitting(false);
    setView('success');
  }

  // ── Reset wizard ─────────────────────────────────────────────────────────
  function resetWizard() {
    setStep(1);
    setSelectedCategory(null);
    setDescription('');
    setPhoto(null);
    setLocation('');
    setResult(null);
    setError(null);
    setView('form');
  }

  // ── Dashboard view ───────────────────────────────────────────────────────
  if (view === 'dashboard') {
    return (
      <ComplaintsDashboard
        complaints={complaints}
        setComplaints={setComplaints}
        t={t}
        onFileNew={resetWizard}
      />
    );
  }

  // ── Success view ─────────────────────────────────────────────────────────
  if (view === 'success') {
    return (
      <SuccessScreen
        complaintId={lastId}
        onTrack={() => setView('dashboard')}
        onFileNew={resetWizard}
      />
    );
  }

  // ── Wizard form view ─────────────────────────────────────────────────────
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-gutter py-md">

      {/* Page header */}
      <div className="mb-md">
        <h1 className="font-headline-lg text-headline-lg text-secondary mb-xs">{t.complaintTitle}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">{t.complaintSubtitle}</p>
      </div>

      {/* Progress stepper */}
      <Stepper step={step} />

      {/* ── STEP 1: Category & Details ─────────────────────────────────── */}
      {step === 1 && (
        <div className="animate-fadeIn space-y-md">
          <section className="card">
            <h2 className="font-headline-md text-headline-md text-secondary mb-md">What's the issue?</h2>
            <CategoryGrid selected={selectedCategory} onSelect={setSelectedCategory} />

            {/* Description */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-xs ml-1">
                Description of the Issue
              </label>
              <textarea
                value={description}
                onChange={e => { setDescription(e.target.value); setError(null); }}
                placeholder={t.complaintPlaceholder}
                rows={5}
                className="input-base resize-none"
              />
            </div>

            {/* Photo upload */}
            <div className="mt-md">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-xs ml-1">
                Upload Photo <span className="text-outline font-normal">(optional)</span>
              </label>
              {photo ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img src={photo.url} alt="Uploaded" className="w-full max-h-48 object-cover rounded-xl" />
                  <button
                    onClick={() => setPhoto(null)}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => photoInputRef.current?.click()}
                  className="drop-zone border-2 border-dashed border-outline-variant bg-surface-container-low rounded-xl p-lg text-center flex flex-col items-center justify-center gap-sm cursor-pointer hover:border-primary-container transition-all"
                >
                  <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-3xl">add_a_photo</span>
                  </div>
                  <div>
                    <p className="font-body-md font-bold text-on-surface">Click to upload or drag and drop</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">PNG, JPG (max. 5MB)</p>
                  </div>
                </div>
              )}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
          </section>

          {error && (
            <div className="flex items-center gap-2 bg-error-container text-on-error-container rounded-xl px-4 py-3 text-sm border border-red-200">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              {error}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-surface-container-high pt-md">
            <button
              onClick={() => setView('dashboard')}
              className="btn-secondary"
            >
              View Past Complaints
            </button>
            <button
              onClick={handleStep1Next}
              disabled={!description.trim()}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Step
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Location ──────────────────────────────────────────── */}
      {step === 2 && (
        <div className="animate-fadeIn space-y-md">
          <section className="card">
            <h2 className="font-headline-md text-headline-md text-secondary mb-md">
              Where is this issue?
            </h2>

            {/* Location input */}
            <div className="mb-md">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-xs ml-1">
                Address / Area
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary text-xl">
                  location_on
                </span>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. MG Road near Bus Stand, Sector 12, Bengaluru"
                  className="input-base pl-10"
                />
              </div>
            </div>

            {/* Styled map placeholder (no external dependency) */}
            <div className="rounded-xl overflow-hidden border border-outline-variant bg-surface-container h-56 flex flex-col items-center justify-center relative">
              {/* Grid pattern to evoke map */}
              <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#9d4300" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#mapgrid)" />
              </svg>
              {/* Road lines */}
              <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#455f87" strokeWidth="6" />
                <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#455f87" strokeWidth="4" />
                <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#455f87" strokeWidth="4" />
              </svg>
              {/* Pin */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <span className="material-symbols-outlined text-white text-2xl">location_on</span>
                </div>
                <div className="mt-2 bg-white/90 px-3 py-1 rounded-full shadow text-xs font-semibold text-on-surface border border-outline-variant">
                  {location || 'Enter address above'}
                </div>
              </div>
            </div>
            <p className="text-label-sm text-on-surface-variant mt-xs text-center">
              Type the address above — we'll include it in your formal complaint
            </p>
          </section>

          {error && (
            <div className="flex items-center gap-2 bg-error-container text-on-error-container rounded-xl px-4 py-3 text-sm border border-red-200">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              {error}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-surface-container-high pt-md">
            <button onClick={() => { setStep(1); setError(null); }} className="btn-secondary flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back
            </button>
            <button
              onClick={handleStep2Next}
              disabled={loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {loading
                ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>{t.analysing}</>
                : <>Analyse & Review <span className="material-symbols-outlined text-[18px]">arrow_forward</span></>
              }
            </button>
          </div>

          {loading && <LoadingSpinner message={t.analysing} />}
        </div>
      )}

      {/* ── STEP 3: Review & Submit ───────────────────────────────────── */}
      {step === 3 && result && (
        <div className="animate-fadeIn space-y-md">
          {/* Department + urgency */}
          <div className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{DEPT_ICONS[result.department] ?? '📋'}</span>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide mb-0.5">{t.department}</p>
                <p className="font-bold text-on-surface">{result.department}</p>
              </div>
            </div>
            <UrgencyBadge urgency={result.urgency} />
          </div>

          {/* Urgency reason */}
          {result.urgency_reason && (
            <div className="card border-l-4 border-l-amber-400 py-3">
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">{t.urgencyReason}</p>
              <p className="font-body-md text-body-md text-on-surface-variant">{result.urgency_reason}</p>
            </div>
          )}

          {/* Suggested title */}
          <div className="card py-3">
            <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">{t.suggestedTitle}</p>
            <p className="font-semibold text-on-surface">"{result.suggested_title}"</p>
          </div>

          {/* Formal complaint */}
          <div className="card">
            <p className="font-label-sm text-label-sm text-on-surface-variant mb-2">{t.formalText}</p>
            <p className="font-body-md text-body-md text-on-surface leading-relaxed border-l-2 border-primary-container pl-4 italic">
              {result.formal_complaint_text}
            </p>
          </div>

          {/* Details summary */}
          <div className="card py-3 space-y-2">
            {selectedCategory && (
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">category</span>
                Category: <span className="font-semibold text-on-surface">{selectedCategory.label}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                Location: <span className="font-semibold text-on-surface">{location}</span>
              </div>
            )}
            {photo && (
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <img src={photo.url} alt="Attached" className="w-10 h-10 rounded-lg object-cover border border-outline-variant" />
                <span>Photo attached</span>
              </div>
            )}
          </div>

          {/* Clarifying question */}
          {result.clarifying_question && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <p className="font-label-sm text-label-sm text-blue-500 mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">chat_bubble</span>
                Before you submit
              </p>
              <p className="font-body-md text-body-md text-blue-700">{result.clarifying_question}</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-error-container text-on-error-container rounded-xl px-4 py-3 text-sm border border-red-200">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              {error}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-surface-container-high pt-md">
            <button onClick={() => { setStep(2); setError(null); }} className="btn-secondary flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {submitting
                ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>{t.submitting}</>
                : <><span className="material-symbols-outlined text-[18px]">check_circle</span>{t.submitFormal}</>
              }
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
