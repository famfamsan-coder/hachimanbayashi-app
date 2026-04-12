-- ============================================================
-- 入会申請テーブル
-- ============================================================

create table public.registration_requests (
  id            uuid primary key default gen_random_uuid(),
  display_name  text not null,
  furigana      text not null,
  email         text not null,
  join_year     integer,
  message       text,
  status        text not null default 'pending'
                  check (status in ('pending','approved','deleted')),
  created_at    timestamptz not null default now(),
  reviewed_at   timestamptz,
  reviewed_by   uuid references public.profiles(id) on delete set null
);

create index registration_requests_status_idx     on public.registration_requests(status);
create index registration_requests_created_at_idx on public.registration_requests(created_at desc);

-- ============================================================
-- RLS
-- ============================================================

alter table public.registration_requests enable row level security;

-- 誰でも（未認証でも）INSERT可能：入会希望フォームから
create policy "入会申請 誰でも投稿可"
  on public.registration_requests for insert
  to anon, authenticated
  with check (true);

-- 閲覧は管理者のみ
create policy "入会申請 管理者のみ閲覧"
  on public.registration_requests for select
  to authenticated
  using (public.is_admin(auth.uid()));

-- 更新は管理者のみ
create policy "入会申請 管理者のみ更新"
  on public.registration_requests for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- 削除は管理者のみ（ただし運用上は status='deleted' で論理削除を推奨）
create policy "入会申請 管理者のみ物理削除"
  on public.registration_requests for delete
  to authenticated
  using (public.is_admin(auth.uid()));
