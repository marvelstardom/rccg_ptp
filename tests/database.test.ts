import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
test('database roles isolate prayers, prevent self elevation and protect approvals and changed sources',async()=>{
 const s=new PGlite();
 try{
  await s.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema public,auth to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;`);
  for(const file of ['001_initial.sql','002_worker.sql']){const sql=(await readFile(`supabase/migrations/${file}`,'utf8')).replace('create extension if not exists pgcrypto;','');await s.exec(sql);}
  const ids={admin:'00000000-0000-0000-0000-000000000001',media:'00000000-0000-0000-0000-000000000002',pastor:'00000000-0000-0000-0000-000000000003',care:'00000000-0000-0000-0000-000000000004',finance:'00000000-0000-0000-0000-000000000005'};
  for(const [r,id] of Object.entries(ids)){await s.query('insert into auth.users(id) values($1)',[id]);await s.query('insert into profiles(id,role) values($1,$2)',[id,r==='care'?'pastoral_care':r]);}
  await s.exec(`insert into enquiries(kind,name,email,message) values ('prayer','Person','person@example.test','Private prayer'),('visit','Visitor','visitor@example.test','Hello');insert into members(name) values('Private member');`);
  async function as(r:keyof typeof ids){await s.exec('reset role');await s.query("select set_config('request.jwt.claim.sub',$1,false)",[ids[r]]);await s.exec('set role authenticated');}
  await as('admin');assert.equal((await s.query('select * from enquiries')).rows.length,1);assert.equal((await s.query("select * from enquiries where kind='prayer'")).rows.length,0);assert.equal((await s.query('select * from members')).rows.length,1);
  await as('care');assert.equal((await s.query('select * from enquiries')).rows.length,1);assert.equal((await s.query("select * from enquiries where kind='prayer'")).rows.length,1);assert.equal((await s.query('select * from members')).rows.length,0);
  await as('finance');assert.equal((await s.query('select * from enquiries')).rows.length,0);
  await as('media');assert.equal((await s.query('select * from members')).rows.length,0);assert.equal((await s.query('select * from enquiries')).rows.length,0);await assert.rejects(s.query("update profiles set role='admin' where id=$1",[ids.media]));
  const p=(await s.query<{id:string}>("insert into programmes(title,starts_at,ends_at,venue) values('Real programme','2026-10-11T06:00:00Z','2026-10-11T07:20:00Z','Confirmed church venue') returning id")).rows[0].id;
  await assert.rejects(s.query('update programmes set approved=true where id=$1',[p]));
  await s.exec('reset role;set role anon');assert.equal((await s.query('select * from public_programmes')).rows.length,0);await assert.rejects(s.query('select * from members'));await assert.rejects(s.query("select review_content('00000000-0000-0000-0000-000000000000','approve')"));
  await as('pastor');await s.query('update programmes set approved=true where id=$1',[p]);
  await s.exec('reset role;set role anon');assert.equal((await s.query('select * from public_programmes')).rows.length,1);
  await as('media');const cid=(await s.query<{id:string}>('select create_draft($1,$2) as id',[p,'Caption from confirmed programme'])).rows[0].id;await s.query("select review_content($1,'submit')",[cid]);await assert.rejects(s.query("select review_content($1,'approve')",[cid]));await assert.rejects(s.query("update content_versions set status='approved' where id=$1",[cid]));
  await as('pastor');await s.query("select review_content($1,'approve')",[cid]);const approved=(await s.query<{status:string;approved_by:string}>('select status,approved_by from content_versions where id=$1',[cid])).rows[0];assert.equal(approved.status,'approved');assert.equal(approved.approved_by,ids.pastor);
  await as('media');await s.query("update programmes set title='Changed programme',revision=999 where id=$1",[p]);const changed=(await s.query<{revision:number;approved:boolean}>('select revision,approved from programmes where id=$1',[p])).rows[0];assert.equal(changed.revision,2);assert.equal(changed.approved,false);assert.equal((await s.query<{status:string}>('select status from content_versions where id=$1',[cid])).rows[0].status,'canceled');
  await as('pastor');await s.query('update programmes set approved=true where id=$1',[p]);await s.exec('reset role');await s.query('select prepare_weekly_draft($1,2,$2,$3)',[p,'Weekly caption','2026-10-09']);await s.query('select prepare_weekly_draft($1,2,$2,$3)',[p,'Weekly caption','2026-10-09']);assert.equal((await s.query("select * from content_versions where week_key='2026-10-09'")).rows.length,1);await assert.rejects(s.query('select prepare_weekly_draft($1,1,$2,$3)',[p,'Stale caption','2026-10-09']));
  for(let i=0;i<5;i++)await s.query("select submit_enquiry('rate-test','newsletter','','test@example.test','')");await assert.rejects(s.query("select submit_enquiry('rate-test','newsletter','','test@example.test','')"),/RATE_LIMIT/);
 }finally{await s.close();}
});
