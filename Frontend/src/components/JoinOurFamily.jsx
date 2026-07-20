import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import joinFamilyImg from "../assets/gallery/WhatsApp Image 2025-08-11 at 20.21.15_0db94979.jpg";

const JoinOurFamily = () => {
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
    <section className="py-20 bg-carbon relative">
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

export default JoinOurFamily;
