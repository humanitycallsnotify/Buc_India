import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useState, useEffect, lazy, Suspense, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollToTop from "./components/ScrollToTop.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import SmoothScroll from "./components/animations/SmoothScroll.jsx";
import Preloader from "./components/animations/Preloader.jsx";
import GlobalCursor from "./components/animations/Cursor.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import UserProtectedRoute from "./components/UserProtectedRoute.jsx";
import AuthModal from "./components/AuthModal.jsx";

const HomePage = lazy(() => import("./components/HomePage.jsx"));

const Events = lazy(() => import("./components/PublicHome/PublicHome.jsx"));
const Gallery = lazy(() => import("./components/Gallery.jsx"));
const Members = lazy(() => import("./components/Members.jsx"));
const Forum = lazy(() => import("./components/Forum.jsx"));
const MembershipApplication = lazy(() => import("./components/MembershipApplication.jsx"));
const Safety = lazy(() => import("./components/Safety.jsx"));
const SafetyInfluencers = lazy(() => import("./components/SafetyInfluencers.jsx"));
const Clubs = lazy(() => import("./components/Clubs/Clubs.jsx"));
const ClubCollaborate = lazy(() => import("./components/Clubs/ClubCollaborate.jsx"));
const ClubDetail = lazy(() => import("./components/Clubs/ClubDetail.jsx"));
const International = lazy(() => import("./components/International.jsx"));
const CertificatePage = lazy(() => import("./components/CertificatePage.jsx"));
const Profile = lazy(() => import("./components/Profile/Profile.jsx"));
const YourEvents = lazy(() => import("./components/YourEvents.jsx"));
const LoginForm = lazy(() => import("./components/LoginForm.jsx"));
const SignUpForm = lazy(() => import("./components/SignUpForm.jsx"));
const MainRegistration = lazy(() => import("./components/MainRegistration.jsx"));
const PublicRegister = lazy(() => import("./components/PublicRegister/PublicRegister.jsx"));
const AdminLogin = lazy(() => import("./components/AdminLogin/AdminLogin.jsx"));
const AdminDashboard = lazy(
  () => import("./components/AdminDashboardNav/AdminDashboardNav.jsx"),
);
const AdminProtectedRoute = lazy(
  () => import("./components/AdminProtectedRoute.jsx"),
);

const Loading = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-12 h-12 border-4 border-copper/20 border-t-copper rounded-full animate-spin"></div>
  </div>
);

function PublicLayout({ isLoading }) {
  return (
    <>
      <Header />
      <Outlet context={{ isLoading }} />
      <Footer />
    </>
  );
}

const MemoizedPublicLayout = memo(PublicLayout);

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState('login');

  useEffect(() => {
    const handleOpenAuth = (e) => {
      if (e?.detail?.type) {
        setAuthModalType(e.detail.type);
      } else {
        setAuthModalType('login');
      }
      setIsAuthModalOpen(true);
    };
    window.addEventListener("open-auth-modal", handleOpenAuth);
    return () => window.removeEventListener("open-auth-modal", handleOpenAuth);
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const authParam = searchParams.get('auth');
    if (authParam === 'login' || authParam === 'signup') {
      setAuthModalType(authParam);
      setIsAuthModalOpen(true);
      // Remove query param without reloading
      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.pushState({path:newUrl},'',newUrl);
    }
  }, []);

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
          transition={{
            duration: 1.2,
            ease: [0.85, 0, 0.15, 1],
            delay: 0.1,
          }}
          className="origin-center"
        >
          <ScrollToTop />
          <GlobalCursor />
          <div className="min-h-screen bg-carbon">
            <ToastContainer
              position="top-center"
              autoClose={3000}
              theme="dark"
            />
            <AuthModal 
              isOpen={isAuthModalOpen} 
              onClose={() => setIsAuthModalOpen(false)} 
              defaultType={authModalType}
            />
            <Suspense fallback={<Loading />}>
              <Routes>
                {/* Admin routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin/*"
                  element={
                    <AdminProtectedRoute>
                      <AdminDashboard />
                    </AdminProtectedRoute>
                  }
                />

                {/* Event registration (standalone layout) */}
                <Route path="/event-register/:eventId" element={<PublicRegister />} />
                <Route path="/event-register-view/:eventId" element={<PublicRegister />} />

                {/* Registration portal (standalone layout) */}
                <Route path="/register" element={<Navigate to="/register/community" replace />} />
                <Route path="/register/:slug" element={<MainRegistration />} />
                <Route
                  path="/register/login"
                  element={<Navigate to="/login" replace />}
                />
                <Route
                  path="/register/signup"
                  element={<Navigate to="/signup" replace />}
                />

                {/* Profile has its own header/footer */}
                <Route
                  path="/profile"
                  element={
                    <UserProtectedRoute>
                      <Profile />
                    </UserProtectedRoute>
                  }
                />

                {/* Public website */}
                <Route element={<MemoizedPublicLayout isLoading={isLoading} />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="/forum" element={<Forum />} />
                  <Route path="/safety" element={<Safety />} />
                  <Route path="/safety-influencers" element={<SafetyInfluencers />} />
                  <Route path="/membership-apply" element={<MembershipApplication />} />
                  <Route path="/clubs" element={<Clubs />} />
                  <Route
                    path="/clubs/collaborate"
                    element={<ClubCollaborate />}
                  />
                  <Route path="/clubs/:slug" element={<ClubDetail />} />
                  <Route path="/international" element={<International />} />
                  <Route path="/certificate" element={<CertificatePage />} />
                  <Route
                    path="/your-events"
                    element={
                      <UserProtectedRoute>
                        <YourEvents />
                      </UserProtectedRoute>
                    }
                  />
                  <Route
                    path="/login"
                    element={<Navigate to="/?auth=login" replace />}
                  />
                  <Route
                    path="/signup"
                    element={<Navigate to="/?auth=signup" replace />}
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </Suspense>
          </div>
        </motion.div>
      </SmoothScroll>
    </Router>
  );
}

export default App;
