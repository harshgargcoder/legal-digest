"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isDarkMode: boolean;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isDarkMode,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className={`relative w-full max-w-md transform overflow-hidden rounded-3xl border shadow-2xl transition-all ${
          isDarkMode 
            ? "bg-slate-900 border-slate-800 text-white" 
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2">
          <div className={`p-3 rounded-2xl ${
            isDestructive 
              ? (isDarkMode ? "bg-rose-500/10 text-rose-500" : "bg-rose-50 text-rose-600")
              : (isDarkMode ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600")
          }`}>
            <AlertTriangle size={24} />
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDarkMode ? "hover:bg-slate-800 text-slate-500" : "hover:bg-slate-50 text-slate-400"
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pt-4 pb-6">
          <h3 className="text-xl font-black tracking-tight mb-2">{title}</h3>
          <p className={`text-sm font-medium leading-relaxed ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}>
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 ${
          isDarkMode ? "bg-slate-800/30" : "bg-slate-50/50"
        }`}>
          <button
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
              isDarkMode 
                ? "text-slate-400 hover:bg-slate-800 hover:text-white" 
                : "text-slate-500 hover:bg-white hover:shadow-sm"
            }`}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all cursor-pointer ${
              isDestructive 
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20" 
                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
