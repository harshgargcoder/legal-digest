import React, { useState } from 'react';
import { Terminal, ShieldAlert, Globe, Bug, Trash2 } from 'lucide-react';
import DetailModal from './DetailModal';

export default function LogTabs({ activityLog, errorLog, bugReports, revealEmails }) {
  const [activeTab, setActiveTab] = useState('activity');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const maskEmail = (email) => {
    if (!email) return 'N/A';
    if (revealEmails) return email;
    const [name, domain] = email.split('@');
    return `${name.charAt(0)}***@${domain}`;
  };

  const tabs = [
    { id: 'activity', label: 'Activity Stream', icon: <Terminal size={14} /> },
    { id: 'errors', label: 'Error Log', icon: <ShieldAlert size={14} /> },
    { id: 'ip', label: 'IP Access Logs', icon: <Globe size={14} /> },
    { id: 'bugs', label: 'Bug Reports', icon: <Bug size={14} /> },
  ];

  return (
    <div className="bg-slate-900/50 rounded-3xl border border-slate-800 overflow-hidden min-h-[500px] flex flex-col">
      <div className="flex items-center justify-between px-6 bg-slate-950/30 border-b border-slate-800">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${
                activeTab === tab.id 
                  ? 'border-indigo-600 text-indigo-500 bg-indigo-600/5' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-500 transition-all">
          <Trash2 size={14} /> Clear Older Logs
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {activeTab === 'activity' && (
          <div className="space-y-4">
            {activityLog.map((log, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/50 border border-slate-800/50 hover:border-slate-700 transition-all">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  log.action === 'login' ? 'bg-blue-500/10 text-blue-500' :
                  log.action === 'session_start' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-slate-500/10 text-slate-400'
                }`}>
                  {log.action === 'login' ? <Globe size={14} /> : <Terminal size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{log.action}</span>
                    <span className="text-[10px] font-bold text-slate-600">{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-300 truncate">User: {maskEmail(log.user_email || 'anonymous')}</p>
                  {log.details && <p className="text-xs text-slate-500 mt-1 truncate">{log.details}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'errors' && (
          <div className="space-y-4">
            {errorLog.map((error, i) => (
              <div 
                key={i} 
                onClick={() => { setSelectedItem({ ...error, type: 'error' }); setIsModalOpen(true); }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 hover:border-rose-500/30 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                  <ShieldAlert size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">{error.model}</span>
                    <span className="text-[10px] font-bold text-slate-600">{new Date(error.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-300">{error.error_message || 'Unspecified Error'}</p>
                  <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Input Tokens: {error.input_tokens}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'bugs' && (
          <div className="space-y-4">
            {bugReports.map((bug, i) => (
              <div 
                key={i} 
                onClick={() => { setSelectedItem({ ...bug, type: 'bug' }); setIsModalOpen(true); }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/30 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <Bug size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Bug Report</span>
                    <span className="text-[10px] font-bold text-slate-600">{new Date(bug.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-300">{bug.error}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">"{bug.transcript_snippet}"</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <DetailModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title={selectedItem?.type === 'error' ? 'Error Intelligence' : 'Bug Diagnostics'}
        >
          {selectedItem && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Timestamp</p>
                  <p className="text-xs font-bold text-white">{new Date(selectedItem.timestamp).toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Entity ID</p>
                  <p className="text-xs font-bold text-indigo-400 font-mono truncate">{selectedItem.id || selectedItem.user_id}</p>
                </div>
              </div>
              
              <div className="p-6 rounded-2xl bg-slate-950/50 border border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Detailed Payload / Message</p>
                <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                  {selectedItem.error_message || selectedItem.error || 'No additional data'}
                </pre>
              </div>

              {selectedItem.transcript_snippet && (
                <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2">Transcript Context</p>
                  <p className="text-xs text-slate-300 leading-relaxed italic">"{selectedItem.transcript_snippet}"</p>
                </div>
              )}
            </div>
          )}
        </DetailModal>

        {activeTab === 'ip' && (
          <div className="space-y-4">
            {/* IP Logs implementation */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-800">
                  <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">IP Address</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {/* IP log rows would be mapped here from ipLogs prop if passed, 
                      for now showing placeholder logic */}
                </tbody>
              </table>
              <div className="text-center py-12">
                <Globe size={48} className="mx-auto text-slate-800 mb-4" />
                <p className="text-sm font-black uppercase tracking-widest text-slate-600">IP Intelligence Service</p>
                <p className="text-xs text-slate-500 mt-2">Check the Activity stream for latest IP metadata.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
