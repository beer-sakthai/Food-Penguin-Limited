# Repository Guidelines

## Project Structure & Module Organization

This is a React 19 + Vite dashboard with an Express/tsx backend entrypoint.
Source code lives in `src/`: `App.tsx` owns app state, navigation, and tab routing; `src/components/` contains dashboard tabs and shared UI; `src/data.ts` and `src/types.ts` hold seed data and TypeScript interfaces. Static assets live in `assets/`. The production output is generated in `dist/` and should not be hand-edited.

Root helper scripts such as `modify_*.cjs`, `update_*.cjs`, and `repair.cjs` are maintenance utilities from prior edits; prefer direct TypeScript/CSS changes unless a script is clearly relevant.

## Build, Test, and Development Commands

- `npm run dev` starts the Express/Vite development server on port `3000`.
- `npm run build` builds the Vite frontend and bundles `server.ts` to `dist/server.cjs`.
- `npm run start` runs the production bundle from `dist/`.
- `npm run lint` runs `tsc --noEmit`; this is the main type/check command.
- `npm run clean` removes generated build output.

If `npm run build` fails with a locked `dist/dev-server*.log`, stop the local dev server before rebuilding.

## Coding Style & Naming Conventions

Use TypeScript and React function components. Keep component filenames in PascalCase, for example `DataAnalystTab.tsx`, and keep types/interfaces in PascalCase. Use camelCase for state, derived values, and handlers such as `handleExportCSV`.

Styling is Tailwind-first through class names, with shared theme tokens and component utilities in `src/index.css`. Preserve the three-size typography system: detail text `14px`, normal labels `18px`, and numbers/key metrics `32px`.

## Testing Guidelines

There is no dedicated unit test framework configured yet. Validate changes with:

```bash
npm run lint
npm run build
```

For UI work, also open `http://localhost:3000/` and check the affected tab in both light and dark modes when practical.

## Commit & Pull Request Guidelines

Recent history mostly uses Conventional Commit-style messages, for example `feat: add global CSS...` and `chore: add package-lock.json`, with an occasional plain imperative subject. Prefer `feat:`, `fix:`, `chore:`, or `docs:` plus a concise summary.

Pull requests should describe the changed dashboard behavior, list verification commands, and include screenshots for visible UI changes. Mention any new environment requirements or API behavior.

## Security & Configuration Tips

Use `.env.example` as the template for local configuration. Do not commit secrets, Firebase credentials, API keys, generated reports with private data, or local `dist/` artifacts unless explicitly required.
