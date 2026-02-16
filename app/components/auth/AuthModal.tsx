import Image from "next/image";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AuthModal({ isOpen, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      onClose();
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

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setError("Check your email for confirmation.");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">

      <div className="w-[380px] 
                    bg-white/90 dark:bg-zinc-900/90 
                    backdrop-blur-xl 
                    border border-white/20 dark:border-zinc-700 
                    rounded-3xl 
                    p-8 
                    shadow-2xl 
                    transition-all duration-300">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          {/* Dark mode logo */}
          <Image
            src="/logo-light.png"
            alt="Legal Digest"
            width={180}
            height={20}
            className="hidden dark:block"
          />
          {/* Light mode logo */}
          <Image
            src="/logo-dark.png"
            alt="Legal Digest"
            width={180}
            height={20}
            className="block dark:hidden"
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-500 text-center tracking-wide">
            Clarity in Law. Insight for the World.
          </p>
        </div>


        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="w-full border border-gray-300 dark:border-zinc-700 
                   bg-white dark:bg-zinc-800 
                   px-3 py-2 mb-4 rounded-xl 
                   outline-none 
                   focus:ring-2 focus:ring-black dark:focus:ring-white 
                   transition"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className="w-full border border-gray-300 dark:border-zinc-700 
                   bg-white dark:bg-zinc-800 
                   px-3 py-2 mb-3 rounded-xl 
                   outline-none 
                   focus:ring-2 focus:ring-black dark:focus:ring-white 
                   transition"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

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
                   bg-black dark:bg-white 
                   text-white dark:text-black 
                   py-2.5 rounded-xl mb-4 
                   font-medium
                   transition-all duration-200 
                   hover:shadow-lg hover:scale-[1.02] 
                   active:scale-[0.97] 
                   cursor-pointer disabled:opacity-60"
        >
          {loading ? "Processing..." : "Login"}
        </button>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-300 dark:bg-zinc-700"></div>
          <span className="px-3 text-xs text-gray-500">OR</span>
          <div className="flex-grow h-px bg-gray-300 dark:bg-zinc-700"></div>
        </div>

        {/* Google Button */}
        <button
          onClick={async () => {
            await supabase.auth.signInWithOAuth({
              provider: "google",
              options: { redirectTo: window.location.origin },
            });
          }}
          className="w-full flex items-center justify-center gap-3
                   border border-gray-300 dark:border-zinc-600
                   py-2.5 rounded-xl
                   font-medium
                   transition-all duration-200
                   hover:bg-gray-100 dark:hover:bg-zinc-800
                   hover:shadow-md
                   active:scale-[0.97]
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
