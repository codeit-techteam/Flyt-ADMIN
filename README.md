# FLYT Admin Console

Production-oriented admin web app for the FLYT ride-hailing platform.

**Project root:** this folder (`FLYT-ADMIN/`). There is no nested app directory.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS v4
- Lucide React icons
- Recharts (dashboard analytics)
- Zod / React Hook Form ready for deeper forms
- Local demo data via `src/services/`

## Brand assets

Supplied FLYT logos live in `public/brand/`:

| File | Use |
| --- | --- |
| `flyt-wordmark-ink.png` | Login / sidebar wordmark |
| `flyt-wordmark-white.png` | Dark / purple surfaces |
| `flyt-logo-lockup.png` | Wordmark + tagline |
| `flyt-icon-1024.png` | Favicon / compact brand |
| `flyt-mark.png` | Compact mark |

Primary brand colour: Royal Purple `#3D1E63` (approved token from FLYT brand guidelines).

## Commands

```bash
cd FLYT-ADMIN
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run typecheck
npm run lint
npm run build
```

## Auth note

`/login` uses a **local demo session** (`localStorage`). Any valid email + password (8+ chars) works. This is not production authentication.

## Demo data

All operational screens (dashboard KPIs, rides, pilots, SOS, CMS, payments, etc.) use the mock layer in `src/services/mock-data.ts`. A banner indicates demonstration mode. Set `NEXT_PUBLIC_API_BASE_URL` when a backend is available.
