import React, { useState } from "react";
import {
  Search,
  MapPin,
  Bike,
  Calendar,
  Award,
  MessageCircle,
} from "lucide-react";

const Members = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");

  const members = [];

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.bike.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterBy === "all") return matchesSearch;
    if (filterBy === "officers")
      return (
        matchesSearch &&
        ["President", "Treasurer", "Secretary", "Road Captain"].includes(
          member.role,
        )
      );
    if (filterBy === "new")
      return matchesSearch && parseInt(member.joinDate) >= 2022;
    if (filterBy === "veterans")
      return matchesSearch && parseInt(member.joinDate) <= 2019;

    return matchesSearch;
  });

  const getBadgeColor = (badge) => {
    const colors = {
      Founder: "bg-purple-500",
      Leadership: "bg-blue-500",
      "Safety Expert": "bg-green-500",
      "Long Distance": "bg-orange-500",
      "Event Organizer": "bg-red-500",
      "Adventure Rider": "bg-yellow-500",
      Photographer: "bg-pink-500",
      Mentor: "bg-indigo-500",
      "New Rider": "bg-gray-500",
      Enthusiast: "bg-teal-500",
      "Charity Rider": "bg-rose-500",
      "Classic Enthusiast": "bg-amber-500",
    };
    return colors[badge] || "bg-gray-500";
  };

  return (
    <section id="members" className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
          alt="Motorcycle community background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/85"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
              Brotherhood
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Meet the riders who make our community strong. Connect, share
            experiences, and build lasting friendships.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search members by name, location, or bike..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
            />
          </div>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
          >
            <option value="all">All Members</option>
            <option value="officers">Club Officers</option>
            <option value="new">New Members</option>
            <option value="veterans">Veteran Members</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-orange-500/50 transition-all duration-300 group"
            >
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-orange-500"
                />
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-orange-500 transition-colors duration-200">
                    {member.name}
                  </h3>
                  <p className="text-orange-500 font-semibold">{member.role}</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-gray-300">
                  <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                  <span>{member.location}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Bike className="h-4 w-4 mr-2 text-orange-500" />
                  <span>{member.bike}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                  <span>Member since {member.joinDate}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Award className="h-4 w-4 mr-2 text-orange-500" />
                  <span>{member.ridesCompleted} rides completed</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {member.badges.map((badge, index) => (
                    <span
                      key={index}
                      className={`${getBadgeColor(badge)} text-white text-xs px-2 py-1 rounded-full font-semibold`}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Connect</span>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-orange-500/10 to-red-600/10 rounded-2xl p-8 border border-orange-500/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-2">500+</div>
              <div className="text-gray-300">Total Members</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">1</div>
              <div className="text-gray-300">States Represented</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">2,500+</div>
              <div className="text-gray-300">Total Rides</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">20K+</div>
              <div className="text-gray-300">kms Traveled</div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Join Our Family?
          </h3>
          <p className="text-gray-300 mb-6">
            Become part of a community that shares your passion for riding and
            adventure.
          </p>
          <button 
            onClick={() => window.dispatchEvent(new Event('open-registration'))}
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-200"
          >
            Start Your Membership
          </button>
        </div>
      </div>
    </section>
  );
};

export default Members;
