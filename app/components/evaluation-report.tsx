'use client';
import { useState } from 'react';
import { ArrowUpRight, Download, FileText, ShieldCheck } from 'lucide-react';
import { buildReport, reportMarkdown, type ModelSide } from '@/lib/report';
import type { Result, Run } from '@/lib/engine';

export function EvaluationReport({run, inspect}: {run: Run; inspect: (result: Result) => void}) {
  const [side,setSide] = useState<ModelSide>('b');
  const report = buildReport(run, side);
  function download() {
    const url = URL.createObjectURL(new Blob([reportMarkdown(run,side)],{type:'text/markdown;charset=utf-8'}));
    const link = document.createElement('a'); link.href=url; link.download=`Anomera-report-${run.id.slice(0,8)}-${side}.md`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  return <section className="evaluation-report" aria-label="Evaluation report">
    <div className="report-toolbar"><div className="segmented" aria-label="Report model">{(['a','b'] as const).map((s,i)=><button key={s} aria-pressed={side===s} onClick={()=>setSide(s)}>{i===0?'Baseline':'Candidate'}<span>{run.models[i].name}</span></button>)}</div><button className="secondary" onClick={download}><Download size={15}/>Export report</button></div>
    <div className="report-lead"><span className="eyebrow"><FileText size={14}/>EVIDENCE-BASED SUMMARY</span><h2>{report.headline}</h2><p>{report.narrative}</p><div className="report-totals"><span><strong>{report.passed}</strong> passed</span><span><strong>{report.failures}</strong> failed</span><span><strong>{report.errors}</strong> excluded errors</span></div></div>
    <div className="report-section-heading"><h2>What to investigate</h2><span>Ordered by observed failure count</span></div>
    {report.weaknesses.length ? <div className="weakness-list">{report.weaknesses.map((w,i)=><article className="weakness-card" key={w.family}><div className="weakness-title"><span className="eyebrow">0{i+1} / {w.family}</span><span className="failure-count">{w.failed}/{w.tested} failed <small>({w.rate}%)</small></span></div><div className="recommendation-grid"><div><h3>What the checks found</h3><p>{w.failed} {report.model} responses failed the {w.family.toLowerCase()} check. That can reflect an incorrect answer or failure to follow the required output format.</p><button className="text-button" onClick={()=>inspect(w.evidence[0])}>Inspect an actual failure <ArrowUpRight size={14}/></button></div><div><h3>What a developer can try</h3><p>{w.action}</p></div><div><h3>How to verify the change</h3><p>{w.verify}</p></div></div><details><summary>All {w.failed} supporting probes</summary><div className="report-evidence-list">{w.evidence.map(r=><button key={r.probe.id} onClick={()=>inspect(r)}><span>{r.probe.id}</span><span>{r.probe.prompt}</span><ArrowUpRight size={14}/></button>)}</div></details></article>)}</div> : <div className="empty panel"><ShieldCheck size={24}/><h3>{report.valid ? 'No fixes inferred from passing checks.' : 'Collect valid responses first.'}</h3><p>{report.valid ? 'Expand coverage with fresh prompts and other task families before making reliability claims.' : 'Check your endpoint configuration and error messages, then explicitly rerun the failed requests.'}</p></div>}
    <details className="report-scope" open><summary>How to interpret this report</summary><ul>{report.scope.map(text=><li key={text}>{text}</li>)}</ul><p>Written from recorded checks with fixed rules. No extra API requests, no inferred root cause.</p></details>
  </section>;
}
