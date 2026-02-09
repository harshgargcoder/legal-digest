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
      <h3 className="text-lg font-semibold text-white">
        Trending Topics
      </h3>

      <div className="mt-6 space-y-4">
        {trendingTopics.map((topic, index) => (
          <div
            key={index}
            onClick={() => setSearch(topic)}
            className="border border-white/20 rounded-xl px-4 py-3 text-sm 
                       text-white hover:bg-white/10 
                       transition cursor-pointer"
          >
            {topic}
          </div>
        ))}
      </div>
    </div>
  );
}
