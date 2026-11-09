// 登録された商品一覧を表示するページ

"use client";

import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/products");
        const result = (await response.json()) as
          | Product[]
          | { message?: string };

        if (!response.ok) {
          setError(
            !Array.isArray(result) && result.message
              ? result.message
              : "商品一覧を取得できませんでした。",
          );
          return;
        }

        setProducts(result as Product[]);
      } catch {
        setError("通信に失敗しました。時間をおいて再度お試しください。");
      } finally {
        setIsLoading(false);
      }
    }
    // voidは式の評価結果をundefinedにする演算子
    // 関数自体の動作には影響しない
    // 今回は戻り値のPromiseを使わないことを明示している
    void loadProducts();
  }, []);

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
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-3">{product.id}</td>
                    <td className="px-4 py-3">{product.name}</td>
                    <td className="px-4 py-3 text-right">{product.price.toLocaleString("ja-JP")}</td>
                    <td className="px-4 py-3 text-right">{product.stock.toLocaleString("ja-JP")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
