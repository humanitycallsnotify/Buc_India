import React, { useEffect, useState } from "react";
import { clubService, clubMembershipService } from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Users, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  ChevronDown,
  MessageSquare, 
  Info,
  Clock,
  ExternalLink,
  UserCheck,
  Trash2
} from "lucide-react";

const ClubManagement = () => {
  const [clubs, setClubs] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedClub, setExpandedClub] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [viewClub, setViewClub] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [clubList, membershipList] = await Promise.all([
        clubService.getAllAdmin(),
        clubMembershipService.getAllAdmin(),
      ]);
      setClubs(clubList || []);
      setMemberships(membershipList || []);
    } catch (error) {
      console.error("Critical failure during telemetry retrieval:", error);
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await clubService.updateStatus(id, status);
      await loadData();
    } catch (error) {
      console.error("Protocol update failure:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    const { action, clubId } = confirmAction;
    
    setConfirmAction(null);
    setUpdatingId(clubId);
    
    try {
      if (action === 'delete') {
        await clubService.deleteAdmin(clubId);
      } else {
        await clubService.updateStatus(clubId, action === 'approve' ? 'approved' : 'rejected');
      }
      await loadData();
    } catch (error) {
      console.error(`Action ${action} failed:`, error);
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleExpand = (clubId) => {
    setExpandedClub(expandedClub === clubId ? null : clubId);
  };

  const exitMemberships = (memberships || []).filter(
    (m) => m.status === "exited" && m.exitReason
  );

  const getParticipantsForClub = (clubId) =>
    (memberships || []).filter(
      (m) =>
        (m.clubId?._id || m.clubId) === clubId &&
        m.status === "active"
    );

  const getFilteredClubs = () => {
    if (activeTab === "active") return clubs.filter(c => c.status === "approved");
    if (activeTab === "pending") return clubs.filter(c => c.status === "pending" || !c.status);
    if (activeTab === "rejected") return clubs.filter(c => c.status === "rejected");
    return [];
  };

  const filteredClubs = getFilteredClubs();

  return (
    <div className="space-y-8 pb-20">
      {/* Page Header */}
      <div>
        <span className="text-copper font-body text-[10px] tracking-ultra uppercase mb-2 block font-bold">Consub-Division Alpha</span>
        <h2 className="font-heading text-4xl uppercase leading-none text-white">Partner <span className="text-transparent outline-title">Clubs</span></h2>
        <p className="font-text text-steel-dim text-sm mt-4 max-w-2xl italic">
          Review collaboration requests, authenticate credentials, and monitor coalition resonance through exit telemetry.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-6 py-4 font-body text-[10px] uppercase tracking-widest font-bold transition-all ${
            activeTab === "pending"
              ? "text-copper border-b-2 border-copper bg-copper/5"
              : "text-steel-dim hover:text-white hover:bg-white/5"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setActiveTab("active")}
          className={`px-6 py-4 font-body text-[10px] uppercase tracking-widest font-bold transition-all ${
            activeTab === "active"
              ? "text-green-500 border-b-2 border-green-500 bg-green-500/5"
              : "text-steel-dim hover:text-white hover:bg-white/5"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setActiveTab("rejected")}
          className={`px-6 py-4 font-body text-[10px] uppercase tracking-widest font-bold transition-all ${
            activeTab === "rejected"
              ? "text-red-500 border-b-2 border-red-500 bg-red-500/5"
              : "text-steel-dim hover:text-white hover:bg-white/5"
          }`}
        >
          Rejected
        </button>
        <button
          onClick={() => setActiveTab("exits")}
          className={`px-6 py-4 font-body text-[10px] uppercase tracking-widest font-bold transition-all ${
            activeTab === "exits"
              ? "text-copper border-b-2 border-copper bg-copper/5"
              : "text-steel-dim hover:text-white hover:bg-white/5"
          }`}
        >
          Exit Reasons
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 border border-white/5 bg-carbon-light">
           <div className="w-12 h-12 border-2 border-copper/20 border-t-copper rounded-full animate-spin mb-4"></div>
           <p className="font-body text-[10px] uppercase tracking-widest text-steel-dim font-bold">Synchronizing Entity Manifest...</p>
        </div>
      ) : (
        <div className="min-h-[400px]">
          {activeTab !== "exits" ? (
            <section className="space-y-6 animate-fade-in">
              {filteredClubs.length === 0 ? (
                <div className="p-12 border border-white/5 bg-carbon-light text-center">
                   <p className="font-text text-steel-dim uppercase tracking-ultra italic">No coalitions found in this category.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 bg-carbon-light border border-white/5 font-body text-[10px] uppercase tracking-widest text-steel-dim font-bold">
                     <div className="col-span-4">Designation / Intel</div>
                     <div className="col-span-2">Inception</div>
                     <div className="col-span-3">Doctrine / Moto</div>
                     <div className="col-span-1 text-center">Resonance</div>
                     <div className="col-span-2 text-right">Authorize</div>
                  </div>

                  {filteredClubs.map((club) => {
                    const participants = getParticipantsForClub(club._id);
                    const isExpanded = expandedClub === club._id;

                    return (
                      <motion.div 
                        key={club._id} 
                        layout
                        className="bg-carbon border border-white/5 overflow-hidden group hover:border-white/10 transition-colors"
                      >
                        <div className="md:grid grid-cols-12 gap-4 px-8 py-6 items-center">
                          {/* Club Identity */}
                          <div className="col-span-12 md:col-span-4 flex items-center gap-4 mb-6 md:mb-0">
                             <div className="w-12 h-12 flex-shrink-0 bg-carbon-light border border-white/10 flex items-center justify-center overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                                {club.logoUrl ? (
                                  <img src={club.logoUrl} alt={club.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="font-heading text-xl text-copper">{club.name?.charAt(0) || "Ω"}</span>
                                )}
                             </div>
                             <div>
                                <div className="font-heading text-xl text-white uppercase group-hover:text-copper transition-colors">{club.name}</div>
                                <div className="font-body text-[9px] text-steel-dim uppercase tracking-widest mt-1">
                                  High Commander: <span className="text-white">{club.founder?.name || "REDACTED"}</span>
                                </div>
                             </div>
                          </div>

                          {/* Started On */}
                          <div className="col-span-6 md:col-span-2 space-y-1">
                             <div className="flex items-center gap-2 text-steel-dim text-[10px] uppercase tracking-widest">
                                <Clock size={12} className="text-copper/50" />
                                <span>{club.startedOn ? new Date(club.startedOn).toLocaleDateString() : "ALPHA PHASE"}</span>
                             </div>
                          </div>

                          {/* Moto */}
                          <div className="col-span-6 md:col-span-3">
                             <p className="text-steel-dim text-[10px] uppercase tracking-widest italic line-clamp-1 group-hover:line-clamp-none transition-all">
                                "{club.moto || club.showcaseText || "NO DECLARED DOCTRINE"}"
                             </p>
                          </div>

                          {/* Status/Badge */}
                          <div className="col-span-6 md:col-span-1 text-center">
                             <span className={`px-3 py-1 font-body text-[8px] uppercase font-bold tracking-widest inline-block rounded-full ${
                               club.status === "approved" ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                               club.status === "rejected" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                               "bg-copper/10 text-copper border border-copper/20"
                             }`}>
                               {club.status}
                             </span>
                          </div>

                          {/* Actions */}
                          <div className="col-span-12 md:col-span-2 flex flex-wrap justify-end gap-2 mt-4 md:mt-0">
                             <button
                               onClick={() => setViewClub(club)}
                               className="p-2 bg-copper text-carbon hover:bg-white transition-all rounded"
                               title="View Details"
                             >
                               <Info size={16} />
                             </button>

                             {activeTab !== "active" && (
                               <button
                                 disabled={updatingId === club._id}
                                 onClick={() => setConfirmAction({ action: 'approve', clubId: club._id, clubName: club.name })}
                                 className="p-2 bg-green-500 text-white hover:bg-green-400 transition-all rounded disabled:opacity-50"
                                 title="Approve Coalition"
                               >
                                 <CheckCircle size={16} />
                               </button>
                             )}
                             {activeTab !== "rejected" && (
                               <button
                                 disabled={updatingId === club._id}
                                 onClick={() => setConfirmAction({ action: 'reject', clubId: club._id, clubName: club.name })}
                                 className="p-2 bg-orange-500 text-white hover:bg-orange-400 transition-all rounded disabled:opacity-50"
                                 title="Reject Coalition"
                               >
                                 <XCircle size={16} />
                               </button>
                             )}
                             <button
                               disabled={updatingId === club._id}
                               onClick={() => setConfirmAction({ action: 'delete', clubId: club._id, clubName: club.name })}
                               className="p-2 bg-red-600 text-white hover:bg-red-500 transition-all rounded disabled:opacity-50"
                               title="Delete Coalition"
                             >
                               <Trash2 size={16} />
                             </button>

                             {participants.length > 0 && (
                               <button
                                 onClick={() => toggleExpand(club._id)}
                                 className={`p-2 transition-all rounded ${isExpanded ? 'text-copper bg-copper/5 border border-copper/20' : 'text-steel-dim hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'}`}
                               >
                                 {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                               </button>
                             )}
                          </div>
                        </div>

                        {/* Expanded Participants Section */}
                        <AnimatePresence>
                          {isExpanded && participants.length > 0 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="bg-carbon-light border-t border-white/5"
                            >
                              <div className="p-8 space-y-6">
                                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                   <Users size={14} className="text-copper" />
                                   <h4 className="font-body text-[10px] uppercase tracking-widest font-bold text-white">Active Operational Units ({participants.length})</h4>
                                </div>

                                <div className="grid gap-2">
                                  {participants.map((m) => (
                                    <div key={m._id} className="grid grid-cols-1 md:grid-cols-5 gap-4 py-3 border-b border-white/5 font-body text-[9px] uppercase tracking-widest text-steel-dim hover:text-white transition-colors">
                                      <div className="flex items-center gap-2 font-bold text-white">
                                         <UserCheck size={12} className="text-copper" />
                                         {m.userId?.fullName || "UNKNOWN UNIT"}
                                      </div>
                                      <div className="truncate">{m.userId?.email || "ENCRYPTED"}</div>
                                      <div className="font-mono text-[8px]">{m.userId?.phone || "-"}</div>
                                      <div className="text-copper font-bold">{m.role || "MEMBER"}</div>
                                      <div className="text-right italic">ENGAGED: {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "-"}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </section>
          ) : (
            <section className="space-y-6 animate-fade-in">
              {exitMemberships.length === 0 ? (
                <div className="p-12 border border-white/5 bg-carbon-light text-center">
                   <p className="font-text text-steel-dim uppercase tracking-ultra italic">Stable cohesion detected across all sectors. No exit telemetry found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {exitMemberships.map((m) => (
                    <div key={m._id} className="p-8 bg-carbon border border-white/5 group hover:border-red-500/20 transition-all">
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <div className="font-heading text-lg text-white group-hover:text-red-500 transition-colors uppercase">
                               {m.userId?.fullName || "UNIT"} // {m.clubId?.name || "COALITION"}
                            </div>
                            <div className="flex gap-3 mt-2 text-[8px] uppercase tracking-widest text-steel-dim font-bold">
                               <span>ID: {m.userId?.email || "REDACTED"}</span>
                               <span className="text-copper">PH: {m.userId?.phone || "REDACTED"}</span>
                               <span className="text-red-500/50">EXIT: {m.exitedAt ? new Date(m.exitedAt).toLocaleDateString() : "MANUAL TERM"}</span>
                            </div>
                         </div>
                         <MessageSquare size={20} className="text-red-500/20 group-hover:text-red-500/50 transition-colors" />
                      </div>
                      
                      <div className="bg-carbon-light p-4 border-l-2 border-red-500/30">
                         <div className="font-body text-[8px] uppercase tracking-widest text-red-500 font-bold mb-1">Debriefing Summary:</div>
                         <p className="font-text text-xs italic text-steel-dim leading-relaxed">
                           "{m.exitReason || "No formal reason provided for strategic withdrawal."}"
                         </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-carbon border border-white/10 max-w-md w-full p-6 shadow-2xl relative"
            >
              <h3 className="font-heading text-2xl uppercase mb-2 text-white">
                Confirm {confirmAction.action}
              </h3>
              <p className="font-text text-steel-dim mb-6">
                Are you sure you want to {confirmAction.action} the club "{confirmAction.clubName}"? 
                {confirmAction.action === 'delete' && " This action cannot be undone and will remove all associated operational units."}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="px-6 py-2 border border-white/20 text-steel-dim hover:text-white hover:bg-white/5 transition-all font-body text-xs uppercase tracking-widest rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirmAction()}
                  className={`px-6 py-2 text-white font-body text-xs uppercase tracking-widest transition-all rounded ${
                    confirmAction.action === 'approve' ? 'bg-green-500 hover:bg-green-400' :
                    confirmAction.action === 'reject' ? 'bg-orange-500 hover:bg-orange-400' :
                    'bg-red-600 hover:bg-red-500'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Details Modal */}
      <AnimatePresence>
        {viewClub && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto py-10"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-carbon border border-white/10 max-w-4xl w-full p-8 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setViewClub(null)}
                className="absolute top-4 right-4 text-steel-dim hover:text-white transition-colors"
              >
                <XCircle size={24} />
              </button>

              <div className="flex items-center gap-6 border-b border-white/10 pb-6 mb-6">
                <div className="w-24 h-24 bg-carbon-light border border-white/10 flex items-center justify-center overflow-hidden">
                  {viewClub.logoUrl ? (
                    <img src={viewClub.logoUrl} alt={viewClub.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-heading text-4xl text-copper">{viewClub.name?.charAt(0) || "Ω"}</span>
                  )}
                </div>
                <div>
                  <h2 className="font-heading text-4xl uppercase text-white leading-none mb-2">{viewClub.name}</h2>
                  <div className="flex gap-4 font-body text-[10px] uppercase tracking-widest text-steel-dim">
                    <span className={`px-2 py-1 rounded font-bold ${
                      viewClub.status === "approved" ? "bg-green-500/10 text-green-500" :
                      viewClub.status === "rejected" ? "bg-red-500/10 text-red-500" :
                      "bg-copper/10 text-copper"
                    }`}>{viewClub.status}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {viewClub.startedOn ? new Date(viewClub.startedOn).toLocaleDateString() : "Unknown"}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-body text-[10px] uppercase tracking-widest text-copper mb-2 border-b border-white/5 pb-1">Club Doctrine (Moto)</h4>
                    <p className="font-text text-steel-dim text-sm italic">"{viewClub.moto || 'None provided'}"</p>
                  </div>
                  <div>
                    <h4 className="font-body text-[10px] uppercase tracking-widest text-copper mb-2 border-b border-white/5 pb-1">Showcase Text</h4>
                    <p className="font-text text-steel-dim text-sm whitespace-pre-wrap">{viewClub.showcaseText || 'None provided'}</p>
                  </div>
                  <div>
                    <h4 className="font-body text-[10px] uppercase tracking-widest text-copper mb-2 border-b border-white/5 pb-1">Government ID / Reg No</h4>
                    <p className="font-text text-steel-dim text-sm">{viewClub.governmentIdNumber || 'None provided'}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-body text-[10px] uppercase tracking-widest text-copper mb-2 border-b border-white/5 pb-1">High Commander (Founder)</h4>
                    {viewClub.founder ? (
                      <div className="space-y-1 font-text text-sm text-steel-dim">
                        <p><span className="text-white">Name:</span> {viewClub.founder.name}</p>
                        <p><span className="text-white">Email:</span> {viewClub.founder.email}</p>
                        <p><span className="text-white">Phone:</span> {viewClub.founder.phone}</p>
                        <p><span className="text-white">Role:</span> <span className="uppercase">{viewClub.founder.role}</span></p>
                      </div>
                    ) : (
                      <p className="font-text text-steel-dim text-sm">No founder info</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-body text-[10px] uppercase tracking-widest text-copper mb-2 border-b border-white/5 pb-1">Additional Admins</h4>
                    {viewClub.admins && viewClub.admins.length > 0 ? (
                      <div className="space-y-4">
                        {viewClub.admins.map((admin, idx) => (
                          <div key={idx} className="space-y-1 font-text text-sm text-steel-dim">
                            <p><span className="text-white">Name:</span> {admin.name}</p>
                            <p><span className="text-white">Email:</span> {admin.email}</p>
                            <p><span className="text-white">Phone:</span> {admin.phone}</p>
                            <p><span className="text-white">Role:</span> <span className="uppercase">{admin.role}</span></p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="font-text text-steel-dim text-sm">None</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-body text-[10px] uppercase tracking-widest text-copper mb-2 border-b border-white/5 pb-1">Document Intel</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {viewClub.firstRideImageUrl ? (
                    <a href={viewClub.firstRideImageUrl} target="_blank" rel="noopener noreferrer" className="block border border-white/10 p-2 hover:border-copper transition-colors">
                      <img src={viewClub.firstRideImageUrl} alt="First Ride" className="w-full h-32 object-cover mb-2" />
                      <span className="font-body text-[8px] uppercase tracking-widest text-center block text-steel-dim">First Ride Image</span>
                    </a>
                  ) : (
                    <div className="border border-white/5 border-dashed p-4 flex items-center justify-center h-40 bg-white/5 text-steel-dim font-body text-[8px] uppercase tracking-widest text-center">No First Ride Image</div>
                  )}

                  {viewClub.governmentIdImageUrl ? (
                    <a href={viewClub.governmentIdImageUrl} target="_blank" rel="noopener noreferrer" className="block border border-white/10 p-2 hover:border-copper transition-colors">
                      <img src={viewClub.governmentIdImageUrl} alt="Government ID" className="w-full h-32 object-cover mb-2" />
                      <span className="font-body text-[8px] uppercase tracking-widest text-center block text-steel-dim">Government ID</span>
                    </a>
                  ) : (
                    <div className="border border-white/5 border-dashed p-4 flex items-center justify-center h-40 bg-white/5 text-steel-dim font-body text-[8px] uppercase tracking-widest text-center">No Gov ID Image</div>
                  )}

                  {viewClub.founderPassportUrl ? (
                    <a href={viewClub.founderPassportUrl} target="_blank" rel="noopener noreferrer" className="block border border-white/10 p-2 hover:border-copper transition-colors">
                      <img src={viewClub.founderPassportUrl} alt="Founder Passport" className="w-full h-32 object-cover mb-2" />
                      <span className="font-body text-[8px] uppercase tracking-widest text-center block text-steel-dim">Founder Passport/ID</span>
                    </a>
                  ) : (
                    <div className="border border-white/5 border-dashed p-4 flex items-center justify-center h-40 bg-white/5 text-steel-dim font-body text-[8px] uppercase tracking-widest text-center">No Passport Image</div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClubManagement;
