import React, { useState } from "react";
import UserRegistrationForm from "./UserRegistrationForm";
import TalentRegistrationForm from "./TalentRegistrationForm";
import ClubCollaborate from "./Clubs/ClubCollaborate";
import { User, Shield, Star } from "lucide-react";

const MainRegistration = () => {
  const [activeTab, setActiveTab] = useState("user");

  return (
    <div className="min-h-screen bg-carbon text-white">
      {/* BUC India Brand Top Bar */}
      <div className="w-full bg-carbon-light border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="BUC India" className="w-10 h-10 rounded-full border border-copper/30 object-cover" />
            <div className="flex flex-col leading-none">
              <span className="font-heading text-lg uppercase tracking-widest text-white">BUC India</span>
              <span className="font-body text-[9px] uppercase tracking-[0.25em] text-copper">Bikers Unity Calls</span>
            </div>
          </div>
          <span className="hidden sm:block font-body text-[10px] uppercase tracking-[0.3em] text-steel-dim">
            Registration Portal
          </span>
        </div>
      </div>

      <div className="pt-10 pb-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-heading text-5xl md:text-7xl uppercase mb-4">
              Registration <span className="text-transparent outline-title">Portal</span>
            </h1>
            <p className="font-text text-steel-dim text-lg max-w-2xl mx-auto leading-relaxed">
              Select the type of registration below. Join as an individual rider, showcase your talent, or partner your club with the network.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex justify-center mb-12">
            <div className="flex flex-wrap justify-center gap-2 bg-white/5 border border-white/10 p-1 rounded-full">
              <button
                onClick={() => setActiveTab("user")}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-body text-xs tracking-widest uppercase transition-all duration-300 ${
                  activeTab === "user"
                    ? "bg-copper text-carbon font-bold"
                    : "text-steel-dim hover:text-white hover:bg-white/5"
                }`}
              >
                <User size={14} /> User Registration
              </button>
              <button
                onClick={() => setActiveTab("talent")}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-body text-xs tracking-widest uppercase transition-all duration-300 ${
                  activeTab === "talent"
                    ? "bg-copper text-carbon font-bold"
                    : "text-steel-dim hover:text-white hover:bg-white/5"
                }`}
              >
                <Star size={14} /> Talent Registration
              </button>
              <button
                onClick={() => setActiveTab("club")}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-body text-xs tracking-widest uppercase transition-all duration-300 ${
                  activeTab === "club"
                    ? "bg-copper text-carbon font-bold"
                    : "text-steel-dim hover:text-white hover:bg-white/5"
                }`}
              >
                <Shield size={14} /> Club Registration
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="transition-all duration-500">
            {activeTab === "user" && (
              <div className="animate-fade-in">
                <UserRegistrationForm />
              </div>
            )}
            {activeTab === "talent" && (
              <div className="animate-fade-in">
                <TalentRegistrationForm />
              </div>
            )}
            {activeTab === "club" && (
              <div className="animate-fade-in -mt-16">
                <ClubCollaborate />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainRegistration;
