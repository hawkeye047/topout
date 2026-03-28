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

TopOut is a **Next.js 14 App Router** PWA for construction schedule management. It parses PDF construction schedules via the Claude API and displays them as role-based dashboards with a dark industrial "Precision Brutalism" UI.

### Routing

- **`/`** — Project selector & landing page. Shows existing projects or the upload/demo flow.
- **`/project/[id]`** — Individual project dashboard. Protected by `ProjectGate` (PIN auth). Contains the full schedule view with timeline, list, daily log, and notifications.
- **`/api/parse`** — PDF schedule parsing via Anthropic API.
- **`/api/daily-log`** — AI-powered daily log parsing. Takes natural language site reports and returns structured activity updates.

### Data Model (V2)

All project data is managed through `lib/dataModel.js`. Each project is stored as a single localStorage entry keyed by `topout_project_{id}`. An index at `topout_projects_index` tracks all projects.

**Project structure**: `id`, `name`, `password` (GC 6-digit PIN), `ownerPassword` (read-only PIN), `schedule` (phases/activities with V2 fields like `actualStart`, `actualEnd`, `projectedEnd`, `percentComplete`, `isCriticalPath`, `predecessors`), `dailyLogs[]`, `changeOrders[]`, `delays[]`, `notifications[]`.

Helper functions: `createProject()`, `getProject()`, `saveProject()`, `listProjects()`, `deleteProject()`, `verifyPassword()`, `addDailyLog()`, `applyDailyLogUpdates()`, `addChangeOrder()`, `addDelay()`, `migrateV1Data()`.

Session auth is stored in sessionStorage via `getSession()`/`setSession()`/`clearSession()`.

### Auth Flow

No external auth — uses project-specific 6-digit PINs:
- GC code (`project.password`) → full edit access
- Owner code (`project.ownerPassword`) → read-only milestone view
- `ProjectGate` component checks sessionStorage, shows PIN input if unverified
- Role is determined by which code was entered (overrides manual toggle)

### Key Components

- **`ProjectGate.jsx`** — PIN lock screen with 6-digit input, auto-submit, shake animation on error, 5-attempt lockout
- **`ShareModal.jsx`** — Shows project URL + GC/Owner codes with copy-to-clipboard
- **`DailyLogPanel.jsx`** — Slide-over panel: free-text input → AI parse → review parsed updates → confirm & apply to schedule
- **`TopBar.jsx`** — Sticky header with TOPOUT wordmark, role toggle, share/daily-log/notification/reset buttons
- **`TimelineView.jsx`** — Collapsible phase cards with Gantt bars and expandable activity detail panels
- **`ListView.jsx`** — Table view with phase dividers and inline status dropdowns

### Legacy Compatibility

`lib/storage.js` still exists for backward compatibility. The root `page.js` auto-migrates V1 data (from `topout_schedule` localStorage key) into a V2 project on first load.

### PWA

- `public/sw.js` — Service worker for offline caching
- `public/manifest.json` — Web app manifest
- `next.config.js` — Serves sw.js with correct `Service-Worker-Allowed` header
- `components/InstallPrompt.jsx` — Bottom card with install CTA

## Styling

Dark industrial "Precision Brutalism" design system. Tailwind CSS with custom color tokens:
- Surface hierarchy: `surface` (#0b1326) → `surface-container-low` (#131b2e) → `surface-container-high` (#222a3d) → `surface-container-highest` (#2d3449)
- Primary accent: `primary` (#ffc174), `primary-container` (#f59e0b)
- Secondary: `secondary` (#b7c8e1)
- Fonts: Manrope (headlines, `font-headline`), Inter (body, `font-sans`)
- No rounded corners >4px. No drop shadows. No 1px borders for sectioning — use background color shifts.
- Machine gradient for CTAs: `linear-gradient(135deg, #ffc174, #f59e0b)`

## Environment

Requires `ANTHROPIC_API_KEY` in `.env.local` for both PDF parsing and daily log AI features. Both API routes call the Anthropic Messages API directly via fetch (no SDK).
