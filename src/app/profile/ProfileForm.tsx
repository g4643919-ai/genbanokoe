"use client";

import React, { useState, useEffect } from "react";
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

interface ProfileFormProps {
  prefectures: Prefecture[];
  fields: CategoryMaster[];
  occupations: CategoryMaster[];
  serviceTypes: CategoryMaster[];
}

export default function ProfileForm({
  prefectures,
  fields,
  occupations,
  serviceTypes,
}: ProfileFormProps) {
  const [nickname, setNickname] = useState("");
  const [prefectureId, setPrefectureId] = useState<number | null>(null);
  const [municipalityId, setMunicipalityId] = useState<number | null>(null);
  const [fieldId, setFieldId] = useState<number | null>(null);
  const [occupationId, setOccupationId] = useState<number | null>(null);
  const [serviceTypeId, setServiceTypeId] = useState<number | null>(null);
  const [experienceYears, setExperienceYears] = useState<number>(2);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    // Load from localStorage if present
    const saved = localStorage.getItem("genba_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.nickname) setNickname(parsed.nickname);
        if (parsed.prefectureId) setPrefectureId(parsed.prefectureId);
        if (parsed.municipalityId) setMunicipalityId(parsed.municipalityId);
        if (parsed.fieldId) setFieldId(parsed.fieldId);
        if (parsed.occupationId) setOccupationId(parsed.occupationId);
        if (parsed.serviceTypeId) setServiceTypeId(parsed.serviceTypeId);
        if (parsed.experienceYears !== undefined) setExperienceYears(parsed.experienceYears);
      } catch (err) {
        console.error("Failed to parse saved profile:", err);
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const prefObj = prefectures.find((p) => p.id === prefectureId);
    const occObj = occupations.find((o) => o.id === occupationId);

    const profileData = {
      nickname,
      prefectureId,
      prefectureName: prefObj ? prefObj.name : "",
      municipalityId,
      fieldId,
      occupationId,
      occupationName: occObj ? occObj.name : "",
      serviceTypeId,
      experienceYears,
    };

    localStorage.setItem("genba_profile", JSON.stringify(profileData));
    document.cookie = `genba_profile=${encodeURIComponent(JSON.stringify(profileData))}; path=/; max-age=31536000`;

    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 4000);
  };

  const experienceOptions = [
    { label: "1年未満", value: 0 },
    { label: "1〜3年", value: 2 },
    { label: "4〜10年", value: 7 },
    { label: "11〜20年", value: 15 },
    { label: "21年以上", value: 22 },
  ];

  return (
    <div className={styles.profileCard}>
      <h2 className={styles.title}>プロフィール・属性設定</h2>
      <p className={styles.description}>
        ご自身の職種や地域を設定しておくと、現場の声を投稿する際に自動的にプリセットされます（本名は原則公開されません）。
      </p>

      {savedMessage && (
        <div className={styles.successMessage}>
          ✓ プロフィールを保存しました。投稿作成時に自動的に適用されます。
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* ニックネーム */}
        <div className={styles.field}>
          <label htmlFor="nickname" className={styles.label}>
            ニックネーム (公開用)
          </label>
          <input
            type="text"
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="例: ケア太郎"
          />
        </div>

        {/* 地域選択 */}
        <div className={styles.field}>
          <RegionSelector
            prefectures={prefectures}
            defaultPrefectureId={prefectureId}
            defaultMunicipalityId={municipalityId}
            onPrefectureChange={setPrefectureId}
            onMunicipalityChange={setMunicipalityId}
          />
        </div>

        {/* 分野 */}
        <div className={styles.field}>
          <label htmlFor="fieldId" className={styles.label}>
            主な分野
          </label>
          <select
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

        {/* 職種 */}
        <div className={styles.field}>
          <label htmlFor="occupationId" className={styles.label}>
            職種
          </label>
          <select
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

        {/* 勤務・サービス種別 */}
        <div className={styles.field}>
          <label htmlFor="serviceTypeId" className={styles.label}>
            勤務・サービス種別
          </label>
          <select
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

        {/* 経験年数 */}
        <div className={styles.field}>
          <label htmlFor="experienceYears" className={styles.label}>
            経験年数
          </label>
          <select
            id="experienceYears"
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

        <button type="submit" className={styles.submitBtn}>
          プロフィールを保存する
        </button>
      </form>
    </div>
  );
}
