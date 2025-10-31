import Link from "next/link";

export default function Home() {
  const sections = [
    {
      title: "🏔️ 環境の全貌",
      description: "gVisorの山を登り、Ubuntuの森を抜けて、16コアCPUの頂を目指す!",
      href: "/environment",
      emoji: "🗺️",
      tag: "基礎知識"
    },
    {
      title: "📦 コンテナの秘密",
      description: "8GBのメモリ湖と9.8GBのディスク大地。一時的な住人として生きる術を学ぶ",
      href: "/container",
      emoji: "🏕️",
      tag: "リソース"
    },
    {
      title: "⚔️ 禁断のコマンド",
      description: "Permission Deniedの罠を回避せよ!ツール実行ポリシーの謎に迫る",
      href: "/commands",
      emoji: "🗡️",
      tag: "実行制限"
    },
    {
      title: "💾 データの運命",
      description: "/tmp の儚さと /home/user の永遠。消えゆくデータと永遠のデータ",
      href: "/persistence",
      emoji: "⏳",
      tag: "永続化"
    },
    {
      title: "🐙 GitHub芸の極意",
      description: "ghコマンドとの格闘、プロキシ経由の旅、Git署名の魔術",
      href: "/github",
      emoji: "🎭",
      tag: "Git統合"
    },
    {
      title: "🌐 ネットワークの迷宮",
      description: "プロキシの壁、JWTの鍵、そして外界への細い道",
      href: "/network",
      emoji: "🔐",
      tag: "通信"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6">
            <span className="gradient-text glow-orange">
              Claude Code サンドボックス
            </span>
            <br />
            <span className="text-5xl">徹底探検記 🔍</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Claude Code on the Webの神秘的なサンドボックス環境に潜入!
            <br />
            gVisor、プロキシ、そして一時的なコンテナの世界を冒険しよう
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="#explore"
              className="bg-claude-orange hover:bg-claude-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
            >
              探検を始める
            </a>
            <a
              href="https://github.com/oikon48/cc-web-playground"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-claude-orange-400 text-claude-orange-400 hover:bg-claude-orange-400 hover:text-white px-8 py-3 rounded-lg font-semibold transition-all"
            >
              調査資料を見る
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-claude-dark-200 py-12 border-y border-claude-orange-400/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-claude-orange-400 mb-2">10+</div>
              <div className="text-gray-400">調査ドキュメント</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-claude-orange-400 mb-2">606</div>
              <div className="text-gray-400">プリインストールパッケージ</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-claude-orange-400 mb-2">8GB</div>
              <div className="text-gray-400">メモリ上限</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-claude-orange-400 mb-2">16</div>
              <div className="text-gray-400">CPUコア</div>
            </div>
          </div>
        </div>
      </section>

      {/* Exploration Sections */}
      <section id="explore" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">
          <span className="gradient-text">探検エリア</span>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group block bg-claude-dark-200 border border-claude-orange-400/20 rounded-lg p-6 hover:border-claude-orange-400 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-start gap-4">
                <span className="text-5xl">{section.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 bg-claude-orange-400/20 text-claude-orange-400 rounded">
                      {section.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-claude-orange-400 transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {section.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Key Findings */}
      <section className="bg-claude-dark-200 py-20 border-t border-claude-orange-400/20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            <span className="gradient-text">重要な発見</span>
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-claude-dark-300 border border-green-500/30 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h3 className="font-bold text-green-400 mb-2">完全なroot権限</h3>
                  <p className="text-gray-300">あらゆるコマンドを実行可能。ただし一時的（コンテナ再起動で消滅）</p>
                </div>
              </div>
            </div>
            <div className="bg-claude-dark-300 border border-yellow-500/30 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h3 className="font-bold text-yellow-400 mb-2">プロキシ経由の通信</h3>
                  <p className="text-gray-300">すべての外部通信はAnthropicの管理プロキシ経由。JWT認証付き</p>
                </div>
              </div>
            </div>
            <div className="bg-claude-dark-300 border border-red-500/30 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">❌</span>
                <div>
                  <h3 className="font-bold text-red-400 mb-2">コンテナの一時性</h3>
                  <p className="text-gray-300">永続化されるのは /home/user/ と ~/.claude/ のみ。他は消える運命</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Investigation Timeline */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">
          <span className="gradient-text">調査の軌跡</span>
        </h2>
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-claude-orange-400"></div>
              <div className="w-0.5 h-full bg-claude-orange-400/30"></div>
            </div>
            <div className="pb-8">
              <div className="text-claude-orange-400 font-bold mb-1">2025-10-29</div>
              <h3 className="font-bold mb-2">環境概要の調査</h3>
              <p className="text-gray-400 text-sm">システム基本情報、ユーザー権限、環境変数、Git設定を網羅的に調査</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-claude-orange-400"></div>
              <div className="w-0.5 h-full bg-claude-orange-400/30"></div>
            </div>
            <div className="pb-8">
              <div className="text-claude-orange-400 font-bold mb-1">2025-10-29</div>
              <h3 className="font-bold mb-2">コンテナライフサイクルの解明</h3>
              <p className="text-gray-400 text-sm">gVisorベースのコンテナ環境、リソース制限、ファイルシステム構造を深掘り</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-claude-orange-400"></div>
              <div className="w-0.5 h-full bg-claude-orange-400/30"></div>
            </div>
            <div className="pb-8">
              <div className="text-claude-orange-400 font-bold mb-1">2025-10-30</div>
              <h3 className="font-bold mb-2">ツール実行ポリシーの徹底調査</h3>
              <p className="text-gray-400 text-sm">Permission Deniedメカニズムを完全解明。ghコマンドの動作確認に成功</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-claude-orange-400"></div>
            </div>
            <div>
              <div className="text-claude-orange-400 font-bold mb-1">2025-10-30</div>
              <h3 className="font-bold mb-2">データ永続化の境界線調査</h3>
              <p className="text-gray-400 text-sm">永続化ディレクトリとエフェメラルディレクトリを完全分類</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
