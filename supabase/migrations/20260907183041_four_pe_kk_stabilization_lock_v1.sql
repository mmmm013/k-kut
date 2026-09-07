-- Current production stabilization phase: KK only.
-- Later II types require their own explicit enabling migration after KK repeatability passes.
alter table public.gpm_4pe_staged_changes
  drop constraint gpm_4pe_staged_changes_requested_types_check1,
  add constraint gpm_4pe_staged_changes_kk_only_check
    check (requested_types = array['KK']::text[]);
