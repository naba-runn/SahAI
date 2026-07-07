# SahAI — Civic AI Companion for Indian Citizens

> *"Built for the citizen who's afraid of government paperwork."*

---

## The Problem

Every year, millions of Indian citizens receive government notices, tax demands, eviction orders, court summons, utility disconnection letters, and ration card communications — written in dense legal or bureaucratic language that the average person cannot parse. The result:

- **Missed deadlines** because people didn't understand what action was required
- **Unresolved civic problems** (broken roads, water failures, garbage piles) because filing a formal complaint feels impossible
- **Power asymmetry** — citizens who can afford lawyers or know the right people navigate the system fine; everyone else doesn't

Language compounds this. Government documents are often in English or formal Hindi, even in states where neither is the citizen's first language.

**SahAI exists to close that gap.**

---

## What SahAI Does

SahAI is a free, open-source AI civic companion that helps Indian citizens:

1. **Understand** any government document — in plain language, in their own tongue
2. **File** civic complaints — without knowing which department to call or how to phrase a formal grievance

No sign-up. No backend. No data leaves your device except for the AI call. Works on mobile.

---

## Solution Workflow

### 🔍 Tool 1 — Scan & Simplify

```
Citizen receives a confusing government document
            │
            ▼
    Opens SahAI → /scan
            │
            ▼
  Takes a photo or uploads the document image
  (file input with capture="environment" for mobile rear camera)
            │
            ▼
  SahAI converts image → base64
  Sends to Gemini 2.5 Flash (Vision) with a civic-assistance system prompt
            │
            ▼
  Gemini analyses the document and returns structured JSON:
  ┌─────────────────────────────────────────────┐
  │  document_type    What kind of document      │
  │  issuing_dept     Who sent it                │
  │  plain_summary    What it means (plain lang) │
  │  action_required  What the citizen must do   │
  │  deadline         Any due date               │
  │  urgency          high / medium / low        │
  │  citizen_steps    Checklist of next actions  │
  └─────────────────────────────────────────────┘
            │
            ▼
  SahAI renders a clean result card
  with urgency badge + checklist + Read Aloud button
            │
            ▼
  Citizen understands the document and knows exactly what to do
```

---

### 📋 Tool 2 — Complaint Tracker (3-step wizard)

```
Citizen has a civic problem (pothole, broken streetlight, etc.)
            │
            ▼
    Opens SahAI → /complaints

┌─────────────────────────── STEP 1: Details ────────────────────────────┐
│  Picks an issue category:                                               │
│  Potholes | Streetlights | Garbage | Water Supply | Others             │
│                                                                         │
│  Describes the problem in their own words — any language, any style    │
│  "MG Road ke paas bahut bada gadda hai, 3 hafte se hai aur accident    │
│   ho chuka hai"                                                         │
│                                                                         │
│  Optionally attaches a photo                                            │
└─────────────────────────────────────────────────────────────────────────┘
            │  Next Step ▶
            ▼
┌─────────────────────────── STEP 2: Location ───────────────────────────┐
│  Types the address / area name                                          │
│  "MG Road, Near Bus Stand, Bengaluru"                                  │
│                                                                         │
│  Visual map placeholder confirms the location                           │
└─────────────────────────────────────────────────────────────────────────┘
            │  Analyse & Review ▶  (calls Gemini API)
            ▼
┌─────────────────────────── STEP 3: Review ─────────────────────────────┐
│  Gemini classifies the complaint and returns:                           │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │  department          Roads & Infrastructure              │          │
│  │  urgency             High                                │          │
│  │  urgency_reason      Present for 3 weeks, caused         │          │
│  │                      accidents — safety risk             │          │
│  │  suggested_title     "Large Pothole on MG Road           │          │
│  │                       Causing Accidents"                 │          │
│  │  formal_complaint    "A large and hazardous pothole is   │          │
│  │                       present on MG Road, near the bus   │          │
│  │                       stand, Bengaluru..."               │          │
│  │  clarifying_question (null if all info is present)       │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                         │
│  Citizen reviews → clicks Submit Complaint                              │
└─────────────────────────────────────────────────────────────────────────┘
            │  Submit ▶
            ▼
┌─────────────────────────── SUCCESS ────────────────────────────────────┐
│  Complaint saved to localStorage with:                                  │
│  • Unique Reference ID (e.g. #DB4452F4)                                 │
│  • Timestamp                                                            │
│  • Status: Pending                                                      │
└─────────────────────────────────────────────────────────────────────────┘
            │  Track My Complaint ▶
            ▼
┌─────────────────────────── DASHBOARD ──────────────────────────────────┐
│  Lists all past complaints with:                                        │
│  • Department icon + title                                              │
│  • Urgency badge                                                        │
│  • Submission date                                                      │
│  • Clickable status badge: Pending → In Progress → Resolved            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Key Design Principles

| Principle | How it's applied |
|---|---|
| **No literacy barrier** | Plain-language output; Read Aloud via Web Speech API |
| **No language barrier** | UI in EN/HI/BN; AI responds in the citizen's detected language |
| **No tech barrier** | Works on any smartphone browser; camera capture built in |
| **No trust barrier** | No account, no data server, no tracking. All storage is local. |
| **No cost barrier** | Free to use; only needs a Gemini API key (free tier available) |

---

## Features

### 🔍 Scan & Simplify
Upload a photo of any government notice, bill, tax demand, ration card letter, court summons, or form. SahAI uses Gemini Vision to:
- Explain what the document means **in plain language**
- Extract the **deadline** and **action required**
- Identify the **issuing department**
- Flag the **urgency level** (High / Medium / Low)
- Show a **citizen-friendly checklist** of next steps
- Read the result aloud via the **Web Speech API**

### 📋 Complaint Tracker
Describe a civic problem in your own words (any language, any style). SahAI:
- Classifies the issue into the correct **government department**
- Rewrites it as a **formal complaint** suitable for official submission
- Generates a **suggested complaint title**
- Rates the **urgency** and explains why
- Asks a **clarifying question** if key details are missing
- Saves complaints locally with a **reference ID** and **status tracker**

### 🌐 Multilingual UI
Switch between **English**, **हिंदी**, and **বাংলা** at any time. The AI always responds in the language it detects from your input.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v3 (Material You / M3 tokens) |
| Design System | Google Stitch — 7 screens implemented |
| Routing | react-router-dom v6 |
| AI | Gemini 2.5 Flash (`generateContent` REST API) |
| Icons | Material Symbols Outlined |
| Font | Public Sans |
| Storage | `localStorage` (no backend, no database) |

---

## Project Structure

```
SahAI/
├── .env                          ← API key (never committed)
├── .gitignore                    ← .env explicitly excluded
├── index.html
├── tailwind.config.js            ← M3 color tokens + Public Sans + Stitch spacing
├── src/
│   ├── main.jsx
│   ├── App.jsx                   ← Router + LangProvider + 3 routes
│   ├── index.css                 ← Material Symbols, Public Sans, Stitch component classes
│   ├── i18n.js                   ← EN / HI / BN label maps
│   ├── context/
│   │   └── LangContext.jsx       ← Language context + useLang hook
│   ├── lib/
│   │   └── gemini.js             ← callGeminiText + callGeminiVision
│   ├── components/
│   │   ├── Navbar.jsx            ← Top bar + language toggle + mobile bottom nav
│   │   ├── UrgencyBadge.jsx      ← Colour-coded High / Medium / Low badge
│   │   └── LoadingSpinner.jsx
│   └── pages/
│       ├── Landing.jsx           ← Hero + bento cards + How It Works section
│       ├── ScanPage.jsx          ← Image upload → Gemini Vision → result card
│       └── ComplaintsPage.jsx    ← 3-step wizard → AI → localStorage dashboard
```

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/naba-runn/SahAI.git
cd SahAI
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your Gemini API key

Create a `.env` file in the project root:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Get a free key at [aistudio.google.com/api-keys](https://aistudio.google.com/api-keys).

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Security Notes

- The Gemini API key is called **directly from the browser** via `fetch` — this is intentional (no backend server).
- Keep your API key restricted to `generativelanguage.googleapis.com` in Google AI Studio.
- All complaint data is stored in **your browser's `localStorage`** — nothing is sent to any server.
- `.env` is in `.gitignore` and will never be committed.

---

## Design

The UI is built from a **Google Stitch** design project (7 screens) using the **Material You M3** colour system:

| Token | Value | Role |
|---|---|---|
| `primary` | `#9d4300` | Deep amber-brown |
| `primary-container` | `#f97316` | Saffron — buttons, accents |
| `secondary` | `#455f87` | Navy — headings |
| `background` / `surface` | `#fff8f2` | Warm cream |
| `outline-variant` | `#e0c0b1` | Card borders |

---

## Scripts

```bash
npm run dev      # Start dev server at localhost:5173
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
```

---

## Roadmap

- [ ] PDF document support
- [ ] Voice input for complaints (Web Speech API)
- [ ] Share complaint as PDF
- [ ] More languages (Tamil, Telugu, Kannada, Marathi)
- [ ] PWA / installable on mobile

---

## License

MIT — free to use, modify, and distribute.

---

*SahAI · Built for Bharat · AI output may be imperfect — always verify important actions with an official.*
