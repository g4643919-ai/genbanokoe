import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    field?: string;
  }>;
}

export default async function RankingPage({ searchParams }: PageProps) {
  const { field } = await searchParams;
  const fields = await prisma.field.findMany({ orderBy: { id: "asc" } });
  const activeField = fields.find((f) => f.slug === field);

  // Fetch categories with live posts and reaction counts
  const categories = await prisma.category.findMany({
    include: {
      posts: {
        where: {
          status: "PUBLISHED",
          postType: "ISSUE",
          fieldId: activeField ? activeField.id : undefined,
        },
        include: {
          reactions: {
            where: { type: "SAME_WORKPLACE" },
          },
        },
      },
    },
  });

  // Dynamically rank categories based on post volume and SAME_WORKPLACE reactions
  const rankingList = categories
    .map((cat) => {
      const postCount = cat.posts.length;
      const sameWorkplaceCount = cat.posts.reduce(
        (acc, post) => acc + post.reactions.length,
        0
      );
      return {
        id: cat.id,
        name: cat.name,
        postCount,
        sameWorkplaceCount,
        score: postCount * 2 + sameWorkplaceCount * 5,
      };
    })
    .filter((item) => item.postCount > 0)
    .sort((a, b) => b.score - a.score);

  return (
    <div className="container">
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--primary)" }}>
          🏆 現場の問題ランキング
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
          実際の投稿データと「同じ現場です」の共感数から集計された課題ランキング
        </p>
      </div>

      {/* Field Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          justifyContent: "center",
        }}
      >
        <Link
          href="/ranking"
          style={{
            padding: "0.4rem 0.9rem",
            borderRadius: "20px",
            fontSize: "0.85rem",
            fontWeight: 700,
            backgroundColor: !field ? "var(--primary)" : "var(--surface)",
            color: !field ? "var(--surface)" : "var(--text-main)",
            border: "1px solid var(--border)",
          }}
        >
          全分野
        </Link>
        {fields.map((f) => (
          <Link
            key={f.id}
            href={`/ranking?field=${f.slug}`}
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: "20px",
              fontSize: "0.85rem",
              fontWeight: 700,
              backgroundColor: field === f.slug ? "var(--primary)" : "var(--surface)",
              color: field === f.slug ? "var(--surface)" : "var(--text-main)",
              border: "1px solid var(--border)",
            }}
          >
            {f.name}
          </Link>
        ))}
      </div>

      {rankingList.length === 0 ? (
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
            集計可能なデータがまだ十分に蓄積されていません。
          </p>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              marginTop: "0.3rem",
            }}
          >
            架空の数値は表示せず、実際の投稿データが集まり次第自動集計されます。
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {rankingList.map((item, index) => {
            const rank = index + 1;
            const rankBadgeColor =
              rank === 1
                ? "#FFD700"
                : rank === 2
                ? "#C0C0C0"
                : rank === 3
                ? "#CD7F32"
                : "var(--primary-light)";

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "1.2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: rankBadgeColor,
                      color: rank <= 3 ? "#000" : "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: "1.1rem",
                    }}
                  >
                    {rank}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>
                      {item.name}
                    </h3>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        marginTop: "0.2rem",
                      }}
                    >
                      関連投稿: {item.postCount}件
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 900,
                      color: "var(--secondary-hover)",
                    }}
                  >
                    💬 {item.sameWorkplaceCount}人
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    同じ現場回答
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
