import React from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Globe, ArrowRight } from "lucide-react";

const cards = [
  {
    title: "Our Safety Influencers",
    subtitle: "Voices for responsible riding",
    description:
      "Meet the advocates championing gear, discipline, and brotherhood on every mile.",
    path: "/safety-influencers",
    icon: Shield,
    accent: "from-copper/20 via-copper/5 to-transparent",
  },
  {
    title: "International Influencers",
    subtitle: "Global BUC leadership",
    description:
      "Discover riders and leaders representing BUC India across borders and continents.",
    path: "/international",
    icon: Globe,
    accent: "from-white/10 via-white/5 to-transparent",
  },
];

const InfluencerSpotlight = () => {
  const navigate = useNavigate();

  return (
    <section
      id="influencer-spotlight"
      className="relative bg-carbon py-20 md:py-28 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(100%,800px)] h-px bg-gradient-to-r from-transparent via-copper/40 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <span className="text-copper font-body tracking-[0.4em] text-[10px] sm:text-xs uppercase font-bold block mb-3">
            Voices of the Brotherhood
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase leading-none text-white">
            Meet Our{" "}
            <span className="text-copper">Influencers</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.path}
                type="button"
                onClick={() => navigate(card.path)}
                className="group relative text-left w-full max-w-full overflow-hidden border border-white/10 bg-carbon-light p-8 sm:p-10 hover:border-copper/40 transition-all duration-500 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-copper/50"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative z-10 flex flex-col h-full min-h-[220px] sm:min-h-[240px]">
                  <div className="w-14 h-14 border border-copper/30 flex items-center justify-center mb-6 group-hover:border-copper group-hover:bg-copper/10 transition-all duration-500">
                    <Icon
                      size={28}
                      className="text-copper group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  <span className="font-body text-[10px] tracking-[0.3em] text-copper uppercase mb-2">
                    {card.subtitle}
                  </span>
                  <h3 className="font-heading text-2xl sm:text-3xl uppercase text-white group-hover:text-copper transition-colors duration-300 mb-3 leading-tight">
                    {card.title}
                  </h3>
                  <p className="font-text text-steel-dim text-sm leading-relaxed mb-8 flex-grow max-w-md">
                    {card.description}
                  </p>

                  <span className="inline-flex items-center gap-3 font-body text-[10px] sm:text-xs tracking-[0.35em] uppercase text-white/60 group-hover:text-copper transition-colors duration-300">
                    Explore Directory
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-2 transition-transform duration-300"
                    />
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-copper group-hover:w-full transition-all duration-700 ease-out" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default InfluencerSpotlight;

