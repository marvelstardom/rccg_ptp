import 'server-only';
import {createServerClient} from '@supabase/ssr';
import {createClient} from '@supabase/supabase-js';
import {cookies} from 'next/headers';
import {configured} from './config';
export async function db(){
  if(!configured()) throw new Error('Supabase is not configured. See README.md.');
  const jar=await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{getAll:()=>jar.getAll(),setAll:items=>{try{items.forEach(({name,value,options})=>jar.set(name,value,options));}catch{/* Server Component writes are refreshed by proxy. */}}}});
}
export function serviceDb(){
  if(!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Worker service credentials are not configured.');
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
}
export async function role(){const s=await db();const {data:{user}}=await s.auth.getUser();if(!user)return null;const {data}=await s.from('profiles').select('role').eq('id',user.id).single();return data?.role as string|undefined;}
