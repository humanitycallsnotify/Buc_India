import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComingSoon = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-carbon flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] bg-copper/5 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center max-w-2xl mx-auto"
      >
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(200,150,100,0.1)]">
            <Clock className="w-10 h-10 text-copper animate-pulse" />
          </div>
        </div>

        <h1 className="font-heading text-5xl md:text-7xl uppercase text-white mb-6">
          Coming <span className="text-transparent outline-title">Soon</span>
        </h1>
        
        <p className="font-text text-steel-dim text-lg md:text-xl leading-relaxed mb-12">
          We are working hard to bring you this experience. Stay tuned for updates as we finalize our platform.
        </p>

        <button
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-copper text-carbon font-heading text-lg uppercase tracking-widest hover:bg-white transition-all duration-300"
        >
          Return Home
        </button>
      </motion.div>
    </div>
  );
};

export default ComingSoon;
