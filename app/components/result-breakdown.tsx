'use client';
import { families, summarize, type Family, type Result } from '@/lib/engine';
const outcomes: {key: Result['direction']; label: string; explanation: string}[] = [
  {key:'agreement',label:'Both passed',explanation:'Both models returned a passing answer.'},
  {key:'regression',label:'Regressions',explanation:'Baseline passed; candidate failed.'},
  {key:'improvement',label:'Improvements',explanation:'Baseline failed; candidate passed.'},
  {key:'shared failure',label:'Both failed',explanation:'Both models failed the required check.'},
  {key:'error',label:'Response errors',explanation:'At least one response has an error. Excluded from pass rates.'},
];
export function ResultBreakdown({results, filter}: {results: Result[]; filter: (family?: Family, outcome?: Result['direction'], level?: number) => void}) {
  return <div className="result-breakdown">
    <div className="section-heading"><div><h2>Every outcome, accounted for</h2><p>Select a category to inspect its probes. Errors are separate from failed checks.</p></div></div>
    <div className="outcome-strip" aria-label="Probe outcome distribution">{outcomes.map(o=>{const count=results.filter(r=>r.direction===o.key).length;return <button key={o.key} disabled={!count} className={`outcome-item ${o.key.replace(' ','-')}`} onClick={()=>filter(undefined,o.key)} title={o.explanation}><span className="outcome-label"><i/>{o.label}</span><strong>{count}<small>{results.length ? Math.round(count/results.length*100) : 0}%</small></strong><span className="outcome-track"><i style={{width:`${results.length?count/results.length*100:0}%`}}/></span></button>;})}</div>
    <details className="coverage-details"><summary>Explore candidate pass rates by task complexity</summary><p>Each cell shows passed / valid probes. Select it to inspect the exact sample. “—” means no valid paired responses, not a zero score.</p><div className="table-wrap"><table className="coverage-table"><caption>Candidate scores by task and generated complexity level</caption><thead><tr><th scope="col">Task family</th>{[1,2,3,4].map(level=><th scope="col" key={level}>Level {level}</th>)}</tr></thead><tbody>{families.map(family=><tr key={family}><th scope="row">{family}</th>{[1,2,3,4].map(level=>{const cell=results.filter(r=>r.probe.family===family&&r.probe.level===level);const s=summarize(cell);const passed=cell.filter(r=>!r.a.error&&!r.b.error&&r.b.pass).length;return <td key={level}><button disabled={!cell.length} onClick={()=>filter(family,undefined,level)} aria-label={`${family}, level ${level}: ${s.valid ? `${passed} of ${s.valid} passed, ${s.b}%` : 'no valid responses'}`}><strong>{s.valid?`${s.b}%`:'—'}</strong><small>{s.valid?`${passed}/${s.valid} passed`:cell.length?'Response errors':'Not sampled'}</small></button></td>;})}</tr>)}</tbody></table></div></details>
  </div>;
}
