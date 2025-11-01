# MCP Server Configuration Guide

このドキュメントでは、Claude CodeでのMCP（Model Context Protocol）サーバーの設定方法を説明します。

## 概要

MCPサーバーは、Claude Codeを外部ツールやデータソースに接続するためのプロトコルです。`.mcp.json`ファイルでローカルおよびリモートサーバーを設定できます。

## 設定ファイル

プロジェクトの`.mcp.json`ファイルには、以下のMCPサーバーが設定されています：

### ローカルサーバー（stdio transport）

#### 1. Context7
- **説明**: Upstash Context7サービスへのアクセス
- **コマンド**: `npx -y @upstash/context7-mcp@latest`

#### 2. Filesystem
- **説明**: ローカルファイルシステムへの読み取り/書き込みアクセス
- **コマンド**: `npx -y @modelcontextprotocol/server-filesystem@latest`
- **アクセス先**: `/home/user/cc-web-playground`
- **用途**: ファイルの読み取り、書き込み、検索

#### 3. SQLite
- **説明**: SQLiteデータベースへのアクセス
- **コマンド**: `npx -y @modelcontextprotocol/server-sqlite@latest`
- **データベース**: `/tmp/example.db`
- **用途**: SQLクエリの実行、テーブル操作

#### 4. GitHub
- **説明**: GitHub APIへのアクセス
- **コマンド**: `npx -y @modelcontextprotocol/server-github@latest`
- **環境変数**: `GITHUB_PERSONAL_ACCESS_TOKEN` (環境変数 `GITHUB_TOKEN` から取得)
- **用途**: リポジトリの操作、Issue管理、PRの作成など

### リモートサーバー（HTTP transport）

#### 5. Example Remote HTTP
- **説明**: リモートHTTP MCPサーバーの設定例
- **トランスポート**: HTTP
- **URL**: `https://example.com/mcp` (プレースホルダー)
- **注意**: 実際の使用には、実在するMCP HTTPエンドポイントに置き換えてください

## 設定方法

### CLIコマンドでの追加

```bash
# ローカルstdioサーバーを追加
claude mcp add --transport stdio <name> <command> [args...]

# リモートHTTPサーバーを追加
claude mcp add --transport http <name> <url>

# リモートSSEサーバーを追加（非推奨）
claude mcp add --transport sse <name> <url>
```

### .mcp.jsonファイルでの設定

`.mcp.json`ファイルを直接編集することもできます：

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "package-name@latest"],
      "env": {
        "ENV_VAR": "${SYSTEM_ENV_VAR}"
      }
    },
    "remote-server": {
      "transport": "http",
      "url": "https://your-server.com/mcp"
    }
  }
}
```

## 環境変数

環境変数は `${VAR_NAME}` 形式で参照できます。例：

```json
{
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
  }
}
```

## スコープレベル

MCPサーバーは3つのスコープで設定できます：

1. **Local scope** (デフォルト): 個人の開発サーバー、実験的な設定、機密情報を含むサーバー
2. **Project scope**: `.mcp.json`でチーム全体と共有
3. **User scope**: マシン上のすべてのプロジェクトで利用可能

## 管理コマンド

```bash
# すべてのサーバーを表示
claude mcp list

# 特定のサーバーの詳細を表示
claude mcp get <name>

# サーバーを削除
claude mcp remove <name>
```

## 注意事項

1. **トークン制限**: MCPツールの出力が10,000トークンを超える場合、警告が表示されます
2. **プロジェクトスコープサーバー**: 使用前に承認が必要です
3. **Windows**: `npx`コマンドには `cmd /c` ラッパーが必要です
4. **SSEトランスポート**: 非推奨のため、HTTPトランスポートの使用を推奨します

## リモートHTTPサーバーの例

実際にデプロイ可能なリモートMCPサーバーの例：

- **Azure Functions**: https://github.com/Azure-Samples/remote-mcp-functions-dotnet/
- **Northflank**: FastMCP + Starlette を使用したPython実装
- **OpenAI Agents SDK**: サンプルコードが examples/mcp ディレクトリに含まれています

## トラブルシューティング

### サーバーが起動しない場合

1. パッケージが正しくインストールされているか確認
2. 環境変数が正しく設定されているか確認
3. `claude mcp list` でサーバーの状態を確認

### HTTPサーバーに接続できない場合

1. URLが正しいか確認
2. サーバーが実行中か確認
3. ネットワーク接続を確認

## 参考リンク

- [Claude Code MCP Documentation](https://docs.claude.com/en/docs/claude-code/mcp)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [MCP Servers Repository](https://github.com/modelcontextprotocol/servers)
