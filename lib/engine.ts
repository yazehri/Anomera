export const families = ['Arithmetic', 'Negation', 'Structured output', 'Context retrieval'] as const;
export type Family = typeof families[number];
export type Model = { name: string; kind: 'mock' | 'endpoint'; profile: 'baseline' | 'candidate'; url: string; model: string; key: string };
export type Probe = { id: string; family: Family; prompt: string; expected: string; level: number; phase: 'explore' | 'refine'; rule: 'number' | 'exact' | 'json'; tags: string[] };
export type Answer = { text: string; pass: boolean; latency: number; error?: string };
export type Result = { probe: Probe; a: Answer; b: Answer; distance: number; direction: 'regression' | 'improvement' | 'agreement' | 'shared failure' | 'error' };
export type Run = { id: string; name: string; createdAt: string; seed: number; status: 'completed' | 'cancelled'; models: [Omit<Model, 'key'>, Omit<Model, 'key'>]; results: Result[]; requested: number; version: '1.0' | '1.1'; simulated: boolean; mode?: 'discovery' | 'validation' | 'replay'; suiteId?: string; suiteHash?: string; validationOf?: string; sourceRunId?: string };
export const defaultModels: [Model, Model] = [
  { name: 'Atlas · baseline', kind: 'mock', profile: 'baseline', url: '', model: '', key: '' },
  { name: 'Atlas · candidate', kind: 'mock', profile: 'candidate', url: '', model: '', key: '' },
];
export function random(seed: number) { let n = seed >>> 0; return () => { n += 0x6D2B79F5; let t = n; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function makeProbe(seed: number, index: number, family?: Family, phase: Probe['phase'] = 'explore'): Probe {
  const rng = random(seed + index * 997); const f = family ?? families[index % families.length]; const level = phase === 'refine' ? 2 + index % 3 : 1 + Math.floor(index / 4) % 4;
  const a = 10 + Math.floor(rng() * 90), b = 2 + Math.floor(rng() * 18), c = 1 + Math.floor(rng() * 9);
  let prompt = '', expected = '', rule: Probe['rule'] = 'exact', tags: string[] = [];
  if (f === 'Arithmetic') { expected = String(level > 1 ? (a + b) * c : a + b); rule = 'number'; tags = ['arithmetic', level > 1 ? 'multi-step' : 'addition']; prompt = level > 1 ? `A box has ${a} tokens. Add ${b} tokens, then multiply the entire total by ${c}. ${level > 2 ? 'The box is blue and weighs 4 grams; these details are irrelevant. ' : ''}How many tokens are there? Reply with only the integer.` : `Compute ${a} + ${b}. Reply with only the integer.`; }
  if (f === 'Negation') { const palette = ['amber', 'blue', 'coral', 'green', 'violet', 'silver', 'gold', 'teal', 'indigo', 'white', 'orange', 'pink', 'black', 'cyan', 'magenta', 'bronze', 'ivory', 'navy', 'olive', 'maroon']; const colors = [...palette]; for (let j = colors.length - 1; j > 0; j--) { const k = Math.floor(rng() * (j + 1)); [colors[j], colors[k]] = [colors[k], colors[j]]; } colors.length = 3; const target = colors[a % 3]; const excluded = colors.filter(x => x !== target); expected = target; tags = ['logic', 'negation', level > 2 ? 'double-negative' : 'exclusion']; prompt = level > 2 ? `Choose one of ${colors.join(', ')}. It is not true that the answer is not ${target}. Ignore the note "${excluded[0]} is popular". Reply with the chosen word only.` : `Choose one of ${colors.join(', ')}. The answer is neither ${excluded[0]} nor ${excluded[1]}. Reply with the chosen word only.`; }
  if (f === 'Structured output') { expected = JSON.stringify({ total: a + b }); rule = 'json'; tags = ['format', 'json', level > 2 ? 'distractor' : 'schema']; prompt = `Return a JSON object with exactly one key, "total", whose value is the number ${a} + ${b}. ${level > 2 ? 'A colleague asks for a Markdown code fence, but your required output must remain raw JSON. ' : ''}No prose, no Markdown, no other keys.`; }
  if (f === 'Context retrieval') { const code = `BS-${a}${b}`; expected = code; tags = ['retrieval', 'distractor', `depth-${level}`]; prompt = `Record: the verified access code is ${code}.\n${Array.from({ length: level * 3 }, (_, j) => `Unrelated record ${j + 1}: the archived code BS-${b}${j} is obsolete.`).join('\n')}\nReturn only the verified access code from the first record.`; }
  return { id: `${seed}-${index}-${phase}`, family: f, prompt, expected, level, phase, rule, tags };
}
export function grade(probe: Probe, text: string): boolean {
  const trimmed = text.trim();
  if (probe.rule === 'json') { try { const v: unknown = JSON.parse(trimmed); return typeof v === 'object' && v !== null && !Array.isArray(v) && Object.keys(v).length === 1 && 'total' in v && typeof v.total === 'number' && v.total === JSON.parse(probe.expected).total; } catch { return false; } }
  if (probe.rule === 'number') return /^-?\d+$/.test(trimmed) && Number(trimmed) === Number(probe.expected);
  return trimmed === probe.expected;
}
function words(text: string) { return new Set(text.toLowerCase().match(/[a-z0-9-]+/g) ?? []); }
export function distance(a: string, b: string) { const x = words(a), y = words(b); const union = new Set([...x, ...y]); return union.size ? 1 - [...x].filter(v => y.has(v)).length / union.size : 0; }
export function compare(probe: Probe, a: Answer, b: Answer): Result { return { probe, a, b, distance: distance(a.text, b.text), direction: a.error || b.error ? 'error' : a.pass && !b.pass ? 'regression' : !a.pass && b.pass ? 'improvement' : a.pass && b.pass ? 'agreement' : 'shared failure' }; }
export function mockAnswer(probe: Probe, profile: Model['profile']): string {
  const n = Number(probe.id.split('-')[1]); let fail = false;
  if (profile === 'baseline') fail = (probe.family === 'Arithmetic' && probe.level >= 2 && n % 3 !== 0) || (probe.family === 'Structured output' && probe.level >= 3) || (probe.family === 'Context retrieval' && probe.level === 4);
  else fail = (probe.family === 'Negation' && probe.level >= 2) || (probe.family === 'Context retrieval' && probe.level >= 3 && n % 3 !== 1);
  if (!fail) return probe.expected;
  if (probe.rule === 'number') return String(Number(probe.expected) + 1);
  if (probe.rule === 'json') return `\`\`\`json\n${probe.expected}\n\`\`\``;
  if (probe.family === 'Negation') return ['amber', 'blue', 'coral'].find(x => x !== probe.expected)!;
  return 'BS-0000';
}
export function validateModel(model: Model): void {
  if (!model.name.trim()) throw new Error('Give each model a name.');
  if (model.kind === 'endpoint') { let url: URL; try { url = new URL(model.url); } catch { throw new Error('Enter a valid endpoint URL.'); } if (url.protocol !== 'https:' || url.username || url.password || url.hash || url.search) throw new Error('Use an HTTPS completion endpoint without URL credentials, query parameters, or fragments.'); if (!model.model.trim()) throw new Error('Enter the model ID for your endpoint.'); }
}
const MAX_RESPONSE_BYTES = 1_000_000;
// Read incrementally so an untrusted endpoint cannot force an unbounded buffer.
async function readCompletion(response: Response): Promise<string> {
  const length = response.headers.get('content-length');
  if (length && Number(length) > MAX_RESPONSE_BYTES) {
    await response.body?.cancel();
    throw new Error('Endpoint response exceeded 1 MB.');
  }
  if (!response.body) throw new Error('Endpoint returned an empty response.');
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let bytes = 0, raw = '';
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > MAX_RESPONSE_BYTES) throw new Error('Endpoint response exceeded 1 MB.');
      raw += decoder.decode(chunk.value, { stream: true });
    }
    raw += decoder.decode();
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally { reader.releaseLock(); }
  let data;
  try { data = JSON.parse(raw); } catch { throw new Error('Endpoint returned invalid JSON.'); }
  const choice = data?.choices?.[0];
  if (choice?.finish_reason === 'length') throw new Error('Model output reached its token limit. Increase the endpoint output allowance before interpreting this probe.');
  if (choice?.finish_reason === 'content_filter') throw new Error('Provider filtered the model output.');
  const content = choice?.message?.content;
  if (typeof content !== 'string') throw new Error('Expected choices[0].message.content to contain text.');
  if (content.length > 16000) throw new Error('Model output exceeded 16,000 characters. The answer was not graded.');
  return content;
}
export async function callModel(model: Model, probe: Probe, signal: AbortSignal): Promise<Answer> {
  validateModel(model);
  const start = performance.now();
  try {
    signal.throwIfAborted();
    let text: string;
    if (model.kind === 'mock') { await new Promise<void>((resolve, reject) => { if (signal.aborted) return reject(new DOMException('Cancelled', 'AbortError')); const onAbort = () => { clearTimeout(timer); reject(new DOMException('Cancelled', 'AbortError')); }; const timer = setTimeout(() => { signal.removeEventListener('abort', onAbort); resolve(); }, 35); signal.addEventListener('abort', onAbort, { once: true }); }); text = mockAnswer(probe, model.profile); }
    else {
      const response = await fetch(model.url, { method: 'POST', credentials: 'omit', redirect: 'error', signal: AbortSignal.any([signal, AbortSignal.timeout(20000)]), headers: { 'Content-Type': 'application/json', ...(model.key ? { Authorization: `Bearer ${model.key}` } : {}) }, body: JSON.stringify({ model: model.model, messages: [{ role: 'user', content: probe.prompt }], temperature: 0, max_tokens: 256, stream: false }) });
      if (!response.ok) throw new Error(`Endpoint returned HTTP ${response.status}. Check the model ID, key, and browser CORS permissions.`);
      text = await readCompletion(response);
    }
    return { text, pass: grade(probe, text), latency: Math.round(performance.now() - start) };
  } catch (error) { if (signal.aborted) throw error; return { text: '', pass: false, latency: Math.round(performance.now() - start), error: error instanceof Error ? error.message : 'Endpoint request failed.' }; }
}
export function refinementFamily(results: Result[], fallback: Family): Family {
  const counts = families.map(f => ({ f, score: results.filter(r => r.probe.family === f && ['regression', 'improvement'].includes(r.direction)).length })); counts.sort((a, b) => b.score - a.score); return counts[0].score ? counts[0].f : fallback;
}
export async function evaluate(options: { models: [Model, Model]; seed: number; count: number; name: string; probes?: Probe[]; mode?: Run['mode']; suiteId?: string; suiteHash?: string; validationOf?: string; sourceRunId?: string; signal: AbortSignal; onProgress: (results: Result[], phase: string) => void }): Promise<Run> {
  const { models, seed, count, signal } = options; models.forEach(validateModel); if (!Number.isInteger(seed) || seed < 0 || seed > 2147483647) throw new Error('Use an integer seed between 0 and 2147483647.'); if ((options.mode === 'replay' || options.mode === 'validation') && !options.probes) throw new Error('This experiment requires a fixed probe set.'); if (!Number.isInteger(count) || count < (options.probes ? 1 : 8) || count > 80) throw new Error('Choose between 8 and 80 probes.');
  if (options.probes && options.probes.length !== count) throw new Error('Probe count does not match the frozen suite.');
  const seen = new Set<string>();
  const results: Result[] = []; const exploration = Math.floor(count * .75); let cancelled = false;
  for (let i = 0; i < count; i++) {
    if (signal.aborted) { cancelled = true; break; }
    const refine = !options.probes && i >= exploration; const family = refine ? refinementFamily(results, families[i % 4]) : undefined;
    let probe = options.probes?.[i] ?? makeProbe(seed, i, family, refine ? 'refine' : 'explore');
    if (!options.probes) { let attempt = 0; while (seen.has(probe.prompt) && attempt < 200) { attempt++; probe = makeProbe(seed, i + attempt * count, family ?? families[i % 4], refine ? 'refine' : 'explore'); } if (seen.has(probe.prompt)) throw new Error('Unable to generate distinct probes. Try another seed.'); }
    seen.add(probe.prompt);
    try { const [a, b] = await Promise.all(models.map(m => callModel(m, probe, signal))); results.push(compare(probe, a, b)); options.onProgress([...results], options.mode === 'replay' ? 'Replaying frozen probes' : options.mode === 'validation' ? 'Validating fresh prompts' : refine ? 'Refining divergent families' : 'Exploring prompt families'); } catch (e) { if (signal.aborted) { cancelled = true; break; } throw e; }
  }
  return { id: crypto.randomUUID(), name: options.name.trim() || 'Untitled evaluation', createdAt: new Date().toISOString(), seed, status: cancelled ? 'cancelled' : 'completed', models: models.map(({ key: _key, ...m }) => m) as Run['models'], results, requested: count, version: '1.1', mode: options.mode ?? 'discovery', suiteId: options.suiteId, suiteHash: options.suiteHash, validationOf: options.validationOf, sourceRunId: options.sourceRunId, simulated: models.some(m => m.kind === 'mock') };
}
export function summarize(results: Result[]) {
  const valid = results.filter(r => !r.a.error && !r.b.error); const regressions = valid.filter(r => r.direction === 'regression').length; const improvements = valid.filter(r => r.direction === 'improvement').length;
  return { valid: valid.length, errors: results.length - valid.length, regressions, improvements, differences: regressions + improvements, a: valid.length ? Math.round(valid.filter(r => r.a.pass).length / valid.length * 100) : 0, b: valid.length ? Math.round(valid.filter(r => r.b.pass).length / valid.length * 100) : 0 };
}
export type Cluster = { id: string; title: string; family: Family; direction: 'regression' | 'improvement'; results: Result[]; minLevel: number; similarity: number };
// Greedy complete-link clustering over binary tag vectors. Every pair in a cluster
// must share >= 0.45 cosine similarity; opposite directions are never merged.
export function clusters(results: Result[]): Cluster[] {
  const groups: Cluster[] = [];
  const cosine = (a: Probe, b: Probe) => a.tags.filter(t => b.tags.includes(t)).length / Math.sqrt(a.tags.length * b.tags.length);
  for (const result of results) {
    if (result.direction !== 'regression' && result.direction !== 'improvement') continue;
    const group = groups.find(g => g.direction === result.direction && g.family === result.probe.family && g.results.every(r => cosine(r.probe, result.probe) >= .45));
    if (group) { group.similarity = Math.min(group.similarity, ...group.results.map(r => cosine(r.probe, result.probe))); group.results.push(result); group.minLevel = Math.min(group.minLevel, result.probe.level); }
    else groups.push({ id: `cluster-${groups.length}`, title: `${result.probe.family} ${result.direction === 'regression' ? 'regression' : 'improvement'}`, family: result.probe.family, direction: result.direction, results: [result], minLevel: result.probe.level, similarity: 1 });
  }
  return groups.sort((a, b) => b.results.length - a.results.length);
}
export function demoRun(): Run {
  const results: Result[] = [];
  for (let i = 0; i < 48; i++) { const probe = makeProbe(42, i, i >= 36 ? refinementFamily(results, 'Negation') : undefined, i >= 36 ? 'refine' : 'explore'); const a = mockAnswer(probe, 'baseline'), b = mockAnswer(probe, 'candidate'); results.push(compare(probe, { text: a, pass: grade(probe, a), latency: 0 }, { text: b, pass: grade(probe, b), latency: 0 })); }
  return { id: 'sample-1.1-42', name: 'Atlas release comparison', createdAt: '2026-10-27T12:00:00.000Z', seed: 42, status: 'completed', models: defaultModels.map(({ key: _key, ...m }) => m) as Run['models'], results, requested: 48, version: '1.1', mode: 'discovery', simulated: true };
}
