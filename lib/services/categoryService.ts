import {
  createCategoryRepository,
  getCategoriesRepository,
} from "@/lib/repositories/categoryRepository";

export async function getCategoriesService() {
  return getCategoriesRepository();
}

export class InvalidCategoryInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCategoryInputError";
  }
}

export class DuplicateCategoryNameError extends Error {
  constructor() {
    super("同じカテゴリー名は登録できません。");
    this.name = "DuplicateCategoryNameError";
  }
}

export async function createCategoryService(input: unknown) {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new InvalidCategoryInputError("入力内容が正しくありません。");
  }

  const { name } = input as Record<"name", unknown>;
  if (typeof name !== "string" || name.trim().length === 0) {
    throw new InvalidCategoryInputError("カテゴリー名を入力してください。");
  }

  try {
    return await createCategoryRepository({ name: name.trim() });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new DuplicateCategoryNameError();
    }
    throw error;
  }
}
