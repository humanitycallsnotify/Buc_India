import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Handshake, Users, Calendar, ArrowRight, Crown } from "lucide-react";
import { clubService } from "../../services/api";

const roleLabel = (role = "") =>
  role.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

const Clubs = () => {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const clubList = await clubService.getPublic();
        setClubs(Array.isArray(clubList) ? clubList : []);
      } catch {
        setClubs([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const goToClub = (club) => {
    navigate(`/clubs/${club.slug}`, { state: { club } });
  };

  return (
    <section id="clubs" className="section-container py-24 bg-carbon text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div>
            <span className="text-copper font-body tracking-ultra text-xs md:text-sm uppercase mb-2 block font-bold">
              The network
            </span>
            <h2 className="font-heading text-6xl md:text-8xl uppercase leading-none">
              Global{" "}
              <span className="text-copper">Chapters</span>
            </h2>
            <p className="font-text text-steel-dim mt-4 max-w-xl">
              View club rosters and leadership. Membership is managed by club
              owners and admins.
            </p>
          </div>

          <button
            onClick={() => navigate("/clubs/collaborate")}
            className="flex items-center gap-4 bg-white text-carbon px-8 py-4 font-heading text-lg uppercase hover:bg-copper transition-all duration-500"
          >
            <Handshake size={20} />
            Partner With BUC
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-copper/30 border-t-copper rounded-full animate-spin" />
          </div>
        ) : clubs.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-white/10">
            <p className="font-body text-steel-dim uppercase tracking-widest text-sm">
              No approved clubs yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
            {clubs.map((club) => (
              <div
                key={club.id}
                className="group border border-white/5 bg-carbon-light p-8 hover:border-copper/30 transition-all duration-500 cursor-pointer"
                onClick={() => goToClub(club)}
              >
                <div className="relative w-24 h-24 mb-8 grayscale group-hover:grayscale-0 transition-all duration-500">
                  {club.logoUrl ? (
                    <img
                      src={club.logoUrl}
                      alt={club.name}
                      loading="lazy"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full border border-white/10 flex items-center justify-center font-heading text-4xl text-white/10">
                      {club.name.charAt(0)}
                    </div>
                  )}
                </div>

                <h3 className="font-heading text-3xl uppercase mb-2 group-hover:text-copper transition-colors">
                  {club.name}
                </h3>
                <p className="font-text text-steel-dim text-sm italic mb-6">
                  &ldquo;{club.moto || "Brotherhood on wheels."}&rdquo;
                </p>

                {club.owner && (
                  <div className="flex items-center gap-2 mb-4 text-copper">
                    <Crown size={14} />
                    <span className="font-body text-[10px] uppercase tracking-widest">
                      {club.owner.name} · {roleLabel(club.owner.role)}
                    </span>
                  </div>
                )}

                <div className="flex gap-6 mb-8">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-copper" />
                    <span className="font-body text-[10px] uppercase tracking-widest text-steel-dim">
                      {club.participantCount || 0} ACTIVE
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-copper" />
                    <span className="font-body text-[10px] uppercase tracking-widest text-steel-dim">
                      EST.{" "}
                      {club.startedOn
                        ? new Date(club.startedOn).getFullYear()
                        : "2024"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToClub(club);
                  }}
                  className="w-full py-4 border border-white/10 font-body text-[10px] uppercase tracking-widest hover:bg-white hover:text-carbon transition-all duration-500 flex items-center justify-center gap-2"
                >
                  View Members <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Clubs;

