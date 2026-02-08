interface Props {
  item: any;
  index: number;
  activeCategory?: string;
}

export default function NewsCard({ item, index }: Props) {
  const formattedTime = new Date(item.published_at).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const isTopThree = index < 3;

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl p-6 transition-all duration-500
        ${isTopThree
          ? "bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-xl border border-indigo-400/30 shadow-xl scale-[1.02]"
          : "bg-white/5 backdrop-blur-lg border border-white/10"
        }
        hover:scale-[1.02] hover:shadow-2xl hover:border-indigo-400/40
      `}
    >
      {/* TOP 3 Badge */}
      {isTopThree && (
        <div className="absolute top-4 right-4 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg">
          🔥 Top {index + 1}
        </div>
      )}

      {/* Title */}
      <h2 className="text-xl font-semibold text-white leading-snug">
        {item.title}
      </h2>

      {/* Summary */}
      <p className="text-gray-300 mt-3 leading-relaxed text-sm">
        {item.summary}
      </p>

      {/* Bottom */}
      <div className="flex justify-between items-center mt-6">

        <div className="flex items-center gap-3 text-xs text-gray-300">
          <span className="bg-white/10 px-3 py-1 rounded-full">
            {item.legal_category}
          </span>

          <span>
            {formattedTime}
          </span>
        </div>

        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-300 font-medium hover:text-white transition"
        >
          Read Full →
        </a>

      </div>

    </div>
  );
}
