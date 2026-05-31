---
name: Clerk auth setup
description: How Clerk auth is wired in the platipus Vite app
---

## Key decisions

- `publishableKeyFromHost` from `@clerk/react/internal` — never raw env var
- `proxyUrl={clerkProxyUrl}` is unconditional (empty in dev, auto-set in prod)
- Routes are exactly `path="/sign-in/*?"` and `path="/sign-up/*?"` (wouter optional wildcard)
- Tailwind v4: `@layer theme, base, clerk, components, utilities;` before `@import 'tailwindcss'`
- Vite config: `tailwindcss({ optimize: false })` to prevent prod build layer reordering

**Why:** Radicle.dev and Gitea cannot be OAuth providers (P2P / self-hosted, no universal endpoint).
GitHub and GitLab are toggled on via the Auth pane, not code.

**How to apply:** When adding more social providers, direct the user to the Auth pane in the workspace toolbar — no code changes needed.
