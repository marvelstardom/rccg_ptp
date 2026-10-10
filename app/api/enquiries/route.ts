import {NextResponse} from 'next/server';
import {createHmac} from 'node:crypto';
import {z} from 'zod';
import {serviceDb} from '@/lib/supabase';
import {demoMode,configured} from '@/lib/config';
import {sameOrigin} from '@/lib/request-origin';
const schema=z.object({kind:z.enum(['visit','prayer','newsletter','ministry']),name:z.string().trim().max(100).optional(),email:z.email().max(254),message:z.string().trim().max(2000).optional(),consent:z.literal('yes'),website:z.string().max(200).optional()});
export async function POST(req:Request){
  if(Number(req.headers.get('content-length')??0)>12000)return NextResponse.json({message:'Request too large.'},{status:413});
  if(!sameOrigin(req))return NextResponse.json({message:'Request origin not allowed.'},{status:403});
  const parsed=schema.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({message:'Please check the fields and consent box.'},{status:400});
  const p=parsed.data;if(p.website)return NextResponse.json({message:'Thank you.'});
  if(p.kind!=='newsletter'&&(!p.name||!p.message))return NextResponse.json({message:'Name and message are required.'},{status:400});
  if(demoMode())return NextResponse.json({message:'Preview only: your request has not been sent or saved. Configure Supabase to receive enquiries.'},{status:503});
  if(!configured()||!process.env.FORM_IP_HASH_SECRET||!process.env.SUPABASE_SERVICE_ROLE_KEY)return NextResponse.json({message:'Submissions are not available yet. Please try again later.'},{status:503});
  // On Vercel this header is supplied by the trusted edge. Other hosts must strip client-supplied values.
  const ip=req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim();
  if(!ip&&process.env.NODE_ENV==='production')return NextResponse.json({message:'Submission service unavailable.'},{status:503});
  const hash=createHmac('sha256',process.env.FORM_IP_HASH_SECRET).update(ip??'local').digest('hex');
  const {error}=await serviceDb().rpc('submit_enquiry',{p_ip_hash:hash,p_kind:p.kind,p_name:p.name??'',p_email:p.email,p_message:p.message??''});
  if(error)return NextResponse.json({message:error.message.includes('RATE_LIMIT')?'Please wait before sending another request.':'Unable to save your request. Please try later.'},{status:error.message.includes('RATE_LIMIT')?429:500});
  return NextResponse.json({message:'Thank you. Your request has been received securely.'});
}
