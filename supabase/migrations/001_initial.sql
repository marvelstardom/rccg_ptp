-- Apply to an empty Supabase project. All dates use timestamptz (UTC storage).
create extension if not exists pgcrypto;
create type public.app_role as enum ('admin','pastor','media','department_head','finance','pastoral_care');
create table public.profiles(id uuid primary key references auth.users(id) on delete cascade, role public.app_role not null, display_name text not null default 'Team member');
alter table public.profiles enable row level security;
create function public.has_role(roles public.app_role[]) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=auth.uid() and role=any(roles)) $$;
revoke all on public.profiles from anon,authenticated;
grant select on public.profiles to authenticated;
create policy own_profile on public.profiles for select to authenticated using(id=auth.uid());
create table public.programmes(id uuid primary key default gen_random_uuid(),title text not null check(length(title) between 1 and 100),starts_at timestamptz not null,ends_at timestamptz not null,venue text not null check(length(venue) between 1 and 150),description text not null default '' check(length(description)<=1000),approved boolean not null default false,revision integer not null default 1,created_at timestamptz not null default now(),check(ends_at>starts_at));
alter table public.programmes enable row level security;
create policy public_approved_programmes on public.programmes for select using(approved or public.has_role(array['admin','pastor','media']::public.app_role[]));
create policy programme_write on public.programmes for all to authenticated using(public.has_role(array['admin','pastor','media']::public.app_role[])) with check(public.has_role(array['admin','pastor','media']::public.app_role[]));
-- Only the safe columns can be selected anonymously. No administrative metadata.
revoke all on public.programmes from anon;
grant select(id,title,starts_at,ends_at,venue,description,approved,revision) on public.programmes to anon;
create view public.public_programmes with(security_invoker=true) as select id,title,starts_at,ends_at,venue,description,revision from public.programmes where approved;
grant select on public.public_programmes to anon,authenticated;
create table public.members(id uuid primary key default gen_random_uuid(),name text not null,email text,department text,created_at timestamptz not null default now());
alter table public.members enable row level security;
create policy member_admin_only on public.members for all to authenticated using(public.has_role(array['admin']::public.app_role[])) with check(public.has_role(array['admin']::public.app_role[]));
create table public.enquiries(id uuid primary key default gen_random_uuid(),kind text not null check(kind in ('visit','prayer','newsletter','ministry')),name text not null default '',email text not null,message text not null default '',consent_at timestamptz not null default now(),created_at timestamptz not null default now());
alter table public.enquiries enable row level security;
create policy read_enquiries on public.enquiries for select to authenticated using((kind='prayer' and public.has_role(array['pastor','pastoral_care']::public.app_role[])) or (kind<>'prayer' and public.has_role(array['admin','pastor']::public.app_role[])));
-- No anonymous or browser insert policies: submissions use a narrowly scoped server RPC.
create table public.form_limits(ip_hash text primary key,window_start timestamptz not null default now(),count integer not null default 1);
alter table public.form_limits enable row level security;
create function public.submit_enquiry(p_ip_hash text,p_kind text,p_name text,p_email text,p_message text) returns uuid language plpgsql security definer set search_path=public as $$
declare n integer; rid uuid;
begin
 insert into public.form_limits(ip_hash) values(p_ip_hash) on conflict(ip_hash) do update set count=case when form_limits.window_start<now()-interval '1 hour' then 1 else form_limits.count+1 end,window_start=case when form_limits.window_start<now()-interval '1 hour' then now() else form_limits.window_start end returning count into n;
 if n>5 then raise exception 'RATE_LIMIT'; end if;
 insert into public.enquiries(kind,name,email,message) values(p_kind,p_name,p_email,p_message) returning id into rid;return rid;
end $$;
revoke all on function public.submit_enquiry(text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.submit_enquiry(text,text,text,text,text) to service_role;
create table public.content_versions(id uuid primary key default gen_random_uuid(),programme_id uuid not null references public.programmes(id) on delete cascade,source_revision integer not null,caption text not null,source_snapshot jsonb not null,status text not null default 'draft' check(status in ('draft','pending','approved','canceled')),approved_by uuid references auth.users(id),created_at timestamptz not null default now(),week_key text,unique(programme_id,source_revision,week_key));
alter table public.content_versions enable row level security;
create policy read_content on public.content_versions for select to authenticated using(public.has_role(array['admin','pastor','media']::public.app_role[]));
revoke insert,update,delete on public.content_versions from anon,authenticated;
create table public.deliveries(id uuid primary key default gen_random_uuid(),content_id uuid not null references public.content_versions(id) on delete cascade,channel text not null,idempotency_key text not null unique,state text not null default 'Pending' check(state in ('Pending','Accepted','Published','Failed','Unknown','Canceled')),provider_id text,last_error text,attempts integer not null default 0,updated_at timestamptz not null default now());
alter table public.deliveries enable row level security;
create policy read_deliveries on public.deliveries for select to authenticated using(public.has_role(array['admin','pastor','media']::public.app_role[]));
revoke insert,update,delete on public.deliveries from anon,authenticated;
create table public.audit_logs(id bigint generated always as identity primary key,actor uuid,event text not null,record_id uuid,created_at timestamptz not null default now());
alter table public.audit_logs enable row level security;
create policy read_audit on public.audit_logs for select to authenticated using(public.has_role(array['admin']::public.app_role[]));
revoke insert,update,delete on public.audit_logs from anon,authenticated;
create function public.audit_changes() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.audit_logs(actor,event,record_id) values(auth.uid(),tg_table_name||'.'||tg_op,coalesce(new.id,old.id)); return coalesce(new,old);end $$;
create trigger audit_programmes after insert or update or delete on public.programmes for each row execute function public.audit_changes();
create trigger audit_members after insert or update or delete on public.members for each row execute function public.audit_changes();
create trigger audit_content after insert or update or delete on public.content_versions for each row execute function public.audit_changes();
create function public.guard_programme() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if tg_op='INSERT' then
  new.revision=1;
  if new.approved and not public.has_role(array['admin','pastor']::public.app_role[]) then raise exception 'Approval permission required';end if;
 else
  new.revision=old.revision;
  if (new.title,new.starts_at,new.ends_at,new.venue,new.description) is distinct from (old.title,old.starts_at,old.ends_at,old.venue,old.description) then
   new.revision=old.revision+1;new.approved=false;
  elsif new.approved is distinct from old.approved and not public.has_role(array['admin','pastor']::public.app_role[]) then raise exception 'Approval permission required';end if;
  if new.revision<>old.revision or not new.approved then
   update public.content_versions set status='canceled',approved_by=null where programme_id=old.id and status<>'canceled';
   update public.deliveries d set state='Canceled',updated_at=now() from public.content_versions c where d.content_id=c.id and c.programme_id=old.id and d.state in ('Pending','Failed');
   -- Accepted and Unknown deliveries require provider reconciliation, never blind retry.
  end if;
 end if;
 return new;
end $$;
create trigger programme_guard before insert or update on public.programmes for each row execute function public.guard_programme();
create function public.create_draft(p_programme_id uuid,p_caption text) returns uuid language plpgsql security definer set search_path=public as $$
declare p public.programmes;rid uuid;
begin
 if not public.has_role(array['admin','media','pastor']::public.app_role[]) then raise exception 'Forbidden';end if;
 select * into p from public.programmes where id=p_programme_id for update;
 if p.id is null or not p.approved then raise exception 'Approved programme required';end if;
 if length(p_caption)>4000 or length(trim(p_caption))=0 then raise exception 'Invalid caption';end if;
 insert into public.content_versions(programme_id,source_revision,caption,source_snapshot) values(p.id,p.revision,p_caption,to_jsonb(p)) returning id into rid;return rid;
end $$;
create function public.review_content(p_id uuid,p_action text) returns void language plpgsql security definer set search_path=public as $$
declare c public.content_versions;p public.programmes;
begin
 if not public.has_role(array['admin','pastor','media']::public.app_role[]) then raise exception 'Forbidden';end if;
 -- Lock the source first, matching programme edits and avoiding approval/edit races.
 select * into c from public.content_versions where id=p_id;
 select * into p from public.programmes where id=c.programme_id for update;
 select * into c from public.content_versions where id=p_id for update;
 if c.id is null or p.id is null or c.source_revision<>p.revision or not p.approved then raise exception 'Source changed or unapproved';end if;
 if p_action='submit' and c.status='draft' then update public.content_versions set status='pending' where id=c.id;
 elsif p_action='approve' and c.status='pending' and public.has_role(array['admin','pastor']::public.app_role[]) then update public.content_versions set status='approved',approved_by=auth.uid() where id=c.id;
 elsif p_action='cancel' then update public.content_versions set status='canceled',approved_by=null where id=c.id;
 else raise exception 'Invalid transition or permission';end if;
end $$;
revoke all on function public.create_draft(uuid,text),public.review_content(uuid,text) from public,anon;
grant execute on function public.create_draft(uuid,text),public.review_content(uuid,text) to authenticated;
-- Assign profiles through SQL/service administration only; no self-service role escalation.
-- Operational finance, department, inventory, messaging and reports are later modules.
grant select,insert,update,delete on public.programmes,public.members to authenticated;
grant select on public.content_versions,public.deliveries,public.enquiries,public.audit_logs to authenticated;
