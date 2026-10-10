import {redirect,notFound} from 'next/navigation';
import {db,role} from '@/lib/supabase';
import {demoMode,configured,modules,slug} from '@/lib/config';
import {demoProgrammes} from '@/lib/workflow';
import {Dashboard} from '@/components/dashboard';
export const dynamic='force-dynamic';
export default async function DashboardPage({params}:{params:Promise<{section?:string[]}>}){const {section}=await params;const active=section?.[0]??'home';if(section&&section.length>1||!modules.some(m=>slug(m)===active))notFound();const demo=demoMode();const r=demo?'admin':configured()?await role():null;if(!r)redirect('/login');let programmes=demo?demoProgrammes:[];let members:Record<string,string>[]=[];let content:Record<string,unknown>[]=[];let enquiries:Record<string,string>[]=[];if(!demo){const s=await db();const results=await Promise.all([s.from('programmes').select('*').order('starts_at'),s.from('members').select('id,name,email,department'),s.from('content_versions').select('*').order('created_at',{ascending:false}),s.from('enquiries').select('id,kind,name,email,message,created_at').order('created_at',{ascending:false})]);programmes=results[0].data??[];members=results[1].data??[];content=results[2].data??[];enquiries=results[3].data??[];}
return <Dashboard active={active} role={r} demo={demo} programmes={programmes} members={members} content={content} enquiries={enquiries}/>;}
