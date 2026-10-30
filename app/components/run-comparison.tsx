'use client';
import {useState} from 'react';
import type {Run} from '@/lib/engine';
import {replayChanges} from '@/lib/research';
export function RunComparison({runs}:{runs:Run[]}) {
 const [before,setBefore]=useState(''),[after,setAfter]=useState('');
 const a=runs.find(r=>r.id===before),b=runs.find(r=>r.id===after);
 const result=a&&b?replayChanges(a,b):null;
 return <section className="panel" style={{marginBottom:24}}><h2>Compare two evaluations</h2><p>Track changes in the candidate model on identical prompts and grading rules. Choose the earlier run first.</p><div className="form-row"><label>Before<select value={before} onChange={e=>setBefore(e.target.value)}><option value="">Choose an evaluation</option>{runs.map(r=><option key={r.id} value={r.id}>{r.name} · {new Date(r.createdAt).toLocaleString()}</option>)}</select></label><label>After<select value={after} onChange={e=>setAfter(e.target.value)}><option value="">Choose an evaluation</option>{runs.filter(r=>r.id!==before).map(r=><option key={r.id} value={r.id}>{r.name} · {new Date(r.createdAt).toLocaleString()}</option>)}</select></label></div>{result&&a&&b&&<div role="status"><p><strong>{a.models[1].name}</strong> → <strong>{b.models[1].name}</strong></p>{a.id===b.id?<p>Choose two different evaluations.</p>:result.matched?<><div className="stats">{[['Fixed',result.fixed],['Still failing',result.persistent],['New failures',result.introduced],['Excluded errors',result.errored]].map(([label,n])=><div className="stat" key={label}><span>{label}</span><strong>{n}</strong></div>)}</div><p>{result.matched} matching probes. {b.results.length-result.matched} after-run probes have no matching earlier check and are excluded. {result.recovered} responses recovered from errors.</p><p className="muted">Changes describe these repeated cases only. Model randomness and configuration changes may affect results.</p></>:<p>No identical checks found. Replay the same saved suite to compare changes fairly.</p>}</div>}</section>;
}
