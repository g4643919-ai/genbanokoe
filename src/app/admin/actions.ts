"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function updateResolutionStatus(postId: number, resolutionStatus: string) {
  try {
    await prisma.post.update({
      where: { id: postId },
      data: { resolutionStatus },
    });
  } catch (err) {
    console.error("Failed to update resolution status:", err);
    return { error: "ステータスの更新に失敗しました。" };
  }

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function updatePostStatus(postId: number, status: string) {
  try {
    await prisma.post.update({
      where: { id: postId },
      data: { status },
    });
  } catch (err) {
    console.error("Failed to update post status:", err);
    return { error: "投稿ステータスの更新に失敗しました。" };
  }

  revalidatePath("/admin");
  revalidatePath("/");
}
