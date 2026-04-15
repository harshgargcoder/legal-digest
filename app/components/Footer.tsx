import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-6">

        <div className="flex flex-col md:flex-row justify-between gap-12">

          {/* Logo + Description */}
          <div className="max-w-sm">
            <Image
              src="/new_logo.png"
              alt="Legal Digest"
              width={140}
              height={48}
              className="object-contain h-auto"
            />

            <p className="mt-5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              Structured legal news, judgments and policy updates —
              curated for modern legal readers.
            </p>
          </div>

          {/* Links Section */}
          <div className="flex gap-8 sm:gap-16 text-sm">

            <div className="flex flex-col gap-3">
              <span className="font-bold text-[#2f4a63] dark:text-slate-200">
                Company
              </span>

              <Link
                href="/about"
                className="text-slate-600 dark:text-slate-400 hover:text-[#2f4a63] dark:hover:text-indigo-400 font-medium transition duration-200"
              >
                About
              </Link>

              <Link
                href="/feedback"
                className="text-slate-600 dark:text-slate-400 hover:text-[#2f4a63] dark:hover:text-indigo-400 font-medium transition duration-200"
              >
                Feedback
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-bold text-[#2f4a63] dark:text-slate-200">
                Explore
              </span>

              <Link
                href="/"
                className="text-slate-600 dark:text-slate-400 hover:text-[#2f4a63] dark:hover:text-indigo-400 font-medium transition duration-200"
              >
                Latest News
              </Link>

              <Link
                href="/categories"
                className="text-slate-600 dark:text-slate-400 hover:text-[#2f4a63] dark:hover:text-indigo-400 font-medium transition duration-200"
              >
                Categories
              </Link>
            </div>

          </div>
        </div>

        {/* Bottom */}
        <div className="mt-7 pt-4 border-t border-gray-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-slate-400 gap-4">
          <span>
            © {new Date().getFullYear()} Legal Digest. All rights reserved.
          </span>

          <span className="text-xs text-gray-400 dark:text-slate-500">
            Built for legal readers ⚖️
          </span>
        </div>

      </div>
    </footer>
  );
}
