import {
  createProductRepository,
  findCategoryForProductRepository,
  findProductForEditRepository,
  findProductsRepository,
  softDeleteProductRepository,
  updateProductRepository,
} from "@/lib/repositories/productRepository";
// classはオブジェクトを作るための設計図を定義する命令
// classは設計図のようなものであり、new クラス名()で個別に複数のオブジェクトを作れる
// 子クラス名 extends 親クラス名 で継承できる
// 継承とは子クラスが親クラスのプロパティやメソッドを引き継ぐこと
// constructor()はnewでオブジェクトを作る際に自動実行される初期化処理。()内は引数
// super()は親クラスのconstructorを呼び出し、引数を渡す
// 親クラスのconstructorによって、プロパティに値が設定される場合がある
// 親クラスのメソッドの動作を変えたい場合は、子クラスで同じ名前のメソッドを再定義できる
// thisは現在作成・操作しているオブジェクト自身を指す
export class InvalidProductInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidProductInputError";
  }
}
// typeof 変数名 は実行時の型を文字列で返す。今回は"object"以外ならtrue
// Array.isArray()は引数が配列かどうかをtrue/falseで返す
// throwは例外を発生させ、通常の処理を中断する
// throwで投げるものは基本的に以下の二つになる
// ①標準のError系クラスから作ったオブジェクト 
// ②Errorを継承した自作クラスから作ったオブジェクト
// 今回はErrorを継承した自作クラスから作ったオブジェクトを投げ、Route側のcatch(error)で受け取る
export async function registerProductService(input: unknown) {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new InvalidProductInputError("入力内容が正しくありません。");
  }
  // const { name, price } = input まではただの分割代入
  // as以降は実際のデータを変更せず、TypeScriptに指定した型として扱わせる
  // Record<キーの型, 値の型> でオブジェクトの型を表す
  // 今回はinputがobjectであること、nullではないこと、配列ではないこと、しかわかっていない
  // そのためnameとpriceというプロパティを持つ型として扱わせる
  // ただし、実際に存在するかどうかは保証されない
  // キーの型をstringにすれば、任意の文字列のプロパティ名を扱える　
  // (例)const { name, price } = input as Record<string, unknown>;
  const { name, price, categoryId: rawCategoryId } = input as Record<string, unknown>;
  const categoryId = rawCategoryId === undefined ? null : rawCategoryId;

  if (typeof name !== "string" || name.trim().length === 0) {
    throw new InvalidProductInputError("商品名を入力してください。");
  }
  // Number.isInteger()は引数が整数かどうかをtrue/falseで返す
  // !を付けることで整数ではない場合にtrueとなり、エラーを発生させる
  if (typeof price !== "number" || !Number.isInteger(price) || price < 0) {
    throw new InvalidProductInputError("価格は0以上の整数で入力してください。");
  }

  if (categoryId !== null && (typeof categoryId !== "number" || !Number.isInteger(categoryId) || categoryId <= 0)) {
    throw new InvalidProductInputError("カテゴリーを正しく選択してください。");
  }
  if (categoryId !== null && !(await findCategoryForProductRepository(categoryId))) {
    throw new InvalidProductInputError("選択したカテゴリーが見つかりません。");
  }

  return createProductRepository({
    name: name.trim(),
    price,
    categoryId,
  });
}

export async function getProductsService() {
  return findProductsRepository();
}

export class ProductNotFoundError extends Error {
  constructor() {
    super("商品が見つからないか、編集できません。");
    this.name = "ProductNotFoundError";
  }
}

export async function updateProductService(
  id: unknown,
  input: unknown,
) {
  if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) {
    throw new InvalidProductInputError("商品IDが正しくありません。");
  }
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new InvalidProductInputError("入力内容が正しくありません。");
  }

  const updateInput = input as Record<string, unknown>;
  const { name, price, categoryId } = updateInput;
  if (typeof name !== "string" || name.trim().length === 0) {
    throw new InvalidProductInputError("商品名を入力してください。");
  }
  if (typeof price !== "number" || !Number.isInteger(price) || price < 0) {
    throw new InvalidProductInputError("価格は0以上の整数で入力してください。");
  }

  const product = await findProductForEditRepository(id);
  if (!product || product.isDeleted) {
    throw new ProductNotFoundError();
  }

  const hasCategoryId = Object.prototype.hasOwnProperty.call(updateInput, "categoryId");
  if (hasCategoryId && categoryId !== null &&
    (typeof categoryId !== "number" || !Number.isInteger(categoryId) || categoryId <= 0)) {
    throw new InvalidProductInputError("カテゴリーを正しく選択してください。");
  }
  if (hasCategoryId && typeof categoryId === "number" &&
    !(await findCategoryForProductRepository(categoryId))) {
    throw new InvalidProductInputError("選択したカテゴリーが見つかりません。");
  }

  return updateProductRepository(id, {
    name: name.trim(),
    price,
    ...(hasCategoryId ? { categoryId: categoryId as number | null } : {}),
  });
}

export async function deleteProductService(id: unknown) {
  if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) {
    throw new InvalidProductInputError("商品IDが正しくありません。");
  }

  const product = await findProductForEditRepository(id);
  if (!product || product.isDeleted) {
    throw new ProductNotFoundError();
  }

  return softDeleteProductRepository(id);
}
