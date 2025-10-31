export default function EnvironmentPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-6">
          <span className="gradient-text">🏔️ 環境の全貌</span>
        </h1>
        <p className="text-xl text-gray-300 mb-12">
          Claude Code on the Webの住人として、まずはこの不思議な世界の地図を手に入れよう
        </p>

        {/* OS & System */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>🖥️</span> OS: Ubuntu 24.04の大地
          </h2>
          <div className="space-y-4">
            <div className="bg-claude-dark-300 rounded p-4">
              <h3 className="font-bold text-claude-orange-400 mb-2">基本スペック</h3>
              <ul className="space-y-2 text-gray-300">
                <li>📦 <strong>ディストリビューション:</strong> Ubuntu 24.04.3 LTS (Noble Numbat)</li>
                <li>🧠 <strong>カーネル:</strong> Linux 4.4.0 (古めかしいが安定)</li>
                <li>🏗️ <strong>アーキテクチャ:</strong> x86_64</li>
                <li>🏠 <strong>ホスト名:</strong> runsc (gVisor runtime)</li>
              </ul>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-4">
              <p className="text-yellow-300 text-sm">
                💡 <strong>豆知識:</strong> gVisorは「サンドボックス内のサンドボックス」。
                Googleが開発したセキュアなコンテナランタイムで、通常のLinuxカーネルを使わず独自のカーネルを実装しているぞ!
              </p>
            </div>
          </div>
        </section>

        {/* CPU */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>⚡</span> CPU: 16コアの高峰
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-claude-dark-300 rounded p-4">
              <h3 className="font-bold text-claude-orange-400 mb-2">パワー</h3>
              <ul className="space-y-2 text-gray-300">
                <li>🔢 <strong>コア数:</strong> 16コア</li>
                <li>🏢 <strong>ベンダー:</strong> GenuineIntel</li>
                <li>🎯 <strong>仮想化:</strong> KVM (Full)</li>
              </ul>
            </div>
            <div className="bg-claude-dark-300 rounded p-4">
              <h3 className="font-bold text-claude-orange-400 mb-2">機能</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>✅ AVX / AVX2 / AVX512</li>
                <li>✅ AES暗号化命令</li>
                <li>✅ SHA_NI</li>
                <li>✅ SSE / SSE2 / SSE3</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded p-4">
            <p className="text-green-300 text-sm">
              ⚡ <strong>パワフル!</strong> 16コアもあれば、並列ビルドもサクサク。
              重い処理も恐れるなかれ!
            </p>
          </div>
        </section>

        {/* User & Permissions */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>👑</span> ユーザー権限: 神の領域
          </h2>
          <div className="space-y-4">
            <div className="bg-claude-dark-300 rounded p-4">
              <pre className="text-green-400 font-mono text-sm">
                uid=0(root) gid=0(root) groups=0(root)
              </pre>
              <p className="text-gray-300 mt-2">
                なんと、<strong className="text-claude-orange-400">完全なroot権限</strong>!
                sudoすら不要。あらゆるコマンドを実行可能だ。
              </p>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded p-4">
              <p className="text-red-300 text-sm">
                ⚠️ <strong>注意:</strong> この絶大な権限も一時的なもの。
                セッションが終われば、パッケージのインストールもシステム設定の変更も、すべて夢のように消える...
              </p>
            </div>
          </div>
        </section>

        {/* Environment Variables */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>🌍</span> 環境変数: 世界の設定
          </h2>
          <div className="space-y-4">
            <div className="bg-claude-dark-300 rounded p-4">
              <h3 className="font-bold text-claude-orange-400 mb-3">Claude Code関連</h3>
              <div className="font-mono text-sm space-y-1 text-gray-300">
                <div><span className="text-green-400">CLAUDECODE</span>=1</div>
                <div><span className="text-green-400">CLAUDE_CODE_VERSION</span>=2.0.23</div>
                <div><span className="text-green-400">CLAUDE_CODE_REMOTE</span>=true</div>
                <div><span className="text-green-400">CLAUDE_CODE_REMOTE_ENVIRONMENT_TYPE</span>=cloud_default</div>
                <div><span className="text-green-400">IS_SANDBOX</span>=yes</div>
              </div>
            </div>
            <div className="bg-claude-dark-300 rounded p-4">
              <h3 className="font-bold text-claude-orange-400 mb-3">開発ツール</h3>
              <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-300">
                <div>🟢 <strong>Node.js:</strong> v22.20.0</div>
                <div>🐍 <strong>Python:</strong> 3.11 / 3.12 / 3.13</div>
                <div>☕ <strong>Java:</strong> OpenJDK 21</div>
                <div>🦀 <strong>Rust:</strong> Cargo 1.90</div>
                <div>💎 <strong>Ruby:</strong> 3.3.6</div>
                <div>🐹 <strong>Go:</strong> 1.24.7</div>
              </div>
            </div>
            <div className="bg-claude-dark-300 rounded p-4">
              <h3 className="font-bold text-claude-orange-400 mb-3">特別な変数</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>
                  <code className="bg-claude-dark text-claude-orange-400 px-2 py-1 rounded">MAX_THINKING_TOKENS=31999</code>
                  <br />
                  <span className="text-gray-400">→ Claudeの思考トークン上限</span>
                </li>
                <li>
                  <code className="bg-claude-dark text-claude-orange-400 px-2 py-1 rounded">GIT_EDITOR=true</code>
                  <br />
                  <span className="text-gray-400">→ 対話型エディタは無効化（自動化のため）</span>
                </li>
                <li>
                  <code className="bg-claude-dark text-claude-orange-400 px-2 py-1 rounded">DEBIAN_FRONTEND=noninteractive</code>
                  <br />
                  <span className="text-gray-400">→ apt installで確認プロンプトなし</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Tools */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>🛠️</span> プリインストールツール
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-claude-dark-300 rounded p-4">
              <h3 className="font-bold text-green-400 mb-2">✅ あるもの</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Git 2.43.0</li>
                <li>• vim 9.1</li>
                <li>• ripgrep 14.1</li>
                <li>• curl / wget</li>
                <li>• jq / yq</li>
                <li>• tmux 3.4</li>
                <li>• gcc / make</li>
                <li>• 他600個以上!</li>
              </ul>
            </div>
            <div className="bg-claude-dark-300 rounded p-4">
              <h3 className="font-bold text-red-400 mb-2">❌ ないもの</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• GitHub CLI (gh)</li>
                <li>• Docker</li>
                <li>• ping</li>
                <li>• ifconfig / ip</li>
                <li>• netstat</li>
              </ul>
              <p className="text-xs text-gray-400 mt-2">
                (apt installで追加可能)
              </p>
            </div>
            <div className="bg-claude-dark-300 rounded p-4">
              <h3 className="font-bold text-yellow-400 mb-2">⚡ 即追加できる</h3>
              <pre className="text-xs bg-claude-dark p-2 rounded mt-2 text-gray-300">
{`apt update
apt install -y gh \\
  docker.io \\
  postgresql-client`}
              </pre>
              <p className="text-xs text-gray-400 mt-2">
                rootだから自由自在!
              </p>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-claude-orange-400/20">
          <a
            href="/"
            className="text-claude-orange-400 hover:text-claude-orange-300 transition-colors"
          >
            ← トップに戻る
          </a>
          <a
            href="/container"
            className="bg-claude-orange hover:bg-claude-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            次へ: コンテナの秘密 →
          </a>
        </div>
      </div>
    </div>
  );
}
