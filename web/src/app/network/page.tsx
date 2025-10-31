export default function NetworkPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-6">
          <span className="gradient-text">🌐 ネットワークの迷宮</span>
        </h1>
        <p className="text-xl text-gray-300 mb-12">
          プロキシの壁、JWTの鍵、そして外界への細い道
        </p>

        {/* Proxy Architecture */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>🏰</span> プロキシアーキテクチャ
          </h2>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-6 border border-purple-500/30">
              <p className="text-xl font-bold text-purple-400 mb-4">
                すべての外部通信はプロキシ経由!
              </p>
              <p className="text-gray-300">
                Claude Code on the Webのコンテナは、直接インターネットにアクセスできない。
                すべての通信はAnthropicが管理する<strong className="text-claude-orange-400">プロキシサーバー</strong>を経由する。
              </p>
            </div>

            <div className="bg-claude-dark-300 rounded p-6">
              <h3 className="font-bold text-claude-orange-400 mb-4">ネットワークフロー</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🐳</span>
                  <div className="flex-1">
                    <div className="font-bold text-green-400">コンテナ内アプリ</div>
                    <div className="text-gray-400">curl, npm install, git clone...</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⬇️</span>
                  <div className="text-gray-500 text-xs">HTTP_PROXY / HTTPS_PROXY</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔐</span>
                  <div className="flex-1">
                    <div className="font-bold text-yellow-400">Anthropicプロキシ</div>
                    <div className="text-gray-400 font-mono text-xs">21.0.0.119:15004</div>
                    <div className="text-gray-500 text-xs mt-1">JWT認証チェック</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⬇️</span>
                  <div className="text-gray-500 text-xs">認証OK</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌍</span>
                  <div className="flex-1">
                    <div className="font-bold text-blue-400">外部インターネット</div>
                    <div className="text-gray-400">GitHub, npm registry, etc.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Environment Variables */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>📝</span> プロキシ設定
          </h2>
          <div className="space-y-4">
            <div className="bg-claude-dark-300 rounded p-6">
              <h3 className="font-bold text-claude-orange-400 mb-3">環境変数</h3>
              <pre className="bg-claude-dark rounded p-4 text-sm text-gray-300 overflow-x-auto">
{`HTTP_PROXY=http://container_...@21.0.0.119:15004
HTTPS_PROXY=http://container_...@21.0.0.119:15004
NO_PROXY=localhost,127.0.0.1,169.254.169.254,\\
  metadata.google.internal,*.svc.cluster.local,\\
  *.local,*.googleapis.com,*.google.com`}
              </pre>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded p-4">
              <p className="text-blue-300 text-sm">
                💡 <strong>NO_PROXY:</strong> ローカルホスト、内部サービス、Google関連ドメインは
                プロキシをバイパスして直接アクセス可能。
              </p>
            </div>
          </div>
        </section>

        {/* JWT Authentication */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>🎫</span> JWT認証
          </h2>
          <div className="space-y-4">
            <p className="text-gray-300">
              プロキシへのアクセスには<strong className="text-claude-orange-400">JWT (JSON Web Token)</strong>による
              認証が必要。このトークンはプロキシURLに埋め込まれている。
            </p>
            <div className="bg-claude-dark-300 rounded p-6">
              <h3 className="font-bold text-claude-orange-400 mb-3">JWTの特徴</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  🔒 <strong>セキュア:</strong> コンテナごとに一意のトークン
                </li>
                <li>
                  ⏱️ <strong>期限付き:</strong> セッション時間中のみ有効（約4時間）
                </li>
                <li>
                  🎯 <strong>スコープ付き:</strong> このコンテナのみアクセス可能
                </li>
                <li>
                  🔄 <strong>自動管理:</strong> ユーザーは意識不要
                </li>
              </ul>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-4">
              <p className="text-yellow-300 text-sm">
                ⚠️ <strong>有効期限:</strong> 長時間のセッション（4時間以上）では、
                トークンが期限切れになる可能性。その場合はセッションを再開。
              </p>
            </div>
          </div>
        </section>

        {/* Available / Unavailable */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>🔌</span> できること・できないこと
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Can Do */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-green-400 mb-4">✅ できること</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex gap-2">
                  <span className="text-green-400">✅</span>
                  <div>
                    <strong>HTTP/HTTPS通信</strong>
                    <div className="text-xs text-gray-400">curl, wget, npm, pip, etc.</div>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-400">✅</span>
                  <div>
                    <strong>Git操作</strong>
                    <div className="text-xs text-gray-400">clone, pull, push (プロキシ経由)</div>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-400">✅</span>
                  <div>
                    <strong>パッケージダウンロード</strong>
                    <div className="text-xs text-gray-400">apt, npm, pip, cargo...</div>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-400">✅</span>
                  <div>
                    <strong>Web API呼び出し</strong>
                    <div className="text-xs text-gray-400">REST API, GraphQL...</div>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-400">✅</span>
                  <div>
                    <strong>DNS解決</strong>
                    <div className="text-xs text-gray-400">プロキシが処理</div>
                  </div>
                </li>
              </ul>
            </div>

            {/* Cannot Do */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-red-400 mb-4">❌ できないこと</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex gap-2">
                  <span className="text-red-400">❌</span>
                  <div>
                    <strong>ping / ICMP</strong>
                    <div className="text-xs text-gray-400">pingコマンドなし & プロキシ非対応</div>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400">❌</span>
                  <div>
                    <strong>生ソケット通信</strong>
                    <div className="text-xs text-gray-400">TCP/UDPの直接接続</div>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400">❌</span>
                  <div>
                    <strong>ネットワーク診断</strong>
                    <div className="text-xs text-gray-400">traceroute, netstat等</div>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400">❌</span>
                  <div>
                    <strong>カスタムプロトコル</strong>
                    <div className="text-xs text-gray-400">HTTP/HTTPS以外</div>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400">❌</span>
                  <div>
                    <strong>サーバーの起動</strong>
                    <div className="text-xs text-gray-400">外部からアクセス不可</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Special Cases */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>🎯</span> 特殊なケース
          </h2>
          <div className="space-y-4">
            {/* GitHub */}
            <div className="bg-claude-dark-300 rounded p-6">
              <h3 className="font-bold text-green-400 mb-3">✅ GitHub API</h3>
              <p className="text-gray-300 text-sm mb-3">
                GitHubへのアクセスは<strong className="text-claude-orange-400">専用プロキシ</strong>経由で最適化されている。
              </p>
              <pre className="bg-claude-dark rounded p-3 text-xs text-gray-300 overflow-x-auto">
{`# .git/config に自動設定される
[remote "origin"]
    url = http://local_proxy@127.0.0.1:38692/git/owner/repo`}
              </pre>
              <p className="text-xs text-gray-400 mt-2">
                → localhost:38692がGitHub APIへのゲートウェイ
              </p>
            </div>

            {/* localhost */}
            <div className="bg-claude-dark-300 rounded p-6">
              <h3 className="font-bold text-green-400 mb-3">✅ ローカルサーバー</h3>
              <p className="text-gray-300 text-sm mb-3">
                コンテナ内でサーバーを起動して、<code className="bg-claude-dark px-2 py-1 rounded">localhost</code>でアクセスは可能。
              </p>
              <pre className="bg-claude-dark rounded p-3 text-xs text-gray-300">
{`# 例: Next.js開発サーバー
npm run dev
# http://localhost:3000 でアクセス可能 (コンテナ内のみ)`}
              </pre>
              <p className="text-xs text-gray-400 mt-2">
                ⚠️ ただし、外部（ブラウザ）からは直接アクセス不可
              </p>
            </div>

            {/* WebSocket */}
            <div className="bg-claude-dark-300 rounded p-6">
              <h3 className="font-bold text-yellow-400 mb-3">⚠️ WebSocket</h3>
              <p className="text-gray-300 text-sm">
                WebSocket接続は<strong className="text-yellow-400">制限あり</strong>。
                一部のWebSocketは動作するが、長時間接続は不安定な可能性。
              </p>
            </div>
          </div>
        </section>

        {/* Testing Connection */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>🧪</span> 接続テスト
          </h2>
          <div className="space-y-4">
            <div className="bg-claude-dark-300 rounded p-6">
              <h3 className="font-bold text-claude-orange-400 mb-3">基本的な接続確認</h3>
              <pre className="bg-claude-dark rounded p-4 text-sm text-gray-300 overflow-x-auto">
{`# HTTPステータスコード取得
curl -s -o /dev/null -w "%{http_code}" https://www.google.com
# → 200 が返れば接続OK

# レスポンス時間測定
curl -w "Time: %{time_total}s\\n" -o /dev/null -s https://api.github.com
# → プロキシ経由なので若干遅い (100-300ms程度)

# DNS解決テスト
curl -v https://www.example.com 2>&1 | grep "Connected"
# → Connected to ... が表示されればOK`}
              </pre>
            </div>
            <div className="bg-claude-dark-300 rounded p-6">
              <h3 className="font-bold text-claude-orange-400 mb-3">パッケージマネージャーのテスト</h3>
              <pre className="bg-claude-dark rounded p-4 text-sm text-gray-300 overflow-x-auto">
{`# npm
npm ping
# → Ping success が表示されればOK

# pip
pip install --dry-run requests
# → エラーなく完了すればOK

# apt
apt update
# → パッケージリスト更新成功すればOK`}
              </pre>
            </div>
          </div>
        </section>

        {/* SSL Certificates */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>🔐</span> SSL証明書
          </h2>
          <div className="space-y-4">
            <p className="text-gray-300">
              SSL証明書の検証は自動で行われる。環境変数で証明書バンドルが設定されている。
            </p>
            <div className="bg-claude-dark-300 rounded p-4">
              <pre className="text-sm text-gray-300">
{`SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt
NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt
REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt`}
              </pre>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded p-4">
              <p className="text-green-300 text-sm">
                ✅ <strong>自動設定:</strong> ほとんどのツールは自動的にこれらの証明書を使用。
                SSL検証エラーが出ることはほぼない。
              </p>
            </div>
          </div>
        </section>

        {/* Summary */}
        <section className="mb-12 bg-gradient-to-r from-claude-orange-400/10 to-purple-500/10 rounded-lg p-8 border border-claude-orange-400/30">
          <h2 className="text-3xl font-bold mb-4 text-center">
            <span className="gradient-text">🎯 ネットワークまとめ</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="bg-claude-dark-300 rounded p-4">
              <div className="text-3xl mb-2">🔐</div>
              <div className="font-bold text-purple-400 mb-1">プロキシ経由</div>
              <div className="text-xs text-gray-400">すべての外部通信</div>
            </div>
            <div className="bg-claude-dark-300 rounded p-4">
              <div className="text-3xl mb-2">🎫</div>
              <div className="font-bold text-yellow-400 mb-1">JWT認証</div>
              <div className="text-xs text-gray-400">約4時間有効</div>
            </div>
            <div className="bg-claude-dark-300 rounded p-4">
              <div className="text-3xl mb-2">✅</div>
              <div className="font-bold text-green-400 mb-1">HTTP/HTTPS OK</div>
              <div className="text-xs text-gray-400">実用上問題なし</div>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-claude-orange-400/20">
          <a
            href="/github"
            className="text-claude-orange-400 hover:text-claude-orange-300 transition-colors"
          >
            ← 前へ: GitHub芸の極意
          </a>
          <a
            href="/"
            className="bg-claude-orange hover:bg-claude-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            トップに戻る
          </a>
        </div>
      </div>
    </div>
  );
}
