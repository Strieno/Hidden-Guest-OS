# Hidden Guest OS — THE GATE Mystery Guest Training OS

A bilingual (Arabic / English), data-driven training and readiness system for hotel front-desk teams. Built as a static, privacy-friendly PWA-style app — **all data stays on the device**.

## Features

- **Readiness engine** — real statistics computed from assessment history: overall readiness, 7-day average, 30-day trend, best/previous score, improvement, category scores and critical failures. Charts with Recharts.
- **Mystery Guest Exam** — timed assessments (full / random / by category) with notes, category breakdown and detailed reports.
- **Mystery Guest Simulator** — interactive branching scenarios with 9 guest personalities (normal, impatient, angry, VIP, confused, family, business, foreign, mystery). Every decision affects service, communication, accuracy, satisfaction and compliance. Critical mistakes are flagged instantly.
- **Phone Call Simulator** — branching call scenarios (availability, reservations, negotiation, early/late, transport, Wi-Fi, housekeeping, maintenance, lost & found, wake-up, complaints, fully booked, Booking.com, English callers) evaluated on 7 axes with optional ring sound.
- **Adaptive Training** — weak points analyzed into priority levels (LOW → CRITICAL) with an automatically reordered training queue; weak standards appear more often.
- **Employees** — independent local profiles (name, role, avatar, XP, streak, history, notes) with a selector.
- **Supervisor Mode** — team readiness table with trends, critical failures, weakest areas and per-employee inspection.
- **Gamification** — XP, 5 levels (Trainee → Mystery Guest Master), 12 achievements with unlock animations.
- **Daily Challenge** — a new 1–3 minute scenario every day (+XP).
- **Front Office Academy** — searchable knowledge base (SOPs, etiquette, complaints, upselling, grooming, facilities, emergencies, privacy, mystery standards) linked to assessment questions.
- **Command Palette** — Ctrl/Cmd + K quick actions.
- **Shift Readiness** — categorized daily checklist (appearance, desk, PMS, cash, rooms, facilities, arrivals, phone, emergency) saved per day.
- **Questionnaire preview** — the official THE GATE mystery guest form imported from the Arabic PDF.
- **Admin** — full question builder (bilingual, search, filter, duplicate, delete, reset, import/export).
- **Settings & Data safety** — language, sound, export/import/reset all data locally.
- **i18n** — complete Arabic (RTL) and English (LTR) with instant switching while preserving state.

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL (e.g. `http://localhost:5173/Hidden-Guest-OS/`).

## Build for GitHub Pages

```bash
npm run build   # outputs to dist/ with base /Hidden-Guest-OS/
```

The included GitHub Actions workflow (`pages.yml`) deploys `dist/` to GitHub Pages automatically.

## Project structure

```
src/
  App.tsx            — root shell, routing, lazy-loaded views
  lib/               — types, i18n, storage, readiness engine, sound
  data/              — questions, achievements, academy, scenarios, phone scenarios, shift checklist
  hooks/useStore.tsx — global state + persistence + XP/achievements
  components/        — Shell, CommandPalette, Charts, UI primitives, AchievementToast
  features/          — dashboard, assessment, simulator, phone, training, shift,
                       weak-points, reports, employees, supervisor, achievements,
                       academy, admin, settings, questionnaire
app/                 — entry + global design system (globals.css)
lib/                 — question bank (JSON) and questionnaire data
```

## Privacy

No backend. All employee histories, questions, settings and achievements are stored in `localStorage` on the device. Use **Settings → Export Data** to back up.
