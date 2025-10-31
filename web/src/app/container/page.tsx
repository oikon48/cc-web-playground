export default function ContainerPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-6">
          <span className="gradient-text">📦 コンテナの秘密</span>
        </h1>
        <p className="text-xl text-gray-300 mb-12">
          一時的な住人として生きる術。リソースの境界を知り、賢く生きよう
        </p>

        {/* gVisor */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>🛡️</span> gVisor: 二重の壁
          </h2>
          <div className="space-y-4">
            <p className="text-gray-300">
              この世界は<strong className="text-claude-orange-400">gVisor (runsc)</strong>という
              特殊なコンテナランタイムの中。通常のDockerやKubernetesよりもさらに厳重なセキュリティの壁に守られている。
            </p>
            <div className="bg-claude-dark-300 rounded p-6">
              <h3 className="font-bold text-claude-orange-400 mb-3">gVisorの3つの特徴</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-green-400 mb-1">1. 独自カーネル</h4>
                  <p className="text-gray-300 text-sm">
                    ホストのLinuxカーネルを直接使わず、Goで書かれた独自のカーネルを実装。
                    システムコールを全てインターセプト。
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-green-400 mb-1">2. 強力な隔離</h4>
                  <p className="text-gray-300 text-sm">
                    万が一コンテナ内で悪意のあるコードが実行されても、
                    ホストシステムへの影響を最小限に抑える。
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-green-400 mb-1">3. パフォーマンストレードオフ</h4>
                  <p className="text-gray-300 text-sm">
                    セキュリティと引き換えに、若干のオーバーヘッド。
                    でも16コアあるから気にならない!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Memory */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>💧</span> メモリ: 8GBの湖
          </h2>
          <div className="space-y-4">
            <div className="bg-claude-dark-300 rounded p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-claude-orange-400">8GB</span>
                <span className="text-gray-400">上限 (厳格)</span>
              </div>
              <div className="w-full bg-claude-dark rounded-full h-4 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-claude-orange-400 h-full" style={{width: '60%'}}></div>
              </div>
              <p className="text-sm text-gray-400 mt-2">通常時: 5GB程度使用</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-4">
              <p className="text-yellow-300 text-sm">
                ⚠️ <strong>制限は絶対:</strong> 8GBを超えるとOOM Killer（メモリ不足キラー）が
                容赦なくプロセスを終了させる。大規模ビルドの際は要注意!
              </p>
            </div>
            <div className="bg-claude-dark-300 rounded p-4">
              <h3 className="font-bold text-claude-orange-400 mb-2">メモリ節約テクニック</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>✅ <code className="bg-claude-dark px-2 py-1 rounded">npm ci</code> より <code className="bg-claude-dark px-2 py-1 rounded">npm install</code> が軽い</li>
                <li>✅ ビルドの並列度を <code className="bg-claude-dark px-2 py-1 rounded">-j4</code> 程度に抑える</li>
                <li>✅ 不要なnode_modulesは削除</li>
                <li>✅ キャッシュの定期クリア</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Disk */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>💿</span> ディスク: 9.8GBの大地
          </h2>
          <div className="space-y-4">
            <div className="bg-claude-dark-300 rounded p-4">
              <h3 className="font-bold text-claude-orange-400 mb-3">ディスク使用状況</h3>
              <div className="font-mono text-sm space-y-1 text-gray-300">
                <div className="flex justify-between">
                  <span>合計:</span>
                  <span className="text-claude-orange-400">9.8GB</span>
                </div>
                <div className="flex justify-between">
                  <span>利用可能:</span>
                  <span className="text-green-400">9.3GB</span>
                </div>
              </div>
              <div className="w-full bg-claude-dark rounded-full h-4 overflow-hidden mt-4">
                <div className="bg-gradient-to-r from-green-500 to-green-600 h-full" style={{width: '5%'}}></div>
              </div>
              <p className="text-sm text-gray-400 mt-2">使用率: 約5%</p>
            </div>

            <div className="bg-claude-dark-300 rounded p-4">
              <h3 className="font-bold text-claude-orange-400 mb-3">主要ディレクトリの使用量</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">/opt (開発ツール)</span>
                  <span className="text-claude-orange-400 font-mono">1.3GB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">/root</span>
                  <span className="text-claude-orange-400 font-mono">983MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">/usr/local</span>
                  <span className="text-claude-orange-400 font-mono">517MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">/home</span>
                  <span className="text-green-400 font-mono">44MB</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded p-4">
              <p className="text-blue-300 text-sm">
                💡 <strong>十分な容量:</strong> 9.3GB利用可能なので、通常の開発作業には十分。
                ただし、大容量のDocker imageやデータセットのダウンロードは計画的に!
              </p>
            </div>
          </div>
        </section>

        {/* Filesystem */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>📁</span> ファイルシステム: 9Pの謎
          </h2>
          <div className="space-y-4">
            <p className="text-gray-300">
              このコンテナのファイルシステムは<strong className="text-claude-orange-400">9Pプロトコル</strong>を
              使用している。これは元々Plan 9 OSのために開発されたネットワークファイルシステムだ。
            </p>
            <div className="bg-claude-dark-300 rounded p-4">
              <h3 className="font-bold text-claude-orange-400 mb-3">9Pの特徴</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>✅ シンプルで軽量なプロトコル</li>
                <li>✅ ネットワーク越しのファイル共有が可能</li>
                <li>⚠️ I/Oパフォーマンスは通常のext4より若干劣る</li>
                <li>✅ gVisorとの相性が良い</li>
              </ul>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-4">
              <p className="text-yellow-300 text-sm">
                💾 <strong>実用上の影響:</strong> 小さなファイルの大量読み書きはやや遅い。
                巨大なnode_modulesのコピーなどは時間がかかることも。
              </p>
            </div>
          </div>
        </section>

        {/* Lifecycle */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-red-500/30">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>⏱️</span> コンテナの寿命
          </h2>
          <div className="space-y-4">
            <div className="bg-red-500/10 rounded p-6">
              <h3 className="font-bold text-red-400 mb-3 text-xl">⚠️ すべては儚い</h3>
              <p className="text-gray-300 mb-4">
                このコンテナは<strong className="text-red-400">一時的</strong>なもの。
                セッション終了後、コンテナは破棄され、以下のものは消滅する:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li>❌ apt installでインストールしたパッケージ</li>
                <li>❌ /root配下の設定ファイル (.bashrc等)</li>
                <li>❌ /opt, /usr/local への追加ファイル</li>
                <li>❌ /tmpの一時ファイル</li>
                <li>❌ 環境変数の変更</li>
              </ul>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded p-6">
              <h3 className="font-bold text-green-400 mb-3 text-xl">✅ 永遠に残るもの</h3>
              <ul className="space-y-2 text-gray-300">
                <li>✅ <code className="bg-claude-dark px-2 py-1 rounded text-green-400">/home/user/</code> 配下のすべて</li>
                <li>✅ <code className="bg-claude-dark px-2 py-1 rounded text-green-400">~/.claude/</code> 配下のすべて</li>
                <li>✅ Gitでコミット&プッシュしたコード</li>
              </ul>
              <p className="text-sm text-gray-400 mt-4">
                💡 重要なデータは必ずこれらのディレクトリに配置しよう!
              </p>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="mb-12 bg-claude-dark-200 rounded-lg p-8 border border-claude-orange-400/20">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <span>🎯</span> サバイバルテクニック
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded p-4">
              <h3 className="font-bold text-green-400 mb-2">✅ やるべきこと</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• 作業は /home/user/ で</li>
                <li>• こまめにGitコミット</li>
                <li>• 設定は ~/.claude/ に</li>
                <li>• セッション終了前に必ずpush</li>
              </ul>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded p-4">
              <h3 className="font-bold text-red-400 mb-2">❌ 避けるべきこと</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• /tmpに重要ファイル保存</li>
                <li>• パッケージ永続化を期待</li>
                <li>• メモリ8GB超える処理</li>
                <li>• pushせずセッション終了</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-claude-orange-400/20">
          <a
            href="/environment"
            className="text-claude-orange-400 hover:text-claude-orange-300 transition-colors"
          >
            ← 前へ: 環境の全貌
          </a>
          <a
            href="/commands"
            className="bg-claude-orange hover:bg-claude-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            次へ: 禁断のコマンド →
          </a>
        </div>
      </div>
    </div>
  );
}
