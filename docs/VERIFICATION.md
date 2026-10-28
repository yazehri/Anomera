# Verification record

Date: 27 October 2026

## Verified

- Production build: Next.js 16.4.3, successful.
- TypeScript strict check: successful.
- Engine tests: 16 passing; includes 8,000 seeded oracle cases.
- Browser: completed a 48-probe mock run locally and on the public Vercel deployment.
- Browser: inspected paired response evidence, filtered regressions by family, and reopened saved device history.
- Mobile viewport: 390 px, document scroll width equals client width (no horizontal overflow).
- Custom endpoint adapter: request contract, HTTP 429, and malformed responses verified with mocked transport.
- Browser console on the deployed evaluation: no warnings or errors observed.
- Supabase: evaluation_runs RLS enabled, owner-scoped policies installed, security advisor returned zero findings.
- Isolation check: a transaction with two synthetic users exposed one owned row and zero rows belonging to the other user; transaction rolled back.
- Authenticated insert check: an owner could save a run; a cross-owner insert was rejected by RLS; transaction rolled back.
- Production URL: https://blindspot-seven-sandy.vercel.app

## v0.2 regression and validation checks

- Frozen suite: 20 distinct regression probes saved through the browser UI.
- Replay: configured a patched mock candidate and replayed the exact suite. UI reported 20 fixed, 0 persistent, 0 newly failing, 0 errors.
- Validation: generated and completed 48 fresh task instances with no adaptive phase. Engine tests verify no source-prompt overlap and balanced families.
- Import: a suite JSON file passed runtime schema and SHA-256 integrity checks in the browser.
- Persistence: both replay and validation runs appeared in device history; unit tests cover legacy/new engine records and suite reload.
- Suite RLS: an owner could insert, cross-owner insert was rejected, and the other user could see zero suites. The test transaction rolled back.
- Security advisors: zero findings after the regression_suites table was added.

## Not independently verified

- No paid real-model endpoint was invoked; mock findings are intentionally simulated.
- Email confirmation and an authenticated cloud save were not exercised with a real mailbox. Database ownership isolation was tested directly.
- GitHub automatic deployments require a GitHub login connection in Vercel. The first deployment used the connected Vercel source-file API.
- Long-running evaluations still require an open browser page.

## 28 October follow-up

- Independent benchmark verifier regraded all 3,200 probes and checked 6,400 mock calls, summary consistency, completion, distinct prompts, and paired discovery/validation separation.
- Free Gemini, Claude, and ChatGPT browser smoke tests completed; all three passed the clarified raw JSON task. See BROWSER_SMOKE.md for exact prompts and limitations.
- Real provider API integration and real-mailbox cloud saves remain unverified.
