import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Claude Code サンドボックス探検記",
  description: "Claude Code on the Webのサンドボックスを徹底解剖!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="font-sans">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-claude-dark-300/80 backdrop-blur-md border-b border-claude-orange-400/20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold gradient-text">
                🔍 Claude Code サンドボックス探検記
              </h1>
              <a
                href="https://github.com/oikon48/cc-web-playground"
                target="_blank"
                rel="noopener noreferrer"
                className="text-claude-orange-400 hover:text-claude-orange-300 transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </nav>
        <main className="pt-20">
          {children}
        </main>
        <footer className="border-t border-claude-orange-400/20 mt-20">
          <div className="container mx-auto px-4 py-8 text-center text-gray-400">
            <p>調査と解説: Claude (Anthropic) | 調査期間: 2025-10-29 ~ 2025-10-30</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
