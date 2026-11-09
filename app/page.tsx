import Link from "next/link"

export default function Home(){
  return(
    <main>
      <h1>メニュー画面</h1>
      <div className="flex flex-col">
        <Link href={"/products/new"}>商品名と価格を入力する画面</Link>
        <Link href={"/products"}>商品一覧表示</Link>
      </div>
    </main>
  )
}