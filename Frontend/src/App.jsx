import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import About from "./components/About.jsx";
import Safety from "./components/Safety.jsx";
import Marquee from "./components/Marquee.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import SmoothScroll from "./components/animations/SmoothScroll.jsx";
import Preloader from "./components/animations/Preloader.jsx";

// Lazy load non-critical routes
const Gallery = lazy(() => import("./components/Gallery.jsx"));
const Members = lazy(() => import("./components/Members.jsx"));
const Forum = lazy(() => import("./components/Forum.jsx"));
const Events = lazy(() => import("./components/PublicHome/PublicHome.jsx"));
const AdminLogin = lazy(() => import("./components/AdminLogin/AdminLogin.jsx"));
const AdminDashboard = lazy(() => import("./components/AdminDashboardNav/AdminDashboardNav.jsx"));
const PublicRegister = lazy(() => import("./components/PublicRegister/PublicRegister.jsx"));
const AdminProtectedRoute = lazy(() => import("./components/AdminProtectedRoute.jsx"));
const UserProtectedRoute = lazy(() => import("./components/UserProtectedRoute.jsx"));
const PublicRoute = lazy(() => import("./components/PublicRoute.jsx"));
const Profile = lazy(() => import("./components/Profile/Profile.jsx"));
const LoginForm = lazy(() => import("./components/LoginForm.jsx"));
const SignUpForm = lazy(() => import("./components/SignUpForm.jsx"));
const YourEvents = lazy(() => import("./components/YourEvents.jsx"));
const Clubs = lazy(() => import("./components/Clubs/Clubs.jsx"));
const ClubDetail = lazy(() => import("./components/Clubs/ClubDetail.jsx"));
const ClubCollaborate = lazy(() => import("./components/Clubs/ClubCollaborate.jsx"));
const International = lazy(() => import("./components/International.jsx"));
const CertificatePage = lazy(() => import("./components/CertificatePage.jsx"));

const Loading = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-12 h-12 border-4 border-copper/20 border-t-copper rounded-full animate-spin"></div>
  </div>
);

const HomePage = () => (
  <div>
    <Hero />
    <Marquee />
    <Safety />
    <About />
  </div>
);

function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Router>
      <SmoothScroll>
        <AnimatePresence>
          {isLoading && (
            <Preloader 
              key="preloader" 
              onComplete={() => setIsLoading(false)} 
            />
          )}
        </AnimatePresence>

        <motion.div 
          key="main-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoading ? 0 : 1 }}
          transition={{ duration: 1.2, ease: [0.85, 0, 0.15, 1], delay: 0.1 }}
          className="origin-center"
        >
          <ScrollToTop />
          <div className="min-h-screen bg-carbon">
            <ToastContainer position="top-center" autoClose={3000} theme="dark" />
            <Suspense fallback={<Loading />}>
              <Routes>
                {/* Public Routes with Header and Footer */}
                <Route element={<div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-grow">
                    <Outlet context={{ isLoading }} />
                  </main>
                  <Footer />
                </div>}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="/forum" element={<Forum />} />
                  <Route path="/clubs" element={<Clubs />} />
                  <Route path="/clubs/collaborate" element={<ClubCollaborate />} />
                  <Route path="/clubs/:slug" element={<ClubDetail />} />
                  <Route path="/international" element={<International />} />
                  <Route path="/certificate" element={<CertificatePage />} />
                  <Route
                    path="/profile"
                    element={
                      <UserProtectedRoute>
                        <Profile />
                      </UserProtectedRoute>
                    }
                  />
                  <Route
                    path="/your-events"
                    element={
                      <UserProtectedRoute>
                        <YourEvents />
                      </UserProtectedRoute>
                    }
                  />
                </Route>

                {/* Registration portal — full-screen, no site header/footer */}
                <Route path="/register" element={<PublicRegister />} />
                <Route
                  path="/event-register/:eventId"
                  element={<PublicRegister />}
                />

                {/* Routes without Public Header/Footer */}
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <LoginForm />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <PublicRoute>
                      <SignUpForm />
                    </PublicRoute>
                  }
                />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin/*"
                  element={
                    <AdminProtectedRoute>
                      <AdminDashboard />
                    </AdminProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </div>
        </motion.div>
      </SmoothScroll>
    </Router>
  );
}

export default App;
