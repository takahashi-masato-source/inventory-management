import {
  InvalidProductInputError,
  ProductNotFoundError,
  getProductsService,
  deleteProductService,
  registerProductService,
  updateProductService,
} from "@/lib/services/productService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await getProductsService();
    return Response.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return Response.json(
      { message: "商品一覧を取得できませんでした。" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json(
      { message: "JSONの形式が正しくありません。" },
      { status: 400 },
    );
  }

  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return NextResponse.json(
      { message: "入力内容が正しくありません。" },
      { status: 400 },
    );
  }

  const { id, name, price } = input as Record<string, unknown>;
  try {
    const product = await updateProductService(id, { name, price });
    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof InvalidProductInputError) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }
    if (error instanceof ProductNotFoundError) {
      return NextResponse.json(
        { message: error.message },
        { status: 404 }
      );
    }
    console.error("Failed to update product:", error);
    return NextResponse.json(
      { message: "商品を更新できませんでした。" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ message: "JSONの形式が正しくありません。" }, { status: 400 });
  }

  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return NextResponse.json({ message: "入力内容が正しくありません。" }, { status: 400 });
  }

  const { id } = input as Record<string, unknown>;
  try {
    const product = await deleteProductService(id);
    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof InvalidProductInputError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    if (error instanceof ProductNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    console.error("Failed to delete product:", error);
    return NextResponse.json({ message: "商品を削除できませんでした。" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // unknownは型を不明とするが型チェックは無視されない　無視されるのはany型
  // letは先に変数を宣言し、後からrequest.json()の結果を代入するため
  let input: unknown;

  try {
    input = await request.json();
  } catch {
    // Response.json()はWeb標準、NextResponse.json()はNext.jsの機能
    // どちらもJSON形式のHTTPレスポンスを返せる
    return Response.json(
      { message: "JSONの形式が正しくありません。" },
      { status: 400 },
    );
  }

  try {
    const product = await registerProductService(input);
    return Response.json(
      product,
       { status: 201 }
    );
  } catch (error) {
    // オブジェクト名 instanceof クラス名という書き方
    // instanceofは、左側のオブジェクトが右側のクラスから作られたものかをtrue/falseで判定する
    // 今回はerrorがInvalidProductInputErrorクラスのインスタンスか確認する
    if (error instanceof InvalidProductInputError) {
      return Response.json(
        { message: error.message },
         { status: 400 }
      );
    }
    //console.log()のエラー用の出力
    console.error("Failed to register product:", error);
    return Response.json(
      { message: "商品を登録できませんでした。" },
      { status: 500 },
    );
  }
}
