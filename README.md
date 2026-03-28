# TopOut — Construction Schedule PWA

A Progressive Web App that transforms clunky construction schedules into clean, role-based dashboards for owners, GCs, and subcontractors.

*Top Out (v.) — when a building structure reaches its highest point. The moment the last beam is set and the project starts its descent toward completion.*

## Features

### V1 — Current
- **PDF Upload → AI Parsing**: Drop any P6 export, MS Project PDF, or construction schedule and Claude parses it into structured data
- **Three Role Views**: Owner (milestone focus), GC (full control), Sub (trade-filtered)
- **Timeline View**: Collapsible phase cards with inline Gantt bars and color-coded status
- **List View**: Clean table layout with inline status editing
- **Persistent Status Updates**: Changes saved to localStorage (Supabase coming in V2)
- **Notification System**: In-app alerts for delays, milestones, due-today items, and upcoming activities
- **Push Notifications**: Browser push support for critical delays
- **PWA**: Installable on iOS/Android, offline-capable, service worker caching

### V2 — Planned
- Supabase backend for multi-user persistence
- Clerk authentication with role-based access
- Real-time sync across devices
- Photo documentation per activity
- Punch list module
- Daily report generation
- Change order tracking

## Getting Started

### Prerequisites
- Node.js 18+
- Anthropic API key (for PDF parsing)

### Setup
```bash
npm install
cp .env.local.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack
- **Next.js 14** — App Router
- **Tailwind CSS** — Utility-first styling
- **Claude API** — PDF schedule parsing
- **Service Worker** — Offline support + push notifications
- **localStorage** — V1 persistence (Supabase planned for V2)

## Deployment
```bash
vercel
```

## License
Proprietary — Built by Amey
