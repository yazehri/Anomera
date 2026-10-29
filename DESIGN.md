# Blindspot — Factory-inspired interface

This replaces the previous sidebar dashboard and Osmo/red direction. The user supplied factory-design-md.md as the new visual reference.

## Composition
A single horizontal navigation bar leads to Evaluate, Archive, Suites and Method. The evaluation overview pairs a light current-run dispatch with a dark, framed comparison instrument. Below it, a continuous metric band leads into the behavior map and a next-actions column. Evidence cards conclude the overview. Probe explorer and findings use compact headers to prioritize work. There is no sidebar.

## Tokens
- Canvas: #101010
- Raised dark surfaces: #1D1A18
- Borders: #3D3A39
- Subtle dividers: #292624
- Muted text: #8A8380; supporting text: #B8B3B0
- Primary text and light dispatch: #EEEEEE
- Functional orange: #EE6018
- Functional green: #A0CA92

No colored button fills, shadows, blur, gradients, or scroll animations. Dialog/content entrances use restrained 180ms transitions with reduced-motion support. Controls have 8px corners, cards 12px, and dialogs 16px, following the user’s request for consistent rounding. Light surfaces have dark text. Orange identifies candidate data/regressions and small status markers; green identifies improvements. Shared failures use outlined marks and errors use outlined diamonds so color is not the only distinction.

## Fonts
Actual Geist and Geist Mono variable Latin webfonts are self-hosted and optimized through next/font/local. Weight 400 is the default, with no bold headings. The unmodified fonts come from the installed Next.js distribution. Their SIL Open Font License is included in public/fonts/OFL.txt. Source: https://github.com/vercel/geist-font.

## Data and behavior
Paired charts use a zero-to-100 percent scale, show valid-probe denominators, and exclude response errors. Model-series controls expose pressed state. Missing observations use a dash. The map uses real task family/complexity positions. All marks lead to evidence; there are no invented sparkline histories or fabricated metrics.

The evaluation engine, private persistence, suites, exports and provider requests retain their existing behavior. Summary & fixes reports are generated deterministically from recorded checks for either model. Each failed family includes evidence links, mitigation hypotheses and verification guidance. Reports export as Markdown. Outcome and complexity analytics link to filtered probe views.

## Responsive and accessibility
The header wraps into a full-width navigation row on phones; the evaluation stage and observations stack. Tables scroll within their own container. Native dialogs trap focus and have explicit accessible titles. Labels, keyboard focus, reduced-motion preferences and text equivalents accompany chart controls.
