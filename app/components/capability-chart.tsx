'use client';
import { useState } from 'react';
import { families, summarize, type Result, type Family } from '@/lib/engine';

/** Paired, zero-baseline bars. Only probes with two valid responses enter rates. */
export function CapabilityChart({ results, names, inspectFamily }: { results: Result[]; names: [string, string]; inspectFamily?: (family: Family) => void }) {
  const [visible, setVisible] = useState<[boolean, boolean]>([true, true]);
  return <div className="capability-chart">
    <div className="chart-legend">{names.map((name, i) => <button key={i} aria-pressed={visible[i]} title={`Toggle ${i === 0 ? 'baseline' : 'candidate'} series`} onClick={() => setVisible(i === 0 ? [!visible[0], visible[1]] : [visible[0], !visible[1]])}><i className={i === 0 ? 'base' : 'candidate'}/><span>{i === 0 ? 'Baseline' : 'Candidate'}</span><small>{name}</small></button>)}</div>
    <div className="chart-scale" aria-hidden="true"><span>0</span><span>25</span><span>50</span><span>75</span><span>100%</span></div>
    <div className="chart-families">{families.map(family => {
      const score = summarize(results.filter(r => r.probe.family === family));
      return <div className="chart-family" key={family}><div className="chart-family-heading"><button className="chart-family-link" disabled={!results.some(r=>r.probe.family===family)} onClick={()=>inspectFamily?.(family)} title={`Inspect ${family} probes`}>{family}<span aria-hidden="true">↗</span></button><small>{score.valid} valid probes</small></div><div className="chart-pair">{[score.a, score.b].map((rate, i) => visible[i] && <div className="chart-series" key={i} aria-label={`${names[i]}, ${family}: ${score.valid ? `${rate}% pass rate across ${score.valid} valid probes` : 'no valid probes'}`}><div className="chart-track"><div className={i === 0 ? 'base' : 'candidate'} style={{width: `${score.valid ? rate : 0}%`}}/></div><span>{score.valid ? `${rate}%` : '—'}</span></div>)}</div></div>;
    })}</div>
    {!visible.some(Boolean) && <p className="chart-hint">Select a model above to show its scores.</p>}
  </div>;
}
