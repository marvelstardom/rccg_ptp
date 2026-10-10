-- Worker credentials may prepare drafts, but cannot skip source revision checks.
create function public.prepare_weekly_draft(p_programme_id uuid,p_revision integer,p_caption text,p_week_key text) returns void language plpgsql security definer set search_path=public as $$
declare p public.programmes;
begin
 select * into p from public.programmes where id=p_programme_id for update;
 if p.id is null or not p.approved or p.revision<>p_revision then raise exception 'Source changed';end if;
 if length(p_caption)>4000 or length(trim(p_caption))=0 then raise exception 'Invalid caption';end if;
 insert into public.content_versions(programme_id,source_revision,caption,source_snapshot,week_key) values(p.id,p.revision,p_caption,to_jsonb(p),p_week_key) on conflict(programme_id,source_revision,week_key) do nothing;
end $$;
revoke all on function public.prepare_weekly_draft(uuid,integer,text,text) from public,anon,authenticated;
grant execute on function public.prepare_weekly_draft(uuid,integer,text,text) to service_role;
