"use client";

import { useTransition } from "react";
import { updateResolutionStatus } from "./actions";

interface StatusSelectorProps {
  postId: number;
  currentStatus: string;
}

export default function StatusSelector({ postId, currentStatus }: StatusSelectorProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    startTransition(async () => {
      await updateResolutionStatus(postId, newStatus);
    });
  };

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      style={{
        padding: "0.3rem 0.6rem",
        borderRadius: "var(--radius-sm)",
        fontSize: "0.8rem",
        fontWeight: 700,
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <option value="UNHANDLED">⚪ 未対応</option>
      <option value="UNDER_REVIEW">🟠 検討中</option>
      <option value="IMPROVING">🔵 改善中</option>
      <option value="RESOLVED">🟢 改善済み</option>
    </select>
  );
}
