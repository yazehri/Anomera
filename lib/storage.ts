import { createClient } from '@supabase/supabase-js';
import type { Run } from './engine';
import { parseSuite, type Suite } from './research';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && key ? createClient(url, key) : null;
const LOCAL_KEY = 'blindspot.runs.v1';
export function readLocal(): Run[] { try { const value: unknown = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'); return Array.isArray(value) ? value.filter(isRun).slice(0, 30) : []; } catch { return []; } }
export function isRun(value: unknown): value is Run { if (!value || typeof value !== 'object') return false; const r = value as Partial<Run>; return (r.version === '1.0' || r.version === '1.1') && typeof r.id === 'string' && typeof r.name === 'string' && typeof r.createdAt === 'string' && Array.isArray(r.results) && Array.isArray(r.models) && r.models.length === 2; }
export function writeLocal(run: Run) { const runs = [run, ...readLocal().filter(r => r.id !== run.id)].slice(0, 30); localStorage.setItem(LOCAL_KEY, JSON.stringify(runs)); return runs; }
export async function saveCloud(run: Run) { if (!supabase) throw new Error('Cloud storage is not configured.'); const { data: { user }, error: authError } = await supabase.auth.getUser(); if (authError || !user) throw new Error('Sign in to save this run to your workspace.'); const { error } = await supabase.from('evaluation_runs').insert({ id: run.id, user_id: user.id, name: run.name.slice(0, 120), created_at: run.createdAt, payload: run }); if (error) throw new Error(error.code === '23505' ? 'This run is already saved to your workspace.' : error.message); }
export async function loadCloud(): Promise<Run[]> { if (!supabase) return []; const { data, error } = await supabase.from('evaluation_runs').select('payload').order('created_at', { ascending: false }).limit(30); if (error) throw error; return (data ?? []).map(r => r.payload).filter(isRun); }

const SUITES_KEY = 'blindspot.suites.v1';
export async function readLocalSuites(): Promise<Suite[]> {
  try {const raw:unknown=JSON.parse(localStorage.getItem(SUITES_KEY)||'[]');if(!Array.isArray(raw))return [];const parsed=await Promise.allSettled(raw.slice(0,30).map(parseSuite));return parsed.flatMap(r=>r.status==='fulfilled'?[r.value]:[]);} catch{return [];}
}
export async function writeLocalSuite(suite: Suite): Promise<Suite[]> {
  const validated=await parseSuite(suite);const existing=await readLocalSuites();const prior=existing.find(s=>s.id===validated.id);
  if(prior && prior.contentHash!==validated.contentHash)throw new Error('A different suite already uses this ID. Import cannot replace its frozen prompts.');
  const suites=[validated,...existing.filter(s=>s.id!==validated.id)].slice(0,30);localStorage.setItem(SUITES_KEY,JSON.stringify(suites));return suites;
}
export async function saveSuiteCloud(suite: Suite) {
  if(!supabase)throw new Error('Cloud storage is not configured.');const valid=await parseSuite(suite);const {data:{user},error:authError}=await supabase.auth.getUser();if(authError||!user)throw new Error('Sign in to save suites to your workspace.');
  const {error}=await supabase.from('regression_suites').insert({id:valid.id,user_id:user.id,name:valid.name,created_at:valid.createdAt,payload:valid});if(error)throw new Error(error.code==='23505'?'This suite is already saved to your workspace.':error.message);
}
export async function loadCloudSuites(): Promise<Suite[]> {
  if(!supabase)return [];const {data:{user},error:authError}=await supabase.auth.getUser();if(authError||!user)throw new Error('Sign in to load cloud suites.');const {data,error}=await supabase.from('regression_suites').select('payload').eq('user_id',user.id).order('created_at',{ascending:false}).limit(30);if(error)throw error;const parsed=await Promise.allSettled((data??[]).map(r=>parseSuite(r.payload)));if(parsed.some(r=>r.status==='rejected'))throw new Error('A cloud suite failed its integrity check.');return parsed.flatMap(r=>r.status==='fulfilled'?[r.value]:[]);
}
