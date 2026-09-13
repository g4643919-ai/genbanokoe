import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    prefectureSlug: string;
  }>;
}

export default async function PrefectureDashboardPage({ params }: PageProps) {
  const { prefectureSlug } = await params;

  const prefecture = await prisma.prefecture.findUnique({
    where: { slug: prefectureSlug },
    include: {
      municipalities: true,
      posts: {
        where: { status: "PUBLISHED" },
        include: {
          category: true,
          field: true,
          municipality: true,
          occupation: true,
          reactions: {
            where: { type: "SAME_WORKPLACE" },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!prefecture) {
    notFound();
  }

  const totalPosts = prefecture.posts.length;
  const totalSameWorkplace = prefecture.posts.reduce(
    (acc, post) => acc + post.reactions.length,
    0
  );

  // Field breakdown
  const elderlyCount = prefecture.posts.filter((p) => p.field?.slug === "elderly").length;
  const disabilityCount = prefecture.posts.filter((p) => p.field?.slug === "disability").length;

  return (
    <div className="container">
      {/* Breadcrumb */}
      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
        <Link href="/regions">地域一覧</Link> &gt; {prefecture.name} ダッシュボード
      </div>

      {/* Header Banner */}
      <div
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "1.5rem",
          boxShadow: "var(--shadow-sm)",
          marginBottom: "1.5rem",
        }}
      >
        <h1 style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--primary)" }}>
          📍 {prefecture.name} 現場課題ダッシュボード
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
          {prefecture.name}内の介護・福祉現場から集まった実態データと課題一覧
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0.8rem",
            marginTop: "1.2rem",
            textAlign: "center",
          }}
        >
          <div style={{ backgroundColor: "var(--background)", padding: "0.8rem", borderRadius: "var(--radius-sm)" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--primary)" }}>{totalPosts}件</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>総課題数</div>
          </div>
          <div style={{ backgroundColor: "var(--background)", padding: "0.8rem", borderRadius: "var(--radius-sm)" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--secondary-hover)" }}>
              {totalSameWorkplace}人
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>同じ現場回答</div>
          </div>
          <div style={{ backgroundColor: "var(--background)", padding: "0.8rem", borderRadius: "var(--radius-sm)" }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
              高齢 {elderlyCount} / 障害 {disabilityCount}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>分野別内訳</div>
          </div>
        </div>
      </div>

      {/* Municipalities Filter Bar */}
      <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "0.6rem" }}>
        市区町村で絞り込む
      </h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {prefecture.municipalities.map((muni) => (
          <Link
            key={muni.id}
            href={`/regions/${prefecture.slug}/${muni.slug}`}
            style={{
              padding: "0.4rem 0.8rem",
              borderRadius: "20px",
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "var(--text-main)",
            }}
          >
            {muni.name}
          </Link>
        ))}
      </div>

      {/* Post List */}
      <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "1rem" }}>
        {prefecture.name}の現場の声一覧 ({prefecture.posts.length}件)
      </h3>

      {prefecture.posts.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          現在、{prefecture.name}の投稿はまだ登録されていません。
        </p>
      ) : (
        prefecture.posts.map((post) => (
          <article key={post.id} className="post-card">
            <Link href={`/posts/${post.id}`}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                <div>
                  <span className="categoryBadge">{post.category.name}</span>
                  {post.municipality && (
                    <span style={{ marginLeft: "0.4rem", fontWeight: 700, color: "var(--primary)" }}>
                      {post.municipality.name}
                    </span>
                  )}
                </div>
                <span style={{ color: "var(--secondary-hover)", fontWeight: 700 }}>
                  💬 同じ現場 {post.reactions.length}人
                </span>
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.4rem" }}>{post.title}</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{post.content}</p>
            </Link>
          </article>
        ))
      )}
    </div>
  );
}
