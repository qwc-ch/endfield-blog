# AGENTS.md

Personal static blog: SvelteKit 5 + Vite 8 + Tailwind 4 + mdsvex. Everything is prerendered with `adapter-static` into `build/`, with `404.html` as fallback and `trailingSlash: 'always'`.

## Commands

- Use `pnpm`; the lockfile is pnpm-only.
- `pnpm dev` — dev server.
- `pnpm check` — `svelte-kit sync && svelte-check`; the only automated check. It is currently clean, so keep it at 0 errors/warnings.
- `pnpm build` — static export. It also fetches every friend RSS feed for `/circle.json`, so network failures can slow the build. Results are cached for 12 hours in gitignored `.circle-cache.json`.
- `pnpm preview` — serve the built `build/` directory.
- There is no test or lint script; don't invent a single-test command.

## Wiring

- `src/routes/+layout.ts` sets global `prerender = true` and `trailingSlash = 'always'`. New pages must work without a server. Any new `+server.ts` should declare `export const prerender = true`, like the existing RSS/sitemap/robots/circle endpoints.
- Use the `#lib` → `src/lib` and `#config` → `src/config` aliases (defined in both `package.json` imports and `tsconfig.json`).
- Site settings live in `src/config/*.ts` and are re-exported from `src/config/index.ts`; import them via `#config`. External services (Waline, Memos, Bangumi, Umami) use hardcoded public URLs; there are no `.env` files, so don't look for hidden environment setup.
- `src/lib/posts.ts` is the content layer. It globs only top-level `src/content/posts/*.md`; slug is the filename without `.md`. `published` determines `No.xxx`, and word count/read time/categories are derived. Never hardcode those values. `draft: true` is excluded.
- `src/content/dynamic/*.md` is not read by `/dynamic/`; that page fetches Memos in the browser. Bangumi is also client-side (despite the "build-time" comment in `src/lib/bangumi.ts`). Only `/circle.json` fetches friend RSS at build time.
- `src/lib/deploy.ts` imports `ci-info`, which reads `process.env` at module load. Keep it server-only via `+layout.server.ts`; never import it into a client component. `Built.svelte` only receives the computed string.
- `src/lib/fx.js` is browser-only, `@ts-nocheck`, and excluded from tsconfig. Import it inside `onMount` or dynamically, not at module scope, or prerendering may touch `matchMedia`/DOM.
- Svelte 5 runes mode is forced for all project files by `vite.config.ts` (except `node_modules`). Use `$props`/`$state`/`$derived`, `onclick`, and snippets; not `export let` or `on:click`.

## Content and comments

- Frontmatter and migration details are in `README.md` (the "迁移旧文章" section). The blog's posts were migrated from `/home/qwc/Firefly`; the filename is the URL slug. Post images go under `static/posts/<slug>/`.
- Preserve Waline `path` identities: posts use `/posts/<slug>` (no trailing slash), dynamic items use `/dynamic/<id>/`, guestbook uses `/guestbook/`. Changing them orphans old comments.
- User-facing copy is Chinese; keep new UI text in Chinese.

## Styling

- Colors and components come from `src/lib/styles/endfield.css`. Page `<style>` blocks should only handle layout/spacing and should prefer `--ef-*` tokens over color literals.
- `src/app.css` maps the kit tokens to Tailwind and disables `rounded-*`/`shadow-*` utilities by default. Kit classes are global (`ef-*`), so target them from scoped styles with `:global(.ef-...)` when needed.
- Style load order is controlled in `src/routes/+layout.svelte`: `app.css` → `endfield.css` → `site.css`. Don't reorder casually.
- Variant settings (`data-ef-accent`, `data-ef-paper`, `data-ef-cut`, `data-ef-ground`) are set only on `<html>` in `src/app.html`.
- `timetable` and `guestbook` are deliberate Firefly ports with local styles (including rounded cards); don't normalize them to the kit without checking intent.

## Avoid

- Editing generated/ignored `build/`, `.svelte-kit/`, `.circle-cache.json`, or local `.shots*` screenshot artifacts.
- Assuming a backend exists: comments, Memos, Bangumi, and analytics are client-side third-party calls; there is no runtime server or database.
