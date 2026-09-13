import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ReportsIndexPage() {
  const prefectures = await prisma.prefecture.findMany({
    include: {
      posts: {
        where: { status: "PUBLISHED", postType: "ISSUE" },
        include: {
          category: true,
          field: true,
          reactions: { where: { type: "SAME_WORKPLACE" } },
        },
      },
    },
  });

  return (
    <div className="container">
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--primary)" }}>
          📊 地域課題レポート ＆ 現場からの提言データ
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
          現場から蓄積された声と実態データに基づく中立的な課題整理・分析レポート
        </p>
      </div>

      <div style={{ display: "grid", gap: "1.25rem" }}>
        {/* National Policy Proposal Card */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "2px solid var(--primary)",
            borderRadius: "var(--radius-lg)",
            padding: "1.5rem",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.6rem",
            }}
          >
            <span
              style={{
                backgroundColor: "var(--primary-light)",
                color: "var(--primary)",
                padding: "0.2rem 0.6rem",
                borderRadius: "var(--radius-sm)",
                fontWeight: 800,
                fontSize: "0.75rem",
              }}
            >
              🏛️ 全国政策提言データ
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              自動集計レポート
            </span>
          </div>

          <h3 style={{ fontSize: "1.2rem", fontWeight: 900, marginBottom: "0.5rem" }}>
            介護記録業務のデジタル化と入力項目削減に関する現場提案
          </h3>
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--text-muted)",
              lineHeight: 1.6,
              marginBottom: "1rem",
            }}
          >
            全国の介護福祉士・現場スタッフから寄せられた手書き記録の二重負担に関する声と、現場から提出された具体的な改善アイデアのまとめ。
          </p>

          <div
            style={{
              backgroundColor: "var(--background)",
              padding: "0.8rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.85rem",
              lineHeight: 1.6,
              marginBottom: "1rem",
            }}
          >
            <strong>【現場からの主要な提案】</strong>
            <ul style={{ paddingLeft: "1.2rem", marginTop: "0.3rem" }}>
              <li>手書き日誌と介護ソフトの二重転記の全廃</li>
              <li>音声入力アプリ導入のための補助要件の緩和</li>
              <li>自治体提出用フォーマットの統一化と標準化</li>
            </ul>
          </div>
        </div>

        {/* Regional Reports List */}
        <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginTop: "1rem" }}>
          地域別・自治体課題レポート一覧
        </h3>

        {prefectures.map((pref) => {
          const issueCount = pref.posts.length;
          const sameWorkplaceTotal = pref.posts.reduce(
            (acc, p) => acc + p.reactions.length,
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
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h4 style={{ fontSize: "1.1rem", fontWeight: 800 }}>
                  📍 {pref.name} 介護・福祉現場課題レポート
                </h4>
                {issueCount < 5 && (
                  <span
                    style={{
                      fontSize: "0.7rem",
                      backgroundColor: "#fff3e0",
                      color: "#e65100",
                      padding: "0.1rem 0.4rem",
                      borderRadius: "4px",
                    }}
                  >
                    ※サンプル数少 (参考値)
                  </span>
                )}
              </div>

              <div
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  margin: "0.5rem 0",
                }}
              >
                回答データ: {issueCount}件 ｜ 「同じ現場」共感合計: {sameWorkplaceTotal}人
              </div>

              <Link
                href={`/regions/${pref.slug}`}
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "var(--primary-hover)",
                }}
              >
                詳細データを閲覧する →
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
