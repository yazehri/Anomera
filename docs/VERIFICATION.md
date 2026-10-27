# Verification record

Date: 27 October 2026

## Verified

- Production build: Next.js 16.4.3, successful.
- TypeScript strict check: successful.
- Engine tests: 10 passing; includes 8,000 seeded oracle cases.
- Browser: completed a 48-probe mock run locally and on the public Vercel deployment.
- Browser: inspected paired response evidence, filtered regressions by family, and reopened saved device history.
- Mobile viewport: 390 px, document scroll width equals client width (no horizontal overflow).
- Custom endpoint adapter: request contract, HTTP 429, and malformed responses verified with mocked transport.
- Browser console on the deployed evaluation: no warnings or errors observed.
- Supabase: evaluation_runs RLS enabled, owner-scoped policies installed, security advisor returned zero findings.
- Isolation check: a transaction with two synthetic users exposed one owned row and zero rows belonging to the other user; transaction rolled back.
- Authenticated insert check: an owner could save a run; a cross-owner insert was rejected by RLS; transaction rolled back.
- Production URL: https://blindspot-seven-sandy.vercel.app

## Not independently verified

- No paid real-model endpoint was invoked; mock findings are intentionally simulated.
- Email confirmation and an authenticated cloud save were not exercised with a real mailbox. Database ownership isolation was tested directly.
- GitHub automatic deployments require a GitHub login connection in Vercel. The first deployment used the connected Vercel source-file API.
- Long-running evaluations still require an open browser page.
