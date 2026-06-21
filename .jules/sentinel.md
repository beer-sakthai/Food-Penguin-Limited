## 2026-06-21 - [Information Leakage] API Error Responses
**Vulnerability:** The Express backend was leaking internal error messages and stack traces to the client via 'err.message'.
**Learning:** Endpoints were using 'res.status(500).json({ error: err.message })', which can expose database schema details, file paths, or internal logic.
**Prevention:** Always return generic, user-friendly error messages in production and log the actual error details server-side.
