import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { PhoneCall } from "lucide-react";
import groupRidingImg from "../assets/gallery/WhatsApp Image 2025-08-09 at 21.22.15_0472380c.jpg";
import { safetyInfluencerService } from "../services/api";
import ProfileContentModal from "./ProfileContentModal";

const Character = ({ char, index, progress, total }) => {
  // Ensure the entire animation finishes before reaching the very end (by 80% scroll)
  const range = 0.8;
  const start = (index / total) * range;
  const end = ((index + 3) / total) * range; 
  
  const opacity = useTransform(progress, [start, end], [0.1, 1]);
  const y = useTransform(progress, [start, end], [5, 0]);
  const scale = useTransform(progress, [start, end], [0.95, 1]);
  
  return (
    <motion.span 
      style={{ opacity, y, scale }} 
      className="inline-block"
    >
      {char === " " ? "\u00A0" : char}
    </motion.span>
  );
};

const Safety = () => {
  const [influencers, setInfluencers] = useState([]);
  const [loadingInfluencers, setLoadingInfluencers] = useState(true);
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const pledgeRef = useRef(null);
  const fullPledge =
    "As members of Bikers Unity Calls, we pledge to prioritize safety in all our riding activities. We commit to wearing proper protective gear, following traffic laws, riding within our abilities, and looking out for our fellow riders. Together, we ensure that every ride ends with everyone returning home safely.";

  const { scrollYProgress } = useScroll({
    target: pledgeRef,
    offset: ["start 80%", "end 40%"]
  });

  const pledgeChars = fullPledge.split("");
  
  // Background atmosphere scale/opacity
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.2, 0.4, 0.2]);
  const glowScale = useTransform(scrollYProgress, [0, 1], [0.8, 1.2]);

  useEffect(() => {
    const loadInfluencers = async () => {
      try {
        const data = await safetyInfluencerService.getPublic();
        setInfluencers(data || []);
      } catch (error) {
        console.error("Failed to load safety influencers:", error);
      } finally {
        setLoadingInfluencers(false);
      }
    };
    loadInfluencers();
  }, []);

  const safetyTips = [
    { title: "Protective Gear", description: "Always wear DOT-approved helmet, protective jacket, gloves, and boots." },
    { title: "Road Awareness", description: "Stay alert and anticipate potential hazards on the road." },
    { title: "Pre-Ride Inspection", description: "Perform thorough bike inspection before every ride." },
  ];

  const emergencyContacts = [
    { 
      label: "CHILD ABUSE & SAFETY", 
      number: "1098", 
      desc: "Dedicated helpline for children in distress" 
    },
    { 
      label: "EMERGENCY SERVICES", 
      number: "112", 
      desc: "For immediate life-threatening emergencies" 
    },
    { 
      label: "COMMUNITY EMERGENCY LINE", 
      number: "88677 13031", 
      desc: "Community member assistance and roadside help" 
    },
    { 
      label: "ROADSIDE ASSISTANCE", 
      number: "1033-HELP", 
      desc: "Motorcycle towing and breakdown assistance" 
    },
  ];

  return (
    <section id="safety" className="section-container pt-24 bg-carbon-light relative">
      <div className="max-w-7xl mx-auto px-6 mb-16 flex flex-col md:flex-row justify-between items-end reveal-text visible">
        <div>
          <span className="text-copper font-body tracking-ultra text-xs md:text-sm uppercase mb-2 block font-bold">Safety Standards</span>
          <h2 className="font-heading text-6xl md:text-7xl text-white uppercase leading-none">Ride <span className="text-copper">Safe</span></h2>
        </div>
        <div className="hidden md:block w-32 h-[1px] bg-white/20 mb-4"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 mb-24">
        {safetyTips.map((tip, index) => (
          <div key={index} className="group p-8 border border-white/5 bg-carbon transition-all duration-500 hover:border-copper/30 hover:-translate-y-2">
            <div className="w-12 h-12 bg-copper/10 border border-copper/20 flex items-center justify-center mb-6 transition-transform duration-500 group-hover:rotate-[360deg]">
               <span className="text-copper font-heading text-xl">0{index + 1}</span>
            </div>
            <h3 className="font-heading text-2xl text-white uppercase mb-4">{tip.title}</h3>
            <p className="font-text text-steel-dim text-sm leading-relaxed">{tip.description}</p>
          </div>
        ))}
      </div>

      {/* Safety Influencers */}
      {(loadingInfluencers || influencers.length > 0) && (
        <div className="max-w-7xl mx-auto px-6 mb-24">
          <div className="mb-12">
            <span className="text-copper font-body tracking-ultra text-xs md:text-sm uppercase mb-2 block font-bold">Safety Advocates</span>
            <h2 className="font-heading text-5xl md:text-6xl text-white uppercase leading-none">
              Safety <span className="text-copper">Influencers</span>
            </h2>
          </div>

          {loadingInfluencers ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-copper/20 border-t-copper rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {influencers.map((influencer) => (
                <button
                  key={influencer._id}
                  type="button"
                  onClick={() => setSelectedInfluencer(influencer)}
                  className="group text-left p-6 border border-white/5 bg-carbon hover:border-copper/30 transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="w-24 h-24 mb-6 overflow-hidden border border-copper/20 rounded-full mx-auto sm:mx-0">
                    <img
                      src={influencer.profilePhoto}
                      alt={influencer.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <h3 className="font-heading text-xl uppercase text-white group-hover:text-copper transition-colors mb-1">
                    {influencer.name}
                  </h3>
                  <p className="font-body text-[10px] text-steel-dim uppercase tracking-widest mb-3">
                    {[influencer.designation, influencer.organization].filter(Boolean).join(" · ")}
                  </p>
                  {influencer.shortDescription && (
                    <p className="font-text text-steel-dim text-sm line-clamp-3">{influencer.shortDescription}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Safety Pledge */}
      <div ref={pledgeRef} className="relative py-24 my-12">
        <div className="flex flex-col justify-center items-center overflow-hidden">
          {/* Atmospheric Glow */}
          <motion.div 
            style={{ opacity: glowOpacity, scale: glowScale }}
            className="absolute w-[600px] h-[600px] bg-copper/20 rounded-full blur-[150px] pointer-events-none z-0"
          ></motion.div>

          <div className="max-w-5xl w-full mx-auto px-6 relative z-10">
            <div className="p-12 md:p-16 text-center border-y border-white/5 bg-carbon/40 backdrop-blur-sm relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-32 bg-gradient-to-b from-copper to-transparent"></div>
              
              <h3 className="font-heading text-4xl md:text-5xl text-copper uppercase mb-10 tracking-widest ">Our Safety Pledge</h3>
              
              <div className="min-h-[150px] md:min-h-[100px]">
                <p className="font-text text-xl md:text-2xl text-steel-dim leading-relaxed max-w-4xl mx-auto">
                  "
                  {pledgeChars.map((char, i) => (
                    <Character
                      key={i}
                      char={char}
                      index={i}
                      progress={scrollYProgress}
                      total={pledgeChars.length}
                    />
                  ))}
                  "
                </p>
              </div>

              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-32 bg-gradient-to-t from-copper/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contacts Section */}
      <div className="max-w-7xl mx-auto px-6 mb-32">
        <div className="flex flex-col items-center mb-16 relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-4"
          >
            <PhoneCall className="text-copper w-6 h-6 animate-pulse" />
            <h2 className="font-heading text-6xl md:text-7xl text-white uppercase tracking-tighter mb-4">
              Emergency <span className="text-copper">Contacts</span>
            </h2>
          </motion.div>
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: "100px" }}
            viewport={{ once: true }}
            className="h-[1px] bg-gradient-to-r from-transparent via-copper to-transparent"
          ></motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {emergencyContacts.map((contact, index) => (
            <motion.div
              key={contact.number}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="group relative h-[280px]"
            >
              <div className="absolute inset-0 bg-carbon border border-white/5 transition-all duration-500 group-hover:border-copper/30 group-hover:bg-carbon-light group-hover:-translate-y-2 z-10 flex flex-col p-8 items-center text-center justify-between">
                <span className="font-body text-[10px] tracking-[0.3em] text-white/40 uppercase group-hover:text-copper/60 transition-colors">
                  {contact.label}
                </span>
                <div className="flex flex-col gap-2">
                  <span className="font-heading text-3xl md:text-4xl text-copper tracking-tighter group-hover:tracking-normal transition-all duration-500">
                    {contact.number}
                  </span>
                  <div className="h-[2px] w-0 bg-copper group-hover:w-full transition-all duration-700 mx-auto"></div>
                </div>
                <p className="font-text text-steel-dim text-xs leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
                  {contact.desc}
                </p>
              </div>
              {/* Card Shadow/Glow */}
              <div className="absolute inset-0 bg-copper/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-0"></div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Group Riding Section */}
      <div className="max-w-7xl mx-auto px-6 mt-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
           <div className="order-2 lg:order-1">
              <img src={groupRidingImg} alt="Group Riding" className="w-full grayscale hover:grayscale-0 transition-all duration-700 border border-white/10" />
           </div>
           <div className="order-1 lg:order-2">
              <span className="text-copper font-body tracking-ultra text-xs md:text-sm uppercase mb-4 block font-bold">Group Protocol</span>
              <h2 className="font-heading text-5xl md:text-6xl text-white uppercase leading-tight mb-8">Synchronized <br/><span className="text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.2)" }}>Riding</span></h2>
              <ul className="space-y-4">
                {[
                  "Attend pre-ride briefings and follow designated routes",
                  "Maintain proper formation and spacing",
                  "Use hand signals and communicate with other riders",
                  "Never ride beyond your skill level or comfort zone"
                ].map((tip, i) => (
                  <li key={i} className="flex items-center gap-4 group">
                    <div className="w-2 h-2 bg-copper rotate-45 transition-all duration-300 group-hover:bg-white group-hover:scale-125"></div>
                    <span className="font-body text-sm uppercase tracking-widest text-steel-dim group-hover:text-white transition-colors">{tip}</span>
                  </li>
                ))}
              </ul>
           </div>
        </div>
      </div>

      <ProfileContentModal
        item={selectedInfluencer}
        onClose={() => setSelectedInfluencer(null)}
        nameField="name"
      />
    </section>
  );
};

export default Safety;

