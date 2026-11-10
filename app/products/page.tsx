"use client";

import { useEffect, useState } from "react";
// typeは自分で名前を付けた型を定義できる
type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  categoryId: number | null;
  category: { name: string } | null;
};

type Category = { id: number; name: string };
type ApiError = { message?: string };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [editCategoryId, setEditCategoryId] = useState("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [editError, setEditError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/products");
        const result = (await response.json()) as Product[] | ApiError;
        if (!response.ok || !Array.isArray(result)) {
          setError(
            !Array.isArray(result) && result.message
              ? result.message
              : "商品一覧を取得できませんでした。",
          );
          return;
        }
        setProducts(result);
      } catch {
        setError("通信に失敗しました。時間をおいて再度お試しください。");
      } finally {
        setIsLoading(false);
      }
    }

    void loadProducts();
  }, []);

  async function startEditing(product: Product) {
    setIsLoadingCategories(true);
    setEditError("");
    try {
      const response = await fetch("/api/categories");
      const result = (await response.json()) as Category[] | ApiError;
      if (!response.ok || !Array.isArray(result)) {
        setEditError(
          !Array.isArray(result) && result.message
            ? result.message
            : "カテゴリー一覧を取得できませんでした。",
        );
        return;
      }
      setCategories(result);
      setEditCategoryId(product.categoryId === null ? "" : String(product.categoryId));
      setEditingProductId(product.id);
      setEditName(product.name);
      setEditPrice(String(product.price));
    } catch {
      setEditError("カテゴリー一覧を取得できませんでした。");
    } finally {
      setIsLoadingCategories(false);
    }
  }

  async function saveProduct() {
    if (editingProductId === null) return;

    setIsSaving(true);
    setEditError("");
    try {
      const response = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingProductId,
          name: editName,
          price: editPrice.trim() === "" ? null : Number(editPrice),
          categoryId: editCategoryId === "" ? null : Number(editCategoryId),
        }),
      });
      const result = (await response.json()) as Product | ApiError;
      if (!response.ok) {
        setEditError(
          "message" in result && result.message
            ? result.message
            : "商品を更新できませんでした。",
        );
        return;
      }

      const updatedProduct = result as Omit<Product, "category">;
      const selectedCategory = categories.find(
        (category) => String(category.id) === editCategoryId,
      );
      const productWithCategory: Product = {
        ...updatedProduct,
        category: selectedCategory ? { name: selectedCategory.name } : null,
      };
      // 現在のStateをcurrentで受け取り、mapで更新した配列を返してproductsを更新する
      setProducts((current) =>
        current.map((product) =>
          product.id === productWithCategory.id ? productWithCategory : product,
        ),
      );
      setEditingProductId(null);
    } catch {
      setEditError("通信に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`「${product.name}」を削除しますか？`)) return;

    setDeletingProductId(product.id);
    setDeleteError("");
    try {
      const response = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id }),
      });
      const result = (await response.json()) as Product | ApiError;
      if (!response.ok) {
        setDeleteError(
          "message" in result && result.message
            ? result.message
            : "商品を削除できませんでした。",
        );
        return;
      }
      setProducts((current) => current.filter((item) => item.id !== product.id));
    } catch {
      setDeleteError("通信に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setDeletingProductId(null);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-12 text-zinc-900">
      <section className="mx-auto w-full max-w-5xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
        <h1 className="text-2xl font-semibold">商品一覧</h1>

        {isLoading ? (
          <p className="mt-6 text-sm text-zinc-600">読み込み中...</p>
        ) : error ? (
          <p role="alert" className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        ) : products.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-600">登録されている商品はありません。</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-600">
                  <th scope="col" className="px-4 py-3 font-medium">商品ID</th>
                  <th scope="col" className="px-4 py-3 font-medium">商品名</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">価格</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">在庫数</th>
                  <th scope="col" className="px-4 py-3 font-medium">カテゴリー</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-3">{product.id}</td>
                    {editingProductId === product.id ? (
                      <>
                        <td className="px-4 py-3">
                          <label className="sr-only" htmlFor={`name-${product.id}`}>商品名</label>
                          <input
                            id={`name-${product.id}`}
                            className="w-full rounded-md border border-zinc-300 px-2 py-1"
                            value={editName}
                            onChange={(event) => setEditName(event.target.value)}
                          />
                          <label className="sr-only" htmlFor={`category-${product.id}`}>カテゴリー</label>
                          <select
                            id={`category-${product.id}`}
                            className="mt-2 w-full rounded-md border border-zinc-300 px-2 py-1"
                            value={editCategoryId}
                            onChange={(event) => setEditCategoryId(event.target.value)}
                            disabled={isLoadingCategories || isSaving}
                          >
                            <option value="">カテゴリー未設定</option>
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <label className="sr-only" htmlFor={`price-${product.id}`}>価格</label>
                          <input
                            id={`price-${product.id}`}
                            type="number"
                            min="0"
                            step="1"
                            className="w-full rounded-md border border-zinc-300 px-2 py-1 text-right"
                            value={editPrice}
                            onChange={(event) => setEditPrice(event.target.value)}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">{product.stock.toLocaleString("ja-JP")}</td>
                        <td className="px-4 py-3">{product.category?.name ?? "未設定"}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              className="rounded-md bg-blue-600 px-3 py-1 text-white disabled:opacity-50"
                              onClick={() => void saveProduct()}
                              disabled={isSaving || isLoadingCategories || Boolean(editError)}
                            >
                              {isSaving ? "保存中..." : "保存"}
                            </button>
                            <button
                              type="button"
                              className="rounded-md border border-zinc-300 px-3 py-1"
                              onClick={() => setEditingProductId(null)}
                              disabled={isSaving}
                            >
                              キャンセル
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3">{product.name}</td>
                        <td className="px-4 py-3 text-right">{product.price.toLocaleString("ja-JP")}</td>
                        <td className="px-4 py-3 text-right">{product.stock.toLocaleString("ja-JP")}</td>
                        <td className="px-4 py-3">{product.category?.name ?? "未設定"}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            className="rounded-md border border-zinc-300 px-3 py-1 hover:bg-zinc-50"
                              onClick={() => void startEditing(product)}
                              disabled={isLoadingCategories}
                          >
                            編集
                          </button>
                          <button
                            type="button"
                            className="ml-2 rounded-md border border-red-300 px-3 py-1 text-red-700 hover:bg-red-50 disabled:opacity-50"
                            onClick={() => void deleteProduct(product)}
                            disabled={deletingProductId !== null}
                          >
                            {deletingProductId === product.id ? "削除中..." : "削除"}
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {editError && (
              <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {editError}
              </p>
            )}
            {deleteError && (
              <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {deleteError}
              </p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
