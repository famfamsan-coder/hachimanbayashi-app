-- ============================================================
-- 八幡ばやし保存会 会員管理アプリ  初期スキーマ
-- Phase 1: テーブル + RLS + is_admin + 論理削除 + シード
-- ============================================================

-- ============================================================
-- 1. マスタ & プロフィール
-- ============================================================

create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  furigana     text,
  role         text not null default 'member' check (role in ('member','admin')),
  join_year    integer,
  bio          text,
  avatar_url   text,
  deleted_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index profiles_role_idx       on public.profiles(role);
create index profiles_deleted_at_idx on public.profiles(deleted_at);

create table public.songs (
  id         text primary key,
  name       text not null,
  reading    text not null,
  sort_order integer not null default 0
);

create table public.instruments (
  id           text primary key,
  name         text not null,
  alias        text not null,
  player_count integer not null default 1,
  sort_order   integer not null default 0
);

create table public.dances (
  id         text primary key,
  name       text not null,
  sort_order integer not null default 0
);

create table public.song_dances (
  song_id  text not null references public.songs(id)  on delete cascade,
  dance_id text not null references public.dances(id) on delete cascade,
  primary key (song_id, dance_id)
);

-- ============================================================
-- 2. スキル
-- ============================================================

create table public.member_instrument_skills (
  id            uuid primary key default gen_random_uuid(),
  member_id     uuid not null references public.profiles(id) on delete cascade,
  song_id       text not null references public.songs(id),
  instrument_id text not null references public.instruments(id),
  granted_at    timestamptz not null default now(),
  granted_by    uuid references public.profiles(id),
  unique (member_id, song_id, instrument_id)
);

create index mis_member_idx on public.member_instrument_skills(member_id);

create table public.member_dance_skills (
  id         uuid primary key default gen_random_uuid(),
  member_id  uuid not null references public.profiles(id) on delete cascade,
  song_id    text not null,
  dance_id   text not null,
  granted_at timestamptz not null default now(),
  granted_by uuid references public.profiles(id),
  unique (member_id, song_id, dance_id),
  -- 曲×舞の整合性を song_dances で保証（指摘 #7）
  foreign key (song_id, dance_id) references public.song_dances(song_id, dance_id)
);

create index mds_member_idx on public.member_dance_skills(member_id);

-- ============================================================
-- 3. お知らせ / イベント / 動画
-- ============================================================

create table public.announcements (
  id                        uuid primary key default gen_random_uuid(),
  title                     text not null,
  body                      text not null,
  type                      text not null default 'general'
                              check (type in ('general','skill_achievement','event')),
  related_member_id         uuid references public.profiles(id) on delete set null,
  related_skill_description text,
  is_pinned                 boolean not null default false,
  expires_at                timestamptz,
  created_by                uuid references public.profiles(id) on delete set null,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index announcements_created_at_idx on public.announcements(created_at desc);
create index announcements_expires_at_idx on public.announcements(expires_at);

create table public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  event_date  date not null,
  event_time  text,
  location    text,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index events_event_date_idx on public.events(event_date);

create table public.event_responses (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references public.events(id)  on delete cascade,
  member_id    uuid not null references public.profiles(id) on delete cascade,
  status       text not null check (status in ('attend','absent','pending')),
  comment      text,
  responded_at timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (event_id, member_id)
);

create table public.practice_videos (
  id            uuid primary key default gen_random_uuid(),
  song_id       text not null references public.songs(id),
  instrument_id text references public.instruments(id),
  dance_id      text references public.dances(id),
  video_type    text not null check (video_type in ('instrument','dance','ensemble')),
  youtube_url   text not null,
  title         text,
  description   text,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (
    (video_type = 'instrument' and instrument_id is not null and dance_id is null) or
    (video_type = 'dance'      and dance_id is not null      and instrument_id is null) or
    (video_type = 'ensemble'   and instrument_id is null     and dance_id is null)
  )
);

create table public.badge_thresholds (
  id         serial primary key,
  grade_name text not null,
  color      text not null,
  min_tags   integer not null,
  max_tags   integer not null,
  sort_order integer not null default 0
);

-- ============================================================
-- 4. is_admin() — SECURITY DEFINER で RLS 再帰回避
-- ============================================================

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role = 'admin' and deleted_at is null
  );
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated;

-- ============================================================
-- 5. スキル習得 → おめでとう通知 自動生成トリガー
-- ============================================================

create or replace function public.notify_instrument_skill()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_name text;
  v_song_name   text;
  v_inst_name   text;
  v_inst_alias  text;
  v_desc        text;
begin
  select display_name into v_member_name from public.profiles   where id = new.member_id;
  select name         into v_song_name   from public.songs      where id = new.song_id;
  select name, alias  into v_inst_name, v_inst_alias
                      from public.instruments where id = new.instrument_id;

  v_desc := v_song_name || ' × ' || v_inst_name || '（' || v_inst_alias || '）';

  insert into public.announcements
    (title, body, type, related_member_id, related_skill_description, expires_at, created_by)
  values
    ('🎉 おめでとうございます！',
     v_member_name || 'さんが「' || v_desc || '」を習得しました！',
     'skill_achievement',
     new.member_id,
     v_desc,
     now() + interval '14 days',
     new.granted_by);
  return new;
end;
$$;

create trigger trg_notify_instrument_skill
  after insert on public.member_instrument_skills
  for each row execute function public.notify_instrument_skill();

create or replace function public.notify_dance_skill()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_name text;
  v_song_name   text;
  v_dance_name  text;
  v_desc        text;
begin
  select display_name into v_member_name from public.profiles where id = new.member_id;
  select name         into v_song_name   from public.songs    where id = new.song_id;
  select name         into v_dance_name  from public.dances   where id = new.dance_id;

  v_desc := v_song_name || ' × ' || v_dance_name;

  insert into public.announcements
    (title, body, type, related_member_id, related_skill_description, expires_at, created_by)
  values
    ('🎉 おめでとうございます！',
     v_member_name || 'さんが「' || v_desc || '」を習得しました！',
     'skill_achievement',
     new.member_id,
     v_desc,
     now() + interval '14 days',
     new.granted_by);
  return new;
end;
$$;

create trigger trg_notify_dance_skill
  after insert on public.member_dance_skills
  for each row execute function public.notify_dance_skill();

-- ============================================================
-- 6. updated_at 自動更新
-- ============================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;

create trigger trg_profiles_updated_at       before update on public.profiles       for each row execute function public.set_updated_at();
create trigger trg_announcements_updated_at  before update on public.announcements  for each row execute function public.set_updated_at();
create trigger trg_events_updated_at         before update on public.events         for each row execute function public.set_updated_at();
create trigger trg_event_responses_updated_at before update on public.event_responses for each row execute function public.set_updated_at();
create trigger trg_practice_videos_updated_at before update on public.practice_videos for each row execute function public.set_updated_at();

-- ============================================================
-- 7. Row Level Security
-- ============================================================

alter table public.profiles                 enable row level security;
alter table public.songs                    enable row level security;
alter table public.instruments              enable row level security;
alter table public.dances                   enable row level security;
alter table public.song_dances              enable row level security;
alter table public.member_instrument_skills enable row level security;
alter table public.member_dance_skills      enable row level security;
alter table public.announcements            enable row level security;
alter table public.events                   enable row level security;
alter table public.event_responses          enable row level security;
alter table public.practice_videos          enable row level security;
alter table public.badge_thresholds         enable row level security;

-- マスタ: 認証済みユーザーは閲覧のみ
create policy "マスタ閲覧(songs)"       on public.songs       for select to authenticated using (true);
create policy "マスタ閲覧(instruments)" on public.instruments for select to authenticated using (true);
create policy "マスタ閲覧(dances)"      on public.dances      for select to authenticated using (true);
create policy "マスタ閲覧(song_dances)" on public.song_dances for select to authenticated using (true);
create policy "マスタ閲覧(badges)"      on public.badge_thresholds for select to authenticated using (true);

-- profiles
create policy "プロフィール閲覧(有効なもの)"
  on public.profiles for select to authenticated
  using (deleted_at is null or public.is_admin(auth.uid()));

create policy "自分のプロフィール更新"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

create policy "管理者プロフィール管理(insert)"
  on public.profiles for insert to authenticated
  with check (public.is_admin(auth.uid()));

create policy "管理者プロフィール管理(update)"
  on public.profiles for update to authenticated
  using (public.is_admin(auth.uid()));

create policy "管理者プロフィール管理(delete)"
  on public.profiles for delete to authenticated
  using (public.is_admin(auth.uid()));

-- スキル
create policy "スキル閲覧(instrument)" on public.member_instrument_skills for select to authenticated using (true);
create policy "スキル管理(instrument-insert)" on public.member_instrument_skills for insert to authenticated with check (public.is_admin(auth.uid()));
create policy "スキル管理(instrument-delete)" on public.member_instrument_skills for delete to authenticated using (public.is_admin(auth.uid()));

create policy "スキル閲覧(dance)" on public.member_dance_skills for select to authenticated using (true);
create policy "スキル管理(dance-insert)" on public.member_dance_skills for insert to authenticated with check (public.is_admin(auth.uid()));
create policy "スキル管理(dance-delete)" on public.member_dance_skills for delete to authenticated using (public.is_admin(auth.uid()));

-- お知らせ
create policy "お知らせ閲覧"
  on public.announcements for select to authenticated
  using (
    public.is_admin(auth.uid())
    or expires_at is null
    or expires_at > now()
  );

create policy "お知らせ管理(insert)" on public.announcements for insert to authenticated with check (public.is_admin(auth.uid()));
create policy "お知らせ管理(update)" on public.announcements for update to authenticated using (public.is_admin(auth.uid()));
create policy "お知らせ管理(delete)" on public.announcements for delete to authenticated using (public.is_admin(auth.uid()));

-- イベント
create policy "イベント閲覧" on public.events for select to authenticated using (true);
create policy "イベント管理(insert)" on public.events for insert to authenticated with check (public.is_admin(auth.uid()));
create policy "イベント管理(update)" on public.events for update to authenticated using (public.is_admin(auth.uid()));
create policy "イベント管理(delete)" on public.events for delete to authenticated using (public.is_admin(auth.uid()));

-- 出欠
create policy "出欠閲覧" on public.event_responses for select to authenticated using (true);
create policy "自分の出欠(insert)" on public.event_responses for insert to authenticated with check (member_id = auth.uid());
create policy "自分の出欠(update)" on public.event_responses for update to authenticated using (member_id = auth.uid());
create policy "出欠削除(admin)"    on public.event_responses for delete to authenticated using (public.is_admin(auth.uid()));

-- 練習動画
create policy "動画閲覧" on public.practice_videos for select to authenticated using (true);
create policy "動画管理(insert)" on public.practice_videos for insert to authenticated with check (public.is_admin(auth.uid()));
create policy "動画管理(update)" on public.practice_videos for update to authenticated using (public.is_admin(auth.uid()));
create policy "動画管理(delete)" on public.practice_videos for delete to authenticated using (public.is_admin(auth.uid()));

-- ============================================================
-- 8. 未回答者取得ビュー（指摘 #8）
-- ============================================================

create or replace view public.event_attendance_summary as
select
  e.id          as event_id,
  p.id          as member_id,
  p.display_name,
  coalesce(r.status, 'no_reply') as status,
  r.comment,
  r.responded_at
from public.events e
cross join public.profiles p
left join public.event_responses r on r.event_id = e.id and r.member_id = p.id
where p.deleted_at is null;

grant select on public.event_attendance_summary to authenticated;

-- ============================================================
-- 9. シードデータ
-- ============================================================

insert into public.songs (id, name, reading, sort_order) values
  ('ninba',    'にんば',     'にんば',       1),
  ('yatai',    '屋台ばやし', 'やたいばやし', 2),
  ('kuniga',   '国がため',   'くにがため',   3),
  ('shichou',  '四丁目',     'しちょうめ',   4),
  ('kamakura', '鎌倉',       'かまくら',     5),
  ('shouden',  '昇殿',       'しょうでん',   6);

insert into public.instruments (id, name, alias, player_count, sort_order) values
  ('ookan',  '大太鼓', 'オオカン', 1, 1),
  ('tsuke',  '小太鼓', 'ツケ',     2, 2),
  ('yosuke', '鉦',     'ヨスケ',   1, 3),
  ('tonbi',  '笛',     'トンビ',   1, 4);

insert into public.dances (id, name, sort_order) values
  ('hyottoko',  'ひょっとこ', 1),
  ('okame',     'おかめ',     2),
  ('kitsune',   'きつね',     3),
  ('tanuki',    'たぬき',     4),
  ('shishimai', '獅子舞',     5),
  ('gedou',     '外道',       6);

insert into public.song_dances (song_id, dance_id) values
  ('ninba',    'hyottoko'),
  ('ninba',    'okame'),
  ('yatai',    'shishimai'),
  ('yatai',    'kitsune'),
  ('kuniga',   'tanuki'),
  ('shichou',  'gedou'),
  ('kamakura', 'shishimai'),
  ('shouden',  'shishimai');

insert into public.badge_thresholds (grade_name, color, min_tags, max_tags, sort_order) values
  ('入門',   'blue',    1,  6,  1),
  ('修行中', 'yellow',  7,  13, 2),
  ('一人前', 'green',   14, 20, 3),
  ('達人',   'red',     21, 28, 4),
  ('名人',   'rainbow', 29, 32, 5);
