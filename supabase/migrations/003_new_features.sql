-- ============================================================
-- 新機能テーブル
--   ・編成シミュレーター (formations / formation_programs / formation_assignments)
--   ・練習出席カレンダー  (practice_sessions / practice_attendance)
--   ・マイ目標            (member_goals)
-- ============================================================

-- ============================================================
-- 1. 編成シミュレーター
-- ============================================================

create table public.formations (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  event_id   uuid references public.events(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index formations_event_idx on public.formations(event_id);

create table public.formation_programs (
  id            uuid primary key default gen_random_uuid(),
  formation_id  uuid not null references public.formations(id) on delete cascade,
  song_id       text not null references public.songs(id),
  program_order integer not null default 0,
  created_at    timestamptz not null default now()
);

create index formation_programs_formation_idx on public.formation_programs(formation_id);

create table public.formation_assignments (
  id            uuid primary key default gen_random_uuid(),
  program_id    uuid not null references public.formation_programs(id) on delete cascade,
  position_type text not null check (position_type in ('instrument','dance')),
  position_id   text not null,
  member_id     uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  unique (program_id, position_type, position_id)
);

create index formation_assignments_program_idx on public.formation_assignments(program_id);

create trigger trg_formations_updated_at
  before update on public.formations
  for each row execute function public.set_updated_at();

alter table public.formations            enable row level security;
alter table public.formation_programs    enable row level security;
alter table public.formation_assignments enable row level security;

-- 認証済みユーザーは全件閲覧可能
create policy "編成閲覧"             on public.formations            for select to authenticated using (true);
create policy "編成プログラム閲覧"   on public.formation_programs    for select to authenticated using (true);
create policy "編成アサイン閲覧"     on public.formation_assignments for select to authenticated using (true);

-- 書き込みは管理者のみ
create policy "編成管理(insert)"     on public.formations            for insert to authenticated with check (public.is_admin(auth.uid()));
create policy "編成管理(update)"     on public.formations            for update to authenticated using (public.is_admin(auth.uid()));
create policy "編成管理(delete)"     on public.formations            for delete to authenticated using (public.is_admin(auth.uid()));

create policy "編成プログラム管理(insert)" on public.formation_programs for insert to authenticated with check (public.is_admin(auth.uid()));
create policy "編成プログラム管理(update)" on public.formation_programs for update to authenticated using (public.is_admin(auth.uid()));
create policy "編成プログラム管理(delete)" on public.formation_programs for delete to authenticated using (public.is_admin(auth.uid()));

create policy "編成アサイン管理(insert)"   on public.formation_assignments for insert to authenticated with check (public.is_admin(auth.uid()));
create policy "編成アサイン管理(update)"   on public.formation_assignments for update to authenticated using (public.is_admin(auth.uid()));
create policy "編成アサイン管理(delete)"   on public.formation_assignments for delete to authenticated using (public.is_admin(auth.uid()));

-- ============================================================
-- 2. 練習出席カレンダー
-- ============================================================

create table public.practice_sessions (
  id         uuid primary key default gen_random_uuid(),
  date       date not null,
  title      text not null,
  location   text,
  note       text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index practice_sessions_date_idx on public.practice_sessions(date desc);

create table public.practice_attendance (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.practice_sessions(id) on delete cascade,
  member_id  uuid not null references public.profiles(id) on delete cascade,
  attended   boolean not null default false,
  recorded_at timestamptz not null default now(),
  unique (session_id, member_id)
);

create index practice_attendance_session_idx on public.practice_attendance(session_id);
create index practice_attendance_member_idx  on public.practice_attendance(member_id);

alter table public.practice_sessions  enable row level security;
alter table public.practice_attendance enable row level security;

-- 認証済みユーザーは全件閲覧可能
create policy "練習セッション閲覧" on public.practice_sessions  for select to authenticated using (true);
create policy "練習出席閲覧"       on public.practice_attendance for select to authenticated using (true);

-- 書き込みは管理者のみ
create policy "練習セッション管理(insert)" on public.practice_sessions for insert to authenticated with check (public.is_admin(auth.uid()));
create policy "練習セッション管理(update)" on public.practice_sessions for update to authenticated using (public.is_admin(auth.uid()));
create policy "練習セッション管理(delete)" on public.practice_sessions for delete to authenticated using (public.is_admin(auth.uid()));

create policy "練習出席管理(insert)" on public.practice_attendance for insert to authenticated with check (public.is_admin(auth.uid()));
create policy "練習出席管理(update)" on public.practice_attendance for update to authenticated using (public.is_admin(auth.uid()));
create policy "練習出席管理(delete)" on public.practice_attendance for delete to authenticated using (public.is_admin(auth.uid()));

-- ============================================================
-- 3. マイ目標
-- ============================================================

create table public.member_goals (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid not null references public.profiles(id) on delete cascade,
  skill_type  text not null check (skill_type in ('instrument','dance')),
  song_id     text not null references public.songs(id),
  position_id text not null,
  achieved    boolean not null default false,
  achieved_at timestamptz,
  created_at  timestamptz not null default now()
);

create index member_goals_member_idx on public.member_goals(member_id);

alter table public.member_goals enable row level security;

-- 認証済みユーザーは全件閲覧可能（達成を祝うため他人の目標も見える）
create policy "目標閲覧" on public.member_goals for select to authenticated using (true);

-- 本人または管理者のみ書き込み可能
create policy "目標管理(insert)" on public.member_goals for insert to authenticated
  with check (member_id = auth.uid() or public.is_admin(auth.uid()));
create policy "目標管理(update)" on public.member_goals for update to authenticated
  using (member_id = auth.uid() or public.is_admin(auth.uid()));
create policy "目標管理(delete)" on public.member_goals for delete to authenticated
  using (member_id = auth.uid() or public.is_admin(auth.uid()));
