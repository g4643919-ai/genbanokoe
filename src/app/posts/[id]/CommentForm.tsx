"use client";

import React, { useActionState, useRef } from "react";
import { addComment } from "./actions";
import styles from "./page.module.css";

interface CommentFormProps {
  postId: number;
}

export default function CommentForm({ postId }: CommentFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  // Bind the postId parameter to the server action
  const addCommentWithPostId = addComment.bind(null, postId);

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const res = await addCommentWithPostId(formData);
      if (!res?.error && formRef.current) {
        formRef.current.reset(); // Reset form textarea on successful post
      }
      return res;
    },
    null
  );

  return (
    <form ref={formRef} action={formAction} className={styles.commentForm}>
      <div className={styles.field} style={{ marginBottom: "0.5rem" }}>
        <label
          htmlFor="content"
          className={styles.label}
          style={{ fontSize: "0.9rem" }}
        >
          コメントを投稿する
        </label>
        <textarea
          id="content"
          name="content"
          placeholder="誹謗中傷や個人特定の入力は避け、温かいアドバイスや同じ課題への改善意見をご記入ください。"
          required
          style={{ minHeight: "80px" }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "0.5rem",
        }}
      >
        <div>
          {state?.error && (
            <span style={{ color: "#c62828", fontSize: "0.8rem" }}>
              {state.error}
            </span>
          )}
        </div>
        <button
          type="submit"
          className={styles.commentSubmitBtn}
          disabled={isPending}
          style={{ marginTop: 0 }}
        >
          {isPending ? "送信中..." : "コメントする"}
        </button>
      </div>
    </form>
  );
}
