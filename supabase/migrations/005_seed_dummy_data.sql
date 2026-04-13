-- ============================================================
-- 005_seed_dummy_data.sql
--
-- このSQLはダミーデータ投入用です。Supabase SQL Editor で実行してください。
--
-- 概要:
--   ・ダミー会員 5 人（auth.users には作らず profiles に直接 INSERT）
--   ・各会員のスキルタグ（合計 70 件）
--   ・お知らせ 3 件 / イベント 2 件 / 出欠データ
--   ・練習動画 15 本（にんば 7 + 屋台ばやし 8、YouTube URL はダミー）
--   ・練習セッション 4 回分 + 出席データ
--
-- 特徴:
--   ・冒頭で既存シードを検出し、投入済みならスキップ（再実行安全）
--   ・スキル INSERT 中は「おめでとう通知」自動生成トリガーを一時停止
--     （自動生成されると大量のお知らせが作られてしまうため）
--   ・ユニーク制約を持つ子テーブルは ON CONFLICT DO NOTHING で保護
--
-- 実行方法:
--   1. Supabase ダッシュボード > SQL Editor を開く
--   2. このファイル全体を貼り付ける
--   3. Run を押す
--   4. Messages に "シードデータ投入完了" と出れば成功
-- ============================================================

-- ============================================================
-- 通知トリガー一時停止
--   スキル INSERT ごとに announcements 行を自動作成する
--   trg_notify_instrument_skill / trg_notify_dance_skill を止める。
-- ============================================================
alter table public.member_instrument_skills disable trigger trg_notify_instrument_skill;
alter table public.member_dance_skills      disable trigger trg_notify_dance_skill;

-- ============================================================
-- 本体
-- ============================================================
do $$
declare
  -- 会員 UUID
  v_sato     uuid := gen_random_uuid();
  v_yamamoto uuid := gen_random_uuid();
  v_tanaka   uuid := gen_random_uuid();
  v_suzuki   uuid := gen_random_uuid();
  v_ito      uuid := gen_random_uuid();

  -- イベント UUID
  v_event_spring uuid := gen_random_uuid();
  v_event_summer uuid := gen_random_uuid();

  -- 練習セッション UUID
  v_session1 uuid := gen_random_uuid();
  v_session2 uuid := gen_random_uuid();
  v_session3 uuid := gen_random_uuid();
  v_session4 uuid := gen_random_uuid();
begin
  -- 既存シード検出（佐藤 健一 + bio の組で判定）
  if exists (
    select 1 from public.profiles
    where display_name = '佐藤 健一' and bio = '笛を中心に練習しています'
  ) then
    raise notice 'ダミーデータは既に投入済みです。スキップします。';
    return;
  end if;

  -- ==========================================================
  -- 1. profiles（ダミー会員 5 人）
  -- ==========================================================
  insert into public.profiles (id, display_name, furigana, role, join_year, bio) values
    (v_sato,     '佐藤 健一',   'さとう けんいち', 'member', 2019, '笛を中心に練習しています'),
    (v_yamamoto, '山本 美咲',   'やまもと みさき', 'member', 2015, '獅子舞が得意です'),
    (v_tanaka,   '田中 太郎',   'たなか たろう',   'member', 2022, '子供と一緒に参加しています'),
    (v_suzuki,   '鈴木 花子',   'すずき はなこ',   'member', 2020, '最近おかめを覚えました'),
    (v_ito,      '伊藤 和也',   'いとう かずや',   'member', 2018, '大太鼓一筋です');

  -- ==========================================================
  -- 2. member_instrument_skills
  -- ==========================================================

  -- 佐藤 健一（一人前・15 楽器 + 4 舞 = 19 タグ）
  insert into public.member_instrument_skills (member_id, song_id, instrument_id) values
    (v_sato, 'ninba',    'ookan'),
    (v_sato, 'ninba',    'tsuke'),
    (v_sato, 'ninba',    'fue'),
    (v_sato, 'yatai',    'ookan'),
    (v_sato, 'yatai',    'tsuke'),
    (v_sato, 'yatai',    'karami'),
    (v_sato, 'kuniga',   'kane'),
    (v_sato, 'kuniga',   'karami'),
    (v_sato, 'shichou',  'ookan'),
    (v_sato, 'shichou',  'fue'),
    (v_sato, 'kamakura', 'tsuke'),
    (v_sato, 'kamakura', 'kane'),
    (v_sato, 'kamakura', 'karami'),
    (v_sato, 'shouden',  'ookan'),
    (v_sato, 'shouden',  'fue')
  on conflict (member_id, song_id, instrument_id) do nothing;

  -- 山本 美咲（達人・21 楽器 + 8 舞 = 29 タグ）
  insert into public.member_instrument_skills (member_id, song_id, instrument_id) values
    (v_yamamoto, 'ninba',    'ookan'),
    (v_yamamoto, 'ninba',    'tsuke'),
    (v_yamamoto, 'ninba',    'kane'),
    (v_yamamoto, 'ninba',    'fue'),
    (v_yamamoto, 'yatai',    'ookan'),
    (v_yamamoto, 'yatai',    'tsuke'),
    (v_yamamoto, 'yatai',    'karami'),
    (v_yamamoto, 'yatai',    'kane'),
    (v_yamamoto, 'yatai',    'fue'),
    (v_yamamoto, 'kuniga',   'ookan'),
    (v_yamamoto, 'kuniga',   'tsuke'),
    (v_yamamoto, 'kuniga',   'karami'),
    (v_yamamoto, 'kuniga',   'kane'),
    (v_yamamoto, 'kuniga',   'fue'),
    (v_yamamoto, 'shichou',  'ookan'),
    (v_yamamoto, 'shichou',  'tsuke'),
    (v_yamamoto, 'shichou',  'karami'),
    (v_yamamoto, 'kamakura', 'ookan'),
    (v_yamamoto, 'kamakura', 'tsuke'),
    (v_yamamoto, 'shouden',  'ookan'),
    (v_yamamoto, 'shouden',  'kane')
  on conflict (member_id, song_id, instrument_id) do nothing;

  -- 田中 太郎（入門・2 楽器）
  insert into public.member_instrument_skills (member_id, song_id, instrument_id) values
    (v_tanaka, 'ninba', 'tsuke'),
    (v_tanaka, 'ninba', 'kane')
  on conflict (member_id, song_id, instrument_id) do nothing;

  -- 鈴木 花子（修行中・6 楽器 + 2 舞 = 8 タグ）
  insert into public.member_instrument_skills (member_id, song_id, instrument_id) values
    (v_suzuki, 'ninba',    'fue'),
    (v_suzuki, 'yatai',    'fue'),
    (v_suzuki, 'kuniga',   'fue'),
    (v_suzuki, 'shichou',  'fue'),
    (v_suzuki, 'kamakura', 'fue'),
    (v_suzuki, 'shouden',  'fue')
  on conflict (member_id, song_id, instrument_id) do nothing;

  -- 伊藤 和也（修行中・8 楽器 + 4 舞 = 12 タグ）
  insert into public.member_instrument_skills (member_id, song_id, instrument_id) values
    (v_ito, 'ninba',    'ookan'),
    (v_ito, 'yatai',    'ookan'),
    (v_ito, 'kuniga',   'ookan'),
    (v_ito, 'shichou',  'ookan'),
    (v_ito, 'kamakura', 'ookan'),
    (v_ito, 'shouden',  'ookan'),
    (v_ito, 'yatai',    'karami'),
    (v_ito, 'kamakura', 'karami')
  on conflict (member_id, song_id, instrument_id) do nothing;

  -- ==========================================================
  -- 3. member_dance_skills
  --    （song_dances の登録済みペアのみ使用）
  -- ==========================================================

  -- 佐藤（4 舞）
  insert into public.member_dance_skills (member_id, song_id, dance_id) values
    (v_sato, 'ninba',  'hyottoko'),
    (v_sato, 'ninba',  'okame'),
    (v_sato, 'yatai',  'shishimai'),
    (v_sato, 'kuniga', 'tanuki')
  on conflict (member_id, song_id, dance_id) do nothing;

  -- 山本（8 舞）
  insert into public.member_dance_skills (member_id, song_id, dance_id) values
    (v_yamamoto, 'ninba',    'hyottoko'),
    (v_yamamoto, 'ninba',    'okame'),
    (v_yamamoto, 'yatai',    'shishimai'),
    (v_yamamoto, 'yatai',    'kitsune'),
    (v_yamamoto, 'kuniga',   'tanuki'),
    (v_yamamoto, 'shichou',  'gedou'),
    (v_yamamoto, 'kamakura', 'shishimai'),
    (v_yamamoto, 'shouden',  'shishimai')
  on conflict (member_id, song_id, dance_id) do nothing;

  -- 鈴木（2 舞）
  insert into public.member_dance_skills (member_id, song_id, dance_id) values
    (v_suzuki, 'ninba', 'okame'),
    (v_suzuki, 'yatai', 'kitsune')
  on conflict (member_id, song_id, dance_id) do nothing;

  -- 伊藤（4 舞）
  insert into public.member_dance_skills (member_id, song_id, dance_id) values
    (v_ito, 'ninba',    'hyottoko'),
    (v_ito, 'yatai',    'shishimai'),
    (v_ito, 'kamakura', 'shishimai'),
    (v_ito, 'shouden',  'shishimai')
  on conflict (member_id, song_id, dance_id) do nothing;

  -- ==========================================================
  -- 4. announcements
  --    トリガー停止中なので手動で 3 件だけ作る
  -- ==========================================================
  insert into public.announcements
    (title, body, type, related_member_id, related_skill_description, expires_at, created_by)
  values
    ('🎉 おめでとうございます！',
     '田中 太郎さんが「にんば × 鉦（かね）」を習得しました！',
     'skill_achievement',
     v_tanaka,
     'にんば × 鉦（かね）',
     now() + interval '14 days',
     null),
    ('🎉 おめでとうございます！',
     '鈴木 花子さんが「屋台ばやし × きつね」を習得しました！',
     'skill_achievement',
     v_suzuki,
     '屋台ばやし × きつね',
     now() + interval '14 days',
     null),
    ('5月の練習日程について',
     '5月の練習は毎週土曜日19:00〜21:00、日の出町公民館2Fで行います。初回は5月3日です。',
     'general',
     null,
     null,
     null,
     null);

  -- ==========================================================
  -- 5. events
  -- ==========================================================
  insert into public.events (id, title, description, event_date, event_time, location) values
    (v_event_spring,
     '春季合同練習会',
     '全曲通し練習を行います。楽器・衣装をお持ちください。',
     date '2026-05-10',
     '14:00〜16:00',
     '日の出町公民館 2F 大ホール'),
    (v_event_summer,
     '日の出町夏祭り本番',
     '本番です。13:00に神社境内に集合。衣装一式を忘れずに。',
     date '2026-07-20',
     '15:00〜20:00',
     '八幡神社 境内');

  -- 春季合同練習会の出欠
  insert into public.event_responses (event_id, member_id, status, comment) values
    (v_event_spring, v_sato,     'attend',  '楽しみです！'),
    (v_event_spring, v_yamamoto, 'attend',  null),
    (v_event_spring, v_tanaka,   'absent',  '家族の予定があります'),
    (v_event_spring, v_suzuki,   'attend',  null),
    (v_event_spring, v_ito,      'pending', '仕事次第です')
  on conflict (event_id, member_id) do nothing;

  -- 夏祭り本番の出欠（佐藤・山本のみ回答）
  insert into public.event_responses (event_id, member_id, status, comment) values
    (v_event_summer, v_sato,     'attend', null),
    (v_event_summer, v_yamamoto, 'attend', null)
  on conflict (event_id, member_id) do nothing;

  -- ==========================================================
  -- 6. practice_videos（YouTube URL はダミー）
  -- ==========================================================

  -- にんば（7 動画）
  insert into public.practice_videos
    (song_id, video_type, instrument_id, dance_id, youtube_url, title, sort_order)
  values
    ('ninba', 'ensemble',   null,     null,       'https://www.youtube.com/watch?v=DUMMY_VIDEO_001', 'にんば 合奏',                       10),
    ('ninba', 'instrument', 'ookan',  null,       'https://www.youtube.com/watch?v=DUMMY_VIDEO_002', 'にんば 大太鼓（おおかん）パート',   20),
    ('ninba', 'instrument', 'tsuke',  null,       'https://www.youtube.com/watch?v=DUMMY_VIDEO_003', 'にんば 小太鼓（つけ）パート',       30),
    ('ninba', 'instrument', 'kane',   null,       'https://www.youtube.com/watch?v=DUMMY_VIDEO_004', 'にんば 鉦（かね）パート',           40),
    ('ninba', 'instrument', 'fue',    null,       'https://www.youtube.com/watch?v=DUMMY_VIDEO_005', 'にんば 笛（ふえ）パート',           50),
    ('ninba', 'dance',      null,     'hyottoko', 'https://www.youtube.com/watch?v=DUMMY_VIDEO_006', 'にんば ひょっとこ',                 60),
    ('ninba', 'dance',      null,     'okame',    'https://www.youtube.com/watch?v=DUMMY_VIDEO_007', 'にんば おかめ',                     70);

  -- 屋台ばやし（8 動画）
  insert into public.practice_videos
    (song_id, video_type, instrument_id, dance_id, youtube_url, title, sort_order)
  values
    ('yatai', 'ensemble',   null,     null,        'https://www.youtube.com/watch?v=DUMMY_VIDEO_008', '屋台ばやし 合奏',                       110),
    ('yatai', 'instrument', 'ookan',  null,        'https://www.youtube.com/watch?v=DUMMY_VIDEO_009', '屋台ばやし 大太鼓（おおかん）パート',   120),
    ('yatai', 'instrument', 'tsuke',  null,        'https://www.youtube.com/watch?v=DUMMY_VIDEO_010', '屋台ばやし 小太鼓（つけ）パート',       130),
    ('yatai', 'instrument', 'karami', null,        'https://www.youtube.com/watch?v=DUMMY_VIDEO_011', '屋台ばやし 小太鼓（からみ）パート',     140),
    ('yatai', 'instrument', 'kane',   null,        'https://www.youtube.com/watch?v=DUMMY_VIDEO_012', '屋台ばやし 鉦（かね）パート',           150),
    ('yatai', 'instrument', 'fue',    null,        'https://www.youtube.com/watch?v=DUMMY_VIDEO_013', '屋台ばやし 笛（ふえ）パート',           160),
    ('yatai', 'dance',      null,     'shishimai', 'https://www.youtube.com/watch?v=DUMMY_VIDEO_014', '屋台ばやし 獅子舞',                     170),
    ('yatai', 'dance',      null,     'kitsune',   'https://www.youtube.com/watch?v=DUMMY_VIDEO_015', '屋台ばやし きつね',                     180);

  -- ==========================================================
  -- 7. practice_sessions + practice_attendance
  -- ==========================================================
  insert into public.practice_sessions (id, date, title, location) values
    (v_session1, date '2026-03-07', '定例練習',                '日の出町公民館'),
    (v_session2, date '2026-03-14', '定例練習',                '日の出町公民館'),
    (v_session3, date '2026-03-21', '特別練習（夏祭り準備）',  '八幡神社 社務所'),
    (v_session4, date '2026-03-28', '定例練習',                '日の出町公民館');

  -- 出席パターン:
  --   佐藤: ○ ○ × ○  (3/4)
  --   山本: ○ ○ ○ ○  (4/4・皆勤)
  --   田中: × ○ × ×  (1/4)
  --   鈴木: ○ × ○ ×  (2/4)
  --   伊藤: ○ × ○ ○  (3/4)
  insert into public.practice_attendance (session_id, member_id, attended) values
    -- 佐藤
    (v_session1, v_sato, true),
    (v_session2, v_sato, true),
    (v_session3, v_sato, false),
    (v_session4, v_sato, true),
    -- 山本
    (v_session1, v_yamamoto, true),
    (v_session2, v_yamamoto, true),
    (v_session3, v_yamamoto, true),
    (v_session4, v_yamamoto, true),
    -- 田中
    (v_session1, v_tanaka, false),
    (v_session2, v_tanaka, true),
    (v_session3, v_tanaka, false),
    (v_session4, v_tanaka, false),
    -- 鈴木
    (v_session1, v_suzuki, true),
    (v_session2, v_suzuki, false),
    (v_session3, v_suzuki, true),
    (v_session4, v_suzuki, false),
    -- 伊藤
    (v_session1, v_ito, true),
    (v_session2, v_ito, false),
    (v_session3, v_ito, true),
    (v_session4, v_ito, true)
  on conflict (session_id, member_id) do nothing;

  raise notice 'シードデータ投入完了: 会員 5 名 / スキル 70 件 / イベント 2 件 / 動画 15 本 / 練習 4 回';
end $$;

-- ============================================================
-- 通知トリガー再有効化
-- ============================================================
alter table public.member_instrument_skills enable trigger trg_notify_instrument_skill;
alter table public.member_dance_skills      enable trigger trg_notify_dance_skill;
