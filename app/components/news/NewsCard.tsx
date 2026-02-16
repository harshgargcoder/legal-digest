import BookmarkButton from "../BookmarkButton";

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
      relative overflow-hidden rounded-2xl p-4 sm:p-6
      transition-all duration-500

      ${isTopThree
          ? `
      bg-white border border-gray-200 shadow-md
      dark:bg-gradient-to-br 
      dark:from-indigo-900/60 
      dark:to-purple-900/60
      dark:border-indigo-500/30 
      dark:backdrop-blur-xl
      `
          : `
      bg-white border border-gray-200 shadow-sm
      dark:bg-white/5 dark:border-white/10 dark:backdrop-blur-lg
        `
        }
      hover:scale-[1.02] hover:shadow-xl
    `}
    >
      {/* TOP 3 Badge */}
      {isTopThree && (
        <div className="absolute top-4 right-4 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md">
          🔥 Top {index + 1}
        </div>
      )}

      {/* Title */}
      <h2 className="text-lg sm:text-xl font-semibold leading-snug
                   text-gray-900
                   dark:text-white">
        {item.title}
      </h2>

      <div className="mt-3">
        <BookmarkButton postId={item.id} />
      </div>

      {/* Summary */}
      <p className="mt-3 leading-relaxed text-sm sm:text-base
                  text-gray-600
                  dark:text-gray-300">
        {item.summary}
      </p>

      {/* Bottom */}
      <div className="flex justify-between items-center mt-6">

        <div className="flex items-center gap-3 text-xs
                      text-gray-500
                      dark:text-gray-300">

          <span className="bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-full">
            {item.category}
          </span>

          <span>
            {formattedTime}
          </span>
        </div>

        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="
          font-medium transition
          text-indigo-600 hover:text-indigo-800
          dark:text-indigo-300 dark:hover:text-white
        "
        >
          Read Full →
        </a>

      </div>
    </div>
  );

}
