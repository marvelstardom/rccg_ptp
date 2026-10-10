import sharp from 'sharp';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {z} from 'zod';
import {db,role} from '@/lib/supabase';
import {configured,demoMode} from '@/lib/config';
import {graphicSvg,dimensions,templates} from '@/lib/graphics';
import {validateProgramme,type Programme} from '@/lib/workflow';
import {sameOrigin} from '@/lib/request-origin';
export const runtime='nodejs';
export async function POST(req:Request){
 if(!sameOrigin(req))return Response.json({message:'Forbidden origin'},{status:403});
 const demo=demoMode();if(!demo&&(!configured()||!['admin','pastor','media'].includes(await role()??'')))return Response.json({message:'Media sign-in required'},{status:403});
 const body=await req.json().catch(()=>null);const parsed=z.object({programme_id:z.string(),template:z.enum(templates),size:z.enum(['portrait','square','story'])}).safeParse(body);if(!parsed.success)return Response.json({message:'Invalid graphic settings'},{status:400});
 let p:Programme;if(demo){const result=z.object({id:z.string(),title:z.string().max(100),starts_at:z.iso.datetime(),ends_at:z.iso.datetime(),venue:z.string().max(150),description:z.string().max(1000),approved:z.boolean(),revision:z.number().int()}).safeParse(body.programme);if(!result.success)return Response.json({message:'Invalid preview programme'},{status:400});p=result.data;}else{const s=await db();const {data}=await s.from('programmes').select('*').eq('id',parsed.data.programme_id).single();if(!data)return Response.json({message:'Programme not found'},{status:404});p=data;}
 try{validateProgramme(p);const bytes=await readFile(join(process.cwd(),'public/images/brand/rccg.png'));const logo=`data:image/png;base64,${bytes.toString('base64')}`;const svg=graphicSvg(p,parsed.data.template,parsed.data.size,logo,demo);const png=await sharp(Buffer.from(svg)).png().toBuffer();const meta=await sharp(png).metadata();const [w,h]=dimensions[parsed.data.size];if(meta.width!==w||meta.height!==h)throw new Error('Export dimensions invalid');return new Response(new Uint8Array(png),{headers:{'Content-Type':'image/png','Content-Disposition':'attachment; filename="church-graphic.png"','Cache-Control':'private, no-store'}});}catch(e){return Response.json({message:(e as Error).message},{status:400});}
}
