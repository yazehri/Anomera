import { families, grade, makeProbe, type Probe, type Result, type Run } from './engine';

export type Suite = {
  kind: 'blindspot-regression-suite'; version: 1; id: string; name: string;
  createdAt: string; sourceRunId: string; sourceEngine: Run['version'];
  simulatedSource: boolean; contentHash: string; probes: Probe[];
};
const MAX_PROBES = 80;
const canonicalPrompt = (prompt: string) => prompt.trim().replace(/\s+/g, ' ');
function object(value: unknown): value is Record<string, unknown> { return !!value && typeof value === 'object' && !Array.isArray(value); }
function text(value: unknown, max: number): value is string { return typeof value === 'string' && value.length > 0 && value.length <= max; }
export function parseProbe(value: unknown): Probe {
  if (!object(value) || !text(value.id, 160) || !families.includes(value.family as Probe['family']) || !text(value.prompt, 20000) || !text(value.expected, 1000) || !Number.isInteger(value.level) || Number(value.level) < 1 || Number(value.level) > 4 || !['explore','refine'].includes(String(value.phase)) || !['number','exact','json'].includes(String(value.rule)) || !Array.isArray(value.tags) || value.tags.length < 1 || value.tags.length > 12 || !value.tags.every(t => text(t, 80))) throw new Error('The suite contains an invalid probe.');
  const p: Probe = { id:value.id, family:value.family as Probe['family'], prompt:value.prompt, expected:value.expected, level:Number(value.level), phase:value.phase as Probe['phase'], rule:value.rule as Probe['rule'], tags:[...value.tags] as string[] };
  if (!grade(p, p.expected)) throw new Error('An expected answer does not satisfy its own grading rule.');
  return p;
}
// Hash all execution-relevant fields, including order. Do not hash user-editable
// labels or provenance metadata. A hash detects accidental changes, not authorship.
export async function hashProbes(probes: Probe[]): Promise<string> {
  const canonical = probes.map(p => [p.id,p.family,p.prompt,p.expected,p.level,p.phase,p.rule,p.tags]);
  const bytes = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(canonical)));
  return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
export async function createSuite(name: string, source: Run, selected: Result[], includeErrors = false): Promise<Suite> {
  if (!name.trim() || name.length > 120) throw new Error('Give the suite a name of 1–120 characters.');
  const unique = new Map<string, Probe>();
  for (const r of selected) { if (!includeErrors && (r.a.error || r.b.error)) continue; const p = parseProbe(r.probe); const key=canonicalPrompt(p.prompt); const prior=unique.get(key); if(prior && (prior.rule!==p.rule || prior.expected!==p.expected)) throw new Error('The same prompt has contradictory expected answers.'); if(!prior) unique.set(key,p); }
  const probes = [...unique.values()];
  if (!probes.length || probes.length > MAX_PROBES) throw new Error('A regression suite needs 1–80 valid, distinct probes.');
  return {kind:'blindspot-regression-suite',version:1,id:crypto.randomUUID(),name:name.trim(),createdAt:new Date().toISOString(),sourceRunId:source.id,sourceEngine:source.version,simulatedSource:source.simulated,contentHash:await hashProbes(probes),probes};
}
export async function parseSuite(value: unknown): Promise<Suite> {
  if(!object(value) || value.kind!=='blindspot-regression-suite' || value.version!==1 || !text(value.id,160) || !text(value.name,120) || !text(value.createdAt,100) || !Number.isFinite(Date.parse(value.createdAt)) || !text(value.sourceRunId,160) || !['1.0','1.1'].includes(String(value.sourceEngine)) || typeof value.simulatedSource!=='boolean' || !Array.isArray(value.probes) || !value.probes.length || value.probes.length>MAX_PROBES || !text(value.contentHash,64)) throw new Error('This is not a valid Anomera regression suite.');
  const probes=value.probes.map(parseProbe);
  if(new Set(probes.map(p=>canonicalPrompt(p.prompt))).size!==probes.length || new Set(probes.map(p=>p.id)).size!==probes.length) throw new Error('A frozen suite cannot contain duplicate prompts or probe IDs.');
  const contentHash=await hashProbes(probes);
  if(contentHash!==value.contentHash) throw new Error('Suite integrity check failed. Its probes changed after it was saved.');
  return {kind:'blindspot-regression-suite',version:1,id:value.id,name:value.name,createdAt:value.createdAt,sourceRunId:value.sourceRunId,sourceEngine:value.sourceEngine as Run['version'],simulatedSource:value.simulatedSource,contentHash,probes};
}
export function validationProbes(source: Run, seed: number, count: number): Probe[] {
  if(!Number.isInteger(count) || count<8 || count>80) throw new Error('Validation needs 8–80 probes.');
  const seen=new Set(source.results.map(r=>canonicalPrompt(r.probe.prompt))); const probes:Probe[]=[];
  for(let i=0;i<count;i++) {
    let found:Probe|undefined;
    for(let attempt=0;attempt<500;attempt++) {const p=makeProbe(seed,i+attempt*count,families[i%4]);const key=canonicalPrompt(p.prompt);if(!seen.has(key)){seen.add(key);found=p;break;}}
    if(!found) throw new Error('Could not generate a non-overlapping validation set. Try another seed.');
    probes.push(found);
  }
  return probes;
}
export function replayChanges(source: Run, replay: Run) {
  const original = new Map(source.results.map(r => [r.probe.prompt,r]));
  let fixed=0, persistent=0, introduced=0, errored=0, matched=0, recovered=0, currentErrors=0;
  for(const r of replay.results) {const previous=original.get(r.probe.prompt);if(!previous || previous.probe.rule!==r.probe.rule || previous.probe.expected!==r.probe.expected) continue; matched++; if(r.b.error)currentErrors++; if(previous.b.error && !r.b.error)recovered++; if(r.b.error || previous.b.error){errored++;continue;} if(!previous.b.pass && r.b.pass)fixed++;else if(!previous.b.pass && !r.b.pass)persistent++;else if(previous.b.pass && !r.b.pass)introduced++;}
  return {matched,fixed,persistent,introduced,errored,recovered,currentErrors};
}

/** Author checks within the supported task families without fabricating source results. */
export async function authorSuite(name: string, cases: unknown): Promise<Suite> {
  if (!name.trim() || name.length > 120) throw new Error('Give the suite a name of 1–120 characters.');
  if (!Array.isArray(cases) || cases.length < 1 || cases.length > MAX_PROBES) throw new Error('Provide 1–80 test cases.');
  const probes = cases.map((value, index) => {
    if (!object(value)) throw new Error(`Case ${index+1} must be an object.`);
    return parseProbe({...value,id:`custom-${index}-${crypto.randomUUID()}`,phase:'explore',tags:['developer-authored'],level:value.level ?? 1});
  });
  if (new Set(probes.map(p=>canonicalPrompt(p.prompt))).size !== probes.length) throw new Error('Remove duplicate prompts.');
  return {kind:'blindspot-regression-suite',version:1,id:crypto.randomUUID(),name:name.trim(),createdAt:new Date().toISOString(),sourceRunId:'developer-authored',sourceEngine:'1.1',simulatedSource:false,contentHash:await hashProbes(probes),probes};
}
