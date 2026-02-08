import NewsCard from "../components/news/NewsCard";

async function getData() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/get-news?region=India`,
    { cache: "no-store" }
  );
  return res.json();
}

export default async function NationalPage() {
  const data = await getData();

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold text-white mb-8">
        National News
      </h1>

      <div className="grid gap-8">
        {data.articles?.map((item: any, index: number) => (
          <NewsCard
            key={item.id}
            item={item}
            index={index}
            activeCategory="National"
          />
        ))}
      </div>
    </div>
  );
}
