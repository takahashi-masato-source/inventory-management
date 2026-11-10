"use client";

import { useEffect, useState } from "react";

type Category = {
  id: number;
  name: string;
};

type ApiError = { message?: string };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch("/api/categories");
        const result = (await response.json()) as Category[] | ApiError;
        if (!response.ok || !Array.isArray(result)) {
          setError(
            !Array.isArray(result) && result.message
              ? result.message
              : "カテゴリー一覧を取得できませんでした。",
          );
          return;
        }
        setCategories(result);
      } catch {
        setError("通信に失敗しました。時間をおいて再度お試しください。");
      } finally {
        setIsLoading(false);
      }
    }

    void loadCategories();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-12 text-zinc-900">
      <section className="mx-auto w-full max-w-5xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
        <h1 className="text-2xl font-semibold">カテゴリー一覧</h1>

        {isLoading ? (
          <p className="mt-6 text-sm text-zinc-600">読み込み中...</p>
        ) : error ? (
          <p role="alert" className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        ) : categories.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-600">登録されているカテゴリーはありません。</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-600">
                  <th scope="col" className="px-4 py-3 font-medium">カテゴリーID</th>
                  <th scope="col" className="px-4 py-3 font-medium">カテゴリー名</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-3">{category.id}</td>
                    <td className="px-4 py-3">{category.name}</td>
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
