import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readLocal,writeLocal,readLocalSuites,writeLocalSuite} from '../lib/storage';
import {demoRun} from '../lib/engine';
import {createSuite} from '../lib/research';
test('local history reads new and legacy engine records and tolerates malformed storage',async t=>{
 const values=new Map<string,string>();const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage');Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>values.set(k,v)}});t.after(()=>{if(previous)Object.defineProperty(globalThis,'localStorage',previous);else Reflect.deleteProperty(globalThis,'localStorage');});
 const run=demoRun();assert.equal(writeLocal(run).length,1);assert.equal(readLocal()[0].version,'1.1');const legacy={...run,id:'legacy-run',version:'1.0' as const};writeLocal(legacy);assert.equal(readLocal().length,2);
 values.set('blindspot.runs.v1','broken');assert.deepEqual(readLocal(),[]);
 const suite=await createSuite('Persistence',run,run.results.filter(r=>r.direction==='regression'));await writeLocalSuite(suite);assert.deepEqual(await readLocalSuites(),[suite]);await writeLocalSuite(suite);assert.equal((await readLocalSuites()).length,1);
 const changed=structuredClone(suite);changed.probes[0].prompt+=' edited';values.set('blindspot.suites.v1',JSON.stringify([changed,suite]));assert.deepEqual(await readLocalSuites(),[suite]);
});
