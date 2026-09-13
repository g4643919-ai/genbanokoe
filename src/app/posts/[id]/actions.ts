"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export async function toggleReaction(postId: number, type: string) {
  const headerList = await headers();
  const ipAddress = headerList.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

  // Check if this IP has already performed the same reaction on this post
  const existing = await prisma.reaction.findFirst({
    where: {
      postId,
      type,
      ipAddress,
    },
  });

  if (existing) {
    // If it exists, remove it (toggle off)
    await prisma.reaction.delete({
      where: {
        id: existing.id,
      },
    });
  } else {
    // If it doesn't exist, create it (toggle on)
    await prisma.reaction.create({
      data: {
        postId,
        type,
        ipAddress,
      },
    });
  }

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/");
}

export async function addComment(postId: number, formData: FormData) {
  const content = formData.get("content") as string;
  const posterType = formData.get("posterType") as string || "ANONYMOUS";

  if (!content || content.trim() === "") {
    return { error: "コメント内容を入力してください。" };
  }

  try {
    await prisma.comment.create({
      data: {
        postId,
        content,
        posterType,
        status: "PUBLISHED",
      },
    });
  } catch (err) {
    console.error("Failed to add comment:", err);
    return { error: "コメントの投稿中にエラーが発生しました。" };
  }

  revalidatePath(`/posts/${postId}`);
}
