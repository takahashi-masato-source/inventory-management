// 商品名と価格を入力してもらってDBのProductテーブルにcreateするページ

"use client";

import { SubmitEvent, useState } from "react";

type ProductResponse = {
  id: number;
  name: string;
  price: number;
};

export default function NewProductPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
           name, 
           price: Number(price) 
        }),
      });
      // asは実際のデータを変更せず、TypeScriptに指定した型として扱わせる
      // 今回はユニオン型(|)で、ProductResponse または { message?: string } のどちらか
      // { message?: string } はmessageプロパティを持つオブジェクト型
      // ?があるためmessageは省略可能。存在する場合はstring型として扱う
      // asは実際のデータがその型かどうかを検証しない
      const result = (await response.json()) as
        | ProductResponse
        | { message?: string };
      // inは「プロパティ名 in オブジェクト名」で、プロパティの存在をtrue/falseで返す
      // &&は左側が真なら右側を評価し、偽なら右側を評価しない
      // 三項演算子は条件が真なら?側、偽なら:側を選ぶ
      // &&は三項演算子より優先順位が高いため、
      // ("message" in result && result.message)が1つの条件になる
      // messageが存在して中身も真ならresult.messageを使う
      // messageが存在しない、または空文字などなら固定のエラーメッセージを使う
      if (!response.ok) {
        setMessage(
          "message" in result && result.message
            ? result.message
            : "商品を登録できませんでした。",
        );
        return;
      }
      // resultをProductResponse型として扱い、productに代入する
      // asは型を指定するだけなので、実際のデータは変化しない
      const product = result as ProductResponse;
      setMessage(`「${product.name}」を登録しました。`);
      setName("");
      setPrice("");
    } catch {
      setMessage("通信に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 text-zinc-900">
      <section className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
        <h1 className="text-2xl font-semibold">商品登録</h1>
        <p className="mt-2 text-sm text-zinc-600">
          商品名と価格を入力してください。
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium">
              商品名
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

          <div>
            <label htmlFor="price" className="mb-2 block text-sm font-medium">
              価格
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="1"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-700 px-4 py-3 font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "登録中…" : "商品を登録"}
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
