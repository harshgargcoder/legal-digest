"use client";

import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";

interface ObjectionButtonProps {
  onClick: () => void;
}

export function ObjectionButton({ onClick }: ObjectionButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-8 right-8 z-[100] bg-red-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(220,38,38,0.3)] flex items-center gap-3 border-2 border-red-500/50 backdrop-blur-sm group overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <ShieldAlert size={18} className="group-hover:animate-shake relative z-10" />
      <span className="relative z-10 text-xs">Objection!</span>
    </motion.button>
  );
}
