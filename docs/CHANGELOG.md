# Changelog

## 0.2.0 — 27 October 2026

- Freeze discovered regressions or individual probes as immutable suites.
- Store suites on the device or in owner-protected Supabase storage.
- Import/export suite JSON with runtime validation and SHA-256 integrity checks.
- Replay exact prompts/checks on another model pair and compare candidate fixes with available source responses.
- Generate fixed validation sets with balanced families, no duplicates, and no source-prompt overlap.
- Expand negation vocabulary and remove duplicate discovery prompts before model requests.
- Preserve engine 1.0 run history; new generated runs use engine 1.1.
- Keep the existing visual design; the planned interface redesign is separate work.

Mock findings remain simulated. Real provider calls and real-mailbox authentication testing remain pending credentials. A validation batch holds out task instances from the same grammars; it is not an independent benchmark or a significance test.
