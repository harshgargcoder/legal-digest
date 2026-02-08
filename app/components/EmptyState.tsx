export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-2xl font-semibold">
        No Legal Updates Found
      </h2>
      <p className="text-gray-500 mt-3 max-w-md">
        Your intelligent filter may have rejected low-quality news.
        Only structured legal updates survive here.
      </p>
    </div>
  );
}
