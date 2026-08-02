# Sentinel Security Protocol Log

## 1. Vulnerability Pattern: Disabled Content Security Policy (CSP)

### Description
Express servers often disable the Content Security Policy header (`contentSecurityPolicy: false` in Helmet options) because default configurations break Vite, React, or Tailwind inline style/script injection. This leaves the application completely vulnerable to Cross-Site Scripting (XSS) and injection attacks in production.

### Mitigation & Secure Coding Standard
Rather than completely disabling the CSP, we must implement an **environment-aware** Content Security Policy configuration:
- **In Development**: Allow standard developer tooling integrations by adding `'unsafe-inline'`, `'unsafe-eval'` to `script-src` and `ws:`/`wss:` to `connect-src` to support Vite's Hot Module Replacement (HMR) and inline script/style injections.
- **In Production**: Strictly restrict `script-src` to `'self'` and require all connections to use secure origins, preventing unauthorized script executions while upgrading insecure connections where appropriate.
- **Common Directives**:
  - `defaultSrc: ["'self'"]`
  - `styleSrc: ["'self'", "'unsafe-inline'"]` (required for Tailwind CSS inline styling)
  - `imgSrc: ["'self'", "data:", "blob:"]` (supports base64 image uploads and media blobs)
  - `objectSrc: ["'none'"]` (prevents object/flash injection)
  - `upgradeInsecureRequests`: Force HTTPS upgrades in production while excluding localhost during local dev.

## 2. Testing Standard
Always assert that:
- The `Content-Security-Policy` header is properly populated with secure fallback directives.
- Frame guarding (`X-Frame-Options: SAMEORIGIN`) and mime sniffing protection (`X-Content-Type-Options: nosniff`) are successfully applied in parallel.
