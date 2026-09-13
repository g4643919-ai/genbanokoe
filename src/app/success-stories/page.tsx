import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SuccessStoriesPage() {
  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      postType: "SUCCESS_STORY",
    },
    include: {
      category: true,
      field: true,
      prefecture: true,
      municipality: true,
      occupation: true,
      reactions: {
        where: { type: "HELPFUL" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container">
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--primary)" }}>
          💡 現場の改善事例・成功事例
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
          残業削減や業務効率化、チームワーク向上に成功した現場の知恵と工夫の共有
        </p>
      </div>

      {posts.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem 1rem",
            backgroundColor: "var(--surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px dashed var(--border)",
          }}
        >
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            まだ投稿された成功事例がありません。
          </p>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
            あなたの現場でうまくいった取り組みを最初に共有してみませんか？
          </p>
        </div>
      ) : (
        posts.map((post) => {
          const locationName = post.prefecture
            ? `${post.prefecture.name}${post.municipality ? ` ${post.municipality.name}` : ""}`
            : post.posterPrefecture;

          return (
            <article key={post.id} className="post-card">
              <Link href={`/posts/${post.id}`}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                  <div>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        padding: "0.1rem 0.4rem",
                        borderRadius: "4px",
                        fontWeight: 700,
                        backgroundColor: "#e8f5e9",
                        color: "#2e7d32",
                        marginRight: "0.4rem",
                      }}
                    >
                      💡 成功事例
                    </span>
                    <span className="categoryBadge">{post.category.name}</span>
                  </div>
                  <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>📍 {locationName}</span>
                </div>

                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.4rem" }}>{post.title}</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{post.content}</p>

                {post.improvementProposal && (
                  <div
                    style={{
                      backgroundColor: "var(--secondary-light)",
                      border: "1px solid var(--secondary)",
                      borderRadius: "var(--radius-sm)",
                      padding: "0.6rem 0.8rem",
                      marginTop: "0.8rem",
                      fontSize: "0.85rem",
                      color: "var(--text-main)",
                    }}
                  >
                    <strong>💡 改善の工夫: </strong>
                    {post.improvementProposal}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    marginTop: "0.8rem",
                    paddingTop: "0.8rem",
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  <span>👤 {post.occupation ? post.occupation.name : post.posterOccupation}</span>
                  <span style={{ color: "var(--accent-blue)", fontWeight: 700 }}>
                    💡 参考になった {post.reactions.length}人
                  </span>
                </div>
              </Link>
            </article>
          );
        })
      )}
    </div>
  );
}
