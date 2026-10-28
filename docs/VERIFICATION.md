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

## Deployment and runtime limits

- No paid real-model endpoint was invoked; mock findings are intentionally simulated.
- GitHub automatic deployments require a GitHub login connection in Vercel. The first deployment used the connected Vercel source-file API.
- Long-running evaluations still require an open browser page.

## 28 October follow-up

- Independent benchmark verifier regraded all 3,200 probes and checked 6,400 mock calls, summary consistency, completion, distinct prompts, and paired discovery/validation separation.
- Free Gemini, Claude, and ChatGPT browser smoke tests completed; all three passed the clarified raw JSON task. See BROWSER_SMOKE.md for exact prompts and limitations.
- Gemini API returned 6 valid answers (all passed) and 10 service errors/timeouts in a bounded 16-probe run. A mixed mock baseline means this is a connection test, not a model comparison.

## Real-account cloud persistence — 28 October 2026

- User completed mailbox confirmation and password sign-in through the app.
- Saved the 10-probe mock recovery verification run through Save to cloud.
- Created and saved Cloud verification · 3 mock regressions, hash 9dc6e5312833d447bc60a233da781f00f8e19392e7b6bd38abffbf4fa0ed3a8c.
- Reloaded the page; signed-in state persisted. Load cloud runs returned one cloud record; opened it and inspected saved results.
- Load cloud suites succeeded after reload; suite retained its three probes and integrity hash. A read-only database query independently confirmed the saved suite and matching hash.
- No mailbox credentials or session tokens were captured in this verification record.

## Release checks — 28 October 2026

- Provider recovery release: 26 automated tests pass; production build and strict TypeScript check pass.
- Production recovery flow reopened the 16-probe Gemini run, selected its 10 error probes, and completed an exact mock replay with the same suite hash. No browser console errors were observed.
- Independent benchmark verifier confirms all 20 seed pairs, 3,200 probes, and 6,400 mock calls; a corrupted grade fails verification.
- Real Gemini replay under the recovery release remains pending a key being re-entered after page reload.
