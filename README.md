# 八幡ばやし保存会 会員管理アプリ

東京都西多摩郡日の出町「八幡ばやし保存会」の会員向けWebアプリ。

## 技術スタック

- React 18 + TypeScript + Vite
- Tailwind CSS v4
- React Router v6
- Supabase（Auth + PostgreSQL + RLS）
- Cloudflare Pages（デプロイ予定）

## セットアップ手順

### 1. 依存パッケージのインストール

```bash
cd deliverables/hachiman-bayashi-app
npm install
```

### 2. Supabase プロジェクト準備

1. [supabase.com](https://supabase.com) で新規プロジェクト作成
2. プロジェクトダッシュボード → Settings → API から以下を控える：
   - Project URL
   - anon public key
3. Authentication → Providers → Email を有効化（確認メールは任意）

### 3. データベース初期化

Supabase ダッシュボードの **SQL Editor** を開き、以下のファイルの内容をそのまま貼り付けて実行：

```
supabase/migrations/001_initial_schema.sql
```

実行内容：

- 全12テーブルの作成（profiles / songs / instruments / dances / skills / announcements / events / videos など）
- `is_admin()` SECURITY DEFINER 関数（RLS再帰防止用）
- スキル習得通知の自動生成トリガー（AFTER INSERT）
- `updated_at` 自動更新トリガー
- 全テーブルの RLS ポリシー
- `event_attendance_summary` ビュー（未回答者取得用）
- マスタデータのシード（曲6 / 楽器4 / 舞6 / 曲×舞8 / バッジ閾値5）

### 4. 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local` を編集して Supabase の値を設定：

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 5. 初期管理者アカウントの作成

Supabase ダッシュボード → Authentication → Users → "Add user" から
ご自身のメールアドレスでユーザーを作成後、SQL Editor で以下を実行：

```sql
-- 作成したユーザーの UUID を確認
select id, email from auth.users;

-- profiles にレコードを追加して admin 権限を付与
insert into public.profiles (id, display_name, role, join_year)
values ('ここに上で確認したUUID', 'あなたの名前', 'admin', 2020);
```

### 6. 開発サーバー起動

```bash
npm run dev
```

http://localhost:5173 を開いてログイン。

## ディレクトリ構成

```
hachiman-bayashi-app/
├── src/
│   ├── main.tsx            -- エントリーポイント
│   ├── App.tsx             -- ルーティング
│   ├── index.css           -- Tailwind v4 + テーマ変数
│   ├── lib/
│   │   ├── supabase.ts     -- Supabase クライアント
│   │   └── constants.ts    -- バッジ判定ロジック等
│   ├── types/database.ts   -- DB 型定義
│   ├── contexts/AuthContext.tsx
│   ├── components/
│   │   ├── auth/           -- LoginForm / ProtectedRoute / AdminRoute
│   │   └── layout/         -- AppShell / Header / BottomNav
│   └── pages/
│       ├── LoginPage.tsx
│       └── HomePage.tsx
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql
```

## Phase 1 で実装済み

- [x] Vite + React + TypeScript + Tailwind CSS v4 プロジェクト初期化
- [x] Supabase クライアント設定
- [x] DB スキーマ（全12テーブル + RLS + is_admin + トリガー）
- [x] 認証コンテキスト（ログイン/ログアウト/プロフィール取得）
- [x] ログイン画面
- [x] ProtectedRoute / AdminRoute
- [x] AppShell + BottomNav + Header（モバイル下部タブ）
- [x] ホーム画面スタブ

## 次フェーズ以降

- Phase 2: メンバー一覧・フィルター・バッジ表示
- Phase 3: お知らせ・練習動画・イベント出欠
- Phase 4: 管理者画面（スキル管理マトリクスUI等）
- Phase 5: Cloudflare Pages デプロイ・レスポンシブ調整

## 会員招待フロー（運用）

管理者が新規会員を追加する場合：

1. Supabase ダッシュボード → Authentication → Users → "Invite user"
2. 会員のメールアドレスを入力して招待メール送信
3. 会員が招待リンクからパスワード設定
4. 管理者は SQL Editor でその会員の `profiles` レコードを挿入

※ Phase 4 で管理者画面から招待 → profiles 作成までを自動化予定
