# Blindspot design direction

Apple-inspired typography, spacious compositions, rounded surfaces, and precise controls on the retained OpenAI-inspired charcoal palette. Blindspot keeps its own research workflow and identity. This supersedes the earlier purely OpenAI-inspired direction.

## Foundation

- Main canvas: #212121; navigation: #171717; elevated surface: #292929.
- Text: #ececec; secondary text: #a5a5a5; quiet text: #858585.
- Borders: #383838, used to define controls and separate major regions.
- Apple system font first: -apple-system, BlinkMacSystemFont, then Helvetica Neue / Segoe UI / Arial fallbacks. On Apple platforms this uses the native San Francisco family. Do not bundle downloaded SF Pro files or promise an identical face on non-Apple systems. Normal sentence case; no external font request.
- Clear hierarchy through space, alignment, and type, rather than colored containers.
- Primary actions use an Apple-blue pill (#0071e3) with white text. Secondary actions use neutral borders.
- Avoid lime branding, decorative gradients, glowing indicators, and repeated uppercase badges.

## Workspace

Retain navigation for overview, findings, probes, history, suites, connections, and methodology. This is an evaluation tool, not a chat interface. Do not copy a chat composer or OpenAI branding.

The overview begins with a large centered two-line headline, supporting text, and one primary action. Model-pair context follows in a rounded surface, with four unboxed metrics and two quiet evidence panels. Findings read like research notes. Charts retain meaningful axes and inspectable data points.

## Color has a job

Coral identifies regressions; muted green identifies improvements; slate denotes agreements; amber denotes shared failures; lavender denotes errors. Baseline and candidate chart bars use blue and lavender. Outcome labels accompany color.

Simulated results remain labeled. Model keys, source provenance, and methodological limits remain visible where they matter.

## Motion and accessibility

Use short opacity/translation entrances and restrained hover feedback. Respect prefers-reduced-motion. Native scrolling remains in the workspace. Preserve keyboard focus, native modal semantics, readable contrast, and touch targets.

GSAP and selected React Bits components may be considered for later specific interactions. Lenis is optional for a future public landing page. These libraries are not prerequisites for the core workspace redesign.

## Reference use

The locally cloned VoltAgent/awesome-design-md collection is a design-reference library. Adapt its principles for spacing and consistency; its Apple typography and rounded surfaces inform this dashboard, adapted for readable evaluation data. The user explicitly wants very strong Apple inspiration while retaining the OpenAI-inspired dark theme.
