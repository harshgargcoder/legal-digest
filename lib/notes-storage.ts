import { jsPDF } from "jspdf";

export interface LegalNote {
  id: string;
  userId?: string;
  title: string;
  subtitle?: string;
  content: string;
  pdfName?: string | null;
  pdfDataUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "legaldigest_user_notes_v1";

export function getLocalNotes(userId?: string): LegalNote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const notes: LegalNote[] = JSON.parse(raw);
    if (!Array.isArray(notes)) return [];
    if (userId) {
      // Filter for this user or notes created without user
      return notes.filter((n) => !n.userId || n.userId === userId);
    }
    return notes;
  } catch {
    return [];
  }
}

export function saveLocalNote(note: LegalNote): LegalNote[] {
  if (typeof window === "undefined") return [];
  const current = getLocalNotes();
  const existingIdx = current.findIndex((n) => n.id === note.id);

  let updated: LegalNote[];
  if (existingIdx >= 0) {
    updated = current.map((n) => (n.id === note.id ? note : n));
  } else {
    updated = [note, ...current];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("legaldigest_notes_updated"));
  } catch (err) {
    console.error("Failed to persist note", err);
  }

  return updated;
}

export function deleteLocalNote(id: string): LegalNote[] {
  if (typeof window === "undefined") return [];
  const current = getLocalNotes();
  const updated = current.filter((n) => n.id !== id);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("legaldigest_notes_updated"));
  } catch (err) {
    console.error("Failed to delete note", err);
  }

  return updated;
}

// Generate & Download Styled Legal PDF using jsPDF
export function exportNoteAsPdf(note: LegalNote) {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    // Header bar
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 18, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("LEGAL DIGEST • RESEARCH NOTE & LEGAL MEMORANDUM", margin, 12);

    // Title
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    const splitTitle = doc.splitTextToSize(note.title || "Untitled Note", contentWidth);
    doc.text(splitTitle, margin, 32);

    let yPos = 32 + splitTitle.length * 8;

    // Subtitle
    if (note.subtitle) {
      doc.setTextColor(79, 70, 229); // indigo-600
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(note.subtitle, margin, yPos);
      yPos += 7;
    }

    // Metadata line
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const dateStr = `Date: ${new Date(note.updatedAt || note.createdAt).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`;
    doc.text(dateStr, margin, yPos);
    yPos += 4;

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Content Body
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const splitContent = doc.splitTextToSize(note.content || "No content provided.", contentWidth);
    
    // Check page overflows
    for (let i = 0; i < splitContent.length; i++) {
      if (yPos > 275) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(splitContent[i], margin, yPos);
      yPos += 5.5;
    }

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Created with Legal Digest Research Terminal", margin, pageHeight - 10);

    const filename = `${(note.title || "legal-note").toLowerCase().replace(/[^a-z0-9]/g, "-")}.pdf`;
    doc.save(filename);
  } catch (err) {
    console.error("PDF generation failed:", err);
    alert("Could not generate PDF. Please try again.");
  }
}

