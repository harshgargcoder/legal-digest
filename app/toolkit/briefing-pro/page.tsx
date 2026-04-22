"use client";

import { useState, useRef } from "react";
import { Scale, FileText, Sparkles, ChevronLeft, Loader2, AlertCircle, FilePlus, X, Image as ImageIcon, Clipboard, Download, ChevronDown, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { motion, AnimatePresence } from "framer-motion";

export default function BriefingProPage() {
  const [content, setContent] = useState("");
  const [result, setResult] = useState<{ brief: string, takeaway: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<{ data: string, mimeType: string } | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
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

  const handleGenerateBrief = async () => {
    if ((!content.trim() && !file) || loading) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/toolkit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "briefing-pro",
          content: content.trim(),
          file: file
        })
      });

      const data = (await res.json()) as { result?: string; error?: string };
      if (data.result) {
        try {
          const jsonStr = data.result.replace(/```json\n?|```/g, "").trim();
          const parsed = JSON.parse(jsonStr) as { brief: string, takeaway: string };
          setResult(parsed);
        } catch (err) {
          console.error("Failed to parse AI response:", err);
          setResult({ brief: data.result, takeaway: "Analysis complete. Review the brief above." });
        }
      } else {
        throw new Error(data.error || "Failed to generate brief");
      }
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const downloadBrief = async (format: 'txt' | 'docx' | 'pdf') => {
    if (!result) return;
    setDownloadMenuOpen(false);

    const fileName = `Legal_Brief_${new Date().getTime()}`;
    const textToSave = `${result.brief}\n\nPRO-TIP:\n${result.takeaway}`;

    if (format === 'txt') {
      const element = document.createElement("a");
      const file = new Blob([textToSave], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${fileName}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      const splitText = doc.splitTextToSize(textToSave, 180);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(splitText, 15, 20);
      doc.save(`${fileName}.pdf`);
    } else if (format === 'docx') {
      const doc = new Document({
        sections: [{
          properties: {},
          children: textToSave.split('\n').map(line => 
            new Paragraph({
              children: [new TextRun({ text: line, size: 24 })],
            })
          ),
        }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
              <Scale size={28} className="text-blue-600" /> Briefing Pro
            </h1>
            <p className="text-sm text-slate-500 font-medium tracking-wide border-l-2 border-blue-200 pl-3">
              Case Briefing & Document Explanation <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black uppercase">Gemini 3 Flash</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Input Side */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText size={20} className="text-blue-500" /> Case Material
                </h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload PDF/Image or Paste Facts</span>
              </div>
              
              <div className="relative group">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onPaste={handlePaste}
                  placeholder="Paste the case facts, legal document snippet, or upload a file. Gemini 3 Flash will analyze and brief it for you..."
                  className="w-full h-[400px] bg-slate-50 border border-slate-100 rounded-3xl p-6 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-slate-900 font-medium placeholder:text-slate-400 resize-none shadow-inner"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-4 right-4 p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all active:scale-95 group-hover:shadow-md"
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

              {file && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4 relative">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-blue-100 shadow-sm overflow-hidden">
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      file.mimeType === "application/pdf" ? <FileText className="text-blue-500" size={24} /> : <ImageIcon className="text-blue-500" size={24} />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 truncate">Document Attached</p>
                    <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{file.mimeType.split("/")[1]} • Process with Gemini 3 Flash</p>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-1.5 bg-white border border-blue-100 rounded-lg text-slate-400 hover:text-red-500 transition-colors shadow-sm"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <button
                onClick={handleGenerateBrief}
                disabled={(!content.trim() && !file) || loading}
                className="w-full mt-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={24} className="animate-spin" /> : <><Sparkles size={24} /> Generate Brief</>}
              </button>
            </motion.div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-start gap-4 shadow-xl mt-6">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <Sparkles size={20} className="text-blue-400" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-white font-bold">Gemini 3 Flash Integrated</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Frontier-class performance for rapid legal analysis. Optimized for speed and high-precision briefing.
                </p>
              </div>
            </div>
            

          </div>

          {/* Result Side */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-2xl h-[640px] flex flex-col transition-all duration-500 ${!result && !loading ? 'opacity-50 grayscale' : 'opacity-100 grayscale-0'}`}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles size={20} className="text-blue-500" /> Case Brief
                </h3>
                {result && (
                  <div className="flex items-center gap-2 relative">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(result.brief);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-xl transition border border-slate-100"
                    >
                      <Clipboard size={14} /> Copy
                    </button>
                    
                    <div className="relative">
                      <button 
                        onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
                        className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition shadow-lg shadow-blue-600/20"
                      >
                        <Download size={14} /> Download <ChevronDown size={12} className={`transition-transform ${downloadMenuOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {downloadMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                          <button 
                            onClick={() => downloadBrief('docx')}
                            className="w-full px-4 py-3 text-left text-[10px] font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 flex items-center gap-3 transition-colors border-b border-slate-50"
                          >
                            <FileText size={14} className="text-blue-400" /> MS Word (.docx)
                          </button>
                          <button 
                            onClick={() => downloadBrief('pdf')}
                            className="w-full px-4 py-3 text-left text-[10px] font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 flex items-center gap-3 transition-colors border-b border-slate-50"
                          >
                            <FilePlus size={14} className="text-red-400" /> PDF Document (.pdf)
                          </button>
                          <button 
                            onClick={() => downloadBrief('txt')}
                            className="w-full px-4 py-3 text-left text-[10px] font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 flex items-center gap-3 transition-colors"
                          >
                            <FileText size={14} className="text-slate-400" /> Plain Text (.txt)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                      <Scale size={24} className="absolute inset-0 m-auto text-blue-400" />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest text-blue-500 animate-pulse">Gemini is briefing...</p>
                    <p className="text-[10px] text-slate-400 font-medium italic">Analyzing facts and extracting legal issues</p>
                  </div>
                ) : error ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-red-500 space-y-4">
                    <AlertCircle size={48} className="text-red-200" />
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest mb-1">Briefing Interrupted</p>
                      <p className="text-xs text-red-400/70 max-w-xs">{error}</p>
                    </div>
                  </div>
                ) : result ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="prose prose-slate prose-blue max-w-none mb-8">
                      <ReactMarkdown
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-xl font-black text-slate-900 mb-4 border-b border-slate-100 pb-2" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-lg font-bold text-blue-600 mt-6 mb-3" {...props} />,
                          p: ({node, ...props}) => <p className="text-slate-600 leading-relaxed mb-4 text-sm" {...props} />,
                          ul: ({node, ...props}) => <ul className="space-y-3 mb-6 list-none pl-0" {...props} />,
                          li: ({ children }) => (
                            <li className="flex gap-3 items-start">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                              <span className="text-slate-600 text-sm">{children}</span>
                            </li>
                          ),
                          strong: ({node, ...props}) => <strong className="text-slate-900 font-bold" {...props} />,
                        }}
                      >
                        {result.brief}
                      </ReactMarkdown>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6">
                      <h4 className="text-xs font-black uppercase tracking-widest text-blue-600 mb-2 flex items-center gap-2">
                        <Scale size={14} /> Advocate's Takeaway
                      </h4>
                      <p className="text-sm text-blue-900/80 font-medium italic leading-relaxed">
                        "{result.takeaway}"
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-300 space-y-4">
                    <div className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100 shadow-inner">
                      <FileText size={64} className="opacity-20" />
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Briefing Vault</p>
                      <p className="text-[10px] text-slate-400 font-medium">Input your case material to generate a brief</p>
                    </div>
                  </div>
                )}
              </div>

              {result && (
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Analysis Complete • Gemini 3 Flash</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

        </div>

      </div>
    </div>
  );
}
