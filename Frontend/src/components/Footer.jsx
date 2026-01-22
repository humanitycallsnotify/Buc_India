import React from 'react';
import { Bike, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube, Globe } from 'lucide-react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

const Footer = () => {
  const quickLinks = [
    { name: 'About Us', href: '#about' },
    { name: 'Events', href: '#events' },
    { name: 'Membership', href: '#membership' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Safety', href: '#safety' },
    { name: 'Contact', href: '#contact' }
  ];

  const scrollToSection = (e, href) => {
    e.preventDefault();
    if (href === '#contact') {
      // Scroll to bottom or specific contact section if it exists
      gsap.to(window, {
        duration: 1,
        scrollTo: { y: "max" },
        ease: 'power3.inOut'
      });
      return;
    }
    const target = href.startsWith('#') ? href : `#${href}`;
    const element = document.querySelector(target);
    if (element) {
      gsap.to(window, {
        duration: 1,
        scrollTo: { y: target, offsetY: 80 },
        ease: 'power3.inOut'
      });
    }
  };

  const socialLinks = [
    { icon: Facebook, href: '#', name: 'Facebook' },
    { icon: Instagram, href: 'https://www.instagram.com/buc_india', name: 'Instagram' },
    { icon: Twitter, href: 'https://x.com/Buc_India', name: 'Twitter' },
    { icon: Youtube, href: 'https://www.youtube.com/@BucIndia', name: 'YouTube' }
  ];

  const humanityCallsSocialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/HumanityGcalls/', name: 'Facebook' },
    { icon: Instagram, href: 'https://www.instagram.com/humanitycalls_?igshid=MXBmb2d5MDFudm9waw%3D%3D', name: 'Instagram' },
    { icon: Twitter, href: 'https://x.com/Humanitycalls1', name: 'Twitter' },
    { icon: Youtube, href: 'https://www.youtube.com/@humanitycalls', name: 'YouTube' },
    { icon: Globe, href: 'https://www.humanitycalls.org', name: 'Website' }
  ];

  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative w-12 h-12">
                  <img 
                    src="/logo copy copy.jpg" 
                    alt="Bikers Unity Calls Logo" 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Bikers Unity Calls</h3>
                  <p className="text-sm text-gray-400">Ride Together, Stand Together</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Founded in 2025, we're India's largest group of motorcycle community dedicated to safe riding, 
                  brotherhood, and Inspiring change for a better tomorrow.
              </p>
              <div className="flex space-x-4 mb-6">
                {socialLinks.map((social) => (
                  <a
                    key={`buc-${social.name}`}
                    href={social.href}
                    className="bg-gray-800 p-3 rounded-lg text-gray-400 hover:text-white hover:bg-orange-500 transition-all duration-200"
                    aria-label={`BUC ${social.name}`}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative w-12 h-12">
                  <div className="w-12 h-12 rounded-full bg-white p-2 flex items-center justify-center">
                    <img
                      src="https://static.wixstatic.com/media/2d0007_ccad2163f88540659e8212ff5138666c~mv2.png/v1/fit/w_2500,h_1330,al_c/2d0007_ccad2163f88540659e8212ff5138666c~mv2.png"
                      alt="Humanity Calls Logo"
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Humanity Calls</h3>
                  <p className="text-sm text-gray-400">Answering the Call of Humanity with Compassion & Action</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Founded in 2020, Humanity Calls is a non-profit initiative built on the belief that service to humanity is the highest form of responsibility. Answering the Call of Humanity with Compassion & Action.
              </p>
              <div className="flex space-x-4">
                {humanityCallsSocialLinks.map((social) => (
                  <a
                    key={`hc-${social.name}`}
                    href={social.href}
                    className="bg-gray-800 p-3 rounded-lg text-gray-400 hover:text-white hover:bg-blue-500 transition-all duration-200"
                    aria-label={`Humanity Calls ${social.name}`}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className="text-gray-300 hover:text-orange-500 transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-300">
                <MapPin className="h-5 w-5 text-orange-500 flex-shrink-0" />
                <span>Bengaluru, Karnataka<br />India 560001</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone className="h-5 w-5 text-orange-500 flex-shrink-0" />
                <span>+91 88677 18080</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="h-5 w-5 text-orange-500 flex-shrink-0" />
                <span>bikersunitycallsindia@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Bikers Unity Calls. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-orange-500 text-sm transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 text-sm transition-colors duration-200">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 text-sm transition-colors duration-200">
                Code of Conduct
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
