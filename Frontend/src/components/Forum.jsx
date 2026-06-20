import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  Pin,
  Lock,
  Star,
  Trash2,
  MessageSquare,
  ThumbsUp,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { forumService } from "../services/api";

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const Forum = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [recent, setRecent] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [topicDetail, setTopicDetail] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: "", content: "", categorySlug: "general" });
  const [submitting, setSubmitting] = useState(false);

  const userEmail = sessionStorage.getItem("userEmail") || "";
  const isLoggedIn = sessionStorage.getItem("userLoggedIn") === "true";

  const loadCategories = useCallback(async () => {
    try {
      const data = await forumService.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
  }, []);

  const loadTopics = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (activeCategory !== "all") params.category = activeCategory;
      if (search.trim()) params.search = search.trim();
      const data = await forumService.getTopics(params);
      setTopics(data.topics || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch {
      setTopics([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search]);

  const loadRecent = useCallback(async () => {
    try {
      const data = await forumService.getRecent();
      setRecent(Array.isArray(data) ? data : []);
    } catch {
      setRecent([]);
    }
  }, []);

  useEffect(() => {
    loadCategories();
    loadRecent();
  }, [loadCategories, loadRecent]);

  useEffect(() => {
    loadTopics(1);
  }, [loadTopics]);

  const openTopic = async (id) => {
    if (!isLoggedIn) {
      toast.info("Please login to view discussions");
      navigate("/login");
      return;
    }
    try {
      const data = await forumService.getTopic(id);
      setTopicDetail(data);
      setActiveTopicId(id);
    } catch {
      toast.error("Could not load topic");
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await forumService.createReply(activeTopicId, {
        content: replyText,
        email: userEmail,
        phone: sessionStorage.getItem("userPhone") || "",
      });
      toast.success("Reply posted");
      setReplyText("");
      const data = await forumService.getTopic(activeTopicId);
      setTopicDetail(data);
      loadTopics(pagination.page);
      loadRecent();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.info("Please login to create a topic");
      navigate("/login");
      return;
    }
    setSubmitting(true);
    try {
      await forumService.createTopic({
        ...newTopic,
        email: userEmail,
        phone: sessionStorage.getItem("userPhone") || "",
      });
      toast.success("Topic created");
      setShowNewTopic(false);
      setNewTopic({ title: "", content: "", categorySlug: "general" });
      loadTopics(1);
      loadRecent();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create topic");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeTopic = async () => {
    if (!userEmail) return;
    try {
      await forumService.likeTopic(activeTopicId, userEmail);
      const data = await forumService.getTopic(activeTopicId);
      setTopicDetail(data);
    } catch {
      toast.error("Could not like topic");
    }
  };

  const allCategories = [
    { slug: "all", name: "All Topics", topicCount: pagination.total },
    ...categories,
  ];

  return (
    <section className="section-container py-24 bg-carbon text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-12">
          <div>
            <span className="text-copper font-body text-xs uppercase tracking-[0.3em] font-bold">
              Community
            </span>
            <h1 className="font-heading text-6xl md:text-7xl uppercase leading-none">
              The{" "}
              <span className="text-copper">Forum</span>
            </h1>
          </div>
          <button
            onClick={() =>
              isLoggedIn ? setShowNewTopic(true) : navigate("/login")
            }
            className="flex items-center gap-2 bg-copper text-carbon px-6 py-3 font-heading uppercase hover:bg-white transition-colors"
          >
            <Plus size={18} /> New Topic
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3 space-y-6">
            <div className="border border-white/5 p-4">
              <div className="relative mb-4">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-dim" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadTopics(1)}
                  placeholder="Search..."
                  className="w-full bg-carbon-light border border-white/10 pl-9 pr-3 py-2 font-body text-xs uppercase tracking-widest outline-none focus:border-copper"
                />
              </div>
              <h3 className="font-body text-[10px] uppercase tracking-widest text-copper mb-3">
                Categories
              </h3>
              {allCategories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`w-full text-left px-3 py-2 font-body text-[10px] uppercase tracking-widest mb-1 transition-colors ${
                    activeCategory === cat.slug
                      ? "bg-copper/20 text-copper border-l-2 border-copper"
                      : "text-steel-dim hover:text-white"
                  }`}
                >
                  {cat.name}{" "}
                  <span className="opacity-50">({cat.topicCount || 0})</span>
                </button>
              ))}
            </div>

            {recent.length > 0 && (
              <div className="border border-white/5 p-4">
                <h3 className="font-body text-[10px] uppercase tracking-widest text-copper mb-3">
                  Recent
                </h3>
                {recent.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => openTopic(r.id)}
                    className="block w-full text-left py-2 border-b border-white/5 last:border-0 hover:text-copper"
                  >
                    <p className="font-body text-xs uppercase truncate">{r.title}</p>
                    <p className="font-body text-[9px] text-steel-dim">
                      {formatTime(r.lastActivity)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <main className="lg:col-span-9">
            {activeTopicId && topicDetail ? (
              <div className="border border-white/5 bg-carbon-light p-6 md:p-8">
                <button
                  onClick={() => {
                    setActiveTopicId(null);
                    setTopicDetail(null);
                  }}
                  className="flex items-center gap-2 font-body text-[10px] uppercase tracking-widest text-steel-dim hover:text-copper mb-6"
                >
                  <ChevronLeft size={14} /> Back to topics
                </button>

                <div className="flex flex-wrap gap-2 mb-4">
                  {topicDetail.topic.isPinned && (
                    <span className="flex items-center gap-1 text-copper text-[10px] uppercase">
                      <Pin size={12} /> Pinned
                    </span>
                  )}
                  {topicDetail.topic.isFeatured && (
                    <span className="flex items-center gap-1 text-copper text-[10px] uppercase">
                      <Star size={12} /> Featured
                    </span>
                  )}
                  {topicDetail.topic.isLocked && (
                    <span className="flex items-center gap-1 text-red-400 text-[10px] uppercase">
                      <Lock size={12} /> Locked
                    </span>
                  )}
                </div>

                <h2 className="font-heading text-3xl uppercase mb-2">
                  {topicDetail.topic.title}
                </h2>
                <p className="font-body text-[10px] text-steel-dim uppercase tracking-widest mb-6">
                  By {topicDetail.topic.authorName} · {topicDetail.topic.categoryName}
                </p>
                <p className="font-text text-steel-dim leading-relaxed mb-6 whitespace-pre-wrap">
                  {topicDetail.topic.content}
                </p>

                <button
                  onClick={handleLikeTopic}
                  className="flex items-center gap-2 text-copper font-body text-[10px] uppercase tracking-widest mb-8"
                >
                  <ThumbsUp size={14} /> {topicDetail.topic.likes} likes
                </button>

                <div className="border-t border-white/5 pt-6 space-y-4 mb-6">
                  <h3 className="font-heading text-xl uppercase flex items-center gap-2">
                    <MessageSquare size={18} className="text-copper" />
                    Replies ({topicDetail.replies.length})
                  </h3>
                  {topicDetail.replies.map((reply) => (
                    <div key={reply.id} className="p-4 border border-white/5 bg-carbon">
                      <p className="font-body text-[10px] text-copper uppercase mb-2">
                        {reply.authorName}
                      </p>
                      <p className="font-text text-sm text-steel-dim whitespace-pre-wrap">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>

                {!topicDetail.topic.isLocked && (
                  <div className="flex gap-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      rows={3}
                      className="flex-1 bg-carbon border border-white/10 p-3 font-body text-sm outline-none focus:border-copper resize-none"
                    />
                    <button
                      onClick={handleReply}
                      disabled={submitting}
                      className="px-6 py-3 bg-copper text-carbon font-body text-xs uppercase self-end disabled:opacity-50"
                    >
                      Reply
                    </button>
                  </div>
                )}
              </div>
            ) : loading ? (
              <div className="py-20 flex justify-center">
                <div className="w-10 h-10 border-4 border-copper/30 border-t-copper rounded-full animate-spin" />
              </div>
            ) : topics.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-white/10">
                <p className="font-body text-steel-dim uppercase tracking-widest">
                  No topics yet. Be the first to start a discussion!
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {topics.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => openTopic(post.id)}
                      className="w-full text-left p-5 border border-white/5 bg-carbon-light hover:border-copper/30 transition-all group"
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {post.isPinned && <Pin size={12} className="text-copper" />}
                        {post.isFeatured && <Star size={12} className="text-copper" />}
                        {post.isLocked && <Lock size={12} className="text-red-400" />}
                        <span className="font-body text-[9px] uppercase tracking-widest text-steel-dim">
                          {post.categoryName}
                        </span>
                      </div>
                      <h3 className="font-heading text-xl uppercase group-hover:text-copper transition-colors mb-2">
                        {post.title}
                      </h3>
                      <p className="font-text text-sm text-steel-dim line-clamp-2 mb-3">
                        {post.preview}
                      </p>
                      <div className="flex flex-wrap gap-4 font-body text-[10px] uppercase tracking-widest text-steel-dim">
                        <span>{post.authorName}</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare size={12} /> {post.replies}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp size={12} /> {post.likes}
                        </span>
                        <span>{formatTime(post.lastActivity)}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {pagination.pages > 1 && (
                  <div className="flex justify-center gap-4 mt-8">
                    <button
                      disabled={pagination.page <= 1}
                      onClick={() => loadTopics(pagination.page - 1)}
                      className="p-2 border border-white/10 disabled:opacity-30"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="font-body text-xs uppercase tracking-widest self-center">
                      Page {pagination.page} / {pagination.pages}
                    </span>
                    <button
                      disabled={pagination.page >= pagination.pages}
                      onClick={() => loadTopics(pagination.page + 1)}
                      className="p-2 border border-white/10 disabled:opacity-30"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {showNewTopic && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-carbon/90 backdrop-blur-md">
          <form
            onSubmit={handleCreateTopic}
            className="max-w-lg w-full bg-carbon-light border border-white/10 p-8"
          >
            <h2 className="font-heading text-2xl uppercase mb-6">New Topic</h2>
            <select
              value={newTopic.categorySlug}
              onChange={(e) =>
                setNewTopic((p) => ({ ...p, categorySlug: e.target.value }))
              }
              className="w-full mb-4 bg-carbon border border-white/10 p-3 font-body text-xs uppercase"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              required
              value={newTopic.title}
              onChange={(e) =>
                setNewTopic((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="Topic title"
              className="w-full mb-4 bg-carbon border border-white/10 p-3 font-body text-sm outline-none focus:border-copper"
            />
            <textarea
              required
              value={newTopic.content}
              onChange={(e) =>
                setNewTopic((p) => ({ ...p, content: e.target.value }))
              }
              placeholder="Your message..."
              rows={5}
              className="w-full mb-6 bg-carbon border border-white/10 p-3 font-body text-sm outline-none focus:border-copper resize-none"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-copper text-carbon font-body text-xs uppercase disabled:opacity-50"
              >
                {submitting ? "Posting..." : "Create Topic"}
              </button>
              <button
                type="button"
                onClick={() => setShowNewTopic(false)}
                className="flex-1 py-3 border border-white/10 font-body text-xs uppercase"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};

export default Forum;

