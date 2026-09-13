import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function RegionsIndexPage() {
  const prefectures = await prisma.prefecture.findMany({
    include: {
      municipalities: true,
      posts: {
        where: { status: "PUBLISHED" },
        include: {
          reactions: {
            where: { type: "SAME_WORKPLACE" },
          },
        },
      },
    },
    orderBy: { id: "asc" },
  });

  return (
    <div className="container">
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--primary)" }}>
          🗺️ 地域から課題を探す・分析する
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
          都道府県・市区町村ごとの介護・福祉現場の課題と声を集約しています
        </p>
      </div>

      <div style={{ display: "grid", gap: "1.25rem" }}>
        {prefectures.map((pref) => {
          const totalPosts = pref.posts.length;
          const totalSameWorkplace = pref.posts.reduce(
            (acc, post) => acc + post.reactions.length,
            0
          );

          return (
            <div
              key={pref.id}
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
                  marginBottom: "0.8rem",
                  borderBottom: "1px solid var(--border)",
                  paddingBottom: "0.6rem",
                }}
              >
                <Link
                  href={`/regions/${pref.slug}`}
                  style={{ fontWeight: 800, fontSize: "1.15rem", color: "var(--primary-hover)" }}
                >
                  📍 {pref.name} ダッシュボード →
                </Link>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  <span>投稿 {totalPosts}件</span>
                  <span style={{ marginLeft: "0.6rem", color: "var(--secondary-hover)", fontWeight: 700 }}>
                    同じ現場 {totalSameWorkplace}人
                  </span>
                </div>
              </div>

              {/* Municipalities List */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {pref.municipalities.map((muni) => (
                  <Link
                    key={muni.id}
                    href={`/regions/${pref.slug}/${muni.slug}`}
                    style={{
                      fontSize: "0.85rem",
                      padding: "0.3rem 0.7rem",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--border)",
                      color: "var(--text-main)",
                    }}
                  >
                    {muni.name}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
