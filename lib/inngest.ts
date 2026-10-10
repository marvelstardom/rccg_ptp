import {Inngest} from 'inngest';
import {serviceDb} from './supabase';
import {captionFor,type Programme} from './workflow';
export const inngest=new Inngest({id:'peculiar-treasures-content'});
export const weeklyDrafts=inngest.createFunction({id:'weekly-invitation-drafts',retries:3,triggers:[{cron:'TZ=Africa/Lagos 0 9 * * 5'}]},async({step})=>{
 if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY)throw new Error('Worker database configuration is missing.');
 return step.run('prepare-approved-programme-drafts',async()=>{
  const s=serviceDb();const now=new Date();const end=new Date(now.getTime()+7*86400000);const {data,error}=await s.from('programmes').select('*').eq('approved',true).gte('starts_at',now.toISOString()).lt('starts_at',end.toISOString());if(error)throw error;
  const week=now.toLocaleDateString('en-CA',{timeZone:'Africa/Lagos'});let count=0;
  for(const p of (data??[]) as Programme[]){const caption=captionFor(p);const {error:e}=await s.rpc('prepare_weekly_draft',{p_programme_id:p.id,p_revision:p.revision,p_caption:caption,p_week_key:week});if(e)throw e;count++;}
  return {processed:count,publishing:'paused; human review required'};
 });
});
