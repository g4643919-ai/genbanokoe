import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "現場の声 | あなたの声が、現場を変える。",
  description: "介護福祉士・介護職員が現場で感じる課題、アイデア、知恵を可視化し、改善につなげるための匿名コミュニティサイトです。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <header className="app-header">
          <Link href="/" className="logo-link">
            <span>現場の声</span>
            <span className="logo-badge">介護福祉</span>
          </Link>
          <div className="header-actions">
            <Link href="/reports" style={{ marginRight: "0.5rem", fontSize: "0.85rem", color: "var(--primary-hover)", fontWeight: 700 }}>
              📊 レポート
            </Link>
            <Link href="/success-stories" style={{ marginRight: "0.5rem", fontSize: "0.85rem", color: "#2e7d32", fontWeight: 700 }}>
              💡 成功事例
            </Link>
            <Link href="/regions" style={{ marginRight: "0.5rem", fontSize: "0.85rem", color: "var(--primary)", fontWeight: 700 }}>
              🗺️ 地域分析
            </Link>
            <Link href="/profile" className="btn-secondary" style={{ marginRight: "0.5rem", fontSize: "0.85rem", padding: "0.4rem 0.8rem", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
              マイページ
            </Link>
            <Link href="/posts/new" className="btn-primary">
              投稿する
            </Link>
          </div>
        </header>

        <main className="main-content">
          {children}
        </main>

        <nav className="mobile-nav">
          <Link href="/" className="nav-item">
            <span className="nav-icon">🏠</span>
            <span>ホーム</span>
          </Link>
          <Link href="/regions" className="nav-item">
            <span className="nav-icon">🗺️</span>
            <span>地域分析</span>
          </Link>
          <Link href="/posts/new" className="nav-item">
            <span className="nav-icon">✏️</span>
            <span>投稿</span>
          </Link>
          <Link href="/ranking" className="nav-item">
            <span className="nav-icon">🏆</span>
            <span>ランキング</span>
          </Link>
          <Link href="/profile" className="nav-item">
            <span className="nav-icon">👤</span>
            <span>マイページ</span>
          </Link>
        </nav>
      </body>
    </html>
  );
}
