import React, { useEffect, useMemo, useState } from "react";
import { 
  motion, 
  AnimatePresence, 
  useReducedMotion
} from "framer-motion";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Play, 
  Pause, 
  X, 
  ChevronRight,
  Maximize2
} from "lucide-react";
import { galleryService } from "../services/api";

const GalleryCard = ({ item, index, onClick }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.05 }}
      className="relative mb-10 sm:mb-12"
    >
      <button
        type="button"
        onClick={() => onClick(item)}
        className="group relative aspect-[4/5] w-full bg-carbon border border-white/5 overflow-hidden text-left focus:outline-none focus:ring-2 focus:ring-copper/40"
      >
        {item.type === "video" ? (
          <video
            src={item.src}
            className="w-full h-full object-cover transition-transform duration-300 ease-out motion-reduce:transition-none sm:group-hover:scale-[1.02]"
            muted
            loop
            onMouseEnter={(e) => e.currentTarget.play()}
            onMouseLeave={(e) => {
              e.currentTarget.pause();
              e.currentTarget.currentTime = 0;
            }}
          />
        ) : (
          <img
            src={item.src}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 ease-out motion-reduce:transition-none sm:group-hover:scale-[1.02]"
          />
        )}

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 motion-reduce:transition-none">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold text-copper uppercase tracking-[0.2em]">{item.category}</span>
          </div>
          <h3 className="font-heading text-xl sm:text-2xl text-white uppercase leading-none mb-3 sm:mb-4 line-clamp-2">{item.title}</h3>
          
          <div className="flex items-center gap-6 text-white/60">
            <div className="flex items-center gap-1.5"><Heart size={14} /> <span className="text-xs font-bold">{item.likes}</span></div>
            <div className="flex items-center gap-1.5"><MessageCircle size={14} /> <span className="text-xs font-bold">{item.comments || 0}</span></div>
            <div className="ml-auto w-8 h-8 rounded-full border border-white/20 flex items-center justify-center sm:group-hover:border-copper sm:group-hover:bg-copper sm:group-hover:text-carbon transition-colors duration-200 motion-reduce:transition-none">
               <Maximize2 size={14} />
            </div>
          </div>
        </div>
        
        {/* Top Right Tag */}
        <div className="absolute top-4 right-4 hidden sm:flex items-center justify-center w-8 h-8 border border-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
           {item.type === "video" ? <Play size={12} className="text-white" /> : <ChevronRight size={12} className="text-white" />}
        </div>
      </button>
    </motion.div>
  );
};

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(9);
  const reduceMotion = useReducedMotion();

  const categories = [
    { id: "all", name: "All Media" },
    { id: "rides", name: "Group Rides" },
    { id: "events", name: "Events" },
    { id: "bikes", name: "Member Bikes" },
    { id: "rallies", name: "Rallies" },
    { id: "highlights", name: "Ride Highlights" },
  ];

  const autoGalleryItems = useMemo(() => {
    const modules = import.meta.glob(
      "../assets/gallery/**/*.{png,jpg,jpeg,webp,mp4,webm,mov}",
      { eager: true },
    );
    const items = Object.entries(modules).map(([path, mod], index) => {
      const parts = path.split("/");
      const filename = parts[parts.length - 1];
      const title = filename.replace(/[-_]/g, " ").replace(/\.[^.]+$/, "");
      const isVideo = /\.(mp4|webm|mov)$/i.test(filename);
      const normalizedPath = path.toLowerCase();
      let category = "rides";
      if (normalizedPath.includes("/rallies/")) category = "rallies";
      else if (normalizedPath.includes("/bikes/")) category = "bikes";
      else if (normalizedPath.includes("/events/")) category = "events";
      else if (normalizedPath.includes("/highlights/")) category = "highlights";
      else if (normalizedPath.includes("/rides/")) category = "rides";
      
      return {
        id: `local-${index}`,
        type: isVideo ? "video" : "image",
        src: mod.default,
        title,
        category,
        likes: Math.floor(Math.random() * 200) + 50,
        author: "BUC MEDIA",
      };
    });
    return items;
  }, []);

  const mediaItems = useMemo(() => {
    const backend = galleryItems.map(item => ({
      id: item._id,
      type: "image",
      src: item.imageUrl,
      title: item.eventName,
      category: item.category || "rides",
      author: "CENTRAL COMMAND",
      likes: 0,
    }));
    return [...backend, ...autoGalleryItems];
  }, [galleryItems, autoGalleryItems]);

  const filteredMedia = useMemo(() => 
    activeCategory === "all" ? mediaItems : mediaItems.filter(i => i.category === activeCategory)
  , [mediaItems, activeCategory]);

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      try {
        const data = await galleryService.getAll();
        setGalleryItems(data || []);
      } catch (err) {
        console.warn("Using local intelligence only.");
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  return (
    <section id="gallery" className="relative pt-28 sm:pt-36 lg:pt-40 pb-20 sm:pb-28 lg:pb-32 bg-carbon-dark min-h-screen">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
        <div className="absolute top-[20%] -left-[10%] w-[520px] h-[520px] bg-copper/5 rounded-full blur-[110px]"></div>
        <div className="absolute bottom-[20%] -right-[10%] w-[440px] h-[440px] bg-copper/5 rounded-full blur-[95px]"></div>
        
        {/* Kinetic Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] select-none pointer-events-none hidden md:block">
           <h2 className="text-[32vw] font-heading leading-none text-white whitespace-nowrap">VAULT</h2>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-12 mb-12 sm:mb-16 lg:mb-24">
          <div className="max-w-2xl">
            <motion.span 
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: -12 }}
              whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
              className="text-copper font-body tracking-[0.5em] text-xs uppercase mb-4 block font-bold"
            >
              The BUC Chronicles
            </motion.span>
            <motion.h2 
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
              whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white uppercase leading-none"
            >
              The <span className="text-copper">Vault</span>
            </motion.h2>
          </div>
          
          <nav className="flex flex-wrap gap-x-6 sm:gap-x-10 gap-y-4 sm:gap-y-6">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`relative group font-heading text-xs sm:text-sm uppercase tracking-widest transition-colors ${activeCategory === cat.id ? "text-white" : "text-white/40 hover:text-white"}`}
              >
                {cat.name}
                <motion.div 
                  initial={false}
                  animate={{ width: activeCategory === cat.id ? "100%" : "0%" }}
                  className="absolute -bottom-2 left-0 h-[1px] bg-copper transition-all"
                ></motion.div>
                <div className="absolute -bottom-2 left-0 w-0 h-[1px] bg-copper group-hover:w-full transition-all duration-300 opacity-50"></div>
              </button>
            ))}
          </nav>
        </header>

        {/* Broken Grid Masonry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 sm:gap-x-10 lg:gap-x-16 gap-y-10 sm:gap-y-16 lg:gap-y-24">
          {filteredMedia.slice(0, visibleCount).map((item, index) => (
            <GalleryCard 
              key={item.id} 
              item={item} 
              index={index} 
              onClick={setSelectedMedia} 
            />
          ))}
        </div>

        {/* Load More Strategem */}
        {visibleCount < filteredMedia.length && (
          <div className="mt-14 sm:mt-24 lg:mt-32 flex justify-center">
            <button 
              onClick={() => setVisibleCount(prev => prev + 6)}
              className="relative px-10 sm:px-12 py-4 sm:py-5 group overflow-hidden border border-white/10"
            >
              <div className="absolute inset-0 bg-copper translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <span className="relative z-10 font-heading text-xs tracking-[0.4em] uppercase text-white group-hover:text-carbon transition-colors duration-500">
                Explore Visual Archive
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Cinematic Quad-Split Lightbox */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-20 bg-carbon-dark/95 backdrop-blur-2xl"
          >
            {/* Split Reveal Shutter Effects could be added here as motion divs */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-6xl aspect-video md:aspect-auto md:h-full bg-carbon border border-white/5 overflow-hidden flex flex-col md:flex-row shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]"
            >
              <div className="flex-1 bg-black relative">
                {selectedMedia.type === "video" ? (
                  <video src={selectedMedia.src} className="w-full h-full object-contain" autoPlay controls />
                ) : (
                  <img src={selectedMedia.src} alt={selectedMedia.title} className="w-full h-full object-contain" />
                )}
              </div>
              
              <div className="w-full md:w-80 p-8 flex flex-col justify-between border-l border-white/5">
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-2 h-2 rounded-full bg-copper"></div>
                    <span className="text-[10px] font-bold text-copper uppercase tracking-[0.2em]">{selectedMedia.category}</span>
                  </div>
                  <h3 className="font-heading text-3xl text-white uppercase mb-4 leading-tight">{selectedMedia.title}</h3>
                  <p className="text-steel-dim text-xs uppercase tracking-widest mb-12">SOURCE: {selectedMedia.author}</p>
                  
                  <div className="space-y-6">
                     <div className="flex items-center justify-between text-white/40 text-xs font-bold uppercase tracking-widest border-b border-white/5 pb-4">
                        <span>Affiliation</span>
                        <span className="text-white">BUC INDIA</span>
                     </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-12">
                   <button className="flex-1 py-4 border border-white/10 hover:border-copper flex items-center justify-center gap-2 text-white/60 hover:text-copper transition-all">
                      <Heart size={16} />
                      <span className="text-[10px] font-bold uppercase">{selectedMedia.likes}</span>
                   </button>
                   <button className="flex-1 py-4 border border-white/10 hover:border-copper flex items-center justify-center gap-2 text-white/60 hover:text-copper transition-all">
                      <Share2 size={16} />
                   </button>
                </div>
              </div>

              <button 
                onClick={() => setSelectedMedia(null)}
                className="absolute top-8 right-8 w-12 h-12 border border-white/10 flex items-center justify-center text-white/40 hover:text-copper hover:border-copper transition-all rounded-full"
              >
                <X size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;
