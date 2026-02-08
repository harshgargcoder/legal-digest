interface Props {
  item: any;
  index: number;
}

export default function NewsCard({ item, index }: Props) {
  const isTopFive = index < 5;

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl p-6 transition-all duration-500
        ${
          isTopFive
            ? "bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-xl border border-indigo-400/30 shadow-xl scale-[1.02]"
            : "bg-white/5 backdrop-blur-lg border border-white/10"
        }
        hover:scale-[1.02] hover:shadow-2xl hover:border-indigo-400/40
      `}
    >
      {/* TOP 5 Badge */}
      {isTopFive && (
        <div className="absolute top-4 right-4 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg">
          🔥 Top {index + 1}
        </div>
      )}

      {/* Top Row */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium text-gray-300">
          {item.court_name || "Legal Update"}
        </span>

        {/* <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${
            item.score >= 60
              ? "bg-green-500/20 text-green-300"
              : item.score >= 40
              ? "bg-yellow-500/20 text-yellow-300"
              : "bg-gray-500/20 text-gray-300"
          }`}
        >
          {item.score}
        </span> */}
      </div>

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
        <span className="bg-white/10 text-gray-200 px-3 py-1 rounded-full text-xs">
          {item.legal_category}
        </span>

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
