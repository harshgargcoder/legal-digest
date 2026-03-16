import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
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

            <p className="mt-5 text-sm text-slate-700 leading-relaxed font-medium">
              Structured legal news, judgments and policy updates —
              curated for modern legal readers.
            </p>
          </div>

          {/* Links Section */}
          <div className="flex gap-8 sm:gap-16 text-sm">

            <div className="flex flex-col gap-3">
              <span className="font-bold text-[#2f4a63]">
                Company
              </span>

              <Link
                href="/about"
                className="text-slate-600 hover:text-[#2f4a63] font-medium transition duration-200"
              >
                About
              </Link>

              <Link
                href="/feedback"
                className="text-slate-600 hover:text-[#2f4a63] font-medium transition duration-200"
              >
                Feedback
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-bold text-[#2f4a63]">
                Explore
              </span>

              <Link
                href="/"
                className="text-slate-600 hover:text-[#2f4a63] font-medium transition duration-200"
              >
                Latest News
              </Link>

              <Link
                href="/categories"
                className="text-slate-600 hover:text-[#2f4a63] font-medium transition duration-200"
              >
                Categories
              </Link>
            </div>

          </div>
        </div>

        {/* Bottom */}
        <div className="mt-7 pt-4 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4">
          <span>
            © {new Date().getFullYear()} Legal Digest. All rights reserved.
          </span>

          <span className="text-xs text-gray-400">
            Built for legal readers ⚖️
          </span>
        </div>

      </div>
    </footer>
  );
}
