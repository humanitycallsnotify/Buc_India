import React, { useState, useEffect, useMemo } from "react";
import { usersService } from "../services/api";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await usersService.getPublic();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load users. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const loc = [u.city, u.state].filter(Boolean).join(", ");
      const matchesSearch =
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.clubName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.toLowerCase().includes(searchTerm.toLowerCase());

      if (roleFilter === "all") return matchesSearch;
      if (roleFilter === "leadership") {
        return (
          matchesSearch &&
          ["BUC India Owner", "Founder", "Co-Founder", "Club Owner", "Club Admin", "Club Co-Admin"].includes(
            u.role,
          )
        );
      }
      return matchesSearch;
    });
  }, [users, searchTerm, roleFilter]);

  return (
    <section className="section-container py-24 bg-carbon text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <span className="text-copper font-body tracking-ultra text-xs uppercase mb-2 block font-bold">
            Directory
          </span>
          <h1 className="font-heading text-6xl md:text-8xl uppercase leading-none mb-4">
            BUC{" "}
            <span className="text-copper">Community</span>
          </h1>
          <p className="font-text text-steel-dim max-w-2xl">
            Owners, club leadership, and registered riders across the BUC India
            network.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <input
            type="text"
            placeholder="SEARCH BY NAME, ROLE, CLUB..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
            className="flex-1 bg-transparent border border-white/10 px-6 py-3 font-body text-xs tracking-widest uppercase focus:border-copper outline-none disabled:opacity-50"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            disabled={loading}
            className="bg-transparent border border-white/10 px-6 py-3 font-body text-xs tracking-widest uppercase focus:border-copper outline-none appearance-none cursor-pointer disabled:opacity-50"
          >
            <option value="all" className="bg-carbon">All Users</option>
            <option value="leadership" className="bg-carbon">Leadership</option>
          </select>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-12 h-12 border-4 border-copper/30 border-t-copper rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="py-20 text-center border border-dashed border-red-500/30">
            <p className="font-body text-red-400 uppercase tracking-widest text-sm">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-white/10">
            <p className="font-body text-steel-dim uppercase tracking-widest text-sm">
              {users.length === 0 ? "No users available yet." : "No users match your search."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((user, i) => (
              <div
                key={`${user.fullName}-${i}`}
                className="p-6 border border-white/5 bg-carbon-light hover:border-copper/30 transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full border border-copper/30 overflow-hidden shrink-0">
                    <img
                      src={user.profileImage || "/logo.jpg"}
                      alt={user.fullName}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl uppercase">{user.fullName}</h3>
                    <span className="text-copper font-body text-[10px] tracking-widest uppercase">
                      {user.role}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 font-body text-[10px] uppercase tracking-widest">
                  {user.clubName && (
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-steel-dim">Club</span>
                      <span>{user.clubName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-steel-dim">Location</span>
                    <span>
                      {[user.city, user.state].filter(Boolean).join(", ") || "—"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Users;
