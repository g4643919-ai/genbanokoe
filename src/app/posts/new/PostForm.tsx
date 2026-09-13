"use client";

import React, { useActionState, useState, useEffect } from "react";
import { createPost } from "../actions";
import RegionSelector from "@/components/RegionSelector";
import styles from "./page.module.css";

interface CategoryMaster {
  id: number;
  name: string;
}

interface Municipality {
  id: number;
  name: string;
}

interface Prefecture {
  id: number;
  name: string;
  municipalities: Municipality[];
}

interface PostFormProps {
  categories: CategoryMaster[];
  prefectures: Prefecture[];
  fields: CategoryMaster[];
  occupations: CategoryMaster[];
  serviceTypes: CategoryMaster[];
}

export default function PostForm({
  categories,
  prefectures,
  fields,
  occupations,
  serviceTypes,
}: PostFormProps) {
  const [state, formAction, isPending] = useActionState(createPost, null);

  // Form State
  const [postType, setPostType] = useState<"ISSUE" | "SUCCESS_STORY">("ISSUE");
  const [prefectureId, setPrefectureId] = useState<number | null>(null);
  const [municipalityId, setMunicipalityId] = useState<number | null>(null);
  const [fieldId, setFieldId] = useState<number | null>(null);
  const [occupationId, setOccupationId] = useState<number | null>(null);
  const [serviceTypeId, setServiceTypeId] = useState<number | null>(null);
  const [experienceYears, setExperienceYears] = useState<number>(2);

  // Objective data accordion toggle
  const [showObjectiveData, setShowObjectiveData] = useState(false);

  // Privacy Warning Modal
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  // Auto-fill from localStorage user profile on mount
  useEffect(() => {
    const saved = localStorage.getItem("genba_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.prefectureId) setPrefectureId(parsed.prefectureId);
        if (parsed.municipalityId) setMunicipalityId(parsed.municipalityId);
        if (parsed.fieldId) setFieldId(parsed.fieldId);
        if (parsed.occupationId) setOccupationId(parsed.occupationId);
        if (parsed.serviceTypeId) setServiceTypeId(parsed.serviceTypeId);
        if (parsed.experienceYears !== undefined) setExperienceYears(parsed.experienceYears);
      } catch (err) {
        console.error("Failed to load profile for post form:", err);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    // Detect potential facility/person name triggers
    const institutionPattern = /(施設|病院|クリニック|ホーム|介護園|ケアセンター|デイサービス|グループホーム|サ高住|特養|老健)[\s\S]*?(で|にて|の|が|において)/i;
    const namePattern = /[A-ZＡ-Ｚ亜-熙ぁ-んァ-ヶ]{2,5}(さん|様|氏)/;

    let warning = "";
    if (institutionPattern.test(content) || institutionPattern.test(title)) {
      warning += "⚠️ 特定の施設名、企業名、または病院名らしき記述が検出されました。";
    }
    if (namePattern.test(content)) {
      if (warning) warning += "\n\n";
      warning += "⚠️ 「〇〇さん」のような個人特定につながる表記が検出されました。";
    }

    if (warning) {
      setWarningMessage(
        `${warning}\n\n個人や施設が特定される情報を投稿すると、トラブルやプライバシー侵害の原因になる場合があります。個人名や施設名が含まれていないか、今一度ご確認ください。\n\n本当にこのまま投稿しますか？`
      );
      setPendingFormData(formData);
      setShowWarningModal(true);
    } else {
      formAction(formData);
    }
  };

  const handleConfirmSubmit = () => {
    if (pendingFormData) {
      formAction(pendingFormData);
    }
    setShowWarningModal(false);
    setPendingFormData(null);
  };

  const experienceOptions = [
    { label: "1年未満", value: "0" },
    { label: "1〜3年", value: "2" },
    { label: "4〜10年", value: "7" },
    { label: "11〜20年", value: "15" },
    { label: "21年以上", value: "22" },
  ];

  return (
    <div className={styles.formCard}>
      {/* Post Type Selector (Issue vs Success Story) */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button
          type="button"
          onClick={() => setPostType("ISSUE")}
          style={{
            flex: 1,
            padding: "0.8rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--primary)",
            backgroundColor: postType === "ISSUE" ? "var(--primary)" : "var(--surface)",
            color: postType === "ISSUE" ? "var(--surface)" : "var(--primary)",
            fontWeight: 800,
            fontSize: "0.95rem",
          }}
        >
          🚨 現場の課題を投稿する
        </button>
        <button
          type="button"
          onClick={() => setPostType("SUCCESS_STORY")}
          style={{
            flex: 1,
            padding: "0.8rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--secondary)",
            backgroundColor: postType === "SUCCESS_STORY" ? "var(--secondary)" : "var(--surface)",
            color: postType === "SUCCESS_STORY" ? "var(--surface)" : "var(--secondary-hover)",
            fontWeight: 800,
            fontSize: "0.95rem",
          }}
        >
          💡 改善・成功事例を投稿する
        </button>
      </div>

      <h2 className={styles.title}>
        {postType === "ISSUE" ? "現場の課題を投稿する" : "改善・成功事例を投稿する"}
      </h2>

      {state?.error && <div className={styles.errorMessage}>{state.error}</div>}

      <form onSubmit={handleSubmit}>
        <input type="hidden" name="postType" value={postType} />

        {/* 匿名 / ニックネーム */}
        <div className={styles.field}>
          <span className={styles.label}>投稿名義</span>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="posterType"
                value="ANONYMOUS"
                defaultChecked
                className={styles.radioInput}
              />
              匿名で投稿
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="posterType"
                value="NICKNAME"
                className={styles.radioInput}
              />
              ニックネームで投稿
            </label>
          </div>
        </div>

        {/* 分野 ＆ カテゴリ */}
        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor="fieldId" className={styles.label}>
              分野
            </label>
            <select
              name="fieldId"
              id="fieldId"
              value={fieldId || ""}
              onChange={(e) => setFieldId(e.target.value ? parseInt(e.target.value, 10) : null)}
            >
              <option value="">分野を選択</option>
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="categoryId" className={styles.label}>
              課題カテゴリ<span className={styles.required}>必須</span>
            </label>
            <select name="categoryId" id="categoryId" defaultValue="" required>
              <option value="" disabled>
                カテゴリを選択
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 地域 (都道府県 × 市区町村) */}
        <div className={styles.field}>
          <RegionSelector
            prefectures={prefectures}
            defaultPrefectureId={prefectureId}
            defaultMunicipalityId={municipalityId}
            onPrefectureChange={setPrefectureId}
            onMunicipalityChange={setMunicipalityId}
            required
          />
        </div>

        {/* 職種 ＆ サービス種別 */}
        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor="occupationId" className={styles.label}>
              職種
            </label>
            <select
              name="occupationId"
              id="occupationId"
              value={occupationId || ""}
              onChange={(e) => setOccupationId(e.target.value ? parseInt(e.target.value, 10) : null)}
            >
              <option value="">職種を選択</option>
              {occupations.map((occ) => (
                <option key={occ.id} value={occ.id}>
                  {occ.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="serviceTypeId" className={styles.label}>
              勤務・サービス種別
            </label>
            <select
              name="serviceTypeId"
              id="serviceTypeId"
              value={serviceTypeId || ""}
              onChange={(e) => setServiceTypeId(e.target.value ? parseInt(e.target.value, 10) : null)}
            >
              <option value="">サービス種別を選択</option>
              {serviceTypes.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 経験年数 */}
        <div className={styles.field}>
          <label htmlFor="posterExperienceYears" className={styles.label}>
            経験年数
          </label>
          <select
            name="posterExperienceYears"
            id="posterExperienceYears"
            value={experienceYears}
            onChange={(e) => setExperienceYears(parseInt(e.target.value, 10))}
          >
            {experienceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* タイトル */}
        <div className={styles.field}>
          <label htmlFor="title" className={styles.label}>
            タイトル<span className={styles.required}>必須</span>
          </label>
          <p className={styles.description}>
            {postType === "ISSUE"
              ? "何に関する問題か、要点を簡潔に教えてください"
              : "どのような改善・成功事例かタイトルを教えてください"}
          </p>
          <input
            type="text"
            id="title"
            name="title"
            placeholder={
              postType === "ISSUE"
                ? "例：夜勤明けの記録業務と手書き転記の負担"
                : "例：記録アプリ導入で残業時間を月10時間削減"
            }
            required
          />
        </div>

        {/* 本文 */}
        <div className={styles.field}>
          <label htmlFor="content" className={styles.label}>
            本文<span className={styles.required}>必須</span>
          </label>
          <p className={styles.description}>
            具体的なエピソードや現場の実情について教えてください（施設名や個人名は伏せてご記入ください）。
          </p>
          <textarea
            id="content"
            name="content"
            placeholder="ここに内容を入力してください..."
            className={styles.textarea}
            required
          ></textarea>
        </div>

        {/* 属性・頻度・緊急度 (課題投稿の場合) */}
        {postType === "ISSUE" && (
          <div className={styles.grid}>
            <div className={styles.field}>
              <label htmlFor="frequency" className={styles.label}>
                発生頻度
              </label>
              <select name="frequency" id="frequency" defaultValue="">
                <option value="">発生頻度を選択 (任意)</option>
                <option value="DAILY">毎日発生している</option>
                <option value="WEEKLY">週に数回発生している</option>
                <option value="MONTHLY">月に数回発生している</option>
                <option value="RARELY">たまに発生する</option>
                <option value="UNKNOWN">不明・その他</option>
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="urgency" className={styles.label}>
                緊急度
              </label>
              <select name="urgency" id="urgency" defaultValue="">
                <option value="">緊急度を選択 (任意)</option>
                <option value="LOW">低 (中長期的課題)</option>
                <option value="MEDIUM">中 (早めの対策が望ましい)</option>
                <option value="HIGH">高 (切実な問題)</option>
                <option value="CRITICAL">非常に高い (即時介入が必要)</option>
              </select>
            </div>
          </div>
        )}

        {/* 現場からの改善案 (自由記述) */}
        <div className={styles.field}>
          <label htmlFor="improvementProposal" className={styles.label}>
            現場からの改善提案 (任意)
          </label>
          <p className={styles.description}>
            「こうしたらもっと良くなる」という具体的なアイデアがあればご記入ください。
          </p>
          <textarea
            id="improvementProposal"
            name="improvementProposal"
            placeholder="例：手書き転記の廃止、共通フォーマットのデジタル化、1on1勉強会の開催など"
            rows={2}
          ></textarea>
        </div>

        {/* 客観データ (任意) アコーディオン */}
        <div
          style={{
            backgroundColor: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            onClick={() => setShowObjectiveData(!showObjectiveData)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "0.95rem",
              color: "var(--primary-hover)",
            }}
          >
            <span>📊 客観的データを入力する (任意)</span>
            <span>{showObjectiveData ? "▲ 閉じる" : "▼ 開く"}</span>
          </div>

          {showObjectiveData && (
            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px dashed var(--border)" }}>
              <p className={styles.description} style={{ marginBottom: "1rem" }}>
                回答可能な数値のみご入力ください。集計データの精度向上に役立てられます。
              </p>
              <div className={styles.grid}>
                <div className={styles.field}>
                  <label htmlFor="nightShiftCount" className={styles.label} style={{ fontSize: "0.85rem" }}>
                    月の夜勤回数 (回)
                  </label>
                  <input type="number" id="nightShiftCount" name="nightShiftCount" min="0" placeholder="例: 5" />
                </div>
                <div className={styles.field}>
                  <label htmlFor="nightShiftHours" className={styles.label} style={{ fontSize: "0.85rem" }}>
                    1回の夜勤時間 (時間)
                  </label>
                  <input type="number" id="nightShiftHours" name="nightShiftHours" min="0" placeholder="例: 16" />
                </div>
                <div className={styles.field}>
                  <label htmlFor="nightShiftStaff" className={styles.label} style={{ fontSize: "0.85rem" }}>
                    夜勤時の配置人数 (人)
                  </label>
                  <input type="number" id="nightShiftStaff" name="nightShiftStaff" min="0" placeholder="例: 2" />
                </div>
                <div className={styles.field}>
                  <label htmlFor="assignedResidents" className={styles.label} style={{ fontSize: "0.85rem" }}>
                    担当利用者数 (人)
                  </label>
                  <input type="number" id="assignedResidents" name="assignedResidents" min="0" placeholder="例: 30" />
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="overtimeHours" className={styles.label} style={{ fontSize: "0.85rem" }}>
                  残業時間 (月時間または夜勤明け残業)
                </label>
                <input type="number" id="overtimeHours" name="overtimeHours" min="0" placeholder="例: 10" />
              </div>
            </div>
          )}
        </div>

        {/* 送信ボタン */}
        <button type="submit" className={styles.submitBtn} disabled={isPending}>
          {isPending
            ? "送信中..."
            : postType === "ISSUE"
            ? "現場の課題を投稿する"
            : "改善・成功事例を投稿する"}
        </button>
      </form>

      {/* 警告モーダル */}
      {showWarningModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>⚠️ 個人・施設情報の確認</h3>
            <div className={styles.modalBody}>{warningMessage}</div>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => {
                  setShowWarningModal(false);
                  setPendingFormData(null);
                }}
              >
                戻って修正する
              </button>
              <button
                type="button"
                className={styles.modalConfirmBtn}
                onClick={handleConfirmSubmit}
              >
                このまま投稿する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
