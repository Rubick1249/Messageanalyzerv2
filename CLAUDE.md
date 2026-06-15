# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server (Turbopack by default, localhost:3000)
npm run build    # production build (Turbopack by default)
npm run start    # serve production build
npm run lint     # run ESLint (do NOT use `next lint` — it was removed in v16)
```

There is no test framework configured.

To use Webpack instead of Turbopack, pass `--webpack` (e.g. `next build --webpack`).

## Architecture

**Next.js 16.2.9** with React 19.2, TypeScript (strict), and Tailwind CSS v4.

- **App Router only** (`app/` directory). No Pages Router.
- **Server Components by default.** Add `'use client'` only where state, event handlers, lifecycle hooks, or browser APIs are needed.
- **`@/*`** path alias maps to the repo root (e.g. `@/app/ui/button`).
- **Fonts:** Geist Sans and Geist Mono loaded via `next/font/google`, exposed as CSS variables `--font-geist-sans` / `--font-geist-mono`.

**Tailwind CSS v4** syntax differs from v3:
- `globals.css` uses `@import "tailwindcss"` (not `@tailwind` directives).
- Custom tokens go inside `@theme inline { ... }`, not `tailwind.config.js`.

## Next.js 16 Breaking Changes

Read `node_modules/next/dist/docs/` before writing Next.js code. Key differences from v14/v15:

**Async Request APIs (fully async — no synchronous fallback):**
`cookies()`, `headers()`, `draftMode()`, `params`, and `searchParams` are all Promises and must be `await`ed.

```tsx
// params and searchParams are now Promise<...>
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
}
```

Use `npx next typegen` to generate `PageProps`, `LayoutProps`, and `RouteContext` type helpers.

**`middleware` renamed to `proxy`:**
The file must be named `proxy.ts` / `proxy.js` and export a `proxy` function. The `edge` runtime is not supported in `proxy`; keep `middleware.ts` only if you need the edge runtime. Config flags like `skipMiddlewareUrlNormalize` are renamed to `skipProxyUrlNormalize`.

**Caching APIs:**
- `cacheLife` and `cacheTag` are stable — drop the `unstable_` prefix.
- `revalidateTag(tag, cacheLifeProfile)` now requires a second argument (e.g. `'max'`).
- `updateTag(tag)` (Server Actions only) provides immediate cache invalidation.
- `refresh()` from `next/cache` refreshes the client router from a Server Action.
- PPR is now enabled via `cacheComponents: true` in `next.config.ts` (not `experimental.ppr`).

**Other removals / changes:**
- `next build` no longer runs the linter. Run `npm run lint` separately.
- `next lint` CLI command removed; use `eslint` directly.
- `serverRuntimeConfig` / `publicRuntimeConfig` removed; use `process.env` and `NEXT_PUBLIC_` prefix.
- `next/legacy/image` deprecated; use `next/image`.
- `images.domains` deprecated; use `images.remotePatterns`.
- Local images with query strings require `images.localPatterns.search` config.
- Parallel route slots require explicit `default.js` files or builds fail.
- `experimental.turbopack` moved to top-level `turbopack` in `next.config.ts`.
- AMP support fully removed.
- `scroll-behavior: smooth` on `<html>` is no longer overridden during navigation; add `data-scroll-behavior="smooth"` to `<html>` to restore the previous behavior.
- Dev output goes to `.next/dev`; production build output remains `.next`.
