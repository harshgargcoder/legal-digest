"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { User, Camera, ShieldCheck, Mail, Briefcase } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("Law Student");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState<{ posts: number; likes: number }>({ posts: 0, likes: 0 });

  const roles = [
    "Law Student",
    "Legal Researcher",
    "Advocate",
    "Paralegal",
    "Legal Tech Enthusiast",
    "Explorer"
  ];

  useEffect(() => {
    const fetchUserStats = async (uid: string) => {
      try {
        const res = await fetch("/api/community");
        const data = await res.json();
        if (data.posts) {
          const userPosts = data.posts.filter((p: any) => p.user_id === uid);
          const totalLikes = userPosts.reduce((sum: number, p: any) => sum + (p.likes?.length || 0), 0);
          setStats({ posts: userPosts.length, likes: totalLikes });
        }
      } catch (err) {
        console.error("Failed to load user stats");
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setDisplayName(currentUser.displayName || "");
        if (currentUser.photoURL && roles.includes(currentUser.photoURL)) {
          setRole(currentUser.photoURL);
        }
        fetchUserStats(currentUser.uid);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getReputationBadge = (totalLikes: number) => {
    if (totalLikes >= 20) return { label: "Expert", color: "text-amber-400 bg-amber-400/10 border-amber-500/30", icon: "🌟" };
    if (totalLikes >= 5) return { label: "Scholar", color: "text-purple-400 bg-purple-400/10 border-purple-500/30", icon: "🎓" };
    return { label: "Novice", color: "text-blue-400 bg-blue-400/10 border-blue-500/30", icon: "🌱" };
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setMessage("");

    try {
      await updateProfile(user, {
        displayName: displayName,
        photoURL: role // Using photoURL field to store the role internally
      });
      setMessage("Profile identity updated successfully.");
    } catch (error) {
      console.error("Error updating profile", error);
      setMessage("Failed to update profile.");
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#030712] flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#030712] flex justify-center items-center flex-col text-center p-6">
        <ShieldCheck size={48} className="text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold dark:text-white mb-2">Authentication Required</h1>
        <p className="text-gray-500 max-w-sm">Please log in to manage your Legal Digest researcher profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#030712] pt-32 pb-24 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Researcher Profile</h1>
          <p className="text-gray-500 mt-2">Manage your identity and authentication settings.</p>
        </div>

        <div className="bg-white dark:bg-[#0B1221] border border-gray-200 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row">
          
          {/* Avatar Section */}
          <div className="bg-gray-100 dark:bg-black/20 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/10 md:w-1/3 text-center">
            
            <div className="relative group cursor-pointer mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white dark:border-[#0B1221]">
                {displayName ? displayName[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : "?")}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera size={24} className="text-white" />
              </div>
            </div>

            <div className={`mt-2 mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getReputationBadge(stats.likes).color}`}>
              {getReputationBadge(stats.likes).icon} {getReputationBadge(stats.likes).label}
            </div>

            <span className="text-xs font-medium px-3 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-lg uppercase tracking-wider text-center w-full">
              {role}
            </span>

            <div className="mt-6 flex gap-6 text-center">
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.posts}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Posts</p>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.likes}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Likes</p>
              </div>
            </div>
            
          </div>

          {/* Form Section */}
          <div className="p-8 md:w-2/3">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User size={16} className="text-gray-400" /> Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                />
                <p className="text-xs text-gray-500 mt-2">This is the name that will appear on your Community Blog posts.</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Briefcase size={16} className="text-gray-400" /> Designation / Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none appearance-none"
                >
                  {roles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">How do you primarily identify yourself in the legal field?</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail size={16} className="text-gray-400" /> Email Address
                </label>
                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-black/50 border border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-70"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{message}</span>
                <button
                  type="submit"
                  disabled={saving || (displayName === (user.displayName || "") && role === (user.photoURL || "Law Student"))}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                >
                  {saving ? "Updating..." : "Save Identity"}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
