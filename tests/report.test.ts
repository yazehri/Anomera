import test from 'node:test';
import assert from 'node:assert/strict';
import { demoRun, type Run } from '../lib/engine';
import { buildReport, reportMarkdown } from '../lib/report';

test('report counts recorded failures and links only supporting evidence for the selected model', () => {
  const run = demoRun();
  for (const side of ['a','b'] as const) {
    const report=buildReport(run,side);
    const valid=run.results.filter(r=>!r.a.error&&!r.b.error);
    assert.equal(report.valid,valid.length);
    assert.equal(report.failures,valid.filter(r=>!r[side].pass).length);
    assert.equal(report.weaknesses.reduce((sum,w)=>sum+w.failed,0),report.failures);
    for (const w of report.weaknesses) {
      assert.ok(w.evidence.every(r=>!r[side].pass && r.probe.family===w.family));
      assert.equal(w.tested,valid.filter(r=>r.probe.family===w.family).length);
    }
    assert.ok(report.scope.some(s=>s.includes('mock models')));
  }
});
test('error-only and empty runs do not invent weaknesses or call errors reasoning failures',()=>{
  const source=demoRun();
  const errors:Run={...source,results:source.results.map(r=>({...r,a:{...r.a,error:'HTTP 503'},direction:'error'}))};
  const report=buildReport(errors);
  assert.equal(report.valid,0);assert.equal(report.failures,0);assert.equal(report.weaknesses.length,0);
  assert.equal(report.errors,errors.results.length);assert.match(report.headline,/Not enough valid/);
  assert.match(report.scope.join(' '),/Service errors are not reasoning failures/);
  assert.equal(buildReport({...source,results:[]}).weaknesses.length,0);
});
test('passing sample produces no fix claims; partial and selected runs disclose their scope',()=>{
  const source=demoRun();
  const passing={...source,results:source.results.filter(r=>r.b.pass&&!r.a.error&&!r.b.error)};
  assert.equal(buildReport(passing).weaknesses.length,0);
  assert.match(buildReport(passing).headline,/No failed checks/);
  const stopped=buildReport({...passing,status:'cancelled',mode:'replay'});
  assert.ok(stopped.scope.some(s=>s.includes('stopped after')));
  assert.ok(stopped.scope.some(s=>s.includes('selected cases')));
});
test('export identifies the chosen model and provenance and does not silently omit shared failures',()=>{
  const run=demoRun();
  const shared=run.results.filter(r=>r.direction==='shared failure');
  assert.ok(shared.length);
  const subset={...run,results:shared,simulated:false,mode:'validation' as const};
  assert.equal(buildReport(subset).failures,shared.length);
  const markdown=reportMarkdown(subset,'a');
  assert.ok(markdown.includes(run.models[0].name));
  assert.ok(markdown.includes(shared[0].probe.id));
  assert.match(markdown,/not an independent external benchmark/);
  assert.match(markdown,/Suggested mitigations are hypotheses/);
});
