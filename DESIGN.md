# Blindspot design direction

A dark, focused research workspace, strongly inspired by OpenAI's restrained visual language while retaining Blindspot's own information architecture and identity.

## Foundation

- Main canvas: #212121; navigation: #171717; elevated surface: #292929.
- Text: #ececec; secondary text: #a5a5a5; quiet text: #858585.
- Borders: #383838, used to define controls and separate major regions.
- System sans-serif stack. Normal sentence case. No external font request.
- Clear hierarchy through space, alignment, and type, rather than colored containers.
- Primary actions use a compact light pill. Secondary actions use neutral borders.
- Avoid lime branding, decorative gradients, glowing indicators, and repeated uppercase badges.

## Workspace

Retain navigation for overview, findings, probes, history, suites, connections, and methodology. This is an evaluation tool, not a chat interface. Do not copy a chat composer or OpenAI branding.

The overview begins with a short heading, model-pair context, four unboxed metrics, and two quiet evidence panels. Findings read like research notes. Charts retain meaningful axes and inspectable data points.

## Color has a job

Coral identifies regressions; muted green identifies improvements; slate denotes agreements; amber denotes shared failures; lavender denotes errors. Baseline and candidate chart bars use blue and lavender. Outcome labels accompany color.

Simulated results remain labeled. Model keys, source provenance, and methodological limits remain visible where they matter.

## Motion and accessibility

Use short opacity/translation entrances and restrained hover feedback. Respect prefers-reduced-motion. Native scrolling remains in the workspace. Preserve keyboard focus, native modal semantics, readable contrast, and touch targets.

GSAP and selected React Bits components may be considered for later specific interactions. Lenis is optional for a future public landing page. These libraries are not prerequisites for the core workspace redesign.

## Reference use

The locally cloned VoltAgent/awesome-design-md collection is a design-reference library. Adapt its principles for spacing and consistency; its Apple marketing layouts are not the direction for this dashboard. Dark OpenAI-inspired restraint is the user's explicit preference.
