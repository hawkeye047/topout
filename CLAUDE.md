# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run start    # Start production server
```

No test runner or linter is configured.

## Architecture

TopOut is a **Next.js 14 App Router** PWA for construction schedule management. It parses PDF construction schedules (P6, MS Project exports) via the Claude API and displays them as role-based dashboards.

### Data Flow

1. **Upload**: User uploads a PDF or loads demo data
2. **Parse**: `app/api/parse/route.js` sends the PDF (base64) to the Anthropic Messages API, which returns structured JSON
3. **Display**: `app/page.js` (the single page, client component) manages all state and renders views
4. **Persist**: All data stored in localStorage via `lib/storage.js` (Supabase planned for V2)

### Schedule Data Shape

The core data model is a schedule object with `projectName`, `projectStart`, `projectEnd`, and `phases[]`. Each phase has `activities[]` with `name`, `start`, `end`, `duration`, `status` (complete/in-progress/not-started/delayed), `owner`, and `notes`.

### Key Modules

- **`app/page.js`** — Single-page app root. All state (schedule data, role, view, notifications) lives here and flows down as props.
- **`app/api/parse/route.js`** — Server-side API route. Calls Anthropic API with PDF document input. Requires `ANTHROPIC_API_KEY` in `.env.local`.
- **`lib/utils.js`** — Phase color mapping (`PHASE_COLORS`), status config (`STATUS_MAP`), date helpers, stats calculator, and Gantt metrics.
- **`lib/storage.js`** — localStorage wrapper with keys: `topout_schedule`, `topout_notifications`, `topout_prefs`.
- **`lib/notifications.js`** — Alert generation from schedule data (delayed, due-today, upcoming, milestone) and browser Notification API integration.

### Three Role Views

State is managed via `role` (owner/gc/sub) and `view` (timeline/list):
- **Owner**: High-level milestone focus
- **GC**: Full schedule control
- **Sub**: Filtered by trade via `subFilter` state; maps filtered indices back to original data for status updates

### PWA

- `public/sw.js` — Service worker for offline caching
- `public/manifest.json` — Web app manifest
- `next.config.js` — Serves sw.js with correct `Service-Worker-Allowed` header
- `components/InstallPrompt.jsx` — Handles PWA install prompt

## Styling

Tailwind CSS with custom `brand` color palette (amber/orange tones) and extended slate shades. Fonts: DM Sans (body), JetBrains Mono (monospace). Path alias `@/*` maps to project root.

## Environment

Requires `ANTHROPIC_API_KEY` in `.env.local` for PDF parsing. The parse route calls the Anthropic API directly via fetch (no SDK).
