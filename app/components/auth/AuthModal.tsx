import Image from "next/image";
import { useState, useEffect } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AuthModal({ isOpen, onClose }: Props) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in duration-300">

      <div className="w-full max-w-[400px] 
                bg-white
                border border-gray-200
                rounded-3xl 
                p-8 sm:p-10
                shadow-[0_20px_50px_rgba(0,0,0,0.1)] 
                relative overflow-hidden
                transform transition-all
                animate-in zoom-in-95 duration-300">

        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/new_logo.png"
            alt="Legal Digest"
            width={160}
            height={56}
            className="object-contain h-auto"
          />
          <p className="mt-3 text-sm text-slate-600 text-center tracking-wide font-semibold">
            Researcher Access Terminal
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-xs text-center mb-4 font-medium">
            {error}
          </p>
        )}

        {/* Google Button */}
        <button
          onClick={async () => {
            setLoading(true);
            try {
              await signInWithPopup(auth, googleProvider);
              onClose();
            } catch (err: any) {
              setError(err.message);
            }
            setLoading(false);
          }}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3
                   border border-gray-200
                   bg-white
                   py-3.5 rounded-2xl
                   text-sm font-bold text-slate-700
                   transition-all duration-300
                   hover:bg-slate-50
                   hover:border-indigo-300
                   hover:shadow-lg hover:shadow-indigo-500/10
                   active:scale-[0.98]
                   cursor-pointer disabled:opacity-50"
        >
          {loading ? (
             <span className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin"></span>
          ) : (
            <Image
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              width={20}
              height={20}
            />
          )}
          {loading ? "Connecting..." : "Continue with Google"}
        </button>

        <p className="mt-6 text-[11px] text-slate-400 text-center leading-relaxed px-4">
          By continuing, you agree to our terms of service and professional conduct guidelines.
        </p>

        {/* Close */}
        <button
          onClick={onClose}
          className="mt-6 w-full text-xs font-bold text-slate-500 
                   hover:text-indigo-600 cursor-pointer transition uppercase tracking-widest"
        >
          Cancel
        </button>

      </div>
    </div>
  );
}
