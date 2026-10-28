import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {compare,grade,summarize,type Run} from '../lib/engine';

// Verify recorded evidence independently of the benchmark's aggregate tables.
const file=process.argv[2];
if(!file) throw new Error('Usage: pnpm verify:benchmark artifacts/benchmark-.../results.json');
const report=JSON.parse(readFileSync(file,'utf8'));
assert.equal(report.kind,'blindspot-mock-benchmark');
assert.equal(report.runs.length,report.seeds);
let probes=0;
for(const pair of report.runs){
 const discovery:Run=pair.discovery, validation:Run=pair.validation;
 assert.equal(validation.validationOf,discovery.id);
 const prompts=new Set(discovery.results.map(r=>r.probe.prompt.trim().replace(/\s+/g,' ')));
 const summary=report.summary.find((s:{seed:number})=>s.seed===pair.seed);
 assert.ok(summary,'Missing seed summary');
 for(const [mode,run] of [['discovery',discovery],['validation',validation]] as const){
  assert.equal(run.status,'completed');
  assert.equal(run.simulated,true);
  assert.ok(run.models.every(m=>m.kind==='mock'));
  assert.equal(run.results.length,report.probesPerRun);
  assert.equal(new Set(run.results.map(r=>r.probe.prompt)).size,run.results.length);
  for(const r of run.results){
   assert.equal(grade(r.probe,r.probe.expected),true,'Invalid oracle');
   for(const answer of [r.a,r.b]){
    assert.equal(answer.error,undefined,'Unexpected transport error');
    assert.equal(answer.pass,grade(r.probe,answer.text),'Recorded grade mismatch');
   }
   assert.equal(r.direction,compare(r.probe,r.a,r.b).direction);
   if(mode==='validation') assert.equal(prompts.has(r.probe.prompt.trim().replace(/\s+/g,' ')),false,'Discovery/validation overlap');
   probes++;
  }
  assert.deepEqual(summary[mode],summarize(run.results),'Summary does not match evidence');
 }
}
assert.equal(report.modelCalls,probes*2);
console.log(`Verified ${report.runs.length} seed pairs, ${probes} probes, ${probes*2} model calls. Grades, summaries, outcomes, and paired holdouts match recorded evidence.`);
