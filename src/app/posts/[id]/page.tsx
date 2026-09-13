import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import ReactionButtons from "./ReactionButtons";
import AiAnalysisBox from "./AiAnalysisBox";
import CommentForm from "./CommentForm";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

interface PostDetailPageProps {
  params: Promise<{
    id: string;
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

function getResolutionLabel(status: string) {
  switch (status) {
    case "UNDER_REVIEW":
      return { label: "検討中", className: styles.resUnderReview };
    case "IMPROVING":
      return { label: "改善中", className: styles.resImproving };
    case "RESOLVED":
      return { label: "改善済み", className: styles.resResolved };
    default:
      return { label: "未対応", className: styles.resUnhandled };
  }
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const postId = parseInt(id, 10);

  if (isNaN(postId)) {
    notFound();
  }

  const headerList = await headers();
  const userIp = headerList.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

  // Fetch post details with Ver.2 relations
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      category: true,
      field: true,
      prefecture: true,
      municipality: true,
      serviceType: true,
      occupation: true,
      objectiveData: true,
      reactions: true,
      comments: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  const resStatus = getResolutionLabel(post.resolutionStatus);
  const locationName = post.prefecture
    ? `${post.prefecture.name}${post.municipality ? ` ${post.municipality.name}` : ""}`
    : post.posterPrefecture;

  return (
    <div className="container">
      {/* Detail Card */}
      <article className={styles.detailCard}>
        <div className={styles.header}>
          <div>
            <span
              className={`${styles.typeBadge} ${
                post.postType === "SUCCESS_STORY"
                  ? styles.typeBadgeSuccess
                  : styles.typeBadgeIssue
              }`}
            >
              {post.postType === "SUCCESS_STORY" ? "💡 改善・成功事例" : "🚨 現場の課題"}
            </span>
            <span className={styles.categoryBadge}>{post.category.name}</span>
            {post.field && (
              <span
                className={styles.categoryBadge}
                style={{
                  backgroundColor: "var(--background)",
                  color: "var(--text-main)",
                  marginLeft: "0.4rem",
                }}
              >
                {post.field.name}
              </span>
            )}
          </div>

          <div className={styles.prefectureAndDate}>
            <span className={`${styles.resolutionBadge} ${resStatus.className}`}>
              {resStatus.label}
            </span>
          </div>
        </div>

        <h1 className={styles.title}>{post.title}</h1>

        <div
          style={{
            fontSize: "0.85rem",
            color: "var(--text-muted)",
            marginBottom: "1rem",
            display: "flex",
            gap: "1rem",
          }}
        >
          <span>📍 {locationName}</span>
          <span>📅 {new Date(post.createdAt).toLocaleDateString("ja-JP")}</span>
        </div>

        <div className={styles.content}>{post.content}</div>

        {/* 現場からの改善提案 (あれば表示) */}
        {post.improvementProposal && (
          <div className={styles.proposalBox}>
            <div className={styles.proposalTitle}>💡 現場からの改善提案</div>
            <div className={styles.proposalContent}>{post.improvementProposal}</div>
          </div>
        )}

        {/* 客観データ (存在すればグリッド表示) */}
        {post.objectiveData && (
          <div className={styles.objectiveGrid}>
            {post.objectiveData.nightShiftCount !== null && (
              <div className={styles.objectiveCard}>
                <div className={styles.objectiveValue}>
                  {post.objectiveData.nightShiftCount}回
                </div>
                <div className={styles.objectiveLabel}>月夜勤回数</div>
              </div>
            )}
            {post.objectiveData.nightShiftHours !== null && (
              <div className={styles.objectiveCard}>
                <div className={styles.objectiveValue}>
                  {post.objectiveData.nightShiftHours}h
                </div>
                <div className={styles.objectiveLabel}>1回夜勤時間</div>
              </div>
            )}
            {post.objectiveData.nightShiftStaff !== null && (
              <div className={styles.objectiveCard}>
                <div className={styles.objectiveValue}>
                  {post.objectiveData.nightShiftStaff}人
                </div>
                <div className={styles.objectiveLabel}>夜勤時配置</div>
              </div>
            )}
            {post.objectiveData.assignedResidents !== null && (
              <div className={styles.objectiveCard}>
                <div className={styles.objectiveValue}>
                  {post.objectiveData.assignedResidents}人
                </div>
                <div className={styles.objectiveLabel}>担当利用者</div>
              </div>
            )}
            {post.objectiveData.overtimeHours !== null && (
              <div className={styles.objectiveCard}>
                <div className={styles.objectiveValue}>
                  {post.objectiveData.overtimeHours}h
                </div>
                <div className={styles.objectiveLabel}>残業時間</div>
              </div>
            )}
          </div>
        )}

        <div className={styles.posterMeta}>
          <span className={styles.metaTag}>
            👤 {post.posterType === "ANONYMOUS" ? "匿名さん" : "ニックネーム"}
          </span>
          <span className={styles.metaTag}>
            💼 {post.occupation ? post.occupation.name : post.posterOccupation}
          </span>
          {post.serviceType && (
            <span className={styles.metaTag}>🏥 {post.serviceType.name}</span>
          )}
          <span className={styles.metaTag}>
            ⏳ 経験 {getExperienceLabel(post.posterExperienceYears)}
          </span>
        </div>
      </article>

      {/* Reactions Section */}
      <ReactionButtons
        postId={post.id}
        reactions={post.reactions}
        userIp={userIp}
      />

      {/* AI Analysis Accordion */}
      <AiAnalysisBox categoryName={post.category.name} />

      {/* Comments Section */}
      <section className={styles.commentsSection}>
        <h3 className={styles.commentsTitle}>
          現場のコメント ({post.comments.length})
        </h3>

        {post.comments.length === 0 ? (
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.9rem",
              padding: "1rem",
            }}
          >
            まだコメントはありません。現場の知恵や共感のコメントを投稿してみましょう。
          </p>
        ) : (
          post.comments.map((comment) => (
            <div key={comment.id} className={styles.commentCard}>
              <div className={styles.commentMeta}>
                <span>👤 匿名さん</span>
                <span>
                  {new Date(comment.createdAt).toLocaleDateString("ja-JP")}
                </span>
              </div>
              <p className={styles.commentContent}>{comment.content}</p>
            </div>
          ))
        )}

        <CommentForm postId={post.id} />
      </section>
    </div>
  );
}
