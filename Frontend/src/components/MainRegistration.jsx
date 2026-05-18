import React, { useState } from "react";
import UserRegistrationForm from "./UserRegistrationForm";
import ClubCollaborate from "./Clubs/ClubCollaborate";
import { User, Shield } from "lucide-react";

const MainRegistration = () => {
  const [activeTab, setActiveTab] = useState("user");

  return (
    <div className="min-h-screen bg-carbon text-white pt-12 pb-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-heading text-5xl md:text-7xl uppercase mb-4">
            Registration <span className="text-transparent outline-title">Portal</span>
          </h1>
          <p className="font-text text-steel-dim text-lg max-w-2xl mx-auto leading-relaxed">
            Select the type of registration below. Join as an individual rider or partner your club with the network.
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="flex bg-white/5 border border-white/10 p-1 rounded-full">
            <button
              onClick={() => setActiveTab("user")}
              className={`flex items-center gap-2 px-8 py-4 rounded-full font-body text-xs tracking-widest uppercase transition-all duration-300 ${
                activeTab === "user"
                  ? "bg-copper text-carbon font-bold"
                  : "text-steel-dim hover:text-white hover:bg-white/5"
              }`}
            >
              <User size={16} /> User Registration
            </button>
            <button
              onClick={() => setActiveTab("club")}
              className={`flex items-center gap-2 px-8 py-4 rounded-full font-body text-xs tracking-widest uppercase transition-all duration-300 ${
                activeTab === "club"
                  ? "bg-copper text-carbon font-bold"
                  : "text-steel-dim hover:text-white hover:bg-white/5"
              }`}
            >
              <Shield size={16} /> Club Registration
            </button>
          </div>
        </div>

        <div className="transition-all duration-500">
          {activeTab === "user" ? (
            <div className="animate-fade-in">
              <UserRegistrationForm />
            </div>
          ) : (
            <div className="animate-fade-in -mt-16">
              <ClubCollaborate />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainRegistration;
