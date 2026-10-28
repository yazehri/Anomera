import {mkdir,writeFile} from 'node:fs/promises';
import {evaluate,defaultModels,summarize,families} from '../lib/engine';
import {validationProbes} from '../lib/research';

// Explicitly mock-only: this command cannot incur provider charges.
async function main() {
const count=80;
const runs=[];
for(let seed=0;seed<20;seed++){
 const discovery=await evaluate({models:defaultModels,seed,count,name:`Discovery ${seed}`,signal:new AbortController().signal,onProgress:()=>{}});
 const validation=await evaluate({models:defaultModels,seed:seed+10000,count,name:`Validation ${seed}`,mode:'validation',validationOf:discovery.id,probes:validationProbes(discovery,seed+10000,count),signal:new AbortController().signal,onProgress:()=>{}});
 runs.push({seed,discovery,validation});
 console.log(`Completed seed ${seed+1}/20`);
}
const summary=runs.map(({seed,discovery,validation})=>({seed,discovery:summarize(discovery.results),validation:summarize(validation.results),byFamily:families.map(family=>({family,...summarize(validation.results.filter(r=>r.probe.family===family))})),byComplexity:[1,2,3,4].map(level=>({level,...summarize(validation.results.filter(r=>r.probe.level===level))}))}));
const report={kind:'blindspot-mock-benchmark',version:1,createdAt:new Date().toISOString(),seeds:20,probesPerRun:count,modelCalls:20*count*4,limitations:['Deterministic simulated models; no claims about real model performance.','Validation excludes each paired discovery set, but seeds may share prompts.','Fixed grammar tasks; complexity labels are generator settings, not calibrated difficulty.','Seed-level results are descriptive; no independence or statistical significance claim.'],summary,runs};
const directory=`artifacts/benchmark-${Date.now()}`;
await mkdir(directory,{recursive:true});
await writeFile(`${directory}/results.json`,JSON.stringify(report,null,2));
const rows=summary.map(s=>`| ${s.seed} | ${s.discovery.regressions} | ${s.validation.regressions} | ${s.validation.a}% | ${s.validation.b}% | ${s.validation.errors} |`);
await writeFile(`${directory}/REPORT.md`,['# Mock pipeline benchmark','','20 seeds × 80 discovery probes + 80 held-out validation probes. All model behavior is simulated.','','| Seed | Discovery regressions | Validation regressions | Baseline pass | Candidate pass | Errors |','|---|---|---|---|---|---|',...rows,'','## Limitations','',...report.limitations.map(s=>`- ${s}`),'','Full prompts, responses, settings, and family/complexity breakdowns are in results.json.'].join('\n'));
console.log(`Saved ${directory}`);

}
main().catch(error=>{console.error(error);process.exitCode=1;});
