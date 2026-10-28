import {test} from 'node:test';
import assert from 'node:assert/strict';
import {callModel,compare,defaultModels,makeProbe} from '../lib/engine';
const model={...defaultModels[0],kind:'endpoint' as const,url:'https://models.example/completions',model:'test'};
const probe=makeProbe(42,0);
const payload=(content:string,finish_reason='stop')=>JSON.stringify({choices:[{finish_reason,message:{content}}]});
test('oversized output is an error, never a truncated passing answer',async t=>{
 t.mock.method(globalThis,'fetch',async()=>new Response(payload(probe.expected+' '.repeat(16000)+'wrong')));
 const answer=await callModel(model,probe,new AbortController().signal);
 assert.match(answer.error!,/16,000/);assert.equal(answer.text,'');assert.equal(compare(probe,{text:probe.expected,pass:true,latency:0},answer).direction,'error');
});
test('provider truncation and filtering are not interpreted as model failures',async t=>{
 for(const reason of ['length','content_filter']){
  const mock=t.mock.method(globalThis,'fetch',async()=>new Response(payload(probe.expected,reason)));
  const answer=await callModel(model,probe,new AbortController().signal);assert.ok(answer.error);assert.equal(answer.pass,false);mock.mock.restore();
 }
});
test('stream size limit cancels even when content length is absent',async t=>{
 let cancelled=false;
 t.mock.method(globalThis,'fetch',async()=>new Response(new ReadableStream({pull(c){c.enqueue(new Uint8Array(250001));},cancel(){cancelled=true;}})));
 const answer=await callModel(model,probe,new AbortController().signal);assert.match(answer.error!,/1 MB/);assert.equal(cancelled,true);
});
test('stream decodes characters split across chunks',async t=>{
 const bytes=new TextEncoder().encode(payload('café'));
 t.mock.method(globalThis,'fetch',async()=>new Response(new ReadableStream({start(c){for(const byte of bytes)c.enqueue(Uint8Array.of(byte));c.close();}})));
 const answer=await callModel(model,{...probe,rule:'exact',expected:'café'},new AbortController().signal);assert.equal(answer.pass,true);
});
test('pre-cancelled endpoint does not send a request',async t=>{
 let calls=0;t.mock.method(globalThis,'fetch',async()=>{calls++;return new Response(payload(probe.expected));});
 const controller=new AbortController();controller.abort();await assert.rejects(callModel(model,probe,controller.signal));assert.equal(calls,0);
});
test('invalid configuration cannot bypass validation through direct adapter calls',async()=>{
 await assert.rejects(callModel({...model,url:'http://models.example'},probe,new AbortController().signal),/HTTPS/);
});
test('malformed JSON and interrupted streams remain transport errors',async t=>{
 for(const response of [new Response('{broken'),new Response(new ReadableStream({start(c){c.error(new Error('Connection lost'));}}))]){
  const mock=t.mock.method(globalThis,'fetch',async()=>response);
  const answer=await callModel(model,probe,new AbortController().signal);assert.ok(answer.error);assert.equal(answer.text,'');mock.mock.restore();
 }
});
