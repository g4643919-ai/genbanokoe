import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    prefectureSlug: string;
    municipalitySlug: string;
  }>;
  searchParams: Promise<{
    field?: string;
  }>;
}

export default async function MunicipalityDashboardPage({
  params,
  searchParams,
}: PageProps) {
  const { prefectureSlug, municipalitySlug } = await params;
  const { field } = await searchParams;

  const prefecture = await prisma.prefecture.findUnique({
    where: { slug: prefectureSlug },
  });

  if (!prefecture) {
    notFound();
  }

  const municipality = await prisma.municipality.findUnique({
    where: {
      prefectureId_slug: {
        prefectureId: prefecture.id,
        slug: municipalitySlug,
      },
    },
  });

  if (!municipality) {
    notFound();
  }

  const fields = await prisma.field.findMany({ orderBy: { id: "asc" } });
  const activeField = fields.find((f) => f.slug === field);

  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      prefectureId: prefecture.id,
      municipalityId: municipality.id,
      fieldId: activeField ? activeField.id : undefined,
    },
    include: {
      category: true,
      field: true,
      occupation: true,
      reactions: {
        where: { type: "SAME_WORKPLACE" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalPosts = posts.length;
  const totalSameWorkplace = posts.reduce((acc, p) => acc + p.reactions.length, 0);

  return (
    <div className="container">
      {/* Breadcrumb */}
      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
        <Link href="/regions">地域一覧</Link> &gt;{" "}
        <Link href={`/regions/${prefecture.slug}`}>{prefecture.name}</Link> &gt; {municipality.name}
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
        <h1 style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--primary)" }}>
          📍 {prefecture.name} {municipality.name} 現場課題ダッシュボード
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
          {municipality.name}における現場の声と集計データ
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.8rem",
            marginTop: "1rem",
            textAlign: "center",
          }}
        >
          <div style={{ backgroundColor: "var(--background)", padding: "0.8rem", borderRadius: "var(--radius-sm)" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--primary)" }}>{totalPosts}件</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>地域内課題数</div>
          </div>
          <div style={{ backgroundColor: "var(--background)", padding: "0.8rem", borderRadius: "var(--radius-sm)" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--secondary-hover)" }}>
              {totalSameWorkplace}人
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>同じ現場回答</div>
          </div>
        </div>
      </div>

      {/* Field Filter Tabs (高齢者介護 vs 障害福祉) */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <Link
          href={`/regions/${prefecture.slug}/${municipality.slug}`}
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
            href={`/regions/${prefecture.slug}/${municipality.slug}?field=${f.slug}`}
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

      {/* Post List */}
      <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "1rem" }}>
        {municipality.name}の現場課題一覧 ({posts.length}件)
      </h3>

      {posts.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          現在、{municipality.name}における該当分野の投稿はまだ登録されていません。
        </p>
      ) : (
        posts.map((post) => (
          <article key={post.id} className="post-card">
            <Link href={`/posts/${post.id}`}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                <div>
                  <span className="categoryBadge">{post.category.name}</span>
                  {post.field && (
                    <span style={{ marginLeft: "0.4rem", fontWeight: 700, color: "var(--text-muted)" }}>
                      {post.field.name}
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
