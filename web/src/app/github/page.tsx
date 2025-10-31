export default function GitHubPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-6">
          <span className="gradient-text">🐙 GitHub芸の極意</span>
        </h1>
        <p className="text-xl text-gray-300 mb-12">
          ghコマンド、Git署名、そしてプロキシを越えた統合の技
        </p>

        {/* Git Configuration */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>⚙️</span> Git設定の全貌
          </h2>
          <div className="space-y-4">
            <div className="bg-claude-dark-300 rounded p-6">
              <h3 className="font-bold text-claude-orange-400 mb-3">グローバル設定 (~/.gitconfig)</h3>
              <pre className="bg-claude-dark rounded p-4 text-sm text-gray-300 overflow-x-auto">
{`[user]
    name = Claude
    email = noreply@anthropic.com
    signingkey = /home/claude/.ssh/commit_signing_key.pub

[gpg]
    format = ssh

[gpg "ssh"]
    program = /tmp/code-sign

[commit]
    gpgsign = true

[http]
    proxyAuthMethod = basic`}
              </pre>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded p-4">
              <p className="text-blue-300 text-sm">
                💡 <strong>注目:</strong> すべてのコミットが自動的にSSH鍵で署名される。
                <code className="bg-claude-dark px-2 py-1 rounded">/tmp/code-sign</code>という
                MCPサーバーが署名処理を担当!
              </p>
            </div>
          </div>
        </section>

        {/* Commit Signing */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>🔏</span> 自動コミット署名
          </h2>
          <div className="space-y-4">
            <p className="text-gray-300">
              Claude Codeは<strong className="text-claude-orange-400">全コミットに自動署名</strong>を行う。
              これにより、コミットの真正性が保証される。
            </p>
            <div className="bg-claude-dark-300 rounded p-6">
              <h3 className="font-bold text-claude-orange-400 mb-4">署名の仕組み</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📝</span>
                  <div>
                    <div className="font-bold text-green-400">1. git commit</div>
                    <div className="text-gray-400">コミットを実行</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⬇️</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔐</span>
                  <div>
                    <div className="font-bold text-yellow-400">2. gpg.ssh.program 呼び出し</div>
                    <div className="text-gray-400">/tmp/code-sign を実行</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⬇️</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎫</span>
                  <div>
                    <div className="font-bold text-blue-400">3. MCPサーバー経由で署名</div>
                    <div className="text-gray-400">CodeSign MCPが署名を生成</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⬇️</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <div className="font-bold text-green-400">4. 署名済みコミット完成</div>
                    <div className="text-gray-400">検証可能なコミット</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded p-4">
              <p className="text-green-300 text-sm">
                ✅ <strong>自動化の恩恵:</strong> ユーザーは何も意識せずに、
                すべてのコミットに署名が付く。セキュリティと利便性の両立!
              </p>
            </div>
          </div>
        </section>

        {/* Remote Configuration */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>🌐</span> リモート設定の秘密
          </h2>
          <div className="space-y-4">
            <div className="bg-claude-dark-300 rounded p-6">
              <h3 className="font-bold text-claude-orange-400 mb-3">リポジトリ設定 (.git/config)</h3>
              <pre className="bg-claude-dark rounded p-4 text-sm text-gray-300 overflow-x-auto">
{`[remote "origin"]
    url = http://local_proxy@127.0.0.1:38692/git/oikon48/cc-web-playground
    fetch = +refs/heads/*:refs/remotes/origin/*`}
              </pre>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-4">
              <p className="text-yellow-300 text-sm">
                🔍 <strong>謎のプロキシ:</strong> <code className="bg-claude-dark px-2 py-1 rounded">127.0.0.1:38692</code>
                というローカルプロキシ経由でGitHub APIへ接続。これがClaud Code独自のGit統合の仕組み!
              </p>
            </div>
          </div>
        </section>

        {/* gh CLI */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>🔧</span> gh CLIの使い方
          </h2>
          <div className="space-y-4">
            <div className="bg-claude-dark-300 rounded p-6">
              <h3 className="font-bold text-claude-orange-400 mb-3">インストール</h3>
              <pre className="bg-claude-dark rounded p-4 text-sm text-gray-300">
{`# apt経由でインストール
apt update
apt install -y gh`}
              </pre>
            </div>
            <div className="bg-claude-dark-300 rounded p-6">
              <h3 className="font-bold text-claude-orange-400 mb-3">認証</h3>
              <pre className="bg-claude-dark rounded p-4 text-sm text-gray-300">
{`# GITHUB_TOKENが自動設定されている
echo $GITHUB_TOKEN  # ghp_***

# 環境変数経由で認証
GH_TOKEN="$GITHUB_TOKEN" gh auth status`}
              </pre>
            </div>
            <div className="bg-claude-dark-300 rounded p-6">
              <h3 className="font-bold text-claude-orange-400 mb-3">実行方法 (3つ)</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-green-400 mb-2">方法1: .claude/settings.json で自動承認</h4>
                  <pre className="bg-claude-dark rounded p-3 text-xs text-gray-300">
{`{
  "permissions": {
    "allow": ["Bash(gh:*)"]
  }
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="font-bold text-blue-400 mb-2">方法2: bashスクリプト経由</h4>
                  <pre className="bg-claude-dark rounded p-3 text-xs text-gray-300">
{`cat > /tmp/gh-cmd.sh << 'EOF'
gh pr create --title "My PR"
EOF
bash /tmp/gh-cmd.sh`}
                  </pre>
                </div>
                <div>
                  <h4 className="font-bold text-purple-400 mb-2">方法3: フルパス指定</h4>
                  <pre className="bg-claude-dark rounded p-3 text-xs text-gray-300">
{`/usr/bin/gh pr list`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Practical Examples */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>💡</span> 実践例
          </h2>
          <div className="space-y-4">
            <div className="bg-claude-dark-300 rounded p-6">
              <h3 className="font-bold text-claude-orange-400 mb-3">PR作成</h3>
              <pre className="bg-claude-dark rounded p-4 text-sm text-gray-300 overflow-x-auto">
{`# ブランチ作成
git checkout -b feature/new-feature

# 変更をコミット
git add .
git commit -m "Add new feature"

# プッシュ
git push -u origin feature/new-feature

# PR作成 (bashスクリプト経由)
cat > /tmp/create-pr.sh << 'EOF'
gh pr create \\
  --title "Add new feature" \\
  --body "This PR adds a new feature"
EOF
bash /tmp/create-pr.sh`}
              </pre>
            </div>
            <div className="bg-claude-dark-300 rounded p-6">
              <h3 className="font-bold text-claude-orange-400 mb-3">Issue作成</h3>
              <pre className="bg-claude-dark rounded p-4 text-sm text-gray-300 overflow-x-auto">
{`cat > /tmp/create-issue.sh << 'EOF'
gh issue create \\
  --title "Bug: Something is broken" \\
  --body "Description of the bug"
EOF
bash /tmp/create-issue.sh`}
              </pre>
            </div>
            <div className="bg-claude-dark-300 rounded p-6">
              <h3 className="font-bold text-claude-orange-400 mb-3">ステータス確認</h3>
              <pre className="bg-claude-dark rounded p-4 text-sm text-gray-300 overflow-x-auto">
{`# PRリスト表示
/usr/bin/gh pr list

# Issueリスト表示
/usr/bin/gh issue list

# リポジトリ情報
/usr/bin/gh repo view`}
              </pre>
            </div>
          </div>
        </section>

        {/* Git Workflow */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>🔄</span> 推奨Gitワークフロー
          </h2>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-6 border border-green-500/30">
              <ol className="space-y-4 text-gray-300">
                <li className="flex gap-3">
                  <span className="font-bold text-claude-orange-400">1.</span>
                  <div>
                    <strong className="text-green-400">作業開始</strong>
                    <pre className="bg-claude-dark rounded p-2 text-xs mt-2">git checkout -b claude/feature-branch</pre>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-claude-orange-400">2.</span>
                  <div>
                    <strong className="text-green-400">こまめにコミット</strong>
                    <pre className="bg-claude-dark rounded p-2 text-xs mt-2">git add . && git commit -m "Progress"</pre>
                    <p className="text-xs text-gray-400 mt-1">自動署名される!</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-claude-orange-400">3.</span>
                  <div>
                    <strong className="text-green-400">定期的にプッシュ</strong>
                    <pre className="bg-claude-dark rounded p-2 text-xs mt-2">git push -u origin claude/feature-branch</pre>
                    <p className="text-xs text-gray-400 mt-1">プロキシ経由で自動接続</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-claude-orange-400">4.</span>
                  <div>
                    <strong className="text-green-400">PR作成</strong>
                    <pre className="bg-claude-dark rounded p-2 text-xs mt-2">bash /tmp/create-pr.sh</pre>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-claude-orange-400">5.</span>
                  <div>
                    <strong className="text-green-400">セッション終了前確認</strong>
                    <pre className="bg-claude-dark rounded p-2 text-xs mt-2">git status</pre>
                    <p className="text-xs text-gray-400 mt-1">Stopフックが未プッシュをチェック!</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="mb-12 bg-gradient-to-r from-claude-orange-400/10 to-purple-500/10 rounded-lg p-8 border border-claude-orange-400/30">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>💎</span> プロTips
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-claude-dark-300 rounded p-4">
              <h3 className="font-bold text-green-400 mb-2">✅ 良い習慣</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• 小さなコミットを頻繁に</li>
                <li>• 意味のあるコミットメッセージ</li>
                <li>• 作業前にブランチ作成</li>
                <li>• 定期的にpush</li>
              </ul>
            </div>
            <div className="bg-claude-dark-300 rounded p-4">
              <h3 className="font-bold text-yellow-400 mb-2">⚠️ 注意点</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• force pushは慎重に</li>
                <li>• 署名は自動（手動不要）</li>
                <li>• プロキシは自動設定済み</li>
                <li>• TOKENは環境変数から</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-claude-orange-400/20">
          <a
            href="/persistence"
            className="text-claude-orange-400 hover:text-claude-orange-300 transition-colors"
          >
            ← 前へ: データの運命
          </a>
          <a
            href="/network"
            className="bg-claude-orange hover:bg-claude-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            次へ: ネットワークの迷宮 →
          </a>
        </div>
      </div>
    </div>
  );
}
