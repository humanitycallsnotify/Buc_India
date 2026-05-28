import { motion } from "framer-motion";
import { Heart, Compass, Users, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GalleryGlimpse from "./GalleryGlimpse";
import joinFamilyImg from "../assets/gallery/WhatsApp Image 2025-08-11 at 20.21.15_0db94979.jpg";

const About = () => {
  const navigate = useNavigate();
  const highlights = [
    "Weekly group rides and touring adventures",
    "Safety training and motorcycle maintenance workshops",
    "Charity rides and community service projects",
    "Annual rallies and motorcycle shows",
  ];

  const handleCtaClick = () => {
    const loggedIn = sessionStorage.getItem("userLoggedIn") === "true";
    if (loggedIn) {
      navigate("/profile");
    } else {
      navigate("/register");
    }
  };

  return (
    <section id="about" className="section-container py-32 bg-carbon relative">
      {/* More Than A Club Section - Layout Swap */}
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center mb-40">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="order-2 md:order-1"
        >
          <span className="text-copper font-body tracking-ultra text-xs md:text-sm uppercase mb-6 block font-bold">Our Legacy</span>
          <h2 className="font-heading text-6xl md:text-8xl text-white uppercase leading-none mb-8">
            More Than <br/><span className="text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.2)" }}>A Community</span>
          </h2>
          <p className="font-text text-steel-dim text-lg leading-relaxed mb-10 border-l-2 border-copper pl-6 max-w-xl">
            BUC India is a community of passionate riders dedicated to the spirit of brotherhood. We stand for more than just the road — supporting humanity, fostering genuine connections, and leading the way in passionate safety.
          </p>
          
          <div className="grid grid-cols-2 gap-6 mb-12">
            {["Organized Rides", "Safety First", "Pan-India Network", "Exclusive Events"].map((text) => (
              <div key={text} className="flex items-center gap-3 group">
                <div className="w-2 h-2 bg-copper rotate-45 transition-transform duration-300 group-hover:scale-150 group-hover:rotate-90"></div>
                <span className="font-body text-xs md:text-sm uppercase tracking-widest text-white group-hover:text-copper transition-colors">
                  {text}
                </span>
              </div>
            ))}
          </div>
          
          <div className="relative group inline-block overflow-hidden">
            <button
              onClick={handleCtaClick}
              className="relative px-12 py-4 border border-copper/40 text-copper font-body font-bold uppercase tracking-widest hover:text-carbon transition-colors duration-500 overflow-hidden"
            >
              <span className="relative z-10 transition-colors duration-500">Join The Legacy</span>
              <div className="absolute inset-0 bg-copper translate-x-[-105%] group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.3,1)]"></div>
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="order-1 md:order-2 group relative cursor-pointer"
        >
          <div className="overflow-hidden rounded-sm border border-white/10 shadow-2xl relative z-10">
            <img 
              src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2070&auto=format&fit=crop" 
              alt="Biker Group" 
              className="w-full grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
            />
          </div>
          {/* Atmospheric Glow behind image */}
          <div className="absolute -inset-4 bg-copper/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        </motion.div>
      </div>

      {/* Our Mission Section - Awwwards Style Grid */}
      <div className="max-w-7xl mx-auto px-6 mb-40">
        <div className="text-center mb-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center"
          >
            <h2 className="font-heading text-6xl md:text-7xl text-white uppercase tracking-tighter mb-4">
              Our <span className="text-copper">Mission</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-copper to-transparent mb-8"></div>
            <p className="font-text text-steel-dim text-lg leading-relaxed max-w-2xl mx-auto opacity-70">
              Founded in 2025, Bikers Unity Calls has grown from a small group of motorcycle enthusiasts to a thriving all-India community of riders.
            </p>
          </motion.div>
          {/* Subtle Background Text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 select-none pointer-events-none">
            <span className="font-heading text-[20vw] text-white/[0.02] tracking-tighter uppercase leading-none">IDENTITY</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { 
              title: "Brotherhood", 
              icon: Heart, 
              desc: "We believe in the unbreakable bonds formed between riders across India who share the same passion.",
              delay: 0.1
            },
            { 
              title: "Adventure", 
              icon: Compass, 
              desc: "Every ride is an opportunity to explore new horizons and create unforgettable memories.",
              delay: 0.2
            },
            { 
              title: "Community", 
              icon: Users, 
              desc: "Supporting each other on and off the road, building lasting friendships and connections across India.",
              delay: 0.3
            },
            { 
              title: "Excellence", 
              icon: Trophy, 
              desc: "Promoting safe riding practices and maintaining the highest standards in everything we do.",
              delay: 0.4
            }
          ].map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: pillar.delay, duration: 0.8 }}
              className="group relative"
            >
              <div className="h-full bg-carbon-light/30 backdrop-blur-sm border border-white/5 p-12 transition-all duration-500 group-hover:border-copper/40 group-hover:bg-carbon relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-copper/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-copper/10 transition-colors"></div>
                
                <div className="flex items-start gap-8 relative z-10">
                  <div className="w-14 h-14 bg-copper/10 flex items-center justify-center rounded-sm transition-transform duration-500 group-hover:rotate-[360deg] group-hover:scale-110">
                    <pillar.icon className="text-copper w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-3xl text-white uppercase mb-4 tracking-wide group-hover:text-copper transition-colors">{pillar.title}</h3>
                    <p className="font-text text-steel-dim leading-relaxed opacity-70 group-hover:opacity-100 transition-all">
                      {pillar.desc}
                    </p>
                  </div>
                </div>

                {/* Bottom slide-in line */}
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-copper transition-all duration-700 ease-out group-hover:w-full"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <GalleryGlimpse />

      {/* Join Our Family Card - Cinematic Layout Swap */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative p-1 md:p-1 overflow-hidden group">
          <div className="absolute inset-0 bg-carbon-light/40 backdrop-blur-md border border-white/5 rounded-sm"></div>
          
          <div className="grid lg:grid-cols-2 gap-0 relative z-10">
            {/* Image on Left now */}
            <div className="relative overflow-hidden group/img h-[400px] lg:h-auto">
              <img 
                src={joinFamilyImg} 
                alt="Family" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-carbon/80 lg:to-transparent"></div>
            </div>

            {/* Content on Right now */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="p-10 md:p-20 flex flex-col justify-center bg-carbon/60 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none"
            >
              <h3 className="font-heading text-5xl md:text-7xl text-white uppercase mb-8 leading-none">Join Our <span className="text-copper">Family</span></h3>
              <p className="font-text text-steel-dim text-lg leading-relaxed mb-10 max-w-lg">
                Whether you're a seasoned rider or just starting, you'll find a welcoming community here. We bring together riders from all corners of India to share the freedom of the road.
              </p>
              <ul className="grid sm:grid-cols-1 gap-6 mb-12">
                {highlights.map((item, i) => (
                  <motion.li 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-4 group/item"
                  >
                    <div className="w-1.5 h-1.5 bg-copper rotate-45 group-hover/item:scale-150 transition-transform"></div>
                    <span className="font-body text-sm uppercase tracking-[0.2em] text-steel-dim group-hover/item:text-white transition-colors">{item}</span>
                  </motion.li>
                ))}
              </ul>
              
              <div className="relative group/btn inline-block self-start overflow-hidden">
              <button
                onClick={handleCtaClick}
                className="relative px-12 py-5 bg-copper text-carbon font-heading text-lg uppercase tracking-widest hover:bg-white transition-colors duration-500 overflow-hidden"
              >
                  <span className="relative z-10">Get Started</span>
                </button>
              </div>
            </motion.div>
          </div>
          
          {/* Atmospheric Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-copper/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-copper/5 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>
      </div>
    </section>
  );
};

export default About;
