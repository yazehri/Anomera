import {test} from 'node:test';
import assert from 'node:assert/strict';
import {evaluate,defaultModels} from '../lib/engine';
import {createSuite,replayChanges} from '../lib/research';
const models:typeof defaultModels=[defaultModels[0],{...defaultModels[1],kind:'endpoint',url:'https://model.example/completions',model:'test',key:'private-test-key'}];
const run=()=>evaluate({models,count:16,seed:42,name:'Recovery test',signal:new AbortController().signal,onProgress:()=>{}});
test('configuration and quota failures stop after one request with preserved evidence',async t=>{
 for(const status of [401,403,404,429]){
  let calls=0;const mock=t.mock.method(globalThis,'fetch',async()=>{calls++;return new Response('{}',{status});});
  const result=await run();assert.equal(calls,1);assert.equal(result.status,'cancelled');assert.equal(result.results.length,1);assert.equal(result.requested,16);assert.ok(result.stopReason);assert.equal(result.results[0].direction,'error');assert.equal('key' in result.models[1],false);mock.mock.restore();
 }
});
test('three consecutive service failures stop a run without counting them as regressions',async t=>{
 let calls=0;t.mock.method(globalThis,'fetch',async()=>{calls++;return new Response('{}',{status:503});});
 const result=await run();assert.equal(calls,3);assert.equal(result.results.length,3);assert.ok(result.results.every(r=>r.direction==='error'));assert.match(result.stopReason!,/three consecutive/);
 const suite=await createSuite('Exact error replay',result,result.results,true);assert.deepEqual(suite.probes,result.results.map(r=>r.probe));assert.equal('models' in suite,false);
 await assert.rejects(createSuite('Normal suite',result,result.results),/1–80/);
});
test('a successful provider response resets the consecutive failure counter',async t=>{
 let calls=0;t.mock.method(globalThis,'fetch',async()=>{calls++;return calls%3===0 ? new Response(JSON.stringify({choices:[{message:{content:'74'},finish_reason:'stop'}]})) : new Response('{}',{status:503});});
 const result=await run();assert.equal(calls,16);assert.equal(result.status,'completed');assert.equal(result.stopReason,undefined);
});

test('recovered responses are distinct from current failures and correctness fixes',async t=>{
 t.mock.method(globalThis,'fetch',async()=>new Response('{}',{status:503}));
 const source=await run();const replay=structuredClone(source);
 replay.results[0].b={text:replay.results[0].probe.expected,pass:true,latency:1};
 const changes=replayChanges(source,replay);assert.equal(changes.recovered,1);assert.equal(changes.currentErrors,2);assert.equal(changes.fixed,0);assert.equal(changes.errored,3);
});
