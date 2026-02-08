interface Props {
  selected: string;
  setSelected: (value: string) => void;
}

const categories = ["All", "Legal", "Global", "Political", "Sports"];

export default function CategoryFilter({
  selected,
  setSelected,
}: Props) {
  return (
    <div className="flex gap-3 mt-6 flex-wrap">
      {categories.map((cat) => {
        const active = selected === cat;

        return (
          <button
            key={cat}
            onClick={() => setSelected(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300
              ${active
                ? "bg-indigo-600 text-white shadow-lg scale-105"
                : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
              }
            `}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
