export default function NewsletterCTA() {
  return (
    <section className="max-w-5xl mx-auto px-6 my-24">
      <div className="bg-[#f8fafc] border border-gray-200 rounded-3xl p-12 text-center">
        
        <h2 className="text-3xl font-semibold text-[#2f4a63]">
          Stay Updated With Legal Developments
        </h2>

        <p className="mt-4 text-gray-600">
          Get structured legal updates delivered weekly.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <input
            type="email"
            placeholder="Enter your email"
            className="px-5 py-3 rounded-xl border border-gray-300 w-full sm:w-80 
           bg-white text-gray-800 placeholder-gray-400
           focus:outline-none focus:border-[#2f4a63]"
          />

          <button className="px-6 py-3 rounded-xl bg-[#2f4a63] text-white font-medium hover:opacity-90 transition">
            Subscribe
          </button>
        </div>

      </div>
    </section>
  );
}
