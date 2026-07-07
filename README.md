# SahAI — Civic AI Companion for Indian Citizens

> *"Built for the citizen who's afraid of government paperwork."*

SahAI is a free, open-source civic companion that helps Indian citizens decode dense government documents and file civic complaints — in their own language, with zero bureaucratic friction.

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
│   │   └── gemini.js             ← callGeminiText + callGeminiVision (fence-stripping, error handling)
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

## Complaint Wizard — How It Works

The `/complaints` route is a **3-step guided flow**:

```
Step 1 — Details
  ↳ Pick an issue category (Potholes / Streetlights / Garbage / Water / Others)
  ↳ Describe the problem in your own words
  ↳ Optionally attach a photo

Step 2 — Location
  ↳ Type the address or area name
  ↳ Visual map placeholder shows the entered location

Step 3 — Review
  ↳ Gemini analyses the complaint
  ↳ Shows: department, urgency, formal complaint text, suggested title
  ↳ One click to submit → saved to localStorage with a unique reference ID

Dashboard
  ↳ Lists all past complaints with status badges
  ↳ Click a badge to cycle: Pending → In Progress → Resolved
```

---

## Document Scanner — Gemini Vision

The `/scan` route sends the image as **base64 inline data** to Gemini 2.5 Flash using the exact system prompt:

```
You are a civic assistance AI helping Indian citizens understand government documents...
```

Response is parsed from JSON, with graceful fallback if:
- Gemini returns an `{"error": ...}` shape
- The response cannot be parsed (non-document image, blur, etc.)
- The API key is missing or invalid

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
