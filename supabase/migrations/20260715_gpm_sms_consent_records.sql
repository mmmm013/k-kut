-- K-KUT A2P 10DLC consent authority.
-- Records the customer's voluntary SMS choice, exact disclosure version,
-- source page, and submission time. No browser/anon table access.

create table if not exists public.gpm_sms_consent_records (
  id uuid primary key default gen_random_uuid(),
  phone_e164 text,
  sms_consent boolean not null,
  campaign_sid text not null default 'CM9788370188c8c407e38f427fe849a70f',
  program_name text not null default 'K-KUT',
  consent_version text not null,
  consent_text text not null,
  source_page text not null,
  user_agent text not null default '',
  request_referer text not null default '',
  submitted_at timestamptz not null default now(),
  constraint gpm_sms_consent_campaign_sid check (
    campaign_sid = 'CM9788370188c8c407e38f427fe849a70f'
  ),
  constraint gpm_sms_consent_program_name check (program_name = 'K-KUT'),
  constraint gpm_sms_consent_version_length check (
    char_length(consent_version) between 1 and 120
  ),
  constraint gpm_sms_consent_text_length check (
    char_length(consent_text) between 1 and 2000
  ),
  constraint gpm_sms_consent_source_page_length check (
    char_length(source_page) between 1 and 300
  ),
  constraint gpm_sms_consent_phone_choice check (
    (
      sms_consent = true
      and phone_e164 ~ '^\+1[2-9][0-9]{9}$'
    )
    or
    (
      sms_consent = false
      and phone_e164 is null
    )
  )
);

alter table public.gpm_sms_consent_records enable row level security;

revoke all on table public.gpm_sms_consent_records from anon;
revoke all on table public.gpm_sms_consent_records from authenticated;
grant all on table public.gpm_sms_consent_records to service_role;

create index if not exists gpm_sms_consent_submitted_at_idx
  on public.gpm_sms_consent_records (submitted_at desc);

create index if not exists gpm_sms_consent_phone_submitted_idx
  on public.gpm_sms_consent_records (phone_e164, submitted_at desc)
  where phone_e164 is not null;

comment on table public.gpm_sms_consent_records is
  'Server-only K-KUT A2P consent evidence. Stores voluntary opt-in or decline choice; no SMS is sent by this table.';
