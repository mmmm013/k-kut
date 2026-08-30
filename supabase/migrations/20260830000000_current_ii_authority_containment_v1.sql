-- K-KUT current-II authority containment.
-- This migration closes legacy client-readable database and Storage pathways.
-- It does not delete tables, rows, buckets, or stored objects.

set lock_timeout = '5s';
set statement_timeout = '60s';

revoke select on table
  public.k_kuts,
  public.k_kut_audio_qc,
  public.k_kut_launch_audio,
  public.mks,
  public.m_kut_asset,
  public.m_kut_assets
from public, anon, authenticated;

drop policy if exists "anon_select_playable" on public.k_kut_audio_qc;
drop policy if exists "Enable read access for all users" on public.k_kut_launch_audio;
drop policy if exists "k_kuts_anon_read" on public.k_kuts;
drop policy if exists "k_kuts_authenticated_read" on public.k_kuts;

update storage.buckets
set public = false
where id in ('ii-delivery', 'tracks', 'kuts', 'audiostore');

do $$
declare
  exposed_acl_count integer;
  public_bucket_count integer;
  remaining_public_policy_count integer;
  remaining_public_storage_policy_count integer;
begin
  select count(*)
  into exposed_acl_count
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname in (
      'k_kuts',
      'k_kut_audio_qc',
      'k_kut_launch_audio',
      'mks',
      'm_kut_asset',
      'm_kut_assets'
    )
    and (
      has_table_privilege('anon', c.oid, 'select')
      or has_table_privilege('authenticated', c.oid, 'select')
    );

  if exposed_acl_count <> 0 then
    raise exception 'current-II containment failed: % client-readable legacy objects remain', exposed_acl_count;
  end if;

  select count(*)
  into public_bucket_count
  from storage.buckets
  where id in ('ii-delivery', 'tracks', 'kuts', 'audiostore')
    and public is true;

  if public_bucket_count <> 0 then
    raise exception 'current-II containment failed: % legacy audio buckets remain public', public_bucket_count;
  end if;

  select count(*)
  into remaining_public_policy_count
  from pg_policies
  where schemaname = 'public'
    and (
      (tablename = 'k_kut_audio_qc' and policyname = 'anon_select_playable')
      or (tablename = 'k_kut_launch_audio' and policyname = 'Enable read access for all users')
      or (tablename = 'k_kuts' and policyname in ('k_kuts_anon_read', 'k_kuts_authenticated_read'))
    );

  if remaining_public_policy_count <> 0 then
    raise exception 'current-II containment failed: % legacy public policies remain', remaining_public_policy_count;
  end if;

  select count(*)
  into remaining_public_storage_policy_count
  from pg_policies
  where schemaname = 'storage'
    and tablename = 'objects'
    and cmd in ('SELECT', 'ALL')
    and roles && array['public', 'anon', 'authenticated']::name[]
    and (
      qual is null
      or lower(qual) = 'true'
      or qual ilike '%ii-delivery%'
      or qual ilike '%tracks%'
      or qual ilike '%kuts%'
      or qual ilike '%audiostore%'
    );

  if remaining_public_storage_policy_count <> 0 then
    raise exception 'current-II containment failed: % client storage policies may still expose legacy audio', remaining_public_storage_policy_count;
  end if;
end
$$;
