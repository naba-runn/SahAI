# SahAI — Project Description

> *"Built for the citizen who's afraid of government paperwork."*

SahAI is a free, open-source AI civic companion designed specifically for Indian citizens. It aims to bridge the gap between citizens and the complex, bureaucratic structures of government by simplifying dense official documents and streamlining the process of filing civic grievances.

---

## 🔴 The Problem

Every year, millions of Indian citizens receive official communications — tax demands, water bill notices, court summons, ration card updates, or local municipal orders. These documents are typically:
1. **Written in dense legal/bureaucratic jargon** that is difficult for a layperson to interpret.
2. **Drafted in English or formal Hindi**, creating a massive barrier for citizens whose primary language is a regional vernacular.
3. **Vague regarding deadlines and consequences**, leading to missed action items, penalizations, or unnecessary anxiety.

Furthermore, reporting local issues like potholes, broken streetlights, or water shortages is historically tedious. Citizens often do not know:
- Which department is responsible.
- How to frame a formal grievance.
- How to follow up or track the issue's resolution status.

This creates a power asymmetry where only those who can afford legal assistance or have administrative connections can comfortably navigate civic systems.

---

## 🟢 The Solution (SahAI)

SahAI acts as an intelligent intermediary. It offers a zero-friction, mobile-friendly interface designed to do two things exceptionally well:

### 1. Scan & Simplify (Document Parsing)
Citizens can take a photo of any physical document or upload an image. The AI-powered parser:
- Translates the document's core meaning into plain, 5th-grade reading level text.
- Extracts key details: **what the document is**, **why it matters**, **deadline/due dates**, and **documents required to respond**.
- Produces a **step-by-step checklist** of actionable next steps.
- Integrates text-to-speech to read the simplified explanation aloud, ensuring accessibility for low-literacy users.

### 2. Complaint Wizard (Grievance Triage)
Instead of filling out confusing government forms, citizens simply type their problem in their own language and style (e.g. *"gully mein paani jama hai"*). The system:
- Classifies the grievance into the correct department (e.g., Roads & Infrastructure, Waste Management).
- Rewrites the informal text into a structured, formal complaint letter suitable for official portals.
- Details the urgency rating with logical reasoning.
- Saves the complaint to a local, offline dashboard for personal tracking.

---

## ⚙️ Core Technical Architecture

SahAI is designed with a lightweight, browser-first, privacy-respecting architecture:

- **No Backend Server:** The app runs entirely client-side. AI inference is performed by calling the Gemini 2.5 Flash API directly from the browser using standard `fetch` REST calls.
- **Zero Database / Local-First:** All user data, including the database of filed complaints and custom statuses, is saved exclusively in the browser's `localStorage`.
- **Multilingual Support:** The interface supports English, हिंदी (Hindi), and বাংলা (Bengali). Prompt instructions are dynamically adjusted so that Gemini automatically replies in the exact language the user has selected.
- **Material You M3 Design:** Built using modern Material You design principles (color palettes, dynamic feedback, and card layouts) adapted from a Google Stitch project.
