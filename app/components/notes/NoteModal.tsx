"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  FileText,
  Download,
  UploadCloud,
  Send,
  Save,
  Trash2,
  Sparkles,
  Paperclip,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import {
  type LegalNote,
  saveLocalNote,
  exportNoteAsPdf,
} from "@/lib/notes-storage";
import { useRouter } from "next/navigation";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  noteToEdit?: LegalNote | null;
  userId?: string;
  onSaved?: (note: LegalNote) => void;
}

export default function NoteModal({
  isOpen,
  onClose,
  noteToEdit,
  userId,
  onSaved,
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when editing or opening
  useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title || "");
      setSubtitle(noteToEdit.subtitle || "");
      setContent(noteToEdit.content || "");
      setPdfName(noteToEdit.pdfName || null);
      setPdfDataUrl(noteToEdit.pdfDataUrl || null);
    } else {
      setTitle("");
      setSubtitle("");
      setContent("");
      setPdfName(null);
      setPdfDataUrl(null);
    }
    setSavedSuccess(false);
  }, [noteToEdit, isOpen]);

  if (!isOpen) return null;

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      alert("Please upload a valid PDF document.");
      return;
    }

    setPdfName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPdfDataUrl(result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert("Please enter a title for your legal note.");
      return;
    }

    setSaving(true);
    const now = new Date().toISOString();
    const noteId = noteToEdit?.id || `note_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const savedNote: LegalNote = {
      id: noteId,
      userId: userId || noteToEdit?.userId,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      content: content.trim(),
      pdfName,
      pdfDataUrl,
      createdAt: noteToEdit?.createdAt || now,
      updatedAt: now,
    };

    saveLocalNote(savedNote);
    onSaved?.(savedNote);
    setSaving(false);
    setSavedSuccess(true);

    setTimeout(() => {
      onClose();
    }, 700);
  };

  const handleExportPdf = () => {
    if (!title.trim()) {
      alert("Please provide at least a title to export as PDF.");
      return;
    }

    const tempNote: LegalNote = {
      id: "export_temp",
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    exportNoteAsPdf(tempNote);
  };

  const handlePublishToCommunity = () => {
    if (!title.trim() && !content.trim()) {
      alert("Please write something in your note before publishing to Community.");
      return;
    }

    // Save note first
    handleSave();

    // Store draft for community page
    try {
      sessionStorage.setItem(
        "community_draft_post",
        JSON.stringify({
          title: title.trim(),
          subtitle: subtitle.trim(),
          content: content.trim(),
        }),
      );
    } catch {
      // Ignore
    }

    router.push("/community?source=note");
    onClose();
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-slate-900 text-white border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                {noteToEdit ? "Edit Legal Note" : "Write Quick Legal Note"}
              </h3>
              <p className="text-[11px] text-slate-400">
                Create structured research notes, attach PDFs & export anytime
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-slate-800 dark:text-slate-100">
          {/* Note Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Note Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Ratio in Kesavananda Bharati (1973) • Basic Structure"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* Subtitle / Legal Domain */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Subtitle / Category / Citations (Optional)
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Constitutional Bench • Article 368 & Article 13 Analysis"
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Main Content Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Note Content & Research Memorandum
              </label>
              <span className="text-[10px] font-mono text-slate-400">
                {wordCount} words • {charCount} chars
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your legal arguments, ratio decidendi, case facts, dissenting opinions, or personal research notes here..."
              rows={8}
              className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed resize-y"
            />
          </div>

          {/* PDF Attachment Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Paperclip size={13} className="text-indigo-500" />
                Attach PDF Document (Optional)
              </span>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePdfUpload}
                accept="application/pdf,.pdf"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition"
              >
                <UploadCloud size={13} />
                {pdfName ? "Replace PDF" : "Upload PDF"}
              </button>
            </div>

            {/* Attached PDF Card */}
            {pdfName && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="text-base">📄</span>
                  <div className="truncate">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{pdfName}</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      PDF Document Attached
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {pdfDataUrl && (
                    <a
                      href={pdfDataUrl}
                      download={pdfName}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                    >
                      Download
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setPdfName(null);
                      setPdfDataUrl(null);
                    }}
                    className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                    title="Remove PDF"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 flex-shrink-0">
          <div className="flex items-center gap-2">
            {/* Export as PDF */}
            <button
              type="button"
              onClick={handleExportPdf}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 transition shadow-xs"
              title="Generate clean formatted PDF"
            >
              <Download size={13} />
              <span>Export as PDF</span>
            </button>

            {/* Publish to Community */}
            <button
              type="button"
              onClick={handlePublishToCommunity}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 transition shadow-xs"
              title="Publish note to Community Feed"
            >
              <Send size={13} />
              <span>Upload to Community</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-bold hover:bg-black dark:hover:bg-indigo-500 transition shadow-sm active:scale-95 disabled:opacity-50"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>{noteToEdit ? "Update Note" : "Save Note"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

