import React from "react";
import { 
  Instagram, 
  Youtube, 
  Facebook, 
  Twitter, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowUpRight,
  ShieldAlert,
  AlertTriangle,
  HeartPulse,
  Baby
} from "lucide-react";

const buclogo = "/logo.jpg";

const FooterSection = ({ title, links }) => (
  <div className="flex flex-col gap-6">
    <div className="flex items-center gap-4">
      <div className="w-8 h-[1px] bg-copper/50"></div>
      <h4 className="font-heading text-xs tracking-widest text-steel-dim uppercase font-bold">
        {title}
      </h4>
    </div>
    <ul className="flex flex-col gap-3">
      {links.map((link) => (
        <li key={link.name}>
          <a
            href={link.href}
            className="group relative flex items-center gap-2 text-white/50 hover:text-white transition-colors duration-300 font-text text-[13px] tracking-widest uppercase"
          >
            {link.name}
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-copper group-hover:w-full transition-all duration-500 ease-[cubic-bezier(0.7,0,0.3,1)] shadow-[0_0_8px_rgba(193,154,107,0.5)]"></span>
          </a>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const emergencyContacts = [
    { name: "Emergency", number: "112", icon: AlertTriangle, color: "text-red-500" },
    { name: "Medical", number: "108", icon: HeartPulse, color: "text-rose-400" },
    { name: "Child Info", number: "1098", icon: Baby, color: "text-sky-400" },
    { name: "Unity Core", number: "+91 88677 18080", icon: ShieldAlert, color: "text-copper" },
  ];

  const navigationLinks = [
    { name: "HOME", href: "/" },
    { name: "EVENTS", href: "/events" },
    { name: "GALLERY", href: "/gallery" },
    { name: "MEMBERS", href: "/members" },
    { name: "FORUM", href: "/forum" },
    { name: "CLUBS", href: "/clubs" },
    { name: "INTERNATIONAL", href: "/international" },
    { name: "JOIN BROTHERHOOD", href: "/signup" },
    { name: "LOGIN", href: "/login" },
  ];

  return (
    <footer 
      className="relative bg-[#050505] pt-16 sm:pt-24 lg:pt-32 pb-10 sm:pb-12 overflow-hidden border-t border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-16 mb-14 sm:mb-24">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-12">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <img src={buclogo} alt="BUC" className="w-16 h-16 rounded-full border border-copper/30 p-1" />
                <div>
                  <h3 className="font-heading text-3xl text-white leading-none">BUC <span className="text-copper">INDIA</span></h3>
                  <p className="text-steel-dim text-[10px] tracking-[0.3em] uppercase mt-1">Premier Riding Community</p>
                </div>
              </div>
              <p className="text-steel-dim text-sm leading-relaxed max-w-sm">
                A brotherhood forged in steel and spirit. Dedicated to the open road, safe miles, and the pursuit of nomadic excellence.
              </p>
            </div>

            {/* Humanity Calls Sub-Brand */}
            <div className="p-6 border border-white/5 bg-carbon/50 backdrop-blur-sm hover:border-copper/20 transition-colors duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1.5">
                  <img src="https://static.wixstatic.com/media/2d0007_ccad2163f88540659e8212ff5138666c~mv2.png/v1/fit/w_2500,h_1330,al_c/2d0007_ccad2163f88540659e8212ff5138666c~mv2.png" alt="Humanity Calls" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="font-heading text-sm text-white uppercase tracking-wider">Humanity Calls</h4>
                  <p className="text-info text-[9px] uppercase font-bold tracking-widest">Compassion & Action</p>
                </div>
              </div>
              <p className="text-steel-dim text-xs leading-relaxed mb-4">
                Our social foundation committed to uplifting lives beyond the horizon.
              </p>
              <div className="flex gap-6">
                {[
                  { Icon: Facebook, href: "https://www.facebook.com/HumanityGcalls/" },
                  { Icon: Instagram, href: "https://www.instagram.com/humanitycalls_/" },
                  { Icon: Globe, href: "https://www.humanitycalls.org" }
                ].map((item, i) => (
                  <a key={i} href={item.href} className="text-white/40 hover:text-copper transition-colors duration-200">
                    <item.Icon size={18} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-5 flex flex-col items-start sm:items-center lg:items-start">
            <FooterSection 
              title="Navigation" 
              links={navigationLinks} 
            />
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-3 space-y-8">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-[1px] bg-copper/50"></div>
                <h4 className="font-heading text-xs tracking-widest text-steel-dim uppercase font-bold">Connect</h4>
              </div>
              <div className="space-y-8">
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] text-copper font-bold tracking-[0.2em]">EMAIL</span>
                  <a href="mailto:bikersunitycallsindia@gmail.com" className="group text-steel-dim hover:text-white transition-colors text-[14px] tracking-wider break-all">
                    bikersunitycallsindia@gmail.com
                  </a>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] text-copper font-bold tracking-[0.2em]">CONTACT</span>
                  <a href="tel:+918867718080" className="group text-steel-dim hover:text-white transition-colors text-[16px] font-heading tracking-wider">
                    +91 88677 18080
                  </a>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] text-copper font-bold tracking-[0.2em]">BASE</span>
                  <div className="text-steel-dim text-[14px] tracking-wider uppercase leading-relaxed">
                    Bengaluru, Karnataka<br />India 560001
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              {[Instagram, Twitter, Youtube, Facebook].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-10 h-10 border border-white/10 flex items-center justify-center rounded-sm bg-carbon/30 hover:bg-copper/10 hover:border-copper/40 transition-colors duration-200"
                >
                  <Icon size={18} className="text-white/60" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Strategic Emergency Manifest */}
        <div className="p-6 sm:p-8 border border-white/5 bg-carbon/80 backdrop-blur-md rounded-sm grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative overflow-hidden">
          {emergencyContacts.map((contact, i) => (
            <a 
              key={i} 
              href={`tel:${contact.number.replace(/\s/g, "")}`} 
              className="flex flex-col gap-2 group/call"
            >
              <div className="flex items-center gap-2">
                <contact.icon size={14} className={contact.color} />
                <span className="text-[10px] font-bold text-steel-dim uppercase tracking-tighter">{contact.name}</span>
              </div>
              <div className="text-lg sm:text-xl font-heading text-white group-hover/call:text-copper transition-colors duration-200 flex items-center gap-2">
                {contact.number}
                <ArrowUpRight size={14} className="hidden sm:block opacity-0 group-hover/call:opacity-100 transition-opacity duration-200" />
              </div>
            </a>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 sm:mt-20 pt-8 border-t border-white/5 flex flex-col items-center gap-8 sm:gap-10">
          <p className="text-[10px] text-steel-dim uppercase tracking-[0.2em] opacity-40">
            © {new Date().getFullYear()} BUC INDIA. FORGED IN BROTHERHOOD.
          </p>
          
          <div className="flex flex-wrap gap-x-8 gap-y-4 items-center justify-center">
             {["Privacy Policy", "Terms of Service", "Conduct Code"].map((legal) => (
               <a 
                 key={legal} 
                 href="#" 
                 className="group relative text-[10px] text-steel-dim hover:text-white transition-colors uppercase tracking-[0.3em]"
               >
                 {legal}
                 <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-copper/40 group-hover:w-full transition-all duration-500"></span>
               </a>
             ))}
          </div>

          <button 
            onClick={scrollToTop}
            className="group flex flex-col items-center gap-3 text-xs font-heading text-white/30 hover:text-copper transition-colors uppercase tracking-widest pt-4"
          >
            <div className="w-12 h-12 border border-white/5 flex items-center justify-center rounded-full group-hover:border-copper transition-colors duration-200">
              <ArrowUpRight size={16} />
            </div>
            <span className="text-[9px] tracking-[0.4em]">Back to Top</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
