import Link from "next/link";
import { prisma } from "@/lib/db";
import StatusSelector from "./StatusSelector";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const posts = await prisma.post.findMany({
    include: {
      category: true,
      prefecture: true,
      municipality: true,
      reactions: {
        where: { type: "SAME_WORKPLACE" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container">
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--primary)" }}>
          🛠️ 課題解決トラッキング ＆ 管理者ダッシュボード
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
          集まった現場課題の解決ステータス変更（未対応・検討中・改善中・改善済み）とモデレーション
        </p>
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        {posts.map((post) => {
          const locationName = post.prefecture
            ? `${post.prefecture.name}${post.municipality ? ` ${post.municipality.name}` : ""}`
            : post.posterPrefecture;

          return (
            <div
              key={post.id}
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "1.2rem",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.8rem",
                  marginBottom: "0.5rem",
                }}
              >
                <div>
                  <span className="categoryBadge">{post.category.name}</span>
                  <span style={{ marginLeft: "0.5rem", color: "var(--text-muted)" }}>
                    📍 {locationName}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>
                    解決進捗:
                  </span>
                  <StatusSelector postId={post.id} currentStatus={post.resolutionStatus} />
                </div>
              </div>

              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.4rem" }}>
                <Link href={`/posts/${post.id}`}>{post.title}</Link>
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "0.8rem" }}>
                {post.content}
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  borderTop: "1px solid var(--border)",
                  paddingTop: "0.6rem",
                }}
              >
                <span>📅 登録日: {new Date(post.createdAt).toLocaleDateString("ja-JP")}</span>
                <span style={{ color: "var(--secondary-hover)", fontWeight: 700 }}>
                  💬 同じ現場 {post.reactions.length}人
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
