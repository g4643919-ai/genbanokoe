import { prisma } from "@/lib/db";

export async function getMasterData() {
  const [fields, prefectures, occupations, serviceTypes] = await Promise.all([
    prisma.field.findMany({
      orderBy: { id: "asc" },
    }),
    prisma.prefecture.findMany({
      include: {
        municipalities: {
          orderBy: { name: "asc" },
        },
      },
      orderBy: { id: "asc" },
    }),
    prisma.occupation.findMany({
      orderBy: { id: "asc" },
    }),
    prisma.serviceType.findMany({
      orderBy: { id: "asc" },
    }),
  ]);

  return {
    fields,
    prefectures,
    occupations,
    serviceTypes,
  };
}
