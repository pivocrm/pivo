export default function DashboardLoading() {
  return (
    <div className="max-w-6xl space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-9 w-48 bg-[#D1E8C8] rounded-xl" />
        <div className="h-4 w-64 bg-[#D1E8C8]/60 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#D1E8C8] p-5 space-y-4">
            <div className="flex justify-between">
              <div className="h-4 w-24 bg-[#D1E8C8] rounded" />
              <div className="w-9 h-9 bg-[#D1E8C8] rounded-xl" />
            </div>
            <div className="h-8 w-32 bg-[#D1E8C8] rounded" />
            <div className="h-3 w-20 bg-[#D1E8C8]/60 rounded" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <div className="h-5 w-48 bg-[#D1E8C8] rounded" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-14 bg-[#D1E8C8]/40 rounded-xl border border-[#D1E8C8]" />
        ))}
      </div>
    </div>
  );
}
