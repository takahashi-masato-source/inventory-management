import {
  createCategoryService,
  DuplicateCategoryNameError,
  getCategoriesService,
  InvalidCategoryInputError,
} from "@/lib/services/categoryService";

export async function GET() {
  try {
    const categories = await getCategoriesService();
    return Response.json(categories, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return Response.json(
      { message: "カテゴリー一覧を取得できませんでした。" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return Response.json(
      { message: "JSONの形式が正しくありません。" },
      { status: 400 },
    );
  }

  try {
    const category = await createCategoryService(input);
    return Response.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof InvalidCategoryInputError) {
      return Response.json({ message: error.message }, { status: 400 });
    }
    if (error instanceof DuplicateCategoryNameError) {
      return Response.json({ message: error.message }, { status: 409 });
    }

    console.error("Failed to register category:", error);
    return Response.json(
      { message: "カテゴリーを登録できませんでした。" },
      { status: 500 },
    );
  }
}
