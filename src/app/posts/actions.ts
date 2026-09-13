"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export async function createPost(prevState: any, formData: FormData) {
  const postType = (formData.get("postType") as string) || "ISSUE";
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  const categoryIdStr = formData.get("categoryId") as string;
  const fieldIdStr = formData.get("fieldId") as string;
  const prefectureIdStr = formData.get("prefectureId") as string;
  const municipalityIdStr = formData.get("municipalityId") as string;
  const occupationIdStr = formData.get("occupationId") as string;
  const serviceTypeIdStr = formData.get("serviceTypeId") as string;
  const experienceYearsStr = formData.get("posterExperienceYears") as string;

  const posterType = (formData.get("posterType") as string) || "ANONYMOUS";
  const frequency = formData.get("frequency") as string;
  const urgency = formData.get("urgency") as string;
  const improvementProposal = formData.get("improvementProposal") as string;

  // Objective data fields
  const nightShiftCountStr = formData.get("nightShiftCount") as string;
  const nightShiftHoursStr = formData.get("nightShiftHours") as string;
  const nightShiftStaffStr = formData.get("nightShiftStaff") as string;
  const assignedResidentsStr = formData.get("assignedResidents") as string;
  const overtimeHoursStr = formData.get("overtimeHours") as string;

  const categoryId = parseInt(categoryIdStr, 10);
  const fieldId = fieldIdStr ? parseInt(fieldIdStr, 10) : null;
  const prefectureId = prefectureIdStr ? parseInt(prefectureIdStr, 10) : null;
  const municipalityId = municipalityIdStr ? parseInt(municipalityIdStr, 10) : null;
  const occupationId = occupationIdStr ? parseInt(occupationIdStr, 10) : null;
  const serviceTypeId = serviceTypeIdStr ? parseInt(serviceTypeIdStr, 10) : null;
  const posterExperienceYears = parseInt(experienceYearsStr, 10) || 0;

  // Get names for compatibility
  let posterPrefecture = "";
  let posterOccupation = "";

  if (prefectureId) {
    const pref = await prisma.prefecture.findUnique({ where: { id: prefectureId } });
    if (pref) posterPrefecture = pref.name;
  }

  if (occupationId) {
    const occ = await prisma.occupation.findUnique({ where: { id: occupationId } });
    if (occ) posterOccupation = occ.name;
  }

  // Get Care industry
  const industry = await prisma.industry.findUnique({
    where: { slug: "care" },
  });

  if (!industry) {
    return { error: "業界データ（介護福祉）が見つかりません。" };
  }

  if (!title || title.trim() === "") {
    return { error: "タイトルを入力してください。" };
  }

  if (!content || content.trim() === "") {
    return { error: "本文を入力してください。" };
  }

  if (isNaN(categoryId)) {
    return { error: "カテゴリを選択してください。" };
  }

  if (!prefectureId) {
    return { error: "都道府県を選択してください。" };
  }

  try {
    const createdPost = await prisma.post.create({
      data: {
        postType,
        industryId: industry.id,
        categoryId,
        fieldId,
        prefectureId,
        municipalityId,
        serviceTypeId,
        occupationId,
        title,
        content,
        frequency: frequency || null,
        urgency: urgency || null,
        improvementProposal: improvementProposal || null,
        posterType,
        posterOccupation: posterOccupation || "現場スタッフ",
        posterExperienceYears,
        posterPrefecture: posterPrefecture || "全国",
        status: "PUBLISHED",
      },
    });

    // Parse and save optional objective metrics
    const nightShiftCount = nightShiftCountStr ? parseInt(nightShiftCountStr, 10) : null;
    const nightShiftHours = nightShiftHoursStr ? parseInt(nightShiftHoursStr, 10) : null;
    const nightShiftStaff = nightShiftStaffStr ? parseInt(nightShiftStaffStr, 10) : null;
    const assignedResidents = assignedResidentsStr ? parseInt(assignedResidentsStr, 10) : null;
    const overtimeHours = overtimeHoursStr ? parseInt(overtimeHoursStr, 10) : null;

    if (
      nightShiftCount !== null ||
      nightShiftHours !== null ||
      nightShiftStaff !== null ||
      assignedResidents !== null ||
      overtimeHours !== null
    ) {
      await prisma.objectiveData.create({
        data: {
          postId: createdPost.id,
          nightShiftCount,
          nightShiftHours,
          nightShiftStaff,
          assignedResidents,
          overtimeHours,
        },
      });
    }
  } catch (err) {
    console.error("Failed to create post:", err);
    return { error: "投稿の保存中にエラーが発生しました。" };
  }

  redirect("/");
}
