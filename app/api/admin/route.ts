import {NextResponse} from 'next/server';
import {z} from 'zod';
import {db,role} from '@/lib/supabase';
import {demoMode,configured} from '@/lib/config';
import {sameOrigin} from '@/lib/request-origin';
const programme=z.object({title:z.string().trim().min(1).max(100),starts_at:z.iso.datetime(),ends_at:z.iso.datetime(),venue:z.string().trim().min(1).max(150),description:z.string().max(1000)}).refine(p=>Date.parse(p.ends_at)>Date.parse(p.starts_at),'End must be after start');
export async function POST(req:Request){
 if(!sameOrigin(req))return NextResponse.json({message:'Forbidden origin'},{status:403});
 if(demoMode())return NextResponse.json({message:'Preview only. Nothing was saved.'},{status:409});
 if(!configured())return NextResponse.json({message:'Database not configured'},{status:503});
 const r=await role();if(!r)return NextResponse.json({message:'Sign in required'},{status:401});
 const raw=await req.json().catch(()=>null);if(!raw||typeof raw.action!=='string')return NextResponse.json({message:'Invalid request'},{status:400});
 const s=await db();let error;
 if(raw.action==='programme'&&['admin','pastor','media'].includes(r)){
  const p=programme.safeParse(raw.data);if(!p.success)return NextResponse.json({message:'Check the programme fields and times.'},{status:400});
  if(raw.id&&!z.uuid().safeParse(raw.id).success)return NextResponse.json({message:'Invalid id'},{status:400});
  const result=raw.id?await s.from('programmes').update(p.data).eq('id',raw.id):await s.from('programmes').insert({...p.data,approved:false});error=result.error;
 }else if(raw.action==='approve-programme'&&['admin','pastor'].includes(r)){
  if(!z.uuid().safeParse(raw.id).success)return NextResponse.json({message:'Invalid id'},{status:400});
  const result=await s.from('programmes').update({approved:true}).eq('id',raw.id);error=result.error;
 }else if(raw.action==='member'&&r==='admin'){
  const p=z.object({name:z.string().trim().min(1).max(100),email:z.union([z.email(),z.literal('')]),department:z.string().max(100)}).safeParse(raw.data);if(!p.success)return NextResponse.json({message:'Check member details.'},{status:400});const result=await s.from('members').insert(p.data);error=result.error;
 }else if(raw.action==='draft'&&['admin','pastor','media'].includes(r)){
  if(!z.uuid().safeParse(raw.programme_id).success||typeof raw.caption!=='string'||raw.caption.length>4000)return NextResponse.json({message:'Invalid content'},{status:400});const result=await s.rpc('create_draft',{p_programme_id:raw.programme_id,p_caption:raw.caption});error=result.error;
 }else if(raw.action==='review'&&['admin','pastor','media'].includes(r)){
  if(!z.uuid().safeParse(raw.id).success||!['submit','approve','cancel'].includes(raw.transition))return NextResponse.json({message:'Invalid review'},{status:400});const result=await s.rpc('review_content',{p_id:raw.id,p_action:raw.transition});error=result.error;
 }else return NextResponse.json({message:'This operation is not available for your role.'},{status:403});
 if(error)return NextResponse.json({message:'Unable to complete the action. Check approval state and permissions.'},{status:400});return NextResponse.json({message:'Saved successfully.'});
}
