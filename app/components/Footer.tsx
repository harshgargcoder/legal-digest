import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-5 
                      flex flex-col md:flex-row 
                      justify-between items-center 
                      text-sm text-gray-700">

        <span>© {new Date().getFullYear()} Legal Digest</span>

        <div className="flex gap-8 mt-4 md:mt-0">
          <Link
            href="/about"
            className="relative hover:text-black transition group"
          >
            About
            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-black transition-all duration-300 group-hover:w-full"></span>
          </Link>

          <Link
            href="/feedback"
            className="relative hover:text-black transition group"
          >
            Feedback
            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-black transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </div>

      </div>
    </footer>
  );
}
