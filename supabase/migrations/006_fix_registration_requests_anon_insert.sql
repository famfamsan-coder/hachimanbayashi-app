-- ============================================================
-- 入会希望フォーム（未ログイン）からのINSERTを許可する
-- ============================================================
-- 症状: /register から送信時に以下のエラー
--   "new row violates row-level security policy for table registration_requests"
-- 原因: anon ロールにINSERT権限を与えるポリシーが未適用、
--       もしくは後続のマイグレーションで上書きされていた。
-- 対応: 既存のINSERTポリシーを一度削除してから、anon/authenticated
--       両方に対して INSERT を許可するポリシーを再作成する。
-- ============================================================

-- 既存のINSERTポリシーを念のため全て削除
DROP POLICY IF EXISTS "入会申請 誰でも投稿可" ON public.registration_requests;
DROP POLICY IF EXISTS "Anyone can insert registration requests" ON public.registration_requests;

-- anon（未ログイン）と authenticated（ログイン済み）両方からINSERT可能に
CREATE POLICY "入会申請 誰でも投稿可"
  ON public.registration_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
