import React from "react";
import { Play } from "lucide-react";

const videoPlaceholders = [
  {
    id: 1,
    title: "Safe Riding Practices",
    influencer: "Rahul Sharma",
    thumbnail: "https://images.unsplash.com/photo-1558981420-c532902e58b4?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 2,
    title: "Mastering the Curves",
    influencer: "Anita Desai",
    thumbnail: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 3,
    title: "City Commute Tips",
    influencer: "Vikram Singh",
    thumbnail: "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&q=80&w=800",
  },
];

const InfluencerVideos = () => {
  return (
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {videoPlaceholders.map((video) => (
            <div
              key={video.id}
              className="group relative cursor-pointer block bg-carbon-light border border-white/10 hover:border-copper/40 transition-all duration-500 hover:-translate-y-1 overflow-hidden"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-copper/90 flex items-center justify-center text-carbon group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(202,138,4,0.4)]">
                    <Play className="ml-1" size={24} fill="currentColor" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-heading text-2xl uppercase text-white group-hover:text-copper transition-colors duration-300 mb-2">
                  {video.title}
                </h3>
                <p className="font-body text-[10px] tracking-widest uppercase text-steel-dim">
                  By {video.influencer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InfluencerVideos;
