# Blindspot research roadmap

The shipped MVP implements a transparent evaluation loop over four checkable prompt families. This roadmap distinguishes future research from implemented capabilities.

1. **Independent validation:** held-out prompt batches, repeated trials, paired confidence intervals, and per-complexity failure curves. Keep adaptive discovery scores separate from confirmatory benchmark scores.
2. **Saved regression suites:** promote reviewed probes into versioned suites, replay an exact suite on a new model, and retain provenance.
3. **Richer search:** grammar-preserving mutations, delta debugging for smaller counterexamples, and search-policy ablations against uniform random sampling.
4. **Semantic grouping:** opt-in embeddings and clustering evaluated against the current feature-based baseline. Show cluster stability and human review labels.
5. **Durable workers:** authenticated server-side model adapters, encrypted credential management, quotas, rate limits, background queues, and recovery after page close.
6. **Public research artifacts:** independently reproduced live-model results, frozen evaluation data, experiment logs, limitations, and a technical report authored from actual evidence.

A strong next experiment: compare adaptive family selection against uniform sampling under equal request budgets over at least 20 seeds. Measure new distinct failure families per request, then verify hypotheses on held-out tasks. Mock behavior supports pipeline testing, not a claim that the method discovers novel real-model weaknesses.
