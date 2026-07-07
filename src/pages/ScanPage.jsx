import { useState, useRef, useCallback } from 'react';
import { callGeminiVision } from '../lib/gemini';
import { useLang } from '../context/LangContext';
import UrgencyBadge from '../components/UrgencyBadge';
import LoadingSpinner from '../components/LoadingSpinner';

// ─── System prompt (exact, as specified) ────────────────────────────────────
const SCAN_SYSTEM_PROMPT = `You are a civic assistance AI helping Indian citizens understand government documents, notices, forms, and bills that are often written in dense bureaucratic or legal language.

You will be shown an image of a document. Analyze it and respond ONLY with valid JSON in this exact structure, no markdown fences, no preamble:

{
  "document_type": "short label, e.g. 'Water Bill', 'Ration Card Renewal Notice', 'Court Summons'",
  "plain_summary": "2-3 sentences explaining what this document is and why the person received it, written at a 5th-grade reading level, no jargon",
  "why_it_matters": "1-2 sentences on what happens if they ignore it or miss the deadline, if applicable",
  "required_documents": ["list", "of", "documents", "needed", "to", "respond", "or", "comply"],
  "next_steps": ["ordered", "list", "of", "concrete", "actions", "the", "person", "should", "take"],
  "deadline": "extracted date if present, else null",
  "urgency": "low | medium | high",
  "detected_language": "the language the original document is written in"
}

If the image is unclear, blurry, or not a government document, return:
{ "error": "reason", "document_type": null }

Always respond in the same language the user's UI is set to (this will be passed separately as a language code) — but keep the JSON keys in English regardless.`;

// ─── Checklist item ──────────────────────────────────────────────────────────
function ChecklistItem({ text }) {
  const [checked, setChecked] = useState(false);
  return (
    <li
      className={`flex items-start gap-3 p-2 rounded-lg transition-colors cursor-pointer select-none ${checked ? 'bg-green-50' : 'hover:bg-slate-50'}`}
      onClick={() => setChecked(!checked)}
    >
      <span className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-colors ${checked ? 'bg-green-500 border-green-500' : 'border-slate-300'}`}>
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      <span className={`text-sm ${checked ? 'line-through text-slate-400' : 'text-navy-700'}`}>{text}</span>
    </li>
  );
}

// ─── Result card ─────────────────────────────────────────────────────────────
function ResultCard({ result, t, onReset }) {
  const [speaking, setSpeaking] = useState(false);

  function handleReadAloud() {
    if (!('speechSynthesis' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(result.plain_summary);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  return (
    <div className="space-y-5 animate-[fadeIn_0.4s_ease]">
      {/* Header row */}
      <div className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">{t.documentType}</p>
          <h2 className="text-2xl font-bold text-navy-700">{result.document_type}</h2>
          {result.detected_language && (
            <p className="text-xs text-slate-400 mt-1">{t.detectedLang}: <span className="font-medium">{result.detected_language}</span></p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <UrgencyBadge urgency={result.urgency} />
          {result.deadline && (
            <span className="bg-red-50 text-red-700 border border-red-200 text-xs font-semibold px-3 py-1 rounded-full">
              📅 {result.deadline}
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="card">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-navy-700">{t.summary}</h3>
          <button
            onClick={handleReadAloud}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              speaking
                ? 'bg-saffron-500 text-white border-saffron-500'
                : 'border-saffron-300 text-saffron-600 hover:bg-saffron-50'
            }`}
          >
            {speaking ? '⏹ ' + t.stopReading : '🔊 ' + t.readAloud}
          </button>
        </div>
        <p className="text-slate-600 leading-relaxed">{result.plain_summary}</p>
      </div>

      {/* Why it matters */}
      {result.why_it_matters && (
        <div className="card border-l-4 border-l-amber-400">
          <h3 className="font-semibold text-navy-700 mb-1">{t.whyItMatters}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{result.why_it_matters}</p>
        </div>
      )}

      {/* Required documents */}
      {result.required_documents?.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-navy-700 mb-3">{t.requiredDocs}</h3>
          <ul className="space-y-1">
            {result.required_documents.map((doc, i) => (
              <ChecklistItem key={i} text={doc} />
            ))}
          </ul>
        </div>
      )}

      {/* Next steps */}
      {result.next_steps?.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-navy-700 mb-3">{t.nextSteps}</h3>
          <ol className="space-y-3">
            {result.next_steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-saffron-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-slate-600 text-sm leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <button onClick={onReset} className="btn-secondary w-full sm:w-auto">
        ↩ {t.tryAgain}
      </button>
    </div>
  );
}

// ─── Error card ───────────────────────────────────────────────────────────────
function ErrorCard({ message, onReset }) {
  return (
    <div className="card border-2 border-red-100 text-center py-10 animate-[fadeIn_0.3s_ease]">
      <div className="text-5xl mb-4">📷</div>
      <p className="text-navy-700 font-semibold text-lg mb-2">{message}</p>
      <p className="text-slate-400 text-sm mb-6">Make sure the document is well-lit and fills the frame.</p>
      <button onClick={onReset} className="btn-primary">Try Again</button>
    </div>
  );
}

// ─── Main ScanPage ───────────────────────────────────────────────────────────
export default function ScanPage() {
  const { t, lang } = useLang();
  const [image, setImage]       = useState(null); // { url, base64, mimeType }
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState(null);
  const fileInputRef            = useRef(null);
  const cameraInputRef          = useRef(null);

  function readFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      // Strip data-URL prefix to get pure base64
      const base64 = dataUrl.split(',')[1];
      setImage({ url: dataUrl, base64, mimeType: file.type || 'image/jpeg' });
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }

  function handleFileChange(e) {
    readFile(e.target.files?.[0]);
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    readFile(e.dataTransfer.files?.[0]);
  }, []);

  function handleDragOver(e) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  async function handleAnalyze() {
    if (!image) { setError(t.noImage); return; }
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      setError(t.noKey);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const parsed = await callGeminiVision(
        SCAN_SYSTEM_PROMPT,
        image.base64,
        image.mimeType,
        `language_code: ${lang}`
      );

      // If Gemini returned an error shape
      if (parsed.error || parsed.document_type === null) {
        setError(t.scanError);
      } else {
        setResult(parsed);
      }
    } catch (err) {
      console.error('Scan error:', err);
      setError(t.scanError);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setImage(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-700 mb-2">{t.scanTitle}</h1>
        <p className="text-slate-500">{t.scanSubtitle}</p>
      </div>

      {/* Show result or error */}
      {result && <ResultCard result={result} t={t} onReset={handleReset} />}
      {!result && error && <ErrorCard message={error} onReset={handleReset} />}

      {/* Upload UI — hide after successful result */}
      {!result && !error && (
        <div className="space-y-5">
          {/* Dropzone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-3 min-h-[220px] ${
              dragging
                ? 'border-saffron-500 bg-saffron-50 scale-[1.01]'
                : image
                ? 'border-saffron-300 bg-saffron-50'
                : 'border-slate-200 hover:border-saffron-300 hover:bg-saffron-50 bg-white'
            }`}
          >
            {image ? (
              <img
                src={image.url}
                alt="Selected document"
                className="max-h-64 rounded-xl object-contain shadow-md"
              />
            ) : (
              <>
                <div className="text-5xl">📄</div>
                <p className="font-semibold text-navy-700">{t.dropzoneText}</p>
                <p className="text-slate-400 text-sm">{t.dropzoneOr}</p>
                <span className="text-saffron-600 font-semibold text-sm underline underline-offset-2">
                  {t.chooseFile}
                </span>
              </>
            )}
          </div>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {/* Camera capture — simple file input with capture=environment */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              📁 {t.chooseFile}
            </button>
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              📷 {t.takePhoto}
            </button>
          </div>

          {image && (
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  {t.analyzing}
                </>
              ) : (
                <>🔍 {t.analyzeBtn}</>
              )}
            </button>
          )}

          {loading && <LoadingSpinner message={t.analyzing} />}
        </div>
      )}
    </main>
  );
}
