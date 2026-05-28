# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start Vite dev server (HMR)
npm run build      # tsc -b && vite build
npm run lint       # ESLint
npm run test       # vitest run (single pass)
npm run test:watch # vitest watch mode
npm run preview    # preview production build
```

Run a single test file:
```bash
npx vitest run src/__tests__/Navbar.test.tsx
```

## Architecture

This is a **restaurant landing page** with two distinct visual themes implemented as separate routes:

| Route | Page | Theme |
|-------|------|-------|
| `/` | `MuseumPage` | Dark museum aesthetic — black/gold, serif typography |
| `/glass` | `GlassPage` | Light glass morphism — frosted surfaces, warm white |

A floating `PageSwitcher` component (fixed bottom-right) lets users toggle between themes at runtime.

**Component layout per page:**
```
Page
├── Navbar (layout/)   or  GlassNavbar (glass/)
├── HeroSection
├── AboutSection
├── MenuSection
├── ReservationSection
├── GallerySection
├── LocationSection
├── Footer
├── PageSwitcher
└── Toaster (sonner)
```

Each section has two implementations — one under `src/components/sections/` (Museum theme) and a parallel one under `src/components/glass/` (Glass theme).

**Key patterns:**
- `useScrollAnimation` hook (`src/hooks/useScrollAnimation.ts`) — `IntersectionObserver`-based fade-in. Uses a `Proxy` around the ref to handle production build timing where the element may attach before the `useEffect` runs. Pass the returned `ref` directly to the target element.
- `src/components/three/TrainScene.tsx` — animated Three.js train used in the Museum hero, built with `@react-three/fiber`. The `Canvas` component wrapping `TrainScene` lives in `HeroSection`.
- Menu data lives in `src/data/menu.ts` and is shared across both themes.
- `src/lib/utils.ts` — re-exports `cn` (clsx + tailwind-merge).
- UI primitives under `src/components/ui/` are shadcn/ui components (Radix-based).

**Path alias:** `@` maps to `src/` (configured in `vite.config.ts` and `tsconfig.app.json`).

## Styling

Tailwind v3 with custom tokens defined in `tailwind.config.ts`:

- `gold` / `gold-dark` — primary brand accent (`#C9A84C` / `#8B6914`)
- `brand-dark` / `brand-darker` — Museum dark backgrounds
- `surface` / `pearl` / `warm-white` — Glass theme light backgrounds
- Fonts: `font-display` → Playfair Display (serif headings), `font-sans` → Inter
- Custom animation: `animate-fade-in-up` (fadeInUp keyframe, 0.6s ease-out)

## Tests

Tests use Vitest + jsdom + Testing Library. Setup file: `src/test/setup.ts` (imports `@testing-library/jest-dom`). Tests live in `src/__tests__/`.

## Deployment

Deployed on Vercel. `vercel.json` contains a single SPA rewrite rule (`/*` → `/index.html`) required for client-side routing to work on direct URL access.
