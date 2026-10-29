import { families, summarize, type Family, type Result, type Run } from './engine';

export type ModelSide = 'a' | 'b';
const guidance: Record<Family, { action: string; verify: string }> = {
  Arithmetic: {
    action: 'Move exact calculations into a calculator or deterministic function. Ask the model to extract the inputs, then validate the computed result before returning it.',
    verify: 'Replay these failures, then test new numbers and operation orders with the same strict answer format.',
  },
  Negation: {
    action: 'Rewrite exclusion rules as explicit allowed choices where possible. Keep one unambiguous instruction, and validate that the returned choice satisfies every constraint.',
    verify: 'Test fresh choices, reordered exclusions and double negatives. Include positive instructions so a fix does not introduce new failures.',
  },
  'Structured output': {
    action: 'Use your provider’s schema-constrained output mode if available. Parse and validate the response against an exact schema and expected value before accepting it. Handle invalid output explicitly.',
    verify: 'Replay the failed cases and add fresh values plus conflicting formatting requests. Check both the schema and the actual numeric value.',
  },
  'Context retrieval': {
    action: 'Retrieve only the relevant records, clearly mark the authoritative source, and separate it from stale or distracting context. Verify extracted values against that source.',
    verify: 'Vary the number, order and similarity of distractor records while keeping a known correct answer. Check that the model still selects the authoritative record.',
  },
};

/** Evidence-based prose, not an LLM judge. No provider calls or inferred root causes. */
export function buildReport(run: Run, side: ModelSide = 'b') {
  const valid = run.results.filter(r => !r.a.error && !r.b.error);
  const model = run.models[side === 'a' ? 0 : 1];
  const totals = summarize(run.results);
  const passed = valid.filter(r => r[side].pass).length;
  const failures = valid.length - passed;
  const weaknesses = families.map(family => {
    const tested = valid.filter(r => r.probe.family === family);
    const failed = tested.filter(r => !r[side].pass);
    return {family, tested: tested.length, failed: failed.length, rate: tested.length ? Math.round(failed.length / tested.length * 100) : null, evidence: failed, ...guidance[family]};
  }).filter(row => row.failed > 0).sort((a,b) => b.failed - a.failed || (b.rate ?? 0) - (a.rate ?? 0));
  const headline = valid.length === 0 ? 'Not enough valid responses to assess behavior.' : failures === 0 ? 'No failed checks in the tested sample.' : `Start with ${weaknesses[0].family.toLowerCase()}.`;
  const narrative = valid.length === 0
    ? `${model.name} has no scorable paired responses in this run. Resolve response errors or run an evaluation before drawing conclusions about its behavior.`
    : `${model.name} passed ${passed} of ${valid.length} valid paired probes (${Math.round(passed / valid.length * 100)}%). ${failures ? `${failures} responses failed the required answer or output-format check. ${weaknesses[0].family} contributed the most observed failures: ${weaknesses[0].failed} of ${weaknesses[0].tested} tested probes in that family.` : 'This only describes the prompts tested; it does not establish reliability on other tasks.'}`;
  const scope = [
    run.simulated ? 'This run includes mock models. Mock behavior is intentionally programmed; these results are not evidence about a real model’s quality.' : 'These results describe the configured endpoints at the time of this run, not every version or setting of those models.',
    run.mode === 'replay' ? 'A replay uses selected cases. Its pass rate is not a representative benchmark.' : run.mode === 'validation' ? 'Validation uses fresh instances from the same task grammars. It is not an independent external benchmark.' : 'Discovery adaptively selects related prompts. Counts and rates describe this sample, not general model quality or statistical significance.',
    totals.errors ? `${totals.errors} probes with an error in either response were excluded from both models’ correctness analysis. Service errors are not reasoning failures.` : '',
    run.status === 'cancelled' ? `This run stopped after ${run.results.length} of ${run.requested} requested probes. The report covers completed observations only.` : '',
    'Suggested mitigations are hypotheses to test. The observed checks do not establish a root cause or guarantee that a change will fix it.',
  ].filter(Boolean);
  return {model: model.name, side, headline, narrative, passed, failures, valid: valid.length, errors: totals.errors, weaknesses, scope, regressions: totals.regressions, improvements: totals.improvements};
}

export function reportMarkdown(run: Run, side: ModelSide = 'b') {
  const report = buildReport(run, side);
  return [
    `# ${run.name} — evaluation report`,
    `Model: ${report.model} (${side === 'a' ? 'baseline' : 'candidate'})`,
    `Run: ${run.id} | Engine: ${run.version} | Seed: ${run.seed} | Mode: ${run.mode ?? 'discovery'} | Recorded: ${run.createdAt}`,
    `## ${report.headline}`, report.narrative,
    `Paired comparison: ${report.regressions} candidate regressions and ${report.improvements} candidate improvements. A regression means the baseline passed and the candidate failed.`,
    ...report.weaknesses.flatMap(w => [
      `## ${w.family}: ${w.failed} failures / ${w.tested} valid probes`,
      `Try: ${w.action}`, `Verify: ${w.verify}`,
      `Evidence probe IDs: ${w.evidence.map(r=>r.probe.id).join(', ')}. Full prompt/response evidence is available in the run JSON export.`,
    ]),
    '## Scope and limitations', ...report.scope.map(s=>`- ${s}`),
    'Generated deterministically from recorded checks. No model-generated diagnosis or additional API requests.',
  ].join('\n\n');
}
