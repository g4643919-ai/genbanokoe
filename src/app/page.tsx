import Link from "next/link";
import { prisma } from "@/lib/db";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    tab?: string;
    category?: string;
    field?: string;
    postType?: string;
  }>;
}

function getExperienceLabel(years: number) {
  if (years === 0) return "1年未満";
  if (years === 2) return "1〜3年";
  if (years === 4) return "4〜10年";
  if (years === 15) return "11〜20年";
  if (years === 22) return "21年以上";
  return `${years}年`;
}

export default async function HomePage({ searchParams }: PageProps) {
  const { tab, category, field, postType } = await searchParams;

  const activeTab = tab || "newest";
  const selectedCategoryId = category ? parseInt(category, 10) : undefined;
  const activeFieldSlug = field || "";
  const activePostType = postType || "";

  // Fetch fields & categories
  const [fields, categories] = await Promise.all([
    prisma.field.findMany({ orderBy: { id: "asc" } }),
    prisma.category.findMany({ orderBy: { displayOrder: "asc" } }),
  ]);

  // Find active field ID if selected
  const activeField = fields.find((f) => f.slug === activeFieldSlug);

  // Fetch post records with filters
  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      categoryId: selectedCategoryId ? selectedCategoryId : undefined,
      fieldId: activeField ? activeField.id : undefined,
      postType: activePostType ? activePostType : undefined,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: true,
      field: true,
      prefecture: true,
      municipality: true,
      occupation: true,
      reactions: {
        where: {
          type: "SAME_WORKPLACE",
        },
      },
    },
  });

  let sortedPosts = [...posts];
  if (activeTab === "popular") {
    sortedPosts.sort((a, b) => b.reactions.length - a.reactions.length);
  }

  return (
    <div className="container">
      {/* Hero Banner */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>あなたの声が、現場を変える。</h1>
        <p className={styles.heroSubtitle}>
          介護・福祉現場の課題と実態データを集計・可視化するデータプラットフォーム
        </p>
      </section>

      {/* Field Filter Bar (高齢者介護 / 障害福祉 / その他) */}
      <div className={styles.fieldFilterScroller}>
        <Link
          href={{
            pathname: "/",
            query: {
              ...(selectedCategoryId ? { category: selectedCategoryId } : {}),
              ...(activePostType ? { postType: activePostType } : {}),
              tab: activeTab,
            },
          }}
          className={`${styles.fieldFilterBtn} ${!activeFieldSlug ? styles.active : ""}`}
        >
          全分野
        </Link>
        {fields.map((f) => (
          <Link
            key={f.id}
            href={{
              pathname: "/",
              query: {
                field: f.slug,
                ...(selectedCategoryId ? { category: selectedCategoryId } : {}),
                ...(activePostType ? { postType: activePostType } : {}),
                tab: activeTab,
              },
            }}
            className={`${styles.fieldFilterBtn} ${activeFieldSlug === f.slug ? styles.active : ""}`}
          >
            {f.name}
          </Link>
        ))}
      </div>

      {/* Post Type Selector (すべて / 課題 / 改善・成功事例) */}
      <div className={styles.typeFilterGroup}>
        <Link
          href={{
            pathname: "/",
            query: {
              ...(activeFieldSlug ? { field: activeFieldSlug } : {}),
              ...(selectedCategoryId ? { category: selectedCategoryId } : {}),
              tab: activeTab,
            },
          }}
          className={`${styles.typeFilterBtn} ${!activePostType ? styles.active : ""}`}
        >
          すべての投稿
        </Link>
        <Link
          href={{
            pathname: "/",
            query: {
              postType: "ISSUE",
              ...(activeFieldSlug ? { field: activeFieldSlug } : {}),
              ...(selectedCategoryId ? { category: selectedCategoryId } : {}),
              tab: activeTab,
            },
          }}
          className={`${styles.typeFilterBtn} ${activePostType === "ISSUE" ? styles.active : ""}`}
        >
          🚨 現場の課題
        </Link>
        <Link
          href={{
            pathname: "/",
            query: {
              postType: "SUCCESS_STORY",
              ...(activeFieldSlug ? { field: activeFieldSlug } : {}),
              ...(selectedCategoryId ? { category: selectedCategoryId } : {}),
              tab: activeTab,
            },
          }}
          className={`${styles.typeFilterBtn} ${activePostType === "SUCCESS_STORY" ? styles.active : ""}`}
        >
          💡 改善・成功事例
        </Link>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <Link
          href={{
            pathname: "/",
            query: {
              ...(activeFieldSlug ? { field: activeFieldSlug } : {}),
              ...(activePostType ? { postType: activePostType } : {}),
              ...(selectedCategoryId ? { category: selectedCategoryId } : {}),
              tab: "newest",
            },
          }}
          className={`${styles.tab} ${activeTab === "newest" ? styles.active : ""}`}
        >
          新着投稿
        </Link>
        <Link
          href={{
            pathname: "/",
            query: {
              ...(activeFieldSlug ? { field: activeFieldSlug } : {}),
              ...(activePostType ? { postType: activePostType } : {}),
              ...(selectedCategoryId ? { category: selectedCategoryId } : {}),
              tab: "popular",
            },
          }}
          className={`${styles.tab} ${activeTab === "popular" ? styles.active : ""}`}
        >
          共感が多い投稿
        </Link>
      </div>

      {/* Categories Horizonal Scroller */}
      <div className={styles.categoryScroller}>
        <Link
          href={{
            pathname: "/",
            query: {
              ...(activeFieldSlug ? { field: activeFieldSlug } : {}),
              ...(activePostType ? { postType: activePostType } : {}),
              tab: activeTab,
            },
          }}
          className={`${styles.categoryBtn} ${!selectedCategoryId ? styles.active : ""}`}
        >
          すべて
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={{
              pathname: "/",
              query: {
                category: cat.id,
                ...(activeFieldSlug ? { field: activeFieldSlug } : {}),
                ...(activePostType ? { postType: activePostType } : {}),
                tab: activeTab,
              },
            }}
            className={`${styles.categoryBtn} ${selectedCategoryId === cat.id ? styles.active : ""}`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Post List Feed */}
      <div className="posts-feed">
        {sortedPosts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📭</div>
            <p>該当する投稿がまだありません。</p>
            <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
              あなたの現場の声を最初の1歩として投稿してみませんか？
            </p>
          </div>
        ) : (
          sortedPosts.map((post) => {
            const sameWorkplaceCount = post.reactions.length;
            const locationName = post.prefecture
              ? `${post.prefecture.name}${post.municipality ? ` ${post.municipality.name}` : ""}`
              : post.posterPrefecture;

            return (
              <article key={post.id} className="post-card">
                <Link href={`/posts/${post.id}`}>
                  <div className={styles.postCardHeader}>
                    <div>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.1rem 0.4rem",
                          borderRadius: "4px",
                          fontWeight: 700,
                          marginRight: "0.4rem",
                          backgroundColor:
                            post.postType === "SUCCESS_STORY" ? "#e8f5e9" : "#ffebee",
                          color: post.postType === "SUCCESS_STORY" ? "#2e7d32" : "#c62828",
                        }}
                      >
                        {post.postType === "SUCCESS_STORY" ? "💡 成功事例" : "🚨 課題"}
                      </span>
                      <span className={styles.categoryBadge}>{post.category.name}</span>
                    </div>
                    <span className={styles.prefecture}>📍 {locationName}</span>
                  </div>

                  <h3 className={styles.postCardTitle}>{post.title}</h3>
                  <p className={styles.postCardExcerpt}>{post.content}</p>

                  <div className={styles.postCardFooter}>
                    <div className={styles.posterMeta}>
                      <span>
                        👤 {post.posterType === "ANONYMOUS" ? "匿名さん" : "ニックネーム"}
                      </span>
                      <span className={styles.experienceLabel}>
                        {post.occupation ? post.occupation.name : post.posterOccupation} (
                        {getExperienceLabel(post.posterExperienceYears)})
                      </span>
                    </div>

                    <div className={styles.reactionsCount}>
                      {sameWorkplaceCount > 0 && (
                        <span className={styles.reactionIndicator}>
                          💬 同じ現場 {sameWorkplaceCount}人
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
