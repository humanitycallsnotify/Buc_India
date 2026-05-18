import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import SmoothScroll from "./components/animations/SmoothScroll.jsx";

import MainRegistration from "./components/MainRegistration.jsx";
import ComingSoon from "./components/ComingSoon.jsx";



const Loading = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-12 h-12 border-4 border-copper/20 border-t-copper rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <Router>
      <SmoothScroll>
        <div className="origin-center">
          <div className="min-h-screen bg-carbon">
            <ToastContainer position="top-center" autoClose={3000} theme="dark" />
            <Suspense fallback={<Loading />}>
              <Routes>
                {/* Main route without Header and Footer */}
                <Route path="/" element={<MainRegistration />} />


                {/* Catch all other routes */}
                <Route path="*" element={<ComingSoon />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </SmoothScroll>
    </Router>
  );
}

export default App;
