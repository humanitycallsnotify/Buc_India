import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Bike,
  Check,
  UserPlus,
  Share2,
} from "lucide-react";
import { toast } from "react-toastify";

const Registration = () => {
  const freeFeatures = [
    "Access to all group rides across India",
    "Monthly newsletter with riding tips",
    "Full forum access and community support",
    "Event notifications and priority registration",
    "Safety workshops and training sessions",
    "Roadside assistance network",
    "Free community patches and stickers",
    "Connect with riders in your city",
    "Participate in charity rides",
    "Access to riding routes and maps",
  ];

  return (
    <section
      id="membership"
      className="py-20 bg-gray-900 border-t-4 border-orange-500"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Join the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
              Community
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Become part of India's largest motorcycle community. Connect with
            riders across the country - completely free!
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-500/10 to-blue-600/10 rounded-2xl p-8 border border-green-500/20 mb-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-white mb-4">
              🎉 Completely <span className="text-green-400">FREE</span>{" "}
              Registration!
            </h3>
            <p className="text-xl text-gray-300">
              Join thousands of riders across India at no cost. Here's what you
              get:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {freeFeatures.map((feature, index) => (
              <div key={index} className="flex items-center text-gray-300">
                <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 bg-gradient-to-r from-orange-500/10 to-red-600/10 rounded-2xl p-8 border border-orange-500/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-2">1000+</div>
              <div className="text-gray-300">Active Members</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">28</div>
              <div className="text-gray-300">States Covered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">500+</div>
              <div className="text-gray-300">Cities Connected</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">FREE</div>
              <div className="text-gray-300">Always & Forever</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <button className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-12 py-4 rounded-lg font-semibold text-lg hover:from-green-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Join Community - FREE!</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Registration;
