import {configured,demoMode} from './config';
import {db} from './supabase';
import {demoProgrammes, type Programme} from './workflow';
export async function programmes():Promise<Programme[]>{
  if(demoMode()) return demoProgrammes;
  if(!configured()) return [];
  const s=await db();const {data,error}=await s.from('public_programmes').select('*').gte('ends_at',new Date().toISOString()).order('starts_at');
  if(error) throw new Error('Programme information could not be loaded.');
  return (data??[]).map(p=>({...p,approved:true}));
}
