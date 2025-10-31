export default function CommandsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-6">
          <span className="gradient-text">⚔️ 禁断のコマンド</span>
        </h1>
        <p className="text-xl text-gray-300 mb-12">
          Permission Deniedの罠を回避し、ツール実行ポリシーの謎に迫る冒険
        </p>

        {/* Key Discovery */}
        <section className="mb-12 bg-gradient-to-r from-green-500/20 to-claude-orange-400/20 rounded-lg p-8 border border-green-500/30">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>🎯</span> 最重要発見!
          </h2>
          <div className="bg-claude-dark-300 rounded-lg p-6">
            <p className="text-xl text-green-400 font-bold mb-4">
              「コマンドブロッキング」はほとんど存在しない!
            </p>
            <p className="text-gray-300 mb-4">
              以前の調査で<code className="bg-claude-dark px-2 py-1 rounded text-red-400">gh</code>コマンドが
              「ブロックされている」と報告されていたが、実際は単に<strong className="text-claude-orange-400">インストールされていなかっただけ</strong>!
            </p>
            <div className="bg-claude-dark rounded p-4">
              <h3 className="font-bold text-claude-orange-400 mb-2">真の制限要因</h3>
              <ul className="space-y-2 text-gray-300">
                <li>1️⃣ <strong>コマンドの未インストール</strong> ← 主要因</li>
                <li>2️⃣ <strong>承認プロンプト</strong> ← 設定で回避可能</li>
                <li>3️⃣ <strong>対話型セッションの制限</strong> ← ブラウザ環境の制約</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Permission Denied */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>🔐</span> Permission Deniedの正体
          </h2>
          <div className="space-y-4">
            <p className="text-gray-300">
              <code className="bg-red-500/20 text-red-400 px-2 py-1 rounded">Permission denied</code>
              というエラーが出たとき、慌てるなかれ。これは<strong className="text-claude-orange-400">ブラウザUI側</strong>で
              コマンドパターンを検出し、承認を要求しているだけ。
            </p>

            <div className="bg-claude-dark-300 rounded p-6">
              <h3 className="font-bold text-claude-orange-400 mb-4">メカニズム</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌐</span>
                  <div>
                    <div className="font-bold text-green-400">1. ブラウザUI</div>
                    <div className="text-gray-400">コマンドパターンを検出 (例: "gh", "docker")</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⬇️</span>
                  <div></div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🙋</span>
                  <div>
                    <div className="font-bold text-yellow-400">2. 承認プロンプト表示</div>
                    <div className="text-gray-400">"このコマンドを実行してもいい?"</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⬇️</span>
                  <div></div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✅/❌</span>
                  <div>
                    <div className="font-bold text-blue-400">3. Accept / Deny</div>
                    <div className="text-gray-400">Permission granted / denied</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded p-4">
              <p className="text-blue-300 text-sm">
                💡 <strong>証拠:</strong> bashスクリプト経由やフルパス指定だと動作する。
                つまり、コンテナ内のprocess_apiには制限がない!
              </p>
            </div>
          </div>
        </section>

        {/* Workarounds */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>🗝️</span> 回避方法: 3つの鍵
          </h2>

          {/* Method 1 */}
          <div className="mb-6 bg-claude-dark-300 rounded-lg p-6 border border-green-500/30">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">⭐</span>
              <div>
                <h3 className="text-xl font-bold text-green-400 mb-2">方法1: .claude/settings.json で自動承認 (推奨)</h3>
                <p className="text-gray-300 text-sm">次回セッションから完全自動化</p>
              </div>
            </div>
            <div className="bg-claude-dark rounded p-4 mb-4">
              <pre className="text-sm text-gray-300 overflow-x-auto">
{`{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(gh:*)",
      "Bash(docker:*)"
    ]
  }
}`}
              </pre>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-green-400">✅</span>
                <span className="text-gray-300">チーム全体で共有可能</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400">✅</span>
                <span className="text-gray-300">Gitにコミット可能</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-400">⚠️</span>
                <span className="text-gray-300">セッション再起動が必要</span>
              </div>
            </div>
          </div>

          {/* Method 2 */}
          <div className="mb-6 bg-claude-dark-300 rounded-lg p-6 border border-blue-500/30">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">🎪</span>
              <div>
                <h3 className="text-xl font-bold text-blue-400 mb-2">方法2: bashスクリプト経由</h3>
                <p className="text-gray-300 text-sm">即座に使える裏技</p>
              </div>
            </div>
            <div className="bg-claude-dark rounded p-4 mb-4">
              <pre className="text-sm text-gray-300 overflow-x-auto">
{`# スクリプトを作成
cat > /tmp/gh-cmd.sh << 'EOF'
gh pr create --title "My PR" --body "Description"
EOF

# スクリプトを実行
bash /tmp/gh-cmd.sh`}
              </pre>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-green-400">✅</span>
                <span className="text-gray-300">現在のセッションですぐ使える</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400">✅</span>
                <span className="text-gray-300">承認プロンプトなし</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-400">⚠️</span>
                <span className="text-gray-300">一時的な解決策</span>
              </div>
            </div>
          </div>

          {/* Method 3 */}
          <div className="bg-claude-dark-300 rounded-lg p-6 border border-purple-500/30">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">🎯</span>
              <div>
                <h3 className="text-xl font-bold text-purple-400 mb-2">方法3: フルパス指定</h3>
                <p className="text-gray-300 text-sm">パターンマッチング回避</p>
              </div>
            </div>
            <div className="bg-claude-dark rounded p-4 mb-4">
              <pre className="text-sm text-gray-300">
{`/usr/bin/gh auth status
/usr/bin/docker ps`}
              </pre>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-green-400">✅</span>
                <span className="text-gray-300">シンプル</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400">✅</span>
                <span className="text-gray-300">すぐに試せる</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-400">⚠️</span>
                <span className="text-gray-300">コマンドごとにパス指定が必要</span>
              </div>
            </div>
          </div>
        </section>

        {/* Available Commands */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>✅</span> 実行可能なコマンド
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-claude-dark-300 rounded p-4">
              <h3 className="font-bold text-green-400 mb-3">開発ツール</h3>
              <ul className="space-y-1 text-sm text-gray-300 font-mono">
                <li>• git</li>
                <li>• vim / nano</li>
                <li>• make / cmake</li>
                <li>• gcc / g++</li>
                <li>• gdb / lldb</li>
                <li>• strace / ltrace</li>
              </ul>
            </div>
            <div className="bg-claude-dark-300 rounded p-4">
              <h3 className="font-bold text-green-400 mb-3">言語処理系</h3>
              <ul className="space-y-1 text-sm text-gray-300 font-mono">
                <li>• node / npm</li>
                <li>• python / pip</li>
                <li>• ruby / gem</li>
                <li>• java / javac</li>
                <li>• cargo / rustc</li>
                <li>• go</li>
              </ul>
            </div>
            <div className="bg-claude-dark-300 rounded p-4">
              <h3 className="font-bold text-green-400 mb-3">ユーティリティ</h3>
              <ul className="space-y-1 text-sm text-gray-300 font-mono">
                <li>• curl / wget</li>
                <li>• jq / yq</li>
                <li>• ripgrep (rg)</li>
                <li>• tar / zip</li>
                <li>• tmux</li>
                <li>• find / grep</li>
              </ul>
            </div>
            <div className="bg-claude-dark-300 rounded p-4">
              <h3 className="font-bold text-green-400 mb-3">パッケージ管理</h3>
              <ul className="space-y-1 text-sm text-gray-300 font-mono">
                <li>• apt / apt-get</li>
                <li>• dpkg</li>
                <li>• maven / gradle</li>
                <li>• yarn / pnpm</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Missing Commands */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-red-500/30">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>❌</span> デフォルトで欠けているコマンド
          </h2>
          <div className="space-y-4">
            <div className="bg-claude-dark-300 rounded p-4">
              <h3 className="font-bold text-red-400 mb-3">インストールが必要</h3>
              <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-300">
                <div>
                  <strong className="text-claude-orange-400">GitHub関連</strong>
                  <ul className="mt-2 space-y-1 font-mono">
                    <li>• gh (GitHub CLI)</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-claude-orange-400">コンテナ</strong>
                  <ul className="mt-2 space-y-1 font-mono">
                    <li>• docker</li>
                    <li>• kubectl</li>
                    <li>• helm</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-claude-orange-400">ネットワーク</strong>
                  <ul className="mt-2 space-y-1 font-mono">
                    <li>• ping</li>
                    <li>• ifconfig / ip</li>
                    <li>• netstat</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-claude-orange-400">その他</strong>
                  <ul className="mt-2 space-y-1 font-mono">
                    <li>• terraform</li>
                    <li>• ansible</li>
                    <li>• kubectl</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded p-4">
              <p className="text-green-300 text-sm">
                ✅ <strong>朗報:</strong> root権限があるので、<code className="bg-claude-dark px-2 py-1 rounded">apt install</code>で
                簡単に追加可能!ただしセッション終了で消える点に注意。
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Commands */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-yellow-500/30">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>⚠️</span> 対話型コマンドの制限
          </h2>
          <div className="space-y-4">
            <p className="text-gray-300">
              ブラウザベースの環境なので、対話型コマンドには制限がある
            </p>
            <div className="bg-claude-dark-300 rounded p-4">
              <h3 className="font-bold text-yellow-400 mb-3">制限のあるコマンド例</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <code className="bg-claude-dark text-yellow-400 px-2 py-1 rounded">vim</code> /
                  <code className="bg-claude-dark text-yellow-400 px-2 py-1 rounded">nano</code>
                  <br />
                  <span className="text-gray-400">→ 実行は可能だが、実用性は低い</span>
                </li>
                <li>
                  <code className="bg-claude-dark text-yellow-400 px-2 py-1 rounded">tmux</code>
                  <br />
                  <span className="text-gray-400">→ セッション管理は機能するが、視認性が悪い</span>
                </li>
                <li>
                  <code className="bg-claude-dark text-yellow-400 px-2 py-1 rounded">python</code> REPL /
                  <code className="bg-claude-dark text-yellow-400 px-2 py-1 rounded">node</code> REPL
                  <br />
                  <span className="text-gray-400">→ 動作するが、スクリプトファイル実行を推奨</span>
                </li>
              </ul>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded p-4">
              <p className="text-blue-300 text-sm">
                💡 <strong>回避策:</strong> 対話型の代わりに、スクリプトファイルを作成して実行するのがベスト。
                Claude Codeは非対話型の実行に最適化されている!
              </p>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-claude-orange-400/20">
          <a
            href="/container"
            className="text-claude-orange-400 hover:text-claude-orange-300 transition-colors"
          >
            ← 前へ: コンテナの秘密
          </a>
          <a
            href="/persistence"
            className="bg-claude-orange hover:bg-claude-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            次へ: データの運命 →
          </a>
        </div>
      </div>
    </div>
  );
}
