import { prisma } from "@/app/lib/prisma";
// 商品名と価格をまとめたオブジェクトを受け取り、Productテーブルに登録する
// prisma.product.create()が返すPromiseをそのままreturnするため、ここではasync/awaitが不要
// awaitはPromiseの完了まで、その非同期関数の後続処理を一時停止する
// asyncは関数内でawaitを使えるようにし、その関数の返り値をPromiseにする
export function createProductRepository(
  data: { name: string; price: number; categoryId: number | null }
) {
  return prisma.product.create({
    data,
  });
}

export function findCategoryForProductRepository(id: number) {
  return prisma.category.findUnique({
    where: { id },
    select: { id: true },
  });
}

export function findProductsRepository() {
  return prisma.product.findMany({
    where: { isDeleted: false },
    select: {
      id: true,
      name: true,
      price: true,
      stock: true,
      categoryId: true,
      category: { select: { name: true } },
    },
    orderBy: { id: "asc" },
  });
}

export function findProductForEditRepository(id: number) {
  return prisma.product.findUnique({
    where: { id },
    select: { id: true, isDeleted: true },
  });
}

export function updateProductRepository(
  id: number,
  data: { name: string; price: number; categoryId?: number | null },
) {
  return prisma.product.update({
    where: { id },
    data,
  });
}

export function softDeleteProductRepository(id: number) {
  return prisma.product.update({
    where: { id },
    data: { isDeleted: true },
  });
}
