import React, { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { safetyInfluencerService } from "../services/api";
import ProfileContentModal, { SocialLinks } from "./ProfileContentModal";

const SafetyInfluencers = () => {
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await safetyInfluencerService.getPublic();
        setInfluencers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load safety influencers:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section className="min-h-screen bg-carbon text-white pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <span className="text-copper font-body tracking-ultra text-xs uppercase mb-2 block font-bold flex items-center gap-2">
            <Shield size={14} />
            Safety Advocates
          </span>
          <h1 className="font-heading text-6xl md:text-8xl uppercase leading-none">
            Our{" "}
            <span className="text-copper">
              Safety Influencers
            </span>
          </h1>
          <p className="font-text text-steel-dim mt-6 max-w-2xl">
            Riders and voices championing safety, responsibility, and brotherhood
            on every mile.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-12 h-12 border-4 border-copper/20 border-t-copper rounded-full animate-spin" />
          </div>
        ) : influencers.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-white/10">
            <p className="font-body text-steel-dim uppercase tracking-widest text-sm">
              Safety influencers coming soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {influencers.map((influencer) => (
              <article
                key={influencer._id}
                className="group flex flex-col p-6 border border-white/5 bg-carbon-light hover:border-copper/30 transition-all duration-500"
              >
                <div className="w-28 h-28 mb-6 overflow-hidden border border-copper/20 rounded-full mx-auto sm:mx-0">
                  <img
                    src={influencer.profilePhoto || "/logo.jpg"}
                    alt={influencer.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>

                <h2 className="font-heading text-2xl uppercase text-white group-hover:text-copper transition-colors mb-1">
                  {influencer.name}
                </h2>

                {(influencer.designation || influencer.organization) && (
                  <p className="font-body text-[10px] text-steel-dim uppercase tracking-widest mb-3">
                    {[influencer.designation, influencer.organization]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}

                {influencer.shortDescription && (
                  <p className="font-text text-steel-dim text-sm line-clamp-3 mb-4 flex-grow">
                    {influencer.shortDescription}
                  </p>
                )}

                <SocialLinks item={influencer} className="mb-5" />

                <button
                  type="button"
                  onClick={() => setSelectedInfluencer(influencer)}
                  className="w-full py-3 border border-white/10 font-body text-[10px] uppercase tracking-widest hover:bg-copper hover:text-carbon hover:border-copper transition-all duration-300"
                >
                  Read More
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      <ProfileContentModal
        item={selectedInfluencer}
        onClose={() => setSelectedInfluencer(null)}
        nameField="name"
      />
    </section>
  );
};

export default SafetyInfluencers;

