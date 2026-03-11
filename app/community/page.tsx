"use client";

import { useEffect, useState, useRef } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Send, UploadCloud, Users, CheckCircle2, ShieldAlert, Image as ImageIcon, Heart, MessageCircle, Trash2, Edit2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CommunityPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"feed" | "publish">("feed");

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Interaction states
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [interactingPost, setInteractingPost] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    fetchPosts();
    return () => unsubscribe();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/community");
      const data = await res.json();
      if (!data.error) {
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Failed to load community posts");
    }
    setLoading(false);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const wordCount = content.trim().split(/\s+/).length;
    if (wordCount > 1000) {
      setError("Content exceeds the 1000 word limit.");
      return;
    }
    setError("");
    setMessage("");
    setIsPublishing(true);

    let mediaUrl = "";

    try {
      if (file && !mediaUrl) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("userId", user.uid);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();

        if (uploadData.error) throw new Error(uploadData.error);
        mediaUrl = uploadData.url;
      }

      const res = await fetch("/api/community", {
        method: editingPostId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPostId || undefined,
          userId: user.uid,
          authorName: user.displayName || "Anonymous Researcher",
          authorRole: user.photoURL || "Law Student",
          authorAvatar: user.displayName ? user.displayName[0].toUpperCase() : "?",
          title,
          content,
          mediaUrl: mediaUrl || undefined,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessage(editingPostId ? "Insight updated successfully." : "Insight published successfully.");
      setTitle("");
      setContent("");
      setFile(null);
      setEditingPostId(null);

      // Refresh feed
      await fetchPosts();
      setTimeout(() => {
        setActiveTab("feed");
        setMessage("");
      }, 1500);

    } catch (err: any) {
      setError(err.message || "Failed to publish insight.");
    }
    setIsPublishing(false);
  };

  const handleEditClick = (post: any) => {
    setEditingPostId(post.id);
    setTitle(post.title);
    const parsed = parseContent(post);
    setContent(parsed.text);
    setActiveTab("publish");
  };

  const handleDeletePost = async (postId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this insight?")) return;
    try {
      const res = await fetch(`/api/community?id=${postId}&userId=${user.uid}`, { method: "DELETE" });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
      }
    } catch (err) {
      console.error("Failed to delete post", err);
    }
  };

  const renderMedia = (url: string) => {
    if (!url) return null;
    const isVideo = url.match(/\.(mp4|webm|ogg)$/i);
    if (isVideo) {
      return (
        <video controls className="w-full max-h-96 object-cover rounded-xl mt-4 border border-white/10">
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }
    return (
      <div className="relative w-full h-64 sm:h-96 mt-4 rounded-xl overflow-hidden border border-white/10">
        <Image src={url} alt="Post media" fill className="object-cover hover:scale-105 transition-transform duration-700" />
      </div>
    );
  };

  const parseContent = (post: any) => {
    try {
      return JSON.parse(post.content);
    } catch {
      return { text: post.content, authorName: "Unknown", authorRole: "Unknown", authorAvatar: "?" };
    }
  };

  const getReputationBadge = (userId: string, allPosts: any[]) => {
    const totalLikes = allPosts
      .filter(p => p.user_id === userId)
      .reduce((sum, p) => sum + (p.likes?.length || 0), 0);

    if (totalLikes >= 20) return { label: "Expert", color: "text-amber-400 bg-amber-400/10 border-amber-500/30", icon: "🌟" };
    if (totalLikes >= 5) return { label: "Scholar", color: "text-purple-400 bg-purple-400/10 border-purple-500/30", icon: "🎓" };
    return { label: "Novice", color: "text-blue-400 bg-blue-400/10 border-blue-500/30", icon: "🌱" };
  };

  const handleToggleLike = async (postId: string) => {
    if (!user) return alert("Please log in to like insights.");

    // Optimistic UI update
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const hasLiked = p.likes?.some((l: any) => l.user_id === user.uid);
        const newLikes = hasLiked
          ? p.likes.filter((l: any) => l.user_id !== user.uid)
          : [...(p.likes || []), { user_id: user.uid }];
        return { ...p, likes: newLikes };
      }
      return p;
    }));

    try {
      await fetch("/api/community/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId: user.uid })
      });
    } catch (err) {
      console.error("Like failed", err);
      fetchPosts(); // Revert on failure
    }
  };

  const handlePostComment = async (postId: string) => {
    if (!user) return alert("Please log in to comment.");
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    setInteractingPost(postId);

    try {
      const res = await fetch("/api/community/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          userId: user.uid,
          authorName: user.displayName || "Anonymous Researcher",
          authorAvatar: user.displayName ? user.displayName[0].toUpperCase() : "?",
          content
        })
      });
      const data = await res.json();
      if (data.comment) {
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return { ...p, comments: [...(p.comments || []), data.comment] };
          }
          return p;
        }));
        setCommentInputs(prev => ({ ...prev, [postId]: "" }));
      }
    } catch (err) {
      console.error("Comment failed", err);
    }
    setInteractingPost(null);
  };

  return (
    <div className="min-h-screen bg-[#030712] pt-32 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">

        {/* Header Section */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-full mb-4 ring-1 ring-indigo-500/30">
            <Users size={28} className="text-indigo-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Community Insights</h1>
          <p className="text-gray-400 max-w-lg mx-auto">Publish your legal analysis, share opinions on recent judgments, and read insights from verified peers.</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab("feed")}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === "feed" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"}`}
          >
            Terminal Feed
          </button>
          <button
            onClick={() => setActiveTab("publish")}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === "publish" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"}`}
          >
            Publish Insight
          </button>
        </div>

        {/* Content Area */}
        {activeTab === "feed" ? (
          /* FEED VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {loading ? (
              <div className="flex justify-center p-12">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                <p className="text-gray-400 mb-4">No community insights have been published yet.</p>
                <button
                  onClick={() => setActiveTab("publish")}
                  className="px-6 py-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl hover:bg-indigo-600/30 transition"
                >
                  Be the first to publish
                </button>
              </div>
            ) : (
              posts.map((post) => {
                const parsed = parseContent(post);
                const badge = getReputationBadge(post.user_id, posts);
                return (
                  <div key={post.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-indigo-500/30 transition-colors">

                    {/* Author Top Bar */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-inner flex-shrink-0">
                          {parsed.authorAvatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-200">{parsed.authorName}</h3>
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${badge.color}`}>
                              {badge.icon} {badge.label}
                            </span>
                          </div>
                          <p className="text-xs text-indigo-400 mt-1">{parsed.authorRole} • {new Date(post.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {user && user.uid === post.user_id && (
                        <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditClick(post)} className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-white/5 rounded-lg transition">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeletePost(post.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Post Content */}
                    <h2 className="text-xl font-bold text-white mb-3">{post.title}</h2>
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{parsed.text}</p>

                    {/* Media */}
                    {post.media_url && renderMedia(post.media_url)}

                    {/* Actions: Like & Comment */}
                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between gap-4">

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleLike(post.id)}
                          className={`flex items-center gap-2 group px-3 py-1.5 rounded-lg transition-colors ${post.likes?.some((l: any) => l.user_id === user?.uid) ? 'bg-pink-500/10 text-pink-500 hover:bg-pink-500/20' : 'bg-white/5 text-gray-400 hover:bg-pink-500/10 hover:text-pink-400'}`}
                        >
                          <Heart size={18} className={`transition-transform group-hover:scale-110 ${post.likes?.some((l: any) => l.user_id === user?.uid) ? 'fill-current' : ''}`} />
                          <span className="text-sm font-medium">{post.likes?.length || 0}</span>
                        </button>

                        <button
                          onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                          className="flex items-center gap-2 group px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors"
                        >
                          <MessageCircle size={18} className="transition-transform group-hover:scale-110" />
                          <span className="text-sm font-medium">{post.comments?.length || 0} Comments</span>
                        </button>
                      </div>

                    </div>

                    {/* Comments Section (Expandable) */}
                    {expandedComments[post.id] && (
                      <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                        {/* New Comment Input */}
                        {user ? (
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold text-xs flex-shrink-0">
                              {user.displayName ? user.displayName[0].toUpperCase() : "?"}
                            </div>
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                value={commentInputs[post.id] || ""}
                                onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                placeholder="Add to the discussion..."
                                onKeyDown={(e) => { if (e.key === 'Enter') handlePostComment(post.id); }}
                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                              />
                              <button
                                onClick={() => handlePostComment(post.id)}
                                disabled={interactingPost === post.id}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                              >
                                Post
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 italic px-2">Log in to join the discussion.</div>
                        )}

                        {/* Existing Comments List */}
                        <div className="space-y-3 mt-4">
                          {post.comments?.map((comment: any) => (
                            <div key={comment.id} className="flex gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-bold text-xs flex-shrink-0">
                                {comment.author_avatar}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-semibold text-gray-200">{comment.author_name}</span>
                                  <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* PUBLISH VIEW */
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {!user ? (
              <div className="text-center py-12">
                <ShieldAlert size={48} className="mx-auto text-gray-500 mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">Authentication Required</h2>
                <p className="text-gray-400 mb-6">You must be securely authenticated as a researcher to publish insights.</p>
                <div className="text-sm text-indigo-400 bg-indigo-500/10 px-4 py-3 rounded-xl inline-flex">
                  Please log in via the top navigation menu.
                </div>
              </div>
            ) : (
              <form onSubmit={handlePublish} className="space-y-6">

                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">Intelligence Title</label>
                  {editingPostId && (
                    <button type="button" onClick={() => { setEditingPostId(null); setTitle(""); setContent(""); }} className="text-xs text-red-400 hover:underline">
                      Cancel Edit
                    </button>
                  )}
                </div>
                <div>
                  <input
                    required
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g., Analysis of the latest Privacy Judgment"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="block text-sm font-medium text-gray-300">Analysis Content</label>
                    <span className={`text-xs ${content.trim().split(/\s+/).length > 1000 ? "text-red-400" : "text-gray-500"}`}>
                      {content.trim().split(/\s+/).filter(w => w).length} / 1000 words
                    </span>
                  </div>
                  <textarea
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Draft your analysis here..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white h-64 resize-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Supporting Evidence (Media up to 5MB)</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed ${file ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 hover:border-white/20 bg-black/20"} rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all`}
                  >
                    {file ? (
                      <>
                        <ImageIcon size={32} className="text-indigo-400 mb-2" />
                        <span className="text-sm font-medium text-indigo-200">{file.name}</span>
                        <span className="text-xs text-indigo-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud size={32} className="text-gray-500 mb-2" />
                        <span className="text-sm text-gray-400">Click to upload an image or video</span>
                        <span className="text-xs text-gray-600 mt-1">MP4, WEBM, PNG, JPG</span>
                      </>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*,video/mp4,video/webm"
                      onChange={(e) => {
                        const selected = e.target.files?.[0];
                        if (selected && selected.size <= 5 * 1024 * 1024) {
                          setFile(selected);
                          setError("");
                        } else if (selected) {
                          setError("File exceeds the 5MB limit.");
                        }
                      }}
                    />
                  </div>
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div>
                    {message && (
                      <span className="text-emerald-400 text-sm font-medium flex items-center gap-2">
                        <CheckCircle2 size={16} /> {message}
                      </span>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isPublishing}
                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                  >
                    {isPublishing ? "Transmitting..." : <><Send size={18} /> {editingPostId ? "Update Insight" : "Publish to Terminal"}</>}
                  </button>
                </div>

              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
