# Sentinel Security Log

## [HIGH] Hardcoded Admin Credentials in Frontend Mock Storage
- **Vulnerability**: The `LoginScreen.tsx` component contained a fallback default user `admin` with password `password`.
- **Impact**: Anyone accessing the login page could see the credentials and log in with Admin privileges, bypassing intended authentication controls.
- **Fix**: Removed the hardcoded fallback from the `localStorage` retrieval logic and deleted the UI hint.
- **Verification**: Frontend verification confirmed the credentials no longer work and the UI hint is removed. Registration logic was verified to still function correctly.
