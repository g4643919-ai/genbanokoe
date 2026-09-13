import { prisma } from "@/lib/db";
import { getMasterData } from "@/lib/masterData";
import PostForm from "./PostForm";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const [categories, masterData] = await Promise.all([
    prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      select: { id: true, name: true },
    }),
    getMasterData(),
  ]);

  return (
    <div className="container">
      <PostForm
        categories={categories}
        prefectures={masterData.prefectures}
        fields={masterData.fields}
        occupations={masterData.occupations}
        serviceTypes={masterData.serviceTypes}
      />
    </div>
  );
}
