export default function PersistencePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-6">
          <span className="gradient-text">💾 データの運命</span>
        </h1>
        <p className="text-xl text-gray-300 mb-12">
          消えゆくデータと永遠のデータ。ファイルの生と死を見極めよ
        </p>

        {/* The Great Division */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">
            <span className="gradient-text">⚖️ データの大分水嶺</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Ephemeral */}
            <div className="bg-gradient-to-br from-red-500/20 to-red-700/20 rounded-lg p-6 border border-red-500/30">
              <div className="text-center mb-4">
                <span className="text-5xl">💀</span>
                <h3 className="text-2xl font-bold text-red-400 mt-2">儚い者たち</h3>
                <p className="text-sm text-gray-400 mt-1">セッション終了で消滅</p>
              </div>
              <div className="space-y-3">
                <div className="bg-claude-dark-300 rounded p-3">
                  <code className="text-red-400 font-bold">/tmp/</code>
                  <p className="text-xs text-gray-400 mt-1">一時ファイルの墓場</p>
                </div>
                <div className="bg-claude-dark-300 rounded p-3">
                  <code className="text-red-400 font-bold">/root/</code>
                  <p className="text-xs text-gray-400 mt-1">rootのホーム(儚い)</p>
                </div>
                <div className="bg-claude-dark-300 rounded p-3">
                  <code className="text-red-400 font-bold">/opt/</code>
                  <p className="text-xs text-gray-400 mt-1">インストールツール</p>
                </div>
                <div className="bg-claude-dark-300 rounded p-3">
                  <code className="text-red-400 font-bold">/usr/local/</code>
                  <p className="text-xs text-gray-400 mt-1">カスタムインストール</p>
                </div>
                <div className="bg-claude-dark-300 rounded p-3">
                  <code className="text-red-400 font-bold">/var/</code>
                  <p className="text-xs text-gray-400 mt-1">ログとキャッシュ</p>
                </div>
              </div>
            </div>

            {/* Persistent */}
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-700/20 rounded-lg p-6 border border-green-500/30">
              <div className="text-center mb-4">
                <span className="text-5xl">♾️</span>
                <h3 className="text-2xl font-bold text-green-400 mt-2">永遠の者たち</h3>
                <p className="text-sm text-gray-400 mt-1">セッションを超えて存続</p>
              </div>
              <div className="space-y-3">
                <div className="bg-claude-dark-300 rounded p-3 border border-green-500/30">
                  <code className="text-green-400 font-bold">/home/user/</code>
                  <p className="text-xs text-gray-400 mt-1">作業ディレクトリ (最重要!)</p>
                </div>
                <div className="bg-claude-dark-300 rounded p-3 border border-green-500/30">
                  <code className="text-green-400 font-bold">~/.claude/</code>
                  <p className="text-xs text-gray-400 mt-1">Claude Code設定</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3 mt-3">
                  <p className="text-yellow-300 text-xs">
                    ⚠️ <strong>重要:</strong> この2つのディレクトリのみが永続化される!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* .claude directory */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>🔧</span> ~/.claude/ の中身
          </h2>
          <div className="space-y-4">
            <p className="text-gray-300">
              <code className="bg-claude-dark text-green-400 px-2 py-1 rounded">~/.claude/</code>
              ディレクトリはClaude Codeの心臓部。ここに設定を保存すれば、次回セッションでも使える!
            </p>
            <div className="bg-claude-dark-300 rounded p-6">
              <h3 className="font-bold text-claude-orange-400 mb-4">主要ファイル・ディレクトリ</h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <code className="text-green-400 font-mono">settings.json</code>
                  <span className="text-gray-400">→ グローバル設定 (フック、パーミッション)</span>
                </div>
                <div className="flex gap-3">
                  <code className="text-green-400 font-mono">projects/</code>
                  <span className="text-gray-400">→ プロジェクト別の設定</span>
                </div>
                <div className="flex gap-3">
                  <code className="text-green-400 font-mono">session-env/</code>
                  <span className="text-gray-400">→ セッション環境変数</span>
                </div>
                <div className="flex gap-3">
                  <code className="text-green-400 font-mono">shell-snapshots/</code>
                  <span className="text-gray-400">→ シェル状態のスナップショット</span>
                </div>
                <div className="flex gap-3">
                  <code className="text-green-400 font-mono">todos/</code>
                  <span className="text-gray-400">→ Todoリスト</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Git Integration */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>📚</span> Gitによる永続化
          </h2>
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded p-6">
              <h3 className="text-xl font-bold text-green-400 mb-3">最も確実な永続化方法</h3>
              <p className="text-gray-300 mb-4">
                ファイルシステムの永続化に加えて、<strong className="text-claude-orange-400">Gitでコミット&プッシュ</strong>
                するのが最も安全。Claude Codeには強力なStopフックが設定されており、未プッシュの変更があると
                セッション終了をブロックしてくれる!
              </p>
              <div className="bg-claude-dark-300 rounded p-4">
                <h4 className="font-bold text-claude-orange-400 mb-2">Stopフックの動作</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>✅ 未コミットの変更を検出</li>
                  <li>✅ 追跡されていないファイルを検出</li>
                  <li>✅ プッシュされていないコミットを検出</li>
                  <li>🚫 いずれかが該当すると<strong className="text-red-400">セッション終了をブロック</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Symlinks */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>🔗</span> シンボリックリンクの挙動
          </h2>
          <div className="space-y-4">
            <p className="text-gray-300">シンボリックリンクも永続化される。ただし注意点がある:</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded p-4">
                <h3 className="font-bold text-green-400 mb-2">✅ 永続化されるリンク</h3>
                <ul className="space-y-2 text-sm text-gray-300 font-mono">
                  <li>相対リンク (同じ永続領域内)</li>
                  <li>/home/user/ → /home/user/</li>
                </ul>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded p-4">
                <h3 className="font-bold text-red-400 mb-2">⚠️ 問題のあるリンク</h3>
                <ul className="space-y-2 text-sm text-gray-300 font-mono">
                  <li>/home/user/ → /tmp/</li>
                  <li>/home/user/ → /root/</li>
                  <li className="text-xs text-gray-400 mt-2">(リンク先が消える!)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>📋</span> データ永続化のベストプラクティス
          </h2>
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded p-4">
              <h3 className="font-bold text-green-400 mb-3">✅ DO (やるべきこと)</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>✅ すべての作業を <code className="bg-claude-dark px-2 py-1 rounded text-green-400">/home/user/</code> 配下で行う</li>
                <li>✅ プロジェクト設定は <code className="bg-claude-dark px-2 py-1 rounded text-green-400">.claude/settings.json</code> に</li>
                <li>✅ こまめに <code className="bg-claude-dark px-2 py-1 rounded">git commit</code> & <code className="bg-claude-dark px-2 py-1 rounded">git push</code></li>
                <li>✅ 重要なスクリプトは永続領域に保存</li>
                <li>✅ セッション終了前にStopフックの警告を確認</li>
              </ul>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded p-4">
              <h3 className="font-bold text-red-400 mb-3">❌ DON'T (避けるべきこと)</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>❌ <code className="bg-claude-dark px-2 py-1 rounded text-red-400">/tmp/</code> に重要ファイルを保存</li>
                <li>❌ <code className="bg-claude-dark px-2 py-1 rounded text-red-400">/root/</code> に設定ファイルを置く</li>
                <li>❌ apt installしたパッケージの永続化を期待</li>
                <li>❌ 未プッシュのままセッション終了</li>
                <li>❌ エフェメラル領域へのシンボリックリンク</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Quick Reference */}
        <section className="mb-12 bg-gradient-to-r from-claude-orange-400/10 to-purple-500/10 rounded-lg p-8 border border-claude-orange-400/30">
          <h2 className="text-3xl font-bold mb-4 text-center">
            <span className="gradient-text">🎯 クイックリファレンス</span>
          </h2>
          <div className="bg-claude-dark-300 rounded-lg p-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl mb-2">♾️</div>
                <div className="text-2xl font-bold text-green-400 mb-1">2</div>
                <div className="text-sm text-gray-400">永続ディレクトリ</div>
              </div>
              <div>
                <div className="text-4xl mb-2">💀</div>
                <div className="text-2xl font-bold text-red-400 mb-1">5+</div>
                <div className="text-sm text-gray-400">エフェメラル領域</div>
              </div>
              <div>
                <div className="text-4xl mb-2">🔒</div>
                <div className="text-2xl font-bold text-claude-orange-400 mb-1">100%</div>
                <div className="text-sm text-gray-400">Stopフックの保護</div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-claude-orange-400/20">
          <a
            href="/commands"
            className="text-claude-orange-400 hover:text-claude-orange-300 transition-colors"
          >
            ← 前へ: 禁断のコマンド
          </a>
          <a
            href="/github"
            className="bg-claude-orange hover:bg-claude-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            次へ: GitHub芸の極意 →
          </a>
        </div>
      </div>
    </div>
  );
}
