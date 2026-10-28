# Changelog

## Apple-inspired refinement — 28 October 2026

- Retain the charcoal theme and add Apple-style headline scale, centered overview composition, rounded cards, and blue primary controls.
- Prioritize Apple’s native system font without bundling restricted SF Pro font files; other platforms use fallbacks.
- Increase text sizes in evidence views, tables, and forms.

## Design refresh — 28 October 2026

- Introduce an original dark workspace inspired by OpenAI’s restrained visual language.
- Replace green-tinted surfaces and neon accents with charcoal, neutral controls, and meaningful outcome colors.
- Simplify metrics, navigation, evidence panels, and dialog typography.
- Remove external font requests and add a project-specific DESIGN.md.
- Increase chart-point hit areas and retain reduced-motion behavior.
- Verify a 16-prompt run, evidence inspection, and a mobile layout without horizontal overflow.

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
