# redmine-mcp

自作の Redmine MCP サーバー。Claude Code から Redmine のチケット操作・プロジェクト管理ができる。

## 機能（14 ツール）

| カテゴリ | ツール | 説明 |
|---------|--------|------|
| Issues | `list_issues` | チケット一覧（フィルタ・ページネーション対応） |
| | `get_issue` | チケット詳細（コメント・添付ファイル含む） |
| | `create_issue` | チケット作成 |
| | `update_issue` | チケット更新・コメント追加 |
| | `delete_issue` | チケット削除 |
| Projects | `list_projects` | プロジェクト一覧 |
| | `get_project` | プロジェクト詳細 |
| Time | `list_time_entries` | 工数一覧 |
| | `create_time_entry` | 工数記録 |
| Users | `get_current_user` | 認証ユーザー情報 |
| Search | `search` | 全文検索 |
| Metadata | `get_issue_statuses` | ステータス一覧 |
| | `get_trackers` | トラッカー一覧 |
| | `get_issue_priorities` | 優先度一覧 |
| | `get_time_entry_activities` | 作業分類一覧 |

## セットアップ

### 1. 検証用 Redmine を起動

```bash
docker compose up -d
```

http://localhost:8080 にアクセス（初期ログイン: `admin` / `admin`）

REST API を有効化：**管理 > 設定 > API タブ** → 「RESTによるWebサービスを有効にする」にチェック

API キーを取得：http://localhost:8080/my/account → 「APIアクセスキー」

### 2. ビルド

```bash
npm install
npm run build
```

### 3. MCP サーバーを登録

#### VS Code (Copilot Chat)

`.vscode/mcp.json` をプロジェクトルートに作成：

```json
{
  "servers": {
    "redmine": {
      "type": "stdio",
      "command": "node",
      "args": ["${workspaceFolder}/build/index.js"],
      "env": {
        "REDMINE_URL": "http://localhost:8080",
        "REDMINE_API_KEY": "<your-api-key>"
      }
    }
  }
}
```

#### Claude Code

```bash
claude mcp add redmine \
  -e REDMINE_URL=http://localhost:8080 \
  -e REDMINE_API_KEY=<your-api-key> \
  -- node /path/to/redmine-mcp/build/index.js
```

### 4. 動作確認

```
Redmine のプロジェクト一覧を取得して
チケット #1 の詳細を見せて
新しいチケットを作成して: タイトル「MCP接続テスト」
```

## 環境変数

| 変数 | 必須 | 説明 |
|------|------|------|
| `REDMINE_URL` | Yes | Redmine の URL (例: `http://localhost:8080`) |
| `REDMINE_API_KEY` | Yes | API アクセスキー |

## ファイル構成

```
src/
  index.ts          # エントリポイント
  config.ts         # 環境変数の読み込み
  client.ts         # Redmine REST API クライアント
  tools/
    issues.ts       # チケット CRUD
    projects.ts     # プロジェクト一覧・詳細
    time-entries.ts # 工数記録
    users.ts        # ユーザー情報
    search.ts       # 全文検索
    metadata.ts     # ステータス・トラッカー等
docker-compose.yml  # 検証用 Redmine + PostgreSQL
```

## 停止・削除

```bash
docker compose down       # 停止
docker compose down -v    # データも含めて完全削除
```
