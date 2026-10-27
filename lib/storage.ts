import { createClient } from '@supabase/supabase-js';
import type { Run } from './engine';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && key ? createClient(url, key) : null;
const LOCAL_KEY = 'blindspot.runs.v1';
export function readLocal(): Run[] { try { const value: unknown = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'); return Array.isArray(value) ? value.filter(isRun).slice(0, 30) : []; } catch { return []; } }
export function isRun(value: unknown): value is Run { if (!value || typeof value !== 'object') return false; const r = value as Partial<Run>; return r.version === '1.0' && typeof r.id === 'string' && typeof r.name === 'string' && typeof r.createdAt === 'string' && Array.isArray(r.results) && Array.isArray(r.models) && r.models.length === 2; }
export function writeLocal(run: Run) { const runs = [run, ...readLocal().filter(r => r.id !== run.id)].slice(0, 30); localStorage.setItem(LOCAL_KEY, JSON.stringify(runs)); return runs; }
export async function saveCloud(run: Run) { if (!supabase) throw new Error('Cloud storage is not configured.'); const { data: { user }, error: authError } = await supabase.auth.getUser(); if (authError || !user) throw new Error('Sign in to save this run to your workspace.'); const { error } = await supabase.from('evaluation_runs').insert({ id: run.id, user_id: user.id, name: run.name.slice(0, 120), created_at: run.createdAt, payload: run }); if (error) throw new Error(error.code === '23505' ? 'This run is already saved to your workspace.' : error.message); }
export async function loadCloud(): Promise<Run[]> { if (!supabase) return []; const { data, error } = await supabase.from('evaluation_runs').select('payload').order('created_at', { ascending: false }).limit(30); if (error) throw error; return (data ?? []).map(r => r.payload).filter(isRun); }
