"use client";

import { useTransition } from "react";
import { toggleReaction } from "./actions";
import styles from "./page.module.css";

interface Reaction {
  type: string;
  ipAddress: string | null;
}

interface ReactionButtonsProps {
  postId: number;
  reactions: Reaction[];
  userIp: string;
}

export default function ReactionButtons({
  postId,
  reactions,
  userIp,
}: ReactionButtonsProps) {
  const [isPending, startTransition] = useTransition();

  const getCount = (type: string) => {
    return reactions.filter((r) => r.type === type).length;
  };

  const hasReacted = (type: string) => {
    return reactions.some((r) => r.type === type && r.ipAddress === userIp);
  };

  const handleReact = (type: string) => {
    startTransition(async () => {
      await toggleReaction(postId, type);
    });
  };

  const reactionTypes = [
    {
      type: "SAME_WORKPLACE",
      label: "💬 同じ現場です (当事者)",
      className: styles.btnSameWorkplace,
    },
    {
      type: "HELPFUL",
      label: "💡 参考になった",
      className: styles.btnHelpful,
    },
    {
      type: "AGREE",
      label: "👍 賛成",
      className: styles.btnAgree,
    },
    {
      type: "DISAGREE",
      label: "👎 反対",
      className: styles.btnDisagree,
    },
  ];

  return (
    <div className={styles.reactionsSection}>
      <h4 className={styles.reactionsTitle}>この課題・事例への反応</h4>
      <div className={styles.reactionsGrid}>
        {reactionTypes.map((item) => {
          const count = getCount(item.type);
          const active = hasReacted(item.type);
          const isSameWorkplace = item.type === "SAME_WORKPLACE";

          return (
            <button
              key={item.type}
              type="button"
              className={`${styles.reactionBtn} ${item.className} ${active ? styles.active : ""}`}
              style={
                isSameWorkplace
                  ? {
                      gridColumn: "1 / -1",
                      padding: "1rem",
                      fontSize: "1rem",
                      fontWeight: 800,
                      backgroundColor: active ? "var(--secondary-light)" : "var(--surface)",
                      borderColor: "var(--secondary)",
                      color: "var(--secondary-hover)",
                    }
                  : undefined
              }
              onClick={() => handleReact(item.type)}
              disabled={isPending}
            >
              <span>{item.label}</span>
              <span className={styles.count} style={isSameWorkplace ? { fontSize: "0.9rem", fontWeight: 800 } : undefined}>
                {count} 人が「同じ現場」と回答
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
