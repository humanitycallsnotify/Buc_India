import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { membersService } from "../services/api";
import { User } from "lucide-react";

const mapMemberForDisplay = (member, index) => {
  const location = [member.city, member.state].filter(Boolean).join(", ");
  const role = member.clubName
    ? `${member.registrationType || "Member"} · ${member.clubName}`
    : member.registrationType || "Member";

  return {
    id: `${member.fullName}-${location}-${index}`,
    name: member.fullName,
    role,
    bucId: member.bucId || "PENDING",
    location: location || "—",
    bike: member.bikeModel || "—",
    avatar: member.profileImage,
  };
};

const Members = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn] = useState(
    sessionStorage.getItem("userLoggedIn") === "true",
  );

  useEffect(() => {
    const loadMembers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await membersService.getPublic();
        setMembers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load members:", err);
        setError(
          err.response?.data?.message || "Unable to load members. Please try again.",
        );
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };
    loadMembers();
  }, []);

  const displayMembers = useMemo(
    () => members.map(mapMemberForDisplay),
    [members],
  );

  const filteredMembers = displayMembers.filter((member) => {
    const matchesSearch =
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.bike?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterBy === "all") return matchesSearch;
    if (filterBy === "officers")
      return (
        matchesSearch &&
        ["President", "Treasurer", "Secretary", "Road Captain"].includes(
          member.role,
        )
      );
    return matchesSearch;
  });

  const stats = [
    { value: "500+", label: "ACTIVE RIDERS" },
    { value: "1", label: "ONE NATION · ONE BROTHERHOOD" },
  ];

  const renderMemberGrid = () => {
    if (loading) {
      return (
        <div className="col-span-full py-20 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-copper/20 border-t-copper rounded-full animate-spin mb-4" />
          <p className="font-body text-steel-dim uppercase tracking-widest text-sm">
            Loading members...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="col-span-full py-20 text-center border border-dashed border-red-500/30">
          <p className="font-body text-red-400 uppercase tracking-widest text-sm">
            {error}
          </p>
        </div>
      );
    }

    if (members.length === 0) {
      return (
        <div className="col-span-full py-20 text-center border border-dashed border-white/10">
          <p className="font-body text-steel-dim uppercase tracking-widest text-sm italic">
            No members available yet.
          </p>
        </div>
      );
    }

    if (filteredMembers.length === 0) {
      return (
        <div className="col-span-full py-20 text-center border border-dashed border-white/10">
          <p className="font-body text-steel-dim uppercase tracking-widest text-sm italic">
            No brothers found with these criteria. Try another search.
          </p>
        </div>
      );
    }

    return filteredMembers.map((member) => (
      <div
        key={member.id}
        className="group p-8 border border-white/5 bg-carbon-light hover:border-copper/30 transition-all duration-500"
      >
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full border border-copper/30 overflow-hidden bg-carbon/50 flex items-center justify-center">
            {member.avatar ? (
              <img
                src={member.avatar}
                alt={member.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-copper/40" />
            )}
          </div>
          <div>
            <h3 className="font-heading text-2xl uppercase">{member.name}</h3>
            <span className="text-copper font-body text-[10px] tracking-widest uppercase">
              {member.bucId}
            </span>
          </div>
        </div>

      </div>
    ));
  };

  return (
    <section id="members" className="section-container py-24 bg-carbon text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div>
            <span className="text-copper font-body tracking-ultra text-xs md:text-sm uppercase mb-2 block font-bold">
              The Pack
            </span>
            <h2 className="font-heading text-6xl md:text-8xl uppercase leading-none">
              Our{" "}
              <span className="text-copper">Believers</span>
            </h2>
          </div>

          <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="SEARCH RIDERS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
              className="bg-transparent border border-white/10 px-6 py-3 font-body text-xs tracking-widest uppercase focus:border-copper outline-none transition-colors min-w-[300px] disabled:opacity-50"
            />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              disabled={loading}
              className="bg-transparent border border-white/10 px-6 py-3 font-body text-xs tracking-widest uppercase focus:border-copper outline-none transition-colors appearance-none cursor-pointer disabled:opacity-50"
            >
              <option value="all" className="bg-carbon text-white">
                All Members
              </option>
              <option value="officers" className="bg-carbon text-white">
                Club Officers
              </option>
              <option value="new" className="bg-carbon text-white">
                New Members
              </option>
              <option value="veterans" className="bg-carbon text-white">
                Veteran Members
              </option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {renderMemberGrid()}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-20 border-t border-white/5 max-w-3xl mx-auto">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <span className="font-heading text-6xl text-white block mb-2">
                {stat.value}
              </span>
              <span className="font-body text-[10px] text-copper tracking-[0.3em] font-bold uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {!isLoggedIn && (
          <div className="mt-32 p-16 border border-copper/20 bg-gradient-to-br from-copper/5 to-transparent text-center">
            <h3 className="font-heading text-4xl md:text-6xl uppercase mb-6 leading-none">
              Join The{" "}
              <span className="text-copper">Elite</span>
            </h3>
            <p className="font-text text-steel-dim text-lg mb-10 max-w-xl mx-auto">
              Become a part of India&apos;s most prestigious riding brotherhood.
              Exclusive access to premium rallies and events.
            </p>
            <button
              onClick={() => navigate("/membership-apply")}
              className="bg-copper text-carbon px-12 py-5 font-heading text-xl uppercase hover:bg-white transition-all duration-500"
            >
              Apply For Membership
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Members;

