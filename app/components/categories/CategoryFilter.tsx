"use client";

interface Props {
  category: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
}

const categories = ["All", "Legal", "Finance", "Sports", "General", "Global"];

export default function CategoryFilter({
  category,
  setCategory,
}: Props) {
  return (
    <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setCategory(cat)}
          className={`
            px-4 py-2 rounded-full text-sm whitespace-nowrap font-medium
            transition-all duration-200
            ${category === cat
              ? "bg-indigo-600 text-white shadow-md"
              : `
                  bg-gray-100 text-gray-700
                  hover:bg-gray-200
                  dark:bg-white/10 dark:text-gray-300
                  dark:hover:bg-white/20
                `
            }
          `}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
