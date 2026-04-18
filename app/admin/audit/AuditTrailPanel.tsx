import React, { useMemo, useState } from "react";
import { AdminUser } from "../types";
import { formatDate } from "../shared/shared";
import { RefreshCw, Search, ChevronLeft } from "lucide-react";

export function AuditTrailPanel({ 
  users, 
  onRefresh 
}: { 
  users: AdminUser[];
  onRefresh: () => void;
}) {
  const [tab, setTab] = useState<"ip" | "activity">("ip");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Reset page on tab or search
  React.useEffect(() => {
    setPage(1);
  }, [tab, searchQuery]);

  const allIpLogs = useMemo(() => {
    const logs = users.flatMap(u => (u.ipHistory || []).map(h => ({ 
      ...h, 
      userId: u.uid, 
      userName: u.displayName || u.email 
    })));
    
    return logs
      .filter(l => 
        l.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        l.ipAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => new Date(b.seenAt).getTime() - new Date(a.seenAt).getTime());
  }, [users, searchQuery]);

  const allActivityLogs = useMemo(() => {
    const logs = users.flatMap(u => (u.activityHistory || []).map(a => ({ 
      ...a, 
      userId: u.uid, 
      userName: u.displayName || u.email 
    })));

    return logs
      .filter(l => 
        l.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [users, searchQuery]);

  const currentLogs = tab === "ip" ? allIpLogs : allActivityLogs;
  const totalPages = Math.ceil(currentLogs.length / limit);
  const paginatedLogs = currentLogs.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 p-4 rounded-3xl border border-white shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span className="hover:text-indigo-600 transition-colors cursor-pointer">Back</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">User Log Session</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search intelligence, users or logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all w-full md:w-80"
            />
          </div>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            {isRefreshing ? "Refreshing..." : "Refresh Feed"}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setTab("ip")}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === "ip" ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-slate-100"}`}
        >
          IP Access Logs ({allIpLogs.length})
        </button>
        <button
          onClick={() => setTab("activity")}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === "activity" ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-slate-100"}`}
        >
          Activity Stream ({allActivityLogs.length})
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">User</th>
                {tab === "ip" ? (
                  <>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">IP Address</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Location</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Risk</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                    No matching logs found
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log: any, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                      {formatDate(tab === "ip" ? log.seenAt : log.timestamp, true)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-900">{log.userName}</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">{log.userId}</p>
                    </td>
                    {tab === "ip" ? (
                      <>
                        <td className="px-6 py-4 font-mono text-xs text-slate-600">{log.ipAddress}</td>
                        <td className="px-6 py-4 text-xs text-slate-600">{log.location}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-xs font-black text-slate-800">{log.title}</td>
                        <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">{log.description}</td>
                      </>
                    )}
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        log.status === "Trusted" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                        log.status === "Warning" ? "bg-amber-50 text-amber-600 border border-amber-100" : 
                        "bg-rose-50 text-rose-600 border border-rose-100"
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            Previous
          </button>
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Page <span className="text-indigo-600">{page}</span> of {totalPages}
          </div>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
