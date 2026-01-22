import React from 'react';
import { Heart, Loader as Road, Users, Trophy } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Heart,
      title: 'Brotherhood',
      description: 'We believe in the unbreakable bonds formed between riders across India who share the same passion.'
    },
    {
      icon: Road,
      title: 'Adventure',
      description: 'Every ride is an opportunity to explore new horizons and create unforgettable memories.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Supporting each other on and off the road, building lasting friendships and connections across India.'
    },
    {
      icon: Trophy,
      title: 'Excellence',
      description: 'Promoting safe riding practices and maintaining the highest standards in everything we do.'
    }
  ];

  return (
    <section id="about" className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/1119796/pexels-photo-1119796.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
          alt="Group of motorcycle riders"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/75"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Mission</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Founded in 2025, Bikers Unity Calls has grown from a small group of motorcycle enthusiasts 
            to a thriving all-India community of riders who share a common love for the open road and the freedom it represents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {values.map((value, index) => (
            <div key={index} className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 group">
              <value.icon className="h-12 w-12 text-orange-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-semibold text-white mb-3">{value.title}</h3>
              <p className="text-gray-300">{value.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-orange-500/10 to-red-600/10 rounded-2xl p-8 border border-orange-500/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold text-white mb-4">Join Our Family</h3>
              <p className="text-gray-300 mb-6">
                Whether you're a seasoned rider with decades of experience or just starting your journey on two wheels, 
                you'll find a welcoming community here. We organize regular rides across India, safety workshops, charity events, 
                and social gatherings that bring our members together from all corners of the country.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Weekly group rides and touring adventures</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Safety training and motorcycle maintenance workshops</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Charity rides and community service projects</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Annual rallies and motorcycle shows</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1119796/pexels-photo-1119796.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Group of bikers"
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
