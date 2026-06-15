# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Workflow

Before starting any work, state how you will verify it.
After finishing, run the verification and report results.

Verification for this repo (no test framework configured):
1. `npm run build` — catches TypeScript and compilation errors
2. `npm run lint` — catches ESLint issues

## Commands

```bash
npm run dev      # start dev server (localhost:4321)
npm run build    # production build → dist/
npm run preview  # serve the dist/ build locally
npm run lint     # run ESLint on .ts/.tsx files
```

There is no test framework configured.

## Architecture

**Astro 6** with **React 19** (via `@astrojs/react`), TypeScript (strict), and **Tailwind CSS v4**.

- **Static output only.** `output: 'static'` in `astro.config.mjs`. No SSR, no API routes, no server middleware.
- **Pages in `src/pages/`** as `.astro` files. Only one page: `index.astro`.
- **React islands** for all interactive UI. Use `client:load` in `.astro` files to hydrate. No `'use client'` directive (that's Next.js).
- **`@/*`** path alias maps to `src/` (e.g. `@/lib/types`).
- **Engine (`src/lib/engine/`)** is pure TypeScript — no framework imports, no DOM. Independently testable.
- **Fonts:** Inter (UI) and JetBrains Mono (machine values) loaded via Google Fonts link in `index.astro`.

**Tailwind CSS v4** via `@tailwindcss/vite` Vite plugin (NOT `@astrojs/tailwind`):
- `src/styles/tokens.css` uses `@import "tailwindcss"` at the top.
- Custom color tokens go inside `@theme { ... }` in that file.
- Import `tokens.css` in `index.astro` frontmatter: `import '../styles/tokens.css'`.

## Project: HeaderLens

A client-side Microsoft 365 / EOP / MDO email header analyzer. All analysis runs in the browser. No data leaves the client except domain names sent to the DNS resolver.

**Build phases:**
- **Phase 1 (current):** Complete UI driven by hard-coded mock fixtures in `src/lib/fixtures/`.
- **Phase 2 (pending approval):** Real parsing engine + DoH DNS client replacing the fixtures.

The `AnalysisResult` contract in `src/lib/types.ts` is shared between both phases — the UI never changes when the engine is wired up.
