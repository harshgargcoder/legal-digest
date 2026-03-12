"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { User, Camera, ShieldCheck, Mail, Briefcase, Landmark, Scale, BookOpen, Building2, Activity, Trophy, Shield, X } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("Law Student");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState<{ posts: number; likes: number }>({ posts: 0, likes: 0 });
  const [preferences, setPreferences] = useState<any>({ categories: [], topics: [] });
  const [prefMessage, setPrefMessage] = useState("");

  const roles = [
    "Law Student",
    "Legal Researcher",
    "Advocate",
    "Paralegal",
    "Legal Tech Enthusiast",
    "Explorer"
  ];

  const categories = [
    { name: "Supreme Court", icon: Landmark },
    { name: "High Court", icon: Scale },
    { name: "Constitutional", icon: BookOpen },
    { name: "Corporate & Finance", icon: Building2 },
    { name: "General", icon: Activity },
    { name: "Sports", icon: Trophy },
    { name: "Global", icon: Shield }
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

    const fetchPreferences = async (uid: string) => {
      try {
        const res = await fetch(`/api/user-preferences?userId=${uid}`);
        const data = await res.json();
        if (data.preferences) {
          setPreferences(data.preferences);
        }
      } catch (err) {
        console.error("Failed to fetch preferences", err);
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
        fetchPreferences(currentUser.uid);
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
        photoURL: role 
      });
      setMessage("Profile identity updated successfully.");
    } catch (error) {
      console.error("Error updating profile", error);
      setMessage("Failed to update profile.");
    }

    setSaving(false);
  };

  const handleUpdatePreferences = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch("/api/user-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          categories: preferences.categories || [],
          topics: preferences.topics || []
        })
      });
      if (res.ok) setPrefMessage("Preferences saved!");
      else setPrefMessage("Failed to save.");
    } catch (err) {
      setPrefMessage("Error saving preferences.");
    }
    setSaving(false);
    setTimeout(() => setPrefMessage(""), 3000);
  };

  const toggleCategory = (name: string) => {
    const currentCats = preferences.categories || [];
    const newCats = currentCats.includes(name) 
      ? currentCats.filter((c: string) => c !== name) 
      : [...currentCats, name];
    setPreferences({ ...preferences, categories: newCats });
  };

  const removeTopic = (topic: string) => {
    setPreferences({
      ...preferences,
      topics: (preferences.topics || []).filter((t: string) => t !== topic)
    });
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#030712] pt-32 pb-24 px-4 sm:px-6 text-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto space-y-8">

        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Researcher Profile</h1>
          <p className="text-gray-500 mt-2">Manage your identity and personalization settings.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-gray-900 dark:text-gray-100">
          
          <div className="lg:col-span-1 space-y-6">
            {/* Minimal Stat Card */}
            <div className="bg-white dark:bg-[#0B1221] border border-gray-200 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden p-8 flex flex-col items-center text-center">
              <div className="relative group mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white dark:border-[#0B1221]">
                  {displayName ? displayName[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : "?")}
                </div>
              </div>
              <div className={`mt-2 mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getReputationBadge(stats.likes).color}`}>
                {getReputationBadge(stats.likes).icon} {getReputationBadge(stats.likes).label}
              </div>
              <div className="flex gap-6 mt-4">
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.posts}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Posts</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.likes}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Likes</p>
                </div>
              </div>
            </div>

            {/* Personalization Sidebar Widget */}
            <div className="bg-white dark:bg-[#0B1221] border border-gray-200 dark:border-white/10 rounded-3xl shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-indigo-500" /> My Personalization
              </h3>
              
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Saved Categories</p>
                <div className="flex flex-wrap gap-2 text-gray-900 dark:text-gray-100">
                  {preferences?.categories?.length > 0 ? preferences.categories.map((cat: string) => (
                    <span key={cat} className="px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-md border border-indigo-100 dark:border-indigo-500/20 uppercase tracking-wider">
                      {cat}
                    </span>
                  )) : <p className="text-xs text-gray-500 italic">No categories selected</p>}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Followed Topics</p>
                <div className="flex flex-wrap gap-2">
                  {preferences?.topics?.length > 0 ? preferences.topics.map((topic: string) => (
                    <span key={topic} className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 text-[10px] font-bold rounded-md border border-gray-200 dark:border-white/10 uppercase tracking-wider group/t">
                      #{topic}
                      <button onClick={() => removeTopic(topic)} className="hover:text-red-500 transition-colors">
                        <X size={10} />
                      </button>
                    </span>
                  )) : <p className="text-xs text-gray-500 italic">No topics followed</p>}
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleUpdatePreferences}
                  disabled={saving}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/10 active:scale-95 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Apply Preferences"}
                </button>
                {prefMessage && <p className={`text-[10px] text-center mt-2 ${prefMessage.includes('Failed') ? 'text-red-500' : 'text-emerald-500'}`}>{prefMessage}</p>}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-[#0B1221] border border-gray-200 dark:border-white/10 rounded-3xl shadow-sm p-8 text-gray-900 dark:text-gray-100">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <User size={20} className="text-indigo-500" /> Identity Settings
              </h3>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Designation
                    </label>
                    <div className="relative">
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none transition-all"
                      >
                        {roles.map(r => (
                          <option key={r} value={r} className="dark:bg-[#0B1221]">{r}</option>
                        ))}
                      </select>
                      <Briefcase size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
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
                  {message && <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{message}</span>}
                  <button
                    type="submit"
                    disabled={saving || (displayName === (user.displayName || "") && role === (user.photoURL || "Law Student"))}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {saving ? "Updating..." : "Save Identity"}
                  </button>
                </div>
              </form>
            </div>

            {/* Preference Editor (Categories) */}
            <div className="bg-white dark:bg-[#0B1221] border border-gray-200 dark:border-white/10 rounded-3xl shadow-sm p-8 text-gray-900 dark:text-gray-100">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 font-bold">Personalize Categories</h3>
              <p className="text-sm text-gray-500 mb-6 font-bold">Select categories to prioritize in your feed.</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = preferences?.categories?.includes(cat.name);
                  return (
                    <button
                      key={cat.name}
                      onClick={() => toggleCategory(cat.name)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-sm font-medium ${
                        isSelected 
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                          : "bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-indigo-400/50"
                      }`}
                    >
                      <Icon size={18} className={isSelected ? "text-white" : "text-indigo-400"} />
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 text-gray-900 dark:text-gray-100">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Manual Topics</h4>
                <div className="flex flex-wrap gap-2 text-gray-900 dark:text-gray-100">
                  {preferences?.topics?.map((topic: string) => (
                    <div key={topic} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-medium">
                      {topic}
                      <button onClick={() => removeTopic(topic)} className="text-gray-400 hover:text-red-500">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {(!preferences?.topics || preferences.topics.length === 0) && (
                    <p className="text-xs text-gray-500 italic">No custom topics added yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
