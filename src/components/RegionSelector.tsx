"use client";

import React, { useState, useEffect } from "react";

interface Municipality {
  id: number;
  name: string;
}

interface Prefecture {
  id: number;
  name: string;
  municipalities: Municipality[];
}

interface RegionSelectorProps {
  prefectures: Prefecture[];
  defaultPrefectureId?: number | null;
  defaultMunicipalityId?: number | null;
  onPrefectureChange?: (id: number | null) => void;
  onMunicipalityChange?: (id: number | null) => void;
  required?: boolean;
}

export default function RegionSelector({
  prefectures,
  defaultPrefectureId,
  defaultMunicipalityId,
  onPrefectureChange,
  onMunicipalityChange,
  required = false,
}: RegionSelectorProps) {
  const [selectedPrefId, setSelectedPrefId] = useState<number | null>(
    defaultPrefectureId || null
  );
  const [selectedMuniId, setSelectedMuniId] = useState<number | null>(
    defaultMunicipalityId || null
  );

  useEffect(() => {
    if (defaultPrefectureId !== undefined) setSelectedPrefId(defaultPrefectureId);
    if (defaultMunicipalityId !== undefined) setSelectedMuniId(defaultMunicipalityId);
  }, [defaultPrefectureId, defaultMunicipalityId]);

  const activePref = prefectures.find((p) => p.id === selectedPrefId);
  const availableMunicipalities = activePref ? activePref.municipalities : [];

  const handlePrefChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value ? parseInt(e.target.value, 10) : null;
    setSelectedPrefId(val);
    setSelectedMuniId(null);
    if (onPrefectureChange) onPrefectureChange(val);
    if (onMunicipalityChange) onMunicipalityChange(null);
  };

  const handleMuniChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value ? parseInt(e.target.value, 10) : null;
    setSelectedMuniId(val);
    if (onMunicipalityChange) onMunicipalityChange(val);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
      <div>
        <label style={{ display: "block", fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.4rem" }}>
          都道府県{required && <span style={{ color: "#e8823a", marginLeft: "0.3rem" }}>必須</span>}
        </label>
        <select
          name="prefectureId"
          value={selectedPrefId || ""}
          onChange={handlePrefChange}
          required={required}
        >
          <option value="">都道府県を選択</option>
          {prefectures.map((pref) => (
            <option key={pref.id} value={pref.id}>
              {pref.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ display: "block", fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.4rem" }}>
          市区町村
        </label>
        <select
          name="municipalityId"
          value={selectedMuniId || ""}
          onChange={handleMuniChange}
          disabled={!selectedPrefId || availableMunicipalities.length === 0}
        >
          <option value="">
            {!selectedPrefId ? "都道府県を先に選択" : "市区町村を選択 (任意)"}
          </option>
          {availableMunicipalities.map((muni) => (
            <option key={muni.id} value={muni.id}>
              {muni.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
