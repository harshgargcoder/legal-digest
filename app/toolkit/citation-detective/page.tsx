"use client";

import { useState, useRef } from "react";
import { Quote, Search, Sparkles, BookCheck, Clipboard, ChevronLeft, Loader2, AlertCircle, FilePlus, X, FileText, Image as ImageIcon, Scale } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

export default function CitationDetectivePage() {
  const [content, setContent] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<{ data: string, mimeType: string } | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    if (selectedFile.size > 2 * 1024 * 1024) {
      setError("File size must be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      setFile({ data: base64, mimeType: selectedFile.type });
      
      if (selectedFile.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(selectedFile));
      } else {
        setFilePreview(null);
      }
      setError("");
    };
    reader.readAsDataURL(selectedFile);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/") || items[i].type === "application/pdf") {
        const pastedFile = items[i].getAsFile();
        if (pastedFile) {
          processFile(pastedFile);
        }
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleScan = async () => {
    if ((!content.trim() && !file) || loading) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/toolkit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "citation-detective",
          content: content.trim(),
          file: file
        })
      });

      const data = (await res.json()) as { result?: string; error?: string };
      if (data.result) {
        setResult(data.result);
      } else {
        throw new Error(data.error || "Failed to audit research");
      }
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during the scan.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link href="/toolkit" className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition shadow-sm">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
              <Quote size={28} className="text-purple-600" /> Citation Detective
            </h1>
            <p className="text-sm text-slate-500 font-medium tracking-wide border-l-2 border-purple-200 pl-3">Research Auditor & Authority Finder</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Input Side */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BookCheck size={20} className="text-purple-500" /> Research Draft
                </h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Paste content or attach file</span>
              </div>
              
              <div className="relative group">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onPaste={handlePaste}
                  placeholder="Paste the paragraph or legal proposition you're researching. You can also paste or upload an image/PDF (max 2MB)..."
                  className="w-full h-[400px] bg-slate-50 border border-slate-100 rounded-3xl p-6 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all text-slate-900 font-medium placeholder:text-slate-400 resize-none shadow-inner"
                />
                
                {/* File Attachment Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-4 right-4 p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-purple-600 hover:border-purple-200 shadow-sm transition-all active:scale-95 group-hover:shadow-md"
                  title="Attach Image or PDF"
                >
                  <FilePlus size={20} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                  className="hidden"
                />
              </div>

              {/* File Preview Area */}
              {file && (
                <div className="mt-4 p-4 bg-purple-50 border border-purple-100 rounded-2xl animate-in zoom-in-95 duration-200 flex items-center gap-4 relative">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-purple-100 shadow-sm overflow-hidden">
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      file.mimeType === "application/pdf" ? <FileText className="text-purple-500" size={24} /> : <ImageIcon className="text-purple-500" size={24} />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 truncate">File Attached</p>
                    <p className="text-[10px] text-purple-600 font-black uppercase tracking-widest">{file.mimeType.split("/")[1]} • Ready for Audit</p>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-1.5 bg-white border border-purple-100 rounded-lg text-slate-400 hover:text-red-500 transition-colors shadow-sm"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <button
                onClick={handleScan}
                disabled={(!content.trim() && !file) || loading}
                className="w-full mt-6 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={24} className="animate-spin" /> : <><Search size={24} /> Scan for Authorities</>}
              </button>
            </div>
            
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 flex items-start gap-4">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Sparkles size={20} className="text-purple-600" />
              </div>
              <p className="text-xs text-purple-700/80 font-bold leading-relaxed">
                Tip: You can now paste screenshots of legal drafts directly! The AI will analyze the text within the images to find stronger landmark SCC and HC judgments.
              </p>
            </div>
          </div>

          {/* Result Side */}
          <div className="space-y-6">
            <div className={`bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl h-[640px] flex flex-col transition-all duration-500 ${!result && !loading ? 'opacity-50 grayscale' : 'opacity-100 grayscale-0'}`}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles size={20} className="text-purple-400" /> AI Findings
                </h3>
                {result && (
                  <button 
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition border border-white/5"
                  >
                    <Clipboard size={14} /> Copy
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 pt-20">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                      <Search size={24} className="absolute inset-0 m-auto text-purple-400" />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest text-purple-400 animate-pulse">Running Judicial Audit...</p>
                    <p className="text-[10px] text-white/40 font-medium italic">Scanning precedents and verifying citations</p>
                  </div>
                ) : error ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-red-400 space-y-4 pt-20">
                    <AlertCircle size={48} className="animate-bounce" />
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest mb-1">Audit Interrupted</p>
                      <p className="text-xs text-red-300/70 max-w-xs">{error}</p>
                    </div>
                  </div>
                ) : result ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 prose prose-invert prose-purple max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-lg font-bold text-purple-400 mt-6 mb-3" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-base font-bold text-indigo-300 mt-4 mb-2" {...props} />,
                        p: ({node, ...props}) => <p className="text-indigo-100/90 leading-relaxed mb-4 text-sm sm:text-base" {...props} />,
                        ul: ({node, ...props}) => <ul className="space-y-3 mb-6 list-none pl-0" {...props} />,
                        li: ({ children }) => (
                          <li className="flex gap-3 group">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"></span>
                            <span className="text-indigo-100/80 group-hover:text-white transition-colors text-sm sm:text-base">{children}</span>
                          </li>
                        ),
                        strong: ({node, ...props}) => <strong className="text-purple-300 font-bold" {...props} />,
                      }}
                    >
                      {result}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 space-y-4 pt-20">
                    <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 shadow-inner">
                      <Scale size={64} className="opacity-20 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Vault Secure</p>
                      <p className="text-[10px] text-slate-500 font-medium">Input your draft to begin the judicial verification</p>
                    </div>
                  </div>
                )}
              </div>

              {result && (
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Audit Complete • Multi-modal Audit</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
