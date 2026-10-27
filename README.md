# Blindspot

**AI behavioral diffs. Find the edge of model reliability.**

Blindspot generates reproducible evaluation prompts, compares two model responses against known answers, and follows behavioral differences into related tests. Every finding links to the prompt, expected answer, and paired outputs that support it.

An exploratory evaluation platform built with **Next.js · TypeScript · Supabase · Vercel**.

## Try it

**Live app:** https://blindspot-seven-sandy.vercel.app


Open the app and choose **New evaluation → Run evaluation**. The two built-in mock models require no credentials. Their weaknesses are intentionally programmed; simulated findings are labeled throughout the interface.

1. Choose a baseline and candidate, a probe budget, and a seed.
2. Watch exploration transition into targeted refinement.
3. Select dots in the difference map or inspect a discovered finding.
4. Browse and filter individual probes, including agreements and shared failures.
5. Export a full JSON run or sign in to save it to a private Supabase workspace.

## What works

- Seeded prompt generation across arithmetic, negation, structured JSON output, and context retrieval.
- Paired evaluations with strict, programmatically known answers.
- Adaptive search: 75% exploration, 25% variations in the most divergent task family.
- Feature-based complete-link clustering of correctness differences.
- Interactive difference map with actual family/complexity coordinates.
- Evidence viewer with raw responses, expected answer, check type, and latency.
- Searchable probe table, local run history, cancellation, and JSON export.
- Custom HTTPS completion endpoints with memory-only API keys.
- Supabase email/password authentication and per-owner run storage with row-level security.
- Responsive dark dashboard and keyboard-accessible native dialogs.

## Run locally

Requires Node.js 20.9+ (24 recommended) and pnpm 11.25.0.

```sh
corepack enable
pnpm install
cp .env.example .env.local
pnpm dev
```

Visit http://localhost:3000. Without Supabase variables, the evaluator, local history, and export still work; cloud sign-in and saves are unavailable.

```sh
pnpm typecheck
pnpm test
pnpm build
```

The test suite covers 8,000 generated oracle cases, strict grading failures, simulated discovery, error exclusions, key stripping, adaptive refinement, cancellation, and endpoint validation.

## Connect Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor of a **new** project. It creates `evaluation_runs`, the owner index, grants, and row-level security policies. For the original Blindspot instance, this schema has already been applied through the connected Supabase plugin.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`. Use the public publishable key, never a service-role key.
4. Enable email/password auth (enabled by default). Set the Auth Site URL to your deployment URL so account confirmation emails return to your app. With email confirmation enabled, users confirm the email and then sign in with their password.
5. Create an account from the guest profile button. Run an evaluation, then choose **Save to cloud**. Cloud saves are explicit; guest runs stay on the current device.

Anonymous database access has no privileges on the run table. Signed-in users can select, insert, and delete only their own runs. Updates are intentionally unavailable. Runs are limited to 2 MB each; the dashboard loads the latest 30 cloud runs. Cloud data is not copied into device history.

## Custom model endpoints

Choose **Model connections → Custom completion endpoint**. Supply the full HTTPS chat completion URL, model ID, and an optional key. A provider must support browser CORS requests from the app origin.

Request contract:

```json
{
  "model": "your-model-id",
  "messages": [{ "role": "user", "content": "generated prompt" }],
  "temperature": 0,
  "max_tokens": 256,
  "stream": false
}
```

Response contract:

```json
{ "choices": [{ "message": { "content": "the answer" } }] }
```

Keys are held in page memory, sent only to the configured endpoint as a Bearer token, and omitted from history, exports, and cloud payloads. Endpoint URLs must not contain credentials, query parameters, or fragments. Requests omit browser credentials and reject redirects. Both models run in parallel for each prompt; prompts execute sequentially, with a 20-second timeout per request. Errors are recorded and excluded from accuracy and findings. There are no automatic paid retries. A run uses at most twice the probe budget in requests. Provider charges may apply.

Use a trusted endpoint with a short-lived, scoped key. Providers that disallow browser requests need a separately secured adapter; this MVP does not expose an unauthenticated server-side proxy. No live provider claims are made from the mock demo.

## How discovery works

### Generation and checks

A Mulberry32 seeded generator produces task instances and complexity variants. An oracle supplies the expected result. Arithmetic is integer-only; negation and retrieval use exact matching after outer whitespace trimming; JSON requires exactly one numeric `total` key with the correct value. A correct answer wrapped in unwanted prose can fail: format adherence is part of these tasks.

### Behavioral comparison

A **regression** means the baseline passed and the candidate failed. An **improvement** is the reverse. Both-passed cases are agreements; both-failed cases remain visible as shared failures. Transport/response errors belong to a separate category. Raw token-set Jaccard distance is retained as a descriptive field, not used as a correctness judge.

### Search and clustering

The final quarter of the run probes the family with the most paired correctness differences so far. This is a simple active-search heuristic over a fixed grammar. Binary feature tags describe prompt characteristics. Greedy complete-link clustering groups same-family, same-direction probes only if every pair has cosine similarity ≥ 0.45. The shortest observed supporting prompt is exposed for inspection, not claimed as a globally minimized counterexample.

### Limits

These are exploratory, adaptive samples. Aggregate pass rates are not unbiased model benchmarks or statistical significance tests. Results can conflate reasoning and instruction-following errors. Four template families do not cover all real-world behavior. The feature clusters are interpretable groupings, not semantic embedding discovery. A single output does not measure stochastic reliability. Confirm a hypothesis with held-out prompts, multiple seeds, and repeated independent runs.

Runs execute in the browser and require the page to remain open. They are not durable background jobs. Local history stores at most 30 runs in browser storage. Reloading clears endpoint keys and restores the sample view; saved runs remain accessible from history.

## Architecture

```text
Dashboard (React / Next.js App Router)
  ├── lib/engine.ts: generate → evaluate → compare → refine → cluster
  ├── Browser fetch → trusted custom endpoint (or deterministic local mock)
  └── lib/storage.ts
        ├── localStorage: device history
        └── Supabase Auth + PostgREST → owner-protected evaluation_runs
```

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | Dashboard, model setup, evidence, history, and auth flows |
| `app/globals.css` | Responsive visual system |
| `lib/engine.ts` | Reproducible evaluation and discovery engine |
| `lib/storage.ts` | Local and private cloud persistence |
| `supabase/schema.sql` | Database bootstrap and access policies |
| `tests/engine.test.ts` | Evaluation correctness and lifecycle tests |
| `docs/ROADMAP.md` | Next research and product milestones |

## Deploy to Vercel

Import this repository, choose Next.js, and add the two public Supabase variables from `.env.example`. Vercel runs `pnpm build`. For automatic deployment on commits, connect your GitHub login in Vercel and link this repository. A source-file deployment also works without a Git login connection.

The public product name is **Blindspot**. Lowercase package identifiers and hosting slugs follow their platforms’ naming conventions.

## Responsible reporting

Use “candidate blind spot” until a finding is independently reproduced. Report sample size, seed, engine version, check definition, endpoint model version, and any mock involvement alongside scores. Do not describe simulated findings as evidence about a real model. See the in-app Methodology page for the same interpretation guidance.

## License

MIT. See [LICENSE](LICENSE).
