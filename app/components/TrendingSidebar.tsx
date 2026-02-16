type Props = {
  setSearch: (value: string) => void;
};

export default function TrendingSidebar({ setSearch }: Props) {
  const trendingTopics = [
    "Supreme Court",
    "Criminal Bill",
    "Constitutional Amendment",
    "High Court",
    "Policy Reform",
  ];

  return (
    <div className="sticky top-24">

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Trending Topics
      </h3>

      <div className="mt-6 space-y-4">
        {trendingTopics.map((topic, index) => (
          <div
            key={index}
            onClick={() => setSearch(topic)}
            className="
            border rounded-xl px-4 py-3 text-sm cursor-pointer transition-all duration-200

            bg-white border-gray-200 text-gray-700 hover:bg-gray-100 shadow-sm
            dark:bg-zinc-900 dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/10
          "
          >
            {topic}
          </div>
        ))}
      </div>

    </div>
  );
}
