import { prisma } from "@/app/lib/prisma";

export function createCategoryRepository(data: { name: string }) {
  return prisma.category.create({ data });
}

export function getCategoriesRepository() {
  return prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { id: "asc" },
  });
}
