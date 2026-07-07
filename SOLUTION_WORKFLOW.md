# SahAI — Solution Workflow

This document details the operational workflows for SahAI's two core features: **Scan & Simplify** and the **Complaint Wizard**.

---

## 🔍 Workflow 1: Scan & Simplify

This flow describes how a citizen translates a complex physical document into simplified, actionable steps.

```
                  [ Citizen receives physical document ]
                                    │
                                    ▼
                          [ Opens SahAI App ]
                                    │
                                    ▼
                           [ Navigates to /scan ]
                                    │
                                    ▼
                  [ Takes photo OR uploads image of doc ]
                   (capture="environment" for rear camera)
                                    │
                                    ▼
                     [ FileReader reads image file ]
                   (Converts to base64 inline data)
                                    │
                                    ▼
                [ Triggers callGeminiVision(base64) ]
             Sends to gemini-2.5-flash generateContent REST API
                                    │
                                    ▼
              [ Gemini processes via SCAN_SYSTEM_PROMPT ]
        Extracts document type, plain summary, next steps, etc.
         Forces response to match user's UI language (EN/HI/BN)
                                    │
                                    ▼
             [ Receives JSON Response & Strips Fences ]
          (Cleans ```json formatting before JSON.parse)
                                    │
                                    ▼
                     [ Render Results Interface ]
         - Urgency Badge (High/Medium/Low)
         - Actionable checklist with interactive checkboxes
         - Deadline alert box
         - "Read Aloud" voice button (Web Speech API)
```

---

## 📋 Workflow 2: Complaint Wizard & Dashboard

This flow illustrates the 3-step wizard that converts raw citizen feedback into a formatted civic complaint.

```
                [ Citizen has a local civic problem ]
                                  │
                                  ▼
                        [ Opens SahAI App ]
                                  │
                                  ▼
                     [ Navigates to /complaints ]
                                  │
                                  ▼
                 ┌──────────────────────────────────┐
                 │          STEP 1: DETAILS         │
                 │ 1. Pick a category card          │
                 │    (Potholes/Water/Garbage/etc.) │
                 │ 2. Type issue in natural language│
                 │ 3. Optionally upload photo       │
                 └──────────────────────────────────┘
                                  │
                                  ▼ Next Step
                 ┌──────────────────────────────────┐
                 │         STEP 2: LOCATION         │
                 │ 1. Enter address/landmark        │
                 │ 2. View bouncing pin on CSS map  │
                 └──────────────────────────────────┘
                                  │
                                  ▼ Analyse & Review
                 ┌──────────────────────────────────┐
                 │       CALLS GEMINI TEXT API      │
                 │ Processes description, category, │
                 │ and location to format complaint │
                 └──────────────────────────────────┘
                                  │
                                  ▼
                 ┌──────────────────────────────────┐
                 │          STEP 3: REVIEW          │
                 │ 1. Displays classified Dept      │
                 │ 2. Displays Urgency Level + Why  │
                 │ 3. Displays Formalized Draft     │
                 │ 4. Displays Clarifying Question  │
                 │    (if information was missing)  │
                 └──────────────────────────────────┘
                                  │
                                  ▼ Submit Complaint
                 ┌──────────────────────────────────┐
                 │             SUCCESS              │
                 │ Generates unique Reference ID    │
                 │ Saves record to localStorage     │
                 └──────────────────────────────────┘
                                  │
                                  ▼ Track Complaint
                 ┌──────────────────────────────────┐
                 │            DASHBOARD             │
                 │ Displays complaint cards         │
                 │ Interactive status click cycling:│
                 │ Pending ➔ In Progress ➔ Resolved │
                 └──────────────────────────────────┘
```

---

## 🌐 Dynamic Language Translation Workflow

SahAI handles translations dynamically without complex database setups:

```
               [ User selects language toggle (EN/HI/BN) ]
                                    │
                                    ▼
               [ LangContext updates active language code ]
                                    │
                                    ▼
       ┌────────────────────────────┴────────────────────────────┐
       ▼                                                         ▼
[ UI Labels Update ]                                   [ AI Prompt Adjusts ]
Translates buttons,                                    Passes language code to
placeholders, and                                      Gemini system prompt:
titles via i18n.js dictionary.                         "Always respond in Bengali/Hindi/English"
                                                                 │
                                                                 ▼
                                                       [ Gemini responds ]
                                                       Translates explanation summary
                                                       or draft complaint to match.
```
