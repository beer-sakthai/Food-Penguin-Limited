# Project: Food Penguin Limited - Corporate Dashboard

This is a comprehensive, unified corporate dashboard for Food Penguin Limited. It's a modern web application designed for efficient restaurant and food-chain management.

## 🌟 Core Technologies

*   **Framework**: React 18 with TypeScript, built with Vite.
*   **Backend**: Node.js with Express, serving the frontend and providing a backend for AI integrations.
*   **Styling**: Tailwind CSS for a responsive, modern UI.
*   **AI Integration**: The backend heavily utilizes the Google Gemini API for various features, including strategic advice, image generation, and data analysis.
*   **Data Visualization**: `recharts` is used for creating interactive charts.
*   **Icons**: `lucide-react` for a consistent icon set.

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18+ recommended)
*   `npm` for package management.

### Environment Variables

The application uses the Gemini API for its AI features. You need to create a `.env` file in the root directory and add your API key:

```
GEMINI_API_KEY=your_api_key_here
```

You can get an API key from Google AI Studio.

### Key Scripts

*   **Development**: To run the application in development mode with hot-reloading:
    ```bash
    npm run dev
    ```
    This will start the server on `http://localhost:3000`.

*   **Building for Production**: To create a production-ready build:
    ```bash
    npm run build
    ```
    This command bundles the React frontend and the Express server into the `dist` directory.

*   **Running in Production**: To start the production server:
    ```bash
    npm run start
    ```

*   **Linting**: To perform a static type-check of the code:
    ```bash
    npm run lint
    ```

## 📂 Project Structure

*   `server.ts`: The Express server entry point. It handles API requests, particularly for the Gemini AI integrations, and serves the frontend application.
*   `src/App.tsx`: The main React component that orchestrates the entire frontend, including state management, navigation, and role-based access control.
*   `src/components/`: Contains the individual "tab" components, each representing a major feature of the dashboard (e.g., `SellTab.tsx`, `ProductionTab.tsx`).
*   `src/types.ts`: Centralized TypeScript interfaces for data structures used throughout the application.
*   `src/data.ts`: Provides initial data and state for the application.
*   `vite.config.ts`: Vite configuration file.
*   `package.json`: Defines project dependencies and scripts.

## 💡 Development Conventions

*   **State Management**: State is managed locally within `App.tsx` using `useState` and passed down to child components via props.
*   **Styling**: Utilize Tailwind CSS utility classes for styling. Global styles are in `src/index.css`.
*   **API**: The backend API routes are defined in `server.ts`. Frontend components interact with these endpoints for AI-powered features.
*   **Modularity**: The application is structured around feature-based tabs, making it easy to locate and work on specific areas of functionality.

## 🤖 Rules for AI Assistants & Agents

These rules apply to **any** AI assistant or agent (Gemini, Gemini Code Assist,
Claude, Copilot, etc.) making changes here. The goal: **keep CI green and keep
the project safe and secure.**

### 1. Never break CI

CI (`.github/workflows/ci.yml`) runs on every PR to `main`, in this order:

```bash
npm ci        # exact install from package-lock.json (fails if lockfile is out of sync)
npm run lint  # tsc --noEmit — type-checks the WHOLE project (src, server, tests, prisma)
npm run build # vite build + esbuild bundle of server.ts
```

**Before committing or pushing, run the full pipeline locally and make sure it
all passes:**

```bash
npm ci && npm run lint && npm run build && npm test
```

If a step fails locally, it will fail in CI. Do not push hoping otherwise.

### 2. Keep `package.json` and `package-lock.json` in sync

This is the most common cause of CI failure here — `npm ci` fails hard when the
two disagree.

*   After changing any dependency, run `npm install` to regenerate the lockfile
    and **commit the lockfile in the same change**.
*   Never edit dependency versions in only one of the two files.
*   `vitest` must match the installed `vite` major (vite 6 needs vitest ≥ 3; we
    use vitest 4). A mismatched vitest pulls in a nested second copy of vite and
    breaks `vite.config.ts` type-checking.

### 3. Prisma

*   `@prisma/client` is generated, not committed; the `postinstall` script runs
    `prisma generate`. It is written as `prisma generate || true` so a
    production-only install (`npm ci --omit=dev`, where the `prisma` CLI is not
    present) cannot fail. `@prisma/client` is not imported at runtime, so the
    CLI stays out of production `dependencies`.
*   Prisma 7 removed the `datasourceUrl` constructor option — use
    `new PrismaClient()`; the URL comes from `prisma.config.ts`.

### 4. Type safety

*   `npm run lint` checks every file, including `tests/` and `prisma/`. New code
    must type-check.
*   Prefer precise types over `any`. For generic hooks (e.g.
    `useApi<T, P = void>`), pass explicit type arguments at call sites instead
    of widening the default to `any`.
*   In Vitest tests, import `describe`/`it`/`expect` from `vitest`.

### 5. Security & safety — do not regress these

*   **Never commit secrets.** `.env*` is git-ignored (except `.env.example`).
    Keep real keys out of the repo, logs, error messages, commits, and PR text.
*   **`GEMINI_API_KEY`:** the server reads it from the environment and falls
    back to simulation responses when it is missing or still the placeholder.
    Never hard-code or echo the key, and keep the missing-key fallback intact so
    the app degrades gracefully instead of leaking or crashing.
*   **Keep input validation on the server.** AI routes validate input (e.g. the
    dish-photo endpoint caps base64 payloads at 12 MB). Do not remove size/type
    checks; add them for any new endpoint that accepts user input.
*   **Do not weaken RBAC.** Tab access is gated by `rolePermissions` in
    `App.tsx`; changes must be deliberate.
*   **`prisma/dev.db` is local dev/seed data only** — never store real or
    sensitive data there (it is tracked in git).
*   Treat all request bodies, query params, and uploads as untrusted; sanitize
    before passing them to filesystem, shell, or database operations.
*   Run `npm audit` when adding or bumping dependencies; avoid known-vulnerable
    packages.

### Pre-push checklist

1.  `npm ci` succeeds from a clean state (lockfile in sync).
2.  `npm run lint` passes.
3.  `npm run build` succeeds.
4.  `npm test` passes.
5.  No secrets, `.env` files, or sensitive data staged.
6.  Lockfile committed alongside any dependency change.
