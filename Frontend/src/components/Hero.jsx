import React from 'react';
import { ArrowRight, Users, Calendar, Shield } from 'lucide-react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

const Hero = () => {
  const scrollToEvents = () => {
    gsap.to(window, {
      duration: 1,
      scrollTo: { y: "#events", offsetY: 80 },
      ease: 'power3.inOut'
    });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
          alt="Motorcycle riders on the road"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-6 sm:mb-8 pt-16 sm:pt-20 lg:pt-24">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            <span className="block text-white px-2">
              Bikers Unity Calls
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-6 sm:mb-8 max-w-2xl sm:max-w-3xl mx-auto px-2 leading-relaxed">
            Where passion meets the pavement. Join a community of riders across India who share the love for the open road, 
            adventure, and the unbreakable bonds forged on two wheels.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 px-2">
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-orange-500/20">
            <Users className="h-8 w-8 sm:h-12 sm:w-12 text-orange-500 mx-auto mb-3 sm:mb-4" />
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">500+</div>
            <div className="text-sm sm:text-base text-gray-300">Members</div>
          </div>
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-orange-500/20">
            <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-orange-500 mx-auto mb-3 sm:mb-4" />
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">10+</div>
            <div className="text-sm sm:text-base text-gray-300">Events This Year</div>
          </div>
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-orange-500/20 sm:col-span-2 lg:col-span-1">
            <Shield className="h-8 w-8 sm:h-12 sm:w-12 text-orange-500 mx-auto mb-3 sm:mb-4" />
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">4+</div>
            <div className="text-sm sm:text-base text-gray-300">Years Strong</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-2">
          <button 
            onClick={() => {
              window.dispatchEvent(new Event('open-registration'));
            }}
            className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2">
            <span>Join Our Community</span>
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button 
            onClick={scrollToEvents}
            className="w-full sm:w-auto border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-white hover:text-black transition-all duration-200">
            View Upcoming Rides
          </button>
        </div>
      </div>

      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-2 sm:h-3 bg-white rounded-full mt-1.5 sm:mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
