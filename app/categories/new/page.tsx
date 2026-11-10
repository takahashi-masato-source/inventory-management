"use client";

import { SubmitEvent, useState } from "react";

type CategoryResponse = {
  id: number;
  name: string;
};

export default function NewCategoryPage() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const result = (await response.json()) as
        | CategoryResponse
        | { message?: string };

      if (!response.ok) {
        setMessage(
          "message" in result && result.message
            ? result.message
            : "カテゴリーを登録できませんでした。",
        );
        return;
      }

      const category = result as CategoryResponse;
      setMessage(`「${category.name}」を登録しました。`);
      setName("");
    } catch {
      setMessage("通信に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 text-zinc-900">
      <section className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
        <h1 className="text-2xl font-semibold">カテゴリー登録</h1>
        <p className="mt-2 text-sm text-zinc-600">
          カテゴリー名を入力してください。
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium">
              カテゴリー名
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-700 px-4 py-3 font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "登録中…" : "カテゴリーを登録"}
          </button>
        </form>

        {message && (
          <p role="status" className="mt-5 rounded-lg bg-zinc-100 p-3 text-sm">
            {message}
          </p>
        )}
      </section>
    </main>
  );
}
