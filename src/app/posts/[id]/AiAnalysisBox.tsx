"use client";

import { useState } from "react";
import styles from "./page.module.css";

interface AiAnalysisBoxProps {
  categoryName: string;
}

export default function AiAnalysisBox({ categoryName }: AiAnalysisBoxProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Generate contextual mock AI analysis based on the category name
  const getMockAnalysis = (category: string) => {
    switch (category) {
      case "人手不足":
        return {
          summary: "人員配置の基準を下回るか、ギリギリでの運営による突発的な業務負担の偏り。",
          cause: "他業種と比べた賃金の乖離や夜勤負担感による離職の悪循環、採用力不足。",
          suggestions: "資格取得支援によるキャリアパスの明確化、業務外タスク（掃除・リネン交換等）のアウトソーシング、ICTによる業務効率化。"
        };
      case "給与・待遇":
        return {
          summary: "現場の責任の重さや夜勤の負担に対して、基本給や手当が低くモチベーションが維持しにくい状態。",
          cause: "介護報酬制度に基づく施設収益の限界と、手当配分における管理者層との認識乖離。",
          suggestions: "特定処遇改善加算の配分ルールの透明化、スキルや資格に基づいた資格手当の段階的引き上げ。"
        };
      case "夜勤":
        return {
          summary: "夜勤回数の過多や、ワンオペ（または少数）時における緊急対応への心理的プレッシャーの集中。",
          cause: "夜間専門職員の不足、見守りシステム未導入による巡回回数の多さ、夜勤明け休日の確保不足。",
          suggestions: "見守りセンサー・インカムの導入による巡回削減と情報共有の円滑化、夜勤明け翌日の確実な公休義務化。"
        };
      case "介護記録":
      case "ICT・DX":
        return {
          summary: "手書き記録の重複や転記作業による書類作成時間の肥大化、それによる直接ケア時間の圧迫。",
          cause: "既存の手書き運用への固執、デジタルツールの操作に対する職員の不安感、導入初期コストの壁。",
          suggestions: "音声入力対応の介護記録アプリの導入、段階的なデジタル移行期間の設置と操作勉強会の開催。"
        };
      case "職場の人間関係":
        return {
          summary: "多職種（看護・リハ等）間やキャリアの違いによるケア方針の不一致、指導方法のすれ違い。",
          cause: "定期的な意見交換の場（カンファレンス等）の形骸化、指導担当者のコーチングスキル不足。",
          suggestions: "1on1ミーティングの導入、多職種連携を前提とした業務プロセスの可視化と相互理解研修。"
        };
      default:
        return {
          summary: `「${category}」カテゴリにおける、現場の属人的な業務進行と改善意欲の滞留。`,
          cause: "日々の業務追われにより、問題点を顕在化させて仕組みから改善する仕組みが構築されていないこと。",
          suggestions: "現場の声を集めて業務改善委員会などで小さく改善する仕組み（カイゼン提案制度）の立ち上げ。"
        };
    }
  };

  const analysis = getMockAnalysis(categoryName);

  return (
    <div className={styles.aiAnalysisBox}>
      <div className={styles.aiHeader} onClick={() => setIsOpen(!isOpen)}>
        <div className={styles.aiTitle}>
          <span>🤖 AIによる整理（参考情報）</span>
          <span className={styles.aiBadge}>実験的機能</span>
        </div>
        <div>{isOpen ? "▲ 閉じる" : "▼ 開く"}</div>
      </div>

      {isOpen && (
        <div className={styles.aiContent}>
          <p className={styles.aiNote}>
            ※この項目はAIによって投稿内容を分析・要約した参考情報であり、事実を断定するものではありません。
          </p>

          <div className={styles.aiSection}>
            <div className={styles.aiSectionTitle}>【問題点】</div>
            <div className={styles.aiSectionBody}>{analysis.summary}</div>
          </div>

          <div className={styles.aiSection}>
            <div className={styles.aiSectionTitle}>【根本原因（推測）】</div>
            <div className={styles.aiSectionBody}>{analysis.cause}</div>
          </div>

          <div className={styles.aiSection}>
            <div className={styles.aiSectionTitle}>【現場からの改善案・提案】</div>
            <div className={styles.aiSectionBody}>{analysis.suggestions}</div>
          </div>
        </div>
      )}
    </div>
  );
}
