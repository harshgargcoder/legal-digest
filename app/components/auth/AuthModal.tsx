import Image from "next/image";
import { useState, useEffect } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AuthModal({ isOpen, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const validate = () => {
    if (!email || !password) {
      return "All fields are required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Enter a valid email address.";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    return "";
  };

  const handleLogin = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose();
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  };

  const handleSignup = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setError("Account created successfully. You are now logged in.");
      onClose();
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-[#020617]/80 backdrop-blur-lg flex items-center justify-center z-[200] p-4 animate-in fade-in duration-300">

      <div className="w-full max-w-[420px] 
                bg-white/5 dark:bg-[#0b1220]/90
                border border-white/20 dark:border-indigo-500/20
                rounded-3xl 
                p-8 sm:p-10
                shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)] 
                backdrop-blur-xl
                relative overflow-hidden
                transform transition-all
                animate-in zoom-in-95 duration-300">

        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/new_logo.png"
            alt="Legal Digest"
            width={160}
            height={56}
            className="object-contain h-auto"
          />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 text-center tracking-wide font-medium">
            Access the Legal Terminal
          </p>
        </div>


        {/* Email */}
        <div className="relative mb-4">
          <input
            type="email"
            placeholder="Researcher Email"
            className="w-full border border-gray-300 dark:border-white/10 
                     bg-white/50 dark:bg-black/20 
                     px-4 py-3 rounded-xl 
                     text-sm dark:text-white
                     outline-none 
                     focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 
                     transition-all shadow-inner"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="relative mb-5">
          <input
            type="password"
            placeholder="Security Key"
            className="w-full border border-gray-300 dark:border-white/10 
                     bg-white/50 dark:bg-black/20 
                     px-4 py-3 rounded-xl 
                     text-sm dark:text-white
                     outline-none 
                     focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 
                     transition-all shadow-inner"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-xs text-center mb-4">
            {error}
          </p>
        )}

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full 
                   bg-gradient-to-r from-indigo-600 to-purple-600 
                   text-white 
                   py-3 rounded-xl mb-3 
                   font-semibold text-sm
                   shadow-[0_4px_14px_0_rgba(99,102,241,0.39)]
                   transition-all duration-200 
                   hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:scale-[1.01] 
                   active:scale-[0.98] 
                   cursor-pointer disabled:opacity-60 relative overflow-hidden"
        >
          {loading ? "Authenticating..." : "Authorize Access"}
        </button>

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full text-center text-xs text-indigo-500 hover:text-indigo-400 font-medium transition mb-5"
        >
          Don't have clearance? Request Account
        </button>

        {/* Divider */}
        <div className="flex items-center my-5">
          <div className="flex-grow h-px bg-gray-200 dark:bg-white/10"></div>
          <span className="px-4 text-[11px] uppercase tracking-wider text-gray-400">Secure SSO</span>
          <div className="flex-grow h-px bg-gray-200 dark:bg-white/10"></div>
        </div>

        {/* Google Button */}
        <button
          onClick={async () => {
            try {
              await signInWithPopup(auth, googleProvider);
              onClose();
            } catch (err: any) {
              setError(err.message);
            }
          }}
          className="w-full flex items-center justify-center gap-3
                   border border-gray-200 dark:border-white/10
                   bg-white/50 dark:bg-black/20
                   py-3 rounded-xl
                   text-sm font-medium text-gray-700 dark:text-gray-300
                   transition-all duration-200
                   hover:bg-gray-50 dark:hover:bg-white/5
                   hover:border-gray-300 dark:hover:border-white/20
                   hover:shadow-md
                   active:scale-[0.98]
                   cursor-pointer"
        >
          <Image
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            width={18}
            height={18}
          />
          Continue with Google
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          className="mt-6 w-full text-sm text-gray-500 dark:text-gray-400 
                   hover:underline cursor-pointer transition"
        >
          Close
        </button>

      </div>
    </div>
  );
}
