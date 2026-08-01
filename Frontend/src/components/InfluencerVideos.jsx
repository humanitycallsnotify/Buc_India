import React, { useState, useEffect } from "react";
import { Play, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { galleryService } from "../services/api";

const videoPlaceholders = [
  {
    _id: 1,
    eventName: "Safe Riding Practices",
    videoUrl: "",
    thumbnail: "https://images.unsplash.com/photo-1558981420-c532902e58b4?auto=format&fit=crop&q=80&w=800",
  },
  {
    _id: 2,
    eventName: "Mastering the Curves",
    videoUrl: "",
    thumbnail: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800",
  },
  {
    _id: 3,
    eventName: "City Commute Tips",
    videoUrl: "",
    thumbnail: "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&q=80&w=800",
  },
];

const InfluencerVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await galleryService.getAll();
        const influencerVideos = data.filter(item => item.category === 'influencer_videos' && item.videoUrl);
        if (influencerVideos.length > 0) {
          setVideos(influencerVideos);
        } else {
          setVideos(videoPlaceholders);
        }
      } catch (error) {
        console.error("Failed to load influencer videos:", error);
        setVideos(videoPlaceholders);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  return (
    <>
      <section className="bg-carbon py-20 overflow-hidden relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-copper font-body tracking-[0.4em] text-[10px] sm:text-xs uppercase font-bold block mb-3">
              Watch & Learn
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase leading-none text-white">
              Influencer <span className="text-copper">Videos</span>
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-copper/10 border-t-copper rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {videos.map((video) => (
                <div
                  key={video._id}
                  onClick={() => video.videoUrl ? setActiveVideo(video) : null}
                  className="group relative cursor-pointer block bg-carbon-light border border-white/10 hover:border-copper/40 transition-all duration-500 hover:-translate-y-1 overflow-hidden"
                >
                  <div className="relative aspect-video overflow-hidden">
                    {video.videoUrl ? (
                      <video
                        src={video.videoUrl}
                        muted
                        loop
                        playsInline
                        onMouseEnter={(e) => e.target.play()}
                        onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                        className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                      />
                    ) : (
                      <img
                        src={video.thumbnail || video.imageUrl}
                        alt={video.eventName}
                        className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                      />
                    )}
                    
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center pointer-events-none">
                      <div className="w-16 h-16 rounded-full bg-copper/90 flex items-center justify-center text-carbon group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(202,138,4,0.4)]">
                        <Play className="ml-1" size={24} fill="currentColor" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-heading text-2xl uppercase text-white group-hover:text-copper transition-colors duration-300 mb-2 truncate">
                      {video.eventName}
                    </h3>
                    <p className="font-body text-[10px] tracking-widest uppercase text-steel-dim">
                      {video.influencerName ? `By ${video.influencerName}` : "By BUC Media"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Fullscreen Video Modal */}
      <AnimatePresence>
        {activeVideo && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveVideo(null)}
              className="absolute inset-0 bg-carbon/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl z-[301]"
            >
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-10 text-white bg-carbon/50 p-2 rounded-full hover:bg-copper hover:text-carbon transition-all"
              >
                <X size={24} />
              </button>
              <video
                src={activeVideo.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InfluencerVideos;
