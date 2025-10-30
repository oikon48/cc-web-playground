# Claude Settings

このディレクトリにはClaude Codeのプロジェクトレベル設定が含まれています。

## ファイル

- **settings.json**: プロジェクト設定（permissions, hooks）
- **stop-hook-git-check.sh**: Git変更チェック用Stop Hook
- **stop-hook-ccusage.sh**: トークン使用量表示用Stop Hook

## 永続化

このディレクトリ内のファイルはGitで管理されており、セッションをまたいで永続化されます。

## 詳細ドキュメント

- [ccusage Hook セットアップ](../docs/10-ccusage-hook-setup.md)
- [GitHub CLI 調査](../docs/09-gh-cli-complete-investigation.md)
