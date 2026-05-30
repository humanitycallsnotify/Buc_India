import React, { useMemo, useState } from "react";
import { 
  Pin, 
  MessageSquare, 
  ThumbsUp, 
  Clock, 
  User, 
  Plus,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Forum = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activePostId, setActivePostId] = useState(null);
  const [replyText, setReplyText] = useState("");

  const categories = [
    { id: "all", name: "All Topics", count: 156 },
    { id: "general", name: "General Discussion", count: 45 },
    { id: "rides", name: "Ride Planning", count: 32 },
    { id: "maintenance", name: "Bike Maintenance", count: 28 },
    { id: "gear", name: "Gear Reviews", count: 21 },
    { id: "events", name: "Events", count: 18 },
    { id: "newbie", name: "New Rider Help", count: 12 },
  ];

  const forumPosts = [
    {
      id: 1,
      title: "Planning a Cross-Country Adventure - Route Suggestions?",
      author: "Rajesh Kumar",
      category: "rides",
      replies: 23,
      likes: 15,
      lastActivity: "2 hours ago",
      isPinned: true,
      preview:
        "Hey everyone! Planning a 3-week cross-country ride from Delhi to Mumbai. Looking for must-see stops and rider-friendly routes...",
    },
    {
      id: 2,
      title: "Best Winter Riding Gear - What Do You Recommend?",
      author: "Pradeep",
      category: "gear",
      replies: 18,
      likes: 12,
      lastActivity: "4 hours ago",
      preview:
        "Winter is coming and I need to upgrade my cold weather gear. What are your go-to brands for heated gloves and jackets?",
    },
  ];

  const filteredPosts = useMemo(
    () =>
      activeCategory === "all"
        ? forumPosts
        : forumPosts.filter((post) => post.category === activeCategory),
    [activeCategory],
  );

  const isLoggedIn = sessionStorage.getItem("userLoggedIn") === "true";

  const ensureLoggedIn = () => {
    if (!isLoggedIn) {
      toast.info("Please login / sign up to post in the forum.");
      navigate("/login");
      return false;
    }
    return true;
  };

  const handleOpenPost = (postId) => {
    if (!ensureLoggedIn()) return;
    setActivePostId(postId);
    setReplyText("");
  };

  const handleNewTopic = () => {
    if (!ensureLoggedIn()) return;
    toast.info("Topic creation will be enabled soon.");
  };

  const handleSubmitReply = () => {
    if (!ensureLoggedIn()) return;
    if (!replyText.trim()) {
      toast.error("Please type a reply before submitting.");
      return;
    }
    toast.success("Your reply has been captured (demo only).");
  };

  const stats = [
    { label: "Total Topics", value: "247" },
    { label: "Total Posts", value: "280" },
    { label: "Active Members", value: "10" },
    { label: "Community Support", value: "24/7" },
  ];

  return (
    <section id="forum" className="section-container py-20 sm:py-24 bg-carbon text-white">
       <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8 mb-10 md:mb-16">
          <div>
            <span className="text-copper font-body tracking-ultra text-xs md:text-sm uppercase mb-2 block font-bold">The Discussion</span>
            <h2 className="font-heading text-6xl md:text-8xl uppercase leading-none">The <span className="text-transparent outline-title">Forum</span></h2>
          </div>
          
          <button
            onClick={handleNewTopic}
            className="flex items-center gap-3 bg-copper text-carbon px-6 sm:px-8 py-3 sm:py-4 font-heading text-base sm:text-lg uppercase hover:bg-white transition-colors duration-300"
          >
            <Plus size={20} />
            New Topic
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
           {/* Categories Sidebar */}
           <div className="lg:col-span-3">
              <div className="space-y-2 lg:sticky lg:top-32">
                 <h3 className="font-body text-[10px] uppercase tracking-[0.3em] text-steel-dim mb-6">Categories</h3>
                 {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full flex items-center justify-between p-4 border transition-all duration-500 ${
                        activeCategory === cat.id 
                        ? "bg-copper/10 border-copper/30 text-copper" 
                        : "bg-carbon-light border-white/5 text-steel-dim hover:border-white/20 hover:text-white"
                      }`}
                    >
                       <span className="font-body text-xs uppercase tracking-widest">{cat.name}</span>
                       <span className="font-heading text-sm opacity-50">{cat.count}</span>
                    </button>
                 ))}
              </div>
           </div>

           {/* Posts Area */}
           <div className="lg:col-span-9">
              <div className="space-y-6">
                 {filteredPosts.map((post) => {
                   const isActive = post.id === activePostId;
                   return (
                    <div
                      key={post.id}
                      className="group bg-carbon-light border border-white/5 p-6 sm:p-8 hover:border-copper/30 transition-colors duration-300"
                    >
                       <div className="flex justify-between items-start mb-4 sm:mb-6">
                          <div className="flex items-center gap-4">
                             {post.isPinned && <Pin size={16} className="text-copper rotate-45" />}
                             <h3 className="font-heading text-2xl uppercase group-hover:text-copper transition-colors">{post.title}</h3>
                          </div>
                          <span className="bg-white/5 px-3 py-1 font-body text-[10px] uppercase tracking-widest text-steel-dim group-hover:bg-copper group-hover:text-carbon transition-colors">
                            {post.category}
                          </span>
                       </div>

                       <p className="font-text text-steel-dim text-sm mb-4 sm:mb-6 line-clamp-2 max-w-3xl">{post.preview}</p>

                       <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-6 border-t border-white/5 pt-4 sm:pt-6">
                          <div className="flex items-center gap-8">
                             <div className="flex items-center gap-2">
                                <User size={14} className="text-copper" />
                                <span className="font-body text-[10px] uppercase tracking-widest text-steel-dim">BY {post.author}</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <Clock size={14} className="text-copper" />
                                <span className="font-body text-[10px] uppercase tracking-widest text-steel-dim">{post.lastActivity}</span>
                             </div>
                          </div>

                          <div className="flex items-center gap-4 sm:gap-8">
                             <div className="flex items-center gap-2">
                                <MessageSquare size={14} className="text-steel-dim" />
                                <span className="font-heading text-sm text-white">{post.replies}</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <ThumbsUp size={14} className="text-steel-dim" />
                                <span className="font-heading text-sm text-white">{post.likes}</span>
                             </div>
                             <button
                               onClick={() => handleOpenPost(post.id)}
                               className="text-copper hover:translate-x-1.5 transition-transform"
                             >
                                <ArrowRight size={20} />
                             </button>
                          </div>
                       </div>

                       {isActive && (
                         <div className="mt-4 sm:mt-6 border-t border-white/10 pt-4 sm:pt-5 space-y-3">
                           <textarea
                             value={replyText}
                             onChange={(e) => setReplyText(e.target.value)}
                             rows={3}
                             className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-sm outline-none focus:border-copper transition-colors resize-none"
                             placeholder="Write your reply…"
                           />
                           <div className="flex justify-end">
                             <button
                               type="button"
                               onClick={handleSubmitReply}
                               className="px-6 py-2 bg-copper text-carbon font-body text-[10px] uppercase tracking-widest hover:bg-white transition-colors duration-300"
                             >
                               Post Reply
                             </button>
                           </div>
                         </div>
                       )}
                    </div>
                 );})}
              </div>

              {/* Forum Stats Strip */}
              <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-white/5">
                 {stats.map((stat, i) => (
                    <div key={i} className="text-center">
                       <span className="font-heading text-5xl block mb-2">{stat.value}</span>
                       <span className="font-body text-[10px] text-steel-dim tracking-[0.3em] uppercase">{stat.label}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
       </div>
    </section>
  );
};

export default Forum;
